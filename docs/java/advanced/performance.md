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

## 8. 实战：电商系统性能优化

### 8.1 优化前性能分析

**场景：** 电商大促，订单创建接口 QPS 仅 100，RT 2000ms

```bash
# 1. 压测
wrk -t12 -c400 -d60s http://localhost:8080/api/orders

# 结果：
# Latency   2000ms (avg/stdev)
# Req/Sec   100/s
# 错误率：5%

# 2. 链路追踪（SkyWalking）
# - 订单创建：2000ms
#   - 库存查询：800ms（Redis）
#   - 订单插入：500ms（MySQL）
#   - 用户查询：400ms（MySQL）
#   - 发送消息：300ms（MQ）

# 3. 数据库分析
# - 慢查询日志：库存查询 800ms
# - 锁等待：订单表行锁竞争

# 4. JVM 分析
# - Full GC 频繁：每分钟 2 次
# - 堆内存不足：2G
```

### 8.2 优化方案

**方案 1：缓存优化**

```java
// 优化前：每次查询数据库
public Product getProduct(Long productId) {
    return productMapper.selectById(productId);
}

// 优化后：多级缓存
public Product getProduct(Long productId) {
    String key = "product:" + productId;
    
    // L1: 本地缓存
    Product product = localCache.get(key);
    if (product != null) return product;
    
    // L2: Redis 缓存
    product = redisTemplate.opsForValue().get(key);
    if (product != null) {
        localCache.put(key, product);
        return product;
    }
    
    // L3: 数据库
    product = productMapper.selectById(productId);
    redisTemplate.opsForValue().set(key, product, 30, TimeUnit.MINUTES);
    localCache.put(key, product);
    return product;
}

// 结果：库存查询从 800ms 降至 5ms
```

**方案 2：异步处理**

```java
// 优化前：同步发送消息
public Order createOrder(Order order) {
    // 1. 创建订单
    orderMapper.insert(order);
    
    // 2. 扣减库存（同步）
    inventoryClient.decrease(order.getProductId(), order.getCount());
    
    // 3. 发送消息（同步）
    eventPublisher.publishEvent(new OrderCreatedEvent(order));
    
    return order;
}

// 优化后：异步处理
public Order createOrder(Order order) {
    // 1. 创建订单
    orderMapper.insert(order);
    
    // 2. 扣减库存（异步）
    CompletableFuture.runAsync(() -> {
        inventoryClient.decrease(order.getProductId(), order.getCount());
    });
    
    // 3. 发送消息（异步）
    eventPublisher.publishEvent(new OrderCreatedEvent(order));
    
    return order;
}

// 结果：接口 RT 从 2000ms 降至 500ms
```

**方案 3：批量处理**

```java
// 优化前：逐条插入
for (OrderItem item : items) {
    orderItemMapper.insert(item);
}

// 优化后：批量插入
orderItemMapper.insertBatch(items);

// 结果：插入 100 条从 500ms 降至 50ms
```

**方案 4：数据库优化**

```sql
-- 优化前：无索引
SELECT * FROM order_item WHERE order_id = 1001;

-- 优化后：添加索引
CREATE INDEX idx_order_id ON order_item(order_id);

-- 优化前：深分页
SELECT * FROM order ORDER BY create_time DESC LIMIT 100000, 10;

-- 优化后：延迟关联
SELECT o.* FROM order o
INNER JOIN (SELECT id FROM order ORDER BY create_time DESC LIMIT 100000, 10) tmp
ON o.id = tmp.id;

-- 结果：查询从 2000ms 降至 50ms
```

### 8.3 优化后性能

```bash
# 压测结果
wrk -t12 -c400 -d60s http://localhost:8080/api/orders

# 结果：
# Latency   200ms (avg/stdev)  # 从 2000ms 降至 200ms
# Req/Sec   1000/s             # 从 100/s 提升至 1000/s
# 错误率：0.1%                 # 从 5% 降至 0.1%

# 优化效果：
# - QPS 提升 10 倍
# - RT 降低 90%
# - 错误率降低 98%
```

---

## 9. 性能基准

### 9.1 接口性能标准

| 接口类型 | RT 目标 | QPS 目标 |
|----------|---------|----------|
| 简单查询 | < 50ms | > 5000 |
| 复杂查询 | < 200ms | > 1000 |
| 写入接口 | < 100ms | > 2000 |
| 批量接口 | < 500ms | > 500 |

### 9.2 系统性能标准

| 指标 | 目标值 | 告警阈值 |
|------|--------|----------|
| CPU 使用率 | < 60% | > 80% |
| 内存使用率 | < 70% | > 85% |
| 磁盘 IO | < 70% | > 90% |
| 网络带宽 | < 60% | > 80% |
| 数据库连接 | < 80% | > 90% |
| Redis 连接 | < 80% | > 90% |

### 9.3 压测脚本

```bash
#!/bin/bash
# benchmark.sh

URL=$1
CONCURRENCY=${2:-100}
DURATION=${3:-60}

echo "=== 性能压测 ==="
echo "URL: $URL"
echo "并发数：$CONCURRENCY"
echo "持续时间：${DURATION}s"
echo ""

wrk -t12 -c$CONCURRENCY -d${DURATION}s $URL

echo ""
echo "=== 性能指标 ==="
echo "RT < 100ms: 优秀"
echo "RT < 500ms: 良好"
echo "RT < 1000ms: 合格"
echo "RT > 1000ms: 需要优化"
```

---

## 📝 实战清单

**性能监控：**
- [ ] Actuator 监控端点
- [ ] Prometheus 指标采集
- [ ] Grafana 可视化
- [ ] 告警规则配置
- [ ] 链路追踪（SkyWalking）

**数据库优化：**
- [ ] 慢查询分析
- [ ] EXPLAIN 执行计划
- [ ] 索引优化
- [ ] SQL 优化
- [ ] 分库分表
- [ ] 读写分离

**缓存优化：**
- [ ] 多级缓存架构
- [ ] 缓存穿透/击穿/雪崩
- [ ] 缓存一致性
- [ ] 热点 Key 处理
- [ ] 大 Key 优化

**异步优化：**
- [ ] 线程池配置
- [ ] CompletableFuture 异步
- [ ] 事件驱动（@EventListener）
- [ ] MQ 异步解耦

**批量优化：**
- [ ] 批量插入（1000 条/批）
- [ ] 批量更新
- [ ] 批量查询（避免 N+1）
- [ ] 流式处理

**JVM 调优：**
- [ ] GC 调优
- [ ] 堆内存调优
- [ ] 元空间调优
- [ ] GC 日志分析

**全链路压测：**
- [ ] 压测环境搭建
- [ ] 压测数据准备
- [ ] 压测脚本编写
- [ ] 压测执行
- [ ] 性能瓶颈分析
- [ ] 优化方案实施
- [ ] 压测报告输出

---

**推荐资源：**
- 📚 《高性能 MySQL》
- 📚 《Redis 设计与实现》
- 📚 《Java 性能权威指南》
- 🔗 Arthas 官方文档：https://arthas.aliyun.com
- 🛠️ wrk 压测工具：https://github.com/wg/wrk
- 🛠️ JMeter：https://jmeter.apache.org
