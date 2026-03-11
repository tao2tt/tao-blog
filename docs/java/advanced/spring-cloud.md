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

## 📝 待办事项

- [ ] Nacos 安装与配置
- [ ] 服务注册与发现实战
- [ ] OpenFeign 服务调用
- [ ] Gateway 网关配置
- [ ] Sentinel 熔断限流
- [ ] Seata 分布式事务
- [ ] 完整微服务项目实战

---

**推荐资源：**
- 📚 《Spring Cloud 微服务实战》
- 📖 Spring Cloud 官方文档
- 🔗 Spring Cloud Alibaba GitHub
