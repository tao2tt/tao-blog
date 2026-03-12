# JUC 并发包

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-03-26

---

## 📚 目录

[[toc]]

---

## 1. JUC 简介

`java.util.concurrent` 包，Java 5 引入的并发工具包

---

## 2. 原子类

### 2.1 基本类型原子类

```java
AtomicInteger atomicInt = new AtomicInteger(0);
atomicInt.incrementAndGet();
atomicInt.compareAndSet(1, 2);
```

### 2.2 数组原子类

```java
AtomicIntegerArray array = new AtomicIntegerArray(10);
array.getAndSet(0, 100);
```

### 2.3 引用类型原子类

```java
AtomicReference<User> ref = new AtomicReference<>();
ref.compareAndSet(oldUser, newUser);
```

---

## 3. 锁

### 3.1 ReentrantLock

```java
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    // 临界区
} finally {
    lock.unlock();
}
```

### 3.2 ReentrantReadWriteLock

```java
ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
rwLock.readLock().lock();
rwLock.writeLock().lock();
```

### 3.3 StampedLock

### 3.4 Condition

---

## 4. 并发容器

### 4.1 ConcurrentHashMap

```java
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.put("key", 1);
map.computeIfAbsent("key", k -> 0);
```

### 4.2 CopyOnWriteArrayList

### 4.3 BlockingQueue

- ArrayBlockingQueue
- LinkedBlockingQueue
- PriorityBlockingQueue
- DelayQueue

---

## 5. 同步工具类

### 5.1 CountDownLatch

```java
CountDownLatch latch = new CountDownLatch(3);
// 等待 3 个任务完成
latch.await();
```

### 5.2 CyclicBarrier

### 5.3 Semaphore

```java
Semaphore semaphore = new Semaphore(5);
semaphore.acquire();
semaphore.release();
```

### 5.4 Phaser

---

## 6. Fork/Join 框架

```java
ForkJoinPool pool = new ForkJoinPool();
pool.invoke(new RecursiveTask<Integer>() {
    // 实现计算逻辑
});
```

---

## 7. CompletableFuture

```java
CompletableFuture.supplyAsync(() -> fetchData())
    .thenApply(data -> process(data))
    .thenAccept(result -> System.out.println(result))
    .exceptionally(ex -> handleError(ex));
```

---

## 📝 练习题

1. 使用 ConcurrentHashMap 实现线程安全缓存
2. 使用 CountDownLatch 等待多个任务完成
3. 使用 CompletableFuture 实现异步编排

---

## 🔗 参考资料

- 《Java 并发编程实战》第 15 章
- [JUC 官方文档](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/package-summary.html)

---

**最后更新**：2026-03-12
