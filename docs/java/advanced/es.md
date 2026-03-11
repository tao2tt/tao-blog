# Elasticsearch

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-06-10

---

## 📚 目录

[[toc]]
---

## 1. ES 概述

### 1.1 什么是 Elasticsearch

**Elasticsearch（ES）**：分布式搜索和分析引擎，基于 Lucene 构建。

**核心特点：**
- ✅ **分布式**：自动分片、副本
- ✅ **近实时**：秒级搜索
- ✅ **全文检索**：倒排索引
- ✅ **RESTful API**：JSON 格式
- ✅ **高可用**：自动故障转移

### 1.2 应用场景

| 场景 | 说明 | 示例 |
|------|------|------|
| **全文搜索** | 商品、文章搜索 | 电商搜索、站内搜索 |
| **日志分析** | ELK 架构 | 系统日志、应用日志 |
| **数据分析** | 实时分析 | 销售数据、用户行为 |
| **自动补全** | 搜索建议 | 搜索框提示 |
| **地理位置** | 附近搜索 | 附近的人、附近的店 |

### 1.3 ES vs MySQL

| 对比项 | MySQL | Elasticsearch |
|--------|-------|---------------|
| **用途** | 事务处理（OLTP） | 搜索分析（OLAP） |
| **查询** | SQL | DSL（Domain Specific Language） |
| **索引** | B+ 树 | 倒排索引 |
| **擅长** | 精确查询、事务 | 全文检索、聚合 |
| **不擅长** | 模糊查询（LIKE） | 事务、复杂 JOIN |

---

## 2. 核心概念

### 2.1 ES 架构

```
Cluster（集群）
└── Node（节点）
    └── Index（索引）
        └── Shard（分片）
            └── Document（文档）
                └── Field（字段）
```

### 2.2 核心概念

| 概念 | 说明 | MySQL 类比 |
|------|------|-----------|
| **Cluster** | 集群 | 数据库集群 |
| **Node** | 节点 | 数据库实例 |
| **Index** | 索引 | 数据库（Database） |
| **Type** | 类型（7.x 已废弃） | 表（Table） |
| **Document** | 文档 | 行（Row） |
| **Field** | 字段 | 列（Column） |
| **Shard** | 分片 | 分区 |
| **Replica** | 副本 | 主从复制 |

### 2.3 倒排索引

```
正排索引：ID → 内容
1: "Java 是世界上最好的语言"
2: "Python 是世界上最好的语言"

倒排索引：词 → ID 列表
Java: [1]
Python: [2]
世界：[1, 2]
最好：[1, 2]
语言：[1, 2]

搜索"Java" → 直接定位文档 1 ✅
```

---

## 3. 索引操作

### 3.1 创建索引

```bash
# PUT /index_name
PUT /product
{
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "id": { "type": "long" },
      "name": { 
        "type": "text",
        "analyzer": "ik_max_word",
        "search_analyzer": "ik_smart"
      },
      "price": { "type": "double" },
      "status": { "type": "integer" },
      "create_time": { 
        "type": "date",
        "format": "yyyy-MM-dd HH:mm:ss"
      }
    }
  }
}
```

### 3.2 查看索引

```bash
# 查看索引信息
GET /product

# 查看映射
GET /product/_mapping

# 查看设置
GET /product/_settings

# 查看所有索引
GET /_cat/indices?v
```

### 3.3 修改索引

```bash
# 添加字段（不能修改已有字段类型）
PUT /product/_mapping
{
  "properties": {
    "description": { 
      "type": "text",
      "analyzer": "ik_max_word"
    }
  }
}

# 关闭索引
POST /product/_close

# 打开索引
POST /product/_open

# 删除索引
DELETE /product
```

### 3.4 索引别名

```bash
# 创建别名
POST /_aliases
{
  "actions": [
    { "add": { "index": "product", "alias": "product_alias" } }
  ]
}

# 别名切换（零停机）
POST /_aliases
{
  "actions": [
    { "remove": { "index": "product_v1", "alias": "product_alias" } },
    { "add": { "index": "product_v2", "alias": "product_alias" } }
  ]
}
```

---

## 4. 文档操作

### 4.1 新增文档

```bash
# 指定 ID
PUT /product/_doc/1
{
  "id": 1,
  "name": "iPhone 15",
  "price": 7999.00,
  "status": 1,
  "create_time": "2026-03-11 10:00:00"
}

# 自动生成 ID
POST /product/_doc
{
  "name": "iPhone 15",
  "price": 7999.00
}

# 批量新增
POST /_bulk
{ "index": { "_index": "product", "_id": 1 } }
{ "id": 1, "name": "iPhone 15", "price": 7999 }
{ "index": { "_index": "product", "_id": 2 } }
{ "id": 2, "name": "Huawei Mate 60", "price": 6999 }
```

### 4.2 查询文档

```bash
# 根据 ID 查询
GET /product/_doc/1

# 批量查询
GET /_mget
{
  "docs": [
    { "_index": "product", "_id": 1 },
    { "_index": "product", "_id": 2 }
  ]
}
```

### 4.3 更新文档

```bash
# 全量更新（覆盖）
PUT /product/_doc/1
{
  "id": 1,
  "name": "iPhone 15 Pro",
  "price": 8999.00
}

# 部分更新
POST /product/_update/1
{
  "doc": {
    "price": 8999.00
  }
}

# 脚本更新
POST /product/_update/1
{
  "script": "ctx._source.price += 1000"
}

# 更新时不存在则创建（upsert）
POST /product/_update/1
{
  "doc": {
    "price": 8999.00
  },
  "upsert": {
    "id": 1,
    "name": "iPhone 15",
    "price": 7999.00
  }
}
```

### 4.4 删除文档

```bash
# 删除单个
DELETE /product/_doc/1

# 批量删除
POST /_bulk
{ "delete": { "_index": "product", "_id": 1 } }
{ "delete": { "_index": "product", "_id": 2 } }

# 按条件删除
POST /product/_delete_by_query
{
  "query": {
    "term": { "status": 0 }
  }
}
```

---

## 5. 查询 DSL

### 5.1 查询分类

```
查询类型：
1. 叶查询（Leaf Query）
   - 匹配字段：term、match、range

2. 复合查询（Compound Query）
   - 组合查询：bool、dis_max
```

### 5.2 匹配查询

```bash
# 精确查询（不分词）
GET /product/_search
{
  "query": {
    "term": { "status": 1 }
  }
}

# 全文查询（分词）
GET /product/_search
{
  "query": {
    "match": {
      "name": "iPhone"
    }
  }
}

# 短语查询（不分词，顺序一致）
GET /product/_search
{
  "query": {
    "match_phrase": {
      "name": "iPhone 15"
    }
  }
}

# 多字段查询
GET /product/_search
{
  "query": {
    "multi_match": {
      "query": "iPhone",
      "fields": ["name", "description"]
    }
  }
}
```

### 5.3 范围查询

```bash
# 数值范围
GET /product/_search
{
  "query": {
    "range": {
      "price": {
        "gte": 5000,
        "lte": 10000
      }
    }
  }
}

# 日期范围
GET /product/_search
{
  "query": {
    "range": {
      "create_time": {
        "gte": "2026-01-01 00:00:00",
        "lte": "2026-12-31 23:59:59"
      }
    }
  }
}
```

### 5.4 布尔查询

```bash
# must：必须匹配（AND）
# should：应该匹配（OR）
# must_not：必须不匹配（NOT）
# filter：过滤（不计算相关性得分）

GET /product/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "iPhone" } }
      ],
      "filter": [
        { "term": { "status": 1 } },
        { "range": { "price": { "gte": 5000, "lte": 10000 } } }
      ],
      "should": [
        { "match": { "description": "5G" } }
      ],
      "minimum_should_match": 1
    }
  }
}
```

### 5.5 精确查询

```bash
# terms 查询（IN）
GET /product/_search
{
  "query": {
    "terms": {
      "id": [1, 2, 3, 4, 5]
    }
  }
}

# exists 查询（IS NOT NULL）
GET /product/_search
{
  "query": {
    "exists": {
      "field": "description"
    }
  }
}
```

### 5.6 排序和分页

```bash
GET /product/_search
{
  "from": 0,
  "size": 10,
  "query": {
    "match": { "name": "iPhone" }
  },
  "sort": [
    { "price": { "order": "asc" } },
    { "create_time": { "order": "desc" } }
  ]
}

# 深分页问题（避免 > 10000）
GET /product/_search
{
  "from": 10000,
  "size": 10
}

# 使用 search_after（推荐）
GET /product/_search
{
  "size": 10,
  "query": { "match": { "name": "iPhone" } },
  "sort": [
    { "price": "asc" },
    { "id": "asc" }
  ],
  "search_after": [7999, 100]
}
```

### 5.7 高亮显示

```bash
GET /product/_search
{
  "query": {
    "match": { "name": "iPhone" }
  },
  "highlight": {
    "fields": {
      "name": {
        "pre_tags": ["<em style='color:red'>"],
        "post_tags": ["</em>"]
      }
    }
  }
}
```

### 5.8 通配符和正则

```bash
# 通配符（性能差，慎用）
GET /product/_search
{
  "query": {
    "wildcard": {
      "name": {
        "value": "i*one"
      }
    }
  }
}

# 正则查询
GET /product/_search
{
  "query": {
    "regexp": {
      "name": "i.*one"
    }
  }
}
```

---

## 6. 聚合分析

### 6.1 桶聚合（Bucket）

```bash
# 按状态分组
GET /product/_search
{
  "size": 0,
  "aggs": {
    "status_agg": {
      "terms": {
        "field": "status"
      }
    }
  }
}

# 价格区间分组
GET /product/_search
{
  "size": 0,
  "aggs": {
    "price_range": {
      "range": {
        "field": "price",
        "ranges": [
          { "to": 5000 },
          { "from": 5000, "to": 10000 },
          { "from": 10000 }
        ]
      }
    }
  }
}

# 日期直方图
GET /product/_search
{
  "size": 0,
  "aggs": {
    "sales_over_time": {
      "date_histogram": {
        "field": "create_time",
        "calendar_interval": "month"
      }
    }
  }
}
```

### 6.2 指标聚合（Metric）

```bash
# 统计信息
GET /product/_search
{
  "size": 0,
  "aggs": {
    "price_stats": {
      "stats": {
        "field": "price"
      }
    }
  }
}

# 平均值
GET /product/_search
{
  "size": 0,
  "aggs": {
    "avg_price": {
      "avg": {
        "field": "price"
      }
    }
  }
}

# 去重计数
GET /product/_search
{
  "size": 0,
  "aggs": {
    "uv": {
      "cardinality": {
        "field": "user_id"
      }
    }
  }
}
```

### 6.3 嵌套聚合

```bash
# 按状态分组，再计算每组的平均价格
GET /product/_search
{
  "size": 0,
  "aggs": {
    "status_agg": {
      "terms": {
        "field": "status"
      },
      "aggs": {
        "avg_price": {
          "avg": {
            "field": "price"
          }
        }
      }
    }
  }
}
```

---

## 7. 实战场景

### 7.1 商品搜索

```bash
# 综合搜索（名称 + 描述 + 价格过滤 + 排序）
GET /product/_search
{
  "from": 0,
  "size": 20,
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "手机",
            "fields": ["name^3", "description"]
          }
        }
      ],
      "filter": [
        { "term": { "status": 1 } },
        { "range": { "price": { "gte": 1000, "lte": 10000 } } }
      ]
    }
  },
  "sort": [
    { "_score": { "order": "desc" } },
    { "sales": { "order": "desc" } }
  ],
  "highlight": {
    "fields": {
      "name": {},
      "description": {}
    }
  }
}
```

### 7.2 自动补全

```bash
# 创建映射（completion 类型）
PUT /product
{
  "mappings": {
    "properties": {
      "suggest": {
        "type": "completion"
      }
    }
  }
}

# 添加数据
PUT /product/_doc/1
{
  "name": "iPhone 15",
  "suggest": {
    "input": ["iPhone 15", "iPhone", "苹果手机"],
    "weight": 100
  }
}

# 搜索建议
GET /product/_search
{
  "suggest": {
    "product-suggest": {
      "prefix": "iPh",
      "completion": {
        "field": "suggest",
        "size": 5
      }
    }
  }
}
```

### 7.3 数据同步（MySQL → ES）

```java
// SpringBoot + RestHighLevelClient
@Service
public class EsSyncService {
    
    @Autowired
    private RestHighLevelClient esClient;
    
    @Autowired
    private ProductMapper productMapper;
    
    // 全量同步
    public void fullSync() {
        List<Product> products = productMapper.selectAll();
        
        BulkRequest bulkRequest = new BulkRequest("product");
        for (Product product : products) {
            bulkRequest.add(new IndexRequest("product")
                .id(String.valueOf(product.getId()))
                .source(JSON.toJSONString(product), XContentType.JSON));
        }
        
        try {
            BulkResponse response = esClient.bulk(bulkRequest, RequestOptions.DEFAULT);
            if (response.hasFailures()) {
                log.error("同步失败：{}", response.buildFailureMessage());
            }
        } catch (IOException e) {
            log.error("ES 同步异常", e);
        }
    }
    
    // 增量同步
    public void incrementalSync(Long lastId) {
        List<Product> products = productMapper.selectIncremental(lastId);
        // ... 类似全量同步
    }
}
```

### 7.4 日志分析（ELK）

```
架构：
Filebeat → Kafka → Logstash → Elasticsearch → Kibana

Filebeat：采集日志
Kafka：消息缓冲
Logstash：过滤、转换
Elasticsearch：存储、分析
Kibana：可视化展示
```

---

## 8. 性能优化

### 8.1 写入优化

```
1. 批量写入（Bulk）
   - 每次 1000-5000 条
   - 大小 5-15MB

2. 增加刷新间隔
   - 默认 1s → 30s
   - refresh_interval: "30s"

3. 减少副本数
   - 写入时：0 副本
   - 写入完成：恢复副本

4. 使用自动生成的 ID
   - 避免检查 ID 是否存在
```

### 8.2 查询优化

```
1. 使用 filter 代替 query
   - filter 不计算相关性得分
   - 结果可缓存

2. 避免深分页
   - 使用 search_after
   - 限制最大页数

3. 字段折叠（_source filtering）
   - 只返回需要的字段
   - "_source": ["id", "name"]

4. 路由优化
   - 指定路由减少分片扫描
   - "routing": "user_123"
```

### 8.3 映射优化

```
1. 合理选择字段类型
   - 不用 text 存精确值
   - 使用 keyword 存枚举值

2. 禁用不必要的 _all 字段
   - "_all": { "enabled": false }

3. 设置合适的分词器
   - 中文：ik_max_word / ik_smart
   - 英文：standard

4. 关闭不需要的字段
   - "index": false
   - "doc_values": false
```

### 8.4 集群优化

```
1. 节点角色分离
   - Master 节点：3 个，不存数据
   - Data 节点：存数据
   - Coordinating 节点：协调查询

2. 分片策略
   - 单分片大小：20-50GB
   - 分片数：节点数的整数倍

3. 内存配置
   - Heap：50% 物理内存（不超过 32GB）
   - 剩余内存给 Lucene

4. 磁盘配置
   - 使用 SSD
   - 预留 15% 空间
```

---

## 💡 常见面试题

1. **ES 的工作原理？倒排索引原理？**
2. **ES 写入数据流程？**
3. **ES 查询数据流程？**
4. **分片和副本的作用？**
5. **ES 如何保证高可用？**
6. **深分页问题及解决方案？**
7. **ES 和 MySQL 的区别？**
8. **ES 聚合分析如何使用？**
9. **ES 性能优化有哪些？**
10. **数据同步方案？**

---

## 📚 参考资料

- 《Elasticsearch 权威指南》
- 《Elasticsearch 实战》
- [Elasticsearch 官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Elasticsearch 源码](https://github.com/elastic/elasticsearch)

---

> 💡 **学习建议**：ES 是搜索和数据分析必备技能，建议：
> 1. 掌握核心概念（倒排索引、分片、副本）
> 2. 熟练使用 DSL 查询
> 3. 实战项目练习（商品搜索、日志分析）
> 4. 学习性能优化和集群调优
