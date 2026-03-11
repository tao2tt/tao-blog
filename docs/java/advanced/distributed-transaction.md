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

## 📝 待办事项

- [ ] CAP/BASE 理论理解
- [ ] 2PC 原理
- [ ] TCC 实现
- [ ] 本地消息表实战
- [ ] Seata 使用
- [ ] Saga 模式
- [ ] 幂等设计

---

**推荐资源：**
- 📖 Seata 官方文档
- 🔗 GitHub：https://github.com/seata/seata
