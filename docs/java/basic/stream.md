# Stream API

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-03-22

---

## 📚 目录

[[toc]]

---

## 1. Stream 简介

### 1.1 什么是 Stream

### 1.2 Stream 特点

- 不存储数据
- 不修改源数据
- 惰性求值
- 可并行处理

---

## 2. 创建 Stream

```java
// 从集合
List<String> list = Arrays.asList("a", "b", "c");
Stream<String> stream = list.stream();

// 从数组
String[] arr = {"a", "b", "c"};
Stream<String> stream = Arrays.stream(arr);

// 静态方法
Stream.of("a", "b", "c");
Stream.iterate(0, n -> n + 1);
Stream.generate(Math::random);
```

---

## 3. 中间操作

| 操作 | 说明 | 示例 |
|------|------|------|
| `filter` | 过滤 | `stream.filter(s -> s.length() > 3)` |
| `map` | 转换 | `stream.map(String::toUpperCase)` |
| `flatMap` | 扁平化 | `stream.flatMap(Collection::stream)` |
| `distinct` | 去重 | `stream.distinct()` |
| `sorted` | 排序 | `stream.sorted()` |
| `limit` | 截取 | `stream.limit(10)` |
| `skip` | 跳过 | `stream.skip(5)` |

---

## 4. 终止操作

### 4.1 查找与匹配

```java
boolean anyMatch = stream.anyMatch(s -> s.startsWith("A"));
boolean allMatch = stream.allMatch(s -> s.length() > 0);
Optional<String> first = stream.findFirst();
```

### 4.2 归约

```java
// 求和
int sum = numbers.reduce(0, Integer::sum);

// 拼接字符串
String joined = stream.reduce("", (a, b) -> a + b);
```

### 4.3 收集

```java
// 转 List
List<String> list = stream.collect(Collectors.toList());

// 转 Set
Set<String> set = stream.collect(Collectors.toSet());

// 分组
Map<Integer, List<String>> grouped = stream.collect(
    Collectors.groupingBy(String::length)
);

// 分区
Map<Boolean, List<String>> partitioned = stream.collect(
    Collectors.partitioningBy(s -> s.length() > 3)
);
```

---

## 5. 并行 Stream

```java
list.parallelStream()
    .filter(...)
    .collect(Collectors.toList());
```

---

## 📝 练习题

1. 使用 Stream 统计字符串中各字母出现次数
2. 使用 Stream 找出最长的单词
3. 使用 Stream 将 List 转为 Map

---

## 🔗 参考资料

- [Java Stream API 官方文档](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html)
- 《Java 8 实战》第 4-5 章

---

**最后更新**：2026-03-12
