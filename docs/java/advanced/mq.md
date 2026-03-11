# 消息队列

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-05-30

---

## 📚 目录

[[toc]]
---

## 1. 消息队列概述

### 1.1 什么是消息队列

**消息队列（Message Queue）**：异步通信中间件，生产者发送消息到队列，消费者从队列消费消息。

**核心概念：**
- **生产者（Producer）**：发送消息的一方
- **消费者（Consumer）**：接收消息的一方
- **队列（Queue）**：存储消息的容器
- **主题（Topic）**：消息分类
- **分区（Partition）**：Topic 的物理分割

### 1.2 使用场景

| 场景 | 说明 | 示例 |
|------|------|------|
| **异步处理** | 非核心业务异步执行 | 注册后发送邮件/短信 |
| **应用解耦** | 降低系统间依赖 | 订单系统 → 库存系统 |
| **流量削峰** | 缓冲突发流量 | 秒杀系统 |
| **消息通讯** | 点对点/发布订阅 | 在线聊天、推送通知 |
| **数据同步** | 异构数据源同步 | MySQL → Elasticsearch |
| **日志收集** | 集中式日志处理 | ELK 架构 |

### 1.3 主流 MQ 对比

| 特性 | RabbitMQ | Kafka | RocketMQ |
|------|----------|-------|----------|
| **开发语言** | Erlang | Scala/Java | Java |
| **吞吐量** | 万级 | 十万级 | 十万级 |
| **延迟** | 微秒级 | 毫秒级 | 毫秒级 |
| **可靠性** | 高 | 中 | 高 |
| **消息顺序** | 支持 | 分区有序 | 支持 |
| **事务消息** | 不支持 | 不支持 | 支持 ⭐ |
| **延迟消息** | 支持（插件） | 不支持 | 支持 ⭐ |
| **适用场景** | 中小规模、复杂路由 | 日志收集、大数据 | 电商、金融 |

---

## 2. RabbitMQ

### 2.1 核心概念

```
Producer → Exchange → Queue → Consumer

Exchange（交换机）：
- Direct：精确匹配 routing key
- Fanout：广播到所有队列
- Topic：通配符匹配
- Headers：根据消息头匹配
```

### 2.2 SpringBoot 整合

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

```yaml
# application.yml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
    virtual-host: /
    listener:
      simple:
        acknowledge-mode: manual  # 手动确认
        prefetch: 1               # 每次只推送 1 条
```

### 2.3 消息发送

```java
@Service
public class MessageProducer {
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    // 1. 简单队列
    public void sendSimple(String message) {
        rabbitTemplate.convertAndSend("simple.queue", message);
    }
    
    // 2. Direct Exchange
    public void sendDirect(String routingKey, String message) {
        rabbitTemplate.convertAndSend("direct.exchange", routingKey, message);
    }
    
    // 3. Topic Exchange
    public void sendTopic(String routingKey, String message) {
        rabbitTemplate.convertAndSend("topic.exchange", routingKey, message);
    }
    
    // 4. Fanout Exchange
    public void sendFanout(String message) {
        rabbitTemplate.convertAndSend("fanout.exchange", "", message);
    }
    
    // 5. 延迟队列（TTL + 死信）
    public void sendDelay(String message, int delaySeconds) {
        rabbitTemplate.convertAndSend("delay.exchange", "delay.key", message,
            msg -> {
                msg.getMessageProperties().setExpiration(String.valueOf(delaySeconds * 1000));
                return msg;
            });
    }
}
```

### 2.4 消息消费

```java
@Component
public class MessageConsumer {
    
    @RabbitListener(queues = "simple.queue")
    public void handleSimple(String message) {
        System.out.println("收到消息：" + message);
    }
    
    @RabbitListener(queues = "direct.queue")
    public void handleDirect(Message message, Channel channel) throws IOException {
        try {
            String body = new String(message.getBody());
            System.out.println("收到消息：" + body);
            
            // 手动确认
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception e) {
            // 拒绝消息，重新入队
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, true);
        }
    }
    
    // 批量消费
    @RabbitListener(queues = "batch.queue")
    public void handleBatch(List<Message> messages, Channel channel) throws IOException {
        for (Message message : messages) {
            try {
                // 处理消息
                channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
            } catch (Exception e) {
                channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
            }
        }
    }
}
```

### 2.5 死信队列

```java
// 配置死信队列
@Configuration
public class DeadLetterConfig {
    
    @Bean
    public Queue deadLetterQueue() {
        return new Queue("dead.letter.queue");
    }
    
    @Bean
    public Queue mainQueue() {
        return QueueBuilder.durable("main.queue")
            .withArgument("x-dead-letter-exchange", "")
            .withArgument("x-dead-letter-routing-key", "dead.letter.queue")
            .build();
    }
}
```

---

## 3. Kafka

### 3.1 核心概念

```
Producer → Topic（Partition） → Consumer Group

Topic：消息主题
Partition：分区，物理存储单元
Consumer Group：消费者组，组内消费者负载均衡
Offset：消息偏移量，记录消费位置
```

### 3.2 SpringBoot 整合

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```

```yaml
# application.yml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.apache.kafka.common.serialization.StringSerializer
      acks: all              # 所有副本确认
      retries: 3             # 重试次数
    consumer:
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      auto-offset-reset: latest  # 从最新位置消费
      enable-auto-commit: false  # 手动提交 offset
      group-id: my-group
```

### 3.3 消息发送

```java
@Service
public class KafkaProducer {
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    // 1. 简单发送
    public void send(String topic, String message) {
        kafkaTemplate.send(topic, message);
    }
    
    // 2. 指定分区
    public void sendToPartition(String topic, int partition, String message) {
        kafkaTemplate.send(topic, partition, null, message);
    }
    
    // 3. 指定 key（保证顺序）
    public void sendWithKey(String topic, String key, String message) {
        kafkaTemplate.send(topic, key, message);
    }
    
    // 4. 发送并获取结果
    public void sendWithCallback(String topic, String message) {
        ListenableFuture<SendResult<String, String>> future = 
            kafkaTemplate.send(topic, message);
        
        future.addCallback(
            result -> {
                System.out.println("发送成功：" + result.getRecordMetadata().offset());
            },
            ex -> {
                System.out.println("发送失败：" + ex.getMessage());
            }
        );
    }
}
```

### 3.4 消息消费

```java
@Component
public class KafkaConsumer {
    
    @KafkaListener(topics = "my-topic", groupId = "my-group")
    public void consume(String message) {
        System.out.println("收到消息：" + message);
    }
    
    @KafkaListener(topics = "my-topic", groupId = "my-group")
    public void consumeWithAck(ConsumerRecord<String, String> record, Acknowledgment ack) {
        try {
            System.out.println("收到消息：" + record.value());
            
            // 手动提交 offset
            ack.acknowledge();
        } catch (Exception e) {
            // 记录异常，不提交 offset
            System.err.println("消费失败：" + e.getMessage());
        }
    }
    
    // 批量消费
    @KafkaListener(topics = "my-topic", groupId = "my-group")
    public void consumeBatch(List<ConsumerRecord<String, String>> records, Acknowledgment ack) {
        for (ConsumerRecord<String, String> record : records) {
            System.out.println("收到消息：" + record.value());
        }
        ack.acknowledge();
    }
}
```

---

## 4. RocketMQ

### 4.1 核心概念

```
Producer → Topic（Queue） → Consumer Group

NameServer：服务发现
Broker：消息存储
Producer Group：生产者组
Consumer Group：消费者组
```

### 4.2 SpringBoot 整合

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-spring-boot-starter</artifactId>
    <version>2.2.3</version>
</dependency>
```

```yaml
# application.yml
rocketmq:
  name-server: 127.0.0.1:9876
  producer:
    group: my-producer-group
    send-message-timeout: 3000
```

### 4.3 消息发送

```java
@Service
public class RocketMQProducer {
    
    @Autowired
    private RocketMQTemplate rocketMQTemplate;
    
    // 1. 同步发送
    public void sendSync(String message) {
        SendResult result = rocketMQTemplate.syncSend("my-topic", message);
        System.out.println("发送结果：" + result.getSendStatus());
    }
    
    // 2. 异步发送
    public void sendAsync(String message) {
        rocketMQTemplate.asyncSend("my-topic", message, new SendCallback() {
            @Override
            public void onSuccess(SendResult sendResult) {
                System.out.println("发送成功");
            }
            
            @Override
            public void onException(Throwable e) {
                System.out.println("发送失败：" + e.getMessage());
            }
        });
    }
    
    // 3. 单向发送（不关心结果）
    public void sendOneway(String message) {
        rocketMQTemplate.sendOneWay("my-topic", message);
    }
    
    // 4. 延迟消息
    public void sendDelay(String message, int delayLevel) {
        rocketMQTemplate.syncSend("my-topic", 
            MessageBuilder.withPayload(message).build(), 
            3000,  // 超时时间
            delayLevel  // 延迟级别（1-18）
        );
    }
    
    // 5. 顺序消息
    public void sendOrderly(String message, Long orderId) {
        rocketMQTemplate.syncSendOrderly("order-topic", message, String.valueOf(orderId));
    }
    
    // 6. 事务消息
    @RocketMQTransactionListener
    public class TransactionListenerImpl implements RocketMQLocalTransactionListener {
        @Override
        public RocketMQLocalTransactionState executeLocalTransaction(Message msg, Object arg) {
            // 执行本地事务
            return RocketMQLocalTransactionState.COMMIT;
        }
        
        @Override
        public RocketMQLocalTransactionState checkLocalTransaction(Message msg) {
            // 检查本地事务状态
            return RocketMQLocalTransactionState.COMMIT;
        }
    }
}
```

### 4.4 消息消费

```java
@Component
@RocketMQMessageListener(
    topic = "my-topic",
    consumerGroup = "my-consumer-group",
    messageModel = MessageModel.CLUSTERING,  // 集群消费
    consumeMode = ConsumeMode.CONCURRENTLY    // 并发消费
)
public class RocketMQConsumer implements RocketMQListener<String> {
    
    @Override
    public void onMessage(String message) {
        System.out.println("收到消息：" + message);
    }
}

// 顺序消费
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer-group",
    consumeMode = ConsumeMode.ORDERLY  // 顺序消费
)
public class OrderConsumer implements RocketMQListener<String> {
    
    @Override
    public void onMessage(String message) {
        // 按顺序处理订单
    }
}
```

---

## 5. 消息可靠性

### 5.1 消息丢失问题

```
可能丢失的环节：
1. 生产者发送丢失
2. Broker 存储丢失
3. 消费者消费丢失
```

### 5.2 生产者可靠性

```yaml
# RabbitMQ
# 开启 Confirm 模式
spring:
  rabbitmq:
    publisher-confirm-type: correlated
    publisher-returns: true

# Kafka
spring:
  kafka:
    producer:
      acks: all              # 所有副本确认
      retries: 3             # 重试
      max-in-flight-requests-per-connection: 1  # 保证顺序

# RocketMQ
rocketmq:
  producer:
    retry-times-when-send-failed: 2
    retry-times-when-send-async-failed: 2
```

### 5.3 Broker 可靠性

```conf
# RabbitMQ
# 队列持久化
queue.durable=true
# 消息持久化
deliveryMode=2

# Kafka
# 副本数
num.partitions=3
default.replication.factor=3
# 最小同步副本
min.insync.replicas=2

# RocketMQ
# 同步刷盘
flushDiskType=SYNC_FLUSH
# 同步复制
brokerRole=SYNC_MASTER
```

### 5.4 消费者可靠性

```java
// 手动确认
@RabbitListener(queues = "my-queue")
public void handle(Message message, Channel channel) throws IOException {
    try {
        // 处理消息
        process(message);
        
        // 手动确认
        channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
    } catch (Exception e) {
        // 记录异常
        log.error("消费失败", e);
        
        // 拒绝消息，重新入队（或进入死信队列）
        channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, true);
    }
}

// 幂等性处理
@Component
public class IdempotentConsumer {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @RabbitListener(queues = "my-queue")
    public void handle(Message message) {
        String messageId = message.getMessageProperties().getMessageId();
        
        // 检查是否已处理
        Boolean processed = redisTemplate.opsForValue().setIfAbsent(
            "msg:processed:" + messageId, 
            "1", 
            24, TimeUnit.HOURS
        );
        
        if (!processed) {
            return;  // 已处理，跳过
        }
        
        // 处理消息
        process(message);
    }
}
```

---

## 6. 实战场景

### 6.1 异步处理

```java
// 用户注册
@Service
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private RocketMQTemplate rocketMQTemplate;
    
    public void register(User user) {
        // 1. 创建用户
        userMapper.insert(user);
        
        // 2. 发送消息（异步处理后续流程）
        Map<String, Object> message = new HashMap<>();
        message.put("userId", user.getId());
        message.put("email", user.getEmail());
        message.put("phone", user.getPhone());
        
        rocketMQTemplate.send("user.register.topic", message);
    }
}

// 消费者处理
@Component
@RocketMQMessageListener(topic = "user.register.topic", consumerGroup = "user-register-group")
public class RegisterConsumer implements RocketMQListener<Map> {
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private SmsService smsService;
    
    @Override
    public void onMessage(Map message) {
        // 发送欢迎邮件
        emailService.sendWelcomeEmail((String) message.get("email"));
        
        // 发送欢迎短信
        smsService.sendWelcomeSms((String) message.get("phone"));
        
        // 初始化用户积分
        // ...
    }
}
```

### 6.2 订单超时取消

```java
// 创建订单时发送延迟消息
@Service
public class OrderService {
    
    @Autowired
    private RocketMQTemplate rocketMQTemplate;
    
    public Order createOrder(Order order) {
        // 1. 创建订单
        orderMapper.insert(order);
        
        // 2. 发送延迟消息（30 分钟后检查支付状态）
        Map<String, Object> message = new HashMap<>();
        message.put("orderId", order.getId());
        message.put("createTime", System.currentTimeMillis());
        
        rocketMQTemplate.syncSend("order.timeout.topic", 
            MessageBuilder.withPayload(message).build(),
            3000,
            18  // 延迟级别 18 = 30 分钟
        );
        
        return order;
    }
}

// 消费者处理超时订单
@Component
@RocketMQMessageListener(topic = "order.timeout.topic", consumerGroup = "order-timeout-group")
public class OrderTimeoutConsumer implements RocketMQListener<Map> {
    
    @Autowired
    private OrderService orderService;
    
    @Override
    public void onMessage(Map message) {
        Long orderId = (Long) message.get("orderId");
        
        // 检查订单支付状态
        Order order = orderService.getById(orderId);
        if (order.getStatus() == OrderStatus.UNPAID) {
            // 取消订单
            orderService.cancelOrder(orderId);
            
            // 回滚库存
            // ...
        }
    }
}
```

### 6.3 数据同步

```java
// MySQL → Elasticsearch 同步
@Component
@RocketMQMessageListener(topic = "product.update.topic", consumerGroup = "product-es-group")
public class ProductEsSyncConsumer implements RocketMQListener<Product> {
    
    @Autowired
    private RestHighLevelClient esClient;
    
    @Override
    public void onMessage(Product product) {
        try {
            // 同步到 ES
            IndexRequest request = new IndexRequest("product")
                .id(String.valueOf(product.getId()))
                .source(JSON.toJSONString(product), XContentType.JSON);
            
            esClient.index(request, RequestOptions.DEFAULT);
        } catch (IOException e) {
            log.error("ES 同步失败", e);
            // 重试或记录死信
        }
    }
}
```

---

## 7. 最佳实践

### 7.1 消息格式

```java
// 统一消息格式
@Data
public class MessageWrapper<T> {
    private String messageId;      // 消息 ID（幂等）
    private String topic;          // 主题
    private String tag;            // 标签
    private T payload;             // 消息体
    private Long timestamp;        // 时间戳
    private Map<String, String> ext; // 扩展字段
}
```

### 7.2 重试机制

```java
// 重试配置
@Component
@RocketMQMessageListener(
    topic = "my-topic",
    consumerGroup = "my-group",
    maxReconsumeTimes = 3  // 最多重试 3 次
)
public class RetryConsumer implements RocketMQListener<String> {
    
    @Override
    public void onMessage(String message) {
        // 业务逻辑
        // 失败会自动重试
    }
}
```

### 7.3 监控告警

```
监控指标：
- 消息堆积量
- 消费延迟
- 发送/消费 TPS
- 失败率

告警阈值：
- 消息堆积 > 10000
- 消费延迟 > 5 分钟
- 失败率 > 1%
```

---

## 💡 常见面试题

1. **消息队列的使用场景？**
2. **如何保证消息不丢失？**
3. **如何保证消息不重复消费（幂等性）？**
4. **如何保证消息顺序性？**
5. **消息积压如何处理？**
6. **RabbitMQ、Kafka、RocketMQ 的区别？**
7. **延迟队列如何实现？**
8. **事务消息原理？**
9. **如何设计高可用消息队列？**
10. **消息队列的优缺点？**

---

## 📚 参考资料

- 《RocketMQ 技术内幕》
- 《Kafka 权威指南》
- [RabbitMQ 官方文档](https://www.rabbitmq.com/documentation.html)
- [Kafka 官方文档](https://kafka.apache.org/documentation/)
- [RocketMQ 官方文档](https://rocketmq.apache.org/docs/)

---

> 💡 **学习建议**：消息队列是分布式系统核心组件，建议：
> 1. 掌握至少一种 MQ（推荐 RocketMQ）
> 2. 理解消息可靠性保证
> 3. 实战项目练习（异步处理、延迟队列）
> 4. 学习监控和调优
