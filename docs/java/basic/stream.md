# Stream API

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-04-08  
> 难度：⭐⭐⭐⭐☆  
> 前置知识：[Java 核心语法](/java/basic/core)、[集合框架](/java/basic/collections)、[Lambda 表达式](/java/basic/lambda)

---

## 📚 目录

[[toc]]

---

## 1. Stream API 简介

### 1.1 什么是 Stream

**Stream（流）** 是 Java 8 引入的新特性，用于处理集合数据，支持**函数式编程风格**。

**核心思想：** 将数据处理操作串联成管道，自动迭代处理。

```java
// 传统方式：命令式编程
List<String> result = new ArrayList<>();
for (String name : names) {
    if (name.startsWith("张")) {
        result.add(name.toUpperCase());
    }
}

// Stream 方式：声明式编程
List<String> result = names.stream()
    .filter(name -> name.startsWith("张"))  // 过滤
    .map(String::toUpperCase)               // 转换
    .collect(Collectors.toList());          // 收集
```

### 1.2 Stream 的特点

| 特点 | 说明 |
|------|------|
| **不存储数据** | Stream 不是数据结构，不存储元素 |
| **不修改源数据** | Stream 操作不会修改原始集合 |
| **惰性求值** | 中间操作不会立即执行，直到终止操作 |
| **可并行处理** | 支持 parallelStream() 并行处理 |
| **只能消费一次** | Stream 使用后不能再次使用 |

### 1.3 Stream 操作分类

```
Stream 操作
├── 中间操作（Intermediate）- 返回 Stream，可链式调用
│   ├── 筛选：filter、distinct
│   ├── 切片：limit、skip
│   ├── 转换：map、flatMap
│   └── 排序：sorted
│
└── 终止操作（Terminal）- 返回结果或副作用，Stream 关闭
    ├── 收集：collect、toList
    ├── 匹配：anyMatch、allMatch、noneMatch
    ├── 查找：findAny、findFirst
    ├── 归约：reduce
    └── 统计：count、min、max
```

---

## 2. 创建 Stream

### 2.1 从集合创建

```java
List<String> list = Arrays.asList("张三", "李四", "王五");

// List → Stream
Stream<String> stream = list.stream();           // 顺序流
Stream<String> parallelStream = list.parallelStream();  // 并行流

// Set → Stream
Set<String> set = new HashSet<>();
Stream<String> setStream = set.stream();

// Map → Stream
Map<String, Integer> map = new HashMap<>();
Stream<String> keyStream = map.keySet().stream();        // key 的 Stream
Stream<Integer> valueStream = map.values().stream();     // value 的 Stream
Stream<Map.Entry<String, Integer>> entryStream = map.entrySet().stream();  // entry 的 Stream
```

### 2.2 从数组创建

```java
String[] array = {"A", "B", "C"};

// 数组 → Stream
Stream<String> stream = Arrays.stream(array);

// 部分数组 → Stream
Stream<String> subStream = Arrays.stream(array, 0, 2);  // [A, B]
```

### 2.3 使用 Stream.of()

```java
// 直接创建
Stream<String> stream = Stream.of("A", "B", "C");

// 包含 null
Stream<String> streamWithNull = Stream.of("A", null, "C");
```

### 2.4 生成无限 Stream

```java
// iterate：迭代生成
Stream<Integer> numbers = Stream.iterate(0, n -> n + 1);
numbers.limit(5).forEach(System.out::println);  // 0, 1, 2, 3, 4

// generate：随机生成
Stream<Double> randoms = Stream.generate(Math::random);
randoms.limit(3).forEach(System.out::println);  // 3 个随机数

// 重复元素
Stream<String> repeat = Stream.generate(() -> "hello").limit(3);
repeat.forEach(System.out::println);  // hello, hello, hello
```

### 2.5 数值类型 Stream

```java
// IntStream
IntStream intStream = IntStream.range(1, 5);        // [1, 2, 3, 4]
IntStream closedStream = IntStream.rangeClosed(1, 5);  // [1, 2, 3, 4, 5]

// LongStream、DoubleStream
LongStream longStream = LongStream.range(1, 5);
DoubleStream doubleStream = DoubleStream.of(1.1, 2.2, 3.3);
```

---

## 3. 中间操作

### 3.1 筛选（Filter）

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// filter：过滤
List<Integer> evenNumbers = numbers.stream()
    .filter(n -> n % 2 == 0)  // 只保留偶数
    .collect(Collectors.toList());
System.out.println(evenNumbers);  // [2, 4, 6, 8, 10]

// distinct：去重
List<Integer> distinctNumbers = Arrays.asList(1, 2, 2, 3, 3, 3).stream()
    .distinct()
    .collect(Collectors.toList());
System.out.println(distinctNumbers);  // [1, 2, 3]
```

### 3.2 切片（Slice）

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// limit：限制数量
List<Integer> first5 = numbers.stream()
    .limit(5)
    .collect(Collectors.toList());
System.out.println(first5);  // [1, 2, 3, 4, 5]

// skip：跳过前 N 个
List<Integer> skip3 = numbers.stream()
    .skip(3)
    .collect(Collectors.toList());
System.out.println(skip3);  // [4, 5, 6, 7, 8, 9, 10]

// 组合使用
List<Integer> page = numbers.stream()
    .skip(2)    // 跳过前 2 个
    .limit(3)   // 取 3 个
    .collect(Collectors.toList());
System.out.println(page);  // [3, 4, 5]（分页）
```

### 3.3 转换（Map）

```java
List<String> names = Arrays.asList("张三", "李四", "王五");

// map：一对一转换
List<Integer> nameLengths = names.stream()
    .map(String::length)  // 将姓名映射为长度
    .collect(Collectors.toList());
System.out.println(nameLengths);  // [2, 2, 2]

// mapToInt：转换为 IntStream
IntStream lengths = names.stream()
    .mapToInt(String::length);

// flatMap：一对多转换（扁平化）
List<List<Integer>> nested = Arrays.asList(
    Arrays.asList(1, 2, 3),
    Arrays.asList(4, 5),
    Arrays.asList(6, 7, 8, 9)
);

List<Integer> flat = nested.stream()
    .flatMap(list -> list.stream())  // 将每个 List 转为 Stream，然后合并
    .collect(Collectors.toList());
System.out.println(flat);  // [1, 2, 3, 4, 5, 6, 7, 8, 9]

// 实战：提取所有单词
List<String> sentences = Arrays.asList("Hello World", "Java Stream", "Flat Map");
List<String> words = sentences.stream()
    .flatMap(sentence -> Arrays.stream(sentence.split(" ")))
    .collect(Collectors.toList());
System.out.println(words);  // [Hello, World, Java, Stream, Flat, Map]
```

### 3.4 排序（Sorted）

```java
List<Integer> numbers = Arrays.asList(5, 2, 8, 1, 9, 3);

// 自然排序
List<Integer> sorted = numbers.stream()
    .sorted()
    .collect(Collectors.toList());
System.out.println(sorted);  // [1, 2, 3, 5, 8, 9]

// 自定义排序（降序）
List<Integer> reverseSorted = numbers.stream()
    .sorted((a, b) -> b - a)
    .collect(Collectors.toList());
System.out.println(reverseSorted);  // [9, 8, 5, 3, 2, 1]

// 按字符串长度排序
List<String> names = Arrays.asList("张三", "李四", "欧阳锋", "王五");
List<String> sortedByName = names.stream()
    .sorted(Comparator.comparingInt(String::length))
    .collect(Collectors.toList());
System.out.println(sortedByName);  // [张三，李四，王五，欧阳锋]

// 多字段排序
List<Person> people = Arrays.asList(
    new Person("张三", 25),
    new Person("李四", 30),
    new Person("张三", 20)
);

List<Person> sortedPeople = people.stream()
    .sorted(Comparator.comparing(Person::getName)
        .thenComparingInt(Person::getAge))
    .collect(Collectors.toList());
// 先按姓名升序，姓名相同按年龄升序
```

---

## 4. 终止操作

### 4.1 收集（Collect）

```java
List<String> names = Arrays.asList("张三", "李四", "王五", "张三");

// 转为 List
List<String> list = names.stream()
    .collect(Collectors.toList());

// 转为 Set（去重）
Set<String> set = names.stream()
    .distinct()
    .collect(Collectors.toSet());

// 转为 Map（key 为姓名，value 为长度）
Map<String, Integer> map = names.stream()
    .distinct()
    .collect(Collectors.toMap(
        name -> name,           // key
        String::length          // value
    ));

// 分组（按姓名长度分组）
Map<Integer, List<String>> grouped = names.stream()
    .collect(Collectors.groupingBy(String::length));
// {2=[张三，李四，王五]}

// 分区（按长度是否大于 2 分区）
Map<Boolean, List<String>> partitioned = names.stream()
    .collect(Collectors.partitioningBy(name -> name.length() > 2));
// {false=[张三，李四，王五], true=[]}

// 拼接字符串
String joined = names.stream()
    .collect(Collectors.joining(", "));
System.out.println(joined);  // 张三，李四，王五，张三

// 带前缀后缀
String joinedWithPrefix = names.stream()
    .collect(Collectors.joining(", ", "[", "]"));
System.out.println(joinedWithPrefix);  // [张三，李四，王五，张三]
```

### 4.2 匹配（Match）

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// anyMatch：是否有任意一个满足条件
boolean hasEven = numbers.stream()
    .anyMatch(n -> n % 2 == 0);
System.out.println(hasEven);  // true

// allMatch：是否全部满足条件
boolean allPositive = numbers.stream()
    .allMatch(n -> n > 0);
System.out.println(allPositive);  // true

// noneMatch：是否都不满足条件
boolean noNegative = numbers.stream()
    .noneMatch(n -> n < 0);
System.out.println(noNegative);  // true
```

### 4.3 查找（Find）

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// findFirst：查找第一个
Optional<Integer> first = numbers.stream()
    .findFirst();
System.out.println(first.orElse(0));  // 1

// findAny：查找任意一个（并行流时有优势）
Optional<Integer> any = numbers.stream()
    .findAny();
System.out.println(any.orElse(0));  // 可能是任意值

// 查找第一个偶数
Optional<Integer> firstEven = numbers.stream()
    .filter(n -> n % 2 == 0)
    .findFirst();
System.out.println(firstEven.orElse(0));  // 2
```

### 4.4 归约（Reduce）

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// 求和（方式 1：reduce）
Optional<Integer> sum = numbers.stream()
    .reduce((a, b) -> a + b);
System.out.println(sum.orElse(0));  // 15

// 求和（方式 2：带初始值）
Integer sum2 = numbers.stream()
    .reduce(0, (a, b) -> a + b);
System.out.println(sum2);  // 15

// 求和（方式 3：方法引用）
Integer sum3 = numbers.stream()
    .reduce(0, Integer::sum);
System.out.println(sum3);  // 15

// 求最大值
Optional<Integer> max = numbers.stream()
    .reduce(Integer::max);
System.out.println(max.orElse(0));  // 5

// 求最小值
Optional<Integer> min = numbers.stream()
    .reduce(Integer::min);
System.out.println(min.orElse(0));  // 1

// 拼接字符串
List<String> names = Arrays.asList("A", "B", "C");
String joined = names.stream()
    .reduce("", (a, b) -> a + b + ",");
System.out.println(joined);  // A,B,C,
```

### 4.5 统计（Statistics）

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// count：数量
long count = numbers.stream().count();
System.out.println(count);  // 5

// min：最小值
Optional<Integer> min = numbers.stream().min(Integer::compareTo);
System.out.println(min.orElse(0));  // 1

// max：最大值
Optional<Integer> max = numbers.stream().max(Integer::compareTo);
System.out.println(max.orElse(0));  // 5

// 数值 Stream 的统计
IntSummaryStatistics stats = numbers.stream()
    .mapToInt(Integer::intValue)
    .summaryStatistics();

System.out.println("数量：" + stats.getCount());    // 5
System.out.println("总和：" + stats.getSum());      // 15
System.out.println("平均：" + stats.getAverage());  // 3.0
System.out.println("最小：" + stats.getMin());      // 1
System.out.println("最大：" + stats.getMax());      // 5
```

---

## 5. 并行流

### 5.1 创建并行流

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// 方式 1：集合 → parallelStream
Stream<Integer> parallelStream = numbers.parallelStream();

// 方式 2：Stream → parallel
Stream<Integer> parallelStream2 = numbers.stream().parallel();

// 方式 3：并行 → 串行
Stream<Integer> sequentialStream = parallelStream2.sequential();
```

### 5.2 并行流性能

```java
// 适合并行处理的场景：
// 1. 数据量大
// 2. CPU 密集型操作
// 3. 操作无状态

// 性能对比
public class ParallelPerformance {
    public static void main(String[] args) {
        List<Integer> numbers = IntStream.range(0, 1000000)
            .boxed()
            .collect(Collectors.toList());
        
        // 串行处理
        long start = System.currentTimeMillis();
        numbers.stream()
            .mapToLong(n -> (long) n * n)
            .sum();
        System.out.println("串行：" + (System.currentTimeMillis() - start) + "ms");
        
        // 并行处理
        start = System.currentTimeMillis();
        numbers.parallelStream()
            .mapToLong(n -> (long) n * n)
            .sum();
        System.out.println("并行：" + (System.currentTimeMillis() - start) + "ms");
    }
}
```

### 5.3 并行流注意事项

```java
// ❌ 避免：有状态操作
List<Integer> list = new ArrayList<>();
numbers.parallelStream()
    .forEach(n -> list.add(n));  // ❌ 线程不安全

// ✅ 正确：使用 collect
List<Integer> safeList = numbers.parallelStream()
    .collect(Collectors.toList());

// ❌ 避免：依赖顺序
numbers.parallelStream()
    .forEachOrdered(System.out::println);  // 保持顺序，失去并行优势

// ✅ 推荐：无状态操作
numbers.parallelStream()
    .map(n -> n * 2)
    .sum();  // ✅ 无状态，适合并行
```

---

## 6. 实战案例

### 6.1 数据处理

```java
// 场景：处理订单数据
List<Order> orders = Arrays.asList(
    new Order("A001", 100.0, "PAID"),
    new Order("A002", 200.0, "PENDING"),
    new Order("A003", 150.0, "PAID"),
    new Order("A004", 300.0, "PAID")
);

// 1. 筛选已支付订单
List<Order> paidOrders = orders.stream()
    .filter(order -> "PAID".equals(order.getStatus()))
    .collect(Collectors.toList());

// 2. 计算总金额
double totalAmount = orders.stream()
    .mapToDouble(Order::getAmount)
    .sum();

// 3. 按状态分组
Map<String, List<Order>> groupedByStatus = orders.stream()
    .collect(Collectors.groupingBy(Order::getStatus));

// 4. 计算各状态订单数量
Map<String, Long> countByStatus = orders.stream()
    .collect(Collectors.groupingBy(
        Order::getStatus,
        Collectors.counting()
    ));

// 5. 找出金额最高的订单
Optional<Order> maxOrder = orders.stream()
    .max(Comparator.comparing(Order::getAmount));
```

### 6.2 文本处理

```java
// 场景：统计文章词频
String text = "Java Stream API is powerful Java is popular";
List<String> words = Arrays.asList(text.split(" "));

// 统计每个单词出现次数
Map<String, Long> wordCount = words.stream()
    .collect(Collectors.groupingBy(
        word -> word,
        Collectors.counting()
    ));
// {Java=2, Stream=1, API=1, is=2, powerful=1, popular=1}

// 按出现次数排序
List<Map.Entry<String, Long>> sorted = wordCount.entrySet().stream()
    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
    .collect(Collectors.toList());
```

---

## 📝 练习题

### 基础题

1. **筛选练习**：从整数列表中筛选出所有偶数，并收集到 List

2. **转换练习**：将字符串列表转换为大写，并计算每个字符串的长度

3. **归约练习**：使用 reduce 计算 1 到 100 的和

### 进阶题

4. **分组练习**：将员工列表按部门分组，并统计每个部门的人数

5. **并行流练习**：使用并行流处理 100 万数据，对比串行和并行的性能差异

6. **综合练习**：处理订单数据，实现筛选、分组、统计、排序等功能

---

## 🔗 参考资料

### 官方文档
- [Java Stream API](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html)

### 推荐书籍
- 📚 《Java 8 实战》第 4-5 章：Stream API
- 📚 《Modern Java in Action》

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| Stream 创建 | ⭐⭐⭐⭐ | 熟练运用 |
| 中间操作 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 终止操作 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| Collectors | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 并行流 | ⭐⭐⭐⭐ | 理解掌握 |

---

**上一章：** [Java 21 新特性](/java/basic/java21)  
**下一章：** [Optional 类](/java/basic/optional)

**最后更新**：2026-03-12
