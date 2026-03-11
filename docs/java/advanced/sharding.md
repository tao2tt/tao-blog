# 分库分表

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-05-10

---

## 📚 目录

[[toc]]

---

## 1. 分库分表概述

### 1.1 为什么要分库分表

**单表瓶颈：**
- 数据量过大（>1000 万行）
- 索引膨胀，查询变慢
- DDL 操作困难
- 单库连接数限制

**解决方案：**
- 垂直分库：按业务模块拆分
- 垂直分表：将大字段拆分到扩展表
- 水平分库：数据分布到多个库
- 水平分表：数据分布到多个表

### 1.2 拆分策略

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| 用户 ID 取模 | `user_id % N` | 用户维度数据 |
| 时间范围 | 按月/年拆分 | 订单、日志 |
| 地域范围 | 按省份/城市 | 地域性业务 |
| 复合策略 | 先按时间再按 ID | 复杂场景 |

---

## 2. ShardingSphere

### 2.1 简介

**ShardingSphere** = Sharding-JDBC + Sharding-Proxy + Sharding-Sidecar

**核心功能：**
- 数据分片
- 读写分离
- 分布式事务
- 数据库治理

### 2.2 依赖配置

```xml
<dependency>
    <groupId>org.apache.shardingsphere</groupId>
    <artifactId>shardingsphere-jdbc-core</artifactId>
    <version>5.4.0</version>
</dependency>
```

### 2.3 分表配置

```yaml
spring:
  shardingsphere:
    datasource:
      names: ds0,ds1
      ds0:
        type: com.zaxxer.hikari.HikariDataSource
        jdbc-url: jdbc:mysql://localhost:3306/db0
        username: root
        password: password
      ds1:
        type: com.zaxxer.hikari.HikariDataSource
        jdbc-url: jdbc:mysql://localhost:3306/db1
        username: root
        password: password
    
    rules:
      sharding:
        tables:
          t_order:
            actual-data-nodes: ds$->{0..1}.t_order$->{0..1}
            table-strategy:
              standard:
                sharding-column: order_id
                sharding-algorithm-name: t_order_table_algorithm
            database-strategy:
              standard:
                sharding-column: user_id
                sharding-algorithm-name: t_order_database_algorithm
        
        sharding-algorithms:
          t_order_table_algorithm:
            type: CLASS_BASED
            props:
              strategy: STANDARD
              algorithm-class: com.example.OrderTableShardingAlgorithm
          t_order_database_algorithm:
            type: MOD
            props:
              sharding-count: 2
```

### 2.4 自定义分片算法

```java
public class OrderTableShardingAlgorithm implements StandardShardingAlgorithm<Long> {
    
    @Override
    public String doSharding(Collection<String> availableTargetNames, 
                             PreciseShardingValue<Long> shardingValue) {
        Long orderId = shardingValue.getValue();
        String tableName = "t_order" + (orderId % 2);
        
        for (String target : availableTargetNames) {
            if (target.endsWith(tableName)) {
                return target;
            }
        }
        throw new IllegalArgumentException("找不到目标表");
    }
    
    @Override
    public void init() { }
    @Override
    public String getType() { return "CLASS_BASED"; }
}
```

---

## 3. 分布式 ID

### 3.1 雪花算法

```java
public class SnowflakeIdGenerator {
    
    private static final long START_TIMESTAMP = 1640966400000L; // 2022-01-01
    private static final long DATA_CENTER_BITS = 5L;
    private static final long WORKER_BITS = 5L;
    private static final long SEQUENCE_BITS = 12L;
    
    private static final long MAX_WORKER_NUM = ~(-1L << WORKER_BITS);
    private static final long MAX_SEQUENCE = ~(-1L << SEQUENCE_BITS);
    
    private static final long WORKER_SHIFT = SEQUENCE_BITS;
    private static final long DATA_CENTER_SHIFT = SEQUENCE_BITS + WORKER_BITS;
    private static final long TIMESTAMP_SHIFT = SEQUENCE_BITS + WORKER_BITS + DATA_CENTER_BITS;
    
    private long dataCenterId;
    private long workerId;
    private long sequence = 0L;
    private long lastTimestamp = -1L;
    
    public SnowflakeIdGenerator(long dataCenterId, long workerId) {
        if (dataCenterId > MAX_WORKER_NUM || dataCenterId < 0) {
            throw new IllegalArgumentException("DataCenterId 超出范围");
        }
        if (workerId > MAX_WORKER_NUM || workerId < 0) {
            throw new IllegalArgumentException("WorkerId 超出范围");
        }
        this.dataCenterId = dataCenterId;
        this.workerId = workerId;
    }
    
    public synchronized long nextId() {
        long timestamp = System.currentTimeMillis();
        
        if (timestamp < lastTimestamp) {
            throw new RuntimeException("时钟回拨");
        }
        
        if (timestamp == lastTimestamp) {
            sequence = (sequence + 1) & MAX_SEQUENCE;
            if (sequence == 0) {
                timestamp = waitNextMillis(lastTimestamp);
            }
        } else {
            sequence = 0L;
        }
        
        lastTimestamp = timestamp;
        
        return ((timestamp - START_TIMESTAMP) << TIMESTAMP_SHIFT)
             | (dataCenterId << DATA_CENTER_SHIFT)
             | (workerId << WORKER_SHIFT)
             | sequence;
    }
    
    private long waitNextMillis(long lastTimestamp) {
        long timestamp = System.currentTimeMillis();
        while (timestamp <= lastTimestamp) {
            timestamp = System.currentTimeMillis();
        }
        return timestamp;
    }
}
```

### 3.2 号段模式

```sql
-- 号段表
CREATE TABLE `id_segment` (
    `biz_tag` varchar(64) PRIMARY KEY,
    `max_id` bigint NOT NULL,
    `step` int NOT NULL,
    `description` varchar(256)
);

-- 初始化
INSERT INTO id_segment VALUES ('order', 0, 1000, '订单 ID 号段');
```

```java
@Service
public class SegmentIdGenerator {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private Map<String, IdSegment> cache = new ConcurrentHashMap<>();
    
    public long nextId(String bizTag) {
        IdSegment segment = cache.get(bizTag);
        
        if (segment == null || segment.getCurrent() >= segment.getMax()) {
            segment = updateSegment(bizTag);
            cache.put(bizTag, segment);
        }
        
        return segment.getNextId();
    }
    
    private synchronized IdSegment updateSegment(String bizTag) {
        IdSegment segment = cache.get(bizTag);
        
        if (segment != null && segment.getCurrent() < segment.getMax()) {
            return segment;
        }
        
        // 更新号段
        String sql = "UPDATE id_segment SET max_id = max_id + step WHERE biz_tag = ?";
        jdbcTemplate.update(sql, bizTag);
        
        // 查询最新号段
        sql = "SELECT max_id, step FROM id_segment WHERE biz_tag = ?";
        RowCallbackHandler handler = rs -> {
            long maxId = rs.getLong("max_id");
            int step = rs.getInt("step");
            cache.put(bizTag, new IdSegment(maxId - step, maxId));
        };
        jdbcTemplate.query(sql, handler, bizTag);
        
        return cache.get(bizTag);
    }
}
```

---

## 4. 数据迁移

### 4.1 双写方案

```java
@Service
public class OrderService {
    
    @Autowired
    private OrderMapper oldOrderMapper;
    
    @Autowired
    private ShardingOrderMapper newOrderMapper;
    
    /**
     * 双写阶段
     */
    public void createOrder(Order order) {
        // 1. 写入新库
        newOrderMapper.insert(order);
        
        try {
            // 2. 写入旧库（兼容查询）
            oldOrderMapper.insert(order);
        } catch (Exception e) {
            log.error("写入旧库失败", e);
            // 记录补偿日志
        }
    }
    
    /**
     * 查询时先查新库，查不到查旧库
     */
    public Order getOrder(Long orderId) {
        Order order = newOrderMapper.selectById(orderId);
        if (order == null) {
            order = oldOrderMapper.selectById(orderId);
        }
        return order;
    }
}
```

### 4.2 数据校验

```java
@Component
public class DataValidator {
    
    public void validate() {
        // 1. 全量校验
        List<Order> oldOrders = oldOrderMapper.selectAll();
        for (Order oldOrder : oldOrders) {
            Order newOrder = newOrderMapper.selectById(oldOrder.getId());
            if (!equals(oldOrder, newOrder)) {
                log.error("数据不一致：{}", oldOrder.getId());
            }
        }
        
        // 2. 抽样校验
        // 3. 关键数据校验
    }
}
```

### 4.3 灰度切换

```
阶段 1：双写（新库为主，旧库为辅）
阶段 2：灰度读（1% → 10% → 50% → 100%）
阶段 3：停止双写旧库
阶段 4：下线旧库
```

---

## 5. 最佳实践

### 5.1 分片键选择

- 选择查询频率高的字段
- 选择数据分布均匀的字段
- 避免选择单调递增字段

### 5.2 扩容方案

```
1. 预留分片（提前创建多余分片）
2. 双写迁移（不停机扩容）
3. 逐步切换（灰度迁移）
```

### 5.3 跨分片查询

```sql
-- 避免跨分片 JOIN
-- ✅ 方案 1：字段冗余
SELECT o.*, u.name 
FROM t_order o 
LEFT JOIN t_user u ON o.user_id = u.id;

-- ✅ 方案 2：应用层组装
List<Order> orders = orderMapper.selectByUserIds(userIds);
List<User> users = userMapper.selectByIds(userIds);
// 应用层关联

-- ✅ 方案 3：绑定表（相同分片策略）
```

---

## 📝 待办事项

- [ ] ShardingSphere 配置
- [ ] 分片算法实现
- [ ] 分布式 ID 生成
- [ ] 数据迁移方案
- [ ] 双写实现
- [ ] 灰度切换实战

---

**推荐资源：**
- 📖 ShardingSphere 官方文档
- 🔗 GitHub：https://github.com/apache/shardingsphere
