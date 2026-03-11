# 代码规范

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-06-01

---

## 📚 目录

[[toc]]

---

## 1. 命名规范

### 1.1 类名

```java
// ✅ 大驼峰命名（UpperCamelCase）
public class UserService { }
public class OrderController { }
public class UserDTO { }
public class UserVO { }
public class UserQuery { }

// ❌ 避免
public class userService { }
public class user_service { }
```

### 1.2 方法名、变量名

```java
// ✅ 小驼峰命名（lowerCamelCase）
public void createUser() { }
public List<User> findAllUsers() { }
private String userName;
private Integer orderCount;

// ❌ 避免
public void Create_User() { }
private String UserName;
```

### 1.3 常量名

```java
// ✅ 全大写，下划线分隔
public static final int MAX_RETRY_COUNT = 3;
public static final String DEFAULT_CHARSET = "UTF-8";

// 枚举
public enum OrderStatus {
    PENDING, PAID, SHIPPED, COMPLETED
}
```

### 1.4 包名

```java
// ✅ 全小写，单数名词
package com.example.user.service;
package com.example.order.controller;
package com.example.common.exception;
```

---

## 2. 代码格式

### 2.1 缩进与空格

```java
// ✅ 4 个空格缩进（不要 Tab）
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    public User getUser(Long id) {
        if (id == null) {
            return null;
        }
        return userMapper.selectById(id);
    }
}

// ✅ 运算符两侧空格
int sum = a + b;
for (int i = 0; i < 10; i++) { }

// ✅ 方法调用无空格
object.method(arg1, arg2);
```

### 2.2 空行

```java
// ✅ 类成员之间空一行
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    public User getUser(Long id) { }
    
    public void createUser(User user) { }
}

// ✅ 方法内逻辑块之间空一行
public void process() {
    // 准备数据
    List<User> users = getUsers();
    
    // 处理数据
    for (User user : users) {
        processUser(user);
    }
    
    // 保存结果
    saveResults();
}
```

### 2.3 一行代码长度

```java
// ✅ 单行不超过 120 字符
// ❌ 过长时换行
String sql = "SELECT * FROM user WHERE id = " + id + 
             " AND status = " + status + 
             " AND create_time > " + startTime;
```

---

## 3. 注释规范

### 3.1 类注释

```java
/**
 * 用户服务类
 * <p>
 * 提供用户相关的业务逻辑处理
 * </p>
 *
 * @author 涛哥
 * @since 2026-03-11
 */
public class UserService { }
```

### 3.2 方法注释

```java
/**
 * 根据 ID 查询用户
 *
 * @param id 用户 ID
 * @return 用户信息，不存在返回 null
 * @throws IllegalArgumentException 当 ID 为空时抛出
 */
public User getUserById(Long id) {
    if (id == null) {
        throw new IllegalArgumentException("用户 ID 不能为空");
    }
    return userMapper.selectById(id);
}
```

### 3.3 行内注释

```java
// ✅ 注释在代码上方
// 计算订单总金额
BigDecimal totalAmount = calculateTotalAmount(order);

// ❌ 避免行尾注释
BigDecimal totalAmount = calculateTotalAmount(order); // 计算总金额

// ✅ 复杂逻辑注释
if (user.getStatus() == 1 && user.getAge() >= 18) {
    // 用户状态正常且已成年，可以下单
    order.setStatus(OrderStatus.PENDING);
}
```

---

## 4. 最佳实践

### 4.1 异常处理

```java
// ✅ 捕获具体异常
try {
    processOrder(order);
} catch (InsufficientStockException e) {
    log.error("库存不足", e);
    throw new BusinessException("库存不足");
}

// ❌ 避免捕获所有异常
try {
    processOrder(order);
} catch (Exception e) {
    e.printStackTrace();  // ❌ 不要打印堆栈
}
```

### 4.2 集合处理

```java
// ✅ 指定初始容量
List<User> users = new ArrayList<>(16);
Map<String, Object> map = new HashMap<>(32);

// ✅ 使用集合工具类
if (CollectionUtils.isEmpty(users)) { }
if (StringUtils.isBlank(name)) { }

// ✅ 遍历
for (User user : users) { }
users.forEach(this::processUser);
```

### 4.3 字符串处理

```java
// ✅ 使用 StringBuilder
StringBuilder sb = new StringBuilder();
for (String s : list) {
    sb.append(s).append(",");
}

// ✅ 使用 String.join
String result = String.join(",", list);

// ❌ 避免字符串拼接
String result = "";
for (String s : list) {
    result += s + ",";  // 性能差
}
```

### 4.4 资源关闭

```java
// ✅ try-with-resources
try (FileInputStream fis = new FileInputStream(file);
     BufferedReader br = new BufferedReader(new InputStreamReader(fis))) {
    return br.readLine();
}

// ❌ 手动关闭
FileInputStream fis = null;
try {
    fis = new FileInputStream(file);
} finally {
    if (fis != null) {
        fis.close();  // 可能抛出异常
    }
}
```

---

## 5. 工具配置

### 5.1 Checkstyle

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-checkstyle-plugin</artifactId>
    <version>3.3.1</version>
    <configuration>
        <configLocation>checkstyle.xml</configLocation>
        <failsOnError>true</failsOnError>
    </configuration>
</plugin>
```

### 5.2 Spotless（代码格式化）

```xml
<plugin>
    <groupId>com.diffplug.spotless</groupId>
    <artifactId>spotless-maven-plugin</artifactId>
    <version>2.41.0</version>
    <configuration>
        <java>
            <googleJavaFormat>
                <version>1.18.1</version>
                <style>GOOGLE</style>
            </googleJavaFormat>
        </java>
    </configuration>
</plugin>
```

### 5.3 SonarQube

```xml
<plugin>
    <groupId>org.sonarsource.scanner.maven</groupId>
    <artifactId>sonar-maven-plugin</artifactId>
    <version>3.10.0.2594</version>
</plugin>
```

```bash
# 执行分析
mvn clean verify sonar:sonar \
  -Dsonar.projectKey=my-project \
  -Dsonar.host.url=http://localhost:9000
```

---

## 6. 代码审查清单

- [ ] 命名清晰易懂
- [ ] 方法不超过 50 行
- [ ] 类不超过 500 行
- [ ] 无重复代码（DRY）
- [ ] 异常处理恰当
- [ ] 资源正确关闭
- [ ] 有必要的注释
- [ ] 无 System.out.println
- [ ] 无魔法数字
- [ ] 日志级别正确

---

## 📝 待办事项

- [ ] 学习阿里巴巴 Java 开发手册
- [ ] 配置 Checkstyle
- [ ] 配置 Spotless
- [ ] 搭建 SonarQube
- [ ] 制定团队代码规范
- [ ] 代码审查实践

---

**推荐资源：**
- 📚 《阿里巴巴 Java 开发手册》
- 📚 《Clean Code》
- 📚 《Effective Java》
- 🔗 Google Java Style Guide
