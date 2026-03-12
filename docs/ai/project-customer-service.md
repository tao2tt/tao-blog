# 智能客服项目

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-04-05

---

## 📚 目录

[[toc]]

---

## 1. 项目简介

### 1.1 功能描述

基于 LLM 的企业智能客服系统，支持常见问题自动回答

### 1.2 核心功能

- 自动问答
- 多轮对话
- 人工转接
- 知识库管理

---

## 2. 系统架构

```
用户 → API 网关 → 对话服务 → LLM
                    ↓
                知识库 (RAG)
                    ↓
                会话记录
```

---

## 3. 核心实现

### 3.1 意图识别

```python
def classify_intent(question):
    prompt = f"""
    判断用户问题的意图类别：
    - 产品咨询
    - 技术支持
    - 投诉建议
    - 人工服务
    
    问题：{question}
    意图类别：
    """
    return llm.predict(prompt)
```

### 3.2 知识库问答

```python
def answer_from_knowledge(question):
    results = vectorstore.similarity_search(question, k=3)
    context = "\n".join([doc.page_content for doc in results])
    
    prompt = f"""
    基于以下知识库内容回答问题：
    {context}
    
    问题：{question}
    回答：
    """
    return llm.predict(prompt)
```

### 3.3 多轮对话

```python
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# 在对话中保持上下文
```

---

## 4. 部署方案

### 4.1 Docker 部署

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

### 4.2 API 服务

```python
from fastapi import FastAPI

app = FastAPI()

@app.post("/chat")
async def chat(question: str, session_id: str):
    # 处理对话
    return {"answer": answer, "sources": sources}
```

---

## 📝 练习题

1. 实现一个完整的智能客服系统
2. 添加人工转接功能
3. 部署到生产环境

---

**最后更新**：2026-03-12
