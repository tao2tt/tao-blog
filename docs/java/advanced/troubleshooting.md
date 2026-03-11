# 故障排查

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-06-15

---

## 📚 目录

[[toc]]

---

## 1. 排查思路

### 1.1 黄金四问

1. **是什么问题？** - 现象描述（报错、慢、异常）
2. **什么时候发生的？** - 时间点、频率
3. **影响范围？** - 用户、功能、数据
4. **最近有什么变更？** - 代码、配置、环境

### 1.2 排查流程

```
1. 止损优先（重启、回滚、降级、限流）
2. 收集信息（日志、监控、链路）
3. 定位问题（复现、分析、验证）
4. 解决问题（修复、验证、上线）
5. 复盘总结（根因、改进、文档）
```

---

## 2. 日志排查

### 2.1 日志级别

```java
ERROR   - 错误，需要立即处理
WARN    - 警告，可能有问题
INFO    - 信息，正常运行日志
DEBUG   - 调试，开发环境使用
TRACE   - 追踪，详细调用信息
```

### 2.2 日志配置

```xml
<!-- logback-spring.xml -->
<configuration>
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/app.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/app.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

### 2.3 日志分析

```bash
# 查看错误日志
grep -i "error" app.log | tail -100

# 查看特定时间段
sed -n '/2026-03-11 10:00:00/,/2026-03-11 11:00:00/p' app.log

# 统计错误数量
grep -c "ERROR" app.log

# 查看最频繁的错误
grep "ERROR" app.log | sort | uniq -c | sort -rn | head -10

# ELK 查询
# Kibana: error AND service:order AND @timestamp:[now-1h TO now]
```

---

## 3. CPU 过高排查

### 3.1 排查步骤

```bash
# 1. 查看进程 CPU 使用
top

# 2. 查看进程内线程 CPU 使用
top -Hp <pid>

# 3. 找到高 CPU 线程，转 16 进制
printf "%x\n" <tid>

# 4. 查看线程栈
jstack <pid> | grep <16 进制 tid> -A 20

# 5. 分析原因
# - 死循环
# - 频繁 GC
# - 复杂计算
# - 锁竞争
```

### 3.2 常见原因

```java
// ❌ 死循环
while (true) {
    // 没有退出条件
}

// ❌ 频繁 GC
List<User> users = new ArrayList<>();
while (true) {
    users.add(new User());  // 内存泄漏
}

// ❌ 正则回溯
String regex = "(a+)+";  // 指数级回溯
```

---

## 4. 内存泄漏排查

### 4.1 排查步骤

```bash
# 1. 查看内存使用
jstat -gcutil <pid> 1000

# 2. 生成堆转储
jmap -dump:format=b,file=heap.hprof <pid>

# 3. 使用 MAT 分析
# - Histogram: 对象数量
# - Dominator Tree: 占用最大的对象
# - OOM Leaks: 内存泄漏检测

# 4. 常见泄漏点
# - 静态集合
# - ThreadLocal
# - 未关闭的资源
# - 监听器/回调未注销
```

### 4.2 常见泄漏场景

```java
// ❌ 静态集合泄漏
public static List<User> cache = new ArrayList<>();
public void add(User user) {
    cache.add(user);  // 只增不减
}

// ❌ ThreadLocal 泄漏
private static ThreadLocal<User> userContext = new ThreadLocal<>();
public void handleRequest(User user) {
    userContext.set(user);
    // 忘记 remove
}

// ✅ 正确用法
try {
    userContext.set(user);
    process();
} finally {
    userContext.remove();
}
```

---

## 5. 死锁排查

### 5.1 排查步骤

```bash
# 1. 查看线程栈
jstack <pid>

# 2. 查找死锁信息
# Found one Java-level deadlock

# 3. 使用 Arthas
thread -b  # 检测死锁
```

### 5.2 死锁示例

```java
// ❌ 死锁
Object lock1 = new Object();
Object lock2 = new Object();

// 线程 1
synchronized (lock1) {
    synchronized (lock2) { }
}

// 线程 2
synchronized (lock2) {
    synchronized (lock1) { }
}

// ✅ 避免死锁
// 1. 固定锁顺序
// 2. 使用 tryLock
// 3. 减少锁粒度
```

---

## 6. 接口慢排查

### 6.1 排查步骤

```bash
# 1. 查看慢请求日志
grep "slow" access.log | tail -100

# 2. 查看链路追踪
# SkyWalking / Zipkin / Jaeger

# 3. 查看数据库慢查询
# MySQL slow log

# 4. 使用 Arthas trace
trace com.example.Service method
```

### 6.2 常见原因

- 数据库慢查询（无索引、深分页）
- 外部接口调用超时
- 锁竞争
- GC 停顿
- 资源不足（连接池满）

---

## 7. 常用工具

### 7.1 JDK 工具

```bash
jps          # 查看 Java 进程
jstat        # GC 统计
jmap         # 内存映射
jstack       # 线程栈
jinfo        # JVM 信息
jcmd         # 综合命令
```

### 7.2 Arthas

```bash
# 启动
java -jar arthas-boot.jar

# 常用命令
dashboard          # 仪表盘
thread             # 线程信息
heapdump           # 堆转储
jvm                # JVM 信息
gc                 # GC 统计
trace              # 方法耗时
monitor            # 方法调用统计
watch              # 方法入参返回值
ognl               # 执行表达式
```

### 7.3 监控平台

- Prometheus + Grafana
- SkyWalking（链路追踪）
- ELK（日志分析）
- Zabbix（系统监控）

---

## 8. 应急预案

### 8.1 止损措施

| 措施 | 场景 | 操作 |
|------|------|------|
| 重启 | 内存泄漏、死锁 | `systemctl restart app` |
| 回滚 | 代码问题 | 回退到上一版本 |
| 降级 | 依赖故障 | 关闭非核心功能 |
| 限流 | 流量突增 | 启用限流策略 |
| 熔断 | 服务雪崩 | 切断故障服务 |

### 8.2 应急联系人

```
1. 值班人员：xxx
2. 技术负责人：xxx
3. DBA：xxx
4. 运维：xxx
```

---

## 9. 实战：生产故障排查

### 9.1 故障 1：接口超时

**现象：** 订单创建接口偶尔超时（>10 秒）

**排查过程：**

```bash
# 1. 查看链路追踪（SkyWalking）
# 发现：库存服务调用耗时 9 秒

# 2. 查看库存服务日志
grep "DECREASE" inventory.log | grep "ERROR" | tail -20

# 发现：大量锁等待日志

# 3. 查看数据库锁
SELECT * FROM information_schema.innodb_lock_waits;

# 发现：库存表行锁等待

# 4. 查看慢查询
SELECT * FROM mysql.slow_log WHERE start_time > NOW() - INTERVAL 1 HOUR;

# 发现：UPDATE stock SET count = count - 1 WHERE product_id = ? 耗时 8 秒

# 5. 查看该 SQL 执行计划
EXPLAIN UPDATE stock SET count = count - 1 WHERE product_id = 1001;

# 发现：未使用索引，全表扫描

# 6. 解决方案
CREATE INDEX idx_product_id ON stock(product_id);

# 7. 验证效果
# 接口 RT 从 10 秒降至 50ms
```

### 9.2 故障 2：内存泄漏

**现象：** 应用运行 2-3 天后 OOM 宕机

**排查过程：**

```bash
# 1. 查看 GC 日志
grep "Full GC" gc.log | tail -50

# 发现：Full GC 频率越来越高，从 1 天 1 次变为 1 小时 1 次

# 2. 生成堆转储
jmap -dump:format=b,file=/tmp/heap.hprof <pid>

# 3. MAT 分析
# - Histogram: char[] 对象 100 万个
# - Dominator Tree: com.example.cache.CacheEntry 占用 3GB

# 4. 查看代码
private static Map<String, String> cache = new ConcurrentHashMap<>();

public void put(String key, String value) {
    cache.put(key, value);  // 只增不减
}

# 5. 解决方案
// 使用 Caffeine 缓存（带过期和大小限制）
private Cache<String, String> cache = Caffeine.newBuilder()
    .maximumSize(10000)
    .expireAfterWrite(1, TimeUnit.HOURS)
    .build();

# 6. 验证效果
# 应用运行 7 天无 OOM
```

### 9.3 故障 3：CPU 100%

**现象：** 生产环境 CPU 持续 100%

**排查过程：**

```bash
# 1. top 查看进程
top
# PID 1234 java 占用 CPU 98%

# 2. top -Hp 查看线程
top -Hp 1234
# TID 1235 占用 CPU 45%
# TID 1236 占用 CPU 42%

# 3. 转 16 进制
printf "%x\n" 1235  # 4d3

# 4. jstack 查看线程栈
jstack 1234 | grep -A 20 "0x4d3"

# 发现：
# at com.example.OrderService.calculatePrice(OrderService.java:125)
# at com.example.OrderService.createOrder(OrderService.java:80)

# 5. 查看代码
public BigDecimal calculatePrice(Order order) {
    // 正则回溯
    if (order.getRemark().matches("(a+)+b")) {
        // ...
    }
}

# 6. 解决方案
// 简化正则或使用其他匹配方式
if (order.getRemark().contains("abc")) {
    // ...
}

# 7. 验证效果
# CPU 降至 20%
```

### 9.4 故障 4：数据库连接池满

**现象：** 应用日志大量"Cannot get connection"错误

**排查过程：**

```bash
# 1. 查看监控
# HikariCP 活跃连接数：100/100（满）

# 2. 查看数据库
SHOW PROCESSLIST;

# 发现：大量 SLEEP 状态连接，来自同一应用

# 3. 查看代码
public List<User> getUsers() {
    Connection conn = dataSource.getConnection();
    Statement stmt = conn.createStatement();
    ResultSet rs = stmt.executeQuery("SELECT * FROM user");
    // 忘记关闭资源
    return userList;
}

# 4. 解决方案
public List<User> getUsers() {
    try (Connection conn = dataSource.getConnection();
         Statement stmt = conn.createStatement();
         ResultSet rs = stmt.executeQuery("SELECT * FROM user")) {
        // ...
    }
}

# 5. 配置优化
spring:
  datasource:
    hikari:
      maximum-pool-size: 50      # 从 100 降至 50
      minimum-idle: 10
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000  # 开启泄漏检测

# 6. 验证效果
# 连接池使用率降至 30%
```

---

## 10. 应急预案

### 10.1 应急流程

```
1. 发现故障（监控告警/用户反馈）
2. 初步判断（影响范围、严重程度）
3. 快速止损（重启/回滚/降级/限流）
4. 问题定位（日志/监控/链路）
5. 问题修复（热修复/重新发布）
6. 验证恢复（监控指标、业务验证）
7. 故障复盘（根因分析、改进措施）
```

### 10.2 应急联系人

| 角色 | 姓名 | 电话 | 职责 |
|------|------|------|------|
| 值班人员 | xxx | 138xxxx | 第一时间响应 |
| 技术负责人 | xxx | 139xxxx | 决策指挥 |
| DBA | xxx | 137xxxx | 数据库问题 |
| 运维 | xxx | 136xxxx | 环境/网络问题 |
| 业务负责人 | xxx | 135xxxx | 业务影响评估 |

### 10.3 应急工具包

```bash
# 快速诊断脚本
#!/bin/bash
# emergency-check.sh

PID=$1

echo "=== 进程信息 ==="
ps aux | grep $PID

echo ""
echo "=== JVM 信息 ==="
jinfo -flags $PID | head -20

echo ""
echo "=== 内存使用 ==="
jstat -gcutil $PID 1000 3

echo ""
echo "=== 线程信息 ==="
jstack $PID | grep "java.lang.Thread.State" | sort | uniq -c

echo ""
echo "=== 网络连接 ==="
netstat -anp | grep $PID | wc -l

echo ""
echo "=== 磁盘使用 ==="
df -h
```

---

## 📝 实战清单

**日志系统：**
- [ ] Logback 配置
- [ ] 日志分级（ERROR/WARN/INFO/DEBUG）
- [ ] 日志滚动（按天/按大小）
- [ ] 日志收集（Filebeat）
- [ ] 日志分析（ELK）

**监控告警：**
- [ ] Actuator 端点
- [ ] Prometheus 指标采集
- [ ] Grafana 可视化
- [ ] 告警规则配置
- [ ] 告警通知（钉钉/企业微信/短信）

**链路追踪：**
- [ ] SkyWalking 接入
- [ ] 链路 ID 透传
- [ ] 慢调用分析
- [ ] 拓扑图查看

**排查工具：**
- [ ] JDK 工具（jps/jstat/jmap/jstack）
- [ ] Arthas 实战
- [ ] 监控平台使用
- [ ] 日志查询（Kibana）

**应急预案：**
- [ ] 应急流程文档
- [ ] 应急联系人清单
- [ ] 应急工具包
- [ ] 快速止损方案（重启/回滚/降级/限流）
- [ ] 定期应急演练

**故障复盘：**
- [ ] 故障时间线
- [ ] 根因分析（5 Why）
- [ ] 影响评估
- [ ] 改进措施
- [ ] 经验沉淀

---

**推荐资源：**
- 🔗 Arthas 官方文档：https://arthas.aliyun.com
- 📖 SkyWalking 官方文档：https://skywalking.apache.org
- 📚 《SRE：Google 运维解密》
- 📚 《Google SRE 工作手册》
- 🛠️ ELK Stack：https://www.elastic.co/elastic-stack
