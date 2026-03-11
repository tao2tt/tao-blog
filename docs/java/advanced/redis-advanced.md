# Redis 高级

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-05-01

---

## 📚 目录

[[toc]]

---

## 1. Redis 持久化

### 1.1 RDB 持久化

**RDB（Redis Database）**：快照方式，指定时间间隔保存数据快照。

**配置：**
```conf
# redis.conf
save 900 1        # 900 秒内至少 1 个 key 变化
save 300 10       # 300 秒内至少 10 个 key 变化
save 60 10000     # 60 秒内至少 10000 个 key 变化

dbfilename dump.rdb
dir ./
```

**触发方式：**
- 满足 save 配置条件自动触发
- 执行 `SAVE` 或 `BGSAVE` 命令
- 执行 `SHUTDOWN` 命令

**优缺点：**
| 优点 | 缺点 |
|------|------|
| 紧凑的单文件 | 可能丢失最后一次快照后的数据 |
| 恢复速度快 | 大数据量时 fork 子进程耗时 |
| 适合备份 | 无法实时持久化 |

### 1.2 AOF 持久化

**AOF（Append Only File）**：记录每次写操作，重启时重放。

**配置：**
```conf
appendonly yes
appendfilename "appendonly.aof"

# 同步策略
appendfsync always    # 每次写入都同步（最安全，最慢）
appendfsync everysec  # 每秒同步一次（推荐）
appendfsync no        # 由操作系统决定（最快，可能丢失数据）

# AOF 重写
auto-aof-rewrite-percentage 100  # 增长 100% 时重写
auto-aof-rewrite-min-size 64mb   # 最小 64MB 才重写
```

**AOF 重写：**
```bash
# 手动触发
BGREWRITEAOF

# 重写过程
1. 子进程根据当前内存快照写入新 AOF 文件
2. 父进程继续处理命令，写入 AOF 缓冲区
3. 重写完成后，将缓冲区命令追加到新 AOF 文件
```

### 1.3 混合持久化（Redis 4.0+）

```conf
aof-use-rdb-preamble yes  # AOF 文件开头用 RDB 格式
```

**优势：**
- 结合 RDB 和 AOF 的优点
- 重写速度快，文件紧凑
- 恢复速度快，数据丢失少

---

## 2. Redis 主从复制

### 2.1 配置主从

```conf
# 从节点配置
replicaof 192.168.1.100 6379  # Redis 5.0 之前用 slaveof

# 只读（可选）
replica-read-only yes

# 优先级（用于哨兵故障转移）
replica-priority 100  # 值越小优先级越高
```

### 2.2 复制原理

```
1. 从节点执行 SLAVEOF 命令
2. 从节点发送 PING 检查主节点
3. 主节点执行 BGSAVE 生成 RDB 文件
4. 主节点将 RDB 文件发送给从节点
5. 从节点加载 RDB 文件
6. 主节点将缓冲区命令发送给从节点
7. 从节点执行命令，完成同步
```

### 2.3 全量复制 vs 增量复制

**全量复制：**
- 首次复制
- 从节点断开时间过长
- 主节点 ID 变化

**增量复制（Redis 2.8+）：**
- 基于复制偏移量（offset）
- 基于复制缓冲区
- 基于复制积压缓冲区（replication backlog）

---

## 3. Redis 哨兵模式

### 3.1 哨兵配置

```conf
# sentinel.conf
port 26379
sentinel monitor mymaster 192.168.1.100 6379 2  # 监控主节点，2 个哨兵同意即故障
sentinel down-after-milliseconds mymaster 5000  # 5 秒无响应认为故障
sentinel parallel-syncs mymaster 1              # 故障转移时同时同步的从节点数
sentinel failover-timeout mymaster 180000       # 故障转移超时时间
```

### 3.2 故障转移流程

```
1. 哨兵检测到主节点故障
2. 哨兵之间协商确认故障
3. 选举 leader 哨兵
4. leader 哨兵选择最优从节点
5. leader 哨兵发送 SLAVEOF NO ONE 给选中的从节点
6. leader 哨兵发送 SLAVEOF 给其他从节点
7. 更新配置，故障转移完成
```

### 3.3 Java 客户端配置

```java
// Jedis
Set<String> sentinels = new HashSet<>();
sentinels.add("192.168.1.101:26379");
sentinels.add("192.168.1.102:26379");
sentinels.add("192.168.1.103:26379");

JedisSentinelPool pool = new JedisSentinelPool(
    "mymaster", sentinels, poolConfig, password);

// Spring Data Redis
@Bean
public RedisConnectionFactory redisConnectionFactory() {
    RedisSentinelConfiguration config = new RedisSentinelConfiguration();
    config.master("mymaster");
    config.sentinel("192.168.1.101", 26379);
    config.sentinel("192.168.1.102", 26379);
    config.sentinel("192.168.1.103", 26379);
    config.setPassword(RedisPassword.of("password"));
    
    return new RedisSentinelConnectionFactory(config);
}
```

---

## 4. Redis Cluster 集群

### 4.1 集群原理

**数据分片：**
- 16384 个 slot（槽）
- 每个节点负责一部分 slot
- 公式：`CRC16(key) % 16384`

**节点通信：**
- Gossip 协议
- 每个节点维护集群元数据

### 4.2 搭建集群

```bash
# 启动 6 个节点（3 主 3 从）
redis-server --cluster-enabled yes --cluster-config-file nodes.conf --port 7000
redis-server --cluster-enabled yes --cluster-config-file nodes.conf --port 7001
...

# 创建集群
redis-cli --cluster create \
  127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 \
  127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
  --cluster-replicas 1
```

### 4.3 集群操作

```bash
# 查看集群信息
redis-cli --cluster info 127.0.0.1:7000

# 查看节点状态
redis-cli --cluster check 127.0.0.1:7000

# 添加主节点
redis-cli --cluster add-node 127.0.0.1:7006 127.0.0.1:7000

# 添加从节点
redis-cli --cluster add-node 127.0.0.1:7007 127.0.0.1:7000 --cluster-slave

# 重新分片
redis-cli --cluster reshard 127.0.0.1:7000

# 故障转移
redis-cli --cluster failover 127.0.0.1:7000
```

### 4.4 Spring Boot 配置

```yaml
spring:
  redis:
    cluster:
      nodes:
        - 192.168.1.100:7000
        - 192.168.1.101:7001
        - 192.168.1.102:7002
      max-redirects: 3
    password: password
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
```

---

## 5. 分布式锁

### 5.1 基础实现

```java
@Component
public class RedisLock {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    private static final String LOCK_PREFIX = "lock:";
    private static final long DEFAULT_EXPIRE = 30;  // 秒
    
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

### 5.2 可重入锁

```java
@Component
public class ReentrantLock {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    private ThreadLocal<Map<String, Integer>> lockCount = 
        ThreadLocal.withInitial(HashMap::new);
    
    public boolean lock(String key, String value, long expire) {
        Map<String, Integer> countMap = lockCount.get();
        Integer count = countMap.get(key);
        
        if (count != null && count > 0) {
            countMap.put(key, count + 1);
            return true;
        }
        
        Boolean result = redisTemplate.opsForValue()
            .setIfAbsent("lock:" + key, value, expire, TimeUnit.SECONDS);
        
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

### 5.3 Redisson 分布式锁

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
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

### 5.4 Redlock 算法

```java
public class Redlock {
    
    private List<RedissonClient> redissonClients;
    
    public boolean lock(String key, String value, long expire) {
        long startTime = System.currentTimeMillis();
        int successCount = 0;
        List<RLock> locks = new ArrayList<>();
        
        for (RedissonClient client : redissonClients) {
            RLock lock = client.getLock(key);
            try {
                boolean locked = lock.tryLock(0, expire, TimeUnit.MILLISECONDS);
                if (locked) {
                    locks.add(lock);
                    successCount++;
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        long elapsedTime = System.currentTimeMillis() - startTime;
        boolean isValid = successCount > redissonClients.size() / 2 
                         && elapsedTime < expire;
        
        if (!isValid) {
            // 释放所有锁
            locks.forEach(lock -> {
                if (lock.isHeldByCurrentThread()) {
                    lock.unlock();
                }
            });
        }
        
        return isValid;
    }
}
```

---

## 6. 缓存穿透、击穿、雪崩

### 6.1 缓存穿透

**问题：** 查询不存在的数据，请求直达数据库。

**解决方案：**

```java
// 1. 布隆过滤器
@Component
public class BloomFilterUtil {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String BLOOM_FILTER_KEY = "bloom:user";
    
    public boolean mightContain(Long userId) {
        // 使用 Redis 的布隆过滤器（Redis 4.0+ 模块）
        // 或使用位图模拟
        long hash1 = hash1(userId);
        long hash2 = hash2(userId);
        
        Boolean bit1 = redisTemplate.opsForValue().setBit(BLOOM_FILTER_KEY, hash1, true);
        Boolean bit2 = redisTemplate.opsForValue().setBit(BLOOM_FILTER_KEY, hash2, true);
        
        return bit1 && bit2;
    }
    
    public void add(Long userId) {
        long hash1 = hash1(userId);
        long hash2 = hash2(userId);
        redisTemplate.opsForValue().setBit(BLOOM_FILTER_KEY, hash1, true);
        redisTemplate.opsForValue().setBit(BLOOM_FILTER_KEY, hash2, true);
    }
}

// 2. 缓存空值
public User getUser(Long id) {
    String key = "user:" + id;
    User user = redisTemplate.opsForValue().get(key);
    
    if (user != null) {
        return NULL_USER.equals(user) ? null : user;
    }
    
    // 查询数据库
    user = userMapper.selectById(id);
    
    if (user == null) {
        // 缓存空值，设置较短过期时间
        redisTemplate.opsForValue().set(key, NULL_USER, 5, TimeUnit.MINUTES);
        return null;
    }
    
    redisTemplate.opsForValue().set(key, user, 30, TimeUnit.MINUTES);
    return user;
}
```

### 6.2 缓存击穿

**问题：** 热点 key 过期瞬间，大量请求直达数据库。

**解决方案：**

```java
// 1. 互斥锁
public User getUserWithLock(Long id) {
    String key = "user:" + id;
    User user = redisTemplate.opsForValue().get(key);
    
    if (user != null) {
        return user;
    }
    
    // 获取互斥锁
    String lockKey = "lock:user:" + id;
    String lockValue = UUID.randomUUID().toString();
    boolean locked = redisTemplate.opsForValue()
        .setIfAbsent(lockKey, lockValue, 10, TimeUnit.SECONDS);
    
    if (locked) {
        try {
            // 双重检查
            user = redisTemplate.opsForValue().get(key);
            if (user != null) {
                return user;
            }
            
            // 查询数据库
            user = userMapper.selectById(id);
            redisTemplate.opsForValue().set(key, user, 30, TimeUnit.MINUTES);
        } finally {
            // 释放锁
            String script = "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                           "return redis.call('del', KEYS[1]) else return 0 end";
            redisTemplate.execute(RedisScript.of(script, Long.class), 
                Collections.singletonList(lockKey), lockValue);
        }
    } else {
        // 等待重试
        try {
            Thread.sleep(50);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return getUserWithLock(id);
    }
    
    return user;
}

// 2. 逻辑过期
public class CacheObject<T> {
    private T data;
    private long expireTime;  // 逻辑过期时间
    
    public boolean isExpired() {
        return System.currentTimeMillis() > expireTime;
    }
}

public User getUserWithLogicalExpire(Long id) {
    String key = "user:" + id;
    CacheObject<User> cache = redisTemplate.opsForValue().get(key);
    
    if (cache == null || cache.isExpired()) {
        // 异步重建缓存
        rebuildCacheAsync(id);
    }
    
    return cache != null ? cache.getData() : null;
}
```

### 6.3 缓存雪崩

**问题：** 大量 key 同时过期，请求直达数据库。

**解决方案：**

```java
// 1. 随机过期时间
public void cacheUser(User user) {
    String key = "user:" + user.getId();
    // 基础时间 + 随机时间
    long expire = 30 + new Random().nextInt(60);  // 30-90 分钟
    redisTemplate.opsForValue().set(key, user, expire, TimeUnit.MINUTES);
}

// 2. 多级缓存
@Component
public class MultiLevelCache {
    
    @Autowired
    private CacheManager localCacheManager;  // Caffeine
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    public User getUser(Long id) {
        String key = "user:" + id;
        
        // 1. 本地缓存
        Cache cache = localCacheManager.getCache("user");
        User user = cache != null ? cache.get(key, User.class) : null;
        if (user != null) {
            return user;
        }
        
        // 2. Redis 缓存
        user = redisTemplate.opsForValue().get(key);
        if (user != null) {
            localCacheManager.getCache("user").put(key, user);
            return user;
        }
        
        // 3. 数据库
        user = userMapper.selectById(id);
        if (user != null) {
            redisTemplate.opsForValue().set(key, user, 30, TimeUnit.MINUTES);
            localCacheManager.getCache("user").put(key, user);
        }
        
        return user;
    }
}
```

---

## 7. 最佳实践

### 7.1 键设计规范

```
格式：项目名：模块名：业务名：ID
示例：mall:user:info:1001
     mall:order:list:20260311:1001
```

### 7.2 大 Key 处理

```bash
# 查找大 key
redis-cli --bigkeys

# 内存分析
redis-cli --memkeys

# 删除大 key（分批）
UNLINK key  # 异步删除（Redis 4.0+）
```

### 7.3 热 Key 处理

```bash
# 实时监控
redis-cli --hotkeys

# 解决方案
1. 本地缓存
2. 读写分离
3. Key 拆分（key:1, key:2, key:3）
```

### 7.4 内存淘汰策略

```conf
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru  # 淘汰最近最少使用的 key
# 其他策略：
# volatile-lru: 淘汰有过期时间的 LRU
# allkeys-random: 随机淘汰
# volatile-ttl: 淘汰即将过期的
# noeviction: 不淘汰，写操作报错
```

---

## 8. 实战：缓存架构设计

### 8.1 多级缓存架构

```java
@Component
public class MultiLevelCache {
    
    @Autowired
    private CacheManager localCacheManager;  // Caffeine
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * 查询用户（三级缓存）
     */
    public User getUser(Long id) {
        String key = "user:" + id;
        
        // L1: 本地缓存（Caffeine）
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
            // 回填 L1
            cache.put(key, user);
            return user;
        }
        
        // L3: 数据库
        log.debug("L3 database query: {}", id);
        user = userMapper.selectById(id);
        
        if (user != null) {
            // 写入 L2
            redisTemplate.opsForValue().set(key, user, 30, TimeUnit.MINUTES);
            // 回填 L1
            cache.put(key, user);
        } else {
            // 缓存空值，防止穿透
            redisTemplate.opsForValue().set(key, new NullUser(), 5, TimeUnit.MINUTES);
        }
        
        return user;
    }
    
    /**
     * 更新用户（缓存一致性）
     */
    @Transactional
    public void updateUser(User user) {
        String key = "user:" + user.getId();
        
        // 1. 更新数据库
        userMapper.updateById(user);
        
        // 2. 删除缓存（Cache Aside Pattern）
        redisTemplate.delete(key);
        localCacheManager.getCache("user").evict(key);
        
        // 3. 发送消息，通知其他节点清除本地缓存
        eventPublisher.publishEvent(new CacheEvictEvent(key));
    }
}
```

### 8.2 缓存一致性方案

```java
/**
 * 方案 1：延时双删
 */
@Service
public class CacheConsistencyService1 {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private TaskScheduler taskScheduler;
    
    @Transactional
    public void updateUser(User user) {
        String key = "user:" + user.getId();
        
        // 1. 删除缓存
        redisTemplate.delete(key);
        
        // 2. 更新数据库
        userMapper.updateById(user);
        
        // 3. 延时再次删除（防止主从同步延迟）
        taskScheduler.schedule(
            () -> redisTemplate.delete(key),
            Instant.now().plusMillis(500)
        );
    }
}

/**
 * 方案 2：监听 Binlog（Canal）
 */
@Component
public class CanalListener {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @StreamListener("canal:user")
    public void handleUserChange(UserChangeEvent event) {
        String key = "user:" + event.getUserId();
        
        switch (event.getEventType()) {
            case INSERT:
            case UPDATE:
                // 从数据库加载最新数据
                User user = userMapper.selectById(event.getUserId());
                redisTemplate.opsForValue().set(key, user, 30, TimeUnit.MINUTES);
                break;
            case DELETE:
                redisTemplate.delete(key);
                break;
        }
    }
}

/**
 * 方案 3：消息队列最终一致性
 */
@Component
public class MQCacheListener {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @RabbitListener(queues = "cache.evict.user")
    public void handleCacheEvict(String key) {
        // 删除缓存
        redisTemplate.delete(key);
    }
}
```

### 8.3 热点 Key 发现与处理

```java
@Component
public class HotKeyDetector {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    // 访问计数器
    private ConcurrentHashMap<String, LongAdder> accessCounter = 
        new ConcurrentHashMap<>();
    
    // 热点 Key 集合
    private ConcurrentHashMap<String, Boolean> hotKeys = 
        new ConcurrentHashMap<>();
    
    private ScheduledExecutorService scheduler = 
        Executors.newScheduledThreadPool(1);
    
    @PostConstruct
    public void init() {
        // 每分钟统计一次
        scheduler.scheduleAtFixedRate(this::analyzeHotKeys, 0, 1, TimeUnit.MINUTES);
    }
    
    public void recordAccess(String key) {
        LongAdder counter = accessCounter.computeIfAbsent(key, k -> new LongAdder());
        counter.increment();
    }
    
    private void analyzeHotKeys() {
        Map<String, Long> stats = new HashMap<>();
        
        // 统计访问频率
        for (Map.Entry<String, LongAdder> entry : accessCounter.entrySet()) {
            long count = entry.getValue().sumThenReset();
            if (count > 1000) {  // 阈值：每分钟 1000 次
                stats.put(entry.getKey(), count);
                hotKeys.put(entry.getKey(), true);
            }
        }
        
        // 上报监控
        if (!stats.isEmpty()) {
            log.warn("发现热点 Key: {}", stats);
        }
        
        accessCounter.clear();
    }
    
    public boolean isHotKey(String key) {
        return hotKeys.containsKey(key);
    }
}

// 使用
@Service
public class ProductService {
    
    @Autowired
    private HotKeyDetector hotKeyDetector;
    
    @Autowired
    private LocalCache localCache;
    
    public Product getProduct(Long id) {
        String key = "product:" + id;
        
        // 热点 Key 优先查本地缓存
        if (hotKeyDetector.isHotKey(key)) {
            Product product = localCache.get(key);
            if (product != null) {
                return product;
            }
        }
        
        // 正常流程
        Product product = redisTemplate.opsForValue().get(key);
        if (product == null) {
            product = productMapper.selectById(id);
            redisTemplate.opsForValue().set(key, product, 30, TimeUnit.MINUTES);
        }
        
        // 记录访问
        hotKeyDetector.recordAccess(key);
        
        return product;
    }
}
```

---

## 9. 生产环境配置

### 9.1 Redis 配置模板

```conf
# /etc/redis/redis.conf

# 基础配置
bind 0.0.0.0
port 6379
timeout 300
tcp-keepalive 60
daemonize yes
supervised systemd
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile /var/log/redis/redis-server.log
databases 16

# 安全配置
requirepass YourStrongPassword123!
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""

# 内存管理
maxmemory 4gb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# 持久化（混合持久化）
save 900 1
save 300 10
save 60 10000

stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis

appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
aof-use-rdb-preamble yes

# 主从复制
# replicaof 192.168.1.100 6379
# masterauth YourMasterPassword
replica-read-only yes
repl-diskless-sync no
repl-diskless-sync-delay 5
repl-ping-replica-period 10
repl-timeout 60

# 集群配置
# cluster-enabled yes
# cluster-config-file nodes.conf
# cluster-node-timeout 5000
# cluster-replica-validity-factor 10
# cluster-migration-barrier 1
# cluster-require-full-coverage yes

# 慢查询
slowlog-log-slower-than 10000
slowlog-max-len 128

# 监控
latency-monitor-threshold 100
```

### 9.2 监控告警

```yaml
# Prometheus 配置
scrape_configs:
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
    metrics_path: /metrics

# Grafana 告警规则
groups:
  - name: redis
    rules:
      - alert: RedisDown
        expr: redis_up == 0
        for: 1m
        annotations:
          summary: "Redis 实例 {{ $labels.instance }} 宕机"
      
      - alert: RedisHighMemory
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.9
        for: 5m
        annotations:
          summary: "Redis 内存使用率超过 90%"
      
      - alert: RedisSlowLog
        expr: increase(redis_slowlog_length[5m]) > 10
        annotations:
          summary: "Redis 慢查询增多"
```

---

## 📝 实战清单

**基础环境：**
- [ ] Redis 安装与配置
- [ ] 持久化配置（RDB+AOF 混合）
- [ ] 内存淘汰策略配置
- [ ] 安全加固（密码、命令重命名）

**高可用：**
- [ ] 主从复制搭建
- [ ] 哨兵模式配置（3 哨兵 +2 从）
- [ ] Redis Cluster 集群（6 节点）
- [ ] 客户端集群配置

**缓存开发：**
- [ ] 基础 CRUD 操作
- [ ] 多级缓存实现（Caffeine+Redis）
- [ ] 缓存穿透/击穿/雪崩解决方案
- [ ] 缓存一致性方案（双删/Canal/MQ）

**分布式锁：**
- [ ] 基础分布式锁实现
- [ ] 可重入锁实现
- [ ] 看门狗自动续期
- [ ] Redisson 集成
- [ ] Redlock 红锁算法

**性能优化：**
- [ ] 热点 Key 发现与处理
- [ ] 大 Key 排查与优化
- [ ] 批量操作（Pipeline）
- [ ] Lua 脚本优化

**监控运维：**
- [ ] Redis Exporter 部署
- [ ] Prometheus + Grafana 监控
- [ ] 慢查询分析
- [ ] 内存分析
- [ ] 告警规则配置

---

**推荐资源：**
- 📚 《Redis 设计与实现》
- 📚 《Redis 深度历险：核心原理与应用实践》
- 📖 Redis 官方文档：https://redis.io
- 🔗 Redis 中文社区：http://redis.cn
- 🎥 B 站：Redis 核心原理与实战
