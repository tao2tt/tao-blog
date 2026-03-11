# 性能优化

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-06-10

---

## 📚 目录

[[toc]]

---

## 1. 性能指标

### 1.1 核心指标

| 指标 | 说明 | 目标 |
|------|------|------|
| QPS | 每秒查询数 | 根据业务定 |
| RT | 响应时间 | P99 < 500ms |
| 成功率 | 请求成功比例 | > 99.9% |
| CPU 使用率 | 处理器利用率 | < 70% |
| 内存使用率 | 内存占用 | < 80% |

### 1.2 压测工具

```bash
# Apache Bench
ab -n 10000 -c 100 http://localhost:8080/api/test

# wrk
wrk -t12 -c400 -d30s http://localhost:8080/api/test

# JMeter
# 图形化界面，支持复杂场景
```

---

## 2. 数据库优化

### 2.1 索引优化

```sql
-- ✅ 添加索引
CREATE INDEX idx_user_status ON user(status, create_time);

-- ✅ 覆盖索引
SELECT id, status FROM user WHERE status = 1;

-- ❌ 避免
SELECT * FROM user WHERE YEAR(create_time) = 2026;  -- 函数导致索引失效
SELECT * FROM user WHERE name LIKE '%张%';  -- 前缀模糊
```

### 2.2 SQL 优化

```sql
-- ✅ 优化前
SELECT * FROM order WHERE user_id IN (
    SELECT id FROM user WHERE status = 1
);

-- ✅ 优化后（JOIN）
SELECT o.* FROM order o
INNER JOIN user u ON o.user_id = u.id
WHERE u.status = 1;

-- ✅ 优化深分页
SELECT * FROM order ORDER BY create_time DESC LIMIT 100000, 10;

-- ✅ 优化后（延迟关联）
SELECT o.* FROM order o
INNER JOIN (SELECT id FROM order ORDER BY create_time DESC LIMIT 100000, 10) tmp
ON o.id = tmp.id;
```

### 2.3 分库分表

```java
// 按用户 ID 分表
public class UserOrderRouter {
    public String getTable(Long userId) {
        return "t_order_" + (userId % 4);
    }
}
```

---

## 3. 缓存优化

### 3.1 多级缓存

```java
@Component
public class MultiLevelCache {
    
    @Autowired
    private CacheManager localCache;  // Caffeine
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    public User getUser(Long id) {
        String key = "user:" + id;
        
        // L1: 本地缓存
        Cache cache = localCache.getCache("user");
        User user = cache.get(key, User.class);
        if (user != null) return user;
        
        // L2: Redis 缓存
        user = redisTemplate.opsForValue().get(key);
        if (user != null) {
            localCache.getCache("user").put(key, user);
            return user;
        }
        
        // L3: 数据库
        user = userMapper.selectById(id);
        if (user != null) {
            redisTemplate.opsForValue().set(key, user, 30, TimeUnit.MINUTES);
            localCache.getCache("user").put(key, user);
        }
        
        return user;
    }
}
```

### 3.2 缓存预热

```java
@Component
public class CacheWarmer implements ApplicationRunner {
    
    @Override
    public void run(ApplicationArguments args) {
        // 预热热点数据
        List<User> hotUsers = userMapper.selectHotUsers();
        for (User user : hotUsers) {
            redisTemplate.opsForValue().set(
                "user:" + user.getId(), 
                user, 
                1, TimeUnit.HOURS
            );
        }
    }
}
```

### 3.3 缓存穿透/击穿/雪崩

```java
// 缓存穿透 - 布隆过滤器
public boolean mightContain(Long id) {
    return bloomFilter.mightContain(id);
}

// 缓存击穿 - 互斥锁
public User getUserWithLock(Long id) {
    String key = "user:" + id;
    User user = redisTemplate.opsForValue().get(key);
    if (user != null) return user;
    
    String lockKey = "lock:" + key;
    boolean locked = tryLock(lockKey);
    if (locked) {
        try {
            user = userMapper.selectById(id);
            redisTemplate.opsForValue().set(key, user, 30, TimeUnit.MINUTES);
        } finally {
            unlock(lockKey);
        }
    } else {
        Thread.sleep(50);
        return getUserWithLock(id);
    }
    return user;
}

// 缓存雪崩 - 随机过期时间
long expire = 30 + new Random().nextInt(60);  // 30-90 分钟
```

---

## 4. 异步优化

### 4.1 线程池

```java
@Configuration
public class ThreadPoolConfig {
    
    @Bean
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

### 4.2 异步处理

```java
@Service
public class OrderService {
    
    @Autowired
    private TaskExecutor taskExecutor;
    
    @Autowired
    private EventPublisher eventPublisher;
    
    // 线程池异步
    public void createOrderAsync(Order order) {
        taskExecutor.execute(() -> {
            sendEmail(order.getUserId());
            sendSms(order.getUserId());
        });
    }
    
    // 事件驱动
    public void createOrder(Order order) {
        orderMapper.insert(order);
        eventPublisher.publishEvent(new OrderCreatedEvent(order));
    }
    
    @Async
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        sendEmail(event.getOrder().getUserId());
    }
    
    // CompletableFuture
    public CompletableFuture<Result> processAsync() {
        CompletableFuture<User> userFuture = CompletableFuture.supplyAsync(() -> getUser());
        CompletableFuture<Order> orderFuture = CompletableFuture.supplyAsync(() -> getOrder());
        
        return userFuture.thenCombine(orderFuture, (user, order) -> {
            return process(user, order);
        });
    }
}
```

---

## 5. 批量处理

### 5.1 批量插入

```java
// ❌ 逐条插入
for (User user : users) {
    userMapper.insert(user);
}

// ✅ 批量插入
userMapper.insertBatch(users);

// ✅ 分批处理
int batchSize = 1000;
for (int i = 0; i < users.size(); i += batchSize) {
    List<User> batch = users.subList(i, Math.min(i + batchSize, users.size()));
    userMapper.insertBatch(batch);
}
```

### 5.2 批量查询

```java
// ❌ N+1 问题
List<Order> orders = orderMapper.selectByUserIds(userIds);
for (Order order : orders) {
    User user = userMapper.selectById(order.getUserId());  // N 次查询
}

// ✅ 批量查询
List<Long> userIds = orders.stream()
    .map(Order::getUserId)
    .distinct()
    .collect(Collectors.toList());
List<User> users = userMapper.selectBatchIds(userIds);
Map<Long, User> userMap = users.stream()
    .collect(Collectors.toMap(User::getId, u -> u));
```

---

## 6. JVM 调优

```bash
# G1 回收器
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-Xms4g
-Xmx4g

# GC 日志
-Xlog:gc*:file=/var/log/gc.log:time,uptime,level,tags
```

---

## 7. 性能监控

### 7.1 Actuator

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

### 7.2 Arthas

```bash
# 方法耗时
trace com.example.Service method

# 方法调用统计
monitor -c 5 com.example.Service method

# 查看热点
profiler start
profiler stop
```

---

## 📝 待办事项

- [ ] 性能指标监控
- [ ] 数据库优化实战
- [ ] 多级缓存实现
- [ ] 异步处理优化
- [ ] 批量处理优化
- [ ] JVM 调优
- [ ] 全链路压测

---

**推荐资源：**
- 📚 《高性能 MySQL》
- 📚 《Redis 设计与实现》
- 🔗 Arthas 官方文档
