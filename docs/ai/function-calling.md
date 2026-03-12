# Function Calling

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-05-05  
> 难度：⭐⭐⭐⭐☆  
> 前置知识：[Prompt 高级技巧](/ai/prompt-advanced)、[Python 快速上手](/ai/python-basics)

---

## 📚 目录

[[toc]]

---

## 1. Function Calling 简介

### 1.1 什么是 Function Calling

**Function Calling（函数调用）** 是让大模型能够调用外部函数/API 的技术，扩展模型的能力边界。

**核心思想：** 模型决定何时调用函数 → 执行函数 → 返回结果给模型

```
传统 LLM：
用户提问 → 模型回答（仅靠训练知识）

Function Calling：
用户提问 → 模型判断需要调用函数 → 执行函数 → 模型整合结果回答
```

### 1.2 为什么需要 Function Calling

**大模型的局限性：**

| 局限 | 说明 | Function Calling 解决 |
|------|------|------|
| **知识截止** | 不知道最新信息 | 调用 API 获取实时数据 |
| **无法计算** | 数学计算易出错 | 调用计算器函数 |
| **无法操作** | 不能执行实际操作 | 调用工具函数（发邮件、查数据库） |
| **幻觉问题** | 可能编造事实 | 调用权威数据源 |

### 1.3 应用场景

| 场景 | 函数示例 |
|------|---------|
| **天气查询** | `get_weather(city)` |
| **数据库查询** | `query_database(sql)` |
| **代码执行** | `execute_code(code)` |
| **发送邮件** | `send_email(to, subject, body)` |
| **搜索网络** | `search_web(query)` |
| **计算** | `calculate(expression)` |

---

## 2. OpenAI Function Calling

### 2.1 定义函数

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 定义函数
functions = [
    {
        "name": "get_weather",
        "description": "获取指定城市的当前天气",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "城市名称，如'北京'、'上海'"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "温度单位"
                }
            },
            "required": ["city"]
        }
    },
    {
        "name": "search_database",
        "description": "搜索数据库中的用户信息",
        "parameters": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "用户 ID"
                }
            },
            "required": ["user_id"]
        }
    }
]
```

### 2.2 调用流程

```python
# 第 1 步：用户提问
user_message = "北京今天天气怎么样？"

# 第 2 步：模型判断是否需要调用函数
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": user_message}],
    functions=functions
)

message = response.choices[0].message

# 第 3 步：检查是否需要调用函数
if message.function_call:
    function_name = message.function_call.name
    arguments = json.loads(message.function_call.arguments)
    
    print(f"模型决定调用函数：{function_name}")
    print(f"参数：{arguments}")
    
    # 第 4 步：执行实际函数
    if function_name == "get_weather":
        result = get_weather(arguments["city"], arguments.get("unit", "celsius"))
    
    # 第 5 步：将结果返回给模型
    second_response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "user", "content": user_message},
            message,
            {"role": "function", "name": function_name, "content": result}
        ]
    )
    
    print(second_response.choices[0].message.content)
```

### 2.3 实现实际函数

```python
import requests

def get_weather(city, unit="celsius"):
    """获取天气信息（示例）"""
    # 实际应用中调用天气 API
    # 这里模拟返回
    weather_data = {
        "city": city,
        "temperature": 25 if unit == "celsius" else 77,
        "condition": "晴",
        "humidity": 60
    }
    return json.dumps(weather_data, ensure_ascii=False)

def search_database(user_id):
    """搜索数据库（示例）"""
    # 实际应用中查询数据库
    user_data = {
        "user_id": user_id,
        "name": "张三",
        "email": "zhangsan@example.com",
        "level": "VIP"
    }
    return json.dumps(user_data, ensure_ascii=False)
```

---

## 3. 多函数调用

### 3.1 定义多个函数

```python
functions = [
    {
        "name": "get_weather",
        "description": "获取天气信息",
        "parameters": {...}
    },
    {
        "name": "get_news",
        "description": "获取最新新闻",
        "parameters": {...}
    },
    {
        "name": "send_email",
        "description": "发送邮件",
        "parameters": {...}
    },
    {
        "name": "calculate",
        "description": "数学计算",
        "parameters": {...}
    }
]

# 模型会根据问题自动选择合适的函数
```

### 3.2 函数选择

```python
# 用户问题 1
user_message = "北京天气怎么样？"
# → 模型选择：get_weather

# 用户问题 2
user_message = "今天有什么科技新闻？"
# → 模型选择：get_news

# 用户问题 3
user_message = "帮我发邮件给张三，告诉他会议改到明天"
# → 模型选择：send_email

# 用户问题 4
user_message = "123 乘以 456 等于多少？"
# → 模型选择：calculate
```

### 3.3 函数路由器

```python
def function_router(function_name, arguments):
    """函数路由"""
    functions_map = {
        "get_weather": get_weather,
        "get_news": get_news,
        "send_email": send_email,
        "calculate": calculate
    }
    
    if function_name in functions_map:
        return functions_map[function_name](**arguments)
    else:
        return f"未知函数：{function_name}"

# 使用
result = function_router(function_name, arguments)
```

---

## 4. LangChain Tools

### 4.1 LangChain 工具系统

**LangChain** 提供了更强大的工具（Tools）系统，简化 Function Calling。

```python
# 安装
# pip install langchain langchain-openai

from langchain.agents import load_tools, initialize_agent
from langchain.chat_models import ChatOpenAI

# 初始化模型
llm = ChatOpenAI(model="gpt-4", temperature=0)

# 加载工具
tools = load_tools([
    "serpapi",      # 网络搜索
    "llm-math",     # 数学计算
    "arxiv",        # 学术论文
    "wikipedia",    # 维基百科
])

# 创建 Agent
agent = initialize_agent(
    tools, 
    llm, 
    agent="zero-shot-react-description",
    verbose=True
)

# 使用
result = agent.run("搜索最新的 AI 新闻，并计算相关新闻数量的平方根")
```

### 4.2 自定义工具

```python
from langchain.tools import tool

@tool
def search_knowledge_base(query: str) -> str:
    """搜索企业知识库
    
    Args:
        query: 搜索关键词
    
    Returns:
        搜索结果
    """
    # 实现搜索逻辑
    results = knowledge_base.search(query)
    return results

@tool
def execute_sql(sql: str) -> str:
    """执行 SQL 查询
    
    Args:
        sql: SQL 语句
    
    Returns:
        查询结果
    """
    # 实现数据库查询
    result = db.execute(sql)
    return str(result)

# 添加到工具列表
tools = [search_knowledge_base, execute_sql]

# 创建 Agent
agent = initialize_agent(tools, llm, agent="zero-shot-react-description")
```

### 4.3 工具装饰器详解

```python
from langchain.tools import tool

# 基础用法
@tool
def my_function(param1: str, param2: int = 10) -> str:
    """函数描述
    
    Args:
        param1: 参数 1 描述
        param2: 参数 2 描述，默认值 10
    
    Returns:
        返回值描述
    """
    return "结果"

# 带返回注解
@tool("custom_name")  # 自定义工具名
def my_function(query: str) -> dict:
    """描述"""
    return {"key": "value"}

# 异步工具
@tool
async def async_search(query: str) -> str:
    """异步搜索"""
    results = await search_api(query)
    return results
```

---

## 5. 实战案例

### 5.1 智能客服系统

```python
from langchain.agents import initialize_agent, Tool
from langchain.chat_models import ChatOpenAI

# 定义工具
def check_order_status(order_id: str) -> str:
    """查询订单状态"""
    # 实际调用订单系统 API
    return f"订单{order_id}状态：已发货"

def get_product_info(product_id: str) -> str:
    """查询产品信息"""
    # 实际调用产品系统 API
    return f"产品信息：名称、价格、库存..."

def process_return(order_id: str, reason: str) -> str:
    """处理退货"""
    # 实际调用退货系统 API
    return f"退货申请已提交"

# 创建工具列表
tools = [
    Tool(
        name="OrderStatus",
        func=check_order_status,
        description="查询订单状态，需要提供订单 ID"
    ),
    Tool(
        name="ProductInfo",
        func=get_product_info,
        description="查询产品信息，需要提供产品 ID"
    ),
    Tool(
        name="ReturnProcess",
        func=process_return,
        description="处理退货申请，需要订单 ID 和退货原因"
    )
]

# 创建客服 Agent
llm = ChatOpenAI(model="gpt-4", temperature=0.7)
agent = initialize_agent(tools, llm, agent="zero-shot-react-description")

# 使用
response = agent.run("我的订单 12345 发货了吗？")
print(response)
```

### 5.2 数据分析助手

```python
import pandas as pd
from langchain.tools import tool

@tool
def load_data(file_path: str) -> str:
    """加载数据文件"""
    df = pd.read_csv(file_path)
    return f"数据加载成功：{len(df)}行，{len(df.columns)}列"

@tool
def describe_data(file_path: str) -> str:
    """描述数据统计信息"""
    df = pd.read_csv(file_path)
    return str(df.describe())

@tool
def filter_data(file_path: str, condition: str) -> str:
    """筛选数据"""
    df = pd.read_csv(file_path)
    filtered = df.query(condition)
    return f"筛选结果：{len(filtered)}行"

@tool
def calculate_stats(file_path: str, column: str) -> str:
    """计算统计信息"""
    df = pd.read_csv(file_path)
    stats = {
        "mean": df[column].mean(),
        "median": df[column].median(),
        "std": df[column].std()
    }
    return str(stats)

# 创建数据分析 Agent
tools = [load_data, describe_data, filter_data, calculate_stats]
agent = initialize_agent(tools, llm, agent="zero-shot-react-description")

# 使用
response = agent.run("分析 sales.csv 文件，计算销售额的平均值和标准差")
```

### 5.3 自动化工作流

```python
from langchain.agents import AgentExecutor
from langchain.tools import tool

@tool
def fetch_leads() -> str:
    """获取潜在客户列表"""
    # 从 CRM 系统获取
    return "客户列表..."

@tool
def qualify_lead(lead_id: str) -> str:
    """评估客户质量"""
    # 评估逻辑
    return "质量评分：80"

@tool
def send_followup_email(lead_id: str, template: str) -> str:
    """发送跟进邮件"""
    # 发送邮件
    return "邮件已发送"

@tool
def update_crm(lead_id: str, status: str) -> str:
    """更新 CRM 状态"""
    # 更新 CRM
    return "状态已更新"

# 创建工作流 Agent
tools = [fetch_leads, qualify_lead, send_followup_email, update_crm]
agent = initialize_agent(tools, llm, agent="zero-shot-react-description")

# 自动化执行
workflow = """
1. 获取新的潜在客户列表
2. 评估每个客户的质量
3. 对高质量客户发送跟进邮件
4. 更新 CRM 中的客户状态
"""

response = agent.run(workflow)
```

---

## 6. 最佳实践

### 6.1 函数设计原则

| 原则 | 说明 | 示例 |
|------|------|------|
| **单一职责** | 一个函数只做一件事 | `get_weather()` vs `get_weather_and_news()` |
| **清晰命名** | 函数名清晰表达功能 | `calculate_discount()` |
| **详细文档** | description 要详细 | "获取天气，包括温度、湿度、风力" |
| **参数简洁** | 参数不要太多 | 不超过 5 个参数 |
| **类型明确** | 使用 type 和 enum | `"type": "string"`, `"enum": ["c", "f"]` |

### 6.2 错误处理

```python
def safe_function_call(function_name, arguments):
    """安全调用函数"""
    try:
        result = function_router(function_name, arguments)
        return result
    except Exception as e:
        return f"函数执行失败：{str(e)}"

# 在 Agent 中使用
@tool
def safe_search(query: str) -> str:
    """安全搜索"""
    try:
        results = search_api(query)
        return results
    except Exception as e:
        return f"搜索失败：{str(e)}"
```

### 6.3 性能优化

```python
# 缓存函数结果
from functools import lru_cache

@lru_cache(maxsize=100)
@tool
def cached_search(query: str) -> str:
    """带缓存的搜索"""
    return search_api(query)

# 异步执行
@tool
async def async_search(query: str) -> str:
    """异步搜索"""
    results = await search_api(query)
    return results

# 批量处理
@tool
def batch_process(items: list) -> str:
    """批量处理"""
    results = [process_item(item) for item in items]
    return str(results)
```

---

## 📝 练习题

### 基础题

1. **函数定义**：定义一个查询天气的函数，包含城市、日期参数

2. **工具创建**：使用 LangChain 创建一个自定义工具（如计算器）

3. **多函数调用**：定义 3 个相关函数，让模型根据问题选择合适的函数

### 进阶题

4. **实战应用**：为你的工作场景设计一个 Function Calling 应用

5. **错误处理**：实现一个带错误处理和重试机制的工具

6. **综合练习**：设计一个完整的智能客服系统，包含订单查询、产品咨询、退货处理等功能

---

## 🔗 参考资料

### 官方文档
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [LangChain Tools](https://python.langchain.com/docs/modules/agents/tools/)

### 学习资源
- 🔗 [LangChain Agent 教程](https://python.langchain.com/docs/modules/agents/)
- 📚 《LangChain for LLM Application Development》

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| Function Calling 原理 | ⭐⭐⭐⭐⭐ | 理解掌握 |
| OpenAI 函数调用 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| LangChain Tools | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 自定义工具 | ⭐⭐⭐⭐ | 熟练运用 |
| 最佳实践 | ⭐⭐⭐⭐ | 理解掌握 |

---

**上一章：** [Prompt 高级技巧](/ai/prompt-advanced)  
**下一章：** [AI Agent](/ai/agent)

**最后更新**：2026-03-12
