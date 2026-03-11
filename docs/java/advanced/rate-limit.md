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

## 7. 实战：电商大促保障

### 7.1 场景描述

```
双 11 大促：
- 平时 QPS：1000
- 大促 QPS：10000（10 倍流量）
- 目标：系统不崩、核心可用、体验可接受
```

### 7.2 保障方案

```
1. 事前：容量评估、全链路压测、预案准备
2. 事中：限流熔断、降级兜底、实时监控
3. 事后：数据分析、复盘总结、优化改进
```

### 7.3 多级限流架构

```java
/**
 * 多级限流：Nginx → Gateway → Service → Method
 */

// 1. Nginx 层限流（第一道防线）
// nginx.conf
# 限制 IP 请求频率
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;

location /api/ {
    limit_req zone=api_limit burst=200 nodelay;
    proxy_pass http://backend;
}

# 限制并发连接
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
limit_conn conn_limit 100;

// 2. Gateway 层限流（第二道防线）
@Configuration
public class GatewayRateLimitConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("order-service", r -> r
                .path("/api/orders/**")
                .filters(f -> f
                    .requestRateLimiter(config -> {
                        config.setRateLimiter(redisRateLimiter());
                        config.setKeyResolver(userKeyResolver());
                    })
                )
                .uri("lb://order-service"))
            .build();
    }
    
    @Bean
    public RedisRateLimiter redisRateLimiter() {
        // 每秒 100 个令牌，桶容量 200
        return new RedisRateLimiter(100, 200);
    }
    
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> {
            String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
            return Mono.just(StringUtils.hasText(userId) ? userId : "anonymous");
        };
    }
}

// 3. Service 层限流（第三道防线）
@Service
public class OrderService {
    
    // Sentinel 限流
    @SentinelResource(
        value = "createOrder",
        blockHandler = "handleBlock",
        fallback = "handleFallback"
    )
    public Order createOrder(Order order) {
        return orderMapper.insert(order);
    }
    
    public Order handleBlock(Order order, BlockException ex) {
        log.warn("限流：orderId={}", order.getId());
        throw new BusinessException("系统繁忙，请稍后再试");
    }
    
    public Order handleFallback(Order order, Throwable ex) {
        log.error("降级：orderId={}", order.getId(), ex);
        // 返回默认值或缓存数据
        return null;
    }
}

// 4. 方法级限流（最后一道防线）
@Component
public class RateLimitAspect {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Around("@annotation(rateLimit)")
    public Object around(ProceedingJoinPoint pjp, RateLimit rateLimit) throws Throwable {
        String key = "rate_limit:" + rateLimit.key();
        long limit = rateLimit.limit();
        long window = rateLimit.window();
        
        // 滑动窗口限流
        long now = System.currentTimeMillis();
        long windowStart = now - window;
        
        redisTemplate.opsForZSet().removeRangeByScore(key, 0, windowStart);
        
        Long count = redisTemplate.opsForZSet().zCard(key);
        if (count != null && count >= limit) {
            throw new BusinessException("请求过于频繁");
        }
        
        redisTemplate.opsForZSet().add(key, String.valueOf(now), now);
        redisTemplate.expire(key, window, TimeUnit.MILLISECONDS);
        
        return pjp.proceed();
    }
}

// 使用示例
@RateLimit(key = "createOrder", limit = 100, window = 1000)
public Order createOrder(Order order) {
    // ...
}
```

### 7.4 熔断降级实战

```java
/**
 * 降级策略：
 * 1. 返回默认值
 * 2. 返回缓存数据
 * 3. 返回友好提示
 * 4. 调用备用服务
 */
@Service
public class ProductService {
    
    @Autowired
    private ProductMapper productMapper;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private ProductFallbackService fallbackService;
    
    /**
     * 方案 1：返回默认值
     */
    @SentinelResource(
        value = "getProduct",
        fallback = "getProductDefaultFallback"
    )
    public Product getProduct(Long id) {
        return productMapper.selectById(id);
    }
    
    public Product getProductDefaultFallback(Long id, Throwable ex) {
        log.error("获取商品失败：id={}", id, ex);
        // 返回默认商品
        Product defaultProduct = new Product();
        defaultProduct.setId(id);
        defaultProduct.setName("商品暂时不可用");
        defaultProduct.setPrice(BigDecimal.ZERO);
        return defaultProduct;
    }
    
    /**
     * 方案 2：返回缓存数据
     */
    @SentinelResource(
        value = "getProductWithCache",
        fallback = "getProductCacheFallback"
    )
    public Product getProductWithCache(Long id) {
        return productMapper.selectById(id);
    }
    
    public Product getProductCacheFallback(Long id, Throwable ex) {
        log.error("获取商品失败，使用缓存：id={}", id, ex);
        String key = "product:" + id;
        return (Product) redisTemplate.opsForValue().get(key);
    }
    
    /**
     * 方案 3：调用备用服务
     */
    @SentinelResource(
        value = "getProductFromBackup",
        fallback = "getProductBackupFallback"
    )
    public Product getProductFromBackup(Long id) {
        // 调用主服务
        return productMapper.selectById(id);
    }
    
    public Product getProductBackupFallback(Long id, Throwable ex) {
        log.error("主服务失败，调用备用服务：id={}", id, ex);
        // 调用备用服务
        return fallbackService.getProduct(id);
    }
}

/**
 * Resilience4j 熔断配置
 */
@Configuration
public class Resilience4jConfig {
    
    @Bean
    public CircuitBreakerConfig circuitBreakerConfig() {
        return CircuitBreakerConfig.custom()
            // 滑动窗口大小
            .slidingWindowSize(100)
            // 失败率阈值 50%
            .failureRateThreshold(50)
            // 慢调用阈值 80%
            .slowCallRateThreshold(80)
            // 慢调用时长 2 秒
            .slowCallDurationThreshold(Duration.ofSeconds(2))
            // 熔断后等待 30 秒进入半开状态
            .waitDurationInOpenState(Duration.ofSeconds(30))
            // 半开状态允许 3 个请求通过
            .permittedNumberOfCallsInHalfOpenState(3)
            // 最少调用次数
            .minimumNumberOfCalls(10)
            // 自动从开启状态过渡到关闭状态
            .automaticTransitionFromOpenToHalfOpenEnabled(true)
            .build();
    }
    
    @Bean
    public RateLimiterConfig rateLimiterConfig() {
        return RateLimiterConfig.custom()
            // 每秒允许 100 个请求
            .limitRefreshPeriod(Duration.ofSeconds(1))
            // 每次调用消耗 1 个令牌
            .limitForPeriod(100)
            // 获取令牌超时时间 0（立即返回）
            .timeoutDuration(Duration.ofMillis(0))
            .build();
    }
    
    @Bean
    public TimeLimiterConfig timeLimiterConfig() {
        return TimeLimiterConfig.custom()
            // 超时时间 3 秒
            .timeoutDuration(Duration.ofSeconds(3))
            .build();
    }
}

// 使用 Resilience4j
@Service
public class OrderService {
    
    @CircuitBreaker(name = "orderService", fallbackMethod = "fallback")
    @RateLimiter(name = "orderService", fallbackMethod = "fallback")
    @TimeLimiter(name = "orderService", fallbackMethod = "fallback")
    public CompletableFuture<Order> createOrder(Order order) {
        return CompletableFuture.supplyAsync(() -> {
            return orderMapper.insert(order);
        });
    }
    
    public CompletableFuture<Order> fallback(Order order, Exception e) {
        log.error("熔断/限流/超时：orderId={}", order.getId(), e);
        Order fallbackOrder = new Order();
        fallbackOrder.setStatus(OrderStatus.FAILED);
        return CompletableFuture.completedFuture(fallbackOrder);
    }
}
```

### 7.5 监控告警

```java
/**
 * Sentinel 监控配置
 */
@Configuration
public class SentinelConfig {
    
    @PostConstruct
    public void init() {
        // 配置数据源
        FlowRuleManager.register2Property(new NacosPropertySource<>(
            "localhost:8848",
            "com.example",
            "sentinel-flow-rules",
            FlowRule.class
        ));
        
        DegradeRuleManager.register2Property(new NacosPropertySource<>(
            "localhost:8848",
            "com.example",
            "sentinel-degrade-rules",
            DegradeRule.class
        ));
    }
    
    /**
     * 限流规则
     */
    @Bean
    public List<FlowRule> flowRules() {
        List<FlowRule> rules = new ArrayList<>();
        
        // 订单创建限流
        FlowRule rule1 = new FlowRule();
        rule1.setResource("createOrder");
        rule1.setGrade(RuleConstant.FLOW_GRADE_QPS);
        rule1.setCount(100);  // QPS 限制 100
        rule1.setLimitApp("default");
        rule1.setStrategy(RuleConstant.STRATEGY_DIRECT);
        rules.add(rule1);
        
        // 用户维度限流
        FlowRule rule2 = new FlowRule();
        rule2.setResource("createOrder");
        rule2.setGrade(RuleConstant.FLOW_GRADE_QPS);
        rule2.setCount(10);  // 每个用户 QPS 限制 10
        rule2.setLimitApp("default");
        rule2.setStrategy(RuleConstant.STRATEGY_ORIGIN);
        rules.add(rule2);
        
        return rules;
    }
    
    /**
     * 降级规则
     */
    @Bean
    public List<DegradeRule> degradeRules() {
        List<DegradeRule> rules = new ArrayList<>();
        
        // 异常比例降级
        DegradeRule rule1 = new DegradeRule();
        rule1.setResource("getProduct");
        rule1.setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_RATIO);
        rule1.setCount(0.5);  // 异常比例超过 50%
        rule1.setTimeWindow(10);  // 降级 10 秒
        rules.add(rule1);
        
        // 慢调用比例降级
        DegradeRule rule2 = new DegradeRule();
        rule2.setResource("createOrder");
        rule2.setGrade(RuleConstant.DEGRADE_GRADE_SLOW_REQUEST_RATIO);
        rule2.setCount(0.7);  // 慢调用比例超过 70%
        rule2.setSlowRequestThreshold(2000);  // 2 秒算慢调用
        rule2.setTimeWindow(30);  // 降级 30 秒
        rules.add(rule2);
        
        return rules;
    }
}

/**
 * 监控指标上报
 */
@Component
public class MetricsReporter {
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    @Scheduled(fixedRate = 10000)  // 每 10 秒上报
    public void report() {
        // 上报限流指标
        Set<String> resources = SentinelResourceRegistry.getSentinelResourceNames();
        for (String resource : resources) {
            // QPS
            double qps = QpsStatisticEntry.getQps(resource);
            meterRegistry.counter("sentinel.qps", "resource", resource).increment(qps);
            
            // 通过数
            long passQps = StatisticNode.getPassQps(resource);
            meterRegistry.counter("sentinel.pass", "resource", resource).increment(passQps);
            
            // 限流数
            long blockQps = StatisticNode.getBlockQps(resource);
            meterRegistry.counter("sentinel.block", "resource", resource).increment(blockQps);
            
            // 异常数
            long exceptionQps = StatisticNode.getExceptionQps(resource);
            meterRegistry.counter("sentinel.exception", "resource", resource).increment(exceptionQps);
        }
    }
}
```

---

## 8. 生产环境配置

### 8.1 Sentinel Dashboard

```yaml
# application.yml
spring:
  cloud:
    sentinel:
      enabled: true
      transport:
        dashboard: localhost:8080  # Dashboard 地址
        port: 8719  # 客户端端口
      datasource:
        ds1:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-flow-rules
            groupId: DEFAULT_GROUP
            rule-type: flow
        ds2:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-degrade-rules
            groupId: DEFAULT_GROUP
            rule-type: degrade
```

### 8.2 告警规则

```yaml
# Prometheus 告警规则
groups:
  - name: sentinel
    rules:
      - alert: HighBlockRate
        expr: rate(sentinel_block_total[5m]) / rate(sentinel_pass_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "限流比例过高 {{ $value | humanizePercentage }}"
      
      - alert: HighExceptionRate
        expr: rate(sentinel_exception_total[5m]) / rate(sentinel_pass_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "异常比例过高 {{ $value | humanizePercentage }}"
      
      - alert: CircuitBreakerOpen
        expr: sentinel_circuit_breaker_state == 1
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "熔断器已打开 {{ $labels.resource }}"
```

---

## 📝 实战清单

**限流算法：**
- [ ] 计数器实现
- [ ] 滑动窗口实现
- [ ] 漏桶算法实现
- [ ] 令牌桶算法实现
- [ ] Guava RateLimiter 使用

**Redis 限流：**
- [ ] 固定窗口限流
- [ ] 滑动窗口限流（ZSet）
- [ ] Lua 脚本原子性
- [ ] 分布式限流

**Sentinel：**
- [ ] Sentinel Dashboard 部署
- [ ] 流控规则配置
- [ ] 降级规则配置
- [ ] 热点参数限流
- [ ] 系统自适应保护
- [ ] Nacos 配置中心集成

**Resilience4j：**
- [ ] 熔断器配置
- [ ] 限流器配置
- [ ] 超时器配置
- [ ] 舱壁模式
- [ ] 重试机制
- [ ] 指标监控

**降级策略：**
- [ ] 返回默认值
- [ ] 返回缓存数据
- [ ] 返回友好提示
- [ ] 调用备用服务
- [ ] 异步降级

**监控告警：**
- [ ] Sentinel 监控指标
- [ ] Prometheus 集成
- [ ] Grafana 可视化
- [ ] 告警规则配置
- [ ] 钉钉/企业微信通知

**生产就绪：**
- [ ] 全链路压测
- [ ] 限流阈值评估
- [ ] 降级预案准备
- [ ] 应急演练
- [ ] 值班响应机制

---

**推荐资源：**
- 📖 Sentinel 官方文档：https://sentinelguard.io
- 📖 Resilience4j 官方文档：https://resilience4j.readme.io
- 🔗 GitHub：https://github.com/alibaba/Sentinel
- 📚 《微服务架构设计模式》
- 🎥 B 站：Sentinel 限流熔断实战
