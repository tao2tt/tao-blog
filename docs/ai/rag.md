# RAG 基础

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-05-11  
> 难度：⭐⭐⭐⭐☆  
> 前置知识：[LangChain 框架](/ai/langchain)、[向量数据库](/ai/vector-db)

---

## 📚 目录

[[toc]]

---

## 1. RAG 简介

### 1.1 什么是 RAG

**RAG（Retrieval-Augmented Generation，检索增强生成）** 是一种结合检索系统和生成模型的技术，让大模型基于外部知识回答问题。

**核心思想：** 先检索相关知识，再让模型基于知识生成答案。

```
传统 LLM：
用户提问 → 模型回答（仅靠训练知识）
    ↓
问题：知识截止、可能幻觉

RAG：
用户提问 → 检索相关知识 → 模型基于知识回答
    ↓
优势：知识可更新、答案有依据、减少幻觉
```

### 1.2 为什么需要 RAG

**大模型的局限性：**

| 局限 | 说明 | RAG 解决 |
|------|------|---------|
| **知识截止** | 训练数据有截止时间 | 检索最新信息 |
| **幻觉问题** | 可能编造事实 | 基于检索内容回答 |
| **专业领域** | 缺乏特定领域知识 | 检索专业文档 |
| **可解释性** | 黑盒，无法追溯来源 | 提供引用来源 |
| **数据隐私** | 敏感数据不能训练 | 检索私有数据 |

### 1.3 RAG 工作流程

```
1. 用户提问
   ↓
2. 问题理解与改写
   ↓
3. 向量检索（从知识库找相关文档）
   ↓
4. 文档召回与排序
   ↓
5. 构建 Prompt（问题 + 相关文档）
   ↓
6. LLM 生成回答
   ↓
7. 返回结果 + 引用来源
```

**示意图：**

```
┌─────────────┐
│  用户提问    │
└──────┬──────┘
       ↓
┌─────────────┐
│  问题改写    │
└──────┬──────┘
       ↓
┌─────────────┐     ┌─────────────┐
│  向量检索    │←───→│  向量数据库  │
└──────┬──────┘     └─────────────┘
       ↓
┌─────────────┐
│  文档排序    │
└──────┬──────┘
       ↓
┌─────────────┐
│  构建 Prompt │
└──────┬──────┘
       ↓
┌─────────────┐
│  LLM 生成    │
└──────┬──────┘
       ↓
┌─────────────┐
│  返回答案    │
└─────────────┘
```

---

## 2. RAG 核心组件

### 2.1 文档处理

```python
from langchain.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 1. 加载文档
loader = PyPDFLoader("document.pdf")
documents = loader.load()

# 2. 分割文档
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,      # 每块 1000 字符
    chunk_overlap=200,    # 重叠 200 字符
    length_function=len
)
texts = text_splitter.split_documents(documents)

# 3. 添加元数据
for i, text in enumerate(texts):
    text.metadata["source"] = f"document.pdf"
    text.metadata["chunk"] = i
```

### 2.2 向量化

```python
from langchain.embeddings import OpenAIEmbeddings

# 初始化嵌入模型
embeddings = OpenAIEmbeddings(
    model="text-embedding-ada-002",
    chunk_size=1000
)

# 向量化文本
vectors = embeddings.embed_documents(
    [text.page_content for text in texts]
)

print(f"向量维度：{len(vectors[0])}")  # 1536 维
```

### 2.3 向量存储

```python
from langchain.vectorstores import Chroma

# 创建向量存储
vectorstore = Chroma.from_documents(
    documents=texts,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

# 检索
results = vectorstore.similarity_search(
    "查询内容",
    k=3  # 返回最相关的 3 个文档
)

for doc in results:
    print(doc.page_content)
    print(doc.metadata)
```

### 2.4 检索器

```python
from langchain.vectorstores import Chroma

# 基础检索器
retriever = vectorstore.as_retriever(
    search_kwargs={"k": 3}
)

# 带过滤的检索器
retriever = vectorstore.as_retriever(
    search_kwargs={
        "k": 3,
        "filter": {"source": "document.pdf"}
    }
)

# 使用
docs = retriever.get_relevant_documents("查询内容")
```

---

## 3. RAG 类型

### 3.1 Naive RAG（基础 RAG）

**最简单的 RAG 实现**

```python
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI

# 创建 QA 链
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"),
    chain_type="stuff",  # 将所有文档放入一个 Prompt
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
    return_source_documents=True
)

# 使用
result = qa_chain.invoke({"query": "你的问题"})
print(result["result"])
print("来源：", result["source_documents"])
```

**特点：**
- ✅ 简单易实现
- ✅ 适合简单场景
- ❌ 检索质量一般
- ❌ 容易丢失关键信息

### 3.2 Advanced RAG（高级 RAG）

**优化检索和生成质量**

```python
from langchain.chains import RetrievalQA

# 优化 1：问题改写
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever

metadata_field_info = [
    AttributeInfo(name="source", description="文档来源", type="string"),
    AttributeInfo(name="date", description="文档日期", type="string")
]

retriever = SelfQueryRetriever.from_llm(
    llm=ChatOpenAI(),
    vectorstore=vectorstore,
    document_contents="企业文档知识库",
    metadata_field_info=metadata_field_info
)

# 优化 2：多路召回（多个检索策略）
from langchain.retrievers import EnsembleRetriever

retriever1 = vectorstore.as_retriever(search_kwargs={"k": 3, "score_threshold": 0.7})
retriever2 = vectorstore.as_retriever(search_type="mmr", search_kwargs={"k": 3})

ensemble_retriever = EnsembleRetriever(
    retrievers=[retriever1, retriever2],
    weights=[0.7, 0.3]
)

# 优化 3：重排序
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor

compressor = LLMChainExtractor.from_llm(ChatOpenAI())
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vectorstore.as_retriever()
)
```

**特点：**
- ✅ 检索质量高
- ✅ 答案更准确
- ❌ 实现复杂
- ❌ 计算成本高

### 3.3 Modular RAG（模块化 RAG）

**灵活组合各个模块**

```python
# 模块化设计，可灵活替换各个组件
class ModularRAG:
    def __init__(self, retriever, llm, prompt_template):
        self.retriever = retriever
        self.llm = llm
        self.prompt_template = prompt_template
    
    def query(self, question):
        # 1. 检索
        docs = self.retriever.get_relevant_documents(question)
        
        # 2. 构建 Prompt
        context = "\n\n".join([doc.page_content for doc in docs])
        prompt = self.prompt_template.format(question=question, context=context)
        
        # 3. 生成
        answer = self.llm.invoke(prompt)
        
        return {
            "answer": answer,
            "sources": docs
        }

# 使用
rag = ModularRAG(
    retriever=vectorstore.as_retriever(),
    llm=ChatOpenAI(model="gpt-4"),
    prompt_template=PromptTemplate.from_template(
        "基于以下信息回答问题：\n{context}\n\n问题：{question}\n回答："
    )
)

result = rag.query("你的问题")
```

---

## 4. 优化技巧

### 4.1 查询改写

```python
from langchain.chains import LLMChain

# 问题改写链
rewrite_chain = LLMChain(
    llm=ChatOpenAI(),
    prompt=PromptTemplate.from_template(
        "请改写以下问题，使其更适合检索：\n原问题：{question}\n改写后："
    )
)

# 使用
original_question = "公司产品有哪些？"
rewritten = rewrite_chain.invoke({"question": original_question})
# 改写后："请列出公司所有产品及其详细信息"

# 用改写后的问题检索
docs = retriever.get_relevant_documents(rewritten["text"])
```

### 4.2 分块策略优化

```python
# 按段落分块
text_splitter = RecursiveCharacterTextSplitter(
    separators=["\n\n", "\n", "。", "！", "？"],
    chunk_size=1000,
    chunk_overlap=200
)

# 按语义分块（使用语义相似度）
from langchain.text_splitter import SemanticTextSplitter

semantic_splitter = SemanticTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)

# 重叠分块（提高召回率）
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=300  # 增加重叠
)
```

### 4.3 混合检索

```python
# 向量检索 + 关键词检索
from langchain.retrievers import BM25Retriever, EnsembleRetriever

# BM25 关键词检索
bm25_retriever = BM25Retriever.from_documents(documents)

# 向量检索
vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# 混合检索
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, vector_retriever],
    weights=[0.3, 0.7]  # 向量检索权重更高
)

# 使用
docs = ensemble_retriever.get_relevant_documents("查询内容")
```

---

## 5. 实战案例

### 5.1 企业文档问答

```python
from langchain.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import RetrievalQA

# 1. 加载企业文档
loader = DirectoryLoader(
    "./company_docs",
    glob="**/*.pdf",
    loader_cls=PyPDFLoader
)
documents = loader.load()

# 2. 分割文档
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
texts = text_splitter.split_documents(documents)

# 3. 创建向量存储
vectorstore = Chroma.from_documents(
    documents=texts,
    embedding=OpenAIEmbeddings(),
    persist_directory="./company_db"
)

# 4. 创建 QA 链
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"),
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True
)

# 5. 使用
result = qa_chain.invoke({"query": "公司的年假政策是什么？"})
print(f"答案：{result['result']}")
print(f"来源：{result['source_documents'][0].metadata['source']}")
```

### 5.2 客服知识库

```python
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

# 创建对话式 QA 链
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

qa_chain = ConversationalRetrievalChain.from_llm(
    llm=ChatOpenAI(model="gpt-4"),
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
    memory=memory,
    return_source_documents=True
)

# 多轮对话
result = qa_chain.invoke({"question": "如何退货？"})
print(result["answer"])

result = qa_chain.invoke({"question": "需要承担运费吗？"})
print(result["answer"])  # 能理解上下文
```

### 5.3 代码文档问答

```python
from langchain.document_loaders import TextLoader
from langchain.text_splitter import Language, RecursiveCharacterTextSplitter

# 加载代码文件
loader = TextLoader("source_code.py")
documents = loader.load()

# 按代码结构分割
text_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.PYTHON,
    chunk_size=500,
    chunk_overlap=100
)
texts = text_splitter.split_documents(documents)

# 创建向量存储
vectorstore = Chroma.from_documents(
    documents=texts,
    embedding=OpenAIEmbeddings()
)

# 创建 QA 链
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"),
    retriever=vectorstore.as_retriever()
)

# 使用
result = qa_chain.invoke({"query": "这个函数怎么使用？"})
```

---

## 6. 评估与优化

### 6.1 评估指标

| 指标 | 说明 | 计算方法 |
|------|------|---------|
| **检索准确率** | 检索到的文档是否相关 | 人工评估或语义相似度 |
| **答案准确性** | 答案是否正确 | 与标准答案对比 |
| **响应时间** | 从提问到回答的时间 | 端到端延迟 |
| **引用质量** | 引用来源是否准确 | 人工检查 |

### 6.2 优化方向

```python
# 优化 1：增加检索文档数量
retriever = vectorstore.as_retriever(search_kwargs={"k": 10})

# 优化 2：调整相似度阈值
retriever = vectorstore.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.7}
)

# 优化 3：使用更好的嵌入模型
from langchain.embeddings import HuggingFaceEmbeddings
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-mpnet-base-v2"
)

# 优化 4：添加元数据过滤
retriever = vectorstore.as_retriever(
    search_kwargs={
        "k": 3,
        "filter": {"date": {"$gte": "2024-01-01"}}
    }
)
```

---

## 📝 练习题

### 基础题

1. **RAG 流程**：描述 RAG 的完整工作流程

2. **文档分割**：使用 RecursiveCharacterTextSplitter 分割一个 PDF 文档

3. **向量检索**：创建 Chroma 向量存储并进行相似度检索

### 进阶题

4. **混合检索**：实现向量检索 + 关键词检索的混合检索

5. **对话式 RAG**：实现支持多轮对话的 RAG 系统

6. **综合练习**：搭建一个完整的企业文档问答系统，支持 PDF 上传、检索、问答、引用

---

## 🔗 参考资料

### 技术文档
- [LangChain RAG 教程](https://python.langchain.com/docs/use_cases/question_answering/)
- [RAG 论文](https://arxiv.org/abs/2005.11401)

### 学习资源
- 🔗 [RAG 实战教程](https://www.langchain.com.cn/rag)
- 📚 《Retrieval-Augmented Generation for LLMs》

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| RAG 原理 | ⭐⭐⭐⭐⭐ | 理解掌握 |
| 文档处理 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 向量检索 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| RAG 类型 | ⭐⭐⭐⭐ | 理解掌握 |
| 优化技巧 | ⭐⭐⭐⭐ | 理解掌握 |

---

**上一章：** [LangChain 框架](/ai/langchain)  
**下一章：** [向量数据库](/ai/vector-db)

**最后更新**：2026-03-12
