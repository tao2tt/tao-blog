# 分布式事务

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-06-20

---

## 📚 目录

[[toc]]

---

## 1. 理论基础

### 1.1 CAP 定理

| 特性 | 说明 |
|------|------|
| Consistency（一致性） | 所有节点同一时间看到相同数据 |
| Availability（可用性） | 每个请求都有响应 |
| Partition tolerance（分区容错） | 网络分区时系统仍能运行 |

**结论：** 三者不可兼得，通常选择 CP 或 AP

### 1.2 BASE 理论

| 特性 | 说明 |
|------|------|
| Basically Available（基本可用） | 允许部分功能不可用 |
| Soft state（软状态） | 允许中间状态 |
| Eventually consistent（最终一致性） | 最终达到一致 |

### 1.3 事务隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|----------|------|------------|--------|
| READ UNCOMMITTED | ✅ | ✅ | ✅ |
| READ COMMITTED | ❌ | ✅ | ✅ |
| REPEATABLE READ | ❌ | ❌ | ✅ |
| SERIALIZABLE | ❌ | ❌ | ❌ |

---

## 2. 2PC（两阶段提交）

### 2.1 流程

```
阶段 1：准备阶段
1. 协调者询问所有参与者是否可以提交
2. 参与者执行事务，记录 undo/redo log，不提交
3. 参与者回复协调者（Yes/No）

阶段 2：提交阶段
1. 协调者根据投票结果决定提交/回滚
2. 所有参与者执行提交/回滚
3. 释放资源
```

### 2.2 优缺点

| 优点 | 缺点 |
|------|------|
| 强一致性 | 性能差（同步阻塞） |
| 实现简单 | 单点故障（协调者） |
| | 数据不一致（协调者宕机） |

---

## 3. TCC（Try-Confirm-Cancel）

### 3.1 流程

```
Try：预留资源
- 检查并预留资源
- 不执行业务

Confirm：确认执行
- 使用预留的资源
- 幂等执行

Cancel：取消执行
- 释放预留资源
- 幂等执行
```

### 3.2 实现示例

```java
@TwoPhaseBusinessAction(name = "createOrder", commitMethod = "confirm", rollbackMethod = "cancel")
public interface OrderService {
    
    // Try 阶段
    @BusinessActionContextParameter(paramName = "order")
    boolean tryCreateOrder(Order order);
    
    // Confirm 阶段
    boolean confirm(@BusinessActionContext context);
    
    // Cancel 阶段
    boolean cancel(@BusinessActionContext context);
}

@Service
public class OrderServiceImpl implements OrderService {
    
    @Override
    public boolean tryCreateOrder(Order order) {
        // 1. 检查库存
        // 2. 冻结库存
        // 3. 创建订单（状态：待支付）
        return true;
    }
    
    @Override
    public boolean confirm(@BusinessActionContext context) {
        // 1. 确认订单（状态：已支付）
        // 2. 扣减冻结库存
        return true;
    }
    
    @Override
    public boolean cancel(@BusinessActionContext context) {
        // 1. 取消订单
        // 2. 释放冻结库存
        return true;
    }
}
```

### 3.3 优缺点

| 优点 | 缺点 |
|------|------|
| 性能较好（异步） | 实现复杂 |
| 无长期锁资源 | 需要幂等设计 |
| | 需要防悬挂、空回滚 |

---

## 4. 本地消息表

### 4.1 流程

```
1. 业务执行，写入本地消息表（同一事务）
2. 定时任务扫描未发送消息
3. 发送消息到 MQ
4. 消费者处理
5. 更新消息状态
```

### 4.2 实现示例

```java
@Service
public class OrderService {
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private MessageMapper messageMapper;
    
    @Autowired
    private RocketMQTemplate rocketMQTemplate;
    
    @Transactional
    public void createOrder(Order order) {
        // 1. 创建订单
        orderMapper.insert(order);
        
        // 2. 写入本地消息表
        Message message = new Message();
        message.setBusinessId(order.getId());
        message.setTopic("order_created");
        message.setStatus("PENDING");
        messageMapper.insert(message);
    }
}

@Component
public class MessageScanner {
    
    @Scheduled(fixedRate = 5000)
    public void scan() {
        List<Message> messages = messageMapper.selectPending();
        for (Message message : messages) {
            try {
                rocketMQTemplate.send(message.getTopic(), message);
                messageMapper.updateStatus(message.getId(), "SENT");
            } catch (Exception e) {
                log.error("发送失败", e);
            }
        }
    }
}
```

---

## 5. Seata 分布式事务

### 5.1 AT 模式

```java
// 全局事务注解
@GlobalTransactional
public void createOrder(Order order) {
    // 1. 创建订单
    orderService.create(order);
    
    // 2. 扣减库存
    inventoryClient.decrease(order.getProductId(), order.getCount());
    
    // 3. 扣减余额
    accountClient.decrease(order.getUserId(), order.getAmount());
}
```

### 5.2 配置

```yaml
seata:
  enabled: true
  tx-service-group: my_tx_group
  service:
    vgroup-mapping:
      my_tx_group: default
    grouplist:
      default: 192.168.1.100:8091
  registry:
    type: nacos
    nacos:
      server-addr: 192.168.1.100:8848
  config:
    type: nacos
    nacos:
      server-addr: 192.168.1.100:8848
```

### 5.3 Seata 原理

```
1. 一阶段：业务数据 + undo log 在同一本地事务提交
2. 二阶段提交：异步删除 undo log
3. 二阶段回滚：根据 undo log 补偿
```

---

## 6. Saga 模式

### 6.1 流程

```
正向执行：T1 → T2 → T3
失败回滚：C3 → C2 → C1
```

### 6.2 状态机配置

```json
{
  "Name": "orderSaga",
  "Comment": "订单 Saga",
  "StartState": "CreateOrder",
  "States": {
    "CreateOrder": {
      "Type": "ServiceTask",
      "ServiceName": "orderService",
      "ServiceMethod": "create",
      "Next": "ReserveInventory"
    },
    "ReserveInventory": {
      "Type": "ServiceTask",
      "ServiceName": "inventoryService",
      "ServiceMethod": "reserve",
      "Next": "DeductBalance",
      "CompensateState": "CancelReservation"
    },
    "DeductBalance": {
      "Type": "ServiceTask",
      "ServiceName": "accountService",
      "ServiceMethod": "deduct",
      "End": true,
      "CompensateState": "RefundBalance"
    }
  }
}
```

---

## 7. 最佳实践

### 7.1 方案选型

| 场景 | 推荐方案 |
|------|----------|
| 强一致性 | 2PC、Seata AT |
| 高性能 | TCC、本地消息表 |
| 简单场景 | 本地消息表 |
| 复杂流程 | Saga |

### 7.2 幂等设计

```java
// 防重表
CREATE TABLE dedup_table (
    request_id VARCHAR(64) PRIMARY KEY,
    create_time DATETIME
);

// 业务处理
public void process(Request request) {
    // 1. 插入防重表
    try {
        dedupMapper.insert(request.getRequestId());
    } catch (DuplicateKeyException e) {
        return;  // 重复请求
    }
    
    // 2. 业务处理
    doProcess(request);
}

// 唯一索引
CREATE UNIQUE INDEX idx_order_id ON order_item(order_id);
```

---

## 8. 实战：电商分布式事务

### 8.1 场景：下单流程

```
用户下单 → 扣减库存 → 创建订单 → 扣减余额 → 发送消息
   ↓          ↓           ↓          ↓          ↓
  订单服务   库存服务     订单服务    余额服务    消息服务
```

### 8.2 方案选型

| 场景 | 一致性要求 | 性能要求 | 推荐方案 |
|------|------------|----------|----------|
| 支付 | 强一致 | 中 | Seata AT |
| 下单 | 最终一致 | 高 | 本地消息表 |
| 退款 | 强一致 | 中 | TCC |
| 积分 | 最终一致 | 高 | MQ 事务消息 |

### 8.3 Seata AT 模式实战

```java
// 订单服务
@Service
public class OrderServiceImpl implements OrderService {
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private InventoryClient inventoryClient;
    
    @Autowired
    private AccountClient accountClient;
    
    /**
     * 创建订单（全局事务）
     */
    @GlobalTransactional(timeoutMills = 300000, name = "create-order-tx")
    @Override
    public Order createOrder(Order order) {
        log.info("开始创建订单：{}", order.getId());
        
        // 1. 创建订单
        orderMapper.insert(order);
        
        // 2. 扣减库存（远程调用）
        inventoryClient.decrease(order.getProductId(), order.getCount());
        
        // 3. 扣减余额（远程调用）
        accountClient.decrease(order.getUserId(), order.getAmount());
        
        log.info("订单创建成功：{}", order.getId());
        return order;
    }
}

// 库存服务
@Service
public class InventoryServiceImpl implements InventoryService {
    
    @Autowired
    private InventoryMapper inventoryMapper;
    
    /**
     * 扣减库存（分支事务）
     */
    @Override
    public void decrease(Long productId, Integer count) {
        log.info("扣减库存：productId={}, count={}", productId, count);
        
        int rows = inventoryMapper.decrease(productId, count);
        if (rows == 0) {
            throw new BusinessException("库存不足");
        }
        
        log.info("库存扣减成功：productId={}, count={}", productId, count);
    }
}

// 余额服务
@Service
public class AccountServiceImpl implements AccountService {
    
    @Autowired
    private AccountMapper accountMapper;
    
    /**
     * 扣减余额（分支事务）
     */
    @Override
    public void decrease(Long userId, BigDecimal amount) {
        log.info("扣减余额：userId={}, amount={}", userId, amount);
        
        int rows = accountMapper.decrease(userId, amount);
        if (rows == 0) {
            throw new BusinessException("余额不足");
        }
        
        log.info("余额扣减成功：userId={}, amount={}", userId, amount);
    }
}
```

### 8.4 本地消息表实战

```java
@Service
public class OrderServiceImpl implements OrderService {
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private MessageMapper messageMapper;
    
    @Autowired
    private RocketMQTemplate rocketMQTemplate;
    
    /**
     * 创建订单 + 本地消息表
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public Order createOrder(Order order) {
        // 1. 创建订单
        orderMapper.insert(order);
        
        // 2. 写入本地消息表
        Message message = new Message();
        message.setId(UUID.randomUUID().toString());
        message.setTopic("order_created");
        message.setTag("create");
        message.setBody(JsonUtils.toJson(order));
        message.setStatus("PENDING");
        message.setRetryCount(0);
        message.setMaxRetry(3);
        message.setNextRetryTime(LocalDateTime.now().plusSeconds(10));
        messageMapper.insert(message);
        
        log.info("订单创建成功，本地消息已记录：orderId={}", order.getId());
        return order;
    }
}

/**
 * 消息扫描器（定时任务）
 */
@Component
public class MessageScanner {
    
    @Autowired
    private MessageMapper messageMapper;
    
    @Autowired
    private RocketMQTemplate rocketMQTemplate;
    
    /**
     * 每 5 秒扫描一次
     */
    @Scheduled(fixedRate = 5000)
    public void scan() {
        log.info("开始扫描待发送消息");
        
        // 查询待发送消息
        List<Message> messages = messageMapper.selectPending(100);
        
        for (Message message : messages) {
            try {
                // 发送消息
                rocketMQTemplate.send(message.getTopic() + ":" + message.getTag(),
                    MessageBuilder.withPayload(message.getBody()).build());
                
                // 更新状态
                message.setStatus("SENT");
                message.setSendTime(LocalDateTime.now());
                messageMapper.update(message);
                
                log.info("消息发送成功：messageId={}", message.getId());
                
            } catch (Exception e) {
                log.error("消息发送失败：messageId={}", message.getId(), e);
                
                // 更新重试次数
                message.setRetryCount(message.getRetryCount() + 1);
                if (message.getRetryCount() >= message.getMaxRetry()) {
                    message.setStatus("FAILED");
                    log.error("消息发送失败，达到最大重试次数：messageId={}", message.getId());
                } else {
                    // 指数退避
                    long delay = (long) Math.pow(2, message.getRetryCount()) * 10;
                    message.setNextRetryTime(LocalDateTime.now().plusSeconds(delay));
                }
                messageMapper.update(message);
            }
        }
    }
}

/**
 * 消息消费者
 */
@Component
public class OrderMessageListener {
    
    @Autowired
    private InventoryService inventoryService;
    
    @RabbitListener(queues = "order.created")
    public void handleOrderCreated(String message) {
        Order order = JsonUtils.fromJson(message, Order.class);
        
        // 幂等检查
        if (inventoryService.isProcessed(order.getId())) {
            log.info("消息已处理，跳过：orderId={}", order.getId());
            return;
        }
        
        // 扣减库存
        inventoryService.decrease(order.getProductId(), order.getCount());
        
        // 标记已处理
        inventoryService.markProcessed(order.getId());
        
        log.info("订单消息处理成功：orderId={}", order.getId());
    }
}
```

### 8.5 幂等设计

```java
/**
 * 方案 1：数据库唯一索引
 */
CREATE TABLE order_process (
    order_id BIGINT PRIMARY KEY,
    status VARCHAR(20),
    process_time DATETIME
);

public void processOrder(Long orderId) {
    try {
        // 插入处理记录（唯一索引保证幂等）
        orderProcessMapper.insert(orderId, "PROCESSING");
        
        // 业务处理
        doProcess(orderId);
        
        // 更新状态
        orderProcessMapper.updateStatus(orderId, "DONE");
        
    } catch (DuplicateKeyException e) {
        log.warn("订单已处理：orderId={}", orderId);
    }
}

/**
 * 方案 2：Redis 分布式锁
 */
public void processOrder(Long orderId) {
    String lockKey = "lock:order:process:" + orderId;
    String lockValue = UUID.randomUUID().toString();
    
    boolean locked = redisTemplate.opsForValue()
        .setIfAbsent(lockKey, lockValue, 30, TimeUnit.SECONDS);
    
    if (!locked) {
        log.warn("订单处理中，跳过：orderId={}", orderId);
        return;
    }
    
    try {
        // 幂等检查
        if (isProcessed(orderId)) {
            log.info("订单已处理：orderId={}", orderId);
            return;
        }
        
        // 业务处理
        doProcess(orderId);
        
        // 标记已处理
        markProcessed(orderId);
        
    } finally {
        // 释放锁（Lua 脚本）
        String script = "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                       "return redis.call('del', KEYS[1]) else return 0 end";
        redisTemplate.execute(RedisScript.of(script, Long.class),
            Collections.singletonList(lockKey), lockValue);
    }
}

/**
 * 方案 3：状态机
 */
public void payOrder(Long orderId) {
    // CAS 更新状态
    int rows = orderMapper.updateStatus(orderId, 
        OrderStatus.PAID, OrderStatus.PENDING);
    
    if (rows == 0) {
        Order order = orderMapper.selectById(orderId);
        throw new BusinessException("订单状态不正确，当前状态：" + order.getStatus());
    }
    
    // 业务处理
    doPay(orderId);
}
```

---

## 📝 实战清单

**理论基础：**
- [ ] CAP 定理理解
- [ ] BASE 理论理解
- [ ] 事务隔离级别
- [ ] 分布式事务场景

**解决方案：**
- [ ] 2PC 原理与实现
- [ ] TCC 模式实现
- [ ] 本地消息表实现
- [ ] MQ 事务消息
- [ ] Saga 模式
- [ ] Seata AT 模式

**Seata 实战：**
- [ ] Seata Server 部署
- [ ] @GlobalTransactional 注解
- [ ] undo_log 表创建
- [ ] 分支事务注册
- [ ] 回滚处理

**幂等设计：**
- [ ] 数据库唯一索引
- [ ] Redis 分布式锁
- [ ] 状态机模式
- [ ] Token 机制
- [ ] 请求去重表

**生产就绪：**
- [ ] 事务超时配置
- [ ] 事务重试机制
- [ ] 事务监控告警
- [ ] 事务日志记录
- [ ] 对账补偿机制

---

**推荐资源：**
- 📖 Seata 官方文档：https://seata.io
- 🔗 GitHub：https://github.com/seata/seata
- 📚 《分布式事务：从原理到实践》
- 🎥 B 站：分布式事务解决方案详解
