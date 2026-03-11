# 多线程与并发

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-04-15

---

## 📚 目录

1. [线程基础](#1-线程基础)
2. [线程创建方式](#2-线程创建方式)
3. [线程状态与生命周期](#3-线程状态与生命周期)
4. [线程同步](#4-线程同步)
5. [volatile 关键字](#5-volatile-关键字)
6. [Lock 接口](#6-lock-接口)
7. [AQS 原理](#7-aqs-原理)
8. [原子类](#8-原子类)
9. [线程池](#9-线程池)
10. [并发工具类](#10-并发工具类)
11. [并发容器](#11-并发容器)
12. [ThreadLocal](#12-threadlocal)
13. [最佳实践](#13-最佳实践)

---

## 1. 线程基础

### 1.1 进程 vs 线程

| 对比项 | 进程 | 线程 |
|--------|------|------|
| **定义** | 资源分配的最小单位 | CPU 调度的最小单位 |
| **内存空间** | 独立的内存空间 | 共享进程内存 |
| **通信方式** | IPC（管道、消息队列、共享内存） | 直接读写共享数据 |
| **开销** | 创建/切换开销大 | 创建/切换开销小 |
| **独立性** | 进程间互不影响 | 一个线程崩溃可能影响整个进程 |
| **数量** | 一个进程至少一个线程 | 一个进程可有多个线程 |

### 1.2 多线程的优势

- ✅ **提高 CPU 利用率**：多核 CPU 并行执行
- ✅ **提高响应速度**：异步处理，不阻塞主线程
- ✅ **资源复用**：共享进程资源，减少内存占用
- ✅ **简化编程模型**：某些场景下代码更清晰

### 1.3 多线程的风险

- ❌ **线程安全问题**：竞态条件、数据不一致
- ❌ **死锁**：多个线程互相等待
- ❌ **上下文切换开销**：频繁切换影响性能
- ❌ **调试困难**：问题难以复现

---

## 2. 线程创建方式

### 2.1 继承 Thread 类

```java
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("子线程执行：" + Thread.currentThread().getName());
    }
}

// 使用
MyThread thread = new MyThread();
thread.start();  // 启动线程，JVM 调用 run()
// thread.run();  // ❌ 错误：这是普通方法调用，不会启动新线程
```

### 2.2 实现 Runnable 接口

```java
class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("子线程执行：" + Thread.currentThread().getName());
    }
}

// 使用
MyRunnable runnable = new MyRunnable();
Thread thread = new Thread(runnable);
thread.start();

// Lambda 简化（JDK 8+）
new Thread(() -> {
    System.out.println("Lambda 线程：" + Thread.currentThread().getName());
}).start();
```

### 2.3 实现 Callable 接口（有返回值）

```java
class MyCallable implements Callable<Integer> {
    @Override
    public Integer call() throws Exception {
        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            sum += i;
        }
        return sum;
    }
}

// 使用
MyCallable callable = new MyCallable();
FutureTask<Integer> future = new FutureTask<>(callable);
Thread thread = new Thread(future);
thread.start();

// 获取返回值（阻塞）
Integer result = future.get();  // 5050
```

### 2.4 使用线程池（推荐 ⭐）

```java
ExecutorService executor = Executors.newFixedThreadPool(4);

// 提交 Runnable
executor.submit(() -> {
    System.out.println("线程池任务：" + Thread.currentThread().getName());
});

// 提交 Callable
Future<Integer> future = executor.submit(() -> {
    return 100 + 200;
});
Integer result = future.get();  // 300

// 关闭线程池
executor.shutdown();
```

### 2.5 四种方式对比

| 方式 | 优点 | 缺点 | 使用场景 |
|------|------|------|----------|
| **继承 Thread** | 简单直接 | 不能继承其他类 | 简单任务 |
| **实现 Runnable** | 可继承其他类，资源可共享 | 无返回值 | 最常用 |
| **实现 Callable** | 有返回值，可抛异常 | 较复杂 | 需要返回结果 |
| **线程池** | 复用线程，控制并发数 | 需要管理线程池 | 生产环境推荐 |

---

## 3. 线程状态与生命周期

### 3.1 线程状态（JDK 1.5+）

```java
public enum State {
    NEW,           // 新建
    RUNNABLE,      // 可运行（包括就绪和运行中）
    BLOCKED,       // 阻塞（等待锁）
    WAITING,       // 无限期等待
    TIMED_WAITING, // 限期等待
    TERMINATED     // 终止
}
```

### 3.2 状态转换图

```
NEW → start() → RUNNABLE
                     ↓
              ←→ BLOCKED（等待 synchronized 锁）
                     ↓
              ←→ WAITING（wait()/join()/LockSupport.park()）
                     ↓
              ←→ TIMED_WAITING（sleep()/wait(timeout)/join(timeout)）
                     ↓
              run() 结束 → TERMINATED
```

### 3.3 状态详解

#### NEW（新建）

```java
Thread thread = new Thread();  // NEW 状态
// 调用 start() 后变为 RUNNABLE
```

#### RUNNABLE（可运行）

```java
// 包括两个阶段：
// 1. READY：就绪状态，等待 CPU 时间片
// 2. RUNNING：运行状态，正在执行

thread.start();  // 进入 RUNNABLE
```

#### BLOCKED（阻塞）

```java
// 等待获取 synchronized 锁
synchronized (lock) {
    // 代码块
}

// 线程 A 获取锁后，线程 B 尝试获取同一把锁 → BLOCKED
```

#### WAITING（无限期等待）

```java
// 需要其他线程唤醒
object.wait();           // 等待 notify()/notifyAll()
thread.join();           // 等待线程结束
LockSupport.park();      // 等待 unpark()
```

#### TIMED_WAITING（限期等待）

```java
// 指定等待时间
Thread.sleep(1000);              // 休眠 1 秒
object.wait(1000);               // 等待 1 秒
thread.join(1000);               // 等待 1 秒
LockSupport.parkNanos(1000000);  // 等待 1 毫秒
```

#### TERMINATED（终止）

```java
// run() 方法执行完成或异常退出
thread.isTerminated();  // true
```

### 3.4 查看线程状态

```java
Thread thread = new Thread(() -> {
    try {
        Thread.sleep(10000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
});

System.out.println(thread.getState());  // NEW

thread.start();
System.out.println(thread.getState());  // RUNNABLE 或 TIMED_WAITING
```

---

## 4. 线程同步

### 4.1 线程安全问题

```java
// ❌ 线程不安全：多个线程同时修改 count
class UnsafeCounter {
    private int count = 0;
    
    public void increment() {
        count++;  // 非原子操作：读取 → 修改 → 写入
    }
    
    public int getCount() {
        return count;
    }
}

// 测试
UnsafeCounter counter = new UnsafeCounter();
ExecutorService executor = Executors.newFixedThreadPool(10);
for (int i = 0; i < 1000; i++) {
    executor.submit(counter::increment);
}
executor.shutdown();
// 最终 count 可能小于 1000（数据丢失）
```

### 4.2 synchronized 关键字

#### 修饰实例方法

```java
public synchronized void method() {
    // 锁当前对象（this）
}

// 等价于
public void method() {
    synchronized (this) {
        // 代码块
    }
}
```

#### 修饰静态方法

```java
public static synchronized void staticMethod() {
    // 锁当前类对象（Class 对象）
}

// 等价于
public static void staticMethod() {
    synchronized (MyClass.class) {
        // 代码块
    }
}
```

#### 修饰代码块

```java
public void method() {
    synchronized (lock) {
        // 锁指定对象
    }
}
```

#### synchronized 原理

```java
// 基于 JVM 层面的锁（内置锁、监视器锁）
// 底层通过 monitor 对象实现

// 字节码层面：
// - synchronized 代码块：monitorenter / monitorexit 指令
// - synchronized 方法：ACC_SYNCHRONIZED 标志

// JDK 1.6 优化：
// 1. 偏向锁：无竞争时，线程直接获取锁
// 2. 轻量级锁：有竞争时，自旋等待
// 3. 重量级锁：竞争激烈时，阻塞线程
```

### 4.3 Lock 接口

```java
Lock lock = new ReentrantLock();

lock.lock();  // 加锁
try {
    // 临界区代码
} finally {
    lock.unlock();  // 释放锁（必须在 finally 中）
}
```

### 4.4 synchronized vs Lock

| 对比项 | synchronized | Lock |
|--------|--------------|------|
| **层面** | JVM 层面 | API 层面 |
| **锁释放** | 自动释放 | 手动释放（unlock） |
| **等待可中断** | ❌ | ✅（lockInterruptibly） |
| **公平锁** | ❌（只能非公平） | ✅（可指定） |
| **条件变量** | 单一（wait/notify） | 多个（Condition） |
| **性能** | JDK 1.6+ 优化后接近 | 略高 |
| **使用场景** | 简单同步 | 复杂同步需求 |

---

## 5. volatile 关键字

### 5.1 volatile 特性

- ✅ **可见性**：一个线程修改，其他线程立即可见
- ✅ **有序性**：禁止指令重排序
- ❌ **不保证原子性**：i++ 操作仍需要锁

### 5.2 可见性示例

```java
// ❌ 问题：线程 A 修改 flag，线程 B 可能看不到
class Problem {
    private boolean flag = false;
    
    public void changeFlag() {
        flag = true;
    }
    
    public void checkFlag() {
        while (!flag) {
            // 可能死循环
        }
        System.out.println("flag 已修改");
    }
}

// ✅ 解决：使用 volatile
class Solution {
    private volatile boolean flag = false;
    
    public void changeFlag() {
        flag = true;  // 修改立即对其他线程可见
    }
    
    public void checkFlag() {
        while (!flag) {
            // 不会死循环
        }
        System.out.println("flag 已修改");
    }
}
```

### 5.3 禁止指令重排序

```java
// 单例模式双重检查锁定（DCL）
class Singleton {
    private static volatile Singleton instance;
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    // 防止指令重排序
                    // 1. 分配内存
                    // 2. 初始化对象
                    // 3. 引用指向内存地址
                    // 如果没有 volatile，2 和 3 可能重排序，导致其他线程拿到未初始化的对象
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

### 5.4 volatile vs synchronized

| 对比项 | volatile | synchronized |
|--------|----------|--------------|
| **可见性** | ✅ | ✅ |
| **有序性** | ✅ | ✅ |
| **原子性** | ❌ | ✅ |
| **阻塞** | ❌ 非阻塞 | ✅ 可能阻塞 |
| **性能** | 高 | 略低 |
| **使用场景** | 状态标记、配置项 | 复合操作、临界区 |

---

## 6. Lock 接口

### 6.1 ReentrantLock（可重入锁）

```java
class ReentrantLockExample {
    private final Lock lock = new ReentrantLock();
    private int count = 0;
    
    public void increment() {
        lock.lock();  // 加锁
        try {
            count++;
        } finally {
            lock.unlock();  // 释放锁
        }
    }
    
    // 可重入示例
    public void method1() {
        lock.lock();
        try {
            method2();  // 同一线程可以再次获取锁
        } finally {
            lock.unlock();
        }
    }
    
    public void method2() {
        lock.lock();
        try {
            // 代码
        } finally {
            lock.unlock();
        }
    }
}
```

### 6.2 ReentrantReadWriteLock（读写锁）

```java
class Cache {
    private final Map<String, Object> map = new HashMap<>();
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final Lock readLock = rwLock.readLock();
    private final Lock writeLock = rwLock.writeLock();
    
    // 读操作（共享锁）
    public Object get(String key) {
        readLock.lock();
        try {
            return map.get(key);
        } finally {
            readLock.unlock();
        }
    }
    
    // 写操作（独占锁）
    public void put(String key, Object value) {
        writeLock.lock();
        try {
            map.put(key, value);
        } finally {
            writeLock.unlock();
        }
    }
}

// 特点：
// - 读 - 读：不互斥
// - 读 - 写：互斥
// - 写 - 写：互斥
```

### 6.3 StampedLock（邮戳锁，JDK 8+）

```java
class Point {
    private double x, y;
    private final StampedLock sl = new StampedLock();
    
    // 写锁
    void move(double deltaX, double deltaY) {
        long stamp = sl.writeLock();
        try {
            x += deltaX;
            y += deltaY;
        } finally {
            sl.unlockWrite(stamp);
        }
    }
    
    // 读锁
    double distanceFromOrigin() {
        long stamp = sl.readLock();
        try {
            return Math.sqrt(x * x + y * y);
        } finally {
            sl.unlockRead(stamp);
        }
    }
    
    // 乐观读（性能更高）
    double distanceFromOriginOptimistic() {
        long stamp = sl.tryOptimisticRead();  // 获取乐观读锁
        double currentX = x, currentY = y;
        
        if (!sl.validate(stamp)) {  // 验证是否有写锁
            stamp = sl.readLock();  // 升级为读锁
            try {
                currentX = x;
                currentY = y;
            } finally {
                sl.unlockRead(stamp);
            }
        }
        
        return Math.sqrt(currentX * currentX + currentY * currentY);
    }
}
```

---

## 7. AQS 原理

### 7.1 AQS 概述

**AQS（AbstractQueuedSynchronizer）** 是 Java 并发包的核心，很多锁和同步器都基于 AQS 实现：
- ReentrantLock
- ReentrantReadWriteLock
- CountDownLatch
- CyclicBarrier
- Semaphore

### 7.2 AQS 核心原理

```
AQS 核心 = state（同步状态） + CLH 队列（等待队列）

1. state：volatile int，表示同步状态
   - state = 0：无锁
   - state = 1：有锁

2. CLH 队列：FIFO 双向链表，存储等待线程

3. 获取锁流程：
   - 尝试获取锁（CAS 修改 state）
   - 失败 → 加入等待队列
   - 被唤醒 → 再次尝试获取锁

4. 释放锁流程：
   - 修改 state
   - 唤醒队列中的线程
```

### 7.3 ReentrantLock 源码分析

```java
// ReentrantLock 核心源码简化版
public class ReentrantLock implements Lock, Serializable {
    
    private final Sync sync;
    
    abstract static class Sync extends AbstractQueuedSynchronizer {
        // 获取锁
        final void acquire(int arg) {
            if (!tryAcquire(arg) &&
                acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
                selfInterrupt();
        }
        
        // 尝试获取锁（子类实现）
        protected boolean tryAcquire(int arg) {
            throw new UnsupportedOperationException();
        }
        
        // 释放锁
        final boolean release(int arg) {
            if (tryRelease(arg)) {
                Node h = head;
                if (h != null && h.waitStatus != 0)
                    unparkSuccessor(h);  // 唤醒后继节点
                return true;
            }
            return false;
        }
    }
    
    // 非公平锁
    static final class NonfairSync extends Sync {
        protected final boolean tryAcquire(int acquires) {
            return nonfairTryAcquire(acquires);
        }
    }
    
    // 公平锁
    static final class FairSync extends Sync {
        protected final boolean tryAcquire(int acquires) {
            final Thread current = Thread.currentThread();
            int c = getState();
            if (c == 0) {
                // 公平锁：检查队列中是否有等待线程
                if (!hasQueuedPredecessors() &&
                    compareAndSetState(0, acquires)) {
                    setExclusiveOwnerThread(current);
                    return true;
                }
            }
            else if (current == getExclusiveOwnerThread()) {
                // 可重入
                int nextc = c + acquires;
                setState(nextc);
                return true;
            }
            return false;
        }
    }
}
```

---

## 8. 原子类

### 8.1 AtomicInteger

```java
AtomicInteger atomicInt = new AtomicInteger(0);

// 原子自增
atomicInt.incrementAndGet();  // ++i
atomicInt.getAndIncrement();  // i++

// 原子加减
atomicInt.addAndGet(10);  // i += 10
atomicInt.getAndAdd(10);  // temp = i; i += 10; return temp;

// CAS 操作
boolean success = atomicInt.compareAndSet(0, 1);  // 如果值为 0，设置为 1

// 函数式更新（JDK 8+）
atomicInt.updateAndGet(i -> i * 2);  // i = i * 2
atomicInt.accumulateAndGet(10, (i, j) -> i + j);  // i = i + 10
```

### 8.2 AtomicLong、AtomicBoolean

```java
AtomicLong atomicLong = new AtomicLong(0);
AtomicBoolean atomicBoolean = new AtomicBoolean(false);

// 使用方法类似 AtomicInteger
```

### 8.3 AtomicReference

```java
AtomicReference<String> atomicRef = new AtomicReference<>("A");

// CAS 更新
atomicRef.compareAndSet("A", "B");  // 如果值是"A"，更新为"B"

// 函数式更新
atomicRef.updateAndGet(s -> s.toUpperCase());
```

### 8.4 原子数组

```java
AtomicIntegerArray atomicArray = new AtomicIntegerArray(5);

atomicArray.set(0, 10);
atomicArray.get(0);
atomicArray.incrementAndGet(0);
```

### 8.5 原子更新字段

```java
class User {
    volatile int age = 0;
}

User user = new User();
AtomicIntegerFieldUpdater<User> updater = 
    AtomicIntegerFieldUpdater.newUpdater(User.class, "age");

updater.incrementAndGet(user);  // 原子更新 age 字段
```

### 8.6 LongAdder（高性能计数器，JDK 8+）

```java
// 适用于高并发场景，性能优于 AtomicInteger
LongAdder adder = new LongAdder();

adder.increment();  // 自增
adder.add(10);      // 加 10
long sum = adder.sum();  // 获取总和

// 原理：分段累加，减少 CAS 冲突
```

---

## 9. 线程池（重点 ⭐）

### 9.1 为什么用线程池

- ✅ **降低资源消耗**：线程复用，减少创建/销毁开销
- ✅ **提高响应速度**：任务到达时无需等待线程创建
- ✅ **提高可管理性**：统一分配、调优、监控

### 9.2 ThreadPoolExecutor 核心参数

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

### 9.3 线程池工作流程

```
1. 提交任务 → 核心线程数未满 → 创建核心线程执行
2. 核心线程数已满 → 任务加入队列
3. 队列已满 → 创建非核心线程执行
4. 非核心线程数已达最大值 → 执行拒绝策略
```

### 9.4 拒绝策略

```java
// 1. AbortPolicy（默认）：抛异常
new ThreadPoolExecutor.AbortPolicy();

// 2. CallerRunsPolicy：调用者线程执行
new ThreadPoolExecutor.CallerRunsPolicy();

// 3. DiscardPolicy：直接丢弃
new ThreadPoolExecutor.DiscardPolicy();

// 4. DiscardOldestPolicy：丢弃最老任务
new ThreadPoolExecutor.DiscardOldestPolicy();
```

### 9.5 创建线程池（推荐 ⭐）

```java
// ❌ 不推荐：Executors 创建的线程池有问题
ExecutorService executor1 = Executors.newFixedThreadPool(10);  // OOM 风险
ExecutorService executor2 = Executors.newCachedThreadPool();   // 线程数无限制
ExecutorService executor3 = Executors.newSingleThreadExecutor(); // OOM 风险

// ✅ 推荐：手动创建 ThreadPoolExecutor
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    8,                              // 核心线程数
    16,                             // 最大线程数
    60L,                            // 空闲线程存活 60 秒
    TimeUnit.SECONDS,               // 时间单位
    new ArrayBlockingQueue<>(100),  // 工作队列（有界）
    new ThreadFactory() {           // 线程工厂（自定义线程名）
        private final AtomicInteger count = new AtomicInteger(1);
        @Override
        public Thread newThread(Runnable r) {
            return new Thread(r, "my-thread-" + count.getAndIncrement());
        }
    },
    new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
);

// 使用
executor.submit(() -> {
    System.out.println("任务执行：" + Thread.currentThread().getName());
});

// 关闭
executor.shutdown();  // 平滑关闭
// executor.shutdownNow();  // 立即关闭
```

### 9.6 线程池监控

```java
ThreadPoolExecutor executor = (ThreadPoolExecutor) Executors.newFixedThreadPool(10);

// 监控指标
int poolSize = executor.getPoolSize();              // 当前线程数
int activeCount = executor.getActiveCount();        // 活跃线程数
long completedTaskCount = executor.getCompletedTaskCount();  // 完成任务数
long taskCount = executor.getTaskCount();           // 总任务数
BlockingQueue<Runnable> queue = executor.getQueue(); // 工作队列
int queueSize = queue.size();                       // 队列大小
```

### 9.7 线程池参数配置建议

| 任务类型 | 核心线程数 | 最大线程数 | 队列 |
|----------|------------|------------|------|
| **CPU 密集型** | CPU 核数 | CPU 核数 + 1 | 小队列 |
| **IO 密集型** | CPU 核数 * 2 | CPU 核数 * 2 | 大队列 |
| **混合型** | CPU 核数 * (1 + 等待时间/计算时间) | 根据实际情况调整 | 中等队列 |

---

## 10. 并发工具类

### 10.1 CountDownLatch（倒计时门闩）

```java
// 场景：等待多个任务完成后继续执行
CountDownLatch latch = new CountDownLatch(3);

// 启动 3 个子任务
for (int i = 0; i < 3; i++) {
    new Thread(() -> {
        try {
            System.out.println("任务执行：" + Thread.currentThread().getName());
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            latch.countDown();  // 计数减 1
        }
    }).start();
}

// 等待 3 个任务完成
latch.await();  // 阻塞直到计数为 0
System.out.println("所有任务完成，继续执行");
```

### 10.2 CyclicBarrier（循环栅栏）

```java
// 场景：多个线程互相等待，到达屏障点后一起执行
CyclicBarrier barrier = new CyclicBarrier(3, () -> {
    System.out.println("所有线程到达屏障点，执行屏障动作");
});

for (int i = 0; i < 3; i++) {
    new Thread(() -> {
        try {
            System.out.println("线程到达屏障：" + Thread.currentThread().getName());
            barrier.await();  // 等待其他线程
            System.out.println("继续执行：" + Thread.currentThread().getName());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }).start();
}

// 可重复使用（与 CountDownLatch 的区别）
barrier.reset();  // 重置
```

### 10.3 Semaphore（信号量）

```java
// 场景：控制同时访问的线程数（限流）
Semaphore semaphore = new Semaphore(3);  // 允许 3 个并发

for (int i = 0; i < 10; i++) {
    new Thread(() -> {
        try {
            semaphore.acquire();  // 获取许可
            System.out.println("获取许可，执行任务：" + Thread.currentThread().getName());
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            semaphore.release();  // 释放许可
        }
    }).start();
}
```

### 10.4 Phaser（阶段器，JDK 7+）

```java
// 场景：多阶段任务，每个阶段等待所有线程完成
Phaser phaser = new Phaser(3);  // 初始 3 个线程

for (int i = 0; i < 3; i++) {
    new Thread(() -> {
        // 阶段 1
        System.out.println("阶段 1 完成：" + Thread.currentThread().getName());
        phaser.arriveAndAwaitAdvance();  // 等待其他线程
        
        // 阶段 2
        System.out.println("阶段 2 完成：" + Thread.currentThread().getName());
        phaser.arriveAndAwaitAdvance();
        
        // 阶段 3
        System.out.println("阶段 3 完成：" + Thread.currentThread().getName());
        phaser.arriveAndDeregister();  // 注销
    }).start();
}
```

### 10.5 Exchanger（交换器）

```java
// 场景：两个线程交换数据
Exchanger<String> exchanger = new Exchanger<>();

new Thread(() -> {
    try {
        String data = "A";
        System.out.println("线程 A 发送：" + data);
        String received = exchanger.exchange(data);  // 交换
        System.out.println("线程 A 接收：" + received);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}).start();

new Thread(() -> {
    try {
        String data = "B";
        System.out.println("线程 B 发送：" + data);
        String received = exchanger.exchange(data);  // 交换
        System.out.println("线程 B 接收：" + received);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}).start();
```

---

## 11. 并发容器

### 11.1 ConcurrentHashMap

```java
// 已在集合框架中详细讲解
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
```

### 11.2 CopyOnWriteArrayList

```java
// 读多写少场景
List<String> list = new CopyOnWriteArrayList<>();

// 写操作：复制新数组
list.add("A");

// 读操作：无锁，读取旧数组
for (String s : list) {
    System.out.println(s);
}
```

### 11.3 BlockingQueue（阻塞队列）

```java
// 场景：生产者 - 消费者模式
BlockingQueue<String> queue = new LinkedBlockingQueue<>(10);

// 生产者
new Thread(() -> {
    try {
        queue.put("元素");  // 队列满时阻塞
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}).start();

// 消费者
new Thread(() -> {
    try {
        String element = queue.take();  // 队列空时阻塞
        System.out.println("消费：" + element);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}).start();
```

### 11.4 ConcurrentLinkedQueue（无界非阻塞队列）

```java
// 基于 CAS 的无界队列，高性能
Queue<String> queue = new ConcurrentLinkedQueue<>();

queue.offer("A");  // 添加
String element = queue.poll();  // 获取并删除
```

---

## 12. ThreadLocal

### 12.1 ThreadLocal 使用

```java
// 线程本地变量，每个线程有独立副本
private static final ThreadLocal<SimpleDateFormat> dateFormat = 
    ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));

public String formatDate(Date date) {
    return dateFormat.get().format(date);
}

// 使用完建议清理（防止内存泄漏）
dateFormat.remove();
```

### 12.2 ThreadLocal 原理

```java
// 每个 Thread 对象有一个 ThreadLocalMap
class Thread {
    ThreadLocal.ThreadLocalMap threadLocals;
}

// ThreadLocalMap 存储键值对
// key：ThreadLocal 对象（弱引用）
// value：线程本地变量值
```

### 12.3 内存泄漏问题

```java
// ThreadLocalMap 的 key 是弱引用，value 是强引用
// 如果 ThreadLocal 对象被回收，key 为 null，但 value 还在

// 解决：使用完调用 remove()
threadLocal.remove();
```

### 12.4 InheritableThreadLocal（可继承）

```java
// 子线程可以继承父线程的 ThreadLocal 值
ThreadLocal<String> threadLocal = new InheritableThreadLocal<>();
threadLocal.set("父线程的值");

new Thread(() -> {
    System.out.println("子线程获取：" + threadLocal.get());  // 可以获取
}).start();
```

---

## 13. 最佳实践

### 13.1 线程安全策略

```java
// 1. 不可变对象（最安全）
final String str = "Hello";  // String 是不可变类

// 2. 线程封闭（不共享）
ThreadLocal<User> userLocal = new ThreadLocal<>();

// 3. 同步容器
List<String> list = Collections.synchronizedList(new ArrayList<>());

// 4. 并发容器
List<String> list = new CopyOnWriteArrayList<>();
Map<String, Integer> map = new ConcurrentHashMap<>();

// 5. 锁
Lock lock = new ReentrantLock();
lock.lock();
try {
    // 临界区
} finally {
    lock.unlock();
}
```

### 13.2 避免死锁

```java
// 死锁四个必要条件：
// 1. 互斥条件
// 2. 请求与保持
// 3. 不剥夺
// 4. 循环等待

// 避免方法：
// 1. 按顺序获取锁
// 2. 使用 tryLock（限时等待）
// 3. 使用并发工具类代替锁

// ✅ 正确示例：按顺序获取锁
public void method1() {
    synchronized (lockA) {
        synchronized (lockB) {
            // 代码
        }
    }
}

public void method2() {
    synchronized (lockA) {  // 与方法 1 顺序一致
        synchronized (lockB) {
            // 代码
        }
    }
}
```

### 13.3 性能优化

```java
// 1. 减少锁粒度
synchronized (this) {  // ❌ 锁整个对象
    // 只需要同步部分代码
}

synchronized (lock) {  // ✅ 锁特定对象
    // 同步代码
}

// 2. 减少锁持有时间
synchronized (lock) {
    // 只放需要同步的代码
    // 耗时操作放在外面
}

// 3. 使用读写锁
ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
// 读多写少场景性能更好

// 4. 使用 LongAdder 代替 AtomicInteger
LongAdder adder = new LongAdder();  // 高并发场景性能更好
```

### 13.4 线程池使用规范

```java
// ✅ 推荐做法
// 1. 手动创建 ThreadPoolExecutor
// 2. 使用有界队列
// 3. 自定义线程工厂（设置线程名）
// 4. 设置合理的拒绝策略
// 5. 监控线程池状态
// 6. 优雅关闭线程池

// ❌ 避免做法
// 1. 使用 Executors 创建线程池
// 2. 使用无界队列（可能 OOM）
// 3. 不处理拒绝策略
// 4. 不关闭线程池
```

---

## 💡 常见面试题

1. **线程的生命周期有哪些状态？**
2. **synchronized 和 Lock 的区别？**
3. **volatile 关键字的作用？**
4. **ThreadLocal 原理和内存泄漏问题？**
5. **线程池的核心参数和工作流程？**
6. **ConcurrentHashMap 如何保证线程安全？**
7. **AQS 原理？**
8. **CountDownLatch 和 CyclicBarrier 的区别？**
9. **如何避免死锁？**
10. **CAS 原理和 ABA 问题？**

---

## 📚 参考资料

- 《Java 并发编程实战》
- 《深入理解 Java 虚拟机》
- 《Java 并发编程的艺术》
- [OpenJDK 源码](https://github.com/openjdk/jdk)
- [Oracle Java 并发教程](https://docs.oracle.com/javase/tutorial/essential/concurrency/)

---

> 💡 **学习建议**：多线程是 Java 最难的部分，需要反复学习 + 实践！重点掌握：线程池、ConcurrentHashMap、AQS、volatile！
