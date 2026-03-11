# JVM 调优

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-05-30

---

## 📚 目录

[[toc]]

---

## 1. JVM 内存结构

### 1.1 运行时数据区

```
JVM 内存
├── 堆（Heap）- 线程共享
│   ├── 新生代（Young Generation）
│   │   ├── Eden 区
│   │   ├── Survivor 区（S0、S1）
│   │   └── 对象优先在 Eden 分配
│   └── 老年代（Old Generation）
│       └── 大对象、长期存活对象
│
├── 元空间（Metaspace）- 线程共享
│   └── 类元信息（JDK8+ 替代永久代）
│
├── 虚拟机栈（VM Stack）- 线程私有
│   └── 栈帧（局部变量表、操作数栈等）
│
├── 本地方法栈（Native Stack）- 线程私有
│   └── Native 方法
│
└── 程序计数器（PC Register）- 线程私有
    └── 当前执行的字节码地址
```

### 1.2 对象分配过程

```
1. 对象优先在 Eden 区分配
2. Eden 满时触发 Minor GC
3. 存活对象移动到 Survivor 区
4. 对象年龄 +1，超过阈值（默认 15）进入老年代
5. 大对象直接进入老年代
6. 老年代满时触发 Full GC
```

---

## 2. 垃圾回收器

### 2.1 回收器对比

| 回收器 | 区域 | 算法 | 特点 |
|--------|------|------|------|
| Serial | 新生代 | 复制 | 单线程，STW |
| ParNew | 新生代 | 复制 | 多线程，配合 CMS |
| Parallel Scavenge | 新生代 | 复制 | 吞吐量优先 |
| CMS | 老年代 | 标记 - 清除 | 低延迟，4 个阶段 |
| G1 | 全堆 | 分区 | 可预测停顿，JDK9 默认 |
| ZGC | 全堆 | 染色指针 | 超低延迟（<10ms） |

### 2.2 CMS 回收过程

```
1. 初始标记（STW，快）- 标记 GC Roots 直接关联对象
2. 并发标记 - 遍历标记所有对象
3. 重新标记（STW，较慢）- 修正并发期间的变动
4. 并发清除 - 清理垃圾对象
```

### 2.3 G1 回收过程

```
1. Young GC - 回收新生代
2. Mixed GC - 回收新生代 + 部分老年代
3. Full GC（避免）- 整理整个堆
```

---

## 3. JVM 参数

### 3.1 内存参数

```bash
# 堆内存
-Xms2g                    # 初始堆大小
-Xmx2g                    # 最大堆大小
-Xmn512m                  # 新生代大小
-XX:NewRatio=2            # 老年代：新生代 = 2:1
-XX:SurvivorRatio=8       # Eden:Survivor = 8:1

# 元空间
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=512m

# 直接内存
-XX:MaxDirectMemorySize=512m
```

### 3.2 GC 参数

```bash
# 使用 G1 回收器
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200      # 最大停顿时间目标
-XX:G1HeapRegionSize=16m      # Region 大小
-XX:InitiatingHeapOccupancyPercent=45  # 触发 Mixed GC 阈值

# 使用 CMS 回收器
-XX:+UseConcMarkSweepGC
-XX:+UseParNewGC              # 新生代用 ParNew
-XX:CMSInitiatingOccupancyFraction=70  # 触发 CMS 阈值
-XX:+UseCMSCompactAtFullCollection  # Full GC 时压缩

# 打印 GC 日志（JDK8）
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
-Xloggc:/var/log/gc.log
-XX:+UseGCLogFileRotation
-XX:NumberOfGCLogFiles=5
-XX:GCLogFileSize=50M

# 打印 GC 日志（JDK9+）
-Xlog:gc*:file=/var/log/gc.log:time,uptime,level,tags
```

### 3.3 问题排查参数

```bash
# OOM 时生成堆转储
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/log/heapdump.hprof

# 自动重启
-XX:+CrashOnOutOfMemoryError

# 打印类加载信息
-verbose:class

# 打印 JNI 调用
-verbose:jni
```

---

## 4. 监控工具

### 4.1 命令行工具

```bash
# 查看 Java 进程
jps -lvm

# 查看 JVM 信息
jinfo -flags <pid>

# 查看内存使用
jstat -gcutil <pid> 1000 10  # 每秒输出一次，共 10 次
jmap -heap <pid>

# 生成堆转储
jmap -dump:format=b,file=heap.hprof <pid>

# 线程栈
jstack <pid>
jstack -l <pid>  # 显示锁信息

# 图形化工具
jconsole <pid>
jvisualvm
```

### 4.2 Arthas

```bash
# 启动
java -jar arthas-boot.jar

# 常用命令
dashboard          # 仪表盘
thread             # 线程信息
heapdump           # 堆转储
jvm                # JVM 信息
gc                 # GC 统计

# 方法监控
trace com.example.Service method     # 方法调用耗时
monitor com.example.Service method   # 方法调用统计
watch com.example.Service method     # 方法入参返回值

# 类加载
classloader        # 类加载器信息
sc -d *.Service    # 查找类
sm *.Service *     # 查看方法
```

---

## 5. 常见问题

### 5.1 OOM 排查

```bash
# 1. 查看 GC 日志，确认是否频繁 Full GC
# 2. 生成堆转储
jmap -dump:format=b,file=heap.hprof <pid>

# 3. 使用 MAT 分析
# - Histogram：查看对象数量
# - Dominator Tree：查看占用最大的对象
# - OOM Leaks：内存泄漏检测

# 4. 常见原因
# - 内存泄漏（静态集合、ThreadLocal）
# - 大对象过多
# - 堆内存设置过小
```

### 5.2 CPU 过高排查

```bash
# 1. 查看进程
top -Hp <pid>

# 2. 找到高 CPU 线程，转 16 进制
printf "%x\n" <tid>

# 3. 查看线程栈
jstack <pid> | grep <16 进制 tid> -A 20

# 4. 常见原因
# - 死循环
# - 频繁 GC
# - 复杂计算
```

### 5.3 死锁排查

```bash
# 1. 查看线程栈
jstack <pid>

# 2. 查找死锁信息
# Found one Java-level deadlock

# 3. 使用 Arthas
thread -b  # 检测死锁
```

---

## 6. 调优实践

### 6.1 调优步骤

```
1. 监控：收集 GC 日志、监控指标
2. 分析：分析瓶颈（GC 频繁？停顿过长？）
3. 调整：调整 JVM 参数
4. 验证：压测验证效果
5. 迭代：持续优化
```

### 6.2 场景调优

**低延迟场景：**
```bash
-XX:+UseG1GC
-XX:MaxGCPauseMillis=100
-XX:ConcGCThreads=4
```

**高吞吐场景：**
```bash
-XX:+UseParallelGC
-XX:MaxGCPauseMillis=0  # 不关心停顿
-XX:GCTimeRatio=99      # 99% 时间用于执行任务
```

**大堆场景（>32G）：**
```bash
-XX:+UseG1GC
-Xms64g
-Xmx64g
-XX:G1HeapRegionSize=32m
-XX:InitiatingHeapOccupancyPercent=40
```

---

## 8. 实战案例

### 8.1 OOM 排查实战

**场景：** 生产环境应用频繁 Full GC，最终 OOM 宕机

**排查步骤：**

```bash
# 1. 查看 GC 日志
grep "Full GC" gc.log | tail -50

# 结果分析：
# - Full GC 频率从 1 小时/次 变为 5 分钟/次
# - GC 后老年代使用率仍 > 90%
# - 判断存在内存泄漏

# 2. 生成堆转储
jmap -dump:format=b,file=/tmp/heap.hprof <pid>

# 3. 使用 MAT 分析
# - 打开 heap.hprof
# - Histogram: 查看对象数量
# - Dominator Tree: 查看占用最大的对象
# - 发现：com.example.Cache.items 占用 2GB，100 万个对象

# 4. 定位代码
private static Map<String, byte[]> cache = new ConcurrentHashMap<>();

public void put(String key, byte[] data) {
    cache.put(key, data);  // 只增不减，无过期机制
}

# 5. 修复方案
// 方案 1：使用 Caffeine 缓存（带过期策略）
private Cache<String, byte[]> cache = Caffeine.newBuilder()
    .maximumSize(10000)
    .expireAfterWrite(1, TimeUnit.HOURS)
    .build();

// 方案 2：定期清理
@Scheduled(fixedRate = 3600000)
public void cleanup() {
    long now = System.currentTimeMillis();
    cache.entrySet().removeIf(e -> now - e.getValue().createTime > 3600000);
}
```

### 8.2 CPU 过高排查实战

**场景：** 生产环境 CPU 持续 100%

```bash
# 1. 查看进程
top
# PID USER    PR  NI  VIRT  RES  SHR S  %CPU %MEM  TIME+ COMMAND
# 1234 admin   20   0  4.5g 2.1g  25m R  98.5 12.3  10:20.15 java

# 2. 查看线程
top -Hp 1234
#   PID USER    PR  NI  VIRT  RES  SHR S  %CPU %MEM  TIME+ COMMAND
#  1235 admin   20   0  4.5g 2.1g  25m R  45.2 12.3   2:10.20 java
#  1236 admin   20   0  4.5g 2.1g  25m R  42.1 12.3   2:05.15 java

# 3. 转 16 进制
printf "%x\n" 1235  # 输出：4d3

# 4. 查看线程栈
jstack 1234 | grep -A 20 "0x4d3"

# 输出：
"http-nio-8080-exec-5" #0x4d3 daemon prio=5 os_prio=0 tid=0x00007f8c0c002800 nid=0x4d3 runnable [0x00007f8c1c5fe000]
   java.lang.Thread.State: RUNNABLE
        at com.example.OrderService.calculatePrice(OrderService.java:125)
        at com.example.OrderService.createOrder(OrderService.java:80)
        ...

# 5. 查看代码
# 发现：死循环/复杂计算/正则回溯

# 问题代码：
public BigDecimal calculatePrice(Order order) {
    while (true) {  // 死循环
        if (checkPrice(order)) {
            break;
        }
    }
    // ...
}

// 或者：
public boolean isValid(String input) {
    return input.matches("(a+)+b");  // 正则回溯
}

# 6. 修复
public BigDecimal calculatePrice(Order order) {
    int maxRetries = 10;
    for (int i = 0; i < maxRetries; i++) {
        if (checkPrice(order)) {
            break;
        }
        Thread.sleep(100);
    }
    // ...
}
```

### 8.3 死锁排查实战

```bash
# 1. 查看线程栈
jstack <pid>

# 输出：
Found one Java-level deadlock:
=============================
"thread-1":
  waiting to lock monitor 0x00007f8c0c003000 (object 0x00000000c0020000, a java.lang.Object),
  which is held by "thread-2"
"thread-2":
  waiting to lock monitor 0x00007f8c0c002800 (object 0x00000000c0010000, a java.lang.Object),
  which is held by "thread-1"

# 2. 使用 Arthas
thread -b

# 输出：
Found one deadlocked thread:

Thread "thread-1":
    at com.example.Service.methodA(Service.java:50)
    - waiting to lock <0x00000000c0020000> (a java.lang.Object)
    - locked <0x00000000c0010000> (a java.lang.Object)

Thread "thread-2":
    at com.example.Service.methodB(Service.java:80)
    - waiting to lock <0x00000000c0010000> (a java.lang.Object)
    - locked <0x00000000c0020000> (a java.lang.Object)

# 3. 问题代码
private Object lock1 = new Object();
private Object lock2 = new Object();

public void methodA() {
    synchronized (lock1) {
        Thread.sleep(100);
        synchronized (lock2) { }
    }
}

public void methodB() {
    synchronized (lock2) {
        Thread.sleep(100);
        synchronized (lock1) { }
    }
}

# 4. 修复：固定锁顺序
public void methodA() {
    synchronized (lock1) {
        Thread.sleep(100);
        synchronized (lock2) { }
    }
}

public void methodB() {
    synchronized (lock1) {  // 固定先锁 lock1
        Thread.sleep(100);
        synchronized (lock2) { }
    }
}
```

### 8.4 GC 调优实战

**场景：** 电商大促期间，要求 GC 停顿 < 100ms

**调优过程：**

```bash
# 1. 初始配置（Parallel GC）
-XX:+UseParallelGC
-Xms4g
-Xmx4g

# 问题：Full GC 停顿 500ms+

# 2. 改用 G1 GC
-XX:+UseG1GC
-Xms4g
-Xmx4g
-XX:MaxGCPauseMillis=200
-XX:G1HeapRegionSize=16m
-XX:InitiatingHeapOccupancyPercent=45

# 结果：Full GC 减少，但 Young GC 停顿仍 > 100ms

# 3. 优化新生代
-XX:+UseG1GC
-Xms4g
-Xmx4g
-Xmn2g                        # 固定新生代大小
-XX:G1MaxNewSizePercent=50    # 新生代最大 50%
-XX:MaxGCPauseMillis=100
-XX:G1HeapRegionSize=8m       # 更小的 Region

# 结果：Young GC 停顿 50-80ms，满足要求

# 4. 监控验证
jstat -gcutil <pid> 1000

# 输出：
 S0     S1     E      O      M     CCS    YGC     YGCT    FGC    FGCT   GCT
 0.00   0.00  45.23  62.15  98.45  99.12  1250    12.500     5    0.500  13.000

# 分析：
# - E（Eden）使用率 45%，正常
# - O（Old）使用率 62%，正常
# - YGC 频率：1250 次 / 运行时间，正常
# - FGC 仅 5 次，很好
```

---

## 9. 生产环境配置

### 9.1 推荐 JVM 参数

```bash
# 通用配置（4G 堆）
java -Xms4g -Xmx4g \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -XX:G1HeapRegionSize=16m \
     -XX:InitiatingHeapOccupancyPercent=45 \
     -XX:+ParallelRefProcEnabled \
     -XX:+UseStringDeduplication \
     -XX:MaxTenuringThreshold=10 \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/data/logs/heapdump.hprof \
     -Xlog:gc*:file=/data/logs/gc.log:time,uptime,level,tags \
     -XX:+UseGCLogFileRotation \
     -XX:NumberOfGCLogFiles=5 \
     -XX:GCLogFileSize=50M \
     -XX:ErrorFile=/data/logs/hs_err_pid%p.log \
     -XX:OnOutOfMemoryError="kill -9 %p" \
     -jar app.jar

# 低延迟配置（<50ms 停顿）
-XX:+UseZGC \
-Xms4g \
-Xmx4g \
-XX:ConcurrentGCThreads=4 \
-XX:ZCollectionInterval=5

# 高吞吐配置
-XX:+UseParallelGC \
-Xms4g \
-Xmx4g \
-XX:MaxGCPauseMillis=0 \
-XX:GCTimeRatio=99
```

### 9.2 监控脚本

```bash
#!/bin/bash
# jvm-monitor.sh

PID=$1

echo "=== JVM Info ==="
jinfo -flags $PID | grep -E "Xmx|Xms|UseG1GC|UseZGC"

echo ""
echo "=== Memory Usage ==="
jstat -gcutil $PID 1000 5

echo ""
echo "=== Thread Info ==="
jstack $PID | grep "java.lang.Thread.State" | sort | uniq -c

echo ""
echo "=== Top Threads ==="
top -Hp $PID -b -n 1 | head -20
```

---

## 📝 实战清单

**理论基础：**
- [ ] JVM 内存结构（堆/栈/元空间）
- [ ] 对象分配与回收流程
- [ ] GC 算法（标记 - 清除/复制/标记 - 整理）
- [ ] 垃圾回收器对比（CMS/G1/ZGC）

**参数配置：**
- [ ] 堆内存配置（-Xms/-Xmx）
- [ ] 新生代配置（-Xmn/-XX:NewRatio）
- [ ] G1 参数配置
- [ ] GC 日志配置

**监控工具：**
- [ ] jps/jstat/jmap/jstack 使用
- [ ] JConsole/JVisualVM 使用
- [ ] Arthas 实战（dashboard/trace/heapdump）
- [ ] GC 日志分析工具（GCViewer/GCEasy）

**问题排查：**
- [ ] OOM 排查流程
- [ ] CPU 过高排查
- [ ] 死锁排查
- [ ] 内存泄漏排查
- [ ] 频繁 GC 排查

**性能调优：**
- [ ] GC 调优（低延迟/高吞吐）
- [ ] 堆大小调优
- [ ] 元空间调优
- [ ] 直接内存调优

**生产就绪：**
- [ ] JVM 参数标准化
- [ ] GC 日志分析告警
- [ ] OOM 自动重启
- [ ] 监控指标接入（Prometheus）

---

**推荐资源：**
- 📚 《深入理解 Java 虚拟机》（周志明）
- 📚 《Java 性能权威指南》
- 📖 Oracle JVM 文档：https://docs.oracle.com/javase/17/vm/
- 🔗 Arthas 官方文档：https://arthas.aliyun.com
- 🛠️ GC 日志分析：https://gceasy.io
