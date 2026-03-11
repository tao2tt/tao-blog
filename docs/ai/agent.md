# AI Agent

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-06-30

---

## 📚 目录

[[toc]]
---

## 1. AI Agent 概述

### 1.1 什么是 AI Agent

**AI Agent（智能体）**：能够感知环境、做出决策、执行动作的智能系统。

```
传统 AI：输入 → 输出
AI Agent：感知 → 思考 → 行动 → 反馈
```

### 1.2 Agent 核心能力

| 能力 | 说明 | 示例 |
|------|------|------|
| **感知** | 理解环境和用户意图 | 解析用户问题 |
| **规划** | 制定行动计划 | 分解复杂任务 |
| **记忆** | 存储和检索信息 | 对话历史、知识库 |
| **工具使用** | 调用外部工具 | 搜索、计算、API |
| **学习** | 从反馈中改进 | 优化策略 |

### 1.3 Agent 应用场景

| 场景 | 应用 | 价值 |
|------|------|------|
| **智能客服** | 自动回答、工单处理 | 降低人力成本 |
| **数据分析** | 自动报表、洞察分析 | 提高决策效率 |
| **代码助手** | 代码生成、审查 | 提升开发效率 |
| **流程自动化** | RPA+AI | 减少重复劳动 |
| **个人助理** | 日程管理、提醒 | 提高生活质量 |

---

## 2. Agent 架构

### 2.1 基本架构

```
用户输入 → LLM → 规划 → 工具调用 → 结果整合 → 输出

核心组件：
1. LLM：大脑，负责思考和决策
2. 规划：任务分解和排序
3. 工具：执行具体操作
4. 记忆：存储上下文
```

### 2.2 ReAct 模式

```
ReAct（Reasoning + Acting）：推理 + 行动

流程：
1. 思考（Thought）：分析当前情况
2. 行动（Action）：选择工具执行
3. 观察（Observation）：获取执行结果
4. 循环：直到任务完成

示例：
用户：今天北京天气如何？适合运动吗？

思考：需要查询北京天气
行动：调用天气 API
观察：北京，晴，25°C，空气质量良
思考：根据天气判断是否适合运动
输出：今天北京晴朗，25°C，空气质量良好，非常适合户外运动！
```

### 2.3 Plan-and-Execute 模式

```
流程：
1. 制定计划（Plan）
2. 执行子任务（Execute）
3. 整合结果（Synthesize）

示例：
用户：分析公司 Q1 销售数据

计划：
1. 查询 Q1 销售数据
2. 分析各产品销售情况
3. 对比去年同期
4. 生成分析报告

执行：依次执行每个子任务
整合：汇总所有结果，生成最终报告
```

---

## 3. LangChain 框架

### 3.1 什么是 LangChain

**LangChain**：开源的 LLM 应用开发框架，简化 AI Agent 开发。

**核心模块：**
- **Model I/O**：模型输入输出
- **Data Connection**：数据连接
- **Chains**：链式调用
- **Agents**：智能体
- **Memory**：记忆

### 3.2 安装 LangChain

```bash
# Python
pip install langchain
pip install langchain-community
pip install langchain-openai

# Java（LangChain4j）
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j</artifactId>
    <version>0.27.1</version>
</dependency>
```

### 3.3 核心组件

#### Chains（链）

```python
from langchain import LLMChain, PromptTemplate

# 定义模板
template = """
你是一名{role}，请{task}

要求：
{requirements}
"""

prompt = PromptTemplate(
    template=template,
    input_variables=["role", "task", "requirements"]
)

# 创建链
chain = LLMChain(llm=llm, prompt=prompt)

# 调用
result = chain.run(
    role="Java 架构师",
    task="设计一个秒杀系统",
    requirements="支持 10 万 QPS，防止超卖"
)
```

#### Agents（智能体）

```python
from langchain.agents import initialize_agent, Tool
from langchain.agents import AgentType

# 定义工具
tools = [
    Tool(
        name="Search",
        func=search_function,
        description="搜索互联网信息"
    ),
    Tool(
        name="Calculator",
        func=calculate_function,
        description="执行数学计算"
    )
]

# 初始化 Agent
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# 运行
agent.run("今天北京天气如何？")
```

#### Memory（记忆）

```python
from langchain.memory import ConversationBufferMemory

# 创建记忆
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# 使用记忆
chain = LLMChain(
    llm=llm,
    prompt=prompt,
    memory=memory
)

# 对话
chain.run("你好")
chain.run("我叫张三")
chain.run("我记得我叫什么吗？")  # 可以记住之前的对话
```

---

## 4. Agent 开发

### 4.1 简单 Agent

```python
from langchain.agents import load_tools
from langchain.agents import initialize_agent
from langchain_openai import ChatOpenAI

# 初始化 LLM
llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    temperature=0
)

# 加载工具
tools = load_tools(["serpapi", "llm-math"], llm=llm)

# 创建 Agent
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# 使用
agent.run("周杰伦的年龄是多少？他的年龄的平方根是多少？")
```

### 4.2 自定义工具

```python
from langchain.tools import tool

@tool
def search_database(query: str) -> str:
    """查询数据库信息"""
    # 实现数据库查询逻辑
    result = db.query(query)
    return str(result)

@tool
def send_email(to: str, subject: str, body: str) -> str:
    """发送邮件"""
    # 实现邮件发送逻辑
    send(to, subject, body)
    return "邮件发送成功"

# 添加到 Agent
tools = [search_database, send_email]
agent = initialize_agent(tools, llm, agent=AgentType.CHAIN)
```

### 4.3 RAG Agent（检索增强）

```python
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import RetrievalQA

# 加载知识库
documents = load_documents("knowledge_base/")

# 创建向量存储
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(documents, embeddings)

# 创建检索链
qa_chain = RetrievalQA.from_chain_type(
    llm,
    retriever=vectorstore.as_retriever()
)

# 使用
result = qa_chain.run("公司请假流程是什么？")
```

### 4.4 多 Agent 协作

```python
# 研究员 Agent
researcher = Agent(
    role="研究员",
    goal="收集和分析信息",
    tools=[search_tool],
    llm=llm
)

# 作家 Agent
writer = Agent(
    role="作家",
    goal="撰写高质量文章",
    tools=[write_tool],
    llm=llm
)

# 编辑 Agent
editor = Agent(
    role="编辑",
    goal="审核和优化内容",
    tools=[review_tool],
    llm=llm
)

# 协作流程
def collaborative_task(topic):
    # 研究员收集信息
    research = researcher.run(f"研究{topic}相关信息")
    
    # 作家撰写文章
    article = writer.run(f"根据以下信息写文章：{research}")
    
    # 编辑审核
    final = editor.run(f"审核并优化：{article}")
    
    return final
```

---

## 5. 实战案例

### 5.1 智能客服 Agent

```python
class CustomerServiceAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-3.5-turbo")
        self.memory = ConversationBufferMemory()
        
        # 工具
        tools = [
            self.search_knowledge_base,
            self.create_ticket,
            self.check_order_status
        ]
        
        self.agent = initialize_agent(tools, self.llm, agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION)
    
    def search_knowledge_base(self, query: str) -> str:
        """查询知识库"""
        # 实现知识库检索
        return knowledge_base.search(query)
    
    def create_ticket(self, issue: str) -> str:
        """创建工单"""
        # 实现工单创建
        ticket_id = create_ticket(issue)
        return f"工单创建成功，编号：{ticket_id}"
    
    def check_order_status(self, order_id: str) -> str:
        """查询订单状态"""
        # 实现订单查询
        status = db.query_order(order_id)
        return f"订单状态：{status}"
    
    def chat(self, user_input: str) -> str:
        """对话"""
        return self.agent.run(user_input)
```

### 5.2 数据分析 Agent

```python
class DataAnalysisAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4")
        
        # 工具
        tools = [
            self.query_database,
            self.create_chart,
            self.calculate_metrics
        ]
        
        self.agent = initialize_agent(tools, self.llm, agent=AgentType.CHAIN)
    
    def query_database(self, sql: str) -> str:
        """查询数据库"""
        result = db.execute(sql)
        return str(result)
    
    def create_chart(self, data: str, chart_type: str) -> str:
        """生成图表"""
        chart = charting.create(data, chart_type)
        return chart.save_to_file()
    
    def calculate_metrics(self, data: str, metrics: list) -> str:
        """计算指标"""
        result = analytics.calculate(data, metrics)
        return str(result)
    
    def analyze(self, request: str) -> str:
        """数据分析"""
        return self.agent.run(request)
```

### 5.3 代码助手 Agent

```python
class CodeAssistantAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4")
        
        # 工具
        tools = [
            self.generate_code,
            self.explain_code,
            self.debug_code,
            self.refactor_code
        ]
        
        self.agent = initialize_agent(tools, self.llm, agent=AgentType.CHAT_ZERO_SHOT_REACT_DESCRIPTION)
    
    def generate_code(self, description: str, language: str) -> str:
        """生成代码"""
        prompt = f"请用{language}实现：{description}"
        return llm.generate(prompt)
    
    def explain_code(self, code: str) -> str:
        """解释代码"""
        prompt = f"请解释以下代码：\n{code}"
        return llm.generate(prompt)
    
    def debug_code(self, code: str, error: str) -> str:
        """调试代码"""
        prompt = f"代码报错，请修复：\n代码：{code}\n错误：{error}"
        return llm.generate(prompt)
    
    def refactor_code(self, code: str) -> str:
        """重构代码"""
        prompt = f"请优化以下代码：\n{code}"
        return llm.generate(prompt)
```

---

## 💡 学习建议

1. **理解原理**：先理解 Agent 架构
2. **学习框架**：掌握 LangChain 使用
3. **实战练习**：从简单 Agent 开始
4. **持续优化**：迭代改进 Agent 能力

---

## 📚 参考资料

- [LangChain 官方文档](https://python.langchain.com/)
- [LangChain4j（Java 版）](https://github.com/langchain4j/langchain4j)
- [Awesome LangChain](https://github.com/kyrolabs/awesome-langchain)

---

> 💡 **学习建议**：AI Agent 是未来趋势，建议：
> 1. 理解 Agent 核心架构
> 2. 掌握 LangChain 框架
> 3. 实战开发简单 Agent
> 4. 探索多 Agent 协作
