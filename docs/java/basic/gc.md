# 垃圾回收机制

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-03-30

---

## 📚 目录

[[toc]]

---

## 1. 垃圾回收基础

### 1.1 什么是 GC

### 1.2 为什么需要 GC

### 1.3 对象存活判断

- 引用计数法
- 可达性分析算法（GC Roots）

---

## 2. GC Roots 包括

- 虚拟机栈中引用的对象
- 方法区中类静态属性引用的对象
- 方法区中常量引用的对象
- 本地方法栈中 JNI 引用的对象

---

## 3. 垃圾回收算法

### 3.1 标记 - 清除（Mark-Sweep）

- 标记出所有需要回收的对象
- 统一清除
- 缺点：内存碎片

### 3.2 标记 - 复制（Mark-Copy）

- 将内存分为两块
- 存活对象复制到另一块
- 优点：无碎片
- 缺点：内存利用率低

### 3.3 标记 - 整理（Mark-Compact）

- 标记存活对象
- 向一端移动
- 适合老年代

### 3.4 分代收集

- 新生代：复制算法
- 老年代：标记 - 整理

---

## 4. HotSpot 垃圾回收器

| 回收器 | 区域 | 算法 | 特点 |
|--------|------|------|------|
| **Serial** | 新生代 | 复制 | 单线程，简单高效 |
| **Serial Old** | 老年代 | 标记 - 整理 | Serial 的老年代版本 |
| **ParNew** | 新生代 | 复制 | Serial 的多线程版 |
| **Parallel Scavenge** | 新生代 | 复制 | 吞吐量优先 |
| **Parallel Old** | 老年代 | 标记 - 整理 | Parallel Scavenge 的老年代版 |
| **CMS** | 老年代 | 标记 - 清除 | 低停顿 |
| **G1** | 全堆 | 分区回收 | 可预测停顿 |
| **ZGC** | 全堆 | 染色指针 | 超低停顿（<10ms） |

---

## 5. G1 垃圾回收器

### 5.1 特点

- 分区管理（Region）
- 可预测停顿模型
- 避免全堆扫描

### 5.2 参数配置

```bash
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:G1HeapRegionSize=16m
```

---

## 6. ZGC 垃圾回收器

### 6.1 特点

- 停顿时间 < 10ms
- 支持 TB 级堆
- 并发处理

### 6.2 参数配置

```bash
-XX:+UseZGC
-Xmx16g
```

---

## 7. GC 日志分析

```bash
# Java 8
-XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:/path/to/gc.log

# Java 9+
-Xlog:gc*:file=/path/to/gc.log:time,uptime,level,tags
```

---

## 📝 练习题

1. 使用 jstat 监控 GC 情况
2. 分析 GC 日志找出问题
3. 对比 G1 和 ZGC 的性能差异

---

## 🔗 参考资料

- 《深入理解 Java 虚拟机》第 3 章
- [G1 GC 官方文档](https://docs.oracle.com/en/java/javase/11/gctuning/garbage-first-garbage-collector.html)

---

**最后更新**：2026-03-12
