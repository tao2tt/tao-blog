# 向量数据库

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-03-29

---

## 📚 目录

[[toc]]

---

## 1. 什么是向量数据库

### 1.1 概念

专门存储和检索向量数据的数据库，支持相似度搜索

### 1.2 为什么需要向量数据库

- 高维向量存储
- 快速相似度搜索
- 大规模索引

---

## 2. 向量相似度

### 2.1 余弦相似度

```python
from sklearn.metrics.pairwise import cosine_similarity

similarity = cosine_similarity([vec1], [vec2])[0][0]
```

### 2.2 欧氏距离

### 2.3 点积

---

## 3. 主流向量数据库

| 数据库 | 类型 | 特点 | 适用场景 |
|--------|------|------|---------|
| **Chroma** | 嵌入式 | 轻量、易用 | 本地开发、小规模 |
| **Milvus** | 分布式 | 高性能、可扩展 | 生产环境、大规模 |
| **Pinecone** | 云服务 | 托管、免运维 | 快速上线 |
| **Weaviate** | 混合 | 向量 + 图 | 知识图谱 |
| **Qdrant** | 分布式 | 过滤能力强 | 复杂查询 |

---

## 4. ChromaDB 实战

### 4.1 安装

```bash
pip install chromadb
```

### 4.2 基础使用

```python
import chromadb

# 创建客户端
client = chromadb.Client()

# 创建集合
collection = client.create_collection("my_collection")

# 添加向量
collection.add(
    embeddings=[[0.1, 0.2, ...], [0.3, 0.4, ...]],
    documents=["文档 1", "文档 2"],
    ids=["id1", "id2"],
    metadatas=[{"source": "file1"}, {"source": "file2"}]
)

# 查询
results = collection.query(
    query_embeddings=[[0.15, 0.25, ...]],
    n_results=3
)
```

### 4.3 持久化

```python
client = chromadb.PersistentClient(path="./chroma_db")
```

---

## 5. Milvus 实战

### 5.1 安装（Docker）

```bash
docker run -d --name milvus -p 19530:19530 milvusdb/milvus:latest
```

### 5.2 连接

```python
from pymilvus import connections, Collection

connections.connect("default", host="localhost", port="19530")
```

### 5.3 创建集合

```python
from pymilvus import FieldSchema, CollectionSchema, DataType

fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1536)
]
schema = CollectionSchema(fields)
collection = Collection("my_collection", schema)
```

---

## 6. 性能优化

### 6.1 索引类型

- **IVF**：倒排文件索引
- **HNSW**：层次导航图
- **PQ**：乘积量化

### 6.2 参数调优

```python
index_params = {
    "index_type": "HNSW",
    "metric_type": "COSINE",
    "params": {"M": 16, "efConstruction": 200}
}
```

---

## 📝 练习题

1. 使用 ChromaDB 构建文档检索系统
2. 对比不同向量数据库的性能
3. 实现混合检索（向量 + 元数据过滤）

---

## 🔗 参考资料

- [ChromaDB 文档](https://docs.trychroma.com/)
- [Milvus 文档](https://milvus.io/docs)

---

**最后更新**：2026-03-12
