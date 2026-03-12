# JUC 并发包

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-04-18  
> 难度：⭐⭐⭐⭐⭐  
> 前置知识：[多线程与并发](/java/basic/concurrency)、[线程池实战](/java/basic/thread-pool)

---

## 📚 目录

[[toc]]

---

## 1. JUC 简介

### 1.1 什么是 JUC

**JUC（java.util.concurrent）** 是 Java 5 引入的并发工具包，位于 `java.util.concurrent` 包及其子包中。

**核心模块：**

```
JUC 并发包
├── 原子类（atomic）
├── 锁（locks）
├── 并发容器
├── 同步工具类
├── 线程池（executors）
└── Fork/Join 框架
```

### 1.2 为什么需要 JUC

**synchronized 的局限性：**

| 问题 | 说明 |
|------|------|
| **效率低** | 重量级锁，开销大 |
| **不灵活** | 无法中断、无法超时 |
| **功能单一** | 只能保证互斥 |
| **被动等待** | 无法主动通知 |

**JUC 的优势：**

| 优势 | 说明 |
|------|------|
| **高性能** | CAS 乐观锁，无锁化 |
| **灵活** | 可中断、可超时、公平锁 |
| **功能丰富** | 多种同步工具 |
| **主动控制** | Condition 条件变量 |

---

## 2. 原子类（Atomic）

### 2.1 原子操作简介

**原子性（Atomicity）** 指操作不可分割，要么全部成功，要么全部失败。

**问题示例：**

```java
// ❌ i++ 不是原子操作
private int count = 0;

public void increment() {
    count++;  // 包含三步：读取、加 1、写回
}

// 多线程环境下可能丢失更新
```

**解决方案：**

| 方案 | 说明 | 性能 |
|------|------|------|
| **synchronized** | 同步方法/代码块 | 低 |
| **Lock** | 显式锁 | 中 |
| **Atomic** | CAS 乐观锁 | 高 ✅ |

### 2.2 AtomicInteger

**原子整数，基于 CAS 实现**

```java
import java.util.concurrent.atomic.*;

AtomicInteger atomicInt = new AtomicInteger(0);

// 原子自增
atomicInt.incrementAndGet();      // ++i，返回新值
atomicInt.getAndIncrement();      // i++，返回旧值

// 原子加减
atomicInt.addAndGet(5);           // i += 5，返回新值
atomicInt.getAndAdd(5);           // i += 5，返回旧值

// CAS 操作
boolean success = atomicInt.compareAndSet(0, 1);  // 如果值为 0，设置为 1
System.out.println(success);  // true

// 获取/设置
int value = atomicInt.get();
atomicInt.set(10);

// 获取并更新
atomicInt.updateAndGet(i -> i * 2);  // i = i * 2，返回新值
atomicInt.getAndUpdate(i -> i * 2);  // i = i * 2，返回旧值
```

### 2.3 AtomicLong、AtomicBoolean

```java
// AtomicLong：原子长整型
AtomicLong atomicLong = new AtomicLong(0L);
atomicLong.incrementAndGet();

// AtomicBoolean：原子布尔型
AtomicBoolean atomicBool = new AtomicBoolean(false);
boolean oldValue = atomicBool.getAndSet(true);  // 设置为 true，返回旧值
```

### 2.4 AtomicReference

**原子引用类型**

```java
AtomicReference<String> ref = new AtomicReference<>("初始值");

// 获取/设置
String value = ref.get();
ref.set("新值");

// CAS 操作
boolean success = ref.compareAndSet("初始值", "新值");

// 获取并更新
ref.updateAndGet(s -> s.toUpperCase());
```

**实战：使用 AtomicReference 实现线程安全的对象更新**

```java
class User {
    private final String name;
    private final int age;
    
    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }
}

public class UserService {
    private final AtomicReference<User> userRef = new AtomicReference<>();
    
    // 更新用户（CAS 保证线程安全）
    public void updateUser(User newUser) {
        userRef.updateAndGet(oldUser -> {
            if (oldUser == null) {
                return newUser;
            }
            // 合并逻辑
            return new User(newUser.getName(), newUser.getAge());
        });
    }
    
    public User getUser() {
        return userRef.get();
    }
}
```

### 2.5 原子数组

```java
// AtomicIntegerArray：原子整数数组
AtomicIntegerArray array = new AtomicIntegerArray(5);
array.set(0, 10);
int value = array.get(0);
array.incrementAndGet(0);  // 原子自增

// AtomicReferenceArray：原子引用数组
AtomicReferenceArray<String> refArray = new AtomicReferenceArray<>(5);
refArray.set(0, "hello");
```

### 2.6 原子字段更新器

**更新对象中的某个字段**

```java
class Person {
    volatile String name;
    volatile int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
}

// 原子字段更新器
AtomicReferenceFieldUpdater<Person, String> nameUpdater = 
    AtomicReferenceFieldUpdater.newUpdater(Person.class, String.class, "name");

AtomicIntegerFieldUpdater<Person> ageUpdater = 
    AtomicIntegerFieldUpdater.newUpdater(Person.class, "age");

// 使用
Person person = new Person("张三", 20);
nameUpdater.set(person, "李四");
ageUpdater.incrementAndGet(person);  // 年龄 +1
```

---

## 3. 锁（Locks）

### 3.1 ReentrantLock

**可重入锁，synchronized 的增强版**

```java
import java.util.concurrent.locks.*;

class Counter {
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
    
    public int getCount() {
        lock.lock();
        try {
            return count;
        } finally {
            lock.unlock();
        }
    }
}
```

**ReentrantLock vs synchronized：**

| 对比项 | ReentrantLock | synchronized |
|--------|--------------|-------------|
| **实现层面** | API 层（Java） | JVM 层（C++） |
| **锁释放** | 手动 unlock() | 自动释放 |
| **可中断** | ✅ lockInterruptibly() | ❌ 不可中断 |
| **超时** | ✅ tryLock(timeout) | ❌ 不支持 |
| **公平锁** | ✅ 可配置 | ❌ 只能非公平 |
| **条件变量** | ✅ 多个 Condition | ❌ 单一 wait/notify |
| **性能** | JDK 6+ 后相当 | JDK 6+ 优化后相当 |

### 3.2 ReentrantReadWriteLock

**读写锁：读读共享、读写互斥、写写互斥**

```java
class Cache {
    private final Map<String, String> map = new HashMap<>();
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
    private final Lock readLock = lock.readLock();
    private final Lock writeLock = lock.writeLock();
    
    // 读操作（共享）
    public String get(String key) {
        readLock.lock();
        try {
            return map.get(key);
        } finally {
            readLock.unlock();
        }
    }
    
    // 写操作（互斥）
    public void put(String key, String value) {
        writeLock.lock();
        try {
            map.put(key, value);
        } finally {
            writeLock.unlock();
        }
    }
}
```

**适用场景：** 读多写少

| 操作 | 是否互斥 |
|------|---------|
| 读 - 读 | ❌ 不互斥（共享） |
| 读 - 写 | ✅ 互斥 |
| 写 - 写 | ✅ 互斥 |

### 3.3 StampedLock

**邮戳锁，JDK 8 引入，性能优于 ReentrantReadWriteLock**

```java
class Point {
    private double x, y;
    private final StampedLock lock = new StampedLock();
    
    // 写锁（独占）
    public void move(double deltaX, double deltaY) {
        long stamp = lock.writeLock();
        try {
            x += deltaX;
            y += deltaY;
        } finally {
            lock.unlockWrite(stamp);
        }
    }
    
    // 读锁（共享）
    public double distanceFromOrigin() {
        long stamp = lock.readLock();
        try {
            return Math.sqrt(x * x + y * y);
        } finally {
            lock.unlockRead(stamp);
        }
    }
    
    // 乐观读（无锁，失败后升级为读锁）
    public double distanceFromOriginOptimistic() {
        long stamp = lock.tryOptimisticRead();  // 获取乐观读邮戳
        double currentX = x, currentY = y;
        
        // 验证邮戳是否有效（期间无写操作）
        if (!lock.validate(stamp)) {
            // 升级为读锁
            stamp = lock.readLock();
            try {
                return Math.sqrt(x * x + y * y);
            } finally {
                lock.unlockRead(stamp);
            }
        }
        return Math.sqrt(currentX * currentX + currentY * currentY);
    }
}
```

**三种模式：**

| 模式 | 方法 | 特点 |
|------|------|------|
| **写锁** | writeLock() | 独占，互斥 |
| **读锁** | readLock() | 共享，读读不互斥 |
| **乐观读** | tryOptimisticRead() | 无锁，可能失败 |

### 3.4 Condition 条件变量

**配合 ReentrantLock 使用，替代 wait/notify**

```java
class Buffer {
    private final Queue<Integer> queue = new LinkedList<>();
    private final int capacity = 10;
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();   // 不满条件
    private final Condition notEmpty = lock.newCondition();  // 不空条件
    
    public void put(int value) throws InterruptedException {
        lock.lock();
        try {
            // 如果队列满，等待
            while (queue.size() == capacity) {
                notFull.await();  // 释放锁，进入等待
            }
            
            queue.offer(value);
            notEmpty.signal();  // 通知消费者
        } finally {
            lock.unlock();
        }
    }
    
    public int take() throws InterruptedException {
        lock.lock();
        try {
            // 如果队列空，等待
            while (queue.isEmpty()) {
                notEmpty.await();
            }
            
            int value = queue.poll();
            notFull.signal();  // 通知生产者
            return value;
        } finally {
            lock.unlock();
        }
    }
}
```

**Condition vs wait/notify：**

| 对比项 | Condition | wait/notify |
|--------|-----------|-------------|
| **配合锁** | ReentrantLock | synchronized |
| **多条件** | ✅ 多个 Condition | ❌ 单一 |
| **等待队列** | 每个 Condition 独立 | 共享 |
| **灵活性** | 高 | 低 |

---

## 4. 并发容器

### 4.1 ConcurrentHashMap

**线程安全的 HashMap**

```java
import java.util.concurrent.*;

ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();

// 基本操作
map.put("key", 1);
map.get("key");
map.remove("key");

// 原子操作
map.putIfAbsent("key", 1);  // 不存在才添加
map.replace("key", 1, 2);   // 如果值为 1，替换为 2
map.compute("key", (k, v) -> v == null ? 1 : v + 1);  // 计算新值
map.merge("key", 1, Integer::sum);  // 合并

// 批量操作
map.forEach(1, (k, v) -> System.out.println(k + "=" + v));  // 并行遍历
map.search(1, (k, v) -> v > 5 ? k : null);  // 并行搜索
map.reduce(1, (k, v) -> v, Integer::sum);  // 并行归约
```

**JDK 7 vs JDK 8：**

| 版本 | 实现 | 锁粒度 |
|------|------|--------|
| **JDK 7** | Segment 分段锁 | 段级别 |
| **JDK 8** | Node + CAS + synchronized | 桶级别（更细） |

### 4.2 CopyOnWriteArrayList

**写时复制的线程安全 List**

```java
import java.util.concurrent.*;

CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();

// 添加（复制新数组）
list.add("A");
list.add("B");

// 遍历（无锁，安全）
for (String item : list) {
    System.out.println(item);
}

// 特点：
// ✅ 读操作无锁，性能高
// ✅ 遍历时不会抛 ConcurrentModificationException
// ❌ 写操作需要复制数组，开销大
// 适用：读多写少场景
```

### 4.3 BlockingQueue

**阻塞队列，支持阻塞的插入和移除**

```java
// ArrayBlockingQueue：有界阻塞队列
BlockingQueue<Integer> arrayQueue = new ArrayBlockingQueue<>(10);

// LinkedBlockingQueue：无界阻塞队列（可设置容量）
BlockingQueue<Integer> linkedQueue = new LinkedBlockingQueue<>(10);

// PriorityBlockingQueue：优先级阻塞队列
BlockingQueue<Integer> priorityQueue = new PriorityBlockingQueue<>();

// SynchronousQueue：不存储元素的阻塞队列
BlockingQueue<Integer> syncQueue = new SynchronousQueue<>();

// 阻塞方法
queue.put(1);    // 队列满时阻塞
int value = queue.take();  // 队列空时阻塞

// 非阻塞方法
boolean success = queue.offer(1);  // 立即返回
int value = queue.poll();  // 立即返回

// 超时方法
boolean success = queue.offer(1, 1, TimeUnit.SECONDS);  // 超时 1 秒
int value = queue.poll(1, TimeUnit.SECONDS);  // 超时 1 秒
```

### 4.4 ConcurrentLinkedQueue

**无界非阻塞队列（基于 CAS）**

```java
ConcurrentLinkedQueue<String> queue = new ConcurrentLinkedQueue<>();

queue.offer("A");  // 添加
queue.poll();      // 获取并移除
queue.peek();      // 获取不移除

// 特点：
// ✅ 无锁，高性能
// ❌ 无界，可能 OOM
// 适用：高并发、任务量可控场景
```

---

## 5. 同步工具类

### 5.1 CountDownLatch

**倒计时门闩，等待 N 个任务完成**

```java
import java.util.concurrent.*;

public class CountDownLatchDemo {
    
    public static void main(String[] args) throws Exception {
        CountDownLatch latch = new CountDownLatch(3);  // 等待 3 个任务
        
        for (int i = 0; i < 3; i++) {
            new Thread(() -> {
                try {
                    // 执行任务
                    System.out.println("任务执行：" + Thread.currentThread().getName());
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    latch.countDown();  // 任务完成，计数器 -1
                }
            }).start();
        }
        
        latch.await();  // 等待计数器归零
        System.out.println("所有任务完成");
    }
}
```

**适用场景：**
- ✅ 等待多个服务启动完成
- ✅ 等待多个数据源加载完成
- ✅ 并行执行，汇总结果

### 5.2 CyclicBarrier

**循环屏障，等待 N 个线程到达屏障点**

```java
public class CyclicBarrierDemo {
    
    public static void main(String[] args) {
        CyclicBarrier barrier = new CyclicBarrier(3, () -> {
            System.out.println("所有线程到达屏障点，执行屏障动作");
        });
        
        for (int i = 0; i < 3; i++) {
            new Thread(() -> {
                try {
                    System.out.println("线程到达屏障点");
                    barrier.await();  // 等待其他线程
                    System.out.println("继续执行");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }
}
```

**CyclicBarrier vs CountDownLatch：**

| 对比项 | CyclicBarrier | CountDownLatch |
|--------|--------------|----------------|
| **可重用** | ✅ 可重置 | ❌ 不可重用 |
| **作用** | 等待其他线程 | 等待任务完成 |
| **构造** | 线程数 + 屏障动作 | 计数 |

### 5.3 Semaphore

**信号量，控制同时访问的线程数**

```java
public class SemaphoreDemo {
    
    private final Semaphore semaphore = new Semaphore(5);  // 允许 5 个并发
    
    public void access() {
        try {
            semaphore.acquire();  // 获取许可
            System.out.println("访问资源：" + Thread.currentThread().getName());
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            semaphore.release();  // 释放许可
        }
    }
}
```

**适用场景：**
- ✅ 限流（控制并发量）
- ✅ 数据库连接池
- ✅ 资源池管理

### 5.4 Phaser

**阶段屏障，JDK 7 引入，更灵活的屏障**

```java
import java.util.concurrent.*;

public class PhaserDemo {
    
    public static void main(String[] args) {
        Phaser phaser = new Phaser(1);  // 初始注册 1 个线程（主线程）
        
        for (int i = 0; i < 3; i++) {
            phaser.register();  // 注册新线程
            new Thread(() -> {
                // 阶段 1
                System.out.println("阶段 1：" + Thread.currentThread().getName());
                phaser.arriveAndAwaitAdvance();  // 到达并等待
                
                // 阶段 2
                System.out.println("阶段 2：" + Thread.currentThread().getName());
                phaser.arriveAndAwaitAdvance();
                
                // 完成
                phaser.arriveAndDeregister();  // 到达并注销
            }).start();
        }
        
        phaser.arriveAndDeregister();  // 主线程注销
    }
}
```

---

## 6. Fork/Join 框架

### 6.1 简介

**Fork/Join** 是用于并行执行任务的框架，采用**分治算法**。

**核心思想：**
- **Fork（分）**：将大任务拆分为小任务
- **Join（合）**：合并小任务的结果

### 6.2 RecursiveTask（有返回值）

```java
import java.util.concurrent.*;

class FibonacciTask extends RecursiveTask<Integer> {
    
    private final int n;
    
    public FibonacciTask(int n) {
        this.n = n;
    }
    
    @Override
    protected Integer compute() {
        if (n <= 1) {
            return n;
        }
        
        // 拆分任务
        FibonacciTask left = new FibonacciTask(n - 1);
        FibonacciTask right = new FibonacciTask(n - 2);
        
        // 并行执行
        left.fork();
        int rightResult = right.compute();
        int leftResult = left.join();
        
        return leftResult + rightResult;
    }
}

// 使用
ForkJoinPool pool = new ForkJoinPool();
FibonacciTask task = new FibonacciTask(10);
Integer result = pool.invoke(task);
System.out.println("结果：" + result);
```

### 6.3 RecursiveAction（无返回值）

```java
class PrintTask extends RecursiveAction {
    
    private final int[] array;
    private final int start, end;
    
    public PrintTask(int[] array, int start, int end) {
        this.array = array;
        this.start = start;
        this.end = end;
    }
    
    @Override
    protected void compute() {
        if (end - start <= 10) {
            // 小任务，直接执行
            for (int i = start; i < end; i++) {
                System.out.print(array[i] + " ");
            }
        } else {
            // 大任务，拆分
            int mid = (start + end) / 2;
            PrintTask left = new PrintTask(array, start, mid);
            PrintTask right = new PrintTask(array, mid, end);
            
            left.fork();
            right.compute();
            left.join();
        }
    }
}
```

---

## 7. CompletableFuture

**异步编程工具，JDK 8 引入**

### 7.1 创建异步任务

```java
import java.util.concurrent.*;

// 方式 1：supplyAsync（有返回值）
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> {
    return "hello";
});

// 方式 2：runAsync（无返回值）
CompletableFuture<Void> future2 = CompletableFuture.runAsync(() -> {
    System.out.println("执行任务");
});

// 方式 3：自定义线程池
ExecutorService executor = Executors.newFixedThreadPool(10);
CompletableFuture<String> future3 = CompletableFuture.supplyAsync(() -> {
    return "hello";
}, executor);
```

### 7.2 转换结果

```java
// map：转换结果
CompletableFuture<Integer> future = CompletableFuture.supplyAsync(() -> "hello")
    .map(String::length);  // 转换为长度

// thenApply：同上
CompletableFuture<Integer> future2 = CompletableFuture.supplyAsync(() -> "hello")
    .thenApply(String::length);

// thenCompose：链式调用（返回 CompletableFuture）
CompletableFuture<String> future3 = CompletableFuture.supplyAsync(() -> "hello")
    .thenCompose(s -> CompletableFuture.supplyAsync(() -> s + " world"));
```

### 7.3 组合多个 Future

```java
// allOf：等待所有完成
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> "A");
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> "B");

CompletableFuture<Void> all = CompletableFuture.allOf(future1, future2);
all.join();  // 等待所有完成

// anyOf：等待任意一个完成
CompletableFuture<Object> any = CompletableFuture.anyOf(future1, future2);
Object result = any.join();  // 返回最先完成的结果

// thenCombine：合并两个结果
CompletableFuture<String> combined = future1.thenCombine(future2, (s1, s2) -> s1 + s2);
```

### 7.4 异常处理

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    if (true) throw new RuntimeException("错误");
    return "hello";
})
.exceptionally(ex -> "默认值")  // 异常时返回默认值
.handle((result, ex) -> ex != null ? "错误：" + ex.getMessage() : result);  // 统一处理

// 或
future.whenComplete((result, ex) -> {
    if (ex != null) {
        System.err.println("异常：" + ex.getMessage());
    } else {
        System.out.println("结果：" + result);
    }
});
```

### 7.5 实战案例

```java
// 场景：并行调用多个 API，合并结果
public class ApiService {
    
    public CompletableFuture<UserInfo> getUserInfo(String userId) {
        // 并行调用三个服务
        CompletableFuture<String> nameFuture = CompletableFuture.supplyAsync(() -> getName(userId));
        CompletableFuture<Integer> ageFuture = CompletableFuture.supplyAsync(() -> getAge(userId));
        CompletableFuture<String> emailFuture = CompletableFuture.supplyAsync(() -> getEmail(userId));
        
        // 合并结果
        return nameFuture.thenCombine(ageFuture, (name, age) -> new UserInfo(name, age))
            .thenCombine(emailFuture, (info, email) -> {
                info.setEmail(email);
                return info;
            });
    }
    
    private String getName(String userId) { /* ... */ }
    private Integer getAge(String userId) { /* ... */ }
    private String getEmail(String userId) { /* ... */ }
}

class UserInfo {
    String name;
    int age;
    String email;
    
    public UserInfo(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
}
```

---

## 📝 练习题

### 基础题

1. **原子类练习**：使用 AtomicInteger 实现线程安全的计数器

2. **ReentrantLock 练习**：使用 ReentrantLock 实现线程安全的银行账户

3. **CountDownLatch 练习**：使用 CountDownLatch 等待 5 个服务启动完成

### 进阶题

4. **ConcurrentHashMap 练习**：使用 ConcurrentHashMap 实现线程安全的缓存

5. **CompletableFuture 练习**：使用 CompletableFuture 并行调用 3 个 API 并合并结果

6. **综合练习**：实现一个高并发秒杀系统，使用 Semaphore 限流、CountDownLatch 等待、AtomicLong 计数

---

## 🔗 参考资料

### 官方文档
- [Java Concurrency Utilities](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/package-summary.html)

### 推荐书籍
- 📚 《Java 并发编程实战》第 15 章：JUC
- 📚 《Java 并发编程的艺术》第 5 章

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 原子类 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| ReentrantLock | ⭐⭐⭐⭐⭐ | 熟练运用 |
| ConcurrentHashMap | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 同步工具类 | ⭐⭐⭐⭐ | 理解掌握 |
| CompletableFuture | ⭐⭐⭐⭐⭐ | 熟练运用 |

---

**上一章：** [线程池实战](/java/basic/thread-pool)  
**下一章：** [垃圾回收机制](/java/basic/gc)

**最后更新**：2026-03-12
