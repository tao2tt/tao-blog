# 业务场景应用

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-29  
> 难度：⭐⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 电商场景

### 1.1 秒杀系统设计

**问题：** 高并发秒杀，如何防止超卖？

**解决方案：**

```java
/**
 * 方案 1：Redis 预扣减库存
 */
@Service
public class SeckillService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private OrderMapper orderMapper;
    
    public Order seckill(Long userId, Long productId) {
        String stockKey = "seckill:stock:" + productId;
        String userKey = "seckill:user:" + productId + ":" + userId;
        
        // Lua 脚本保证原子性
        String script = 
            "local stock = tonumber(redis.call('GET', KEYS[1])) " +
            "if stock == nil or stock <= 0 then return -1 end " +
            "if redis.call('EXISTS', KEYS[2]) == 1 then return -2 end " +
            "redis.call('DECR', KEYS[1]) " +
            "redis.call('SET', KEYS[2], '1', 'EX', 3600) " +
            "return 1";
        
        List<String> keys = Arrays.asList(stockKey, userKey);
        Long result = redisTemplate.execute(
            RedisScript.of(script, Long.class), keys);
        
        if (result == -1) throw new BusinessException("库存不足");
        if (result == -2) throw new BusinessException("您已购买过");
        
        // 异步创建订单
        CompletableFuture.runAsync(() -> createOrder(userId, productId));
        
        return new Order(userId, productId);
    }
}

/**
 * 方案 2：数据库乐观锁
 */
public int decreaseStock(Long productId, Integer count) {
    // UPDATE stock SET count = count - 1, version = version + 1
    // WHERE product_id = ? AND version = #{oldVersion} AND count >= #{count}
    return stockMapper.decreaseWithVersion(productId, count);
}
```

### 1.2 购物车设计

**问题：** 如何设计高性能购物车？

**解决方案：**

```java
/**
 * 购物车设计
 */
@Service
public class CartService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    // Redis Hash 存储购物车
    // Key: cart:{userId}
    // Field: productId
    // Value: {count, selected, createTime}
    
    public void addToCart(Long userId, Long productId, Integer count) {
        String key = "cart:" + userId;
        
        // 获取现有数量
        Object value = redisTemplate.opsForHash().get(key, productId.toString());
        int existingCount = value != null ? Integer.parseInt(value.toString()) : 0;
        
        // 更新数量
        redisTemplate.opsForHash().put(key, productId.toString(), 
            String.valueOf(existingCount + count));
        
        // 设置过期时间（30 天）
        redisTemplate.expire(key, 30, TimeUnit.DAYS);
    }
    
    public List<CartItem> getCart(Long userId) {
        String key = "cart:" + userId;
        Map<Object, Object> entries = redisTemplate.opsForHash().entries(key);
        
        List<CartItem> items = new ArrayList<>();
        for (Map.Entry<Object, Object> entry : entries.entrySet()) {
            items.add(new CartItem(
                Long.parseLong(entry.getKey().toString()),
                Integer.parseInt(entry.getValue().toString())
            ));
        }
        
        return items;
    }
    
    // 同步到数据库（异步）
    @Async
    public void syncToDB(Long userId) {
        List<CartItem> items = getCart(userId);
        cartMapper.batchInsert(userId, items);
    }
}
```

### 1.3 订单超时取消

**问题：** 订单 30 分钟未支付自动取消

**解决方案：**

```java
/**
 * 方案 1：Redis 过期监听
 */
@Configuration
public class RedisConfig {
    
    @Bean
    public RedisMessageListenerContainer container(
            RedisConnectionFactory connectionFactory) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener((message, pattern) -> {
            String orderId = new String(message.getBody());
            orderService.cancelOrder(orderId);
        }, new PatternTopic("__keyevent@0__:expired"));
        return container;
    }
}

@Service
public class OrderService {
    
    public void createOrder(Order order) {
        // 创建订单
        orderMapper.insert(order);
        
        // 设置过期时间（30 分钟）
        String key = "order:timeout:" + order.getId();
        redisTemplate.opsForValue().set(key, order.getId(), 30, TimeUnit.MINUTES);
    }
    
    public void cancelOrder(String orderId) {
        // 取消订单逻辑
        orderMapper.updateStatus(orderId, OrderStatus.CANCELLED);
    }
}

/**
 * 方案 2：延迟队列（RabbitMQ）
 */
@RabbitListener(queues = "order.timeout.queue")
public void handleTimeoutOrder(String orderId) {
    orderService.cancelOrder(orderId);
}

public void createOrder(Order order) {
    orderMapper.insert(order);
    
    // 发送延迟消息（30 分钟后）
    rabbitTemplate.convertAndSend("order.timeout.exchange", "", 
        order.getId(), message -> {
            message.getMessageProperties().setDelay(30 * 60 * 1000);
            return message;
        });
}
```

---

## 2. 社交场景

### 2.1 关注/粉丝系统

**问题：** 如何设计高性能关注系统？

**解决方案：**

```java
/**
 * 关注系统设计（Redis ZSet）
 */
@Service
public class FollowService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    // 关注列表：follow:{userId}
    // 粉丝列表：follower:{userId}
    
    public void follow(Long userId, Long targetId) {
        String followKey = "follow:" + userId;
        String followerKey = "follower:" + targetId;
        
        // 添加到关注列表
        redisTemplate.opsForZSet().add(followKey, targetId.toString(), 
            System.currentTimeMillis());
        
        // 添加到粉丝列表
        redisTemplate.opsForZSet().add(followerKey, userId.toString(), 
            System.currentTimeMillis());
    }
    
    public void unfollow(Long userId, Long targetId) {
        String followKey = "follow:" + userId;
        String followerKey = "follower:" + targetId;
        
        redisTemplate.opsForZSet().remove(followKey, targetId.toString());
        redisTemplate.opsForZSet().remove(followerKey, userId.toString());
    }
    
    public boolean isFollowing(Long userId, Long targetId) {
        String key = "follow:" + userId;
        Double score = redisTemplate.opsForZSet().score(key, targetId.toString());
        return score != null;
    }
    
    public List<Long> getFollowings(Long userId, int limit) {
        String key = "follow:" + userId;
        Set<Object> results = redisTemplate.opsForZSet()
            .reverseRange(key, 0, limit - 1);
        
        return results.stream()
            .map(r -> Long.parseLong(r.toString()))
            .collect(Collectors.toList());
    }
    
    public long getFollowerCount(Long userId) {
        String key = "follower:" + userId;
        return redisTemplate.opsForZSet().size(key);
    }
}
```

### 2.2 Feed 流系统

**问题：** 如何设计微博/Twitter 的 Feed 流？

**解决方案：**

```java
/**
 * Feed 流设计（推模式 + 拉模式结合）
 */
@Service
public class FeedService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private FollowService followService;
    
    // 用户 Feed 流：feed:{userId}
    // 用户发布：post:{userId}
    
    // 推模式：发布时推送到粉丝 Feed
    public void publishPost(Post post) {
        // 1. 存储帖子
        postMapper.insert(post);
        
        // 2. 推送到自己的帖子列表
        String postKey = "post:" + post.getUserId();
        redisTemplate.opsForZSet().add(postKey, post.getId().toString(), 
            post.getCreateTime().toEpochMilli());
        
        // 3. 推送到粉丝的 Feed（只推给在线粉丝）
        List<Long> followers = followService.getFollowers(post.getUserId(), 1000);
        for (Long followerId : followers) {
            String feedKey = "feed:" + followerId;
            redisTemplate.opsForZSet().add(feedKey, post.getId().toString(), 
                post.getCreateTime().toEpochMilli());
            
            // 限制 Feed 长度（最近 1000 条）
            redisTemplate.opsForZSet().removeRange(feedKey, 0, -1001);
        }
    }
    
    // 拉模式：查看 Feed 时从关注的人拉取
    public List<Post> getFeed(Long userId, int page, int size) {
        String feedKey = "feed:" + userId;
        long start = (page - 1) * size;
        long end = start + size - 1;
        
        Set<Object> postIds = redisTemplate.opsForZSet()
            .reverseRange(feedKey, start, end);
        
        if (postIds.isEmpty()) {
            // 拉模式：从关注的人获取
            return pullFeed(userId, page, size);
        }
        
        // 批量获取帖子详情
        List<Long> ids = postIds.stream()
            .map(id -> Long.parseLong(id.toString()))
            .collect(Collectors.toList());
        
        return postMapper.selectBatch(ids);
    }
    
    private List<Post> pullFeed(Long userId, int page, int size) {
        List<Long> followings = followService.getFollowings(userId, 100);
        // 从关注的人的帖子列表中获取
        // ...
    }
}
```

---

## 3. 支付场景

### 3.1 分布式事务

**问题：** 支付涉及多个服务，如何保证一致性？

**解决方案：**

```java
/**
 * 方案：本地消息表 + 最终一致性
 */
@Service
public class PaymentService {
    
    @Autowired
    private PaymentMapper paymentMapper;
    
    @Autowired
    private MessageMapper messageMapper;
    
    @Autowired
    private RocketMQTemplate rocketMQTemplate;
    
    @Transactional
    public Payment createPayment(PaymentRequest request) {
        // 1. 创建支付单
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setAmount(request.getAmount());
        payment.setStatus(PaymentStatus.PENDING);
        paymentMapper.insert(payment);
        
        // 2. 写入本地消息表
        Message message = new Message();
        message.setTopic("payment_success");
        message.setBody(JsonUtils.toJson(payment));
        message.setStatus("PENDING");
        messageMapper.insert(message);
        
        return payment;
    }
    
    // 定时任务扫描发送
    @Scheduled(fixedRate = 5000)
    public void scanAndSend() {
        List<Message> messages = messageMapper.selectPending(100);
        
        for (Message message : messages) {
            try {
                rocketMQTemplate.send(message.getTopic(), message.getBody());
                messageMapper.updateStatus(message.getId(), "SENT");
            } catch (Exception e) {
                log.error("发送失败", e);
                // 重试逻辑
            }
        }
    }
}

// 订单服务监听
@RabbitListener(queues = "payment.success.queue")
public void handlePaymentSuccess(String message) {
    Payment payment = JsonUtils.fromJson(message, Payment.class);
    orderService.updateStatus(payment.getOrderId(), OrderStatus.PAID);
}
```

### 3.2 幂等性设计

**问题：** 如何防止重复支付？

**解决方案：**

```java
/**
 * 幂等性设计
 */
@Service
public class PaymentService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    public PaymentResult pay(PaymentRequest request) {
        String idempotentKey = "payment:idempotent:" + request.getOrderId();
        
        // 1. 检查是否已处理
        String result = (String) redisTemplate.opsForValue().get(idempotentKey);
        if (result != null) {
            return JsonUtils.fromJson(result, PaymentResult.class);
        }
        
        // 2. 获取分布式锁
        RLock lock = redissonClient.getLock("payment:lock:" + request.getOrderId());
        
        try {
            boolean locked = lock.tryLock(5, 30, TimeUnit.SECONDS);
            if (!locked) {
                throw new BusinessException("系统繁忙");
            }
            
            // 3. 双重检查
            result = (String) redisTemplate.opsForValue().get(idempotentKey);
            if (result != null) {
                return JsonUtils.fromJson(result, PaymentResult.class);
            }
            
            // 4. 执行支付
            PaymentResult paymentResult = doPay(request);
            
            // 5. 记录结果（设置过期时间）
            redisTemplate.opsForValue().set(idempotentKey, 
                JsonUtils.toJson(paymentResult), 24, TimeUnit.HOURS);
            
            return paymentResult;
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("获取锁失败");
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

---

## 4. 搜索场景

### 4.1 商品搜索

**问题：** 如何实现高性能商品搜索？

**解决方案：**

```java
/**
 * Elasticsearch 商品搜索
 */
@Service
public class ProductSearchService {
    
    @Autowired
    private RestHighLevelClient esClient;
    
    /**
     * 搜索商品
     */
    public SearchResult search(ProductSearchRequest request) throws IOException {
        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
        
        // 1. 构建查询
        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
        
        // 关键词查询
        if (StringUtils.hasText(request.getKeyword())) {
            boolQuery.must(QueryBuilders.multiMatchQuery(request.getKeyword(), 
                "name", "description", "brand"));
        }
        
        // 分类过滤
        if (request.getCategoryId() != null) {
            boolQuery.filter(QueryBuilders.termQuery("category_id", 
                request.getCategoryId()));
        }
        
        // 价格范围
        if (request.getMinPrice() != null || request.getMaxPrice() != null) {
            RangeQueryBuilder priceRange = QueryBuilders.rangeQuery("price");
            if (request.getMinPrice() != null) {
                priceRange.gte(request.getMinPrice());
            }
            if (request.getMaxPrice() != null) {
                priceRange.lte(request.getMaxPrice());
            }
            boolQuery.filter(priceRange);
        }
        
        sourceBuilder.query(boolQuery);
        
        // 2. 分页
        sourceBuilder.from((request.getPage() - 1) * request.getSize());
        sourceBuilder.size(request.getSize());
        
        // 3. 排序
        if ("price_asc".equals(request.getSort())) {
            sourceBuilder.sort("price", SortOrder.ASC);
        } else if ("price_desc".equals(request.getSort())) {
            sourceBuilder.sort("price", SortOrder.DESC);
        } else {
            sourceBuilder.sort("_score", SortOrder.DESC);
        }
        
        // 4. 高亮
        sourceBuilder.highlighter(new HighlightBuilder()
            .field("name")
            .field("description")
            .preTags("<em>")
            .postTags("</em>"));
        
        // 5. 执行查询
        SearchRequest searchRequest = new SearchRequest("products");
        searchRequest.source(sourceBuilder);
        
        SearchResponse response = esClient.search(searchRequest, 
            RequestOptions.DEFAULT);
        
        // 6. 解析结果
        return parseResponse(response);
    }
    
    /**
     * 同步商品到 ES
     */
    public void syncProduct(Product product) throws IOException {
        IndexRequest request = new IndexRequest("products")
            .id(product.getId().toString())
            .source(JsonUtils.toJson(product), XContentType.JSON);
        
        esClient.index(request, RequestOptions.DEFAULT);
    }
}
```

---

## 5. 消息队列场景

### 5.1 异步解耦

**问题：** 注册成功后发送欢迎邮件和短信，如何解耦？

**解决方案：**

```java
/**
 * 异步解耦
 */
@Service
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private RocketMQTemplate rocketMQTemplate;
    
    public User register(User user) {
        // 1. 创建用户
        userMapper.insert(user);
        
        // 2. 发送消息（异步）
        rocketMQTemplate.send("user.registered", user);
        
        return user;
    }
}

// 邮件服务监听
@RabbitListener(queues = "user.registered.email")
public void sendWelcomeEmail(User user) {
    emailService.sendWelcomeEmail(user.getEmail());
}

// 短信服务监听
@RabbitListener(queues = "user.registered.sms")
public void sendWelcomeSms(User user) {
    smsService.sendWelcomeSms(user.getPhone());
}
```

### 5.2 流量削峰

**问题：** 大促期间订单量激增，如何保护数据库？

**解决方案：**

```java
/**
 * 流量削峰
 */
@Service
public class OrderService {
    
    @Autowired
    private RocketMQTemplate rocketMQTemplate;
    
    public Order createOrder(OrderRequest request) {
        // 1. 校验
        validate(request);
        
        // 2. 发送到消息队列（削峰）
        String orderId = UUID.randomUUID().toString();
        rocketMQTemplate.send("order.create", 
            new OrderMessage(orderId, request));
        
        // 3. 返回排队中
        Order order = new Order();
        order.setId(orderId);
        order.setStatus(OrderStatus.PENDING);
        return order;
    }
}

// 订单处理服务
@RabbitListener(queues = "order.create.queue")
public void processOrder(OrderMessage message) {
    // 限流处理
    RateLimiter rateLimiter = RateLimiter.create(100.0);  // 每秒 100 个
    rateLimiter.acquire();
    
    // 创建订单
    orderService.doCreateOrder(message);
}
```

---

## 📝 待办事项

- [ ] 理解秒杀系统设计
- [ ] 掌握购物车设计
- [ ] 掌握订单超时取消
- [ ] 理解关注/粉丝系统
- [ ] 理解 Feed 流设计
- [ ] 掌握分布式事务
- [ ] 掌握幂等性设计
- [ ] 理解 Elasticsearch 搜索
- [ ] 掌握消息队列场景

---

**下一讲：[性能优化案例](/data-structure-algorithm/practice/performance)**

---

**推荐资源：**
- 📖 《企业级架构设计》
- 🔗 美团技术博客
- 🔗 阿里技术博客
