# 垃圾回收机制

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-04-20  
> 难度：⭐⭐⭐⭐⭐  
> 前置知识：[JVM 内存模型](/java/basic/jvm)

---

## 📚 目录

[[toc]]

---

## 1. 垃圾回收简介

### 1.1 什么是垃圾回收

**GC（Garbage Collection）** 是 JVM 自动管理内存的机制，负责回收不再使用的对象，释放内存空间。

**为什么需要 GC：**

| 问题 | 手动管理（C/C++） | 自动管理（Java） |
|------|----------------|----------------|
| **内存泄漏** | 忘记释放内存 | ✅ 自动回收 |
| **悬空指针** | 释放后继续访问 | ✅ 不会出现 |
| **重复释放** | 多次释放同一内存 | ✅ 不会出现 |
| **开发效率** | 低（需手动管理） | ✅ 高（自动管理） |

### 1.2 GC 的历史演进

```
JDK 1.0 → Serial GC（单线程）
    ↓
JDK 1.4 → Parallel GC（多线程并行）
    ↓
JDK 5 → CMS（并发标记清除，低停顿）
    ↓
JDK 7 → G1（分区回收，可预测停顿）
    ↓
JDK 11 → ZGC（超低停顿，<10ms）
    ↓
JDK 15 → ZGC 生产就绪
```

---

## 2. 对象存活判断

### 2.1 引用计数法（已废弃）

**原理：** 每个对象维护一个引用计数器，被引用时 +1，引用失效时 -1，为 0 时可回收。

```java
Object a = new Object();  // 引用计数 = 1
Object b = a;             // 引用计数 = 2
a = null;                 // 引用计数 = 1
b = null;                 // 引用计数 = 0，可回收
```

**问题：无法解决循环引用**

```java
class Node {
    Node next;
}

Node a = new Node();
Node b = new Node();

a.next = b;  // a 引用 b
b.next = a;  // b 引用 a

a = null;
b = null;

// ❌ 问题：a 和 b 的引用计数都是 1，无法回收
// 但实际上这两个对象已经不可达
```

### 2.2 可达性分析算法（使用）

**原理：** 从 **GC Roots** 开始向下搜索，搜索过的路径称为引用链，不可达的对象可回收。

**GC Roots 包括：**

```
GC Roots
├── 虚拟机栈中引用的对象（局部变量）
├── 方法区中静态属性引用的对象
├── 方法区中常量引用的对象
└── 本地方法栈中 JNI 引用的对象
```

**示意图：**

```
GC Roots
    ├──→ 对象 A（存活）
    │       └──→ 对象 B（存活）
    │               └──→ 对象 C（存活）
    │
    ├──→ 对象 D（存活）
    │
    └──→ 对象 E（不可达，可回收）
            └──→ 对象 F（不可达，可回收）
```

### 2.3 对象的 finalize() 方法

**不推荐使用，JDK 9 已废弃**

```java
class MyObject {
    
    @Override
    protected void finalize() throws Throwable {
        // 对象被回收前调用
        System.out.println("对象即将被回收");
        super.finalize();
    }
}

// 问题：
// 1. 执行时间不确定
// 2. 性能开销大
// 3. 可能导致对象复活
// 4. JDK 9 已废弃

// ✅ 推荐：使用 try-with-resources 或 Cleaner
```

---

## 3. 垃圾回收算法

### 3.1 标记 - 清除（Mark-Sweep）

**最基础的垃圾回收算法**

```
步骤：
1. 标记阶段：从 GC Roots 开始，标记所有可达对象
2. 清除阶段：统一清除未标记的对象

示意图：
┌─────────────────────────────────┐
│ 对象 A ✓ │ 对象 B   │ 对象 C ✓ │
│ 对象 D   │ 对象 E ✓ │ 对象 F   │
└─────────────────────────────────┘
    ↓ 标记后
┌─────────────────────────────────┐
│ 对象 A ✓ │         │ 对象 C ✓ │
│         │ 对象 E ✓ │         │
└─────────────────────────────────┘
    ↓ 清除后（产生内存碎片）
┌─────────────────────────────────┐
│ 对象 A ✓ │  碎片   │ 对象 C ✓ │
│  碎片   │ 对象 E ✓ │  碎片   │
└─────────────────────────────────┘
```

**优缺点：**

| 优点 | 缺点 |
|------|------|
| 简单 | 效率不高 |
| 无需移动对象 | 产生内存碎片 |
| | 标记和清除都需要暂停用户线程 |

**适用：** 老年代（对象存活率高）

### 3.2 标记 - 复制（Mark-Copy）

**解决内存碎片问题**

```
步骤：
1. 将内存分为两块（From 区、To 区）
2. 标记存活对象
3. 将存活对象复制到 To 区
4. 清理 From 区

示意图：
From 区                      To 区
┌─────────┬─────────┐       ┌─────────┬─────────┐
│ 对象 A ✓│ 对象 B  │  复制  │ 对象 A ✓│         │
│ 对象 C ✓│ 对象 D  │  ──→  │ 对象 C ✓│         │
└─────────┴─────────┘       └─────────┴─────────┘
    ↓ 清理
From 区（清空）              To 区（存活对象）
┌─────────┬─────────┐       ┌─────────┬─────────┐
│         │         │       │ 对象 A ✓│         │
│         │         │       │ 对象 C ✓│         │
└─────────┴─────────┘       └─────────┴─────────┘
```

**优缺点：**

| 优点 | 缺点 |
|------|------|
| 无内存碎片 | 内存利用率低（只用一半） |
| 效率高 | 对象存活率高时效率低 |
| 实现简单 | |

**适用：** 新生代（大量对象死亡）

### 3.3 标记 - 整理（Mark-Compact）

**标记 - 复制的改进版**

```
步骤：
1. 标记存活对象
2. 将存活对象向一端移动
3. 清理边界外的内存

示意图：
标记后                      整理后
┌─────────────────────────┐   ┌─────────────────────────┐
│ 对象 A ✓│  碎片  │对象 C ✓│   │ 对象 A ✓│对象 C ✓│ 碎片  │
│  碎片  │对象 E ✓│  碎片  │   │         │        │       │
└─────────────────────────┘   └─────────────────────────┘
```

**优缺点：**

| 优点 | 缺点 |
|------|------|
| 无内存碎片 | 需要移动对象，开销大 |
| 内存利用率高 | 需要更新引用地址 |
| 适合存活率高的场景 | |

**适用：** 老年代（对象存活率高）

### 3.4 分代收集

**根据对象生命周期分代回收**

```
堆内存分代：
┌───────────────────────────────────────┐
│             堆（Heap）                 │
│  ┌─────────────────┬───────────────┐  │
│  │   新生代        │    老年代     │  │
│  │  (Young Gen)    │   (Old Gen)   │  │
│  │  ┌───┬───┬───┐  │               │  │
│  │  │ E │ S0│ S1│  │               │  │
│  │  └───┴───┴───┘  │               │  │
│  │  Eden│Survivor   │               │  │
│  └─────────────────┴───────────────┘  │
└───────────────────────────────────────┘

新生代比例：Eden : S0 : S1 = 8 : 1 : 1
```

**对象分配流程：**

```
新对象
    ↓
Eden 区分配
    ↓ (Eden 区满，触发 Minor GC)
存活对象 → Survivor 区（年龄 +1）
    ↓ (年龄达到阈值，默认 15)
晋升到老年代
    ↓ (老年代满，触发 Major/Full GC)
垃圾回收
```

**GC 类型：**

| 类型 | 别名 | 区域 | 停顿时间 |
|------|------|------|---------|
| **Minor GC** | Young GC | 新生代 | 短（几毫秒） |
| **Major GC** | Old GC | 老年代 | 长（几十到几百毫秒） |
| **Full GC** | Full GC | 整个堆 + 方法区 | 最长（几百毫秒到几秒） |

---

## 4. 垃圾回收器

### 4.1 Serial 收集器

**最古老的收集器，单线程**

```
特点：
- 单线程收集
- 需要 Stop-The-World（暂停所有用户线程）
- 简单高效

适用场景：
- 客户端模式
- 单核 CPU
- 内存小（<100MB）

参数：
-XX:+UseSerialGC
```

**工作过程：**

```
用户线程运行
    ↓
Eden 区满
    ↓
暂停所有用户线程（STW）
    ↓
单线程执行 GC
    ↓
恢复用户线程
```

### 4.2 Parallel Scavenge 收集器

**多线程并行收集，吞吐量优先**

```
特点：
- 多线程并行收集
- 需要 Stop-The-World
- 吞吐量优先（适合后台运算）

适用场景：
- 科学计算
- 批量处理
- 后台任务

参数：
-XX:+UseParallelGC          # 使用 Parallel Scavenge
-XX:MaxGCPauseMillis=100    # 最大停顿时间
-XX:GCTimeRatio=99          # GC 时间占比（1/(1+99)=1%）
```

**吞吐量计算：**

```
吞吐量 = 运行用户代码时间 / (运行用户代码时间 + GC 时间)

例如：
- 用户代码运行 99 秒
- GC 运行 1 秒
- 吞吐量 = 99 / (99 + 1) = 99%
```

### 4.3 CMS 收集器（已废弃）

**并发标记清除，低停顿**

```
特点：
- 并发收集（与用户线程同时执行）
- 低停顿
- 标记 - 清除算法

收集过程：
1. 初始标记（STW，快）
2. 并发标记（与用户线程并发）
3. 重新标记（STW，修正并发期间的变动）
4. 并发清除（与用户线程并发）

缺点：
- 内存碎片（标记 - 清除）
- CPU 敏感（并发期间占用 CPU）
- 浮动垃圾（并发清除期间产生的垃圾）

JDK 9 已废弃
参数：
-XX:+UseConcMarkSweepGC
```

### 4.4 G1 收集器（推荐）

**分区回收，可预测停顿**

```
特点：
- 分区管理（Region）
- 可预测停顿模型
- 标记 - 整理算法
- JDK 9 默认收集器

适用场景：
- 大内存（>4GB）
- 多核 CPU
- 低延迟要求

参数：
-XX:+UseG1GC                # 使用 G1
-XX:MaxGCPauseMillis=200    # 最大停顿时间（默认 200ms）
-XX:G1HeapRegionSize=16m    # Region 大小（1MB-32MB）
-XX:InitiatingHeapOccupancyPercent=45  # 触发 GC 的堆占用百分比
```

**G1 内存布局：**

```
堆内存分为多个 Region（逻辑分区，物理不连续）
┌─────┬─────┬─────┬─────┬─────┐
│  E  │  O  │  H  │  S  │  E  │
├─────┼─────┼─────┼─────┼─────┤
│  S  │  E  │  O  │  E  │  O  │
└─────┴─────┴─────┴─────┴─────┘

E = Eden, O = Old, H = Humongous（大对象）, S = Survivor
```

**收集过程：**

```
1. 初始标记（STW，快）
   - 标记 GC Roots 直接可达的对象

2. 并发标记（与用户线程并发）
   - 遍历对象图，标记存活对象

3. 最终标记（STW）
   - 处理并发期间的变动

4. 筛选回收（STW）
   - 选择回收价值最高的 Region
   - 复制存活对象到空闲 Region
   - 清理旧 Region
```

**Mixed GC：**

```
G1 不区分 Minor GC 和 Major GC
- Young GC：只回收新生代
- Mixed GC：回收新生代 + 部分老年代
- Full GC：回收整个堆（单线程，尽量避免）
```

### 4.5 ZGC 收集器（JDK 11+）

**超低停顿，支持 TB 级堆**

```
特点：
- 超低停顿（<10ms）
- 支持 TB 级堆内存
- 并发处理（大部分工作与用户线程并发）
- JDK 15 生产就绪

适用场景：
- 超低延迟要求
- 大内存（TB 级）
- 多核 CPU

参数：
-XX:+UseZGC                 # 使用 ZGC
-Xmx16g                     # 最大堆大小
-Xlog:gc*:file=gc.log       # GC 日志
```

**核心技术：**

| 技术 | 说明 |
|------|------|
| **染色指针** | 将标记信息存储在指针上 |
| **读屏障** | 对象访问时检查并更新标记 |
| **并发转移** | 对象移动与用户线程并发 |

### 4.6 收集器对比

| 收集器 | 线程 | 算法 | 停顿时间 | 适用场景 |
|--------|------|------|---------|---------|
| **Serial** | 单线程 | 标记 - 复制 | 短 | 客户端、小内存 |
| **Parallel** | 多线程 | 标记 - 复制 | 中 | 吞吐量优先 |
| **CMS** | 并发 | 标记 - 清除 | 短 | 低延迟（已废弃） |
| **G1** | 并发 | 标记 - 整理 | 可预测 | 大内存、低延迟 |
| **ZGC** | 并发 | 分区整理 | <10ms | 超低延迟、TB 级堆 |

---

## 5. GC 日志分析

### 5.1 开启 GC 日志

```bash
# JDK 8
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
-Xloggc:/path/to/gc.log

# JDK 9+
-Xlog:gc*:file=/path/to/gc.log:time,uptime,level,tags
```

### 5.2 日志解读

**Minor GC 日志：**

```
[GC (Allocation Failure) [PSYoungGen: 262144K->32704K(306688K)] 524288K->195616K(1008128K), 0.0456789 secs]

解读：
- GC 类型：Minor GC（PSYoungGen）
- 触发原因：Allocation Failure（Eden 区分配失败）
- Eden 区：回收前 262144K → 回收后 32704K
- 堆内存：回收前 524288K → 回收后 195616K
- 停顿时间：0.045 秒（45 毫秒）
```

**Full GC 日志：**

```
[Full GC (Ergonomics) [PSYoungGen: 32704K->0K(306688K)] [ParOldGen: 162912K->128456K(701440K)] 195616K->128456K(1008128K), 0.2345678 secs]

解读：
- GC 类型：Full GC
- 触发原因：Ergonomics（JVM 自动决策）
- 新生代：32704K → 0K
- 老年代：162912K → 128456K
- 堆内存：195616K → 128456K
- 停顿时间：0.234 秒（234 毫秒）
```

### 5.3 GC 日志分析工具

| 工具 | 说明 |
|------|------|
| **GCViewer** | 可视化 GC 日志 |
| **GCEasy** | 在线分析（https://gceasy.io） |
| **GCLog** | 开源分析工具 |
| **JVM 自带** | jstat -gc <pid> |

---

## 6. 内存泄漏排查

### 6.1 常见内存泄漏场景

```java
// 1. 静态集合类
static List<Object> list = new ArrayList<>();
public void add(Object obj) {
    list.add(obj);  // 只增不减，永不释放
}

// 2. 未关闭的资源
public void readFile() throws Exception {
    FileInputStream fis = new FileInputStream("file.txt");
    // 忘记关闭，资源泄漏
}

// 3. 监听器未注销
public class ListenerDemo {
    public void register() {
        eventSource.addListener(this);
        // 忘记注销，导致对象无法回收
    }
}

// 4. ThreadLocal 未清理
static ThreadLocal<Object> threadLocal = new ThreadLocal<>();
public void set(Object obj) {
    threadLocal.set(obj);
    // 忘记 remove，线程池场景会泄漏
}
```

### 6.2 排查工具

```bash
# 查看进程
jps -l

# 查看内存使用
jstat -gc <pid> 1000 10  # 每秒输出一次，共 10 次

# 堆转储
jmap -dump:format=b,file=heap.hprof <pid>

# 线程转储
jstack <pid> > thread.dump

# 可视化工具
jconsole    # 监控 JVM
jvisualvm   # 可视化分析
```

### 6.3 MAT 分析堆转储

**MAT（Memory Analyzer Tool）** 是 Eclipse 开发的内存分析工具。

**使用步骤：**

1. 生成堆转储文件
   ```bash
   jmap -dump:format=b,file=heap.hprof <pid>
   ```

2. 用 MAT 打开 heap.hprof

3. 查看 Histogram（直方图）
   - 按对象数量排序
   - 找出数量异常的对象

4. 查看 Dominator Tree（支配树）
   - 找出占用内存最大的对象
   - 分析引用链

5. 查看 Leak Suspects（泄漏嫌疑）
   - MAT 自动分析可能的泄漏点

---

## 7. JVM 调优

### 7.1 常见 JVM 参数

```bash
# 堆内存
-Xms512m          # 初始堆大小
-Xmx2g            # 最大堆大小
-Xmn512m          # 新生代大小
-XX:NewRatio=2    # 新生代：老年代 = 1:2

# 栈内存
-Xss1m            # 线程栈大小

# 垃圾回收器
-XX:+UseSerialGC          # Serial 收集器
-XX:+UseParallelGC        # Parallel 收集器
-XX:+UseG1GC              # G1 收集器（JDK 9 默认）
-XX:+UseZGC               # ZGC 收集器（JDK 11+）

# GC 调优
-XX:MaxGCPauseMillis=200  # 最大停顿时间
-XX:GCTimeRatio=99        # GC 时间占比
-XX:InitiatingHeapOccupancyPercent=45  # G1 触发 GC 的堆占用

# 元空间
-XX:MetaspaceSize=256m    # 初始元空间大小
-XX:MaxMetaspaceSize=512m # 最大元空间大小

# GC 日志
-Xlog:gc*:file=gc.log:time,uptime,level,tags

# 调试
-XX:+HeapDumpOnOutOfMemoryError  # OOM 时生成堆转储
-XX:HeapDumpPath=/path/to/dump   # 堆转储路径
-XX:+PrintGCDetails              # 打印 GC 详情（JDK 8）
```

### 7.2 常见 OOM 及解决方案

| OOM 类型 | 错误信息 | 原因 | 解决方案 |
|---------|---------|------|---------|
| **Java heap space** | OutOfMemoryError: Java heap space | 堆内存不足 | 增大堆、排查内存泄漏 |
| **Metaspace** | OutOfMemoryError: Metaspace | 元空间不足 | 增大元空间、减少动态类 |
| **StackOverflowError** | StackOverflowError | 栈溢出 | 检查递归、增大栈 |
| **GC overhead limit** | OutOfMemoryError: GC overhead limit exceeded | GC 时间过长 | 优化代码、增大堆 |
| **Unable to create new native thread** | OutOfMemoryError: unable to create new native thread | 线程数过多 | 减少线程数、增大栈 |

### 7.3 调优案例

**案例 1：电商大促场景**

```bash
# 场景：高并发、低延迟要求
# 配置：8 核 CPU、16GB 内存

java -Xms8g -Xmx8g \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=100 \
     -XX:ConcGCThreads=2 \
     -XX:ParallelGCThreads=8 \
     -jar app.jar
```

**案例 2：批量数据处理**

```bash
# 场景：吞吐量优先，可接受较长停顿
# 配置：16 核 CPU、32GB 内存

java -Xms16g -Xmx24g \
     -XX:+UseParallelGC \
     -XX:MaxGCPauseMillis=500 \
     -XX:GCTimeRatio=99 \
     -jar batch-app.jar
```

**案例 3：超低延迟服务**

```bash
# 场景：金融交易、游戏服务器
# 配置：32 核 CPU、64GB 内存

java -Xms32g -Xmx32g \
     -XX:+UseZGC \
     -Xlog:gc*:file=gc.log \
     -jar low-latency-app.jar
```

---

## 📝 练习题

### 基础题

1. **GC 算法**：解释标记 - 复制算法的工作原理及适用场景

2. **GC 类型**：区分 Minor GC、Major GC、Full GC 的触发条件和回收区域

3. **收集器**：列举 5 种垃圾回收器及其特点

### 进阶题

4. **GC 日志分析**：分析一段 GC 日志，判断 GC 类型、停顿时间、回收效果

5. **内存泄漏排查**：使用 jmap 和 MAT 工具分析内存泄漏案例

6. **JVM 调优**：为一个高并发 Web 应用配置合适的 JVM 参数，并说明理由

---

## 🔗 参考资料

### 官方文档
- [Oracle GC 文档](https://docs.oracle.com/en/java/javase/11/gctuning/)
- [G1 GC 官方指南](https://docs.oracle.com/en/java/javase/11/gctuning/garbage-first-garbage-collector.html)
- [ZGC 官方指南](https://docs.oracle.com/en/java/javase/11/gctuning/z-garbage-collector.html)

### 推荐书籍
- 📚 《深入理解 Java 虚拟机》（第 3 版）- 周志明
- 📚 《Java Performance》- Scott Oaks

### 在线工具
- 🔗 [GCEasy](https://gceasy.io/) - GC 日志在线分析
- 🔗 [MAT](https://www.eclipse.org/mat/) - 内存分析工具

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 对象存活判断 | ⭐⭐⭐⭐ | 理解掌握 |
| 垃圾回收算法 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 垃圾回收器 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| GC 日志分析 | ⭐⭐⭐⭐ | 理解掌握 |
| 内存泄漏排查 | ⭐⭐⭐⭐ | 理解掌握 |
| JVM 调优 | ⭐⭐⭐⭐⭐ | 熟练运用 |

---

**上一章：** [线程池实战](/java/basic/thread-pool)  
**下一章：** [类加载机制](/java/basic/classloader)

**最后更新**：2026-03-12
