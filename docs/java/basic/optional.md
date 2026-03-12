# Optional 类

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-04-10  
> 难度：⭐⭐⭐☆☆  
> 前置知识：[Java 核心语法](/java/basic/core)、[Stream API](/java/basic/stream)

---

## 📚 目录

[[toc]]

---

## 1. Optional 简介

### 1.1 为什么需要 Optional

**空指针问题（NullPointerException）是 Java 中最常见的异常**

```java
// ❌ 传统方式：嵌套 null 检查
public String getUserName(User user) {
    if (user != null) {
        Address address = user.getAddress();
        if (address != null) {
            City city = address.getCity();
            if (city != null) {
                return city.getName();
            }
        }
    }
    return "未知";
}

// 代码臃肿，难以维护
```

**Optional 的设计目的：**
- ✅ 明确表示值可能存在或不存在
- ✅ 避免显式的 null 检查
- ✅ 函数式编程风格
- ✅ 强制开发者处理 null 情况

### 1.2 什么是 Optional

**Optional** 是 Java 8 引入的容器类，用于包含或不包含非空值。

```java
// Optional 是一个盒子，里面可能有值，也可能是空的
Optional`String` optional = Optional.of("hello");  // 有值
Optional`String` empty = Optional.empty();          // 空值
```

---

## 2. 创建 Optional

### 2.1 Optional.of()

**创建非空 Optional，值为 null 会抛异常**

```java
// ✅ 正确用法
Optional`String` opt = Optional.of("hello");
System.out.println(opt.get());  // hello

// ❌ 错误用法
// Optional`String` nullOpt = Optional.of(null);  // NullPointerException
```

### 2.2 Optional.ofNullable()

**创建可空的 Optional，值为 null 返回空 Optional**

```java
String value = getValue();  // 可能返回 null

// ✅ 推荐用法
Optional`String` opt = Optional.ofNullable(value);

// 等价于
Optional`String` opt2 = (value != null) 
    ? Optional.of(value) 
    : Optional.empty();
```

### 2.3 Optional.empty()

**创建空 Optional**

```java
Optional`String` empty = Optional.empty();
System.out.println(empty.isPresent());  // false
```

### 2.4 工厂方法返回 Optional

```java
/**
 * 推荐：方法返回 Optional 而不是 null
 */
public Optional`User` findUserById(String id) {
    User user = userDao.findById(id);
    return Optional.ofNullable(user);
}

// 使用
Optional`User` userOpt = findUserById("123");
userOpt.ifPresent(user -> System.out.println(user.getName()));
```

---

## 3. 获取值

### 3.1 get()

**获取值，如果为空抛 NoSuchElementException**

```java
Optional`String` opt = Optional.of("hello");

// ✅ 安全用法
if (opt.isPresent()) {
    String value = opt.get();
    System.out.println(value);
}

// ❌ 危险用法
// String value = opt.get();  // 如果为空，抛异常
```

### 3.2 orElse()

**如果为空，返回默认值**

```java
Optional`String` opt = Optional.ofNullable(getValue());

// 如果为空，返回"默认值"
String value = opt.orElse("默认值");

// 等价于
String value2 = (opt.isPresent()) ? opt.get() : "默认值";
```

### 3.3 orElseGet()

**如果为空，执行 Supplier 返回默认值**

```java
// 延迟计算：只有为空时才执行
String value = opt.orElseGet(() -> {
    System.out.println("计算默认值...");
    return computeDefaultValue();
});

// vs orElse
// orElse("默认值")      - 立即计算，无论是否为空
// orElseGet(() -> ...)  - 延迟计算，只有为空才执行
```

### 3.4 orElseThrow()

**如果为空，抛异常**

```java
// 抛默认异常
String value = opt.orElseThrow();  // NoSuchElementException

// 抛自定义异常
String value = opt.orElseThrow(() -> new IllegalArgumentException("值不能为空"));

// 等价于
if (!opt.isPresent()) {
    throw new IllegalArgumentException("值不能为空");
}
return opt.get();
```

### 3.5 方法对比

| 方法 | 为空时的行为 | 适用场景 |
|------|------------|---------|
| `get()` | 抛异常 | 确定值存在 |
| `orElse(T)` | 返回默认值 | 默认值计算成本低 |
| `orElseGet(Supplier)` | 执行 Supplier | 默认值计算成本高 |
| `orElseThrow()` | 抛异常 | 值必须存在 |

---

## 4. 判断与消费

### 4.1 isPresent()

**判断是否有值**

```java
Optional`String` opt = Optional.ofNullable(getValue());

if (opt.isPresent()) {
    System.out.println("有值：" + opt.get());
} else {
    System.out.println("值为空");
}
```

### 4.2 isEmpty()

**判断是否为空（Java 11+）**

```java
if (opt.isEmpty()) {
    System.out.println("值为空");
}
```

### 4.3 ifPresent()

**如果有值，执行 Consumer**

```java
Optional`String` opt = Optional.ofNullable(getValue());

// 传统方式
if (opt.isPresent()) {
    System.out.println(opt.get());
}

// Optional 方式
opt.ifPresent(value -> System.out.println(value));

// 方法引用
opt.ifPresent(System.out::println);
```

### 4.4 ifPresentOrElse()

**有值执行 Consumer，无值执行 Runnable（Java 9+）**

```java
opt.ifPresentOrElse(
    value -> System.out.println("有值：" + value),
    () -> System.out.println("值为空")
);
```

---

## 5. 转换与过滤

### 5.1 map()

**转换值（一对一）**

```java
Optional`String` opt = Optional.of("hello");

// 转换为大写
Optional`String` upper = opt.map(String::toUpperCase);
System.out.println(upper.orElse(""));  // HELLO

// 链式调用
Optional`Integer` length = opt
    .map(String::toUpperCase)
    .map(String::length);
System.out.println(length.orElse(0));  // 5

// null 安全：如果值为 null，返回空 Optional
Optional`String` nullOpt = Optional.ofNullable(null);
Optional`Integer` nullLength = nullOpt.map(String::length);
System.out.println(nullLength.isPresent());  // false
```

### 5.2 flatMap()

**转换并扁平化（用于返回 Optional 的函数）**

```java
class User {
    Optional<Address> getAddress();
}

class Address {
    Optional<City> getCity();
}

class City {
    String getName();
}

// ❌ 错误用法：map 会返回 Optional<Optional<City>>
// Optional<Optional<City>> cityOpt = userOpt.map(User::getAddress).map(Address::getCity);

// ✅ 正确用法：flatMap 扁平化
Optional<City> cityOpt = userOpt
    .flatMap(User::getAddress)
    .flatMap(Address::getCity);

// 获取城市名称
Optional`String` cityName = userOpt
    .flatMap(User::getAddress)
    .flatMap(Address::getCity)
    .map(City::getName);
```

### 5.3 filter()

**过滤值**

```java
Optional`Integer` opt = Optional.of(10);

// 过滤出大于 5 的值
Optional`Integer` filtered = opt.filter(n -> n > 5);
System.out.println(filtered.isPresent());  // true

// 过滤出偶数
Optional`Integer` even = opt.filter(n -> n % 2 == 0);
System.out.println(even.orElse(0));  // 10

// 链式调用
Optional`Integer` result = opt
    .filter(n -> n > 5)
    .filter(n -> n % 2 == 0)
    .filter(n -> n < 20);
System.out.println(result.orElse(0));  // 10
```

---

## 6. 实战案例

### 6.1 嵌套 null 检查重构

```java
// ❌ 重构前：嵌套 null 检查
public String getDepartmentName(Employee employee) {
    if (employee != null) {
        Department dept = employee.getDepartment();
        if (dept != null) {
            Company company = dept.getCompany();
            if (company != null) {
                return company.getName();
            }
        }
    }
    return "未知";
}

// ✅ 重构后：Optional 链式调用
public String getDepartmentName(Employee employee) {
    return Optional.ofNullable(employee)
        .map(Employee::getDepartment)
        .flatMap(Department::getCompany)
        .map(Company::getName)
        .orElse("未知");
}
```

### 6.2 数据库查询

```java
// Repository 层
public interface UserRepository {
    Optional`User` findById(String id);
    Optional`User` findByEmail(String email);
}

// Service 层
public class UserService {
    private UserRepository userRepository;
    
    // 查找用户，不存在抛异常
    public User getUserOrThrow(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("用户不存在：" + id));
    }
    
    // 查找用户，不存在返回 null
    public User getUserOrNull(String id) {
        return userRepository.findById(id).orElse(null);
    }
    
    // 查找用户，不存在创建新用户
    public User getUserOrCreate(String id, Supplier`User` creator) {
        return userRepository.findById(id)
            .orElseGet(creator);
    }
    
    // 处理用户
    public void processUser(String id) {
        userRepository.findById(id)
            .ifPresent(user -> {
                System.out.println("处理用户：" + user.getName());
                // 处理逻辑
            });
    }
}
```

### 6.3 配置读取

```java
class Config {
    private Map<String, String> properties = new HashMap<>();
    
    // 读取配置，必须存在
    public String getRequired(String key) {
        return Optional.ofNullable(properties.get(key))
            .orElseThrow(() -> new ConfigException("配置缺失：" + key));
    }
    
    // 读取配置，有默认值
    public String getWithDefault(String key, String defaultValue) {
        return Optional.ofNullable(properties.get(key))
            .orElse(defaultValue);
    }
    
    // 读取配置，转换为整数
    public Optional`Integer` getInt(String key) {
        return Optional.ofNullable(properties.get(key))
            .map(Integer::parseInt);
    }
}
```

### 6.4 Stream 与 Optional 结合

```java
List`User` users = getUsers();

// 查找第一个成年用户
Optional`User` firstAdult = users.stream()
    .filter(user -> user.getAge() >= 18)
    .findFirst();

// 获取所有成年用户的姓名
List`String` adultNames = users.stream()
    .filter(user -> user.getAge() >= 18)
    .map(User::getName)
    .collect(Collectors.toList());

// 查找最年长的用户
Optional`User` oldest = users.stream()
    .max(Comparator.comparingInt(User::getAge));

// 计算平均年龄
OptionalDouble avgAge = users.stream()
    .mapToInt(User::getAge)
    .average();
```

---

## 7. 最佳实践

### 7.1 推荐用法

```java
// ✅ 作为方法返回值
public Optional`User` findUser(String id) {
    return Optional.ofNullable(userDao.findById(id));
}

// ✅ 链式调用
String result = Optional.ofNullable(value)
    .map(String::trim)
    .filter(s -> !s.isEmpty())
    .orElse("default");

// ✅ 与 Stream 结合
Optional`User` user = users.stream()
    .filter(u -> u.getId().equals(id))
    .findFirst();
```

### 7.2 避免用法

```java
// ❌ 不要用 Optional 存储字段
class User {
    private Optional`String` name;  // ❌ 错误
}

// ✅ 正确：字段可以是 null，方法返回 Optional
class User {
    private String name;
    
    public Optional`String` getName() {
        return Optional.ofNullable(name);
    }
}

// ❌ 不要用 Optional 作为方法参数
public void process(Optional`String` value) {  // ❌ 错误
    // ...
}

// ✅ 正确：参数可以是 null 或使用重载
public void process(String value) {
    // ...
}

// ❌ 不要调用 get() 而不检查
String value = opt.get();  // ❌ 可能抛异常

// ✅ 正确：使用 orElse 或 ifPresent
String value = opt.orElse("default");
opt.ifPresent(v -> System.out.println(v));
```

### 7.3 性能考虑

```java
// orElse vs orElseGet
// orElse：立即计算，无论 Optional 是否为空
String value = opt.orElse(expensiveOperation());  // 总是执行

// orElseGet：延迟计算，只有为空才执行
String value = opt.orElseGet(() -> expensiveOperation());  // 按需执行

// 推荐：默认值计算成本高时用 orElseGet
String config = opt.orElseGet(() -> loadConfigFromDatabase());
```

---

## 📝 练习题

### 基础题

1. **创建 Optional**：使用三种方式创建 Optional（of、ofNullable、empty）

2. **获取值**：使用 orElse、orElseGet、orElseThrow 获取 Optional 的值

3. **转换**：使用 map 将 Optional`String` 转换为 Optional`Integer`（字符串长度）

### 进阶题

4. **嵌套 Optional**：使用 flatMap 处理嵌套的 Optional（User → Address → City）

5. **过滤**：使用 filter 过滤出大于 10 的偶数

6. **综合练习**：重构一个包含多层 null 检查的方法，使用 Optional 链式调用

---

## 🔗 参考资料

### 官方文档
- [Optional API](https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html)

### 推荐书籍
- 📚 《Effective Java》第 55 条：返回 Optional 而不是 null
- 📚 《Java 8 实战》第 9 章：Optional

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| Optional 创建 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 获取值方法 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| map/flatMap | ⭐⭐⭐⭐⭐ | 熟练运用 |
| filter | ⭐⭐⭐⭐ | 理解掌握 |
| 最佳实践 | ⭐⭐⭐⭐⭐ | 熟练运用 |

---

**上一章：** [Stream API](/java/basic/stream)  
**下一章：** [JUC 并发包](/java/basic/juc)

**最后更新**：2026-03-12
