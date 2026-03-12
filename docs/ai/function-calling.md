# Function Calling

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-03-21

---

## 📚 目录

[[toc]]

---

## 1. 什么是 Function Calling

### 1.1 概念

让大模型能够调用外部函数/API，扩展模型能力

### 1.2 应用场景

- 查询天气
- 搜索数据库
- 执行代码
- 调用业务 API

---

## 2. OpenAI Function Calling

### 2.1 定义函数

```python
from openai import OpenAI

client = OpenAI()

functions = [
    {
        "name": "get_weather",
        "description": "获取指定城市的天气",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "城市名称"
                }
            },
            "required": ["city"]
        }
    }
]
```

### 2.2 调用模型

```python
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "北京天气怎么样？"}
    ],
    functions=functions
)
```

### 2.3 处理响应

```python
message = response.choices[0].message

if message.function_call:
    function_name = message.function_call.name
    arguments = json.loads(message.function_call.arguments)
    
    # 执行实际函数
    if function_name == "get_weather":
        result = get_weather(arguments["city"])
    
    # 将结果返回给模型
    second_response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "user", "content": "北京天气怎么样？"},
            message,
            {"role": "function", "name": "get_weather", "content": result}
        ]
    )
```

---

## 3. 多函数调用

```python
functions = [
    {
        "name": "search_database",
        "description": "搜索数据库",
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
```

---

## 4. LangChain Tools

```python
from langchain.agents import load_tools, initialize_agent
from langchain.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-4")
tools = load_tools(["serpapi", "llm-math"], llm=llm)

agent = initialize_agent(tools, llm, agent="zero-shot-react-description")
agent.run("搜索最新的 AI 新闻，并计算相关新闻数量的平方根")
```

---

## 5. 自定义 Tool

```python
from langchain.tools import tool

@tool
def search_knowledge_base(query: str) -> str:
    """搜索知识库"""
    # 实现搜索逻辑
    return results

@tool
def execute_sql(sql: str) -> str:
    """执行 SQL 查询"""
    # 实现数据库查询
    return results
```

---

## 6. 最佳实践

### 6.1 函数设计原则

- 描述清晰
- 参数简洁
- 返回值明确

### 6.2 错误处理

```python
try:
    result = call_function(name, args)
except Exception as e:
    return f"执行失败：{str(e)}"
```

### 6.3 安全考虑

- 权限控制
- 输入验证
- 敏感操作确认

---

## 📝 练习题

1. 实现一个天气查询 Function
2. 用 LangChain 创建自定义 Tool
3. 设计一个多工具协作的 Agent

---

## 🔗 参考资料

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [LangChain Tools](https://python.langchain.com/docs/modules/agents/tools/)

---

**最后更新**：2026-03-12
