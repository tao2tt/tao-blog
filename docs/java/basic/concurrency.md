# 多线程与并发

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-04-05  
> 难度：⭐⭐⭐⭐⭐  
> 前置知识：[Java 核心语法](/java/basic/core)、[面向对象编程](/java/basic/oop)

---

## 📚 目录

[[toc]]

---

## 1. 多线程基础

### 1.1 什么是线程

**线程（Thread）** 是程序执行的最小单元，一个进程可以包含多个线程。

**进程 vs 线程：**

| 对比项 | 进程 | 线程 |
|--------|------|------|
| **定义** | 程序的一次执行 | 进程中的执行单元 |
| **资源** | 独立内存空间 | 共享进程资源 |
| **开销** | 创建/切换开销大 | 创建/切换开销小 |
| **通信** | 需要 IPC 机制 | 直接共享内存 |
| **关系** | 一个进程多个线程 | 一个线程属于一个进程 |

**💡 比喻：**
- **进程** = 工厂（有独立厂房、设备）
- **线程** = 工人（共享工厂资源，各自干活）

### 1.2 为什么要用多线程

| 优势 | 说明 | 场景 |
|------|------|------|
| **提高性能** | 多核 CPU 并行执行 | CPU 密集型任务 |
| **提高响应** | 异步处理不阻塞 | UI 程序、Web 服务 |
| **资源利用** | I/O 等待时执行其他任务 | I/O 密集型任务 |
| **简化建模** | 每个任务一个线程 | 复杂业务流程 |

### 1.3 线程的创建方式

#### 1.3.1 方式一：继承 Thread 类

```java
/**
 * 继承 Thread 类创建线程
 */
class MyThread extends Thread {
    
    @Override
    public void run() {
        // 线程执行的代码
        for (int i = 0; i < 5; i++) {
            System.out.println(Thread.currentThread().getName() + " - " + i);
        }
    }
}

// 使用
MyThread thread = new MyThread();
thread.start();  // ✅ 启动线程（调用 run 方法）
// thread.run(); // ❌ 错误：这是普通方法调用，不是启动线程
```

**💡 注意：** 必须调用 `start()` 而不是 `run()`，否则只是普通方法调用。

#### 1.3.2 方式二：实现 Runnable 接口

```java
/**
 * 实现 Runnable 接口
 */
class MyRunnable implements Runnable {
    
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(Thread.currentThread().getName() + " - " + i);
        }
    }
}

// 使用
MyRunnable runnable = new MyRunnable();
Thread thread = new Thread(runnable);
thread.start();

// Lambda 简化（Java 8+）
Thread thread2 = new Thread(() -> {
    System.out.println("Lambda 线程");
});
thread2.start();
```

#### 1.3.3 方式三：实现 Callable 接口

**Callable 可以有返回值和抛出异常**

```java
import java.util.concurrent.*;

/**
 * 实现 Callable 接口（有返回值）
 */
class MyCallable implements Callable<Integer> {
    
    @Override
    public Integer call() throws Exception {
        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            sum += i;
        }
        return sum;  // 返回计算结果
    }
}

// 使用
public class CallableDemo {
    public static void main(String[] args) throws Exception {
        // 创建线程池
        ExecutorService executor = Executors.newSingleThreadExecutor();
        
        // 提交任务
        Future<Integer> future = executor.submit(new MyCallable());
        
        // 获取结果（阻塞等待）
        Integer result = future.get();
        System.out.println("结果：" + result);  // 5050
        
        // 关闭线程池
        executor.shutdown();
    }
}
```

#### 1.3.4 三种方式对比

| 方式 | 优点 | 缺点 | 推荐 |
|------|------|------|------|
| **继承 Thread** | 简单直接 | 不能继承其他类 | ❌ 不推荐 |
| **实现 Runnable** | 可继承其他类 | 无返回值 | ✅ 推荐 |
| **实现 Callable** | 有返回值、可抛异常 | 需要线程池 | ✅ 推荐 |

---

## 2. 线程状态

### 2.1 线程的 6 种状态

```java
public enum State {
    NEW,           // 新建
    RUNNABLE,      // 可运行
    BLOCKED,       // 阻塞
    WAITING,       // 无限等待
    TIMED_WAITING, // 限时等待
    TERMINATED     // 终止
}
```

### 2.2 状态转换图

```
NEW → start() → RUNNABLE
                    ↓
              获得 CPU 时间片
                    ↓
                 RUNNING
                    ↓
        ┌───────────┼───────────┬────────────┐
        ↓           ↓           ↓            ↓
    时间片到    sleep()     wait()      执行完成
        ↓       timeout     notify()       ↓
    RUNNABLE  TIMED_WAITING WAITING    TERMINATED
                  ↓           ↓
            timeout 到    notify()
                  ↓           ↓
              RUNNABLE    RUNNABLE
```

### 2.3 状态详解

```java
public class ThreadStateDemo {
    
    public static void main(String[] args) throws Exception {
        Thread thread = new Thread(() -> {
            // RUNNABLE
            System.out.println("运行中");
            
            // TIMED_WAITING
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            
            // BLOCKED（等待锁）
            synchronized (ThreadStateDemo.class) {
                System.out.println("获得锁");
            }
        });
        
        // NEW
        System.out.println("新建状态：" + thread.getState());
        
        thread.start();
        
        // RUNNABLE
        Thread.sleep(100);
        System.out.println("启动后：" + thread.getState());
        
        thread.join();
        
        // TERMINATED
        System.out.println("结束后：" + thread.getState());
    }
}
```

---

## 3. 线程同步

### 3.1 线程安全问题

#### 3.1.1 问题示例

```java
/**
 * 线程不安全的计数器
 */
class UnsafeCounter {
    private int count = 0;
    
    public void increment() {
        count++;  // ❌ 不是原子操作
    }
    
    public int getCount() {
        return count;
    }
}

// 使用
public class UnsafeDemo {
    public static void main(String[] args) throws Exception {
        UnsafeCounter counter = new UnsafeCounter();
        
        // 创建 10 个线程，每个线程加 10000 次
        List<Thread> threads = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            threads.add(new Thread(() -> {
                for (int j = 0; j < 10000; j++) {
                    counter.increment();
                }
            }));
        }
        
        // 启动所有线程
        threads.forEach(Thread::start);
        
        // 等待所有线程完成
        for (Thread thread : threads) {
            thread.join();
        }
        
        // 预期结果：100000，实际可能小于 100000
        System.out.println("结果：" + counter.getCount());
    }
}
```

**💡 问题分析：** `count++` 不是原子操作，包含三步：
1. 读取 count 值
2. 加 1
3. 写回 count

多个线程同时执行时，可能覆盖彼此的修改。

### 3.2 synchronized 关键字

#### 3.2.1 同步方法

```java
/**
 * 线程安全的计数器（同步方法）
 */
class SafeCounter {
    private int count = 0;
    
    // 同步方法（锁是当前对象 this）
    public synchronized void increment() {
        count++;
    }
    
    public synchronized int getCount() {
        return count;
    }
}
```

#### 3.2.2 同步代码块

```java
class SafeCounter2 {
    private int count = 0;
    private final Object lock = new Object();
    
    public void increment() {
        // 同步代码块（锁是 lock 对象）
        synchronized (lock) {
            count++;
        }
    }
    
    public int getCount() {
        synchronized (lock) {
            return count;
        }
    }
}
```

#### 3.2.3 静态同步方法

```java
class StaticSafeCounter {
    private static int count = 0;
    
    // 静态同步方法（锁是 Class 对象）
    public static synchronized void increment() {
        count++;
    }
}
```

#### 3.2.4 锁的对象

| 同步方式 | 锁对象 | 作用范围 |
|---------|--------|---------|
| 实例同步方法 | `this` | 当前实例 |
| 静态同步方法 | `Class` 对象 | 整个类 |
| 同步代码块 | 指定对象 | 代码块范围 |

### 3.3 volatile 关键字

#### 3.3.1 可见性问题

```java
/**
 * volatile 保证可见性
 */
class VisibilityDemo {
    // ❌ 没有 volatile，修改对其他线程不可见
    // private boolean flag = false;
    
    // ✅ 有 volatile，修改立即可见
    private volatile boolean flag = false;
    
    public void changeFlag() {
        flag = true;
        System.out.println("flag 已修改");
    }
    
    public void checkFlag() {
        while (!flag) {
            // 等待 flag 变为 true
        }
        System.out.println("flag 为 true");
    }
}
```

#### 3.3.2 volatile vs synchronized

| 特性 | volatile | synchronized |
|------|---------|-------------|
| **原子性** | ❌ 不保证 | ✅ 保证 |
| **可见性** | ✅ 保证 | ✅ 保证 |
| **有序性** | ✅ 保证 | ✅ 保证 |
| **阻塞** | ❌ 不阻塞 | ✅ 可能阻塞 |
| **性能** | 高 | 较低 |
| **使用场景** | 状态标记 | 复合操作 |

```java
// ✅ volatile 适用场景：状态标记
private volatile boolean running = true;

public void stop() {
    running = false;
}

public void run() {
    while (running) {
        // 执行任务
    }
}

// ❌ volatile 不适用：复合操作
// private volatile int count = 0;
// count++;  // ❌ 不是原子操作
```

---

## 4. 线程通信

### 4.1 wait/notify

```java
/**
 * 生产者 - 消费者模型
 */
class Buffer {
    private int data;
    private boolean empty = true;
    
    public synchronized void produce(int value) throws InterruptedException {
        // 如果缓冲区不为空，等待
        while (!empty) {
            wait();  // 释放锁，进入等待
        }
        
        // 生产数据
        data = value;
        empty = false;
        System.out.println("生产：" + value);
        
        // 通知消费者
        notify();
    }
    
    public synchronized int consume() throws InterruptedException {
        // 如果缓冲区为空，等待
        while (empty) {
            wait();
        }
        
        // 消费数据
        int value = data;
        empty = true;
        System.out.println("消费：" + value);
        
        // 通知生产者
        notify();
        
        return value;
    }
}
```

### 4.2 wait vs sleep

| 对比项 | wait | sleep |
|--------|------|-------|
| **所属类** | Object | Thread |
| **是否释放锁** | ✅ 释放 | ❌ 不释放 |
| **唤醒方式** | notify/notifyAll | 时间到 |
| **使用位置** | 同步代码块/方法 | 任意位置 |

---

## 5. JUC 并发包

### 5.1 原子类

```java
import java.util.concurrent.atomic.*;

// AtomicInteger：原子整数
AtomicInteger atomicInt = new AtomicInteger(0);
atomicInt.incrementAndGet();  // 原子自增
atomicInt.getAndAdd(5);       // 原子加 5

// AtomicReference：原子引用
AtomicReference<String> ref = new AtomicReference<>("初始值");
ref.compareAndSet("初始值", "新值");  // CAS 操作

// AtomicLong、AtomicBoolean 等
```

### 5.2 ReentrantLock

```java
import java.util.concurrent.locks.*;

class LockCounter {
    private int count = 0;
    private final ReentrantLock lock = new ReentrantLock();
    
    public void increment() {
        lock.lock();  // 加锁
        try {
            count++;
        } finally {
            lock.unlock();  // 必须 finally 中释放
        }
    }
}

// 特性：
// ✅ 可中断：lock.lockInterruptibly()
// ✅ 超时：lock.tryLock(1, TimeUnit.SECONDS)
// ✅ 公平锁：new ReentrantLock(true)
// ✅ 条件变量：lock.newCondition()
```

### 5.3 并发容器

```java
// ConcurrentHashMap：线程安全的 HashMap
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.put("key", 1);
map.get("key");

// CopyOnWriteArrayList：写时复制
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
list.add("A");
list.add("B");

// BlockingQueue：阻塞队列
BlockingQueue<Integer> queue = new LinkedBlockingQueue<>(10);
queue.put(1);  // 队列满时阻塞
queue.take();  // 队列空时阻塞
```

### 5.4 线程池

```java
import java.util.concurrent.*;

// 创建线程池
ExecutorService executor = new ThreadPoolExecutor(
    5,              // 核心线程数
    10,             // 最大线程数
    60L,            // 空闲线程存活时间
    TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(100),  // 工作队列
    new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
);

// 提交任务
executor.submit(() -> {
    System.out.println("任务执行");
});

// 关闭线程池
executor.shutdown();
```

---

## 6. 实战案例

### 6.1 单例模式（线程安全）

```java
/**
 * 双重检查锁定单例
 */
class Singleton {
    private static volatile Singleton instance;
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

### 6.2 生产者 - 消费者（BlockingQueue）

```java
class ProducerConsumer {
    private final BlockingQueue<Integer> queue = new LinkedBlockingQueue<>(10);
    
    class Producer implements Runnable {
        @Override
        public void run() {
            try {
                for (int i = 0; i < 100; i++) {
                    queue.put(i);
                    System.out.println("生产：" + i);
                    Thread.sleep(100);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
    
    class Consumer implements Runnable {
        @Override
        public void run() {
            try {
                while (true) {
                    Integer value = queue.take();
                    System.out.println("消费：" + value);
                    Thread.sleep(200);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

---

## 📝 练习题

### 基础题

1. **线程创建**：分别使用 Thread、Runnable、Callable 创建三个线程，打印 1-100

2. **线程安全**：实现一个线程安全的银行账户类，支持存款、取款、查询余额

3. **生产者消费者**：使用 wait/notify 实现生产者消费者模型

### 进阶题

4. **读写锁**：使用 ReentrantReadWriteLock 实现一个线程安全的缓存

5. **线程池**：使用线程池优化批量文件处理任务

6. **综合练习**：实现一个多线程下载器，支持断点续传、进度显示

---

## 🔗 参考资料

### 推荐书籍
- 📚 《Java 并发编程实战》- Brian Goetz
- 📚 《Java 并发编程的艺术》- 方腾飞

### 在线资源
- 🔗 [Oracle 并发教程](https://docs.oracle.com/javase/tutorial/essential/concurrency/)
- 🔗 [菜鸟教程 Java 多线程](https://www.runoob.com/java/java-multithreading.html)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 线程创建 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| synchronized | ⭐⭐⭐⭐⭐ | 熟练运用 |
| volatile | ⭐⭐⭐⭐ | 理解掌握 |
| wait/notify | ⭐⭐⭐⭐ | 理解掌握 |
| JUC 并发包 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 线程池 | ⭐⭐⭐⭐⭐ | 熟练运用 |

---

**上一章：** [Stream API](/java/basic/stream)  
**下一章：** [JVM 内存模型](/java/basic/jvm)

**最后更新**：2026-03-12
