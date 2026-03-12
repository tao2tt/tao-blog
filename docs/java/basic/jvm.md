# JVM 内存模型

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-04-12  
> 难度：⭐⭐⭐⭐⭐  
> 前置知识：[Java 核心语法](/java/basic/core)、[多线程与并发](/java/basic/concurrency)

---

## 📚 目录

[[toc]]

---

## 1. JVM 简介

### 1.1 什么是 JVM

**JVM（Java Virtual Machine）** 是 Java 虚拟机，是 Java 程序运行的容器。

**核心作用：**
- ✅ 字节码执行引擎
- ✅ 内存管理
- ✅ 垃圾回收
- ✅ 安全沙箱

### 1.2 Java 跨平台原理

```
Java 源码 (.java)
    ↓ javac 编译
字节码 (.class)
    ↓ JVM 解释/编译
机器码 (本地执行)
```

**"Write Once, Run Anywhere"** - 一次编写，到处运行

| 平台 | JVM 实现 |
|------|---------|
| Windows | JVM for Windows |
| Linux | JVM for Linux |
| macOS | JVM for macOS |

**💡 理解：** Java 程序不直接和操作系统对话，而是通过 JVM。

### 1.3 JVM、JRE、JDK 的关系

```
JDK (Java Development Kit)
├── JRE (Java Runtime Environment)
│   ├── JVM (Java Virtual Machine)
│   └── 核心类库
└── 开发工具（javac、java、jdb 等）
```

| 名称 | 作用 | 使用者 |
|------|------|--------|
| **JDK** | 开发工具包 | 开发人员 |
| **JRE** | 运行环境 | 普通用户 |
| **JVM** | 虚拟机 | 核心引擎 |

---

## 2. JVM 内存结构

### 2.1 运行时数据区

```
JVM 内存结构
├── 线程共享
│   ├── 堆（Heap）⭐
│   └── 方法区（Method Area）
│
└── 线程私有
    ├── 虚拟机栈（VM Stack）⭐
    ├── 本地方法栈（Native Method Stack）
    └── 程序计数器（Program Counter Register）
```

### 2.2 程序计数器

**作用：** 记录当前线程执行的字节码行号

| 特点 | 说明 |
|------|------|
| **线程私有** | 每个线程一个 |
| **内存小** | 几 KB |
| **无 OOM** | 不会内存溢出 |
| **作用** | 字节码行号指示器 |

```java
// 执行过程
public void method() {
    int a = 1;  // PC 记录这行
    int b = 2;  // PC 指向这行
    int c = a + b;  // PC 指向这行
}
```

### 2.3 虚拟机栈

**作用：** 存储方法执行的栈帧（局部变量、操作数栈等）

**栈帧结构：**

```
栈帧（Stack Frame）
├── 局部变量表（Local Variables）
├── 操作数栈（Operand Stack）
├── 动态链接（Dynamic Linking）
└── 方法返回地址（Return Address）
```

| 特点 | 说明 |
|------|------|
| **线程私有** | 每个线程一个 |
| **生命周期** | 与方法调用同步 |
| **异常** | StackOverflowError、OutOfMemoryError |

```java
// 栈溢出示例
public class StackOverflowDemo {
    
    // 递归调用，没有终止条件
    public static void recursive() {
        recursive();  // 无限递归
    }
    
    public static void main(String[] args) {
        recursive();  // ❌ StackOverflowError
    }
}
```

**💡 参数调整：**
- `-Xss1m` 设置线程栈大小（默认 1MB）

### 2.4 本地方法栈

**作用：** 为 Native 方法服务

| 对比项 | 虚拟机栈 | 本地方法栈 |
|--------|---------|-----------|
| **服务对象** | Java 方法 | Native 方法 |
| **异常** | StackOverflowError | StackOverflowError |
| **实现** | JVM 规范 | 厂商自定义 |

```java
// Native 方法示例
public class NativeDemo {
    
    // 调用 C/C++ 实现的本地方法
    public native void nativeMethod();
    
    static {
        System.loadLibrary("nativeLib");  // 加载本地库
    }
}
```

### 2.5 堆（Heap）⭐

**作用：** 存储对象实例，是垃圾回收的主要区域

**特点：**
- ✅ 线程共享
- ✅ 内存最大（可设置）
- ✅ GC 主要区域
- ✅ 可能 OOM

**堆内存结构（JDK 8+）：**

```
堆（Heap）
├── 新生代（Young Generation）
│   ├── Eden 区（8/10）
│   ├── Survivor 0 区（1/10）
│   └── Survivor 1 区（1/10）
│
└── 老年代（Old Generation）
```

**对象分配流程：**

```
新对象
    ↓
Eden 区
    ↓ (Eden 满，Minor GC)
Survivor 区（年龄 +1）
    ↓ (年龄达到阈值，默认 15)
老年代
    ↓ (老年代满，Major/Full GC)
垃圾回收
```

```java
// 堆内存溢出示例
public class HeapOverflowDemo {
    
    public static void main(String[] args) {
        List<byte[]> list = new ArrayList<>();
        
        while (true) {
            // 不断创建大对象
            list.add(new byte[1024 * 1024]);  // 1MB
            // 最终：OutOfMemoryError: Java heap space
        }
    }
}
```

**💡 参数调整：**
- `-Xms512m` 初始堆大小
- `-Xmx2g` 最大堆大小
- `-XX:NewRatio=2` 新生代与老年代比例

### 2.6 方法区（Method Area）

**作用：** 存储类信息、常量、静态变量等

**JDK 8 变化：**

| JDK 版本 | 实现 | 位置 |
|---------|------|------|
| JDK 7 及之前 | 永久代（PermGen） | JVM 内存 |
| JDK 8+ | 元空间（Metaspace） | 本地内存 |

**存储内容：**
- 类的元数据（类名、字段、方法）
- 常量池
- 静态变量
- JIT 编译后的代码

```java
// 方法区溢出示例（JDK 7）
public class MethodAreaOverflow {
    
    public static void main(String[] args) {
        while (true) {
            // 使用 CGLib 动态生成类
            Enhancer enhancer = new Enhancer();
            enhancer.setSuperclass(Object.class);
            enhancer.setUseCache(false);
            enhancer.setCallback(new NoOp());
            enhancer.create();  // ❌ OutOfMemoryError: PermGen space
        }
    }
}
```

**💡 参数调整（JDK 8+）：**
- `-XX:MetaspaceSize=256m` 初始元空间大小
- `-XX:MaxMetaspaceSize=512m` 最大元空间大小

---

## 3. 垃圾回收机制

### 3.1 什么是垃圾回收

**GC（Garbage Collection）** 是 JVM 自动管理内存的机制，回收不再使用的对象。

**为什么需要 GC：**
- ✅ 自动释放内存，避免内存泄漏
- ✅ 减少程序员负担
- ✅ 提高开发效率

### 3.2 对象存活判断

#### 3.2.1 引用计数法（已废弃）

**原理：** 每个对象有个引用计数器，为 0 时可回收

**问题：** 无法解决循环引用

```java
// 循环引用问题
class Node {
    Node next;
}

Node a = new Node();
Node b = new Node();

a.next = b;  // a 引用 b
b.next = a;  // b 引用 a

a = null;
b = null;

// ❌ a 和 b 的引用计数都是 1，无法回收
```

#### 3.2.2 可达性分析算法（使用）

**原理：** 从 GC Roots 开始向下搜索，不可达的对象可回收

**GC Roots 包括：**
- ✅ 虚拟机栈中引用的对象
- ✅ 方法区中静态属性引用的对象
- ✅ 方法区中常量引用的对象
- ✅ 本地方法栈中 JNI 引用的对象

```
GC Roots
    ↓
    ├→ 对象 A（存活）
    │   └→ 对象 B（存活）
    │
    └→ 对象 C（不可达，可回收）
        └→ 对象 D（不可达，可回收）
```

### 3.3 垃圾回收算法

#### 3.3.1 标记 - 清除（Mark-Sweep）

```
步骤：
1. 标记所有需要回收的对象
2. 统一清除标记的对象

缺点：
- 内存碎片
- 效率不高
```

#### 3.3.2 标记 - 复制（Mark-Copy）

```
步骤：
1. 将内存分为两块（From、To）
2. 存活对象复制到 To 区
3. 清理 From 区

优点：
- 无内存碎片
- 效率高

缺点：
- 内存利用率低（只用一半）

适用：新生代（大量对象死亡）
```

#### 3.3.3 标记 - 整理（Mark-Compact）

```
步骤：
1. 标记存活对象
2. 向一端移动存活对象
3. 清理边界外的内存

优点：
- 无内存碎片
- 内存利用率高

适用：老年代（对象存活率高）
```

#### 3.3.4 分代收集

**根据对象生命周期分代回收**

```
新生代（Young Generation）
├── Eden 区（80%）- 新对象分配
├── Survivor 0 区（10%）
└── Survivor 1 区（10%）
    ↓ (对象年龄增长)
老年代（Old Generation）- 长期存活对象
```

| 区域 | 算法 | 特点 |
|------|------|------|
| **新生代** | 标记 - 复制 | 大量对象死亡 |
| **老年代** | 标记 - 整理 | 对象存活率高 |

### 3.4 垃圾回收器

#### 3.4.1 Serial 收集器

```
特点：
- 单线程收集
- 简单高效
- 需要 Stop-The-World

适用：客户端模式、单核 CPU
```

#### 3.4.2 Parallel Scavenge 收集器

```
特点：
- 多线程并行收集
- 吞吐量优先
- 需要 Stop-The-World

适用：后台运算、科学计算
```

#### 3.4.3 CMS 收集器（已废弃）

```
特点：
- 并发收集
- 低停顿
- 标记 - 清除算法

缺点：
- 内存碎片
- CPU 敏感

JDK 9 已废弃
```

#### 3.4.4 G1 收集器（推荐）

```
特点：
- 分区管理（Region）
- 可预测停顿
- 标记 - 整理算法

适用：大内存、多核 CPU、低延迟要求
```

**G1 内存布局：**

```
堆内存分为多个 Region
┌─────┬─────┬─────┬─────┐
│  E  │  O  │  H  │  S  │
├─────┼─────┼─────┼─────┤
│  S  │  E  │  O  │  E  │
└─────┴─────┴─────┴─────┘

E = Eden, O = Old, H = Humongous, S = Survivor
```

#### 3.4.5 ZGC 收集器（JDK 11+）

```
特点：
- 超低停顿（< 10ms）
- 支持 TB 级堆
- 并发处理

适用：超低延迟要求、大内存
```

### 3.5 垃圾回收日志

```bash
# JDK 8
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
-Xloggc:/path/to/gc.log

# JDK 9+
-Xlog:gc*:file=/path/to/gc.log:time,uptime,level,tags
```

**GC 日志分析：**

```
[GC (Allocation Failure) [PSYoungGen: 262144K->32704K(306688K)] 
524288K->195616K(1008128K), 0.0456789 secs]

解读：
- GC 类型：Minor GC（PSYoungGen）
- 回收前：262144K
- 回收后：32704K
- 耗时：0.045 秒
```

---

## 4. 类加载机制

### 4.1 类加载过程

```
加载（Loading）
    ↓
验证（Verification）
    ↓
准备（Preparation）
    ↓
解析（Resolution）
    ↓
初始化（Initialization）
```

#### 4.1.1 加载

**通过全限定类名获取二进制字节流**

```java
// 类加载方式
Class<?> clazz1 = Class.forName("com.example.MyClass");
Class<?> clazz2 = MyClass.class;
Class<?> clazz3 = obj.getClass();
```

#### 4.1.2 验证

**确保字节码符合 JVM 规范**

- 文件格式验证
- 元数据验证
- 字节码验证
- 符号引用验证

#### 4.1.3 准备

**为类变量分配内存，设置默认值**

```java
class MyClass {
    static int a = 123;  // 准备阶段：a = 0
                         // 初始化阶段：a = 123
}
```

#### 4.1.4 解析

**常量池中的符号引用替换为直接引用**

#### 4.1.5 初始化

**执行类构造器 `<clinit>()` 方法**

```java
class MyClass {
    static {
        // 静态代码块，在初始化阶段执行
        System.out.println("初始化");
    }
}
```

### 4.2 类加载器

#### 4.2.1 启动类加载器（Bootstrap ClassLoader）

```
- C++ 实现
- 加载 <JAVA_HOME>/lib 下的核心类
- 无法在 Java 代码中获取
```

#### 4.2.2 扩展类加载器（Extension ClassLoader）

```
- Java 实现
- 加载 <JAVA_HOME>/lib/ext 下的类
- 父加载器：Bootstrap
```

#### 4.2.3 应用程序类加载器（Application ClassLoader）

```
- Java 实现
- 加载 classpath 下的类
- 父加载器：Extension
```

#### 4.2.4 自定义类加载器

```java
class MyClassLoader extends ClassLoader {
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        // 1. 读取字节码
        byte[] data = loadClassData(name);
        
        // 2. 定义类
        return defineClass(name, data, 0, data.length);
    }
    
    private byte[] loadClassData(String className) {
        // 从文件/网络加载字节码
        return new byte[0];
    }
}
```

### 4.3 双亲委派模型

#### 4.3.1 工作原理

```
收到类加载请求
    ↓
检查是否已加载
    ↓
委托给父加载器
    ↓
父加载器无法加载
    ↓
自己尝试加载
```

```java
// 类加载器层次
Bootstrap ClassLoader
    ↑
Extension ClassLoader
    ↑
Application ClassLoader
    ↑
Custom ClassLoader
```

#### 4.3.2 优点

- ✅ 避免重复加载
- ✅ 保证核心类安全（防止篡改）

#### 4.3.3 破坏双亲委派

**SPI 机制（JDBC、JNDI）**

```java
// JDBC 驱动加载
Class.forName("com.mysql.jdbc.Driver");
// 使用线程上下文类加载器加载 SPI 实现
Thread.currentThread().getContextClassLoader();
```

**Tomcat 类加载器**

```
Tomcat 自定义类加载器层次：
Common ClassLoader
    ↑
Webapp ClassLoader（每个 Web 应用一个）
    ↑
Jasper ClassLoader（JSP 编译）
```

---

## 5. JVM 调优

### 5.1 常见 JVM 参数

```bash
# 堆内存
-Xms512m          # 初始堆大小
-Xmx2g            # 最大堆大小
-Xmn512m          # 新生代大小

# 栈内存
-Xss1m            # 线程栈大小

# 垃圾回收器
-XX:+UseG1GC      # 使用 G1 收集器
-XX:+UseZGC       # 使用 ZGC 收集器

# GC 日志
-Xlog:gc*:file=gc.log:time

# 元空间
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=512m

# 调试
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/path/to/dump.hprof
```

### 5.2 内存泄漏排查

```bash
# 查看进程
jps -l

# 查看内存使用
jstat -gc <pid> 1000 10

# 堆转储
jmap -dump:format=b,file=heap.hprof <pid>

# 线程转储
jstack <pid> > thread.dump
```

### 5.3 常见 OOM 及解决方案

| OOM 类型 | 原因 | 解决方案 |
|---------|------|---------|
| **Java heap space** | 堆内存不足 | 增大堆、排查内存泄漏 |
| **Metaspace** | 元空间不足 | 增大元空间、减少动态类 |
| **StackOverflowError** | 栈溢出 | 检查递归、增大栈 |
| **GC overhead limit** | GC 时间过长 | 优化代码、增大堆 |

---

## 📝 练习题

### 基础题

1. **内存结构**：画出 JVM 内存结构图，标注各区域的作用

2. **垃圾回收**：解释标记 - 复制算法的工作原理

3. **类加载**：描述双亲委派模型的工作流程

### 进阶题

4. **GC 日志分析**：分析一段 GC 日志，判断是 Minor GC 还是 Major GC

5. **内存泄漏排查**：使用 jmap 和 MAT 工具分析内存泄漏

6. **JVM 调优**：为一个高并发 Web 应用配置合适的 JVM 参数

---

## 🔗 参考资料

### 推荐书籍
- 📚 《深入理解 Java 虚拟机》（第 3 版）- 周志明
- 📚 《Java Performance》- Scott Oaks

### 在线资源
- 🔗 [Oracle JVM 文档](https://docs.oracle.com/javase/specs/jvms/se11/html/index.html)
- 🔗 [G1 GC 官方文档](https://docs.oracle.com/en/java/javase/11/gctuning/garbage-first-garbage-collector.html)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| JVM 内存结构 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 垃圾回收算法 | ⭐⭐⭐⭐⭐ | 理解掌握 |
| 垃圾回收器 | ⭐⭐⭐⭐ | 理解掌握 |
| 类加载机制 | ⭐⭐⭐⭐ | 理解掌握 |
| JVM 调优 | ⭐⭐⭐⭐ | 理解掌握 |

---

**上一章：** [多线程与并发](/java/basic/concurrency)  
**下一章：** [类加载机制](/java/basic/classloader)

**最后更新**：2026-03-12
