# RAG 基础

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-03-27

---

## 📚 目录

[[toc]]

---

## 1. 什么是 RAG

### 1.1 概念

**Retrieval-Augmented Generation**（检索增强生成）

结合检索系统和生成模型，让 LLM 基于外部知识回答问题

### 1.2 为什么需要 RAG

| 问题 | 纯 LLM | RAG |
|------|--------|-----|
| 知识时效性 | ❌ 截止训练数据 | ✅ 可更新 |
| 幻觉问题 | ❌ 容易编造 | ✅ 有据可依 |
| 专业领域 | ❌ 知识有限 | ✅ 可注入 |
| 可解释性 | ❌ 黑盒 | ✅ 可追溯来源 |

---

## 2. RAG 工作流程

```
用户提问
    ↓
1. 问题理解与改写
    ↓
2. 向量检索
    ↓
3. 文档召回与排序
    ↓
4. 构建 Prompt（问题 + 上下文）
    ↓
5. LLM 生成回答
    ↓
6. 返回结果 + 引用来源
```

---

## 3. 核心组件

### 3.1 文档处理

```python
from langchain.document_loaders import DirectoryLoader

# 加载文档
loader = DirectoryLoader("./docs", glob="**/*.md")
documents = loader.load()

# 文本分块
from langchain.text_splitter import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)
chunks = text_splitter.split_documents(documents)
```

### 3.2 向量化

```python
from langchain.embeddings import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

### 3.3 向量存储

```python
from langchain.vectorstores import Chroma

vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"
)
```

### 3.4 检索器

```python
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3}
)

# 检索
docs = retriever.get_relevant_documents("问题")
```

---

## 4. RAG 类型

### 4.1 Naive RAG

- 简单检索 + 生成
- 适合简单场景

### 4.2 Advanced RAG

- 查询改写
- 多路召回
- 重排序

### 4.3 Modular RAG

- 模块化设计
- 灵活组合

---

## 5. 优化技巧

### 5.1 查询改写

```python
# 同义扩展
# 问题分解
# 假设性问题生成
```

### 5.2 分块策略

- 按段落分块
- 按语义分块
- 重叠分块

### 5.3 混合检索

```python
# 向量检索 + 关键词检索
# 多向量库融合
```

---

## 📝 练习题

1. 搭建一个简单的 RAG 系统
2. 对比不同分块策略的效果
3. 实现混合检索

---

## 🔗 参考资料

- [RAG 论文](https://arxiv.org/abs/2005.11401)
- [LangChain RAG 教程](https://python.langchain.com/docs/use_cases/question_answering/)

---

**最后更新**：2026-03-12
