# 分布式锁

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-06-25

---

## 📚 目录

[[toc]]

---

## 1. 为什么需要分布式锁

### 1.1 场景

- 秒杀库存扣减
- 定时任务防重
- 分布式 ID 生成
- 资源互斥访问

### 1.2 要求

| 要求 | 说明 |
|------|------|
| 互斥性 | 同一时刻只有一个客户端持有锁 |
| 防死锁 | 锁持有者故障后能自动释放 |
| 可重入 | 同一客户端可重复获取同一把锁 |
| 高可用 | 锁服务高可用 |

---

## 2. Redis 分布式锁

### 2.1 基础实现

```java
@Component
public class RedisLock {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    private static final String LOCK_PREFIX = "lock:";
    
    /**
     * 尝试获取锁
     */
    public boolean tryLock(String key, String value, long expire) {
        Boolean result = redisTemplate.opsForValue()
            .setIfAbsent(LOCK_PREFIX + key, value, expire, TimeUnit.SECONDS);
        return Boolean.TRUE.equals(result);
    }
    
    /**
     * 释放锁（Lua 脚本保证原子性）
     */
    public boolean unlock(String key, String value) {
        String script = "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                       "return redis.call('del', KEYS[1]) else return 0 end";
        
        RedisScript<Long> redisScript = RedisScript.of(script, Long.class);
        Long result = redisTemplate.execute(redisScript, 
            Collections.singletonList(LOCK_PREFIX + key), value);
        return result != null && result > 0;
    }
}
```

### 2.2 可重入锁

```java
@Component
public class ReentrantRedisLock {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private ThreadLocal<Map<String, Integer>> lockCount = 
        ThreadLocal.withInitial(HashMap::new);
    
    public boolean lock(String key, String value, long expire) {
        Map<String, Integer> countMap = lockCount.get();
        Integer count = countMap.get(key);
        
        if (count != null && count > 0) {
            // 重入
            redisTemplate.expire(LOCK_PREFIX + key, expire, TimeUnit.SECONDS);
            countMap.put(key, count + 1);
            return true;
        }
        
        // 首次获取
        Boolean result = redisTemplate.opsForValue()
            .setIfAbsent(LOCK_PREFIX + key, value, expire, TimeUnit.SECONDS);
        
        if (Boolean.TRUE.equals(result)) {
            countMap.put(key, 1);
            return true;
        }
        return false;
    }
    
    public void unlock(String key, String value) {
        Map<String, Integer> countMap = lockCount.get();
        Integer count = countMap.get(key);
        
        if (count == null || count <= 0) {
            return;
        }
        
        if (count > 1) {
            countMap.put(key, count - 1);
            return;
        }
        
        // 释放锁
        unlock(key, value);
        countMap.remove(key);
    }
}
```

### 2.3 看门狗（自动续期）

```java
@Component
public class WatchDogLock {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    private ScheduledExecutorService scheduler = 
        Executors.newScheduledThreadPool(1);
    
    private Map<String, ScheduledFuture<?>> watchDogMap = new ConcurrentHashMap<>();
    
    public boolean lock(String key, String value) {
        String lockKey = LOCK_PREFIX + key;
        Boolean result = redisTemplate.opsForValue()
            .setIfAbsent(lockKey, value, 30, TimeUnit.SECONDS);
        
        if (Boolean.TRUE.equals(result)) {
            // 启动看门狗
            startWatchDog(lockKey, value);
            return true;
        }
        return false;
    }
    
    private void startWatchDog(String lockKey, String value) {
        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(() -> {
            String currentValue = redisTemplate.opsForValue().get(lockKey);
            if (value.equals(currentValue)) {
                redisTemplate.expire(lockKey, 30, TimeUnit.SECONDS);
            } else {
                // 锁已释放，停止看门狗
                stopWatchDog(lockKey);
            }
        }, 10, 10, TimeUnit.SECONDS);
        
        watchDogMap.put(lockKey, future);
    }
    
    public void unlock(String key, String value) {
        stopWatchDog(LOCK_PREFIX + key);
        // 释放锁逻辑...
    }
    
    private void stopWatchDog(String lockKey) {
        ScheduledFuture<?> future = watchDogMap.remove(lockKey);
        if (future != null) {
            future.cancel(false);
        }
    }
}
```

---

## 3. Redisson

### 3.1 基础使用

```java
@Configuration
public class RedissonConfig {
    
    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();
        config.useSingleServer()
            .setAddress("redis://192.168.1.100:6379")
            .setPassword("password");
        return Redisson.create(config);
    }
}

@Service
public class OrderService {
    
    @Autowired
    private RedissonClient redissonClient;
    
    public void createOrder(Order order) {
        RLock lock = redissonClient.getLock("lock:order:" + order.getUserId());
        
        try {
            // 尝试获取锁，最多等待 5 秒，锁定 30 秒后自动释放
            boolean locked = lock.tryLock(5, 30, TimeUnit.SECONDS);
            if (locked) {
                // 业务逻辑
                createOrderInternal(order);
            } else {
                throw new BusinessException("获取锁失败");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("获取锁被中断");
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

### 3.2 公平锁

```java
RLock fairLock = redissonClient.getFairLock("lock:fair");
fairLock.lock();
try {
    // 业务逻辑
} finally {
    fairLock.unlock();
}
```

### 3.3 联锁（多锁）

```java
RLock lock1 = redissonClient.getLock("lock1");
RLock lock2 = redissonClient.getLock("lock2");

RedissonMultiLock multiLock = new RedissonMultiLock(lock1, lock2);
multiLock.lock();
try {
    // 业务逻辑
} finally {
    multiLock.unlock();
}
```

### 3.4 红锁（RedLock）

```java
List<RedissonClient> clients = Arrays.asList(
    Redisson.create(), Redisson.create(), Redisson.create()
);

List<RLock> locks = clients.stream()
    .map(c -> c.getLock("lock"))
    .collect(Collectors.toList());

RedissonRedLock redLock = new RedissonRedLock(locks.toArray(new RLock[0]));

try {
    boolean locked = redLock.tryLock(5, 30, TimeUnit.SECONDS);
    if (locked) {
        // 业务逻辑
    }
} finally {
    redLock.unlock();
}
```

---

## 4. ZooKeeper 分布式锁

### 4.1 实现原理

```
1. 客户端在 /locks 下创建临时顺序节点
2. 获取 /locks 下所有子节点
3. 判断自己是否是最小节点
   - 是：获得锁
   - 否：监听前一个节点
4. 释放锁：删除节点
```

### 4.2 Curator 实现

```java
// 创建锁
InterProcessMutex lock = new InterProcessMutex(client, "/locks/order");

// 获取锁
if (lock.acquire(5, TimeUnit.SECONDS)) {
    try {
        // 业务逻辑
    } finally {
        lock.release();
    }
}
```

---

## 5. 数据库分布式锁

### 5.1 唯一索引

```java
// 创建锁表
CREATE TABLE distributed_lock (
    lock_name VARCHAR(64) PRIMARY KEY,
    lock_owner VARCHAR(64),
    expire_time DATETIME
);

// 获取锁
public boolean tryLock(String lockName, String owner, long expire) {
    try {
        String sql = "INSERT INTO distributed_lock (lock_name, lock_owner, expire_time) " +
                     "VALUES (?, ?, NOW() + INTERVAL ? SECOND)";
        jdbcTemplate.update(sql, lockName, owner, expire);
        return true;
    } catch (DuplicateKeyException e) {
        return false;
    }
}

// 释放锁
public boolean unlock(String lockName, String owner) {
    String sql = "DELETE FROM distributed_lock WHERE lock_name = ? AND lock_owner = ?";
    return jdbcTemplate.update(sql, lockName, owner) > 0;
}
```

### 5.2 乐观锁

```java
// 使用版本号
UPDATE resource SET version = version + 1, status = 'locked'
WHERE id = 1 AND version = #{oldVersion}
```

---

## 6. 最佳实践

### 6.1 锁粒度

```java
// ❌ 锁粒度过大
public void process() {
    lock.lock("global");
    try {
        // 大量业务逻辑
    } finally {
        lock.unlock("global");
    }
}

// ✅ 锁粒度适中
public void process(Order order) {
    lock.lock("order:" + order.getId());
    try {
        // 只锁必要逻辑
    } finally {
        lock.unlock("order:" + order.getId());
    }
}
```

### 6.2 锁超时

```java
// 必须设置超时时间，防止死锁
lock.tryLock(5, 30, TimeUnit.SECONDS);
```

### 6.3 异常处理

```java
try {
    boolean locked = lock.tryLock(5, 30, TimeUnit.SECONDS);
    if (locked) {
        try {
            // 业务逻辑
        } finally {
            lock.unlock();
        }
    }
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
    throw new BusinessException("获取锁失败", e);
}
```

---

## 6. 实战：秒杀场景

### 6.1 场景描述

```
秒杀活动：
- 商品库存：100 个
- 并发请求：10000 个
- 要求：不能超卖、不能少卖
```

### 6.2 方案对比

| 方案 | QPS | RT | 代码复杂度 | 推荐度 |
|------|-----|----|------------|--------|
| 数据库悲观锁 | 500 | 500ms | ⭐ | ⭐⭐ |
| 数据库乐观锁 | 2000 | 200ms | ⭐⭐ | ⭐⭐⭐ |
| Redis 分布式锁 | 5000 | 50ms | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Redis 扣减库存 | 10000 | 10ms | ⭐⭐ | ⭐⭐⭐⭐⭐ |

### 6.3 Redis 分布式锁实现

```java
@Service
public class SeckillService {
    
    @Autowired
    private RedissonClient redissonClient;
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private InventoryMapper inventoryMapper;
    
    /**
     * 秒杀下单（分布式锁）
     */
    public Order seckill(Long userId, Long productId) {
        String lockKey = "lock:seckill:" + productId;
        RLock lock = redissonClient.getLock(lockKey);
        
        // 尝试获取锁，最多等待 0 秒，锁定 30 秒后自动释放
        boolean locked = false;
        try {
            locked = lock.tryLock(0, 30, TimeUnit.SECONDS);
            if (!locked) {
                throw new BusinessException("系统繁忙，请稍后再试");
            }
            
            // 1. 检查库存
            Integer stock = inventoryMapper.selectStock(productId);
            if (stock <= 0) {
                throw new BusinessException("库存不足");
            }
            
            // 2. 扣减库存
            inventoryMapper.decrease(productId, 1);
            
            // 3. 创建订单
            Order order = new Order();
            order.setUserId(userId);
            order.setProductId(productId);
            order.setStatus(OrderStatus.PENDING);
            orderMapper.insert(order);
            
            log.info("秒杀成功：userId={}, productId={}", userId, productId);
            return order;
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("获取锁失败");
        } finally {
            if (locked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

### 6.4 Redis 预扣减库存（高性能方案）

```java
@Service
public class SeckillService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private OrderMapper orderMapper;
    
    /**
     * 初始化库存（活动开始前）
     */
    public void initStock(Long productId, Integer stock) {
        String stockKey = "seckill:stock:" + productId;
        redisTemplate.opsForValue().set(stockKey, stock);
        
        // 限购：每个用户最多买 1 个
        String limitKey = "seckill:limit:" + productId;
        redisTemplate.opsForValue().set(limitKey, 1);
    }
    
    /**
     * 秒杀下单（Redis 预扣减）
     */
    public Order seckill(Long userId, Long productId) {
        String stockKey = "seckill:stock:" + productId;
        String userKey = "seckill:user:" + productId + ":" + userId;
        
        // Lua 脚本：保证原子性
        String script = 
            "local stock = tonumber(redis.call('GET', KEYS[1])) " +
            "if stock == nil or stock <= 0 then " +
            "  return -1 " +
            "end " +
            "if redis.call('EXISTS', KEYS[2]) == 1 then " +
            "  return -2 " +
            "end " +
            "redis.call('DECR', KEYS[1]) " +
            "redis.call('SET', KEYS[2], '1', 'EX', 3600) " +
            "return 1";
        
        List<String> keys = Arrays.asList(stockKey, userKey);
        Long result = redisTemplate.execute(
            RedisScript.of(script, Long.class),
            keys
        );
        
        if (result == -1) {
            throw new BusinessException("库存不足");
        }
        if (result == -2) {
            throw new BusinessException("您已购买过");
        }
        
        // 异步创建订单
        CompletableFuture.runAsync(() -> {
            createOrder(userId, productId);
        });
        
        log.info("秒杀成功：userId={}, productId={}", userId, productId);
        Order order = new Order();
        order.setUserId(userId);
        order.setProductId(productId);
        return order;
    }
    
    /**
     * 异步创建订单
     */
    @Async
    public void createOrder(Long userId, Long productId) {
        // 1. 创建订单
        Order order = new Order();
        order.setUserId(userId);
        order.setProductId(productId);
        order.setStatus(OrderStatus.PENDING);
        orderMapper.insert(order);
        
        // 2. 同步数据库库存
        String stockKey = "seckill:stock:" + productId;
        Long stock = (Long) redisTemplate.opsForValue().get(stockKey);
        inventoryMapper.updateStock(productId, stock.intValue());
    }
}
```

### 6.5 防止超卖方案

```java
/**
 * 方案 1：数据库乐观锁
 */
public int decreaseStock(Long productId, Integer count) {
    // UPDATE stock SET count = count - 1 WHERE product_id = ? AND count > 0
    return inventoryMapper.decreaseWithVersion(productId, count);
}

/**
 * 方案 2：Redis + 数据库双重校验
 */
public Order seckill(Long userId, Long productId) {
    String lockKey = "lock:seckill:" + productId;
    RLock lock = redissonClient.getLock(lockKey);
    
    if (lock.tryLock()) {
        try {
            // Redis 预检查
            String stockKey = "seckill:stock:" + productId;
            Long stock = (Long) redisTemplate.opsForValue().get(stockKey);
            if (stock == null || stock <= 0) {
                throw new BusinessException("库存不足");
            }
            
            // 数据库扣减（最终校验）
            int rows = inventoryMapper.decrease(productId, 1);
            if (rows == 0) {
                throw new BusinessException("库存不足");
            }
            
            // 创建订单
            return createOrder(userId, productId);
            
        } finally {
            lock.unlock();
        }
    } else {
        throw new BusinessException("系统繁忙");
    }
}
```

---

## 7. 生产环境配置

### 7.1 Redisson 配置

```java
@Configuration
public class RedissonConfig {
    
    @Value("${redis.host}")
    private String host;
    
    @Value("${redis.port}")
    private int port;
    
    @Value("${redis.password:}")
    private String password;
    
    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();
        
        // 单机模式
        config.useSingleServer()
            .setAddress("redis://" + host + ":" + port)
            .setPassword(StringUtils.hasText(password) ? password : null)
            .setConnectionMinimumIdleSize(10)
            .setConnectionPoolSize(64)
            .setIdleConnectionTimeout(10000)
            .setConnectTimeout(10000)
            .setTimeout(3000);
        
        // 集群模式
        // config.useClusterServers()
        //     .addNodeAddress("redis://node1:6379", "redis://node2:6379")
        //     .setPassword(password);
        
        // 哨兵模式
        // config.useSentinelServers()
        //     .addSentinelAddress("redis://sentinel1:26379")
        //     .setMasterName("mymaster");
        
        return Redisson.create(config);
    }
}
```

### 7.2 监控告警

```java
@Component
public class LockMonitor {
    
    @Autowired
    private RedissonClient redissonClient;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 统计锁使用情况
     */
    @Scheduled(fixedRate = 60000)  // 每分钟统计一次
    public void统计 LockStats() {
        // 获取所有锁
        Set<String> lockKeys = redisTemplate.keys("lock:*");
        
        Map<String, LockInfo> stats = new HashMap<>();
        for (String key : lockKeys) {
            RLock lock = redissonClient.getLock(key);
            if (lock.isLocked()) {
                LockInfo info = new LockInfo();
                info.setKey(key);
                info.setLocked(true);
                info.setHeldBy(lock.isHeldByCurrentThread() ? "current" : "other");
                stats.put(key, info);
            }
        }
        
        // 上报监控
        log.info("锁统计：{}", stats);
        
        // 告警：锁等待时间过长
        for (Map.Entry<String, LockInfo> entry : stats.entrySet()) {
            if (entry.getValue().getWaitTime() > 10000) {
                log.warn("锁等待时间过长：key={}", entry.getKey());
                // 发送告警
            }
        }
    }
}
```

### 7.3 最佳实践

```java
/**
 * 1. 锁粒度要适中
 */
// ❌ 锁粒度过大
public void process() {
    lock.lock("global");
    try {
        // 大量业务逻辑
    } finally {
        lock.unlock("global");
    }
}

// ✅ 锁粒度适中
public void process(Long orderId) {
    lock.lock("order:" + orderId);
    try {
        // 只锁必要逻辑
    } finally {
        lock.unlock("order:" + orderId);
    }
}

/**
 * 2. 必须设置超时时间
 */
// ❌ 可能死锁
lock.lock();

// ✅ 自动释放
lock.tryLock(5, 30, TimeUnit.SECONDS);

/**
 * 3. 可重入锁
 */
public void methodA() {
    lock.lock("key");
    try {
        methodB();  // 同一把锁，可重入
    } finally {
        lock.unlock("key");
    }
}

public void methodB() {
    lock.lock("key");  // 不会死锁
    try {
        // ...
    } finally {
        lock.unlock("key");
    }
}

/**
 * 4. 异常处理
 */
try {
    boolean locked = lock.tryLock(5, 30, TimeUnit.SECONDS);
    if (locked) {
        try {
            // 业务逻辑
        } finally {
            lock.unlock();  // finally 中释放
        }
    }
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
    throw new BusinessException("获取锁失败", e);
}
```

---

## 📝 实战清单

**基础实现：**
- [ ] Redis SETNX 实现
- [ ] 过期时间设置
- [ ] Lua 脚本原子性
- [ ] 锁释放验证

**Redisson：**
- [ ] Redisson 配置
- [ ] 基础锁（RLock）
- [ ] 公平锁（RFairLock）
- [ ] 联锁（RedissonMultiLock）
- [ ] 红锁（RedissonRedLock）
- [ ] 读写锁（RReadWriteLock）

**高级功能：**
- [ ] 可重入锁实现
- [ ] 看门狗自动续期
- [ ] 锁等待超时
- [ ] 锁监听器

**应用场景：**
- [ ] 秒杀防超卖
- [ ] 定时任务防重
- [ ] 分布式 ID 生成
- [ ] 库存扣减
- [ ] 订单状态流转

**生产就绪：**
- [ ] 锁监控告警
- [ ] 死锁检测
- [ ] 锁超时告警
- [ ] 降级方案
- [ ] 性能压测

---

**推荐资源：**
- 📖 Redisson 官方文档：https://redisson.org
- 🔗 GitHub：https://github.com/redisson/redisson
- 📚 《Redis 深度历险：核心原理与应用实践》
- 🎥 B 站：Redis 分布式锁实战
