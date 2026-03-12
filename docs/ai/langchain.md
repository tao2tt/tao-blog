# LangChain 框架

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-03-23

---

## 📚 目录

[[toc]]

---

## 1. LangChain 简介

### 1.1 什么是 LangChain

用于开发 LLM 应用的框架，提供组件化、模块化能力

### 1.2 核心模块

- **Models**：LLM、ChatModel、Embedding
- **Prompts**：Prompt 模板
- **Chains**：链式调用
- **Agents**：智能代理
- **Memory**：记忆管理
- **Retrieval**：检索增强

---

## 2. 安装与配置

```bash
pip install langchain langchain-openai
```

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4", temperature=0.7)
```

---

## 3. Prompt 模板

```python
from langchain.prompts import ChatPromptTemplate

template = "你是一个{role}，请{task}"
prompt = ChatPromptTemplate.from_template(template)

messages = prompt.format_messages(
    role="Java 专家",
    task="解释什么是多态"
)
```

---

## 4. Chains

### 4.1 LLMChain

```python
from langchain.chains import LLMChain

chain = LLMChain(llm=llm, prompt=prompt)
result = chain.run(role="面试官", task="出一道 Java 面试题")
```

### 4.2 SequentialChain

```python
from langchain.chains import SequentialChain

chain1 = LLMChain(llm=llm, prompt=prompt1, output_key="summary")
chain2 = LLMChain(llm=llm, prompt=prompt2, output_key="keywords")

overall = SequentialChain(
    chains=[chain1, chain2],
    input_variables=["text"],
    output_variables=["summary", "keywords"]
)
```

---

## 5. Agents

```python
from langchain.agents import initialize_agent, load_tools
from langchain.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-4")
tools = load_tools(["serpapi", "llm-math"], llm=llm)

agent = initialize_agent(
    tools, 
    llm, 
    agent="zero-shot-react-description",
    verbose=True
)

agent.run("搜索 2024 年 AI 领域的重大突破，并计算相关新闻数量")
```

---

## 6. Memory

```python
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory()
memory.chat_memory.add_user_message("你好")
memory.chat_memory.add_ai_message("你好！有什么可以帮助你的？")

print(memory.load_memory_variables({}))
```

---

## 7. Retrieval

```python
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.document_loaders import TextLoader

# 加载文档
loader = TextLoader("document.txt")
documents = loader.load()

# 创建向量库
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(documents, embeddings)

# 检索
results = vectorstore.similarity_search("查询内容", k=3)
```

---

## 8. 实战：文档问答

```python
from langchain.chains import RetrievalQA

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectorstore.as_retriever(),
    return_source_documents=True
)

result = qa_chain({"query": "文档中提到了什么？"})
```

---

## 📝 练习题

1. 创建一个带记忆的对话链
2. 实现一个简单的文档问答系统
3. 用 Agent 实现多工具协作

---

## 🔗 参考资料

- [LangChain 官方文档](https://python.langchain.com/)
- [LangChain 中文文档](https://www.langchain.com.cn/)

---

**最后更新**：2026-03-12
