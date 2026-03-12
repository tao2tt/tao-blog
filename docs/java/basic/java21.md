# Java 21 新特性

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-03-30  
> 难度：⭐⭐⭐⭐☆  
> 前置知识：[Java 核心语法](/java/basic/core)、[面向对象编程](/java/basic/oop)

---

## 📚 目录

[[toc]]

---

## 1. Java 21 简介

### 1.1 版本信息

**Java 21** 于 **2023 年 9 月** 发布，是 **LTS（长期支持）版本**，继 Java 17 之后的第二个 LTS 版本。

**Java LTS 版本路线图：**

```
JDK 8 (2014)   ← 经典 LTS，广泛使用
    ↓
JDK 11 (2018)  ← LTS
    ↓
JDK 17 (2021)  ← LTS
    ↓
JDK 21 (2023)  ← 最新 LTS（推荐）
    ↓
JDK 25 (2027?) ← 未来 LTS
```

**💡 建议：** 新项目优先选择 Java 21，老项目逐步迁移。

### 1.2 主要特性概览

| 特性 | 类型 | 说明 |
|------|------|------|
| **虚拟线程** | Preview → Final | 轻量级线程，百万级并发 |
| **模式匹配** | Preview → Final | switch 和 instanceof 增强 |
| **Record 类** | Final | 不可变数据载体 |
| **Sealed 类** | Final | 密封类，限制继承 |
| **String 模板** | Preview | 字符串插值 |
| **Unnamed 类** | Preview | 免声明类（main 方法简化） |

---

## 2. 虚拟线程（Virtual Threads）⭐

### 2.1 什么是虚拟线程

**虚拟线程** 是 Java 21 最重大的特性，是一种**轻量级线程**，由 JVM 管理而非操作系统。

**平台线程 vs 虚拟线程：**

| 对比项 | 平台线程 | 虚拟线程 |
|--------|---------|---------|
| **映射关系** | 1:1 映射到 OS 线程 | M:N 映射到少量 OS 线程 |
| **内存占用** | ~1MB 栈空间 | ~1KB 栈空间 |
| **创建开销** | 高（系统调用） | 低（JVM 分配） |
| **切换开销** | 高（内核态切换） | 低（用户态切换） |
| **数量级** | 几千个 | 百万级 |

**💡 比喻：**
- **平台线程** = 高速公路（固定车道，扩建成本高）
- **虚拟线程** = 共享单车（灵活部署，成本低）

### 2.2 创建虚拟线程

#### 2.2.1 方式一：Thread.ofVirtual()

```java
// 创建虚拟线程
Thread virtualThread = Thread.ofVirtual().start(() -> {
    System.out.println("虚拟线程运行：" + Thread.currentThread().getName());
});

// 等待完成
virtualThread.join();

// 对比：创建平台线程
Thread platformThread = Thread.ofPlatform().start(() -> {
    System.out.println("平台线程运行");
});
```

#### 2.2.2 方式二：Executors.newVirtualThreadPerTaskExecutor()

```java
// 创建虚拟线程执行器（推荐）
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    
    // 提交任务
    Future<Integer> future = executor.submit(() -> {
        Thread.sleep(1000);
        return 42;
    });
    
    // 获取结果
    Integer result = future.get();
    System.out.println("结果：" + result);
    
}  // 自动关闭执行器
```

#### 2.2.3 方式三：Thread.startVirtualThread()

```java
// 简化创建（Java 21+）
Thread thread = Thread.startVirtualThread(() -> {
    System.out.println("虚拟线程：" + Thread.currentThread().getName());
});

thread.join();
```

### 2.3 虚拟线程实战

#### 2.3.1 高并发 HTTP 请求

```java
import java.net.http.*;
import java.util.concurrent.*;

public class VirtualThreadHttpClient {
    
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        
        // 创建虚拟线程执行器
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            
            List<Future<String>> futures = new ArrayList<>();
            
            // 并发请求 10000 个 URL
            for (int i = 0; i < 10000; i++) {
                final int index = i;
                futures.add(executor.submit(() -> {
                    HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.example.com/data/" + index))
                        .GET()
                        .build();
                    
                    return client.send(request, HttpResponse.BodyHandlers.ofString())
                        .body();
                }));
            }
            
            // 收集结果
            for (Future<String> future : futures) {
                System.out.println(future.get());
            }
        }
    }
}
```

**💡 性能对比：**
- **平台线程**：10000 个请求需要线程池，并发度受限
- **虚拟线程**：10000 个请求轻松处理，每个请求一个线程

#### 2.3.2 定时任务

```java
// 每秒执行一次任务
Thread.ofVirtual().start(() -> {
    while (true) {
        System.out.println("定时任务：" + System.currentTimeMillis());
        Thread.sleep(1000);
    }
});
```

### 2.4 虚拟线程注意事项

#### 2.4.1 避免线程池

```java
// ❌ 不推荐：虚拟线程不需要线程池
ExecutorService executor = Executors.newFixedThreadPool(100);
executor.submit(() -> {
    // 虚拟线程任务
});

// ✅ 推荐：每个任务一个虚拟线程
ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
executor.submit(() -> {
    // 虚拟线程任务
});
```

#### 2.4.2 避免 synchronized

```java
// ❌ 避免：synchronized 会 pin 住虚拟线程（退化为平台线程）
synchronized (lock) {
    // 临界区
}

// ✅ 推荐：使用 ReentrantLock
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    // 临界区
} finally {
    lock.unlock();
}
```

#### 2.4.3 适用场景

| 场景 | 推荐 | 说明 |
|------|------|------|
| **I/O 密集型** | ✅ 强烈推荐 | HTTP 请求、文件读写、数据库操作 |
| **CPU 密集型** | ❌ 不推荐 | 复杂计算、图像处理 |
| **混合场景** | ✅ 推荐 | 大部分业务场景 |

---

## 3. 模式匹配（Pattern Matching）

### 3.1 instanceof 模式匹配

**Java 14+ 预览，Java 16 正式**

#### 3.1.1 传统写法

```java
// ❌ 啰嗦：需要显式类型转换
Object obj = "Hello";

if (obj instanceof String) {
    String str = (String) obj;  // 显式转换
    System.out.println(str.length());
}
```

#### 3.1.2 新模式匹配

```java
// ✅ 简洁：自动类型转换
Object obj = "Hello";

if (obj instanceof String str) {  // 模式匹配
    System.out.println(str.length());  // 直接使用 str
}

// 等价于：
// if (obj instanceof String && (str = (String) obj) != null)
```

#### 3.1.3 复杂场景

```java
public void process(Object obj) {
    if (obj instanceof String str && str.length() > 0) {
        System.out.println("非空字符串：" + str);
    } else if (obj instanceof Integer i && i > 0) {
        System.out.println("正整数：" + i);
    } else if (obj instanceof List<?> list && !list.isEmpty()) {
        System.out.println("非空列表：" + list);
    }
}
```

### 3.2 switch 模式匹配

**Java 14+ 预览，Java 21 正式**

#### 3.2.1 传统 switch

```java
// ❌ 啰嗦：需要 break，容易遗漏
String result = "";
switch (obj) {
    case Integer i:
        result = "整数：" + i;
        break;
    case String s:
        result = "字符串：" + s;
        break;
    default:
        result = "未知类型";
}
```

#### 3.2.2 switch 表达式（Java 14+）

```java
// ✅ 简洁：使用 -> 不需要 break
String result = switch (obj) {
    case Integer i -> "整数：" + i;
    case String s -> "字符串：" + s;
    default -> "未知类型";
};
```

#### 3.2.3 switch 模式匹配（Java 21）

```java
// ✅ 强大：类型模式 + guard 条件
String result = switch (obj) {
    case Integer i when i > 0 -> "正整数：" + i;
    case Integer i when i < 0 -> "负整数：" + i;
    case Integer i -> "零";
    case String s when s.length() > 10 -> "长字符串：" + s;
    case String s -> "短字符串：" + s;
    case null -> "null 值";
    default -> "未知类型";
};
```

**💡 亮点：**
- ✅ 类型模式匹配（`Integer i`）
- ✅ guard 条件（`when i > 0`）
- ✅ null 安全（`case null`）

### 3.3 实战案例

```java
// 处理不同类型的形状
public double calculateArea(Object shape) {
    return switch (shape) {
        case Circle c -> Math.PI * c.radius() * c.radius();
        case Rectangle r -> r.width() * r.height();
        case Triangle t when t.isEquilateral() -> 
            (Math.sqrt(3) / 4) * t.side() * t.side();
        case Triangle t -> 0.5 * t.base() * t.height();
        case null -> 0.0;
        default -> throw new IllegalArgumentException("未知形状");
    };
}
```

---

## 4. Record 类

**Java 14+ 预览，Java 16 正式**

### 4.1 什么是 Record

**Record** 是不可变的数据载体类，用于替代传统的 JavaBean。

### 4.2 传统 JavaBean vs Record

#### 4.2.1 传统写法

```java
// ❌ 啰嗦：需要写很多样板代码
public class Point {
    private final int x;
    private final int y;
    
    // 构造方法
    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
    
    // getter
    public int getX() { return x; }
    public int getY() { return y; }
    
    // equals
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Point point = (Point) obj;
        return x == point.x && y == point.y;
    }
    
    // hashCode
    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
    
    // toString
    @Override
    public String toString() {
        return "Point{x=" + x + ", y=" + y + "}";
    }
}
```

#### 4.2.2 Record 写法

```java
// ✅ 简洁：一行搞定
public record Point(int x, int y) { }

// 使用
Point p = new Point(10, 20);
System.out.println(p.x());      // 10（自动生成的 getter）
System.out.println(p.y());      // 20
System.out.println(p);          // Point[x=10, y=20]（自动 toString）

Point p2 = new Point(10, 20);
System.out.println(p.equals(p2));  // true（自动 equals）
System.out.println(p.hashCode());  // 自动 hashCode
```

### 4.3 Record 的特点

| 特点 | 说明 |
|------|------|
| **不可变** | 所有字段都是 final |
| **自动生成** | 构造方法、getter、equals、hashCode、toString |
| **不能有额外字段** | 只能有声明的组件 |
| **可以有方法** | 可以添加业务方法 |
| **可以实现接口** | 支持接口实现 |

### 4.4 自定义 Record

```java
// 添加业务方法
public record Person(String name, int age) {
    
    // 自定义构造方法（用于验证）
    public Person {
        if (age < 0 || age > 150) {
            throw new IllegalArgumentException("年龄不合法");
        }
    }
    
    // 添加方法
    public boolean isAdult() {
        return age >= 18;
    }
    
    // 静态方法
    public static Person createAdult(String name) {
        return new Person(name, 18);
    }
}

// 使用
Person p = new Person("张三", 20);
System.out.println(p.isAdult());  // true

Person adult = Person.createAdult("李四");
```

### 4.5 Record 与接口

```java
// 实现接口
public interface Identifiable {
    String id();
}

public record User(String id, String name) implements Identifiable {
    // id() 方法由 Record 自动生成，满足接口要求
}

// 使用
Identifiable user = new User("001", "张三");
System.out.println(user.id());  // 001
```

---

## 5. Sealed 类（密封类）

**Java 15+ 预览，Java 17 正式**

### 5.1 什么是 Sealed 类

**Sealed 类** 限制哪些类可以继承它，提供细粒度的访问控制。

### 5.2 传统继承 vs Sealed

#### 5.2.1 传统继承

```java
// ❌ 任何类都可以继承
public class Shape {
    // ...
}

// 任何人都可以继承
public class Circle extends Shape { }  // ✅
public class Whatever extends Shape { }  // ✅ 无法限制
```

#### 5.2.2 Sealed 类

```java
// ✅ 限制继承：只有 permits 的类可以继承
public sealed class Shape permits Circle, Rectangle, Triangle {
    // ...
}

// ✅ 允许的类
public final class Circle extends Shape { }  // ✅
public final class Rectangle extends Shape { }  // ✅

// ❌ 不允许的类
// public class Triangle extends Shape { }  // ❌ 编译错误：不在 permits 列表中
```

### 5.3 子类的修饰符

```java
public sealed class Shape permits Circle, Rectangle {
    // ...
}

// 子类必须是以下三种之一：

// 1. final：不能被继承
public final class Circle extends Shape { }

// 2. sealed：可以继续密封
public sealed class Rectangle extends Shape permits ColoredRectangle { }

// 3. non-sealed：开放继承
public non-sealed class Triangle extends Shape { }
// 任何类都可以继承 Triangle
```

### 5.4 实战案例

```java
// 支付方式的密封类层次
public sealed class Payment 
    permits CreditCardPayment, AlipayPayment, WechatPayment {
    
    public abstract void pay(BigDecimal amount);
}

// 具体的支付方式
public final class CreditCardPayment extends Payment {
    @Override
    public void pay(BigDecimal amount) {
        // 信用卡支付逻辑
    }
}

public final class AlipayPayment extends Payment {
    @Override
    public void pay(BigDecimal amount) {
        // 支付宝支付逻辑
    }
}

public final class WechatPayment extends Payment {
    @Override
    public void pay(BigDecimal amount) {
        // 微信支付逻辑
    }
}

// 使用
public void processPayment(Payment payment, BigDecimal amount) {
    // 编译时知道所有可能的子类
    payment.pay(amount);
}
```

---

## 6. 其他新特性

### 6.1 String 模板（Preview）

**Java 21 预览特性**

```java
// 字符串插值（类似 JavaScript 模板字符串）
String name = "张三";
int age = 25;

// 传统写法
String info = "姓名：" + name + ", 年龄：" + age;

// Java 21 预览（STR 处理器）
String info = STR."姓名：\{name}, 年龄：\{age}";

// 多行字符串
String json = STR."""
    {
        "name": "\{name}",
        "age": \{age}
    }
    """;
```

### 6.2 Unnamed 类（Preview）

**Java 22 预览，简化 main 方法**

```java
// 传统写法
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}

// Java 22+ 预览（免声明类）
void main() {
    System.out.println("Hello");
}
```

### 6.3 改进的 Switch

```java
// 增强型 switch
String result = switch (day) {
    case "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY" -> "工作日";
    case "SATURDAY", "SUNDAY" -> "周末";
    default -> "未知";
};
```

---

## 7. 实战案例

### 7.1 虚拟线程处理并发请求

```java
import java.net.http.*;
import java.util.concurrent.*;

public class VirtualThreadDemo {
    
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            
            List<Future<String>> futures = new ArrayList<>();
            
            // 并发请求 1000 个 API
            for (int i = 0; i < 1000; i++) {
                final int index = i;
                futures.add(executor.submit(() -> {
                    HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.example.com/data/" + index))
                        .timeout(Duration.ofSeconds(5))
                        .GET()
                        .build();
                    
                    try {
                        return client.send(request, HttpResponse.BodyHandlers.ofString())
                            .body();
                    } catch (Exception e) {
                        return "Error: " + e.getMessage();
                    }
                }));
            }
            
            // 统计结果
            int success = 0;
            int failed = 0;
            
            for (Future<String> future : futures) {
                String result = future.get();
                if (result.startsWith("Error")) {
                    failed++;
                } else {
                    success++;
                }
            }
            
            System.out.println("成功：" + success + ", 失败：" + failed);
        }
    }
}
```

### 7.2 Record + Pattern Matching

```java
// 使用 Record 定义数据类型
public record Order(String id, String customer, BigDecimal amount, String status) { }

// 使用 Pattern Matching 处理
public String processOrder(Object orderObj) {
    return switch (orderObj) {
        case Order order when order.status().equals("PAID") -> 
            "已支付订单：" + order.id() + ", 金额：" + order.amount();
        case Order order when order.status().equals("PENDING") -> 
            "待支付订单：" + order.id();
        case Order order -> 
            "其他状态订单：" + order.id();
        case null -> "订单为空";
        default -> "未知类型";
    };
}
```

---

## 📝 练习题

### 基础题

1. **虚拟线程练习**：使用虚拟线程创建 100 个并发任务，每个任务休眠随机时间后打印消息

2. **Record 练习**：使用 Record 重写一个 Student 类（包含姓名、年龄、学号）

3. **Pattern Matching 练习**：使用 instanceof 模式匹配重构类型检查和转换代码

### 进阶题

4. **Switch 模式匹配**：使用 switch 模式匹配实现一个表达式求值器（支持整数、字符串、列表）

5. **Sealed 类练习**：使用 Sealed 类设计一个错误处理体系（Success、Error、Warning）

6. **综合练习**：结合虚拟线程、Record、Pattern Matching 实现一个简单的并发数据处理系统

---

## 🔗 参考资料

### 官方文档
- [Java 21 官方发布](https://openjdk.org/projects/jdk/21/)
- [虚拟线程文档](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html)
- [模式匹配文档](https://docs.oracle.com/en/java/javase/21/language/pattern-matching.html)

### 推荐文章
- 🔗 [InfoQ Java 21 新特性详解](https://www.infoq.com/articles/java-21-new-features/)
- 🔗 [Oracle Java 21 官方博客](https://blogs.oracle.com/java/post/announcing-java-21)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 虚拟线程 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| instanceof 模式匹配 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| switch 模式匹配 | ⭐⭐⭐⭐ | 理解掌握 |
| Record 类 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| Sealed 类 | ⭐⭐⭐⭐ | 理解掌握 |
| String 模板 | ⭐⭐⭐ | 了解 |

---

**上一章：** [泛型与注解](/java/basic/generics-annotations)  
**下一章：** [Stream API](/java/basic/stream)

**最后更新**：2026-03-12
