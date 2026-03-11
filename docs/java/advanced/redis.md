# Redis

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-05-25

---

## 📚 目录

[[toc]]
---

## 1. Redis 概述

### 1.1 什么是 Redis

**Redis（Remote Dictionary Server）**：开源的内存数据库，可用作数据库、缓存和消息中间件。

**核心特点：**
- ✅ **高性能**：读写速度 10 万 + QPS
- ✅ **丰富数据类型**：String、List、Hash、Set、ZSet
- ✅ **持久化**：RDB、AOF
- ✅ **高可用**：主从复制、哨兵、集群
- ✅ **分布式锁**：Redlock 算法

### 1.2 应用场景

| 场景 | 说明 | 数据类型 |
|------|------|----------|
| **缓存** | 热点数据缓存 | String、Hash |
| **分布式锁** | 分布式系统互斥 | String |
| **计数器** | 点赞、播放量 | String、Hash |
| **排行榜** | 游戏排名、销量排名 | ZSet |
| **消息队列** | 异步任务处理 | List、Stream |
| **会话存储** | Session 共享 | String、Hash |
| **地理位置** | 附近的人、附近的车 | Geo |
| **位图统计** | 用户签到、活跃统计 | Bitmap |

---

## 2. 数据类型

### 2.1 String（字符串）

```bash
# 基本操作
SET key value                    # 设置值
GET key                          # 获取值
DEL key                          # 删除键
EXISTS key                       # 判断键是否存在
EXPIRE key seconds               # 设置过期时间
TTL key                          # 查看剩余时间

# 批量操作
MSET key1 value1 key2 value2     # 批量设置
MGET key1 key2                   # 批量获取

# 自增自减
INCR key                         # 自增 1
INCRBY key increment             # 自增指定值
DECR key                         # 自减 1
DECRBY key decrement             # 自减指定值

# 字符串操作
APPEND key value                 # 追加字符串
STRLEN key                       # 获取长度
GETRANGE key start end           # 获取子串
SETRANGE key offset value        # 覆盖子串
```

```java
// Spring Data Redis
@Autowired
private RedisTemplate<String, Object> redisTemplate;

// 设置
redisTemplate.opsForValue().set("name", "张三");
redisTemplate.opsForValue().set("age", "25", 30, TimeUnit.MINUTES);

// 获取
String name = (String) redisTemplate.opsForValue().get("name");

// 自增
redisTemplate.opsForValue().increment("view_count", 1);

// 分布式锁
Boolean locked = redisTemplate.opsForValue().setIfAbsent("lock", "1", 10, TimeUnit.SECONDS);
```

### 2.2 List（列表）

```bash
# 左侧操作
LPUSH key value1 value2          # 左侧插入
LPOP key                         # 左侧弹出
LINDEX key index                 # 获取指定位置元素
LLEN key                         # 获取长度

# 右侧操作
RPUSH key value1 value2          # 右侧插入
RPOP key                         # 右侧弹出

# 范围操作
LRANGE key start stop            # 获取范围元素
LTRIM key start stop             # 修剪列表
LREM key count value             # 删除元素
LSET key index value             # 设置指定位置值
LINSERT key BEFORE|AFTER pivot value  # 插入元素

# 阻塞操作（消息队列）
BLPOP key1 key2 timeout          # 阻塞左侧弹出
BRPOP key1 key2 timeout          # 阻塞右侧弹出
```

```java
// 消息队列 - 生产者
redisTemplate.opsForList().leftPush("queue", "message");

// 消息队列 - 消费者
String message = (String) redisTemplate.opsForList().rightPop("queue");

// 阻塞式消费
String message = (String) redisTemplate.opsForList().rightPop("queue", 5, TimeUnit.SECONDS);
```

### 2.3 Hash（哈希）

```bash
# 基本操作
HSET key field value             # 设置字段值
HGET key field                   # 获取字段值
HDEL key field                   # 删除字段
HEXISTS key field                # 判断字段是否存在
HLEN key                         # 获取字段数量

# 批量操作
HMSET key field1 value1 field2 value2  # 批量设置
HMGET key field1 field2                # 批量获取
HGETALL key                            # 获取所有字段

# 自增自减
HINCRBY key field increment      # 字段自增
HINCRBYFLOAT key field increment # 字段自增浮点数

# 遍历
HKEYS key                        # 获取所有字段
HVALS key                        # 获取所有值
HSCAN key cursor                 # 扫描遍历
```

```java
// 存储对象
Map<String, Object> user = new HashMap<>();
user.put("name", "张三");
user.put("age", 25);
redisTemplate.opsForHash().putAll("user:1", user);

// 获取对象
Map<Object, Object> user = redisTemplate.opsForHash().entries("user:1");

// 字段操作
redisTemplate.opsForHash().put("user:1", "email", "test@example.com");
String email = (String) redisTemplate.opsForHash().get("user:1", "email");

// 自增
redisTemplate.opsForHash().increment("user:1", "login_count", 1);
```

### 2.4 Set（集合）

```bash
# 基本操作
SADD key member1 member2       # 添加元素
SREM key member                # 删除元素
SISMEMBER key member           # 判断元素是否存在
SCARD key                      # 获取元素数量
SMEMBERS key                   # 获取所有元素
SRANDMEMBER key count          # 随机获取元素
SPOP key count                 # 随机弹出元素

# 集合运算
SINTER key1 key2               # 交集
SUNION key1 key2               # 并集
SDIFF key1 key2                # 差集

# 存储运算结果
SINTERSTORE dest key1 key2     # 交集存储
SUNIONSTORE dest key1 key2     # 并集存储
SDIFFSTORE dest key1 key2      # 差集存储
```

```java
// 添加元素
redisTemplate.opsForSet().add("tags", "Java", "Redis", "MySQL");

// 判断是否存在
Boolean exists = redisTemplate.opsForSet().isMember("tags", "Java");

// 获取所有元素
Set<Object> tags = redisTemplate.opsForSet().members("tags");

// 交集
Set<Object> common = redisTemplate.opsForSet().intersect("tags1", "tags2");
```

### 2.5 ZSet（有序集合）

```bash
# 基本操作
ZADD key score member          # 添加元素（带分数）
ZREM key member                # 删除元素
ZSCORE key member              # 获取分数
ZCARD key                      # 获取元素数量
ZRANK key member               # 获取排名
ZCOUNT key min max             # 统计分数范围内元素数量

# 范围查询
ZRANGE key start stop [WITHSCORES]       # 按排名查询（升序）
ZREVRANGE key start stop [WITHSCORES]    # 按排名查询（降序）
ZRANGEBYSCORE key min max [WITHSCORES]   # 按分数查询（升序）
ZREVRANGEBYSCORE key max min [WITHSCORES] # 按分数查询（降序）

# 自增分数
ZINCRBY key increment member   # 自增分数

# 集合运算
ZINTERSTORE dest key1 key2     # 交集
ZUNIONSTORE dest key1 key2     # 并集
```

```java
// 添加元素（排行榜）
redisTemplate.opsForZSet().add("ranking", "user1", 100);
redisTemplate.opsForZSet().add("ranking", "user2", 200);
redisTemplate.opsForZSet().add("ranking", "user3", 150);

// 获取 Top10（降序）
Set<Object> top10 = redisTemplate.opsForZSet().reverseRange("ranking", 0, 9);

// 获取排名
Long rank = redisTemplate.opsForZSet().reverseRank("ranking", "user1");

// 获取分数
Double score = redisTemplate.opsForZSet().score("ranking", "user1");

// 自增分数
redisTemplate.opsForZSet().incrementScore("ranking", "user1", 10);
```

### 2.6 特殊数据类型

#### Bitmap（位图）

```bash
# 位操作
SETBIT key offset value        # 设置位值
GETBIT key offset              # 获取位值
BITCOUNT key [start end]       # 统计 1 的数量
BITOP AND|OR|XOR|NOT dest key1 key2  # 位运算

# 使用场景：用户签到
SETBIT sign:2026-03-11 1 1     # 用户 1 签到
GETBIT sign:2026-03-11 1       # 查询用户 1 是否签到
BITCOUNT sign:2026-03-11       # 统计签到人数
```

#### HyperLogLog（基数统计）

```bash
# 基数统计
PFADD key element1 element2    # 添加元素
PFCOUNT key1 key2              # 统计基数
PFMERGE dest key1 key2         # 合并
```

```java
// UV 统计
redisTemplate.opsForHyperLogLog().add("uv:2026-03-11", "user1", "user2");
Long uv = redisTemplate.opsForHyperLogLog().size("uv:2026-03-11");
```

#### Geo（地理位置）

```bash
# 地理位置
GEOADD key longitude latitude member  # 添加位置
GEOPOS key member                     # 获取位置
GEODIST key member1 member2 [unit]    # 计算距离
GEORADIUS key x y radius unit [WITHDIST]  # 半径查询
GEORADIUSBYMEMBER key member radius unit  # 半径查询（基于成员）
```

```java
// 附近的人
redisTemplate.opsForGeo().add("location", new Point(116.40, 39.90), "user1");
redisTemplate.opsForGeo().add("location", new Point(116.41, 39.91), "user2");

// 查询附近 5km 内的人
Circle circle = new Circle(new Point(116.40, 39.90), new Distance(5, Metrics.KILOMETERS));
GeoResults<Object> results = redisTemplate.opsForGeo().search("location", circle);
```

---

## 3. 持久化机制

### 3.1 RDB（Redis Database）

```
RDB：快照方式，定时将内存数据保存到磁盘

优点：
- 文件紧凑，适合备份
- 恢复速度快
- 性能影响小

缺点：
- 可能丢失最后一次快照后的数据
- 大数据量时 fork 子进程耗时
```

```conf
# redis.conf 配置
save 900 1           # 900 秒内至少 1 个 key 变化
save 300 10          # 300 秒内至少 10 个 key 变化
save 60 10000        # 60 秒内至少 10000 个 key 变化

stop-writes-on-bgsave-error yes  # RDB 失败时停止写入
rdbcompression yes               # 压缩
rdbchecksum yes                  # 校验和
dbfilename dump.rdb              # 文件名
dir ./                           # 保存目录
```

### 3.2 AOF（Append Only File）

```
AOF：日志方式，记录每次写操作

优点：
- 数据更安全（最多丢失 1 秒数据）
- 日志可读

缺点：
- 文件体积大
- 恢复速度慢
```

```conf
# redis.conf 配置
appendonly yes                   # 开启 AOF
appendfilename "appendonly.aof"  # 文件名

# 同步策略
appendfsync everysec             # 每秒同步（推荐）
# appendfsync always             # 每次写入都同步（最安全，性能差）
# appendfsync no                 # 操作系统决定（性能最好，不安全）

# AOF 重写
auto-aof-rewrite-percentage 100  # 增长 100% 时重写
auto-aof-rewrite-min-size 64mb   # 最小 64MB 才重写
```

### 3.3 RDB vs AOF

| 对比项 | RDB | AOF |
|--------|-----|-----|
| **数据安全性** | 低（可能丢失较多） | 高（最多丢失 1 秒） |
| **文件大小** | 小 | 大 |
| **恢复速度** | 快 | 慢 |
| **性能影响** | 小 | 中 |
| **适用场景** | 备份、快速恢复 | 高数据安全要求 |

### 3.4 混合持久化（Redis 4.0+）

```
混合持久化：RDB + AOF 结合

- AOF 重写时，将当前内存数据以 RDB 格式写入 AOF 文件
- 后续写操作以 AOF 格式追加

优点：
- 结合 RDB 和 AOF 的优点
- 恢复速度快，数据安全性高
```

```conf
# 开启混合持久化
aof-use-rdb-preamble yes
```

---

## 4. 高可用机制

### 4.1 主从复制

```
主从复制：一主多从，数据同步

主节点（Master）：
- 处理写操作
- 同步数据到从节点

从节点（Slave）：
- 处理读操作
- 同步主节点数据
```

```conf
# 从节点配置
replicaof 192.168.1.100 6379   # 主节点 IP 和端口
masterauth <password>          # 主节点密码
replica-read-only yes          # 只读
```

### 4.2 哨兵模式（Sentinel）

```
哨兵模式：监控主从节点，自动故障转移

哨兵功能：
1. 监控：监控主从节点是否正常运行
2. 通知：故障时通知管理员
3. 自动故障转移：主节点故障时选举新主节点
4. 配置提供：客户端连接时提供主节点信息
```

```conf
# sentinel.conf 配置
sentinel monitor mymaster 192.168.1.100 6379 2  # 监控主节点，2 个哨兵同意即故障
sentinel down-after-milliseconds mymaster 5000  # 5 秒无响应认为故障
sentinel parallel-syncs mymaster 1              # 故障转移时同时同步的从节点数
sentinel failover-timeout mymaster 60000        # 故障转移超时时间
```

```bash
# 启动哨兵
redis-sentinel sentinel.conf

# 查看主节点信息
redis-cli -p 26379 sentinel master mymaster
```

### 4.3 Redis Cluster（集群）

```
Redis Cluster：分布式、去中心化

特点：
- 数据分片：16384 个 slot，分散到多个节点
- 去中心化：每个节点存储集群元数据
- 高可用：主从复制 + 自动故障转移
```

```bash
# 创建集群
redis-cli --cluster create \
  192.168.1.100:7000 192.168.1.101:7000 192.168.1.102:7000 \
  192.168.1.100:7001 192.168.1.101:7001 192.168.1.102:7001 \
  --cluster-replicas 1  # 1 主 1 从

# 查看集群信息
redis-cli -c -p 7000 cluster info
redis-cli -c -p 7000 cluster nodes

# 查看 slot 分布
redis-cli -c -p 7000 cluster slots
```

### 4.4 集群数据读写

```
数据分片：CRC16(key) % 16384

读写流程：
1. 客户端计算 key 的 slot
2. 连接到对应节点
3. 如果 key 在其他节点，返回 MOVED 错误，告知正确节点
4. 客户端重新连接正确节点
```

```java
// Redis Cluster 配置
@Bean
public RedisConnectionFactory redisConnectionFactory() {
    RedisClusterConfiguration clusterConfig = new RedisClusterConfiguration();
    clusterConfig.clusterNode("192.168.1.100", 7000);
    clusterConfig.clusterNode("192.168.1.101", 7000);
    clusterConfig.clusterNode("192.168.1.102", 7000);
    
    return new LettuceConnectionFactory(clusterConfig);
}
```

---

## 5. 缓存设计

### 5.1 缓存更新策略

#### Cache Aside Pattern（旁路缓存）

```java
// 读操作
public User getById(Long id) {
    // 1. 查缓存
    User user = redisTemplate.opsForValue().get("user:" + id);
    if (user != null) {
        return user;
    }
    
    // 2. 查数据库
    user = userMapper.getById(id);
    
    // 3. 写缓存
    if (user != null) {
        redisTemplate.opsForValue().set("user:" + id, user, 30, TimeUnit.MINUTES);
    }
    
    return user;
}

// 写操作
public void update(User user) {
    // 1. 更新数据库
    userMapper.update(user);
    
    // 2. 删除缓存（先更新数据库，再删除缓存）
    redisTemplate.delete("user:" + user.getId());
}
```

#### Read/Write Through（读写穿透）

```
Redis 作为主存储，应用层不直接操作数据库

读：Redis 没有 → 自动从数据库加载 → 写入 Redis → 返回
写：写入 Redis → Redis 自动同步到数据库
```

#### Write Behind（异步缓存写入）

```
写操作只写 Redis，Redis 异步批量写入数据库

优点：高性能
缺点：可能丢失数据
```

### 5.2 缓存常见问题

#### 缓存穿透

```
问题：查询不存在的数据，缓存不命中，请求直达数据库

解决方案：
1. 缓存空对象（设置较短过期时间）
2. 布隆过滤器（推荐 ⭐）
```

```java
// 方案 1：缓存空对象
public User getById(Long id) {
    User user = redisTemplate.opsForValue().get("user:" + id);
    if (user != null) {
        return "NULL".equals(user) ? null : user;
    }
    
    user = userMapper.getById(id);
    if (user == null) {
        redisTemplate.opsForValue().set("user:" + id, "NULL", 5, TimeUnit.MINUTES);
    } else {
        redisTemplate.opsForValue().set("user:" + id, user, 30, TimeUnit.MINUTES);
    }
    
    return user;
}

// 方案 2：布隆过滤器
@Autowired
private RedissonClient redissonClient;

public User getById(Long id) {
    RBloomFilter<Long> bloomFilter = redissonClient.getBloomFilter("user:bloom");
    if (!bloomFilter.contains(id)) {
        return null;  // 一定不存在
    }
    
    // 可能存在，继续查询
    // ...
}
```

#### 缓存击穿

```
问题：热点 key 过期，大量请求直达数据库

解决方案：
1. 互斥锁（推荐 ⭐）
2. 逻辑过期（不设 TTL）
```

```java
// 方案 1：互斥锁
public User getById(Long id) {
    User user = redisTemplate.opsForValue().get("user:" + id);
    if (user != null) {
        return user;
    }
    
    // 获取分布式锁
    RLock lock = redissonClient.getLock("lock:user:" + id);
    if (lock.tryLock()) {
        try {
            // 双重检查
            user = redisTemplate.opsForValue().get("user:" + id);
            if (user != null) {
                return user;
            }
            
            user = userMapper.getById(id);
            redisTemplate.opsForValue().set("user:" + id, user, 30, TimeUnit.MINUTES);
        } finally {
            lock.unlock();
        }
    } else {
        // 获取锁失败，等待重试
        Thread.sleep(100);
        return getById(id);
    }
    
    return user;
}

// 方案 2：逻辑过期
@Data
public class CacheObject<T> {
    private T data;
    private Long expireTime;  // 逻辑过期时间
}

public User getById(Long id) {
    CacheObject<User> cache = (CacheObject<User>) redisTemplate.opsForValue().get("user:" + id);
    if (cache != null) {
        if (cache.getExpireTime() > System.currentTimeMillis()) {
            return cache.getData();  // 未过期
        } else {
            // 异步更新
            CompletableFuture.runAsync(() -> refreshCache(id));
            return cache.getData();  // 返回旧数据
        }
    }
    
    // 首次查询
    return refreshCache(id);
}

private User refreshCache(Long id) {
    User user = userMapper.getById(id);
    CacheObject<User> cache = new CacheObject<>();
    cache.setData(user);
    cache.setExpireTime(System.currentTimeMillis() + 30 * 60 * 1000);
    redisTemplate.opsForValue().set("user:" + id, cache);
    return user;
}
```

#### 缓存雪崩

```
问题：大量 key 同时过期，请求直达数据库

解决方案：
1. 随机过期时间（推荐 ⭐）
2. 高可用架构（哨兵、集群）
3. 限流降级
```

```java
// 随机过期时间
long expireTime = 30 * 60 + new Random().nextInt(600);  // 30-40 分钟
redisTemplate.opsForValue().set(key, value, expireTime, TimeUnit.SECONDS);
```

### 5.3 缓存预热

```
系统启动时，将热点数据加载到缓存

方案：
1. 启动时加载
2. 定时任务加载
3. 实时统计热点数据
```

```java
@Component
public class CacheWarmer implements ApplicationRunner {
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Override
    public void run(ApplicationArguments args) {
        // 加载热点用户
        List<User> hotUsers = userMapper.selectHotUsers(100);
        for (User user : hotUsers) {
            redisTemplate.opsForValue().set("user:" + user.getId(), user, 30, TimeUnit.MINUTES);
        }
    }
}
```

---

## 6. 实战场景

### 6.1 分布式锁

```java
// Redisson 实现（推荐 ⭐）
@Autowired
private RedissonClient redissonClient;

public void doSomething() {
    RLock lock = redissonClient.getLock("lock:order:" + orderId);
    
    // 尝试获取锁，最多等待 5 秒，锁定 10 秒后自动释放
    if (lock.tryLock(5, 10, TimeUnit.SECONDS)) {
        try {
            // 业务逻辑
            processOrder(orderId);
        } finally {
            lock.unlock();
        }
    } else {
        // 获取锁失败
        throw new BusinessException("系统繁忙，请稍后重试");
    }
}

// 看门狗机制：业务执行时间超过锁超时时间，自动续期
RLock lock = redissonClient.getLock("lock:order:" + orderId);
lock.lock();  // 默认 30 秒，每 10 秒自动续期
try {
    // 业务逻辑（即使超过 30 秒也不会释放）
} finally {
    lock.unlock();
}
```

### 6.2 秒杀系统

```java
@Service
public class SeckillService {
    
    @Autowired
    private RedissonClient redissonClient;
    
    @Autowired
    private OrderMapper orderMapper;
    
    public Result seckill(Long userId, Long productId) {
        // 1. 库存预扣减（Lua 脚本保证原子性）
        String script = 
            "local stock = tonumber(redis.call('GET', KEYS[1])) " +
            "if stock <= 0 then return 0 end " +
            "redis.call('DECR', KEYS[1]) " +
            "return 1";
        
        RedisScript<Long> redisScript = RedisScript.of(script, Long.class);
        Long result = redisTemplate.execute(redisScript, Collections.singletonList("stock:" + productId));
        
        if (result == 0) {
            return Result.fail("库存不足");
        }
        
        // 2. 创建订单（异步）
        CompletableFuture.runAsync(() -> {
            RLock lock = redissonClient.getLock("lock:order:" + userId + ":" + productId);
            if (lock.tryLock()) {
                try {
                    // 创建订单
                    Order order = new Order();
                    order.setUserId(userId);
                    order.setProductId(productId);
                    orderMapper.insert(order);
                } finally {
                    lock.unlock();
                }
            }
        });
        
        return Result.success("秒杀成功");
    }
}
```

### 6.3 点赞功能

```java
@Service
public class LikeService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    // 点赞
    public void like(Long userId, Long articleId) {
        String key = "article:like:" + articleId;
        
        // 1. 判断是否已点赞
        Boolean isLiked = redisTemplate.opsForSet().isMember(key, userId);
        if (isLiked) {
            return;
        }
        
        // 2. 添加点赞用户
        redisTemplate.opsForSet().add(key, userId);
        
        // 3. 文章点赞数 +1
        redisTemplate.opsForHash().increment("article:stat", articleId.toString(), 1);
        
        // 4. 异步更新数据库
        CompletableFuture.runAsync(() -> {
            // 更新数据库点赞数
        });
    }
    
    // 取消点赞
    public void unlike(Long userId, Long articleId) {
        String key = "article:like:" + articleId;
        
        redisTemplate.opsForSet().remove(key, userId);
        redisTemplate.opsForHash().increment("article:stat", articleId.toString(), -1);
    }
    
    // 获取点赞数
    public Long getLikeCount(Long articleId) {
        String key = "article:like:" + articleId;
        return redisTemplate.opsForSet().size(key);
    }
    
    // 判断是否点赞
    public Boolean isLiked(Long userId, Long articleId) {
        String key = "article:like:" + articleId;
        return redisTemplate.opsForSet().isMember(key, userId);
    }
}
```

### 6.4 排行榜

```java
@Service
public class RankingService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    // 更新分数
    public void updateScore(Long userId, Long score) {
        redisTemplate.opsForZSet().add("ranking", userId, score);
    }
    
    // 自增分数
    public void incrementScore(Long userId, Long score) {
        redisTemplate.opsForZSet().incrementScore("ranking", userId, score);
    }
    
    // 获取 Top10
    public Set<Object> getTop10() {
        return redisTemplate.opsForZSet().reverseRange("ranking", 0, 9);
    }
    
    // 获取用户排名
    public Long getRank(Long userId) {
        Long rank = redisTemplate.opsForZSet().reverseRank("ranking", userId);
        return rank != null ? rank + 1 : null;  // 排名从 1 开始
    }
    
    // 获取用户分数
    public Double getScore(Long userId) {
        return redisTemplate.opsForZSet().score("ranking", userId);
    }
    
    // 获取用户周围排名（我的排名及前后 5 名）
    public List<Object> getAroundRank(Long userId) {
        Long rank = getRank(userId);
        if (rank == null) {
            return Collections.emptyList();
        }
        
        long start = Math.max(0, rank - 6);
        long end = rank + 4;
        
        return new ArrayList<>(redisTemplate.opsForZSet().reverseRange("ranking", start, end));
    }
}
```

### 6.5 用户签到

```java
@Service
public class SignService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    // 签到
    public void sign(Long userId) {
        String key = "sign:" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        redisTemplate.opsForValue().setBit(key, userId, true);
    }
    
    // 判断是否签到
    public Boolean isSigned(Long userId) {
        String key = "sign:" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        return redisTemplate.opsForValue().getBit(key, userId);
    }
    
    // 统计签到人数
    public Long getSignCount() {
        String key = "sign:" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        return redisTemplate.opsForValue().bitCount(key);
    }
    
    // 连续签到天数
    public Integer getContinuousSignDays(Long userId) {
        int days = 0;
        LocalDate date = LocalDate.now();
        
        for (int i = 0; i < 31; i++) {
            String key = "sign:" + date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            Boolean signed = redisTemplate.opsForValue().getBit(key, userId);
            
            if (signed) {
                days++;
                date = date.minusDays(1);
            } else {
                break;
            }
        }
        
        return days;
    }
}
```

---

## 7. 性能优化

### 7.1 键值设计

```
✅ 推荐：
- key 命名规范：业务：类型：ID（user:info:1）
- key 长度适中（不超过 1KB）
- 控制 value 大小（不超过 10KB）
- 设置合理的过期时间

❌ 避免：
- key 过长（浪费内存）
- key 无规律（难以管理）
- value 过大（网络传输慢）
- 永不过期（内存泄漏）
```

### 7.2 批量操作

```java
// ❌ 避免：循环操作
for (int i = 1; i <= 100; i++) {
    redisTemplate.opsForValue().set("key:" + i, "value:" + i);
}

// ✅ 推荐：批量操作
Map<String, String> map = new HashMap<>();
for (int i = 1; i <= 100; i++) {
    map.put("key:" + i, "value:" + i);
}
redisTemplate.opsForValue().multiSet(map);

// Pipeline 批量操作
redisTemplate.executePipelined(session -> {
    for (int i = 1; i <= 100; i++) {
        session.opsForValue().set("key:" + i, "value:" + i);
    }
    return null;
});
```

### 7.3 大 Key 处理

```
大 Key 问题：
- 占用内存多
- 网络传输慢
- 阻塞 Redis 线程

解决方案：
1. 拆分大 Key（Hash 分片）
2. 异步删除（UNLINK）
3. 定期扫描发现大 Key
```

```java
// Hash 分片
public void setBigHash(String key, Map<String, Object> data) {
    int shardCount = 10;
    for (Map.Entry<String, Object> entry : data.entrySet()) {
        int shard = Math.abs(entry.getKey().hashCode() % shardCount);
        redisTemplate.opsForHash().put(key + ":" + shard, entry.getKey(), entry.getValue());
    }
}

// 异步删除（Redis 4.0+）
redisTemplate.execute((RedisCallback<Void>) connection -> {
    connection.execute("UNLINK".getBytes(), key.getBytes());
    return null;
});
```

### 7.4 慢查询优化

```conf
# redis.conf
slowlog-log-slower-than 10000  # 记录超过 10ms 的命令
slowlog-max-len 128            # 最多记录 128 条
```

```bash
# 查看慢查询
redis-cli slowlog get 10

# 清空慢查询日志
redis-cli slowlog reset
```

### 7.5 内存优化

```
1. 使用 Hash 代替 String 存储对象
2. 使用 ZSet 代替多个 String 实现排行榜
3. 使用 Bitmap 代替 Boolean 数组
4. 使用 HyperLogLog 代替 Set 统计 UV
5. 开启内存淘汰策略
```

```conf
# 内存淘汰策略
maxmemory 2gb
maxmemory-policy allkeys-lru  # 淘汰最近最少使用的 key
# maxmemory-policy volatile-lru  # 淘汰有过期时间的 key
# maxmemory-policy allkeys-random  # 随机淘汰
# maxmemory-policy volatile-ttl  # 淘汰即将过期的 key
# maxmemory-policy noeviction  # 不淘汰，写操作返回错误
```

---

## 8. 常见问题

### 8.1 内存碎片

```
问题：频繁增删改导致内存碎片

解决：
1. 重启 Redis
2. 执行 MEMORY DOCTOR 诊断
3. 升级 Redis 版本（4.0+ 自动整理）
```

### 8.2 主从延迟

```
原因：
1. 网络延迟
2. 主节点压力大
3. 全量复制频繁

解决：
1. 优化网络
2. 减少主节点写压力
3. 避免大 Key 操作
```

### 8.3 脑裂问题

```
问题：网络分区导致多个主节点

解决：
1. 配置 min-slaves-to-write
2. 配置 min-slaves-max-lag
3. 使用 Redis Cluster
```

```conf
# 至少 1 个从节点正常才接受写请求
min-slaves-to-write 1
min-slaves-max-lag 10
```

---

## 💡 常见面试题

1. **Redis 有哪些数据类型？使用场景？**
2. **RDB 和 AOF 的区别？**
3. **Redis 如何实现高可用？**
4. **缓存穿透、击穿、雪崩的区别和解决方案？**
5. **Redis 为什么这么快？**
6. **Redis 线程模型？**
7. **分布式锁如何实现？**
8. **Redis 内存淘汰策略？**
9. **Redis 集群原理？**
10. **如何保证缓存和数据库一致性？**

---

## 📚 参考资料

- 《Redis 设计与实现》
- 《Redis 实战》
- [Redis 官方文档](https://redis.io/documentation)
- [Redis 源码](https://github.com/redis/redis)

---

> 💡 **学习建议**：Redis 是必备技能，建议：
> 1. 掌握 5 种基本数据类型和使用场景
> 2. 理解持久化和高可用机制
> 3. 掌握缓存设计模式
> 4. 实战项目练习（分布式锁、排行榜、秒杀）
