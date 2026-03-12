# 线程池实战

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-04-15  
> 难度：⭐⭐⭐⭐⭐  
> 前置知识：[多线程与并发](/java/basic/concurrency)、[JUC 并发包](/java/basic/juc)

---

## 📚 目录

[[toc]]

---

## 1. 线程池简介

### 1.1 为什么使用线程池

**不使用线程池的问题：**

```java
// ❌ 频繁创建和销毁线程，开销大
for (int i = 0; i < 1000; i++) {
    new Thread(() -> {
        // 执行任务
    }).start();
}

// 问题：
// 1. 每次创建线程开销大（系统调用）
// 2. 线程无限制创建，可能耗尽系统资源
// 3. 缺乏统一管理，难以监控
```

**使用线程池的优势：**

| 优势 | 说明 |
|------|------|
| **降低资源消耗** | 复用已创建的线程 |
| **提高响应速度** | 任务到达无需等待线程创建 |
| **提高可管理性** | 统一分配、调优、监控 |
| **控制并发量** | 防止资源耗尽 |

### 1.2 线程池的使用场景

| 场景 | 推荐 | 说明 |
|------|------|------|
| **Web 服务器** | ✅ 强烈推荐 | HTTP 请求处理 |
| **数据库连接** | ✅ 推荐 | 数据库操作线程池 |
| **批量处理** | ✅ 推荐 | 大量数据处理 |
| **定时任务** | ✅ 推荐 | ScheduledThreadPool |
| **CPU 密集型** | ⚠️ 谨慎 | 线程数 = CPU 核数 +1 |
| **I/O 密集型** | ✅ 推荐 | 线程数 = CPU 核数 * 2 |

---

## 2. ThreadPoolExecutor 详解

### 2.1 核心参数

```java
public ThreadPoolExecutor(
    int corePoolSize,              // 核心线程数
    int maximumPoolSize,           // 最大线程数
    long keepAliveTime,            // 空闲线程存活时间
    TimeUnit unit,                 // 时间单位
    BlockingQueue<Runnable> workQueue,  // 工作队列
    ThreadFactory threadFactory,   // 线程工厂
    RejectedExecutionHandler handler    // 拒绝策略
)
```

#### 2.1.1 corePoolSize（核心线程数）

**线程池保持的最小线程数，即使空闲也不会被回收**

```java
// 设置核心线程数
int corePoolSize = 5;

// 核心线程会一直存活（除非设置 allowCoreThreadTimeOut）
```

#### 2.1.2 maximumPoolSize（最大线程数）

**线程池允许创建的最大线程数**

```java
// 设置最大线程数
int maximumPoolSize = 10;

// 当队列满且线程数 < maximumPoolSize 时，创建非核心线程
```

#### 2.1.3 keepAliveTime（空闲线程存活时间）

**非核心线程空闲多久后被回收**

```java
// 设置存活时间
long keepAliveTime = 60L;
TimeUnit unit = TimeUnit.SECONDS;

// 非核心线程空闲 60 秒后被回收
```

#### 2.1.4 workQueue（工作队列）

**用于存放等待执行任务的阻塞队列**

```java
// 常见队列类型
BlockingQueue<Runnable> queue1 = new ArrayBlockingQueue<>(100);  // 有界队列
BlockingQueue<Runnable> queue2 = new LinkedBlockingQueue<>();     // 无界队列（默认 Integer.MAX_VALUE）
BlockingQueue<Runnable> queue3 = new SynchronousQueue<>();        // 不存储元素，直接移交
```

#### 2.1.5 threadFactory（线程工厂）

**用于创建新线程，可以自定义线程名称、优先级等**

```java
ThreadFactory factory = new ThreadFactory() {
    private final AtomicInteger count = new AtomicInteger(1);
    
    @Override
    public Thread newThread(Runnable r) {
        Thread thread = new Thread(r);
        thread.setName("自定义线程-" + count.getAndIncrement());
        thread.setDaemon(false);  // 非守护线程
        return thread;
    }
};
```

#### 2.1.6 handler（拒绝策略）

**当队列满且达到最大线程数时的处理策略**

```java
// 4 种内置拒绝策略
RejectedExecutionHandler abortPolicy = new ThreadPoolExecutor.AbortPolicy();           // 抛异常（默认）
RejectedExecutionHandler callerRunsPolicy = new ThreadPoolExecutor.CallerRunsPolicy(); // 调用者线程执行
RejectedExecutionHandler discardPolicy = new ThreadPoolExecutor.DiscardPolicy();       // 直接丢弃
RejectedExecutionHandler discardOldestPolicy = new ThreadPoolExecutor.DiscardOldestPolicy(); // 丢弃最老任务
```

### 2.2 工作流程

```
提交任务
    ↓
核心线程是否已满？
    ├── 否 → 创建新核心线程执行
    └── 是 → 放入工作队列
            ↓
        队列是否已满？
            ├── 否 → 等待执行
            └── 是 → 创建非核心线程
                    ↓
                线程数是否已达最大？
                    ├── 否 → 创建新非核心线程执行
                    └── 是 → 执行拒绝策略
```

### 2.3 创建线程池

#### 2.3.1 推荐方式：手动创建

```java
import java.util.concurrent.*;

ThreadPoolExecutor executor = new ThreadPoolExecutor(
    5,                          // 核心线程数
    10,                         // 最大线程数
    60L,                        // 空闲线程存活时间
    TimeUnit.SECONDS,           // 时间单位
    new ArrayBlockingQueue<>(100),  // 有界队列
    new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略：调用者线程执行
);

// 提交任务
executor.submit(() -> {
    System.out.println("任务执行：" + Thread.currentThread().getName());
});

// 关闭线程池
executor.shutdown();
```

#### 2.3.2 不推荐：Executors 工厂方法

```java
// ❌ 不推荐：可能导致 OOM

// FixedThreadPool：队列无界
ExecutorService fixed = Executors.newFixedThreadPool(10);
// 队列长度 Integer.MAX_VALUE，可能堆积大量任务

// CachedThreadPool：线程数无界
ExecutorService cached = Executors.newCachedThreadPool();
// 最大线程数 Integer.MAX_VALUE，可能创建大量线程

// SingleThreadExecutor：队列无界
ExecutorService single = Executors.newSingleThreadExecutor();
// 队列长度 Integer.MAX_VALUE
```

**💡 建议：** 始终手动创建 ThreadPoolExecutor，明确指定参数。

---

## 3. 工作队列选择

### 3.1 ArrayBlockingQueue

**基于数组的有界阻塞队列**

```java
// 创建容量为 100 的队列
BlockingQueue<Runnable> queue = new ArrayBlockingQueue<>(100);

// 特点：
// ✅ 有界，防止内存溢出
// ✅ 内存连续，缓存友好
// ❌ 扩容需要重新分配数组
```

### 3.2 LinkedBlockingQueue

**基于链表的无界阻塞队列**

```java
// 创建无界队列（默认容量 Integer.MAX_VALUE）
BlockingQueue<Runnable> queue = new LinkedBlockingQueue<>();

// 创建有界队列
BlockingQueue<Runnable> boundedQueue = new LinkedBlockingQueue<>(100);

// 特点：
// ✅ 无界，适合任务量稳定的场景
// ✅ 基于链表，扩容方便
// ❌ 无界可能导致 OOM
```

### 3.3 SynchronousQueue

**不存储元素的阻塞队列**

```java
BlockingQueue<Runnable> queue = new SynchronousQueue<>();

// 特点：
// ✅ 直接移交，延迟低
// ✅ 适合高吞吐场景
// ❌ 需要配合较大 maximumPoolSize
```

### 3.4 PriorityBlockingQueue

**带优先级的无界阻塞队列**

```java
BlockingQueue<Runnable> queue = new PriorityBlockingQueue<>(10, 
    (r1, r2) -> {
        // 自定义优先级比较逻辑
        return 0;
    }
);

// 特点：
// ✅ 支持优先级排序
// ❌ 无界，可能 OOM
```

### 3.5 队列选择建议

| 场景 | 推荐队列 | 配置 |
|------|---------|------|
| **任务量可控** | ArrayBlockingQueue | 有界容量 |
| **任务量不稳定** | LinkedBlockingQueue | 设置容量上限 |
| **高吞吐、低延迟** | SynchronousQueue | 大 maximumPoolSize |
| **优先级任务** | PriorityBlockingQueue | 设置容量上限 |

---

## 4. 拒绝策略

### 4.1 AbortPolicy（默认）

**直接抛出 RejectedExecutionException 异常**

```java
RejectedExecutionHandler handler = new ThreadPoolExecutor.AbortPolicy();

// 使用
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    // ... 其他参数
    handler
);

// 任务被拒绝时
try {
    executor.submit(task);
} catch (RejectedExecutionException e) {
    System.err.println("任务被拒绝：" + e.getMessage());
    // 处理逻辑：记录日志、告警、降级
}
```

### 4.2 CallerRunsPolicy

**由调用者线程执行被拒绝的任务**

```java
RejectedExecutionHandler handler = new ThreadPoolExecutor.CallerRunsPolicy();

// 特点：
// ✅ 不会丢失任务
// ✅ 自动降低提交速度（调用者线程忙于执行任务）
// ❌ 影响调用者线程性能
```

### 4.3 DiscardPolicy

**直接丢弃被拒绝的任务，不抛异常**

```java
RejectedExecutionHandler handler = new ThreadPoolExecutor.DiscardPolicy();

// 特点：
// ✅ 不影响主流程
// ❌ 任务丢失，无感知
// 适用：任务可丢失的场景（如日志收集）
```

### 4.4 DiscardOldestPolicy

**丢弃队列中最老的任务，然后尝试重新提交**

```java
RejectedExecutionHandler handler = new ThreadPoolExecutor.DiscardOldestPolicy();

// 特点：
// ✅ 尽量执行新任务
// ❌ 老任务丢失
// 适用：新任务更重要的场景
```

### 4.5 自定义拒绝策略

```java
RejectedExecutionHandler customHandler = (r, executor) -> {
    // 1. 记录日志
    System.err.println("任务被拒绝：" + r.toString());
    
    // 2. 持久化到数据库/消息队列
    saveTaskToDatabase(r);
    
    // 3. 发送告警
    sendAlert("线程池任务堆积");
    
    // 4. 降级处理
    fallbackProcess(r);
};

private void saveTaskToDatabase(Runnable task) {
    // 保存任务到数据库，稍后重试
}

private void sendAlert(String message) {
    // 发送告警通知
}

private void fallbackProcess(Runnable task) {
    // 降级处理逻辑
}
```

---

## 5. 线程池监控

### 5.1 监控指标

```java
ThreadPoolExecutor executor = (ThreadPoolExecutor) executorService;

// 当前线程数
int poolSize = executor.getPoolSize();

// 活跃线程数（正在执行任务的线程）
int activeCount = executor.getActiveCount();

// 队列大小
int queueSize = executor.getQueue().size();

// 已完成任务数
long completedTaskCount = executor.getCompletedTaskCount();

// 历史最大线程数
int largestPoolSize = executor.getLargestPoolSize();

// 任务总数
long taskCount = executor.getTaskCount();
```

### 5.2 监控任务

```java
public class ThreadPoolMonitor implements Runnable {
    
    private final ThreadPoolExecutor executor;
    
    public ThreadPoolMonitor(ThreadPoolExecutor executor) {
        this.executor = executor;
    }
    
    @Override
    public void run() {
        while (!Thread.currentThread().isInterrupted()) {
            try {
                System.out.println("=== 线程池监控 ===");
                System.out.println("核心线程数：" + executor.getCorePoolSize());
                System.out.println("最大线程数：" + executor.getMaximumPoolSize());
                System.out.println("当前线程数：" + executor.getPoolSize());
                System.out.println("活跃线程数：" + executor.getActiveCount());
                System.out.println("队列大小：" + executor.getQueue().size());
                System.out.println("已完成任务：" + executor.getCompletedTaskCount());
                System.out.println("总任务数：" + executor.getTaskCount());
                System.out.println("================");
                
                Thread.sleep(5000);  // 每 5 秒监控一次
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }
}

// 启动监控
new Thread(new ThreadPoolMonitor(executor)).start();
```

### 5.3 告警配置

```java
public class ThreadPoolAlarm {
    
    private final ThreadPoolExecutor executor;
    private final int queueThreshold = 80;      // 队列阈值 80%
    private final int threadThreshold = 90;     // 线程阈值 90%
    
    public void check() {
        int queueSize = executor.getQueue().size();
        int queueCapacity = ((ArrayBlockingQueue<?>) executor.getQueue()).size();
        int poolSize = executor.getPoolSize();
        int maxPoolSize = executor.getMaximumPoolSize();
        
        // 队列使用率告警
        double queueUsage = (double) queueSize / queueCapacity * 100;
        if (queueUsage > queueThreshold) {
            sendAlarm("队列使用率过高：" + queueUsage + "%");
        }
        
        // 线程使用率告警
        double threadUsage = (double) poolSize / maxPoolSize * 100;
        if (threadUsage > threadThreshold) {
            sendAlarm("线程使用率过高：" + threadUsage + "%");
        }
    }
    
    private void sendAlarm(String message) {
        // 发送告警（邮件、短信、钉钉等）
        System.err.println("告警：" + message);
    }
}
```

---

## 6. 参数配置建议

### 6.1 CPU 密集型任务

```java
// CPU 密集型：计算密集型，线程数不宜过多
int cpuCores = Runtime.getRuntime().availableProcessors();

ThreadPoolExecutor executor = new ThreadPoolExecutor(
    cpuCores + 1,              // 核心线程数 = CPU 核数 +1
    cpuCores + 1,              // 最大线程数 = CPU 核数 +1
    60L,
    TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(100),
    new ThreadPoolExecutor.AbortPolicy()
);

// 理由：CPU 密集型任务主要消耗 CPU，线程过多会导致频繁上下文切换
```

### 6.2 I/O 密集型任务

```java
// I/O 密集型：网络请求、文件读写等
int cpuCores = Runtime.getRuntime().availableProcessors();

ThreadPoolExecutor executor = new ThreadPoolExecutor(
    cpuCores * 2,              // 核心线程数 = CPU 核数 * 2
    cpuCores * 4,              // 最大线程数 = CPU 核数 * 4
    60L,
    TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(1000),
    new ThreadPoolExecutor.CallerRunsPolicy()
);

// 理由：I/O 密集型任务大部分时间在等待，可以多创建线程
```

### 6.3 混合型任务

```java
// 根据 I/O 等待时间比例调整
// 公式：线程数 = CPU 核数 * (1 + I/O 等待时间 / CPU 计算时间)

int cpuCores = Runtime.getRuntime().availableProcessors();
double ioWaitRatio = 0.8;  // I/O 等待时间占比 80%

int threadCount = (int) (cpuCores * (1 + ioWaitRatio));

ThreadPoolExecutor executor = new ThreadPoolExecutor(
    threadCount,
    threadCount * 2,
    60L,
    TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(500),
    new ThreadPoolExecutor.CallerRunsPolicy()
);
```

### 6.4 配置参数表

| 场景 | 核心线程数 | 最大线程数 | 队列类型 | 队列容量 | 拒绝策略 |
|------|-----------|-----------|---------|---------|---------|
| **CPU 密集型** | CPU 核数 +1 | CPU 核数 +1 | ArrayBlockingQueue | 100 | AbortPolicy |
| **I/O 密集型** | CPU 核数 *2 | CPU 核数 *4 | ArrayBlockingQueue | 1000 | CallerRunsPolicy |
| **高吞吐** | 100 | 500 | SynchronousQueue | - | CallerRunsPolicy |
| **定时任务** | 10 | 10 | ArrayBlockingQueue | 500 | AbortPolicy |

---

## 7. 线程池关闭

### 7.1 shutdown() vs shutdownNow()

```java
// shutdown()：平滑关闭
executor.shutdown();
// - 不再接受新任务
// - 等待已提交任务执行完成
// - 线程执行完后自然终止

// shutdownNow()：立即关闭
List<Runnable> pendingTasks = executor.shutdownNow();
// - 不再接受新任务
// - 尝试中断正在执行的任务
// - 返回等待执行的任务列表
```

### 7.2 正确关闭方式

```java
public void shutdown() {
    executor.shutdown();  // 停止接受新任务
    
    try {
        // 等待 60 秒，让任务完成
        if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
            // 60 秒后还未完成，强制关闭
            List<Runnable> dropped = executor.shutdownNow();
            System.err.println("强制关闭，丢弃任务数：" + dropped.size());
            
            // 再等待 30 秒
            if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
                System.err.println("线程池未能正常关闭");
            }
        }
    } catch (InterruptedException e) {
        // 被中断，强制关闭
        executor.shutdownNow();
        Thread.currentThread().interrupt();
    }
}
```

### 7.3 钩子函数

```java
executor.setThreadFactory(new ThreadFactory() {
    @Override
    public Thread newThread(Runnable r) {
        Thread thread = new Thread(r);
        
        // 注册关闭钩子
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("JVM 关闭，清理资源...");
            shutdown();
        }));
        
        return thread;
    }
});
```

---

## 8. 实战案例

### 8.1 批量处理文件

```java
public class FileBatchProcessor {
    
    private final ThreadPoolExecutor executor;
    
    public FileBatchProcessor() {
        executor = new ThreadPoolExecutor(
            10,
            20,
            60L,
            TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(100),
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
    }
    
    public void processFiles(List<String> filePaths) {
        CountDownLatch latch = new CountDownLatch(filePaths.size());
        
        for (String filePath : filePaths) {
            executor.submit(() -> {
                try {
                    processFile(filePath);
                } finally {
                    latch.countDown();
                }
            });
        }
        
        try {
            latch.await();  // 等待所有任务完成
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    private void processFile(String filePath) {
        // 文件处理逻辑
        System.out.println("处理文件：" + filePath);
    }
    
    public void shutdown() {
        executor.shutdown();
    }
}
```

### 8.2 HTTP 请求并发处理

```java
public class HttpClientPool {
    
    private final ThreadPoolExecutor executor;
    private final HttpClient client = HttpClient.newHttpClient();
    
    public HttpClientPool() {
        executor = new ThreadPoolExecutor(
            20,
            50,
            60L,
            TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(500),
            (r, exec) -> {
                // 自定义拒绝策略：记录日志并丢弃
                System.err.println("请求被拒绝：" + r.toString());
            }
        );
    }
    
    public CompletableFuture<String> sendRequest(String url) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();
                
                return client.send(request, HttpResponse.BodyHandlers.ofString())
                    .body();
            } catch (Exception e) {
                throw new CompletionException(e);
            }
        }, executor);
    }
    
    public void shutdown() {
        executor.shutdown();
    }
}
```

### 8.3 数据库批量查询

```java
public class DatabaseBatchQuery {
    
    private final ThreadPoolExecutor executor;
    
    public DatabaseBatchQuery() {
        executor = new ThreadPoolExecutor(
            10,
            20,
            60L,
            TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(200),
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
    }
    
    public List<Result> batchQuery(List<String> ids) {
        List<Future<Result>> futures = new ArrayList<>();
        
        for (String id : ids) {
            Future<Result> future = executor.submit(() -> {
                return queryById(id);
            });
            futures.add(future);
        }
        
        List<Result> results = new ArrayList<>();
        for (Future<Result> future : futures) {
            try {
                results.add(future.get());
            } catch (Exception e) {
                System.err.println("查询失败：" + e.getMessage());
            }
        }
        
        return results;
    }
    
    private Result queryById(String id) {
        // 数据库查询逻辑
        return new Result(id, "data");
    }
}
```

---

## 📝 练习题

### 基础题

1. **创建线程池**：手动创建一个 ThreadPoolExecutor，配置合理的参数

2. **提交任务**：使用线程池提交 100 个任务，每个任务打印线程名称

3. **监控线程池**：编写代码监控线程池的各项指标

### 进阶题

4. **自定义拒绝策略**：实现一个自定义拒绝策略，将任务持久化到数据库

5. **线程池调优**：为一个高并发 Web 应用配置合适的线程池参数

6. **综合练习**：实现一个文件批量处理器，支持并发处理、进度显示、错误重试

---

## 🔗 参考资料

### 官方文档
- [ThreadPoolExecutor](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ThreadPoolExecutor.html)

### 推荐书籍
- 📚 《Java 并发编程实战》第 8 章：线程池
- 📚 《Java 并发编程的艺术》第 4 章

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| ThreadPoolExecutor 参数 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 工作队列选择 | ⭐⭐⭐⭐ | 理解掌握 |
| 拒绝策略 | ⭐⭐⭐⭐ | 理解掌握 |
| 线程池监控 | ⭐⭐⭐⭐ | 理解掌握 |
| 参数配置 | ⭐⭐⭐⭐⭐ | 熟练运用 |

---

**上一章：** [JUC 并发包](/java/basic/juc)  
**下一章：** [垃圾回收机制](/java/basic/gc)

**最后更新**：2026-03-12
