# 数据库优化

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-06-05

---

## 📚 目录

[[toc]]
---

## 1. MySQL 架构

### 1.1 MySQL 逻辑架构

```
Client → Connection Pool → SQL Interface → Parser → Optimizer → Cache → Storage Engine

Storage Engines:
- InnoDB（默认）：事务、行锁、外键
- MyISAM：不支持事务、表锁
- Memory：内存存储
```

### 1.2 InnoDB 存储引擎

```
InnoDB 特性：
- 事务支持（ACID）
- 行级锁
- MVCC（多版本并发控制）
- 聚簇索引
- 外键约束
```

---

## 2. 索引优化

### 2.1 索引类型

| 类型 | 说明 | 特点 |
|------|------|------|
| **主键索引** | PRIMARY KEY | 唯一、非空、聚簇索引 |
| **唯一索引** | UNIQUE KEY | 唯一、允许 NULL |
| **普通索引** | KEY/INDEX | 无限制 |
| **联合索引** | KEY(a,b,c) | 最左前缀原则 |
| **全文索引** | FULLTEXT | 全文搜索 |

### 2.2 B+ 树原理

```
B+ 树特点：
1. 非叶子节点只存储 key，不存储数据
2. 叶子节点存储所有数据，形成有序链表
3. 树高度低（通常 3-4 层）
4. 范围查询高效

为什么用 B+ 树？
- 减少 IO 次数（树高度低）
- 范围查询快（叶子节点链表）
- 查询性能稳定
```

### 2.3 索引优化原则

```
✅ 创建索引：
1. 频繁查询的字段
2. WHERE、JOIN、ORDER BY、GROUP BY 字段
3. 区分度高的字段

❌ 避免索引：
1. 频繁更新的字段
2. 区分度低的字段（性别、状态）
3. 文本字段（TEXT、BLOB）
4. 小表（< 1000 行）
```

### 2.4 最左前缀原则

```sql
-- 联合索引：idx_name_age_position(name, age, position)

-- ✅ 可以使用索引
WHERE name = '张三'
WHERE name = '张三' AND age = 25
WHERE name = '张三' AND age = 25 AND position = '开发'
WHERE name = '张三' AND position = '开发'  -- 跳过 age，position 失效

-- ❌ 不能使用索引
WHERE age = 25
WHERE position = '开发'
WHERE age = 25 AND position = '开发'
```

### 2.5 索引失效场景

```sql
-- 1. 函数操作
WHERE YEAR(create_time) = 2026  -- ❌
WHERE create_time >= '2026-01-01' AND create_time < '2027-01-01'  -- ✅

-- 2. 类型转换
WHERE phone = 13800138000  -- ❌（phone 是字符串）
WHERE phone = '13800138000'  -- ✅

-- 3. 模糊查询
WHERE name LIKE '%张%'  -- ❌
WHERE name LIKE '张%'  -- ✅

-- 4. OR 条件
WHERE name = '张三' OR age = 25  -- ❌（age 无索引）
WHERE name = '张三' OR age = 25  -- ✅（都有索引）

-- 5. NOT、!=、<>
WHERE age != 25  -- ❌
WHERE age > 25  -- ✅

-- 6. IS NULL、IS NOT NULL
WHERE age IS NULL  -- ⚠️（可能失效）
```

### 2.6 覆盖索引

```sql
-- 查询：SELECT id, name FROM user WHERE name = '张三'

-- 创建索引：idx_name(name)
-- 执行：索引扫描，无需回表 ✅

-- 查询：SELECT id, name, age FROM user WHERE name = '张三'

-- 创建索引：idx_name_age(name, age)
-- 执行：覆盖索引，无需回表 ✅
```

### 2.7 索引下推

```sql
-- MySQL 5.6+ 特性

-- 查询：SELECT * FROM user WHERE name LIKE '张%' AND age = 25

-- 索引下推前：
-- 1. 索引扫描 name = '张%'
-- 2. 回表查询 age
-- 3. 过滤 age = 25

-- 索引下推后：
-- 1. 索引扫描 name = '张%' AND age = 25
-- 2. 回表查询 ✅（减少回表次数）
```

---

## 3. SQL 优化

### 3.1 EXPLAIN 分析

```sql
EXPLAIN SELECT * FROM user WHERE name = '张三';

-- 输出说明：
-- id: 查询序号
-- select_type: 查询类型（SIMPLE、PRIMARY、SUBQUERY 等）
-- table: 表名
-- type: 连接类型（system > const > eq_ref > ref > range > index > ALL）
-- possible_keys: 可能使用的索引
-- key: 实际使用的索引
-- key_len: 索引长度
-- ref: 关联字段
-- rows: 扫描行数
-- Extra: 额外信息
```

### 3.2 连接类型（type）

```
type 性能从好到差：
1. system：只有一行
2. const：主键/唯一索引查询
3. eq_ref：主键/唯一索引关联
4. ref：普通索引关联
5. range：范围查询
6. index：索引全扫描
7. ALL：全表扫描（最差）

目标：至少达到 range，最好 ref 或更高
```

### 3.3 Extra 说明

```
✅ 好的 Extra：
- Using index：覆盖索引
- Using where：WHERE 过滤

❌ 差的 Extra：
- Using filesort：文件排序
- Using temporary：临时表
- Using index condition：索引下推（5.6+）
```

### 3.4 ORDER BY 优化

```sql
-- ✅ 可以使用索引
SELECT * FROM user ORDER BY name;  -- name 有索引
SELECT * FROM user WHERE name = '张三' ORDER BY age;  -- idx_name_age

-- ❌ 无法使用索引
SELECT * FROM user ORDER BY name LIMIT 10000, 10;  -- 深分页
SELECT * FROM user WHERE name LIKE '%张%' ORDER BY age;  -- 模糊查询
```

### 3.5 GROUP BY 优化

```sql
-- MySQL 8.0+
-- GROUP BY 默认排序，可添加 ORDER BY NULL 避免排序

SELECT name, COUNT(*) FROM user GROUP BY name ORDER BY NULL;
```

### 3.6 LIMIT 优化

```sql
-- ❌ 深分页（慢）
SELECT * FROM user LIMIT 100000, 10;

-- ✅ 优化 1：子查询
SELECT * FROM user 
WHERE id >= (SELECT id FROM user LIMIT 100000, 1)
LIMIT 10;

-- ✅ 优化 2：延迟关联
SELECT u.* FROM user u
INNER JOIN (SELECT id FROM user LIMIT 100000, 10) tmp ON u.id = tmp.id;

-- ✅ 优化 3：记录上次 ID
SELECT * FROM user WHERE id > 100000 LIMIT 10;
```

### 3.7 UNION 优化

```sql
-- ❌ UNION ALL 性能优于 UNION
SELECT * FROM user WHERE name = '张三'
UNION ALL
SELECT * FROM user WHERE age = 25;

-- UNION 会去重，需要额外排序
-- UNION ALL 不去重，性能更好
```

---

## 4. 表设计优化

### 4.1 范式与反范式

```
三范式：
1NF：字段不可再分
2NF：非主键字段完全依赖主键
3NF：非主键字段不依赖其他非主键字段

反范式：
- 适当冗余，减少 JOIN
- 以空间换时间
```

### 4.2 字段设计

```
✅ 推荐：
1. 选择合适的数据类型（越小越好）
2. 尽量 NOT NULL（设置默认值）
3. 使用 ENUM 代替字符串（状态字段）
4. 金额用 DECIMAL，不用 FLOAT/DOUBLE

❌ 避免：
1. TEXT/BLOB（单独建表）
2. 过多字段（> 50 个考虑垂直拆分）
3. 浪费空间（INT 存 0/1）
```

### 4.3 垂直拆分

```sql
-- 原表：user(id, name, age, email, phone, address, description, ...)

-- 拆分：
-- user_base(id, name, age, email, phone)
-- user_extend(user_id, address, description, ...)

-- 优点：
-- 1. 减少主表字段，提高查询效率
-- 2. 冷热数据分离
```

### 4.4 水平拆分

```sql
-- 按 ID 取模
user_0: id % 10 = 0
user_1: id % 10 = 1
...

-- 按时间范围
order_202601: 2026-01 订单
order_202602: 2026-02 订单
...
```

---

## 5. 主从复制

### 5.1 复制原理

```
Master → Binlog → Slave IO Thread → Relay Log → Slave SQL Thread → Data

1. Master 记录 Binlog
2. Slave IO Thread 读取 Binlog 到 Relay Log
3. Slave SQL Thread 执行 Relay Log 中的 SQL
```

### 5.2 复制模式

```
1. 异步复制（默认）
   - Master 不等待 Slave 确认
   - 性能最好，可能丢失数据

2. 半同步复制
   - Master 等待至少 1 个 Slave 确认
   - 性能和安全性平衡

3. 全同步复制（MGR）
   - Master 等待所有 Slave 确认
   - 最安全，性能最差
```

### 5.3 读写分离

```java
// ShardingSphere 配置
spring:
  shardingsphere:
    datasource:
      names: master,slave0,slave1
      master:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://master:3306/mydb
      slave0:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://slave0:3306/mydb
      slave1:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://slave1:3306/mydb
    
    rules:
      readwrite-splitting:
        data-groups:
          pr_ds:
            write-data-source-name: master
            read-data-source-names: slave0,slave1
            load-balancer-name: round_robin
```

---

## 6. 分库分表

### 6.1 分片策略

```
1. 哈希分片
   - id % 分片数
   - 数据分布均匀
   - 扩容困难

2. 范围分片
   - 按时间、ID 范围
   - 扩容容易
   - 数据可能倾斜

3. 地理分片
   - 按地区、城市
   - 适合本地化业务
```

### 6.2 ShardingSphere 整合

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.apache.shardingsphere</groupId>
    <artifactId>shardingsphere-jdbc-core-spring-boot-starter</artifactId>
    <version>5.3.2</version>
</dependency>
```

```yaml
# application.yml
spring:
  shardingsphere:
    datasource:
      names: ds0,ds1
      ds0:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://ds0:3306/db0
      ds1:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://ds1:3306/db1
    
    rules:
      sharding:
        tables:
          order:
            actual-data-nodes: ds$->{0..1}.order$->{0..3}
            table-strategy:
              standard:
                sharding-column: user_id
                sharding-algorithm-name: order-table-algorithm
            key-generate-strategy:
              column: id
              key-generator-name: snowflake
        
        sharding-algorithms:
          order-table-algorithm:
            type: CLASS_BASED
            props:
              strategy: STANDARD
              algorithm-class: com.example.sharding.OrderTableShardingAlgorithm
        
        key-generators:
          snowflake:
            type: SNOWFLAKE
```

### 6.3 分片后问题

```
1. 分布式 ID
   - 雪花算法（Snowflake）
   - 号段模式

2. 跨库 JOIN
   - 字段冗余
   - 应用层组装
   - 全局表

3. 分布式事务
   - Seata
   - 消息最终一致性

4. 排序分页
   - 归并排序
   - 限制最大页数
```

---

## 7. 实战案例

### 7.1 慢查询优化

```sql
-- 1. 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- 超过 1 秒

-- 2. 查看慢查询
SELECT * FROM mysql.slow_log;

-- 3. 使用 mysqldumpslow 分析
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log

-- 4. EXPLAIN 分析
EXPLAIN SELECT * FROM order WHERE user_id = 123 AND status = 1;

-- 5. 优化
CREATE INDEX idx_user_status ON order(user_id, status);
```

### 7.2 死锁排查

```sql
-- 1. 查看死锁
SHOW ENGINE INNODB STATUS;

-- 2. 查看锁等待
SELECT * FROM information_schema.innodb_lock_waits;

-- 3. 查看锁信息
SELECT * FROM information_schema.innodb_locks;

-- 4. 查看进程
SHOW PROCESSLIST;

-- 5. 杀死进程
KILL <thread_id>;

-- 预防：
-- 1. 统一访问顺序
-- 2. 减少锁粒度
-- 3. 降低隔离级别
```

### 7.3 大表优化

```sql
-- 场景：order 表 1 亿条数据，查询慢

-- 方案 1：历史数据归档
CREATE TABLE order_history LIKE order;
INSERT INTO order_history SELECT * FROM order WHERE create_time < '2025-01-01';
DELETE FROM order WHERE create_time < '2025-01-01';

-- 方案 2：分区表
ALTER TABLE order PARTITION BY RANGE (YEAR(create_time)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027)
);

-- 方案 3：分库分表
-- 使用 ShardingSphere 按 user_id 分片
```

---

## 💡 常见面试题

1. **MySQL 索引数据结构？为什么用 B+ 树？**
2. **聚簇索引和非聚簇索引的区别？**
3. **最左前缀原则是什么？**
4. **索引失效的场景有哪些？**
5. **SQL 优化步骤？**
6. **EXPLAIN 各字段含义？**
7. **事务隔离级别？**
8. **MVCC 原理？**
9. **主从复制原理？**
10. **分库分表策略？**

---

## 📚 参考资料

- 《高性能 MySQL》
- 《MySQL 技术内幕：InnoDB 存储引擎》
- 《数据库索引设计与优化》
- [MySQL 官方文档](https://dev.mysql.com/doc/)

---

> 💡 **学习建议**：数据库优化是高级开发必备技能，建议：
> 1. 理解索引原理（B+ 树）
> 2. 掌握 EXPLAIN 分析
> 3. 实战慢查询优化
> 4. 学习分库分表（ShardingSphere）
