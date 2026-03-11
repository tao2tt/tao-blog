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

## 📝 待办事项

- [ ] JVM 内存结构理解
- [ ] GC 算法原理
- [ ] JVM 参数配置
- [ ] 监控工具使用
- [ ] Arthas 实战
- [ ] OOM 排查
- [ ] 性能调优实战

---

**推荐资源：**
- 📚 《深入理解 Java 虚拟机》
- 📚 《实战 Java 高并发程序设计》
- 🔗 Arthas 官方文档
