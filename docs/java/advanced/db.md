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

## 10. 实战案例

### 10.1 案例 1：订单查询优化

**场景：** 订单列表查询慢（平均 3 秒）

```sql
-- 原始 SQL
SELECT * FROM `order` 
WHERE user_id = 1001 
  AND status IN (1, 2, 3) 
  AND create_time >= '2026-01-01'
ORDER BY create_time DESC
LIMIT 0, 10;

-- EXPLAIN 分析
EXPLAIN SELECT * FROM `order` 
WHERE user_id = 1001 
  AND status IN (1, 2, 3) 
  AND create_time >= '2026-01-01'
ORDER BY create_time DESC
LIMIT 0, 10;

-- 结果：
-- type: ALL（全表扫描）
-- key: NULL（未使用索引）
-- rows: 5000000（扫描 500 万行）
-- Extra: Using where; Using filesort（文件排序）

-- 优化方案 1：添加联合索引
CREATE INDEX idx_user_status_time ON `order`(user_id, status, create_time);

-- 优化后 EXPLAIN：
-- type: ref
-- key: idx_user_status_time
-- rows: 100（扫描 100 行）
-- Extra: Using where

-- 优化效果：3000ms → 50ms
```

### 10.2 案例 2：深分页优化

**场景：** 订单列表翻到第 10000 页时查询慢（8 秒）

```sql
-- 原始 SQL（深分页）
SELECT * FROM `order` 
ORDER BY create_time DESC 
LIMIT 999900, 10;

-- 问题分析：
-- MySQL 需要扫描 999910 行，丢弃前 999900 行，只取 10 行
-- 效率极低

-- 优化方案 1：延迟关联
SELECT o.* FROM `order` o
INNER JOIN (
    SELECT id FROM `order` 
    ORDER BY create_time DESC 
    LIMIT 999900, 10
) tmp ON o.id = tmp.id;

-- 优化效果：8000ms → 500ms

-- 优化方案 2：记录上次 ID（适用于连续翻页）
SELECT * FROM `order` 
WHERE create_time < '2026-01-01 00:00:00' 
  AND id < 999900
ORDER BY create_time DESC, id DESC
LIMIT 10;

-- 优化效果：8000ms → 100ms

-- 优化方案 3：业务限制
-- 最多允许翻 100 页（1000 条数据）
-- 引导用户使用搜索/筛选功能
```

### 10.3 案例 3：批量插入优化

**场景：** 导入 10 万条订单数据，耗时 30 分钟

```sql
-- 原始方式：逐条插入
for (Order order : orders) {
    orderMapper.insert(order);  // 10 万次数据库交互
}
-- 耗时：30 分钟

-- 优化方案 1：批量插入
-- 每 1000 条提交一次
List<Order> batch = new ArrayList<>(1000);
for (int i = 0; i < orders.size(); i++) {
    batch.add(orders.get(i));
    if (i % 1000 == 0 || i == orders.size() - 1) {
        orderMapper.insertBatch(batch);  // 100 次数据库交互
        batch.clear();
    }
}
-- 耗时：2 分钟

-- 优化方案 2：事务批处理
@Transactional
public void batchInsert(List<Order> orders) {
    SqlSession sqlSession = sqlSessionTemplate.getSqlSessionFactory()
        .openSession(ExecutorType.BATCH);
    try {
        OrderMapper mapper = sqlSession.getMapper(OrderMapper.class);
        for (Order order : orders) {
            mapper.insert(order);
        }
        sqlSession.flushStatements();
        sqlSession.commit();
    } finally {
        sqlSession.close();
    }
}
-- 耗时：30 秒

-- 优化方案 3：LOAD DATA（最快）
-- 将数据导出为 CSV，使用 LOAD DATA INFILE
LOAD DATA LOCAL INFILE '/tmp/orders.csv'
INTO TABLE `order`
FIELDS TERMINATED BY ',' 
LINES TERMINATED BY '\n'
(user_id, order_no, amount, status, create_time);
-- 耗时：5 秒
```

### 10.4 案例 4：死锁排查

**场景：** 订单更新偶尔报错"Deadlock found"

```sql
-- 1. 查看死锁日志
SHOW ENGINE INNODB STATUS\G

-- 输出：
------------------------
LATEST DETECTED DEADLOCK
------------------------
*** (1) TRANSACTION:
TRANSACTION 12345, ACTIVE 0 sec starting index read
mysql tables in use 1, locked 1
LOCK WAIT 2 lock struct(s), heap size 1136, 1 row lock(s)
MySQL thread id 100, OS thread handle 123456, query id 789 updating
UPDATE `order` SET status = 2 WHERE id = 1001

*** (1) HOLDS THE LOCK(S):
RECORD LOCKS space id 1 page no 100 n bits 72 index PRIMARY of table `order`
trx id 12345 lock_mode X locks rec but not gap
Record lock, heap no 5 PHYSICAL RECORD: n_fields 10
0: sup_hex 8; 1: 1001; ...

*** (1) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 1 page no 200 n bits 72 index PRIMARY of table `order`
trx id 12345 lock_mode X locks rec but not gap waiting
Record lock, heap no 10 PHYSICAL RECORD: n_fields 10
0: sup_hex 8; 1: 1002; ...

*** (2) TRANSACTION:
TRANSACTION 12346, ACTIVE 0 sec starting index read
mysql tables in use 1, locked 1
LOCK WAIT 2 lock struct(s), heap size 1136, 1 row lock(s)
MySQL thread id 101, OS thread handle 123457, query id 790 updating
UPDATE `order` SET status = 2 WHERE id = 1002

*** (2) HOLDS THE LOCK(S):
RECORD LOCKS space id 1 page no 200 n bits 72 index PRIMARY of table `order`
trx id 12346 lock_mode X locks rec but not gap
Record lock, heap no 10 PHYSICAL RECORD: n_fields 10
0: sup_hex 8; 1: 1002; ...

*** (2) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 1 page no 100 n bits 72 index PRIMARY of table `order`
trx id 12346 lock_mode X locks rec but not gap waiting
Record lock, heap no 5 PHYSICAL RECORD: n_fields 10
0: sup_hex 8; 1: 1001; ...

*** WE ROLL BACK TRANSACTION (1)

-- 2. 分析原因
-- 事务 1：更新 id=1001 → 更新 id=1002
-- 事务 2：更新 id=1002 → 更新 id=1001
-- 形成环路，产生死锁

-- 3. 解决方案
-- 方案 1：固定更新顺序（按 ID 从小到大）
public void updateOrders(List<Long> orderIds) {
    Collections.sort(orderIds);  // 排序
    for (Long id : orderIds) {
        orderMapper.updateStatus(id, 2);
    }
}

-- 方案 2：使用 UPDATE ... WHERE id IN (...)
UPDATE `order` SET status = 2 WHERE id IN (1001, 1002);

-- 方案 3：降低隔离级别（SET TRANSACTION ISOLATION LEVEL READ COMMITTED）
```

### 10.5 案例 5：主从延迟优化

**场景：** 主从复制延迟 30 秒，用户刚下的订单查不到

```sql
-- 1. 查看主从状态
SHOW SLAVE STATUS\G

-- 关键指标：
-- Slave_IO_Running: Yes
-- Slave_SQL_Running: Yes
-- Seconds_Behind_Master: 30  (延迟 30 秒)

-- 2. 分析原因
-- - 主库并发高，从库单线程回放
-- - 从库有大事务/慢查询
-- - 网络延迟

-- 3. 解决方案

-- 方案 1：并行复制（MySQL 5.7+）
SET GLOBAL slave_parallel_workers = 4;  -- 4 个回放线程
SET GLOBAL slave_parallel_type = 'LOGICAL_CLOCK';

-- 方案 2：业务层面解决
-- 写完主库后，强制读主库
public Order getOrder(Long orderId) {
    Order order = orderMapper.selectById(orderId);
    if (order == null) {
        // 主库重试
        DataSourceContextHolder.setMaster();
        order = orderMapper.selectById(orderId);
    }
    return order;
}

-- 方案 3：延迟双删缓存
@Transactional
public void updateOrder(Order order) {
    // 1. 删除缓存
    redisTemplate.delete("order:" + order.getId());
    
    // 2. 更新数据库
    orderMapper.updateById(order);
    
    // 3. 延迟再次删除（等待主从同步）
    taskScheduler.schedule(
        () -> redisTemplate.delete("order:" + order.getId()),
        Instant.now().plusMillis(500)
    );
}

-- 方案 4：接受最终一致性
-- 产品层面引导："数据同步中，请稍后查看"
```

---

## 📝 实战清单

**索引优化：**
- [ ] 理解 B+ 树原理
- [ ] 掌握聚簇/非聚簇索引
- [ ] 联合索引设计（最左前缀）
- [ ] 覆盖索引使用
- [ ] 索引失效场景识别

**SQL 优化：**
- [ ] EXPLAIN 执行计划分析
- [ ] 慢查询日志分析
- [ ] 深分页优化
- [ ] JOIN 优化
- [ ] 子查询优化
- [ ] UNION 优化

**事务锁：**
- [ ] 事务 ACID 理解
- [ ] 隔离级别选择
- [ ] MVCC 原理
- [ ] 行锁/表锁/间隙锁
- [ ] 死锁排查与预防

**架构优化：**
- [ ] 主从复制配置
- [ ] 读写分离实现
- [ ] 分库分表方案
- [ ] 数据库连接池优化

**运维监控：**
- [ ] 慢查询监控
- [ ] 锁等待监控
- [ ] 主从延迟监控
- [ ] 性能基准测试

---

**推荐资源：**
- 📚 《高性能 MySQL》（第 4 版）
- 📚 《MySQL 技术内幕：InnoDB 存储引擎》
- 📚 《数据库索引设计与优化》
- 📖 MySQL 官方文档：https://dev.mysql.com/doc/
- 🛠️ pt-query-digest：https://www.percona.com/software/database-tools/percona-toolkit
- 🛠️ MySQLTuner：https://github.com/major/MySQLTuner-perl
