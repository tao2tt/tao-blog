# 文档问答系统

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-03-31

---

## 📚 目录

[[toc]]

---

## 1. 项目简介

### 1.1 功能描述

基于 RAG 技术，实现对企业文档的智能问答

### 1.2 技术栈

- LangChain
- ChromaDB
- OpenAI API
- Streamlit（前端）

---

## 2. 项目结构

```
rag-qa-system/
├── docs/              # 文档目录
├── src/
│   ├── loader.py      # 文档加载
│   ├── splitter.py    # 文本分块
│   ├── vectorstore.py # 向量库
│   ├── qa_chain.py    # 问答链
│   └── app.py         # Web 界面
├── requirements.txt
└── README.md
```

---

## 3. 核心实现

### 3.1 文档加载

```python
from langchain.document_loaders import DirectoryLoader, PyPDFLoader

def load_documents(docs_path):
    loader = DirectoryLoader(
        docs_path,
        glob="**/*.pdf",
        loader_cls=PyPDFLoader
    )
    return loader.load()
```

### 3.2 文本分块

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

def split_documents(documents):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len
    )
    return text_splitter.split_documents(documents)
```

### 3.3 向量存储

```python
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

def create_vectorstore(chunks, persist_dir):
    embeddings = OpenAIEmbeddings()
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=persist_dir
    )
    return vectorstore
```

### 3.4 问答链

```python
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI

def create_qa_chain(vectorstore):
    llm = ChatOpenAI(model="gpt-4", temperature=0.7)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        return_source_documents=True
    )
    return qa_chain
```

---

## 4. Web 界面

```python
import streamlit as st

st.title("📚 文档问答系统")

query = st.text_input("请输入问题：")
if st.button("提交"):
    result = qa_chain({"query": query})
    st.write(result["result"])
    st.write("参考来源：", result["source_documents"])
```

---

## 5. 优化方向

- 多路召回
- 查询改写
- 结果重排序
- 对话历史管理

---

## 📝 练习题

1. 实现一个完整的文档问答系统
2. 添加对话历史功能
3. 部署到服务器

---

**最后更新**：2026-03-12
