# Spring Cloud

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-04-15

---

## 📚 目录

[[toc]]

---

## 1. Spring Cloud 概述

### 1.1 什么是 Spring Cloud

**Spring Cloud** 是一系列框架的有序集合，基于 Spring Boot 提供微服务架构的一站式解决方案。

**核心组件：**
- **服务注册与发现**：Nacos、Eureka、Consul
- **配置中心**：Nacos Config、Spring Cloud Config
- **服务调用**：OpenFeign、Dubbo
- **网关**：Spring Cloud Gateway、Zuul
- **负载均衡**：Spring Cloud LoadBalancer、Ribbon
- **熔断限流**：Sentinel、Hystrix、Resilience4j

### 1.2 Spring Cloud 版本

| 版本 | 代号 | 发布时间 |
|------|------|----------|
| 2020.0.x | Ilford | 2020 年 |
| 2021.0.x | Jubilee | 2021 年 |
| 2022.0.x | 2022.0.0 | 2022 年 |
| 2023.0.x | 2023.0.0 | 2023 年 |

### 1.3 Spring Cloud Alibaba

```
Spring Cloud Alibaba
├── Nacos（服务注册 + 配置中心）
├── Sentinel（熔断限流）
├── Seata（分布式事务）
├── RocketMQ（消息队列）
└── Dubbo（RPC 框架）
```

---

## 2. Nacos 服务注册与发现

### 2.1 Nacos 简介

**Nacos** = Naming + Configuration Service

**核心功能：**
- 服务注册与发现
- 动态配置管理
- 服务健康检查

### 2.2 Nacos 安装

```bash
# Docker 方式启动
docker run -d \
  -p 8848:8848 \
  -e MODE=standalone \
  nacos/nacos-server
```

### 2.3 服务注册

```yaml
# application.yml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: public
        group: DEFAULT_GROUP
```

```java
// 启动类添加注解
@EnableDiscoveryClient
@SpringBootApplication
public class ServiceProviderApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServiceProviderApplication.class, args);
    }
}
```

---

## 3. OpenFeign 服务调用

### 3.1 Feign 简介

**OpenFeign** 是声明式的 HTTP 客户端，简化服务间调用。

### 3.2 Feign 使用

```java
@FeignClient(name = "user-service", path = "/api/user")
public interface UserClient {
    
    @GetMapping("/{id}")
    Result<User> getUserById(@PathVariable("id") Long id);
    
    @PostMapping
    Result<User> createUser(@RequestBody User user);
}
```

```java
// 启动类启用 Feign
@EnableFeignClients
@SpringBootApplication
public class ConsumerApplication { }
```

### 3.3 Feign 配置

```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 5000
  compression:
    request:
      enabled: true
    response:
      enabled: true
```

---

## 4. Spring Cloud Gateway 网关

### 4.1 Gateway 简介

**Spring Cloud Gateway** 是 Spring 官方的网关实现，基于 WebFlux。

### 4.2 路由配置

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/user/**
          filters:
            - StripPrefix=1
            - AddRequestHeader=X-Request-Id, ${random.uuid}
```

### 4.3 自定义过滤器

```java
@Component
public class AuthFilter implements GlobalFilter, Ordered {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        return chain.filter(exchange);
    }
    
    @Override
    public int getOrder() {
        return -100;
    }
}
```

---

## 5. Sentinel 熔断限流

### 5.1 Sentinel 简介

**Sentinel** 是阿里巴巴开源的流量控制组件。

**核心功能：**
- 流量控制
- 熔断降级
- 系统自适应保护

### 5.2 限流配置

```java
@SentinelResource(
    value = "getUserById",
    blockHandler = "handleBlock",
    fallback = "handleFallback"
)
public User getUserById(Long id) {
    return userService.getById(id);
}

// 限流处理
public User handleBlock(Long id, BlockException ex) {
    return new User("限流中...");
}

// 降级处理
public User handleFallback(Long id, Throwable ex) {
    return new User("服务降级...");
}
```

---

## 6. Seata 分布式事务

### 6.1 Seata 简介

**Seata** 是阿里巴巴开源的分布式事务解决方案。

**事务模式：**
- AT 模式（默认）
- TCC 模式
- Saga 模式
- XA 模式

### 6.2 AT 模式配置

```java
// 全局事务注解
@GlobalTransactional
public void createOrder(Order order) {
    // 1. 创建订单
    orderMapper.insert(order);
    
    // 2. 扣减库存
    inventoryClient.decrease(order.getProductId(), order.getCount());
    
    // 3. 扣减余额
    accountClient.decrease(order.getUserId(), order.getAmount());
}
```

---

## 7. 实战：微服务架构搭建

### 7.1 项目结构

```
mall-cloud/
├── mall-common/           # 公共模块
├── mall-gateway/          # 网关服务
├── mall-auth/             # 认证服务
├── mall-user/             # 用户服务
├── mall-product/          # 商品服务
├── mall-order/            # 订单服务
└── mall-payment/          # 支付服务
```

### 7.2 服务依赖

```xml
<dependencies>
    <!-- Spring Cloud Alibaba -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
    </dependency>
    
    <!-- OpenFeign -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    
    <!-- Gateway -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>
</dependencies>
```

---

## 8. 最佳实践

### 8.1 服务拆分原则

- **单一职责**：每个服务只做一件事
- **高内聚低耦合**：服务内部高度聚合，服务之间松耦合
- **数据自治**：每个服务管理自己的数据库
- **独立部署**：服务可以独立部署和扩展

### 8.2 服务治理

- 服务注册与发现
- 服务健康检查
- 服务熔断降级
- 服务链路追踪（Sleuth + Zipkin）

### 8.3 配置管理

- 配置中心统一管理
- 配置动态刷新
- 配置版本管理
- 配置灰度发布

---

## 7. 实战：电商微服务架构

### 7.1 项目结构

```
mall-cloud/
├── mall-common/              # 公共模块
│   ├── common-core/         # 核心工具类
│   ├── common-redis/        # Redis 配置
│   ├── common-security/     # 安全认证
│   └── common-swagger/      # API 文档
├── mall-gateway/            # 网关服务 (8080)
├── mall-auth/               # 认证中心 (8001)
├── mall-user/               # 用户服务 (8002)
├── mall-product/            # 商品服务 (8003)
├── mall-order/              # 订单服务 (8004)
├── mall-cart/               # 购物车服务 (8005)
└── mall-payment/            # 支付服务 (8006)
```

### 7.2 统一响应

```java
@Data
public class Result<T> {
    private Integer code;
    private String message;
    private T data;
    private Long timestamp;
    
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("success");
        result.setData(data);
        result.setTimestamp(System.currentTimeMillis());
        return result;
    }
    
    public static <T> Result<T> error(String message) {
        Result<T> result = new Result<>();
        result.setCode(500);
        result.setMessage(message);
        result.setTimestamp(System.currentTimeMillis());
        return result;
    }
}
```

### 7.3 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常：{}", e.getMessage());
        return Result.error(e.getMessage());
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public Result<Void> handleAccessDeniedException(AccessDeniedException e) {
        return Result.error("权限不足");
    }
    
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.error("系统繁忙，请稍后再试");
    }
}
```

---

## 8. 生产环境配置

### 8.1 Nacos 配置中心

```yaml
# application-prod.yml
spring:
  cloud:
    nacos:
      config:
        server-addr: ${NACOS_SERVER:192.168.1.100:8848}
        namespace: ${NACOS_NAMESPACE:prod}  # 按环境隔离
        group: DEFAULT_GROUP
        file-extension: yaml
        refresh-enabled: true
      discovery:
        server-addr: ${NACOS_SERVER:192.168.1.100:8848}
        namespace: ${NACOS_NAMESPACE:prod}
        group: DEFAULT_GROUP
        register-enabled: true
        heartbeat-interval: 5000  # 5 秒心跳
        ip-delete-timeout: 15000  # 15 秒剔除
```

### 8.2 服务治理

```yaml
# 服务超时配置
feign:
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 10000
  compression:
    request:
      enabled: true
      mime-types: text/xml,application/json
      min-request-size: 2048
    response:
      enabled: true

# 重试配置
spring:
  cloud:
    openfeign:
      httpclient:
        retry-enabled: true
        max-connections: 1000
        max-connections-per-route: 100
```

### 8.3 链路追踪

```xml
<!-- SkyWalking 集成 -->
<dependency>
    <groupId>org.apache.skywalking</groupId>
    <artifactId>apm-toolkit-trace</artifactId>
    <version>9.7.0</version>
</dependency>
```

```java
// 添加追踪注解
@Trace
public Order createOrder(Order order) {
    // 业务逻辑
}

// 日志集成
@Trace(tags = {@Tag(key = "orderId", value = "arg[0].id")})
public Order getOrderById(Long orderId) {
    return orderMapper.selectById(orderId);
}
```

### 8.4 启动脚本

```bash
#!/bin/bash
# start.sh

APP_NAME=$1
APP_PORT=$2

# 检查参数
if [ -z "$APP_NAME" ] || [ -z "$APP_PORT" ]; then
    echo "Usage: $0 <app_name> <app_port>"
    exit 1
fi

# JVM 参数
JAVA_OPTS="-Xms512m -Xmx512m"
JAVA_OPTS="$JAVA_OPTS -XX:+UseG1GC"
JAVA_OPTS="$JAVA_OPTS -XX:MaxGCPauseMillis=200"
JAVA_OPTS="$JAVA_OPTS -XX:+HeapDumpOnOutOfMemoryError"
JAVA_OPTS="$JAVA_OPTS -XX:HeapDumpPath=/data/logs/$APP_NAME/heapdump.hprof"

# SkyWalking 探针
JAVA_OPTS="$JAVA_OPTS -javaagent:/opt/skywalking/agent/skywalking-agent.jar"
JAVA_OPTS="$JAVA_OPTS -Dskywalking.agent.service_name=$APP_NAME"
JAVA_OPTS="$JAVA_OPTS -Dskywalking.collector.backend_service=${SW_SERVER:192.168.1.200:11800}"

# 启动
nohup java $JAVA_OPTS -jar $APP_NAME.jar \
    --server.port=$APP_PORT \
    --spring.profiles.active=prod \
    > /data/logs/$APP_NAME/startup.log 2>&1 &

echo "$APP_NAME started on port $APP_PORT"
```

---

## 📝 实战清单

**基础环境：**
- [ ] Nacos 集群搭建（3 节点）
- [ ] Sentinel Dashboard 部署
- [ ] Seata Server 配置
- [ ] SkyWalking OAP + UI 部署

**服务开发：**
- [ ] 公共模块封装（common-*）
- [ ] 网关路由配置
- [ ] 认证中心 JWT 实现
- [ ] 各业务服务开发

**服务治理：**
- [ ] 服务注册与发现
- [ ] OpenFeign 服务调用
- [ ] Sentinel 熔断限流配置
- [ ] Seata 分布式事务集成

**生产就绪：**
- [ ] 配置中心多环境隔离
- [ ] 链路追踪接入
- [ ] 日志收集（ELK）
- [ ] 监控告警（Prometheus）
- [ ] 健康检查配置
- [ ] 灰度发布策略

---

**推荐资源：**
- 📚 《Spring Cloud Alibaba 微服务实战》
- 📖 Spring Cloud Alibaba 官方文档
- 🔗 GitHub：https://github.com/alibaba/spring-cloud-alibaba
- 🎥 B 站：尚硅谷 Spring Cloud 微服务
