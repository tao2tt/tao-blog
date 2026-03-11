# 限流熔断

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-06-30

---

## 📚 目录

[[toc]]

---

## 1. 限流

### 1.1 限流算法

#### 计数器

```java
@Component
public class CounterRateLimiter {
    
    private AtomicInteger count = new AtomicInteger(0);
    private long startTime = System.currentTimeMillis();
    private final int limit;
    private final long windowMs;
    
    public boolean tryAcquire() {
        long now = System.currentTimeMillis();
        
        // 重置计数器
        if (now - startTime > windowMs) {
            count.set(0);
            startTime = now;
        }
        
        // 检查是否超限
        if (count.incrementAndGet() <= limit) {
            return true;
        }
        
        count.decrementAndGet();
        return false;
    }
}
```

#### 滑动窗口

```java
@Component
public class SlidingWindowRateLimiter {
    
    private final int windowSize;  // 窗口大小（秒）
    private final int limit;       // 限制数
    private final LinkedList<Long> timestamps = new LinkedList<>();
    
    public synchronized boolean tryAcquire() {
        long now = System.currentTimeMillis();
        long windowStart = now - windowSize * 1000;
        
        // 移除窗口外请求
        while (!timestamps.isEmpty() && timestamps.getFirst() < windowStart) {
            timestamps.removeFirst();
        }
        
        // 检查是否超限
        if (timestamps.size() < limit) {
            timestamps.addLast(now);
            return true;
        }
        
        return false;
    }
}
```

#### 漏桶

```java
@Component
public class LeakyBucketRateLimiter {
    
    private final int capacity;     // 桶容量
    private final int rate;         // 流出速率（每秒）
    private double water;           // 当前水量
    private long lastTime = System.currentTimeMillis();
    
    public synchronized boolean tryAcquire() {
        long now = System.currentTimeMillis();
        long delta = now - lastTime;
        
        // 漏水
        water = Math.max(0, water - delta * rate / 1000.0);
        lastTime = now;
        
        // 注水
        if (water < capacity) {
            water += 1;
            return true;
        }
        
        return false;
    }
}
```

#### 令牌桶

```java
@Component
public class TokenBucketRateLimiter {
    
    private final int capacity;     // 桶容量
    private final int rate;         // 令牌生成速率（每秒）
    private double tokens;          // 当前令牌数
    private long lastTime = System.currentTimeMillis();
    
    public synchronized boolean tryAcquire() {
        long now = System.currentTimeMillis();
        long delta = now - lastTime;
        
        // 添加令牌
        tokens = Math.min(capacity, tokens + delta * rate / 1000.0);
        lastTime = now;
        
        // 消耗令牌
        if (tokens >= 1) {
            tokens -= 1;
            return true;
        }
        
        return false;
    }
}
```

### 1.2 Guava RateLimiter

```java
@Service
public class OrderService {
    
    // 每秒生成 10 个令牌
    private RateLimiter rateLimiter = RateLimiter.create(10.0);
    
    public void createOrder(Order order) {
        // 获取令牌（阻塞）
        rateLimiter.acquire();
        
        // 业务逻辑
        createOrderInternal(order);
    }
    
    public boolean tryCreateOrder(Order order) {
        // 尝试获取令牌（不阻塞）
        if (rateLimiter.tryAcquire()) {
            createOrderInternal(order);
            return true;
        }
        return false;
    }
}
```

### 1.3 Redis 限流

```java
@Component
public class RedisRateLimiter {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String KEY_PREFIX = "rate_limit:";
    
    /**
     * 固定窗口
     */
    public boolean tryAcquire(String key, int limit, long windowMs) {
        String redisKey = KEY_PREFIX + key;
        
        Long count = redisTemplate.opsForValue().increment(redisKey);
        if (count == 1) {
            redisTemplate.expire(redisKey, windowMs, TimeUnit.MILLISECONDS);
        }
        
        return count != null && count <= limit;
    }
    
    /**
     * 滑动窗口（使用 ZSet）
     */
    public boolean tryAcquireSliding(String key, int limit, long windowMs) {
        String redisKey = KEY_PREFIX + key;
        long now = System.currentTimeMillis();
        long windowStart = now - windowMs;
        
        // 移除窗口外请求
        redisTemplate.opsForZSet().removeRangeByScore(redisKey, 0, windowStart);
        
        // 统计窗口内请求数
        Long count = redisTemplate.opsForZSet().zCard(redisKey);
        
        if (count != null && count < limit) {
            redisTemplate.opsForZSet().add(redisKey, String.valueOf(now), now);
            redisTemplate.expire(redisKey, windowMs, TimeUnit.MILLISECONDS);
            return true;
        }
        
        return false;
    }
}
```

---

## 2. 熔断

### 2.1 熔断状态

```
CLOSED（关闭） → OPEN（打开） → HALF_OPEN（半开）
     ↑                              ↓
     └──────────────────────────────┘
```

| 状态 | 说明 |
|------|------|
| CLOSED | 正常，请求通过 |
| OPEN | 熔断，请求直接拒绝 |
| HALF_OPEN | 试探，允许部分请求通过 |

### 2.2 手动实现

```java
@Component
public class CircuitBreaker {
    
    private enum State { CLOSED, OPEN, HALF_OPEN }
    
    private State state = State.CLOSED;
    private int failureCount = 0;
    private int successCount = 0;
    private long lastFailureTime = 0;
    
    private final int failureThreshold = 5;      // 失败阈值
    private final int successThreshold = 3;      // 成功阈值
    private final long retryDelayMs = 30000;     // 重试延迟
    
    public synchronized <T> T execute(Supplier<T> supplier) {
        if (state == State.OPEN) {
            if (System.currentTimeMillis() - lastFailureTime > retryDelayMs) {
                state = State.HALF_OPEN;
            } else {
                throw new CircuitBreakerOpenException("熔断器已打开");
            }
        }
        
        try {
            T result = supplier.get();
            onSuccess();
            return result;
        } catch (Exception e) {
            onFailure();
            throw e;
        }
    }
    
    private void onSuccess() {
        failureCount = 0;
        if (state == State.HALF_OPEN) {
            successCount++;
            if (successCount >= successThreshold) {
                state = State.CLOSED;
                successCount = 0;
            }
        }
    }
    
    private void onFailure() {
        failureCount++;
        lastFailureTime = System.currentTimeMillis();
        if (failureCount >= failureThreshold) {
            state = State.OPEN;
        }
    }
}
```

---

## 3. Sentinel

### 3.1 依赖

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

### 3.2 流控规则

```java
@Service
public class OrderService {
    
    @SentinelResource(
        value = "createOrder",
        blockHandler = "handleBlock",
        fallback = "handleFallback"
    )
    public Order createOrder(Order order) {
        return orderMapper.insert(order);
    }
    
    // 限流处理
    public Order handleBlock(Order order, BlockException ex) {
        log.warn("限流：{}", order.getId());
        return null;
    }
    
    // 降级处理
    public Order handleFallback(Order order, Throwable ex) {
        log.error("异常：{}", order.getId(), ex);
        return null;
    }
}
```

### 3.3 配置规则

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
        port: 8719
      datasource:
        ds1:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-sentinel
            groupId: DEFAULT_GROUP
            rule-type: flow
```

### 3.4 规则类型

| 规则 | 说明 |
|------|------|
| 流控规则 | QPS/线程数限流 |
| 熔断规则 | 异常比例/慢调用比例熔断 |
| 系统规则 | 系统负载保护 |
| 授权规则 | 黑白名单 |
| 热点规则 | 热点参数限流 |

---

## 4. Resilience4j

### 4.1 依赖

```xml
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot2</artifactId>
    <version>2.1.0</version>
</dependency>
```

### 4.2 配置

```yaml
resilience4j:
  circuitbreaker:
    instances:
      orderService:
        sliding-window-size: 10
        failure-rate-threshold: 50
        wait-duration-in-open-state: 30s
        permitted-number-of-calls-in-half-open-state: 3
  
  ratelimiter:
    instances:
      orderService:
        limit-for-period: 10
        limit-refresh-period: 1s
        timeout-duration: 0s
  
  timelimiter:
    instances:
      orderService:
        timeout-duration: 3s
```

### 4.3 使用

```java
@Service
public class OrderService {
    
    @CircuitBreaker(name = "orderService", fallbackMethod = "fallback")
    @RateLimiter(name = "orderService")
    @TimeLimiter(name = "orderService")
    public CompletableFuture<Order> createOrder(Order order) {
        return CompletableFuture.supplyAsync(() -> {
            return orderMapper.insert(order);
        });
    }
    
    public Order fallback(Order order, Exception e) {
        log.error("熔断/限流/超时", e);
        return null;
    }
}
```

---

## 5. Hystrix（已停更）

```java
@HystrixCommand(fallbackMethod = "fallback")
public Order createOrder(Order order) {
    return orderMapper.insert(order);
}

public Order fallback(Order order) {
    return null;
}
```

---

## 6. 最佳实践

### 6.1 限流维度

- 用户维度（防刷）
- IP 维度（防攻击）
- 接口维度（保护服务）
- 系统维度（保护整体）

### 6.2 熔断配置

```yaml
# 推荐配置
failure-rate-threshold: 50      # 失败率 50% 熔断
slow-call-rate-threshold: 80    # 慢调用 80% 熔断
slow-call-duration-threshold: 2s  # 2 秒以上算慢
minimum-number-of-calls: 20     # 最少 20 个请求
wait-duration-in-open-state: 30s # 熔断 30 秒后进入半开
```

### 6.3 降级策略

- 返回默认值
- 返回缓存数据
- 返回友好提示
- 调用备用服务

---

## 📝 待办事项

- [ ] 限流算法实现
- [ ] Guava RateLimiter 使用
- [ ] Redis 限流实战
- [ ] Sentinel 配置
- [ ] Resilience4j 使用
- [ ] 熔断降级策略
- [ ] 全链路压测

---

**推荐资源：**
- 📖 Sentinel 官方文档
- 📖 Resilience4j 官方文档
- 🔗 GitHub：https://github.com/alibaba/Sentinel
