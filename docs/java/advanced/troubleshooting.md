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

## 📝 待办事项

- [ ] 日志系统配置
- [ ] 监控告警配置
- [ ] 链路追踪接入
- [ ] Arthas 实战
- [ ] 应急预案制定
- [ ] 故障复盘模板

---

**推荐资源：**
- 🔗 Arthas 官方文档
- 📖 SkyWalking 官方文档
- 📚 《SRE：Google 运维解密》
