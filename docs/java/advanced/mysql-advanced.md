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

## 📝 待办事项

- [ ] 索引原理深入理解
- [ ] 事务隔离级别实战
- [ ] 锁机制与死锁排查
- [ ] SQL 优化实战
- [ ] 主从复制配置
- [ ] 读写分离实现
- [ ] 性能调优实战

---

**推荐资源：**
- 📚 《高性能 MySQL》
- 📚 《MySQL 技术内幕：InnoDB 存储引擎》
- 📖 MySQL 官方文档
