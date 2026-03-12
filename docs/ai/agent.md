# AI Agent

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-05-07  
> 难度：⭐⭐⭐⭐⭐  
> 前置知识：[Function Calling](/ai/function-calling)、[LangChain](/ai/langchain)

---

## 📚 目录

[[toc]]

---

## 1. AI Agent 简介

### 1.1 什么是 AI Agent

**AI Agent（智能代理）** 是能够感知环境、做出决策、执行动作以实现目标的智能系统。

**核心能力：**

```
AI Agent = LLM + 规划 + 工具使用 + 记忆
```

| 组件 | 作用 | 示例 |
|------|------|------|
| **LLM** | 大脑，思考和决策 | GPT-4、Claude |
| **规划** | 分解任务、制定计划 | 任务分解、反思 |
| **工具使用** | 调用外部工具 | API、数据库、搜索引擎 |
| **记忆** | 存储和回忆信息 | 短期记忆、长期记忆 |

### 1.2 Agent vs 传统 LLM

| 对比项 | 传统 LLM | AI Agent |
|--------|---------|---------|
| **能力** | 被动回答问题 | 主动执行任务 |
| **工具** | 无 | 可调用工具 |
| **记忆** | 无（仅上下文） | 有短期/长期记忆 |
| **规划** | 无 | 可制定计划 |
| **适用场景** | 问答、创作 | 复杂任务、自动化 |

### 1.3 Agent 架构

```
┌─────────────────────────────────────┐
│            AI Agent                  │
├─────────────────────────────────────┤
│  感知 → 规划 → 决策 → 执行 → 记忆   │
│   ↓      ↓      ↓      ↓      ↓     │
│  输入   分解   选择   调用   存储   │
│  信息   任务   工具   动作   经验   │
└─────────────────────────────────────┘
```

---

## 2. Agent 核心组件

### 2.1 规划（Planning）

**任务分解：**

```python
# 复杂任务
task = "开发一个用户管理系统"

# 分解为子任务
subtasks = [
    "1. 设计数据库表结构",
    "2. 实现用户注册 API",
    "3. 实现用户登录 API",
    "4. 实现用户信息管理",
    "5. 添加权限控制",
    "6. 编写单元测试"
]
```

**反思（Reflection）：**

```python
# 执行后反思
reflection = """
任务完成情况：
- 已完成：用户注册、登录
- 未完成：权限控制

问题：
- 密码加密方式需要改进
- 缺少输入验证

改进计划：
1. 添加密码强度检查
2. 实现 JWT 认证
3. 添加速率限制
"""
```

### 2.2 工具使用（Tool Use）

```python
from langchain.agents import Tool

# 定义工具
tools = [
    Tool(
        name="Search",
        func=search_web,
        description="搜索网络信息"
    ),
    Tool(
        name="Calculator",
        func=calculate,
        description="数学计算"
    ),
    Tool(
        name="Database",
        func=query_db,
        description="查询数据库"
    )
]
```

### 2.3 记忆（Memory）

```python
from langchain.memory import ConversationBufferMemory

# 短期记忆（对话历史）
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# 长期记忆（向量数据库）
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

vectorstore = Chroma(
    embedding_function=OpenAIEmbeddings(),
    persist_directory="./memory"
)

# 存储记忆
vectorstore.add_texts(["用户喜欢 Python", "用户在北京工作"])

# 检索记忆
relevant = vectorstore.similarity_search("用户信息")
```

---

## 3. LangChain Agent

### 3.1 Agent 类型

```python
from langchain.agents import initialize_agent, AgentType

# Zero-shot React Description
# 适合：简单任务，无需示例
agent = initialize_agent(
    tools, 
    llm, 
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION
)

# Conversational React Description
# 适合：对话场景，有记忆
agent = initialize_agent(
    tools, 
    llm, 
    agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
    memory=memory
)

# Structured Chat Agent
# 适合：复杂任务，结构化输出
agent = initialize_agent(
    tools, 
    llm, 
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION
)
```

### 3.2 创建 Agent

```python
from langchain.agents import initialize_agent, Tool
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory

# 初始化工具
tools = [
    Tool(
        name="Search",
        func=search_web,
        description="搜索网络信息"
    ),
    Tool(
        name="Calculator",
        func=calculate,
        description="数学计算"
    )
]

# 初始化记忆
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# 初始化模型
llm = ChatOpenAI(model="gpt-4", temperature=0)

# 创建 Agent
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
    memory=memory,
    verbose=True  # 打印思考过程
)

# 使用
response = agent.run("今天北京的天气怎么样？如果温度超过 30 度，计算 30 乘以 1.5")
```

### 3.3 思考过程

```
启用 verbose=True 后，可以看到 Agent 的思考过程：

> Entering new AgentExecutor chain...
Thought: 我需要先查询北京的天气
Action: Search
Action Input: "北京天气"
Observation: 北京今天晴，温度 32°C
Thought: 温度超过 30 度，需要计算
Action: Calculator
Action Input: 30 * 1.5
Observation: 45.0
Thought: 我现在知道答案了
Final Answer: 北京今天天气晴朗，温度 32°C，超过 30 度。30 乘以 1.5 等于 45。

> Finished chain.
```

---

## 4. AutoGen 多 Agent

### 4.1 什么是 AutoGen

**AutoGen** 是微软开源的多 Agent 对话框架，支持多角色协作完成任务。

**核心概念：**

| 概念 | 说明 |
|------|------|
| **Agent** | 智能代理，可对话、执行任务 |
| **Conversation** | Agent 之间的对话 |
| **Group Chat** | 多 Agent 群聊 |
| **Tool Use** | Agent 调用工具 |

### 4.2 创建 Agent

```python
from autogen import AssistantAgent, UserProxyAgent

# 配置 LLM
llm_config = {
    "config_list": [
        {
            "model": "gpt-4",
            "api_key": "your-api-key"
        }
    ],
    "temperature": 0.7
}

# 创建助手 Agent
assistant = AssistantAgent(
    name="assistant",
    llm_config=llm_config,
    system_message="你是一个有帮助的 AI 助手。"
)

# 创建用户代理（可执行代码）
user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",  # 何时终止人工输入
    max_consecutive_auto_reply=10,  # 最大自动回复次数
    code_execution_config={
        "work_dir": "coding",
        "use_docker": False
    }
)

# 开始对话
user_proxy.initiate_chat(
    assistant,
    message="请帮我写一个 Python 脚本，计算斐波那契数列的前 20 项"
)
```

### 4.3 多角色协作

```python
from autogen import GroupChat, GroupChatManager

# 创建多个角色 Agent
product_manager = AssistantAgent(
    name="product_manager",
    system_message="你是一位产品经理，负责定义产品需求。",
    llm_config=llm_config
)

architect = AssistantAgent(
    name="architect",
    system_message="你是一位技术架构师，负责设计系统架构。",
    llm_config=llm_config
)

developer = AssistantAgent(
    name="developer",
    system_message="你是一位高级开发工程师，负责编写代码。",
    llm_config=llm_config
)

tester = AssistantAgent(
    name="tester",
    system_message="你是一位测试工程师，负责编写测试用例。",
    llm_config=llm_config
)

# 创建群聊
groupchat = GroupChat(
    agents=[product_manager, architect, developer, tester],
    messages=[],
    max_round=20
)

# 创建群聊管理员
manager = GroupChatManager(
    groupchat=groupchat,
    llm_config=llm_config
)

# 开始群聊
user_proxy.initiate_chat(
    manager,
    message="请开发一个用户管理系统，包括注册、登录、权限管理功能"
)
```

### 4.4 角色设定

```python
# 产品经理
product_manager = AssistantAgent(
    name="产品经理",
    system_message="""
你是一位资深产品经理，有 10 年互联网产品经验。

职责：
1. 分析用户需求
2. 定义产品功能
3. 编写产品文档
4. 评估优先级

输出格式：
## 用户需求
...

## 功能列表
1. ...
2. ...

## 优先级
P0: ...
P1: ...
"""
)

# 架构师
architect = AssistantAgent(
    name="架构师",
    system_message="""
你是一位资深技术架构师，有 10 年系统设计经验。

职责：
1. 设计系统架构
2. 选择技术栈
3. 评估技术风险
4. 制定技术规范

输出格式：
## 系统架构
...

## 技术栈
- 前端：...
- 后端：...
- 数据库：...

## 风险评估
...
"""
)
```

---

## 5. 实战案例

### 5.1 代码审查 Agent

```python
from langchain.agents import initialize_agent, Tool
from langchain.chat_models import ChatOpenAI

# 定义代码审查工具
@tool
def analyze_code(code: str) -> str:
    """分析代码质量"""
    # 调用代码分析 API
    issues = []
    
    # 检查安全问题
    if "eval(" in code:
        issues.append("⚠️ 使用 eval() 存在安全风险")
    
    # 检查性能问题
    if "for i in range(len(lst)):" in code:
        issues.append("💡 建议使用 enumerate 替代 range(len())")
    
    # 检查规范问题
    if len(code.split("\n")) > 100:
        issues.append("📏 函数过长，建议拆分")
    
    if not issues:
        return "✅ 代码质量良好"
    
    return "\n".join(issues)

@tool
def suggest_fix(code: str, issue: str) -> str:
    """提供修复建议"""
    # 调用 LLM 生成修复建议
    prompt = f"""
代码：
{code}

问题：
{issue}

请提供修复后的代码和说明。
"""
    response = llm.predict(prompt)
    return response

# 创建审查 Agent
tools = [analyze_code, suggest_fix]
agent = initialize_agent(tools, llm, agent="zero-shot-react-description")

# 使用
code = """
def get_user_data(user_id):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
    return cursor.fetchone()
"""

response = agent.run(f"请审查以下代码：{code}")
```

### 5.2 数据分析 Agent

```python
from langchain.agents import create_pandas_dataframe_agent
import pandas as pd

# 加载数据
df = pd.read_csv("sales_data.csv")

# 创建数据分析 Agent
agent = create_pandas_dataframe_agent(
    ChatOpenAI(model="gpt-4", temperature=0),
    df,
    verbose=True
)

# 使用
agent.run("销售额最高的月份是哪个月？")
agent.run("计算每个季度的平均销售额")
agent.run("销售额和广告投入的相关性是多少？")
```

### 5.3 客服 Agent

```python
from langchain.agents import initialize_agent, Tool
from langchain.memory import ConversationBufferMemory

# 定义客服工具
@tool
def check_order_status(order_id: str) -> str:
    """查询订单状态"""
    # 调用订单系统 API
    return "订单已发货，物流单号：SF123456789"

@tool
def process_return(order_id: str, reason: str) -> str:
    """处理退货"""
    # 调用退货系统 API
    return "退货申请已提交，审核通过后会有快递员上门取件"

@tool
def get_product_info(product_id: str) -> str:
    """查询产品信息"""
    # 调用产品系统 API
    return "产品名称：XXX，价格：¥299，库存：50 件"

@tool
def check_warranty(product_id: str) -> str:
    """查询保修信息"""
    # 调用保修系统 API
    return "保修期：1 年，剩余保修期：8 个月"

# 创建客服 Agent
tools = [check_order_status, process_return, get_product_info, check_warranty]
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

agent = initialize_agent(
    tools,
    llm,
    agent="conversational-react-description",
    memory=memory,
    verbose=True
)

# 使用
response = agent.run("我买的 product123 坏了，还在保修期内吗？")
```

---

## 6. 最佳实践

### 6.1 Agent 设计原则

| 原则 | 说明 |
|------|------|
| **单一职责** | 一个 Agent 专注于一个领域 |
| **清晰角色** | 明确 Agent 的职责和边界 |
| **有效工具** | 提供实用的工具函数 |
| **适当记忆** | 根据场景选择记忆类型 |
| **可控执行** | 限制自动执行次数 |

### 6.2 调试技巧

```python
# 启用详细日志
agent = initialize_agent(
    tools,
    llm,
    agent="zero-shot-react-description",
    verbose=True  # 打印思考过程
)

# 限制执行次数
user_proxy = UserProxyAgent(
    max_consecutive_auto_reply=5,  # 最多自动回复 5 次
    human_input_mode="ALWAYS"      # 每次都询问用户
)

# 捕获错误
try:
    response = agent.run(task)
except Exception as e:
    print(f"Agent 执行失败：{e}")
```

### 6.3 性能优化

```python
# 缓存工具结果
from functools import lru_cache

@lru_cache(maxsize=100)
def cached_search(query: str) -> str:
    return search_web(query)

# 异步执行
async def async_agent_run(task: str):
    tasks = [agent.run(subtask) for subtask in subtasks]
    results = await asyncio.gather(*tasks)
    return results

# 批量处理
def batch_process(items: list) -> list:
    return [agent.run(item) for item in items]
```

---

## 📝 练习题

### 基础题

1. **创建 Agent**：使用 LangChain 创建一个简单的问答 Agent

2. **工具定义**：定义 3 个工具，让 Agent 可以根据问题选择使用

3. **记忆配置**：为 Agent 添加对话记忆功能

### 进阶题

4. **多角色协作**：使用 AutoGen 创建 2 个角色 Agent 协作完成任务

5. **代码审查 Agent**：实现一个完整的代码审查 Agent

6. **综合练习**：设计一个智能客服系统，包含订单查询、产品咨询、售后处理等功能

---

## 🔗 参考资料

### 官方文档
- [LangChain Agents](https://python.langchain.com/docs/modules/agents/)
- [AutoGen 文档](https://microsoft.github.io/autogen/)

### 学习资源
- 🔗 [LangChain Agent 教程](https://python.langchain.com/docs/modules/agents/)
- 🔗 [AutoGen GitHub](https://github.com/microsoft/autogen)
- 📚 《Building AI Agents with LangChain》

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| Agent 架构 | ⭐⭐⭐⭐⭐ | 理解掌握 |
| LangChain Agent | ⭐⭐⭐⭐⭐ | 熟练运用 |
| AutoGen 多 Agent | ⭐⭐⭐⭐ | 理解掌握 |
| 工具设计 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 记忆系统 | ⭐⭐⭐⭐ | 理解掌握 |

---

**上一章：** [Function Calling](/ai/function-calling)  
**下一章：** [LangChain 框架](/ai/langchain)

**最后更新**：2026-03-12
