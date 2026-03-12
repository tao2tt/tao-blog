# AutoGen 多 Agent

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-03-25

---

## 📚 目录

[[toc]]

---

## 1. AutoGen 简介

### 1.1 什么是 AutoGen

微软开源的多 Agent 对话框架，支持多角色协作完成任务

### 1.2 核心概念

- **Agent**：智能代理
- **Conversation**：对话
- **Group Chat**：群聊
- **Tool Use**：工具使用

---

## 2. 安装

```bash
pip install pyautogen
```

---

## 3. 基础 Agent

```python
from autogen import AssistantAgent, UserProxyAgent

# 创建助手 Agent
assistant = AssistantAgent(
    name="assistant",
    llm_config={"config_list": [{"model": "gpt-4", "api_key": "xxx"}]}
)

# 创建用户代理
user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",
    code_execution_config={"work_dir": "coding"}
)

# 开始对话
user_proxy.initiate_chat(
    assistant,
    message="请帮我写一个 Python 脚本，计算斐波那契数列"
)
```

---

## 4. 群聊（Group Chat）

```python
from autogen import GroupChat, GroupChatManager

# 创建多个 Agent
coder = AssistantAgent(name="coder", ...)
reviewer = AssistantAgent(name="reviewer", ...)
manager = AssistantAgent(name="manager", ...)

# 创建群聊
groupchat = GroupChat(
    agents=[coder, reviewer, manager],
    messages=[],
    max_round=10
)

# 创建群聊管理员
group_chat_manager = GroupChatManager(
    groupchat=groupchat,
    llm_config={"config_list": [...]}
)

# 开始群聊
user_proxy.initiate_chat(
    group_chat_manager,
    message="请开发一个 Web 应用"
)
```

---

## 5. 角色设定

```python
# 产品经理
product_manager = AssistantAgent(
    name="product_manager",
    system_message="你是一位产品经理，负责定义产品需求和功能规格。",
    llm_config={...}
)

# 架构师
architect = AssistantAgent(
    name="architect",
    system_message="你是一位技术架构师，负责设计系统架构。",
    llm_config={...}
)

# 开发工程师
developer = AssistantAgent(
    name="developer",
    system_message="你是一位高级开发工程师，负责编写代码。",
    llm_config={...}
)
```

---

## 6. 代码执行

```python
from autogen import UserProxyAgent

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",
    code_execution_config={
        "work_dir": "coding",
        "use_docker": False
    }
)
```

---

## 7. 工具使用

```python
from autogen import register_function

@register_function("search_web")
def search_web(query: str) -> str:
    """搜索网络"""
    # 实现搜索逻辑
    return results

assistant.register_function(function_map={
    "search_web": search_web
})
```

---

## 8. 实战：软件开发协作

```python
# 定义角色
roles = [
    {"name": "产品经理", "role": "定义需求"},
    {"name": "架构师", "role": "设计架构"},
    {"name": "开发工程师", "role": "编写代码"},
    {"name": "测试工程师", "role": "测试验证"}
]

# 创建群聊并执行任务
```

---

## 📝 练习题

1. 创建一个双 Agent 对话（面试官 vs 候选人）
2. 实现一个多角色软件开发流程
3. 用 AutoGen 实现代码审查助手

---

## 🔗 参考资料

- [AutoGen 官方文档](https://microsoft.github.io/autogen/)
- [AutoGen GitHub](https://github.com/microsoft/autogen)

---

**最后更新**：2026-03-12
