# Optional 类

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-03-24

---

## 📚 目录

[[toc]]

---

## 1. 为什么需要 Optional

### 1.1 空指针问题

```java
// 传统方式
if (user != null && user.getAddress() != null) {
    String city = user.getAddress().getCity();
}

// Optional 方式
String city = Optional.ofNullable(user)
    .map(User::getAddress)
    .map(Address::getCity)
    .orElse("未知");
```

### 1.2 Optional 的设计目的

- 明确表示值可能存在或不存在
- 避免显式的 null 检查
- 函数式编程风格

---

## 2. 创建 Optional

```java
// 创建非空 Optional
Optional<String> opt = Optional.of("value");

// 创建可空的 Optional
Optional<String> opt = Optional.ofNullable(getValue());

// 创建空 Optional
Optional<String> opt = Optional.empty();
```

---

## 3. 常用方法

### 3.1 获取值

| 方法 | 说明 |
|------|------|
| `get()` | 获取值，为空抛异常 |
| `orElse(T other)` | 为空返回默认值 |
| `orElseGet(Supplier)` | 为空执行 Supplier |
| `orElseThrow()` | 为空抛异常 |

### 3.2 转换

| 方法 | 说明 |
|------|------|
| `map(Function)` | 转换值 |
| `flatMap(Function)` | 转换并扁平化 |
| `filter(Predicate)` | 过滤 |

### 3.3 判断

| 方法 | 说明 |
|------|------|
| `isPresent()` | 是否有值 |
| `isEmpty()` | 是否为空 |
| `ifPresent(Consumer)` | 有值则执行 |

---

## 4. 最佳实践

### ✅ 推荐用法

```java
// 链式调用
String result = Optional.ofNullable(value)
    .map(String::trim)
    .filter(s -> !s.isEmpty())
    .orElse("default");

// 返回 Optional
public Optional<User> findUser(String id) {
    return Optional.ofNullable(userDao.findById(id));
}
```

### ❌ 避免用法

```java
// 不要这样用
if (opt.isPresent()) {
    return opt.get();
}

// 应该这样
return opt.orElse(defaultValue);

// 不要用 Optional 存储字段
private Optional<String> field; // ❌
```

---

## 5. Stream 与 Optional

```java
list.stream()
    .filter(Objects::nonNull)
    .findFirst()
    .ifPresent(System.out::println);
```

---

## 📝 练习题

1. 使用 Optional 重构嵌套 null 检查
2. 实现一个返回 Optional 的方法
3. 使用 Optional 处理集合操作

---

## 🔗 参考资料

- [Optional 官方文档](https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html)
- 《Effective Java》第 55 条

---

**最后更新**：2026-03-12
