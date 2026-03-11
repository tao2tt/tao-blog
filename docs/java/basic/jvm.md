# JVM 基础

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-04-30

---

## 📚 目录

1. [JVM 概述](#1-jvm-概述)
2. [JVM 内存模型](#2-jvm-内存模型)
3. [垃圾回收机制](#3-垃圾回收机制)
4. [垃圾收集器](#4-垃圾收集器)
5. [类加载机制](#5-类加载机制)
6. [字节码执行引擎](#6-字节码执行引擎)
7. [JVM 调优](#7-jvm-调优)
8. [监控与诊断工具](#8-监控与诊断工具)
9. [实战案例](#9-实战案例)

---

## 1. JVM 概述

### 1.1 什么是 JVM

**JVM（Java Virtual Machine）**：Java 虚拟机，是运行 Java 字节码的虚拟机。

```
Java 代码 → 编译 → .class 字节码 → JVM → 机器码 → CPU 执行
```

### 1.2 JVM 的优势

- ✅ **跨平台性**：Write Once, Run Anywhere（WORA）
- ✅ **自动内存管理**：垃圾回收机制（GC）
- ✅ **安全性**：字节码验证、沙箱机制
- ✅ **性能优化**：JIT 编译、热点探测

### 1.3 JVM 生命周期

```
加载 → 验证 → 准备 → 解析 → 初始化 → 执行 → 卸载
```

### 1.4 JVM 实现

| JVM 实现 | 厂商 | 特点 |
|----------|------|------|
| **HotSpot** | Oracle | 最常用，JDK 默认 |
| **OpenJ9** | IBM | 内存占用低，启动快 |
| **GraalVM** | Oracle | 多语言支持，高性能 |
| **Zing** | Azul | 低延迟，大堆 |

---

## 2. JVM 内存模型

### 2.1 JVM 内存结构（JDK 1.8）

```
JVM 内存
├── 堆（Heap）- 所有线程共享
│   ├── 新生代（Young Generation）
│   │   ├── Eden 区
│   │   ├── Survivor 区（S0、S1）
│   │   └── 对象优先在 Eden 区分配
│   └── 老年代（Old Generation）
│       └── 大对象、长期存活对象
├── 方法区（Method Area）- 所有线程共享
│   ├── 元空间（Metaspace，JDK 1.8+）
│   ├── 运行时常量池
│   └── 类信息、方法信息
├── 虚拟机栈（VM Stack）- 线程私有
│   └── 栈帧（局部变量表、操作数栈、动态链接、方法出口）
├── 本地方法栈（Native Method Stack）- 线程私有
│   └── Native 方法
└── 程序计数器（Program Counter Register）- 线程私有
    └── 当前执行的字节码指令地址
```

### 2.2 堆内存（Heap）

#### 内存分区

```
堆内存
├── 新生代（1/3）
│   ├── Eden 区（8/10）
│   └── Survivor 区（2/10，S0 和 S1 各 1/10）
└── 老年代（2/3）
```

#### 对象分配流程

```
1. 对象优先在 Eden 区分配
2. Eden 区满 → Minor GC → 存活对象移动到 Survivor 区
3. 对象年龄 +1，达到阈值（默认 15）→ 晋升到老年代
4. 大对象直接进入老年代
5. 长期存活对象（熬过多次 GC）→ 晋升到老年代
```

#### 堆内存参数

```bash
# 常用参数
-Xms2g              # 初始堆大小
-Xmx2g              # 最大堆大小
-Xmn1g              # 新生代大小
-XX:NewRatio=2      # 老年代：新生代 = 2:1
-XX:SurvivorRatio=8 # Eden:Survivor = 8:1
-XX:MaxTenuringThreshold=15  # 对象晋升阈值
-XX:PretenureSizeThreshold=1m  # 大对象直接进入老年代
```

### 2.3 方法区（Method Area）

#### JDK 1.7 vs JDK 1.8

| 特性 | JDK 1.7 | JDK 1.8 |
|------|---------|---------|
| **实现** | 永久代（PermGen） | 元空间（Metaspace） |
| **位置** | JVM 内存 | 本地内存 |
| **大小限制** | 固定（易 OOM） | 受物理内存限制 |
| **字符串常量池** | 在永久代 | 移到堆中 |

#### 方法区存储内容

- 类信息（类名、父类、接口）
- 方法信息（方法名、参数、返回值）
- 字段信息
- 运行时常量池
- JIT 编译后的代码缓存

#### 方法区参数

```bash
-XX:MetaspaceSize=256m     # 初始元空间大小
-XX:MaxMetaspaceSize=512m  # 最大元空间大小
-XX:CompressedClassSpaceSize=256m  # 压缩类空间大小
```

### 2.4 虚拟机栈（VM Stack）

#### 栈帧结构

```
栈帧
├── 局部变量表（Local Variables）
│   └── 方法参数、局部变量
├── 操作数栈（Operand Stack）
│   └── 计算过程中的临时数据
├── 动态链接（Dynamic Linking）
│   └── 指向运行时常量池的方法引用
└── 方法出口（Method Return Address）
    └── 方法返回地址
```

#### 栈内存参数

```bash
-Xss256k    # 每个线程栈大小（默认 1MB）
```

#### 常见问题

```java
// StackOverflowError：栈深度超限
public void recursive() {
    recursive();  // 无限递归
}

// 解决：增加栈大小或优化递归
-Xss2m
```

### 2.5 程序计数器（PC Register）

- 线程私有
- 记录当前执行的字节码指令地址
- 唯一不会发生 OOM 的区域

### 2.6 直接内存（Direct Memory）

```java
// NIO 引入，不在 JVM 内存中，在本地内存
ByteBuffer buffer = ByteBuffer.allocateDirect(1024);

// 参数
-XX:MaxDirectMemorySize=512m  # 最大直接内存
```

---

## 3. 垃圾回收机制

### 3.1 为什么需要 GC

- ✅ **自动内存管理**：无需手动释放
- ✅ **避免内存泄漏**：自动回收无用对象
- ✅ **提高开发效率**：减少内存管理负担

### 3.2 如何判断对象可回收

#### 引用计数法（已淘汰）

```java
// 对象被引用一次，计数器 +1
// 引用失效，计数器 -1
// 计数器为 0 时可回收

// ❌ 问题：无法解决循环引用
Object a = new Object();
Object b = new Object();
a.setRef(b);
b.setRef(a);
a = null;
b = null;
// a 和 b 互相引用，计数器不为 0，但实际已无用
```

#### 可达性分析算法（GC Roots）

```
从 GC Roots 向下搜索，不可达的对象可回收

GC Roots 包括：
1. 虚拟机栈（栈帧中的局部变量）
2. 方法区中的静态变量
3. 方法区中的常量
4. 本地方法栈中的 JNI 引用
```

### 3.3 引用类型

```java
// 1. 强引用（Strong Reference）
Object obj = new Object();  // 只要引用在，就不会回收

// 2. 软引用（SoftReference）- 内存不足时回收
SoftReference<Object> softRef = new SoftReference<>(new Object());
Object obj = softRef.get();

// 3. 弱引用（WeakReference）- 下次 GC 回收
WeakReference<Object> weakRef = new WeakReference<>(new Object());
Object obj = weakRef.get();

// 4. 虚引用（PhantomReference）- 对象回收时收到通知
PhantomReference<Object> phantomRef = new PhantomReference<>(obj, queue);
```

### 3.4 GC 分类

| 分类 | 回收区域 | 触发条件 | 停顿时间 |
|------|----------|----------|----------|
| **Minor GC** | 新生代 | Eden 区满 | 短（几毫秒 - 几十毫秒） |
| **Major GC** | 老年代 | 老年代空间不足 | 长（几百毫秒 - 几秒） |
| **Full GC** | 整个堆 + 方法区 | 方法区满、System.gc() | 最长（几秒） |

### 3.5 GC 算法

#### 标记 - 清除算法（Mark-Sweep）

```
1. 标记：标记所有需要回收的对象
2. 清除：统一回收被标记的对象

✅ 优点：简单
❌ 缺点：效率低、内存碎片
```

#### 标记 - 复制算法（Mark-Copy）

```
1. 将内存分为两块（Eden、Survivor）
2. 存活对象复制到另一块
3. 清理原区域

✅ 优点：无碎片、效率高
❌ 缺点：内存利用率低（只有 50%）

适用：新生代（对象存活率低）
```

#### 标记 - 整理算法（Mark-Compact）

```
1. 标记存活对象
2. 向一端移动存活对象
3. 清理边界外的内存

✅ 优点：无碎片
❌ 缺点：移动对象成本高

适用：老年代（对象存活率高）
```

#### 分代收集算法

```
根据对象生命周期不同，采用不同算法

新生代：标记 - 复制（对象存活率低）
老年代：标记 - 清除 或 标记 - 整理（对象存活率高）
```

---

## 4. 垃圾收集器

### 4.1 垃圾收集器对比

| 收集器 | 区域 | 算法 | 特点 | 适用场景 |
|--------|------|------|------|----------|
| **Serial** | 新生代 | 复制 | 单线程，停顿 | 客户端应用 |
| **Serial Old** | 老年代 | 标记 - 整理 | 单线程，停顿 | 客户端应用 |
| **ParNew** | 新生代 | 复制 | 多线程 | 配合 CMS |
| **Parallel Scavenge** | 新生代 | 复制 | 吞吐量优先 | 后台计算 |
| **Parallel Old** | 老年代 | 标记 - 整理 | 吞吐量优先 | 后台计算 |
| **CMS** | 老年代 | 标记 - 清除 | 低延迟 | Web 应用 |
| **G1** | 整个堆 | 分区收集 | 可预测停顿 | 大堆、低延迟 |
| **ZGC** | 整个堆 | 染色指针 | <10ms 停顿 | 超大堆 |

### 4.2 CMS 收集器（Concurrent Mark Sweep）

#### 工作原理

```
1. 初始标记（STW）：标记 GC Roots 能直接关联的对象
2. 并发标记：从 GC Roots 遍历，标记存活对象
3. 重新标记（STW）：修正并发标记期间变动的对象
4. 并发清除：清理可回收对象
```

#### 优缺点

```
✅ 优点：
- 并发收集
- 低停顿

❌ 缺点：
- 产生内存碎片
- 对 CPU 敏感
- 浮动垃圾（并发清除时产生的新垃圾）
- Concurrent Mode Failure（并发失败，退化为 Serial Old）
```

#### 参数配置

```bash
-XX:+UseConcMarkSweepGC  # 使用 CMS
-XX:CMSInitiatingOccupancyFraction=68  # 老年代使用 68% 时触发
-XX:+UseCMSCompactAtFullCollection  # Full GC 时压缩
-XX:CMSFullGCsBeforeCompaction=0  # 每次 Full GC 都压缩
```

### 4.3 G1 收集器（Garbage First）

#### 工作原理

```
1. 将堆划分为多个 Region（1-32MB）
2. 每个 Region 可以是 Eden、Survivor、Old、Humongous
3. 维护 Region 之间的引用关系（Remembered Set）
4. 回收时优先回收垃圾最多的 Region（Garbage First）
```

#### 收集步骤

```
1. 初始标记（STW）：标记 GC Roots 直接关联的对象
2. 并发标记：遍历对象图，标记存活对象
3. 最终标记（STW）：处理并发标记期间变动的对象
4. 筛选回收（STW）：选择回收价值最大的 Region
```

#### 优缺点

```
✅ 优点：
- 可预测停顿（用户指定停顿时间）
- 无内存碎片
- 大堆友好

❌ 缺点：
- 内存占用高（Remembered Set）
- CPU 开销大
```

#### 参数配置

```bash
-XX:+UseG1GC              # 使用 G1
-XX:MaxGCPauseMillis=200  # 最大停顿时间目标
-XX:G1HeapRegionSize=16m  # Region 大小
-XX:InitiatingHeapOccupancyPercent=45  # 堆使用 45% 时触发
```

### 4.4 ZGC 收集器（JDK 11+）

#### 特点

```
✅ 停顿时间 < 10ms
✅ 堆大小支持 4TB - 16TB
✅ 并发处理所有阶段

适用：超大堆、低延迟场景
```

#### 参数配置

```bash
-XX:+UseZGC              # 使用 ZGC（JDK 15+）
-Xmx16g -Xms16g          # 固定堆大小
-XX:+ZGenerational       # JDK 21+ 分代 ZGC
```

### 4.5 收集器选择建议

| 场景 | 推荐收集器 | 理由 |
|------|------------|------|
| **客户端应用** | Serial | 简单，内存小 |
| **后台计算** | Parallel Scavenge + Parallel Old | 吞吐量优先 |
| **Web 应用** | G1 | 低延迟，大堆友好 |
| **超大堆（>32GB）** | ZGC | 停顿时间 < 10ms |
| **JDK 8** | G1 或 CMS | G1 更推荐 |
| **JDK 11+** | G1 或 ZGC | ZGC 性能更好 |

---

## 5. 类加载机制

### 5.1 类加载过程

```
加载 → 验证 → 准备 → 解析 → 初始化
```

#### 加载（Loading）

```
1. 通过类名获取二进制字节流
2. 将字节流转换为方法区的运行时数据结构
3. 在堆中生成 Class 对象作为访问入口
```

#### 验证（Verification）

```
1. 文件格式验证
2. 元数据验证
3. 字节码验证
4. 符号引用验证
```

#### 准备（Preparation）

```
为类变量分配内存并设置默认值
static int value = 123;  // value = 0（默认值）
```

#### 解析（Resolution）

```
将常量池中的符号引用替换为直接引用
```

#### 初始化（Initialization）

```
执行类构造器 <clinit>() 方法，初始化类变量
static int value = 123;  // value = 123
```

### 5.2 类加载器

```
类加载器（ClassLoader）
├── 启动类加载器（Bootstrap ClassLoader）
│   └── 加载 JDK 核心类（rt.jar）
├── 扩展类加载器（Extension ClassLoader）
│   └── 加载扩展类（ext/*.jar）
├── 应用程序类加载器（Application ClassLoader）
│   └── 加载应用类（classpath）
└── 自定义类加载器
    └── 用户自定义
```

### 5.3 双亲委派模型

#### 工作原理

```
1. 类加载器收到加载请求
2. 先委托给父类加载器
3. 父类加载器无法加载，子类加载器才尝试加载
```

#### 优点

```
✅ 避免类的重复加载
✅ 保证 Java 核心 API 安全（防止自定义 String 类）
```

#### 源码分析

```java
protected Class<?> loadClass(String name, boolean resolve)
    throws ClassNotFoundException
{
    synchronized (getClassLoadingLock(name)) {
        // 1. 检查类是否已加载
        Class<?> c = findLoadedClass(name);
        
        if (c == null) {
            try {
                // 2. 委托父类加载器
                if (parent != null) {
                    c = parent.loadClass(name, false);
                } else {
                    c = findBootstrapClassOrNull(name);
                }
            } catch (ClassNotFoundException e) {
                // 父类无法加载
            }
            
            if (c == null) {
                // 3. 自己加载
                c = findClass(name);
            }
        }
        
        if (resolve) {
            resolveClass(c);
        }
        
        return c;
    }
}
```

### 5.4 打破双亲委派

#### 场景

```
1. SPI（Service Provider Interface）
2. 热部署（Tomcat）
3. 代码隔离（OSGi）
```

#### 示例

```java
// 自定义类加载器，重写 loadClass 方法
public class MyClassLoader extends ClassLoader {
    @Override
    protected Class<?> loadClass(String name, boolean resolve)
        throws ClassNotFoundException {
        // 不委托父类，自己加载
        return findClass(name);
    }
    
    @Override
    protected Class<?> findClass(String name)
        throws ClassNotFoundException {
        byte[] classData = loadClassData(name);
        return defineClass(name, classData, 0, classData.length);
    }
}
```

---

## 6. 字节码执行引擎

### 6.1 执行方式

```
1. 解释执行：逐行解释字节码并执行
2. JIT 编译：将热点代码编译为机器码
```

### 6.2 热点探测

#### 方法调用计数器

```
统计方法被调用的次数，超过阈值触发 JIT 编译
```

#### 回边计数器

```
统计循环体执行次数，检测热点循环代码
```

### 6.3 JIT 编译优化

```
1. 方法内联（减少方法调用开销）
2. 锁消除（无竞争时消除 synchronized）
3. 锁粗化（扩大锁范围，减少锁次数）
4. 逃逸分析（对象不逃逸则栈上分配）
5. 常量折叠（编译期计算常量表达式）
```

---

## 7. JVM 调优

### 7.1 调优目标

- ✅ **减少停顿时间**：提升响应速度
- ✅ **提高吞吐量**：提升处理能力
- ✅ **减少内存占用**：节省资源
- ✅ **避免 OOM**：保证稳定性

### 7.2 调优步骤

```
1. 监控：收集 GC 日志、内存使用情况
2. 分析：找出问题（频繁 GC、停顿过长、内存泄漏）
3. 调整：调整 JVM 参数
4. 验证：观察效果，继续优化
```

### 7.3 常见 GC 问题

#### 频繁 Minor GC

```
原因：新生代太小
解决：增大新生代
-Xmn2g
```

#### 频繁 Full GC

```
原因 1：老年代太小
解决：增大老年代或整个堆
-Xmx4g -Xms4g

原因 2：内存泄漏
解决：分析堆转储，找出泄漏对象

原因 3：元空间不足
解决：增大元空间
-XX:MaxMetaspaceSize=512m
```

#### GC 停顿时间过长

```
原因 1：堆太大
解决：减小堆或换用 G1/ZGC
-XX:+UseG1GC -XX:MaxGCPauseMillis=200

原因 2：大对象过多
解决：调整大对象阈值
-XX:PretenureSizeThreshold=1m
```

### 7.4 常用 JVM 参数

```bash
# 堆内存
-Xms2g -Xmx2g              # 初始/最大堆大小
-Xmn1g                     # 新生代大小
-XX:NewRatio=2             # 老年代：新生代

# 垃圾收集器
-XX:+UseG1GC               # 使用 G1
-XX:MaxGCPauseMillis=200   # 最大停顿时间
-XX:G1HeapRegionSize=16m   # Region 大小

# 元空间
-XX:MetaspaceSize=256m     # 初始元空间
-XX:MaxMetaspaceSize=512m  # 最大元空间

# GC 日志
-Xloggc:/var/log/gc.log
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
-XX:+UseGCLogFileRotation
-XX:NumberOfGCLogFiles=5
-XX:GCLogFileSize=50M

# 调试
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/log/heapdump.hprof
-XX:+PrintCommandLineFlags
-XX:+PrintFlagsFinal
```

---

## 8. 监控与诊断工具

### 8.1 JDK 自带工具

#### jps（JVM Process Status）

```bash
jps -l  # 显示进程 ID 和主类名
```

#### jstat（JVM Statistics）

```bash
# 查看 GC 统计
jstat -gc <pid> 1000 10  # 每秒输出一次，共 10 次

# 输出说明
S0C/S1C: Survivor 区容量
S0U/S1U: Survivor 区使用量
EC: Eden 区容量
EU: Eden 区使用量
OC: 老年代容量
OU: 老年代使用量
MC: 元空间容量
YGC: Young GC 次数
FGC: Full GC 次数
```

#### jmap（Memory Map）

```bash
# 查看堆内存使用
jmap -heap <pid>

# 导出堆转储
jmap -dump:format=b,file=heap.hprof <pid>
```

#### jhat（JVM Heap Analysis Tool）

```bash
# 分析堆转储（浏览器访问）
jhat -J-Xmx2g heap.hprof
# 访问 http://localhost:7000
```

#### jstack（Stack Trace）

```bash
# 查看线程堆栈
jstack <pid>

# 查找死锁
jstack -l <pid> | grep -A 20 "deadlock"
```

#### jinfo（Configuration Info）

```bash
# 查看 JVM 参数
jinfo <pid>

# 查看特定参数
jinfo -flag MaxHeapSize <pid>
```

### 8.2 可视化工具

#### JConsole

```
JDK 自带，图形化监控
jconsole <pid>
```

#### VisualVM

```
功能强大的监控工具
- 内存监控
- 线程监控
- CPU 分析
- 内存分析
```

#### JMC（Java Mission Control）

```
专业的性能分析工具
- 飞行记录器（JFR）
- 垃圾回收分析
- 线程分析
```

### 8.3 第三方工具

#### MAT（Memory Analyzer Tool）

```
Eclipse 出品，专业的堆分析工具
- 内存泄漏检测
- 支配树分析
- OQL 查询
```

#### GCEasy

```
在线 GC 日志分析工具
https://gceasy.io/
```

#### Arthas（阿里开源）

```bash
# 强大的诊断工具
java -jar arthas-boot.jar

# 常用命令
dashboard      # 仪表盘
thread         # 线程信息
jvm            # JVM 信息
heapdump       # 导出堆转储
logger         # 查看/修改日志级别
watch          # 观察方法调用
trace          # 方法调用链路追踪
```

---

## 9. 实战案例

### 9.1 OOM 排查

#### 场景

```
生产环境频繁 OOM：java.lang.OutOfMemoryError: Java heap space
```

#### 排查步骤

```bash
# 1. 查看 GC 日志
tail -f /var/log/gc.log

# 2. 导出堆转储
jmap -dump:format=b,file=heap.hprof <pid>

# 3. 使用 MAT 分析
# - 查看 Dominator Tree（支配树）
# - 找出占用内存最大的对象
# - 分析引用链，找出泄漏点

# 4. 修复代码
# 常见问题：
# - 静态集合持续增长
# - 未关闭的资源（连接、流）
# - 缓存无限制增长
# - 线程泄漏
```

#### 案例代码

```java
// ❌ 内存泄漏示例
public class MemoryLeak {
    private static final List<Object> cache = new ArrayList<>();
    
    public void add(Object obj) {
        cache.add(obj);  // 只增不减，最终 OOM
    }
}

// ✅ 修复：使用弱引用或限制大小
public class FixedCache {
    private static final Map<String, SoftReference<Object>> cache = 
        new ConcurrentHashMap<>();
    private static final int MAX_SIZE = 1000;
    
    public void put(String key, Object value) {
        if (cache.size() > MAX_SIZE) {
            // 清理旧数据
            cache.entrySet().removeIf(entry -> entry.getValue() == null);
        }
        cache.put(key, new SoftReference<>(value));
    }
}
```

### 9.2 CPU 占用过高排查

#### 场景

```
生产环境 CPU 占用 100%
```

#### 排查步骤

```bash
# 1. 查看进程
top -Hp <pid>  # 查看线程

# 2. 找到占用 CPU 最高的线程 ID
# 假设线程 ID 为 12345

# 3. 转换为 16 进制
printf "%x\n" 12345  # 输出：3039

# 4. 导出线程堆栈
jstack <pid> | grep -A 30 "0x3039"

# 5. 分析堆栈，找出问题代码
# 常见问题：
# - 死循环
# - 频繁 GC
# - 复杂计算
```

#### 案例代码

```java
// ❌ 死循环示例
public void infiniteLoop() {
    while (true) {
        // 无限循环，CPU 100%
    }
}

// ✅ 修复：添加退出条件
public void fixedLoop() {
    while (!stopFlag) {
        // 添加退出条件
    }
}
```

### 9.3 频繁 GC 排查

#### 场景

```
应用响应慢，GC 日志显示频繁 Full GC
```

#### 排查步骤

```bash
# 1. 查看 GC 日志
# - Minor GC 频率：> 每秒 1 次 → 新生代太小
# - Full GC 频率：> 每分钟 1 次 → 老年代问题

# 2. 查看堆内存使用
jstat -gc <pid> 1000

# 3. 分析原因
# - 内存泄漏：老年代持续增长
# - 大对象过多：直接进入老年代
# - 元空间不足：频繁加载类

# 4. 调整参数
# 新生代太小：-Xmn2g
# 老年代太小：-Xmx4g -Xms4g
# 元空间不足：-XX:MaxMetaspaceSize=512m
```

### 9.4 死锁排查

#### 场景

```
应用无响应，线程卡住
```

#### 排查步骤

```bash
# 1. 导出线程堆栈
jstack <pid> > thread.txt

# 2. 查找死锁
grep -A 20 "deadlock" thread.txt

# 3. 分析死锁线程
# - 线程 A 持有锁 1，等待锁 2
# - 线程 B 持有锁 2，等待锁 1

# 4. 修复代码
# - 按顺序获取锁
# - 使用 tryLock（限时等待）
```

#### 案例代码

```java
// ❌ 死锁示例
Object lock1 = new Object();
Object lock2 = new Object();

// 线程 A
synchronized (lock1) {
    Thread.sleep(100);
    synchronized (lock2) {
        // 代码
    }
}

// 线程 B
synchronized (lock2) {
    Thread.sleep(100);
    synchronized (lock1) {
        // 代码
    }
}

// ✅ 修复：按顺序获取锁
// 线程 A 和 B 都先获取 lock1，再获取 lock2
```

---

## 💡 常见面试题

1. **JVM 内存模型是什么？**
2. **如何判断对象可回收？**
3. **常见的垃圾收集器有哪些？**
4. **G1 收集器的工作原理？**
5. **双亲委派模型及其作用？**
6. **如何打破双亲委派？**
7. **JVM 调优参数有哪些？**
8. **如何排查 OOM 问题？**
9. **如何排查 CPU 占用过高？**
10. **Minor GC、Major GC、Full GC 的区别？**

---

## 📚 参考资料

- 《深入理解 Java 虚拟机》（周志明）
- 《Java 虚拟机规范》
- 《实战 Java 虚拟机》
- [OpenJDK 源码](https://github.com/openjdk/jdk)
- [Oracle JVM 文档](https://docs.oracle.com/javase/specs/jvms/se11/html/)

---

> 💡 **学习建议**：JVM 是 Java 进阶的必经之路，需要理论 + 实践结合。建议：
> 1. 理解内存模型和 GC 原理
> 2. 掌握常用工具（jstat、jmap、jstack、MAT）
> 3. 实战演练（OOM 排查、GC 调优）
> 4. 阅读《深入理解 Java 虚拟机》
