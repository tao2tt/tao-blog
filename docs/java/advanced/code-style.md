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

## 5. 工具配置

### 5.1 Checkstyle

```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-checkstyle-plugin</artifactId>
    <version>3.3.1</version>
    <configuration>
        <configLocation>checkstyle.xml</configLocation>
        <failsOnError>true</failsOnError>
        <consoleOutput>true</consoleOutput>
        <encoding>UTF-8</encoding>
    </configuration>
    <executions>
        <execution>
            <id>validate</id>
            <phase>validate</phase>
            <goals>
                <goal>check</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

```xml
<!-- checkstyle.xml -->
<?xml version="1.0"?>
<!DOCTYPE module PUBLIC
    "-//Checkstyle//DTD Checkstyle Configuration 1.3//EN"
    "https://checkstyle.org/dtds/configuration_1_3.dtd">

<module name="Checker">
    <property name="charset" value="UTF-8"/>
    <property name="severity" value="error"/>
    
    <!-- 文件检查 -->
    <module name="FileTabCharacter">
        <property name="eachLine" value="true"/>
    </module>
    
    <module name="NewlineAtEndOfFile"/>
    
    <!-- 代码检查 -->
    <module name="TreeWalker">
        <!-- 命名规范 -->
        <module name="PackageName">
            <property name="format" value="^[a-z]+(\.[a-z][a-z0-9]*)*$"/>
        </module>
        
        <module name="TypeName">
            <property name="format" value="^[A-Z][a-zA-Z0-9]*$"/>
        </module>
        
        <module name="MethodName">
            <property name="format" value="^[a-z][a-zA-Z0-9]*$"/>
        </module>
        
        <module name="ParameterName">
            <property name="format" value="^[a-z][a-zA-Z0-9]*$"/>
        </module>
        
        <module name="LocalVariableName">
            <property name="format" value="^[a-z][a-zA-Z0-9]*$"/>
        </module>
        
        <module name="ConstantName">
            <property name="format" value="^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$"/>
        </module>
        
        <!-- 代码格式 -->
        <module name="LineLength">
            <property name="max" value="120"/>
        </module>
        
        <module name="NoLineWrap"/>
        
        <module name="EmptyBlock">
            <property name="option" value="TEXT"/>
        </module>
        
        <module name="NeedBraces"/>
        
        <module name="LeftCurly"/>
        <module name="RightCurly"/>
        
        <!-- 导入 -->
        <module name="AvoidStarImport"/>
        <module name="RedundantImport"/>
        <module name="UnusedImports"/>
        
        <!-- 注释 -->
        <module name="JavadocMethod">
            <property name="allowMissingParamTags" value="true"/>
            <property name="allowMissingReturnTag" value="true"/>
        </module>
        
        <!-- 复杂度 -->
        <module name="CyclomaticComplexity">
            <property name="max" value="10"/>
        </module>
        
        <module name="JavaNCSS">
            <property name="methodMaximum" value="50"/>
        </module>
        
        <!-- 最佳实践 -->
        <module name="EmptyStatement"/>
        <module name="EqualsHashCode"/>
        <module name="MissingSwitchDefault"/>
        <module name="SimplifyBooleanExpression"/>
        <module name="SimplifyBooleanReturn"/>
    </module>
</module>
```

### 5.2 Spotless（代码格式化）

```xml
<!-- pom.xml -->
<plugin>
    <groupId>com.diffplug.spotless</groupId>
    <artifactId>spotless-maven-plugin</artifactId>
    <version>2.41.0</version>
    <configuration>
        <formats>
            <format>
                <includes>
                    <include>*.md</include>
                    <include>.gitignore</include>
                </includes>
                <trimTrailingWhitespace/>
                <endWithNewline/>
                <indent>
                    <spaces>true</spaces>
                    <spacesPerTab>4</spacesPerTab>
                </indent>
            </format>
        </formats>
        <java>
            <googleJavaFormat>
                <version>1.18.1</version>
                <style>GOOGLE</style>
            </googleJavaFormat>
            
            <importOrder>
                <order>java,javax,org,com,com.diffplug,</order>
            </importOrder>
            
            <removeUnusedImports/>
            
            <toggleOffOn/>
            
            <trimTrailingWhitespace/>
            
            <endWithNewline/>
        </java>
    </configuration>
    <executions>
        <execution>
            <goals>
                <goal>check</goal>
            </goals>
            <phase>compile</phase>
        </execution>
    </executions>
</plugin>
```

```bash
# 格式化代码
mvn spotless:apply

# 检查格式
mvn spotless:check
```

### 5.3 SonarQube

```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.sonarsource.scanner.maven</groupId>
    <artifactId>sonar-maven-plugin</artifactId>
    <version>3.10.0.2594</version>
</plugin>

<!-- JaCoCo 覆盖率 -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <id>prepare-agent</id>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

```properties
# sonar-project.properties
sonar.projectKey=my-project
sonar.projectName=My Project
sonar.projectVersion=1.0

sonar.sources=src/main/java
sonar.tests=src/test/java
sonar.java.binaries=target/classes
sonar.java.coveragePlugin=jacoco
sonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml

# 编码规范
sonar.java.source=17

# 排除文件
sonar.exclusions=**/generated/**,**/entity/**,**/dto/**

# 质量阈
sonar.qualitygate.wait=true
```

```bash
# 本地运行 SonarQube
docker run -d --name sonarqube \
  -p 9000:9000 \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  sonarqube:lts

# 执行分析
mvn clean verify sonar:sonar \
  -Dsonar.projectKey=my-project \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=admin \
  -Dsonar.password=admin
```

### 5.4 IDEA 配置

```xml
<!-- .editorconfig -->
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 4

[*.md]
trim_trailing_whitespace = false

[*.yml]
indent_size = 2

[*.xml]
indent_size = 4

[*.properties]
indent_style = space
indent_size = 4

[*.java]
indent_size = 4
continuation_indent_size = 4
```

```xml
<!-- IDEA 代码模板 -->
<code_scheme name="Project" version="173">
  <JavaCodeStyleSettings>
    <option name="CLASS_COUNT_TO_USE_IMPORT_ON_DEMAND" value="99"/>
    <option name="NAMES_COUNT_TO_USE_IMPORT_ON_DEMAND" value="99"/>
    <option name="PACKAGES_TO_USE_IMPORT_ON_DEMAND">
      <value/>
    </option>
    <option name="IMPORT_LAYOUT_TABLE">
      <value>
        <package name="" withSubpackages="true" static="true"/>
        <emptyLine/>
        <package name="java" withSubpackages="true" static="false"/>
        <emptyLine/>
        <package name="javax" withSubpackages="true" static="false"/>
        <emptyLine/>
        <package name="org" withSubpackages="true" static="false"/>
        <emptyLine/>
        <package name="com" withSubpackages="true" static="false"/>
        <emptyLine/>
        <package name="" withSubpackages="true" static="false"/>
      </value>
    </option>
  </JavaCodeStyleSettings>
  
  <codeStyleSettings language="JAVA">
    <option name="RIGHT_MARGIN" value="120"/>
    <option name="KEEP_LINE_BREAKS" value="false"/>
    <option name="KEEP_FIRST_COLUMN_COMMENT" value="false"/>
    <option name="ALIGN_MULTILINE_PARAMETERS" value="false"/>
    <option name="SPACE_WITHIN_ARRAY_INITIALIZER_BRACES" value="true"/>
    <option name="SPACE_BEFORE_ARRAY_INITIALIZER_LBRACE" value="true"/>
  </codeStyleSettings>
</code_scheme>
```

---

## 6. 代码审查清单

### 6.1 基础检查

- [ ] 命名清晰易懂（类、方法、变量）
- [ ] 方法不超过 50 行
- [ ] 类不超过 500 行
- [ ] 无重复代码（DRY 原则）
- [ ] 无魔法数字（使用常量）
- [ ] 无 System.out.println（使用日志）
- [ ] 无空 catch 块
- [ ] 无注释掉的代码

### 6.2 异常处理

- [ ] 捕获具体异常，不捕获 Exception
- [ ] 异常有明确处理（记录日志/抛出/转换）
- [ ] 不吞掉异常（至少记录日志）
- [ ] 自定义异常有意义
- [ ] 资源正确关闭（try-with-resources）

### 6.3 集合处理

- [ ] 指定初始容量（避免扩容）
- [ ] 使用集合工具类（CollectionUtils）
- [ ] 遍历时不修改集合（使用 Iterator.remove）
- [ ] Map 遍历使用 entrySet（不用 keySet+get）
- [ ] 集合判空使用 isEmpty()（不用 size==0）

### 6.4 字符串处理

- [ ] 使用 StringBuilder 拼接（循环中）
- [ ] 使用 String.join（集合转字符串）
- [ ] 字符串比较使用 equals（不用==）
- [ ] 常量放左边（防止 NPE）
- [ ] 使用 StringUtils 工具类

### 6.5 并发处理

- [ ] 线程池使用有界队列
- [ ] 线程池指定线程名前缀
- [ ] 不使用 Executors 创建线程池
- [ ] ThreadLocal 使用后 remove
- [ ] 锁的范围尽可能小
- [ ] 使用并发集合（ConcurrentHashMap）

### 6.6 数据库操作

- [ ] SQL 使用参数化查询（防注入）
- [ ] 批量操作使用批量方法
- [ ] 事务粒度适中（不大不小）
- [ ] 查询指定字段（不用 SELECT *）
- [ ] 索引字段避免函数操作
- [ ] 分页查询避免深分页

### 6.7 日志规范

- [ ] 日志级别正确（ERROR/WARN/INFO/DEBUG）
- [ ] 异常记录堆栈（log.error(msg, e)）
- [ ] 日志参数使用占位符（不用拼接）
- [ ] 敏感信息脱敏（密码/手机号）
- [ ] 关键操作有日志（入口/出口/异常）

### 6.8 安全规范

- [ ] 用户输入校验（长度/格式/范围）
- [ ] SQL 防注入（参数化查询）
- [ ] XSS 防护（转义输出）
- [ ] CSRF 防护（Token 验证）
- [ ] 密码加密存储（BCrypt）
- [ ] 敏感数据加密传输（HTTPS）

---

## 7. CI/CD 集成

### 7.1 GitHub Actions

```yaml
# .github/workflows/code-quality.yml
name: Code Quality

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  checkstyle:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Java
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven
    
    - name: Checkstyle
      run: mvn checkstyle:check
  
  spotless:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Java
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven
    
    - name: Spotless Check
      run: mvn spotless:check
  
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Java
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven
    
    - name: Test with Coverage
      run: mvn test jacoco:report
    
    - name: Upload Coverage
      uses: codecov/codecov-action@v3
      with:
        file: target/site/jacoco/jacoco.xml
  
  sonarqube:
    runs-on: ubuntu-latest
    needs: [test]
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    
    - name: Setup Java
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven
    
    - name: SonarQube Scan
      run: mvn sonar:sonar
      env:
        SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### 7.2 质量阈

```yaml
# SonarQube 质量阈配置
quality_gate:
  conditions:
    - metric: coverage
      op: LT
      error: 80  # 覆盖率 < 80%
    
    - metric: new_coverage
      op: LT
      error: 80  # 新增代码覆盖率 < 80%
    
    - metric: bugs
      op: GT
      error: 0  # Bug 数 > 0
    
    - metric: vulnerabilities
      op: GT
      error: 0  # 安全漏洞 > 0
    
    - metric: code_smells
      op: GT
      error: 50  # 代码异味 > 50
    
    - metric: duplicated_lines_density
      op: GT
      error: 3  # 重复代码 > 3%
    
    - metric: blocker_issues
      op: GT
      error: 0  # 阻断问题 > 0
    
    - metric: critical_issues
      op: GT
      error: 0  # 严重问题 > 0
```

---

## 8. 最佳实践

### 8.1 代码规范落地

```
1. 制定规范（团队讨论通过）
2. 工具固化（Checkstyle/Spotless）
3. CI 检查（不通过不能合并）
4. 定期审查（Code Review）
5. 持续改进（根据实践调整）
```

### 8.2 Code Review 流程

```
1. 作者自审（提交前检查清单）
2. 自动检查（CI 流水线）
3. 同事审查（至少 1 人批准）
4. 修改反馈（及时响应）
5. 合并代码（ squash merge）
```

### 8.3 规范模板

```java
/**
 * 类说明
 *
 * @author 作者
 * @since 2026-03-11
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 用户 ID
     */
    private Long id;
    
    /**
     * 用户名
     */
    private String username;
    
    /**
     * 邮箱
     */
    private String email;
    
    /**
     * 创建时间
     */
    private LocalDateTime createTime;
}
```

---

## 📝 实战清单

**规范学习：**
- [ ] 阿里巴巴 Java 开发手册
- [ ] Clean Code 阅读
- [ ] Effective Java 阅读
- [ ] 团队规范制定

**工具配置：**
- [ ] Checkstyle 配置
- [ ] Spotless 配置
- [ ] SonarQube 部署
- [ ] IDEA 代码模板
- [ ] EditorConfig 配置

**CI/CD 集成：**
- [ ] GitHub Actions 配置
- [ ] 质量阈配置
- [ ] 覆盖率上报
- [ ] 自动阻断机制

**代码审查：**
- [ ] 审查清单制定
- [ ] 审查流程规范
- [ ] 定期审查会议
- [ ] 问题跟踪改进

**持续改进：**
- [ ] 规范版本管理
- [ ] 最佳实践沉淀
- [ ] 技术培训分享
- [ ] 规范执行检查

---

**推荐资源：**
- 📚 《阿里巴巴 Java 开发手册》
- 📚 《Clean Code》
- 📚 《Effective Java》
- 📚 《代码大全》
- 🔗 Google Java Style Guide
- 🔗 SonarQube 官方文档
- 🛠️ Checkstyle：https://checkstyle.org
- 🛠️ Spotless：https://github.com/diffplug/spotless
