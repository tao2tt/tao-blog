# 性能优化案例

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-30  
> 难度：⭐⭐⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 接口优化

### 1.1 慢接口优化案例

**场景：** 订单列表接口响应时间 3 秒+

**问题分析：**
```sql
-- 原始 SQL
SELECT * FROM `order` 
WHERE user_id = 1001 
  AND status IN (1, 2, 3) 
  AND create_time >= '2026-01-01'
ORDER BY create_time DESC
LIMIT 0, 10;

-- EXPLAIN 分析
-- type: ALL（全表扫描）
-- rows: 5000000（扫描 500 万行）
-- Extra: Using filesort（文件排序）
```

**优化方案：**

```java
/**
 * 方案 1：添加索引
 */
// CREATE INDEX idx_user_status_time ON `order`(user_id, status, create_time);

/**
 * 方案 2：缓存优化
 */
@Service
public class OrderService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Cacheable(value = "orders", key = "#userId + ':' + #page")
    public List<Order> getOrders(Long userId, int page, int size) {
        return orderMapper.selectOrders(userId, page, size);
    }
}

/**
 * 方案 3：读写分离
 */
@Service
public class OrderService {
    
    @DataSource("slave")  // 读从库
    public List<Order> getOrders(Long userId, int page, int size) {
        return orderMapper.selectOrders(userId, page, size);
    }
    
    @DataSource("master")  // 写主库
    public Order createOrder(Order order) {
        orderMapper.insert(order);
        return order;
    }
}
```

**优化效果：**
- 优化前：3000ms
- 优化后：50ms
- 提升：60 倍

---

## 2. 数据库优化

### 2.1 深分页优化

**问题：** 翻到第 10000 页时查询慢（8 秒）

```sql
-- 原始 SQL
SELECT * FROM `order` 
ORDER BY create_time DESC 
LIMIT 999900, 10;

-- 优化方案 1：延迟关联
SELECT o.* FROM `order` o
INNER JOIN (
    SELECT id FROM `order` 
    ORDER BY create_time DESC 
    LIMIT 999900, 10
) tmp ON o.id = tmp.id;

-- 优化方案 2：记录上次 ID
SELECT * FROM `order` 
WHERE create_time < '2026-01-01 00:00:00' 
  AND id < 999900
ORDER BY create_time DESC, id DESC
LIMIT 10;

-- 优化方案 3：业务限制
-- 最多允许翻 100 页（1000 条数据）
```

**优化效果：**
- 优化前：8000ms
- 优化后：100ms
- 提升：80 倍

### 2.2 批量插入优化

**问题：** 导入 10 万条数据耗时 30 分钟

```java
/**
 * 优化方案 1：批量插入
 */
@Transactional
public void batchInsert(List<Order> orders) {
    int batchSize = 1000;
    int size = orders.size();
    
    for (int i = 0; i < size; i += batchSize) {
        List<Order> batch = orders.subList(
            i, Math.min(i + batchSize, size));
        orderMapper.insertBatch(batch);
    }
}

/**
 * 优化方案 2：事务批处理
 */
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

/**
 * 优化方案 3：LOAD DATA（最快）
 */
// LOAD DATA LOCAL INFILE '/tmp/orders.csv'
// INTO TABLE `order`
// FIELDS TERMINATED BY ',' 
// LINES TERMINATED BY '\n'
// (user_id, order_no, amount, status, create_time);
```

**优化效果：**
- 逐条插入：30 分钟
- 批量插入：2 分钟
- 事务批处理：30 秒
- LOAD DATA：5 秒

---

## 3. 缓存优化

### 3.1 多级缓存架构

```java
/**
 * 三级缓存：本地缓存 + Redis + 数据库
 */
@Component
public class MultiLevelCache {
    
    @Autowired
    private CacheManager localCacheManager;  // Caffeine
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private UserMapper userMapper;
    
    public User getUser(Long id) {
        String key = "user:" + id;
        
        // L1: 本地缓存
        Cache cache = localCacheManager.getCache("user");
        User user = cache.get(key, User.class);
        if (user != null) {
            log.debug("L1 cache hit: {}", id);
            return user;
        }
        
        // L2: Redis 缓存
        user = (User) redisTemplate.opsForValue().get(key);
        if (user != null) {
            log.debug("L2 cache hit: {}", id);
            cache.put(key, user);  // 回填 L1
            return user;
        }
        
        // L3: 数据库
        log.debug("L3 database query: {}", id);
        user = userMapper.selectById(id);
        
        if (user != null) {
            redisTemplate.opsForValue().set(key, user, 30, TimeUnit.MINUTES);
            cache.put(key, user);
        } else {
            // 缓存空值，防止穿透
            redisTemplate.opsForValue().set(key, new NullUser(), 5, TimeUnit.MINUTES);
        }
        
        return user;
    }
}
```

**优化效果：**
- 无缓存：50ms（数据库）
- Redis 缓存：5ms
- 本地缓存：0.1ms

### 3.2 缓存穿透/击穿/雪崩

```java
/**
 * 缓存穿透：查询不存在的数据
 * 解决方案：布隆过滤器 + 缓存空值
 */
public User getUser(Long id) {
    // 布隆过滤器检查
    if (!bloomFilter.mightContain(id)) {
        return null;
    }
    
    User user = redisTemplate.opsForValue().get("user:" + id);
    if (user != null) return user;
    
    user = userMapper.selectById(id);
    if (user == null) {
        // 缓存空值
        redisTemplate.opsForValue().set("user:" + id, 
            new NullUser(), 5, TimeUnit.MINUTES);
        return null;
    }
    
    redisTemplate.opsForValue().set("user:" + id, user, 30, TimeUnit.MINUTES);
    bloomFilter.put(id);
    
    return user;
}

/**
 * 缓存击穿：热点 key 过期
 * 解决方案：互斥锁
 */
public User getUserWithLock(Long id) {
    String key = "user:" + id;
    User user = redisTemplate.opsForValue().get(key);
    if (user != null) return user;
    
    String lockKey = "lock:" + key;
    boolean locked = tryLock(lockKey);
    
    if (locked) {
        try {
            // 双重检查
            user = redisTemplate.opsForValue().get(key);
            if (user != null) return user;
            
            user = userMapper.selectById(id);
            redisTemplate.opsForValue().set(key, user, 30, TimeUnit.MINUTES);
        } finally {
            unlock(lockKey);
        }
    } else {
        // 等待重试
        Thread.sleep(50);
        return getUserWithLock(id);
    }
    
    return user;
}

/**
 * 缓存雪崩：大量 key 同时过期
 * 解决方案：随机过期时间
 */
public void cacheUser(User user) {
    String key = "user:" + user.getId();
    // 基础时间 + 随机时间
    long expire = 30 + new Random().nextInt(60);  // 30-90 分钟
    redisTemplate.opsForValue().set(key, user, expire, TimeUnit.MINUTES);
}
```

---

## 4. 异步优化

### 4.1 线程池优化

```java
/**
 * 线程池配置
 */
@Configuration
public class ThreadPoolConfig {
    
    @Bean
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("async-");
        executor.setRejectedExecutionHandler(
            new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

/**
 * 异步处理
 */
@Service
public class OrderService {
    
    @Autowired
    private TaskExecutor taskExecutor;
    
    @Async
    public void createOrderAsync(Order order) {
        // 1. 创建订单
        orderMapper.insert(order);
        
        // 2. 异步发送通知
        taskExecutor.execute(() -> {
            sendEmail(order.getUserId());
            sendSms(order.getUserId());
        });
        
        // 3. 异步更新统计
        taskExecutor.execute(() -> {
            updateStatistics(order.getUserId());
        });
    }
}
```

### 4.2 CompletableFuture 异步编排

```java
/**
 * 异步编排：并行执行多个任务
 */
public OrderDetail getOrderDetail(Long orderId) {
    CompletableFuture<Order> orderFuture = 
        CompletableFuture.supplyAsync(() -> orderMapper.selectById(orderId));
    
    CompletableFuture<User> userFuture = 
        orderFuture.thenCompose(order -> 
            CompletableFuture.supplyAsync(() -> 
                userMapper.selectById(order.getUserId())));
    
    CompletableFuture<List<OrderItem>> itemsFuture = 
        CompletableFuture.supplyAsync(() -> 
            orderItemMapper.selectByOrderId(orderId));
    
    // 等待所有任务完成
    CompletableFuture.allOf(orderFuture, userFuture, itemsFuture).join();
    
    // 组装结果
    OrderDetail detail = new OrderDetail();
    detail.setOrder(orderFuture.join());
    detail.setUser(userFuture.join());
    detail.setItems(itemsFuture.join());
    
    return detail;
}

// 串行时间：100ms + 50ms + 80ms = 230ms
// 并行时间：max(100ms, 50ms, 80ms) = 100ms
```

---

## 5. JVM 调优

### 5.1 GC 调优案例

**场景：** Full GC 频繁，应用卡顿

**问题分析：**
```bash
# GC 日志分析
grep "Full GC" gc.log | tail -50

# 发现：
# - Full GC 频率从 1 小时/次变为 5 分钟/次
# - GC 后老年代使用率仍 > 90%
# - 判断存在内存泄漏
```

**优化方案：**
```bash
# 优化前配置
-Xms2g -Xmx2g -XX:+UseParallelGC

# 优化后配置
-Xms4g -Xmx4g
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:G1HeapRegionSize=16m
-XX:InitiatingHeapOccupancyPercent=45
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/data/logs/heapdump.hprof
```

**优化效果：**
- Full GC 频率：5 分钟/次 → 1 天/次
- GC 停顿时间：500ms → 100ms

---

## 6. 全链路压测

### 6.1 压测方案

```bash
# 1. 压测工具
wrk -t12 -c400 -d60s http://localhost:8080/api/orders

# 2. 监控指标
# - QPS：每秒请求数
# - RT：响应时间（P50/P90/P99）
# - 错误率
# - CPU/内存使用率

# 3. 瓶颈分析
# - 数据库慢查询
# - 缓存命中率
# - 线程池状态
# - GC 情况
```

### 6.2 优化效果对比

| 优化项 | 优化前 | 优化后 | 提升 |
|--------|--------|--------|------|
| 接口 RT | 3000ms | 50ms | 60 倍 |
| 深分页 | 8000ms | 100ms | 80 倍 |
| 批量插入 | 30 分钟 | 5 秒 | 360 倍 |
| QPS | 100 | 1000 | 10 倍 |
| Full GC | 5 分钟/次 | 1 天/次 | 288 倍 |

---

## 📝 待办事项

- [ ] 掌握接口优化方法
- [ ] 掌握数据库优化技巧
- [ ] 掌握多级缓存架构
- [ ] 掌握缓存问题解决方案
- [ ] 掌握异步优化方法
- [ ] 掌握 JVM 调优
- [ ] 掌握全链路压测

---

**推荐资源：**
- 📚 《高性能 MySQL》
- 📚 《Redis 设计与实现》
- 📚 《Java 性能权威指南》
- 🔗 Arthas 官方文档
