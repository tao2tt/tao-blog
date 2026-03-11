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

## 📝 待办事项

- [ ] Redis 分布式锁实现
- [ ] Redisson 使用
- [ ] ZooKeeper 锁实现
- [ ] 数据库锁实现
- [ ] 可重入锁实现
- [ ] 看门狗机制
- [ ] 红锁算法

---

**推荐资源：**
- 📖 Redisson 官方文档
- 🔗 GitHub：https://github.com/redisson/redisson
