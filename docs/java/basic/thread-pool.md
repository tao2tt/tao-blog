# 线程池实战

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-03-28

---

## 📚 目录

[[toc]]

---

## 1. 为什么使用线程池

- 降低资源消耗
- 提高响应速度
- 提高线程可管理性

---

## 2. ThreadPoolExecutor 详解

### 2.1 核心参数

```java
new ThreadPoolExecutor(
    int corePoolSize,        // 核心线程数
    int maximumPoolSize,     // 最大线程数
    long keepAliveTime,      // 空闲线程存活时间
    TimeUnit unit,           // 时间单位
    BlockingQueue<Runnable> workQueue,  // 工作队列
    ThreadFactory threadFactory,         // 线程工厂
    RejectedExecutionHandler handler     // 拒绝策略
)
```

### 2.2 工作流程

```
1. 提交任务 → 核心线程是否已满？
2. 否 → 创建新线程执行
3. 是 → 放入工作队列
4. 队列满 → 创建非核心线程
5. 达到最大线程数 → 执行拒绝策略
```

---

## 3. 工作队列选择

| 队列类型 | 说明 | 适用场景 |
|---------|------|---------|
| `ArrayBlockingQueue` | 有界队列 | 防止内存溢出 |
| `LinkedBlockingQueue` | 无界队列（默认 Integer.MAX_VALUE） | 任务量可控 |
| `SynchronousQueue` | 不存储元素，直接移交 | 高吞吐场景 |
| `PriorityBlockingQueue` | 优先级队列 | 任务有优先级 |

---

## 4. 拒绝策略

| 策略 | 说明 |
|------|------|
| `AbortPolicy` | 抛异常（默认） |
| `CallerRunsPolicy` | 调用者线程执行 |
| `DiscardPolicy` | 直接丢弃 |
| `DiscardOldestPolicy` | 丢弃最老任务 |

---

## 5. 线程池创建

### 5.1 Executors 工厂方法（不推荐）

```java
// ❌ 可能导致 OOM
ExecutorService fixed = Executors.newFixedThreadPool(10);
ExecutorService cached = Executors.newCachedThreadPool();
```

### 5.2 手动创建（推荐）

```java
// ✅ 推荐方式
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    8,
    16,
    60L,
    TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(100),
    new ThreadPoolExecutor.CallerRunsPolicy()
);
```

---

## 6. 线程池监控

```java
executor.getPoolSize();      // 当前线程数
executor.getActiveCount();   // 活跃线程数
executor.getQueue().size();  // 队列大小
executor.getCompletedTaskCount(); // 完成任务数
```

---

## 7. 最佳实践

### 7.1 参数配置建议

| 场景 | 核心线程数 | 最大线程数 | 队列 |
|------|-----------|-----------|------|
| CPU 密集型 | CPU 核数 | CPU 核数 +1 | 小队列 |
| I/O 密集型 | CPU 核数 * 2 | CPU 核数 * 4 | 大队列 |
| 混合型 | 根据比例调整 | 根据比例调整 | 中等队列 |

### 7.2 关闭线程池

```java
executor.shutdown();
if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
    executor.shutdownNow();
}
```

---

## 📝 练习题

1. 创建一个适合 I/O 密集型任务的线程池
2. 实现线程池监控告警
3. 使用线程池优化批量处理任务

---

## 🔗 参考资料

- 《Java 并发编程实战》第 8 章
- [ThreadPoolExecutor 官方文档](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ThreadPoolExecutor.html)

---

**最后更新**：2026-03-12
