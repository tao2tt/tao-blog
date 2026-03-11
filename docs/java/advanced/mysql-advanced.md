# MySQL 进阶

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-05-05

---

## 📚 目录

[[toc]]

---

## 1. 索引原理

### 1.1 索引数据结构

**B+Tree：**
- 非叶子节点只存储索引，不存储数据
- 叶子节点存储所有数据，形成有序链表
- 查询效率稳定，O(log n)

**聚簇索引 vs 非聚簇索引：**
- 聚簇索引：数据与索引存储在一起（InnoDB 主键索引）
- 非聚簇索引：索引与数据分开存储（二级索引）

### 1.2 索引类型

| 类型 | 说明 | 特点 |
|------|------|------|
| PRIMARY KEY | 主键索引 | 唯一、非空、聚簇索引 |
| UNIQUE | 唯一索引 | 唯一、允许 NULL |
| INDEX/KEY | 普通索引 | 无限制 |
| FULLTEXT | 全文索引 | 用于文本搜索 |
| SPATIAL | 空间索引 | 用于地理数据 |

### 1.3 索引优化原则

```sql
-- ✅ 最左前缀原则
CREATE INDEX idx_name_age ON user(name, age);
SELECT * FROM user WHERE name = '张三';           -- 使用索引
SELECT * FROM user WHERE name = '张三' AND age = 25; -- 使用索引
SELECT * FROM user WHERE age = 25;                -- 不使用索引

-- ✅ 覆盖索引
SELECT id, name FROM user WHERE name = '张三';  -- 只查询索引列

-- ❌ 索引失效场景
SELECT * FROM user WHERE YEAR(create_time) = 2026;  -- 函数操作
SELECT * FROM user WHERE name LIKE '%张%';          -- 前缀模糊
SELECT * FROM user WHERE name != '张三';            -- 不等于
SELECT * FROM user WHERE name = '张三' OR age = 25; -- OR 条件
```

---

## 2. 事务隔离

### 2.1 事务 ACID

| 特性 | 说明 |
|------|------|
| Atomicity（原子性） | 事务要么全部成功，要么全部失败 |
| Consistency（一致性） | 事务前后数据保持一致 |
| Isolation（隔离性） | 事务之间互不干扰 |
| Durability（持久性） | 事务提交后永久保存 |

### 2.2 隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|----------|------|------------|--------|
| READ UNCOMMITTED | ✅ | ✅ | ✅ |
| READ COMMITTED | ❌ | ✅ | ✅ |
| REPEATABLE READ（MySQL 默认） | ❌ | ❌ | ❌* |
| SERIALIZABLE | ❌ | ❌ | ❌ |

*MySQL 通过 MVCC + Next-Key Lock 解决幻读

### 2.3 MVCC 原理

```
MVCC（Multi-Version Concurrency Control）多版本并发控制

实现原理：
1. 每行数据有隐藏列：DB_TRX_ID（事务 ID）、DB_ROLL_PTR（回滚指针）
2. Undo Log 保存历史版本
3. Read View 判断版本可见性

READ COMMITTED：每次查询生成新的 Read View
REPEATABLE READ：第一次查询生成 Read View，事务内复用
```

---

## 3. 锁机制

### 3.1 锁类型

| 锁类型 | 说明 | 粒度 |
|--------|------|------|
| 共享锁（S 锁） | 读锁，可多个事务同时持有 | 行/表 |
| 排他锁（X 锁） | 写锁，只能一个事务持有 | 行/表 |
| 意向锁 | 表级锁，表示要加行锁 | 表 |

### 3.2 InnoDB 行锁

| 锁类型 | 说明 |
|--------|------|
| Record Lock | 锁住索引记录 |
| Gap Lock | 锁住索引间隙，防止幻读 |
| Next-Key Lock | Record Lock + Gap Lock |

### 3.3 锁查询

```sql
-- 查看锁信息
SELECT * FROM information_schema.innodb_locks;
SELECT * FROM information_schema.innodb_lock_waits;
SELECT * FROM information_schema.innodb_trx;

-- 查看锁等待
SELECT 
    blocking_trx.trx_id AS blocking_id,
    blocked_trx.trx_id AS blocked_id,
    blocking_trx.trx_query AS blocking_query,
    blocked_trx.trx_query AS blocked_query
FROM information_schema.innodb_lock_waits w
JOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id
JOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id;
```

---

## 4. SQL 优化

### 4.1 EXPLAIN 分析

```sql
EXPLAIN SELECT * FROM user WHERE name = '张三';
```

| 字段 | 说明 |
|------|------|
| id | 执行顺序 |
| select_type | 查询类型（SIMPLE、PRIMARY、SUBQUERY 等） |
| type | 访问类型（system > const > eq_ref > ref > range > index > ALL） |
| possible_keys | 可能使用的索引 |
| key | 实际使用的索引 |
| key_len | 索引长度 |
| ref | 索引哪一列被使用 |
| rows | 扫描行数 |
| Extra | 额外信息（Using index、Using where、Using temporary 等） |

### 4.2 优化案例

```sql
-- ❌ 优化前：全表扫描
SELECT * FROM order WHERE YEAR(create_time) = 2026;

-- ✅ 优化后：使用索引
SELECT * FROM order 
WHERE create_time >= '2026-01-01' AND create_time < '2027-01-01';

-- ❌ 优化前：OR 导致索引失效
SELECT * FROM user WHERE name = '张三' OR email = 'zhang@example.com';

-- ✅ 优化后：UNION ALL
SELECT * FROM user WHERE name = '张三'
UNION ALL
SELECT * FROM user WHERE email = 'zhang@example.com' AND name <> '张三';

-- ❌ 优化前：深分页
SELECT * FROM order ORDER BY create_time DESC LIMIT 100000, 10;

-- ✅ 优化后：延迟关联
SELECT o.* FROM order o
INNER JOIN (SELECT id FROM order ORDER BY create_time DESC LIMIT 100000, 10) tmp
ON o.id = tmp.id;
```

---

## 5. 主从复制

### 5.1 复制原理

```
1. Master 将数据变更写入 Binlog
2. Slave 的 I/O 线程读取 Binlog 写入 Relay Log
3. Slave 的 SQL 线程读取 Relay Log 重放
```

### 5.2 配置主从

```sql
-- Master 配置
[mysqld]
server-id=1
log-bin=mysql-bin
binlog-format=ROW

-- 创建复制用户
CREATE USER 'repl'@'%' IDENTIFIED BY 'password';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';

-- Slave 配置
[mysqld]
server-id=2
relay-log=relay-log

-- 启动复制
CHANGE MASTER TO 
    MASTER_HOST='192.168.1.100',
    MASTER_USER='repl',
    MASTER_PASSWORD='password',
    MASTER_LOG_FILE='mysql-bin.000001',
    MASTER_LOG_POS=1234;

START SLAVE;
SHOW SLAVE STATUS\G
```

### 5.3 读写分离

```java
// Spring AbstractRoutingDataSource
public class DynamicDataSource extends AbstractRoutingDataSource {
    
    private static final ThreadLocal<String> CONTEXT = new ThreadLocal<>();
    
    public static void setMaster() { CONTEXT.set("master"); }
    public static void setSlave() { CONTEXT.set("slave"); }
    
    @Override
    protected Object determineCurrentLookupKey() {
        return CONTEXT.get();
    }
}

// AOP 切面
@Aspect
@Component
public class DataSourceAspect {
    
    @Around("@annotation(Master)")
    public Object useMaster(ProceedingJoinPoint pjp) throws Throwable {
        DynamicDataSource.setMaster();
        try { return pjp.proceed(); }
        finally { DynamicDataSource.setSlave(); }
    }
    
    @Around("@annotation(Slave)")
    public Object useSlave(ProceedingJoinPoint pjp) throws Throwable {
        DynamicDataSource.setSlave();
        try { return pjp.proceed(); }
        finally { DynamicDataSource.setSlave(); }
    }
}
```

---

## 6. 性能调优

### 6.1 关键参数

```ini
[mysqld]
# 内存相关
innodb_buffer_pool_size = 4G          # InnoDB 缓冲池（物理内存 70%）
innodb_buffer_pool_instances = 8      # 缓冲池实例数
innodb_log_buffer_size = 64M          # 日志缓冲

# IO 相关
innodb_flush_log_at_trx_commit = 1    # 0=最快速，1=最安全
innodb_flush_method = O_DIRECT        # 避免双重缓冲
innodb_io_capacity = 2000             # IOPS

# 连接相关
max_connections = 1000
thread_cache_size = 64

# 查询缓存（MySQL 8.0 已移除）
# query_cache_size = 64M

# 日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1
```

### 6.2 慢查询分析

```bash
# 查看慢查询
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log

# pt-query-digest 分析
pt-query-digest /var/log/mysql/slow.log > slow_report.txt
```

---

## 7. 实战案例

### 7.1 索引优化实战

```sql
-- 场景：订单表查询慢
-- 原始查询
SELECT * FROM `order` WHERE user_id = 1001 AND status = 1 ORDER BY create_time DESC;

-- 分析
EXPLAIN SELECT * FROM `order` WHERE user_id = 1001 AND status = 1 ORDER BY create_time DESC;
-- 结果：type=ALL, Extra=Using filesort

-- 优化：添加复合索引
CREATE INDEX idx_user_status_time ON `order`(user_id, status, create_time);

-- 优化后
EXPLAIN SELECT * FROM `order` WHERE user_id = 1001 AND status = 1 ORDER BY create_time DESC;
-- 结果：type=ref, key=idx_user_status_time, Extra=Using where
```

### 7.2 死锁排查实战

```sql
-- 1. 查看当前事务
SELECT * FROM information_schema.innodb_trx;

-- 2. 查看锁等待
SELECT 
    r.trx_id AS waiting_trx_id,
    r.trx_mysql_thread_id AS waiting_thread,
    r.trx_query AS waiting_query,
    b.trx_id AS blocking_trx_id,
    b.trx_mysql_thread_id AS blocking_thread,
    b.trx_query AS blocking_query
FROM information_schema.innodb_lock_waits w
INNER JOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id
INNER JOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id;

-- 3. 杀死阻塞线程
KILL <thread_id>;

-- 4. 预防死锁
-- - 固定访问顺序（先 A 表后 B 表）
-- - 大事务拆小
-- - 使用较低的隔离级别
```

### 7.3 慢查询优化实战

```sql
-- 1. 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- 超过 1 秒算慢查询

-- 2. 查看慢查询
SELECT * FROM mysql.slow_log;

-- 3. 分析慢查询
-- 使用 EXPLAIN 分析执行计划
EXPLAIN SELECT o.*, u.name 
FROM `order` o 
LEFT JOIN user u ON o.user_id = u.id 
WHERE o.create_time >= '2026-01-01';

-- 4. 优化建议
-- - 添加索引：CREATE INDEX idx_create_time ON `order`(create_time);
-- - 避免 SELECT *
-- - 避免 JOIN 过多表
-- - 避免子查询，改用 JOIN
```

### 7.4 主从延迟排查

```sql
-- 1. 查看主从状态
SHOW SLAVE STATUS\G

-- 关键指标：
-- Slave_IO_Running: Yes
-- Slave_SQL_Running: Yes
-- Seconds_Behind_Master: 0  (应接近 0)

-- 2. 常见延迟原因
-- - 大事务（批量插入/删除）
-- - 主库并发高，从库单线程回放
-- - 从库硬件配置低
-- - 网络延迟

-- 3. 解决方案
-- - 大事务拆分
-- - 使用并行复制（MySQL 5.7+）
--   SET GLOBAL slave_parallel_workers = 4;
-- - 升级从库硬件
-- - 业务上接受最终一致性
```

### 7.5 分页优化实战

```sql
-- 场景：深分页查询慢
-- 原始查询（100 万数据，查第 10000 页）
SELECT * FROM `order` ORDER BY create_time DESC LIMIT 999900, 10;
-- 耗时：约 5 秒

-- 优化方案 1：延迟关联
SELECT o.* FROM `order` o
INNER JOIN (
    SELECT id FROM `order` ORDER BY create_time DESC LIMIT 999900, 10
) tmp ON o.id = tmp.id;
-- 耗时：约 0.5 秒

-- 优化方案 2：记录上次 ID（适用于连续翻页）
SELECT * FROM `order` 
WHERE create_time < '2026-01-01 00:00:00' 
ORDER BY create_time DESC 
LIMIT 10;
-- 耗时：约 0.1 秒

-- 优化方案 3：限制最大页数
-- 业务上不允许翻到第 10000 页，最多 100 页
```

---

## 8. 性能基准

### 8.1 参考指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 简单查询 RT | < 10ms | 主键查询 |
| 复杂查询 RT | < 100ms | 多表 JOIN |
| 写入 TPS | > 1000 | 单表插入 |
| 连接数使用率 | < 80% | max_connections |
| 缓冲池命中率 | > 95% | innodb_buffer_pool |
| 慢查询比例 | < 1% | 总查询数 |

### 8.2 监控命令

```bash
# 查看 QPS/TPS
mysqladmin -uroot -p status -i 1

# 查看连接数
SHOW STATUS LIKE 'Threads_connected';

# 查看缓冲池命中率
SHOW ENGINE INNODB STATUS;

# 查看表锁/行锁
SHOW STATUS LIKE 'Table_locks%';
SHOW STATUS LIKE 'Innodb_row_lock%';
```

---

**推荐资源：**
- 📚 《高性能 MySQL》
- 📚 《MySQL 技术内幕：InnoDB 存储引擎》
- 📖 MySQL 官方文档
- 🔗 Percona Toolkit：https://www.percona.com/software/database-tools/percona-toolkit
