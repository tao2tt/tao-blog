# Java 21 新特性

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-03-20

---

## 📚 目录

[[toc]]

---

## 1. Java 21 简介

- 发布时间：2023 年 9 月
- LTS 版本（长期支持）
- 主要特性概览

---

## 2. 虚拟线程（Virtual Threads）⭐

### 2.1 什么是虚拟线程

### 2.2 创建虚拟线程

```java
// 方式 1：Thread.ofVirtual()
Thread.ofVirtual().start(() -> {
    System.out.println("虚拟线程运行");
});

// 方式 2：Executors.newVirtualThreadPerTaskExecutor()
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> System.out.println("任务执行"));
}
```

### 2.3 虚拟线程 vs 平台线程

| 特性 | 虚拟线程 | 平台线程 |
|------|---------|---------|
| 内存占用 | ~1KB | ~1MB |
| 创建开销 | 低 | 高 |
| 适用场景 | I/O 密集型 | CPU 密集型 |
| 数量级 | 百万级 | 千级 |

### 2.4 使用场景

---

## 3. 模式匹配（Pattern Matching）

### 3.1 switch 模式匹配

```java
Object obj = "Hello";
String result = switch (obj) {
    case Integer i -> "数字：" + i;
    case String s -> "字符串：" + s;
    default -> "未知类型";
};
```

### 3.2 instanceof 模式匹配

```java
if (obj instanceof String s) {
    System.out.println(s.length());
}
```

---

## 4. Record 类

```java
public record Point(int x, int y) {}

// 使用
Point p = new Point(10, 20);
int x = p.x();  // 自动生成的 getter
```

---

## 5. Sealed 类（密封类）

```java
public sealed class Shape permits Circle, Rectangle {}

public final class Circle extends Shape {}
public final class Rectangle extends Shape {}
```

---

## 6. 其他新特性

- Text Blocks（文本块）
- Switch 表达式
- Var 局部变量类型推断

---

## 📝 练习题

1. 使用虚拟线程实现高并发 HTTP 请求
2. 使用 Record 简化 DTO 类
3. 使用 switch 模式匹配重构 if-else

---

## 🔗 参考资料

- [OpenJDK 21 官方发布](https://openjdk.org/projects/jdk/21/)
- [Java 21 新特性详解](https://blogs.oracle.com/java/post/announcing-java-21)

---

**最后更新**：2026-03-12
