# 向量数据库

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-05-13  
> 难度：⭐⭐⭐⭐☆  
> 前置知识：[RAG 基础](/ai/rag)、[LangChain 框架](/ai/langchain)

---

## 📚 目录

[[toc]]

---

## 1. 向量数据库简介

### 1.1 什么是向量数据库

**向量数据库（Vector Database）** 是专门用于存储和检索向量数据的数据库，支持高效的相似度搜索。

**核心能力：**
- ✅ 存储高维向量
- ✅ 快速相似度搜索
- ✅ 大规模索引
- ✅ 元数据过滤

```
传统数据库 vs 向量数据库：

传统数据库：
┌─────────────┐
│  行 + 列     │  → 精确匹配查询
└─────────────┘

向量数据库：
┌─────────────┐
│  向量 + 元数据 │  → 相似度搜索
└─────────────┘
```

### 1.2 为什么需要向量数据库

**传统数据库的局限：**

| 场景 | 传统数据库 | 向量数据库 |
|------|-----------|-----------|
| **相似度搜索** | ❌ 不支持 | ✅ 高效支持 |
| **高维向量** | ❌ 性能差 | ✅ 专门优化 |
| **语义搜索** | ❌ 不支持 | ✅ 核心能力 |
| **大规模检索** | ❌ 慢 | ✅ 快速 |

**向量数据库的优势：**
- ✅ 专为向量相似度优化
- ✅ 支持亿级向量检索
- ✅ 毫秒级响应
- ✅ 支持元数据过滤

### 1.3 向量相似度

**常用相似度计算方法：**

| 方法 | 公式 | 适用场景 |
|------|------|---------|
| **余弦相似度** | cos(θ) = A·B / (‖A‖‖B‖) | 文本相似度 |
| **欧氏距离** | √(Σ(ai-bi)²) | 空间距离 |
| **点积** | A·B = Σ(ai×bi) | 推荐系统 |

**余弦相似度示例：**

```python
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# 两个向量
vec1 = np.array([[0.1, 0.2, 0.3, 0.4]])
vec2 = np.array([[0.2, 0.3, 0.4, 0.5]])

# 计算余弦相似度
similarity = cosine_similarity(vec1, vec2)[0][0]
print(f"余弦相似度：{similarity}")  # 越接近 1 越相似

# 语义理解：
# 0.9-1.0: 非常相似
# 0.7-0.9: 比较相似
# 0.5-0.7: 一般相似
# <0.5: 不相似
```

---

## 2. 主流向量数据库

### 2.1 对比总览

| 数据库 | 类型 | 特点 | 适用场景 |
|--------|------|------|---------|
| **Chroma** | 嵌入式 | 轻量、易用 | 本地开发、小规模 |
| **Milvus** | 分布式 | 高性能、可扩展 | 生产环境、大规模 |
| **Pinecone** | 云服务 | 托管、免运维 | 快速上线 |
| **Weaviate** | 混合 | 向量 + 图 | 知识图谱 |
| **Qdrant** | 分布式 | 过滤能力强 | 复杂查询 |

### 2.2 ChromaDB

**特点：**
- ✅ 轻量级，易于使用
- ✅ 支持本地持久化
- ✅ 无需额外服务
- ❌ 不适合大规模

**安装：**
```bash
pip install chromadb
```

**使用：**
```python
import chromadb
from chromadb.config import Settings

# 创建客户端（内存模式）
client = chromadb.Client()

# 创建客户端（持久化模式）
client = chromadb.PersistentClient(path="./chroma_db")

# 创建集合
collection = client.create_collection(
    name="my_collection",
    metadata={"description": "我的文档集合"}
)

# 添加向量
collection.add(
    embeddings=[[0.1, 0.2, ...], [0.3, 0.4, ...]],
    documents=["文档 1", "文档 2"],
    metadatas=[{"source": "file1"}, {"source": "file2"}],
    ids=["id1", "id2"]
)

# 查询
results = collection.query(
    query_embeddings=[[0.15, 0.25, ...]],
    n_results=3,
    where={"source": "file1"}  # 元数据过滤
)

# 删除
collection.delete(ids=["id1"])
```

### 2.3 Milvus

**特点：**
- ✅ 高性能，支持亿级向量
- ✅ 支持分布式部署
- ✅ 丰富的索引类型
- ❌ 部署复杂

**安装（Docker）：**
```bash
docker run -d --name milvus -p 19530:19530 milvusdb/milvus:latest
```

**使用：**
```python
from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType

# 连接
connections.connect("default", host="localhost", port="19530")

# 定义字段
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1536),
    FieldSchema(name="source", dtype=DataType.VARCHAR, max_length=256)
]

# 定义 schema
schema = CollectionSchema(fields, "文档向量集合")

# 创建集合
collection = Collection("my_collection", schema)

# 创建索引
index_params = {
    "index_type": "HNSW",
    "metric_type": "COSINE",
    "params": {"M": 16, "efConstruction": 200}
}
collection.create_index("embedding", index_params)

# 插入数据
collection.insert([
    [1, 2],  # ids
    [[0.1]*1536, [0.2]*1536],  # embeddings
    ["file1", "file2"]  # sources
])

# 加载到内存
collection.load()

# 搜索
results = collection.search(
    data=[[0.15]*1536],
    anns_field="embedding",
    param={"metric_type": "COSINE", "params": {"ef": 100}},
    limit=3,
    expr="source == 'file1'"  # 元数据过滤
)
```

### 2.4 Pinecone

**特点：**
- ✅ 全托管云服务
- ✅ 无需运维
- ✅ 自动扩展
- ❌ 需要付费

**安装：**
```bash
pip install pinecone-client
```

**使用：**
```python
import pinecone

# 初始化
pinecone.init(api_key="your-api-key", environment="us-west1-gcp")

# 创建索引
pinecone.create_index(
    name="my-index",
    dimension=1536,
    metric="cosine"
)

# 连接索引
index = pinecone.Index("my-index")

# 上传向量
index.upsert([
    ("id1", [0.1, 0.2, ...], {"source": "file1"}),
    ("id2", [0.3, 0.4, ...], {"source": "file2"})
])

# 查询
results = index.query(
    vector=[0.15, 0.25, ...],
    top_k=3,
    filter={"source": "file1"},
    include_metadata=True
)

# 删除
index.delete(ids=["id1"])
```

### 2.5 Weaviate

**特点：**
- ✅ 向量 + 图数据库
- ✅ 支持 GraphQL
- ✅ 内置分类功能
- ❌ 学习曲线陡

**安装（Docker）：**
```bash
docker run -d -p 8080:8080 semitechnologies/weaviate
```

**使用：**
```python
import weaviate

# 连接
client = weaviate.Client("http://localhost:8080")

# 创建 schema
schema = {
    "classes": [
        {
            "class": "Document",
            "vectorizer": "none",
            "properties": [
                {"name": "source", "dataType": ["string"]},
                {"name": "content", "dataType": ["text"]}
            ]
        }
    ]
}
client.schema.create(schema)

# 添加数据
client.data_object.create(
    data_object={
        "source": "file1",
        "content": "文档内容"
    },
    class_name="Document",
    vector=[0.1, 0.2, ...]
)

# 查询
results = client.query.get(
    "Document",
    ["source", "content"]
).with_near_vector({
    "vector": [0.15, 0.25, ...]
}).with_limit(3).do()
```

---

## 3. 索引类型

### 3.1 常见索引

| 索引类型 | 说明 | 适用场景 |
|---------|------|---------|
| **IVF** | 倒排文件索引 | 中等规模 |
| **HNSW** | 层次导航图 | 高精度、快速 |
| **PQ** | 乘积量化 | 大规模、压缩 |
| **LSH** | 局部敏感哈希 | 近似搜索 |

### 3.2 HNSW 索引

**最常用的高性能索引**

```python
# Milvus HNSW 配置
index_params = {
    "index_type": "HNSW",
    "metric_type": "COSINE",
    "params": {
        "M": 16,              # 每个节点的最大连接数（4-64）
        "efConstruction": 200  # 构建时的搜索范围（100-500）
    }
}

# Qdrant HNSW 配置
hnsw_config = {
    "m": 16,
    "ef_construct": 200
}

# Pinecone HNSW 配置
# 自动配置，无需手动设置
```

**参数调优：**

| 参数 | 增大效果 | 减小效果 |
|------|---------|---------|
| **M** | 精度↑，内存↑ | 精度↓，内存↓ |
| **efConstruction** | 构建质量↑，时间↑ | 构建质量↓，时间↓ |
| **efSearch** | 搜索精度↑，速度↓ | 搜索精度↓，速度↑ |

### 3.3 IVF 索引

**适合中等规模数据**

```python
# Milvus IVF 配置
index_params = {
    "index_type": "IVF_FLAT",
    "metric_type": "COSINE",
    "params": {
        "nlist": 1024  # 聚类中心数量
    }
}

# 搜索参数
search_params = {
    "metric_type": "COSINE",
    "params": {
        "nprobe": 32  # 搜索的聚类数量
    }
}
```

---

## 4. 性能优化

### 4.1 批量操作

```python
# ❌ 低效：逐条插入
for i, vector in enumerate(vectors):
    collection.add(
        embeddings=[vector],
        documents=[docs[i]],
        ids=[f"id{i}"]
    )

# ✅ 高效：批量插入
batch_size = 100
for i in range(0, len(vectors), batch_size):
    batch_vectors = vectors[i:i+batch_size]
    batch_docs = docs[i:i+batch_size]
    batch_ids = [f"id{j}" for j in range(i, i+batch_size)]
    
    collection.add(
        embeddings=batch_vectors,
        documents=batch_docs,
        ids=batch_ids
    )
```

### 4.2 并行处理

```python
from concurrent.futures import ThreadPoolExecutor

def add_batch(batch_data):
    vectors, docs, ids = batch_data
    collection.add(
        embeddings=vectors,
        documents=docs,
        ids=ids
    )

# 并行插入
batches = [(vectors[i:i+100], docs[i:i+100], ids[i:i+100]) 
           for i in range(0, len(vectors), 100)]

with ThreadPoolExecutor(max_workers=4) as executor:
    executor.map(add_batch, batches)
```

### 4.3 缓存优化

```python
from functools import lru_cache

# 缓存查询结果
@lru_cache(maxsize=1000)
def cached_query(query_vector_tuple):
    query_vector = list(query_vector_tuple)
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=3
    )
    return results

# 使用
results = cached_query(tuple(query_vector))
```

---

## 5. 实战案例

### 5.1 文档检索系统

```python
import chromadb
from langchain.embeddings import OpenAIEmbeddings
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 1. 加载文档
loader = PyPDFLoader("document.pdf")
documents = loader.load()

# 2. 分割文档
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
texts = text_splitter.split_documents(documents)

# 3. 向量化
embeddings = OpenAIEmbeddings()
vectors = embeddings.embed_documents(
    [text.page_content for text in texts]
)

# 4. 存储到 Chroma
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection("documents")

# 批量添加
batch_size = 100
for i in range(0, len(vectors), batch_size):
    collection.add(
        embeddings=vectors[i:i+batch_size],
        documents=[texts[j].page_content for j in range(i, i+batch_size)],
        metadatas=[texts[j].metadata for j in range(i, i+batch_size)],
        ids=[f"doc_{j}" for j in range(i, i+batch_size)]
    )

# 5. 检索
def search(query, k=3):
    query_vector = embeddings.embed_query(query)
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=k,
        include=["documents", "metadatas"]
    )
    return results

# 使用
results = search("文档中提到了什么？")
```

### 5.2 推荐系统

```python
import pinecone
from langchain.embeddings import OpenAIEmbeddings

# 初始化
pinecone.init(api_key="your-key", environment="us-west1-gcp")
index = pinecone.Index("product-embeddings")

# 添加产品向量
def add_product(product_id, description, metadata):
    embedding = OpenAIEmbeddings().embed_query(description)
    index.upsert([(product_id, embedding, metadata)])

# 相似产品推荐
def recommend_similar(product_id, top_k=5):
    # 获取产品向量
    product = index.fetch(ids=[product_id])
    vector = product["vectors"][product_id]["values"]
    
    # 查询相似产品
    results = index.query(
        vector=vector,
        top_k=top_k + 1,  # +1 是因为会包含自己
        include_metadata=True,
        include_values=False
    )
    
    # 排除自己
    recommendations = [
        match for match in results["matches"] 
        if match["id"] != product_id
    ]
    
    return recommendations[:top_k]
```

### 5.3 语义搜索

```python
import weaviate
from langchain.embeddings import OpenAIEmbeddings

# 连接
client = weaviate.Client("http://localhost:8080")

# 创建 schema
schema = {
    "classes": [
        {
            "class": "Article",
            "vectorizer": "none",
            "properties": [
                {"name": "title", "dataType": ["string"]},
                {"name": "content", "dataType": ["text"]},
                {"name": "category", "dataType": ["string"]}
            ]
        }
    ]
}
client.schema.create(schema)

# 添加文章
def add_article(title, content, category):
    embedding = OpenAIEmbeddings().embed_query(f"{title} {content}")
    client.data_object.create(
        data_object={
            "title": title,
            "content": content,
            "category": category
        },
        class_name="Article",
        vector=embedding
    )

# 语义搜索
def semantic_search(query, category=None, limit=5):
    query_vector = OpenAIEmbeddings().embed_query(query)
    
    query_builder = client.query.get(
        "Article",
        ["title", "content", "category"]
    ).with_near_vector({
        "vector": query_vector
    }).with_limit(limit)
    
    if category:
        query_builder = query_builder.with_where({
            "path": ["category"],
            "operator": "Equal",
            "valueString": category
        })
    
    results = query_builder.do()
    return results["data"]["Get"]["Article"]
```

---

## 📝 练习题

### 基础题

1. **ChromaDB 使用**：使用 ChromaDB 创建集合、添加向量、查询

2. **相似度计算**：计算两个向量的余弦相似度

3. **元数据过滤**：在查询时使用元数据过滤条件

### 进阶题

4. **Milvus 部署**：使用 Docker 部署 Milvus 并创建索引

5. **性能优化**：实现批量插入和并行处理

6. **综合练习**：搭建一个完整的文档检索系统，支持 PDF 上传、向量化、存储、检索

---

## 🔗 参考资料

### 官方文档
- [ChromaDB 文档](https://docs.trychroma.com/)
- [Milvus 文档](https://milvus.io/docs)
- [Pinecone 文档](https://docs.pinecone.io/)
- [Weaviate 文档](https://weaviate.io/developers/weaviate)

### 学习资源
- 🔗 [向量数据库对比](https://www.pinecone.io/learn/vector-database/)
- 📚 《Vector Databases for AI》

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 向量数据库原理 | ⭐⭐⭐⭐⭐ | 理解掌握 |
| ChromaDB | ⭐⭐⭐⭐⭐ | 熟练运用 |
| Milvus | ⭐⭐⭐⭐ | 理解掌握 |
| 索引类型 | ⭐⭐⭐⭐ | 理解掌握 |
| 性能优化 | ⭐⭐⭐⭐ | 理解掌握 |

---

**上一章：** [RAG 基础](/ai/rag)  
**下一章：** [文档问答系统](/ai/rag-qa)

**最后更新**：2026-03-12
