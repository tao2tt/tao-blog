# 文档问答系统

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-05-15  
> 难度：⭐⭐⭐⭐⭐  
> 前置知识：[RAG 基础](/ai/rag)、[向量数据库](/ai/vector-db)、[LangChain 框架](/ai/langchain)

---

## 📚 目录

[[toc]]

---

## 1. 项目简介

### 1.1 功能描述

**文档问答系统（Document QA System）** 是基于 RAG 技术的企业级应用，支持上传文档、自动索引、智能问答。

**核心功能：**

| 功能 | 说明 |
|------|------|
| **文档上传** | 支持 PDF、Word、Markdown 等格式 |
| **自动索引** | 自动分割、向量化、存储 |
| **智能问答** | 基于文档内容回答问题 |
| **引用溯源** | 提供答案来源和引用 |
| **多轮对话** | 支持上下文理解 |

### 1.2 技术栈

```
文档问答系统技术栈
├── 后端
│   ├── FastAPI（Web 框架）
│   ├── LangChain（RAG 框架）
│   ├── Chroma/Milvus（向量数据库）
│   └── OpenAI API（大模型）
│
├── 前端
│   ├── Streamlit（快速原型）
│   └── React/Vue（生产环境）
│
├── 数据处理
│   ├── PyPDF2（PDF 解析）
│   ├── python-docx（Word 解析）
│   └── LangChain Text Splitters（文本分割）
│
└── 部署
    ├── Docker（容器化）
    └── Nginx（反向代理）
```

### 1.3 项目结构

```
rag-qa-system/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI 入口
│   │   ├── api/              # API 路由
│   │   ├── services/         # 业务逻辑
│   │   ├── models/           # 数据模型
│   │   └── utils/            # 工具函数
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── app.py                # Streamlit 界面
│   └── requirements.txt
│
├── data/
│   ├── documents/            # 上传的文档
│   └── vectorstore/          # 向量数据库
│
└── docker-compose.yml
```

---

## 2. 核心实现

### 2.1 文档加载

```python
from langchain.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    UnstructuredMarkdownLoader,
    DirectoryLoader
)

def load_document(file_path: str):
    """加载文档"""
    if file_path.endswith(".pdf"):
        loader = PyPDFLoader(file_path)
    elif file_path.endswith(".docx"):
        loader = Docx2txtLoader(file_path)
    elif file_path.endswith(".md"):
        loader = UnstructuredMarkdownLoader(file_path)
    else:
        raise ValueError(f"不支持的文件格式：{file_path}")
    
    return loader.load()

def load_directory(dir_path: str, glob_pattern: str = "**/*"):
    """加载目录下所有文档"""
    loader = DirectoryLoader(
        dir_path,
        glob=glob_pattern,
        loader_cls=PyPDFLoader
    )
    return loader.load()
```

### 2.2 文本分割

```python
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    Language
)

def split_documents(documents, chunk_size=1000, chunk_overlap=200):
    """分割文档"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", "。", "！", "？", "！", "?", " ", ""]
    )
    return text_splitter.split_documents(documents)

def split_code(code: str, language: Language):
    """分割代码"""
    text_splitter = RecursiveCharacterTextSplitter.from_language(
        language=language,
        chunk_size=500,
        chunk_overlap=100
    )
    return text_splitter.split_text(code)
```

### 2.3 向量化与存储

```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma

def create_vectorstore(documents, persist_directory="./vectorstore"):
    """创建向量存储"""
    embeddings = OpenAIEmbeddings(
        model="text-embedding-ada-002",
        chunk_size=1000
    )
    
    vectorstore = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=persist_directory
    )
    
    return vectorstore

def add_documents(vectorstore, documents):
    """添加文档到向量存储"""
    embeddings = OpenAIEmbeddings()
    vectorstore.add_documents(documents, embedding=embeddings)
```

### 2.4 问答链

```python
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI

def create_qa_chain(vectorstore, model_name="gpt-4"):
    """创建 QA 链"""
    llm = ChatOpenAI(
        model=model_name,
        temperature=0.7,
        max_tokens=1000
    )
    
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
        return_source_documents=True
    )
    
    return qa_chain

def answer_question(qa_chain, question):
    """回答问题"""
    result = qa_chain.invoke({"query": question})
    
    return {
        "answer": result["result"],
        "sources": [
            {
                "content": doc.page_content,
                "metadata": doc.metadata
            }
            for doc in result["source_documents"]
        ]
    }
```

---

## 3. Web 界面

### 3.1 Streamlit 快速原型

```python
import streamlit as st
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI

st.set_page_config(page_title="文档问答系统", page_icon="📚")

st.title("📚 文档问答系统")

# 侧边栏：文档上传
with st.sidebar:
    st.header("文档管理")
    uploaded_files = st.file_uploader(
        "上传文档",
        type=["pdf", "docx", "md"],
        accept_multiple_files=True
    )
    
    if uploaded_files:
        st.success(f"已上传 {len(uploaded_files)} 个文档")
        
        # 保存文档
        for uploaded_file in uploaded_files:
            with open(f"./data/documents/{uploaded_file.name}", "wb") as f:
                f.write(uploaded_file.getbuffer())
        
        # 重新索引
        if st.button("重新索引"):
            with st.spinner("正在索引文档..."):
                # 调用索引逻辑
                st.success("索引完成！")

# 主界面：问答
if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if question := st.chat_input("请输入问题"):
    # 显示用户问题
    with st.chat_message("user"):
        st.markdown(question)
    st.session_state.messages.append({"role": "user", "content": question})
    
    # 生成回答
    with st.chat_message("assistant"):
        with st.spinner("正在思考..."):
            # 调用 QA 链
            answer = answer_question(qa_chain, question)
            st.markdown(answer["answer"])
            
            # 显示引用来源
            with st.expander("查看引用来源"):
                for i, source in enumerate(answer["sources"], 1):
                    st.markdown(f"**来源 {i}:** {source['metadata'].get('source', '未知')}")
                    st.markdown(f"> {source['content'][:200]}...")
    
    st.session_state.messages.append({
        "role": "assistant",
        "content": answer["answer"]
    })
```

### 3.2 FastAPI 后端

```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="文档问答系统 API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# 数据模型
class Question(BaseModel):
    query: str
    k: int = 3

class Answer(BaseModel):
    answer: str
    sources: List[dict]

class UploadResponse(BaseModel):
    message: str
    file_count: int

# API 路由
@app.post("/upload", response_model=UploadResponse)
async def upload_documents(files: List[UploadFile] = File(...)):
    """上传文档"""
    try:
        for file in files:
            with open(f"./data/documents/{file.filename}", "wb") as f:
                f.write(await file.read())
        
        # 重新索引
        index_documents()
        
        return UploadResponse(
            message="上传成功",
            file_count=len(files)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask", response_model=Answer)
async def ask_question(question: Question):
    """提问"""
    try:
        result = qa_chain.invoke({"query": question.query})
        
        return Answer(
            answer=result["result"],
            sources=[
                {
                    "content": doc.page_content,
                    "metadata": doc.metadata
                }
                for doc in result["source_documents"]
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def list_documents():
    """列出所有文档"""
    import os
    documents = os.listdir("./data/documents")
    return {"documents": documents}

@app.delete("/documents/{filename}")
async def delete_document(filename: str):
    """删除文档"""
    import os
    try:
        os.remove(f"./data/documents/{filename}")
        return {"message": "删除成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 4. 高级功能

### 4.1 多轮对话

```python
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

def create_conversational_chain(vectorstore):
    """创建对话式 QA 链"""
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        output_key="answer"
    )
    
    chain = ConversationalRetrievalChain.from_llm(
        llm=ChatOpenAI(model="gpt-4"),
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
        memory=memory,
        return_source_documents=True
    )
    
    return chain

# 使用
chain = create_conversational_chain(vectorstore)

# 第一轮
result1 = chain.invoke({"question": "公司的年假政策是什么？"})
print(result1["answer"])

# 第二轮（能理解上下文）
result2 = chain.invoke({"question": "需要工作满一年才能享受吗？"})
print(result2["answer"])
```

### 4.2 元数据过滤

```python
from langchain.vectorstores import Chroma

# 添加带元数据的文档
vectorstore.add_documents(
    documents=texts,
    embeddings=embeddings,
    metadatas=[
        {"source": "policy.pdf", "date": "2024-01-01", "category": "policy"},
        {"source": "guide.pdf", "date": "2024-02-01", "category": "guide"}
    ]
)

# 带过滤的检索
retriever = vectorstore.as_retriever(
    search_kwargs={
        "k": 3,
        "filter": {
            "category": "policy",
            "date": {"$gte": "2024-01-01"}
        }
    }
)

# 使用
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(),
    retriever=retriever
)
```

### 4.3 引用溯源

```python
def answer_with_citation(qa_chain, question):
    """带引用的回答"""
    result = qa_chain.invoke({"query": question})
    
    answer = result["result"]
    sources = result["source_documents"]
    
    # 构建引用
    citations = []
    for i, doc in enumerate(sources, 1):
        source = doc.metadata.get("source", "未知来源")
        page = doc.metadata.get("page", "")
        citations.append(f"[{i}] {source}" + (f" 第{page}页" if page else ""))
    
    # 在答案中添加引用标记
    cited_answer = answer + "\n\n**参考文献:**\n" + "\n".join(citations)
    
    return {
        "answer": cited_answer,
        "sources": sources
    }
```

---

## 5. 部署方案

### 5.1 Docker 部署

```dockerfile
# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
  
  frontend:
    build: ./frontend
    ports:
      - "8501:8501"
    depends_on:
      - backend
  
  milvus:
    image: milvusdb/milvus:latest
    ports:
      - "19530:19530"
    volumes:
      - ./milvus_data:/var/lib/milvus
```

### 5.2 生产环境优化

```python
# 连接池优化
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

# 使用连接池
embeddings = OpenAIEmbeddings(
    model="text-embedding-ada-002",
    request_timeout=30,
    max_retries=3
)

# 缓存优化
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_embed_query(query: str):
    return embeddings.embed_query(query)

# 异步处理
import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)

async def embed_documents_async(documents):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        executor,
        embeddings.embed_documents,
        documents
    )
```

---

## 6. 实战案例

### 6.1 企业知识库

```python
# 企业制度问答系统
class CompanyKnowledgeBase:
    def __init__(self, db_path="./company_db"):
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma(
            persist_directory=db_path,
            embedding_function=self.embeddings
        )
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=ChatOpenAI(model="gpt-4"),
            retriever=self.vectorstore.as_retriever(
                search_kwargs={
                    "k": 3,
                    "filter": {"department": {"$in": ["all", "hr"]}}
                }
            ),
            return_source_documents=True
        )
    
    def add_document(self, file_path: str, department: str):
        """添加部门文档"""
        documents = load_document(file_path)
        texts = split_documents(documents)
        
        # 添加部门元数据
        for text in texts:
            text.metadata["department"] = department
            text.metadata["date"] = datetime.now().isoformat()
        
        self.vectorstore.add_documents(texts)
    
    def query(self, question: str, department: Optional[str] = None):
        """查询"""
        if department:
            retriever = self.vectorstore.as_retriever(
                search_kwargs={
                    "k": 3,
                    "filter": {"department": department}
                }
            )
            chain = RetrievalQA.from_chain_type(
                llm=ChatOpenAI(model="gpt-4"),
                retriever=retriever,
                return_source_documents=True
            )
            return chain.invoke({"query": question})
        else:
            return self.qa_chain.invoke({"query": question})
```

### 6.2 产品手册问答

```python
# 产品手册问答系统
class ProductManualQA:
    def __init__(self):
        self.vectorstore = Chroma(
            persist_directory="./product_db",
            embedding_function=OpenAIEmbeddings()
        )
        
        self.qa_chain = ConversationalRetrievalChain.from_llm(
            llm=ChatOpenAI(model="gpt-4"),
            retriever=self.vectorstore.as_retriever(search_kwargs={"k": 5}),
            return_source_documents=True
        )
    
    def add_product_manual(self, product_id: str, manual_path: str):
        """添加产品手册"""
        documents = load_document(manual_path)
        texts = split_documents(documents)
        
        # 添加产品元数据
        for text in texts:
            text.metadata["product_id"] = product_id
            text.metadata["type"] = "manual"
        
        self.vectorstore.add_documents(texts)
    
    def query(self, product_id: str, question: str):
        """查询特定产品"""
        retriever = self.vectorstore.as_retriever(
            search_kwargs={
                "k": 5,
                "filter": {"product_id": product_id}
            }
        )
        
        chain = RetrievalQA.from_chain_type(
            llm=ChatOpenAI(model="gpt-4"),
            retriever=retriever,
            return_source_documents=True
        )
        
        return chain.invoke({"query": question})
```

### 6.3 代码文档问答

```python
# 代码文档问答系统
class CodeDocumentationQA:
    def __init__(self):
        self.vectorstore = Chroma(
            persist_directory="./code_db",
            embedding_function=OpenAIEmbeddings()
        )
    
    def index_codebase(self, code_dir: str):
        """索引代码库"""
        from langchain.text_splitter import Language
        
        for root, dirs, files in os.walk(code_dir):
            for file in files:
                if file.endswith(".py"):
                    file_path = os.path.join(root, file)
                    with open(file_path, "r", encoding="utf-8") as f:
                        code = f.read()
                    
                    # 按代码结构分割
                    texts = split_code(code, Language.PYTHON)
                    
                    # 添加元数据
                    documents = [
                        Document(
                            page_content=text,
                            metadata={
                                "source": file_path,
                                "type": "code",
                                "language": "python"
                            }
                        )
                        for text in texts
                    ]
                    
                    self.vectorstore.add_documents(documents)
    
    def query(self, question: str):
        """查询代码"""
        qa_chain = RetrievalQA.from_chain_type(
            llm=ChatOpenAI(model="gpt-4"),
            retriever=self.vectorstore.as_retriever(search_kwargs={"k": 3}),
            return_source_documents=True
        )
        
        result = qa_chain.invoke({"query": question})
        
        # 格式化代码引用
        formatted_sources = []
        for doc in result["source_documents"]:
            source = doc.metadata["source"]
            content = doc.page_content
            formatted_sources.append(f"**{source}**:\n```python\n{content}\n```")
        
        return {
            "answer": result["result"],
            "code_references": formatted_sources
        }
```

---

## 📝 练习题

### 基础题

1. **文档加载**：实现一个支持 PDF、Word、Markdown 的文档加载器

2. **向量存储**：使用 Chroma 创建向量存储并添加文档

3. **简单问答**：实现一个简单的文档问答系统

### 进阶题

4. **多轮对话**：实现支持上下文的对话式问答系统

5. **元数据过滤**：实现基于部门、日期等元数据的过滤查询

6. **综合练习**：搭建一个完整的企业知识库问答系统，支持文档上传、索引、问答、引用溯源

---

## 🔗 参考资料

### 项目模板
- 🔗 [LangChain QA 模板](https://github.com/langchain-ai/rag-template)
- 🔗 [Streamlit + LangChain 示例](https://docs.streamlit.io/knowledge-base/tutorials/build-a-rag-app)

### 学习资源
- 📚 《Building RAG Applications with LangChain》
- 🔗 [LangChain 实战教程](https://python.langchain.com/docs/use_cases/question_answering/)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 系统架构 | ⭐⭐⭐⭐⭐ | 理解掌握 |
| 文档处理 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 问答链 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 多轮对话 | ⭐⭐⭐⭐ | 理解掌握 |
| 部署方案 | ⭐⭐⭐⭐ | 理解掌握 |

---

**上一章：** [向量数据库](/ai/vector-db)  
**下一章：** [智能客服项目](/ai/project-customer-service)

**最后更新**：2026-03-12
