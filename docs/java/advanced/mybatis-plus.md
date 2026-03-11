# MyBatis-Plus

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-04-25

---

## 📚 目录

[[toc]]

---

## 1. MyBatis-Plus 概述

### 1.1 什么是 MyBatis-Plus

**MyBatis-Plus** 是 MyBatis 的增强工具，在 MyBatis 基础上只做增强不做改变。

**核心特性：**
- 无侵入：只做增强不做改变
- 损耗小：启动即会自动注入基本 CURD
- 强大的 CRUD 操作：内置通用 Mapper、通用 Service
- 支持 Lambda 形式调用
- 支持主键自动生成
- 支持 ActiveRecord 模式
- 支持自定义全局通用方法
- 支持动态 SQL

### 1.2 与 MyBatis 的区别

| 特性 | MyBatis | MyBatis-Plus |
|------|---------|--------------|
| CRUD | 手写 SQL | 内置通用 Mapper |
| 分页 | 需要插件 | 内置分页插件 |
| 条件构造 | 手写 XML | Wrapper 条件构造器 |
| 代码生成 | 手动 | 内置代码生成器 |
| 主键策略 | 手动配置 | 支持多种策略 |

---

## 2. 快速开始

### 2.1 依赖配置

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.4</version>
</dependency>
```

### 2.2 数据库配置

```yaml
mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true  # 驼峰转下划线
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  global-config:
    db-config:
      id-type: assign_id  # 主键策略
      logic-delete-field: deleted  # 逻辑删除字段名
      logic-delete-value: 1  # 逻辑已删除值
      logic-not-delete-value: 0  # 逻辑未删除值
```

### 2.3 实体类

```java
@Data
@TableName("user")
public class User {
    
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    private String username;
    
    private String email;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}
```

### 2.4 Mapper 接口

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 继承 BaseMapper 后，无需编写 XML，即可使用 CRUD 方法
}
```

### 2.5 Service 层

```java
public interface UserService extends IService<User> {
}

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
    implements UserService {
}
```

---

## 3. CRUD 操作

### 3.1 插入

```java
// 普通插入
User user = new User();
user.setUsername("张三");
user.setEmail("zhangsan@example.com");
userMapper.insert(user);

// 批量插入
List<User> userList = Arrays.asList(user1, user2, user3);
userMapper.insertBatch(userList);  // 需要自定义
```

### 3.2 删除

```java
// 根据 ID 删除
userMapper.deleteById(1L);

// 根据条件删除
userMapper.delete(new LambdaQueryWrapper<User>()
    .eq(User::getUsername, "张三"));

// 批量删除
userMapper.deleteBatchIds(Arrays.asList(1L, 2L, 3L));
```

### 3.3 更新

```java
// 根据 ID 更新
User user = new User();
user.setId(1L);
user.setEmail("new@example.com");
userMapper.updateById(user);

// 根据条件更新
User updateObj = new User();
updateObj.setEmail("new@example.com");
LambdaUpdateWrapper<User> wrapper = new LambdaUpdateWrapper<>();
wrapper.eq(User::getUsername, "张三");
userMapper.update(updateObj, wrapper);

// Set 表达式
userMapper.update(null, new LambdaUpdateWrapper<User>()
    .setSql("email = 'new@example.com'")
    .eq(User::getId, 1L));
```

### 3.4 查询

```java
// 根据 ID 查询
User user = userMapper.selectById(1L);

// 批量查询
List<User> users = userMapper.selectBatchIds(Arrays.asList(1L, 2L, 3L));

// 根据条件查询
List<User> users = userMapper.selectList(new LambdaQueryWrapper<User>()
    .eq(User::getStatus, 1)
    .like(User::getUsername, "张")
    .orderByDesc(User::getCreateTime));

// 分页查询
Page<User> page = new Page<>(1, 10);
IPage<User> userPage = userMapper.selectPage(page, 
    new LambdaQueryWrapper<User>().eq(User::getStatus, 1));
```

---

## 4. 条件构造器

### 4.1 QueryWrapper

```java
// 查询 name 包含"张"，age 大于 18 的用户
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.like("name", "张").gt("age", 18);
List<User> users = userMapper.selectList(wrapper);
```

### 4.2 LambdaQueryWrapper（推荐）

```java
// 类型安全，支持 Lambda
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.like(User::getUsername, "张")
       .gt(User::getAge, 18)
       .in(User::getStatus, 1, 2)
       .orderByDesc(User::getCreateTime);

List<User> users = userMapper.selectList(wrapper);
```

### 4.3 常用方法

```java
// 等于
wrapper.eq(User::getStatus, 1);

// 不等于
wrapper.ne(User::getStatus, 0);

// 大于/小于
wrapper.gt(User::getAge, 18);
wrapper.lt(User::getAge, 60);
wrapper.ge(User::getAge, 18);  // >=
wrapper.le(User::getAge, 60);  // <=

// LIKE
wrapper.like(User::getUsername, "张");
wrapper.likeLeft(User::getUsername, "张");  // %张
wrapper.likeRight(User::getUsername, "张"); // 张%

// IN
wrapper.in(User::getStatus, 1, 2, 3);
wrapper.notIn(User::getStatus, 0);

// BETWEEN
wrapper.between(User::getAge, 18, 60);

// IS NULL / IS NOT NULL
wrapper.isNull(User::getEmail);
wrapper.isNotNull(User::getPhone);

// ORDER BY
wrapper.orderByAsc(User::getCreateTime);
wrapper.orderByDesc(User::getUpdateTime);
```

### 4.4 条件拼接

```java
// and
wrapper.eq(User::getStatus, 1)
       .and(w -> w.like(User::getUsername, "张")
                  .or()
                  .like(User::getEmail, "张"));

// or
wrapper.eq(User::getStatus, 1)
       .or()
       .eq(User::getStatus, 2);

// nested
wrapper.nested(w -> w.eq(User::getType, 1)
                     .or()
                     .eq(User::getType, 2))
       .eq(User::getStatus, 1);
```

---

## 5. 分页插件

### 5.1 配置分页插件

```java
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        // 乐观锁插件
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        return interceptor;
    }
}
```

### 5.2 分页查询

```java
// 简单分页
Page<User> page = new Page<>(1, 10);
IPage<User> userPage = userMapper.selectPage(page, 
    new LambdaQueryWrapper<User>().eq(User::getStatus, 1));

// 获取结果
List<User> records = userPage.getRecords();  // 数据列表
long total = userPage.getTotal();            // 总记录数
long pages = userPage.getPages();            // 总页数
long current = userPage.getCurrent();        // 当前页
long size = userPage.getSize();              // 每页大小
```

### 5.3 自定义分页 SQL

```java
// Mapper 接口
@Mapper
public interface UserMapper extends BaseMapper<User> {
    IPage<User> selectUserPage(Page<User> page, 
                               @Param("status") Integer status);
}

// XML
<select id="selectUserPage" resultType="com.example.User">
    SELECT u.*, o.name AS org_name
    FROM user u
    LEFT JOIN organization o ON u.org_id = o.id
    WHERE u.status = #{status}
</select>
```

---

## 6. 自动填充

### 6.1 实现 MetaObjectHandler

```java
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "createBy", Long.class, getCurrentUserId());
    }
    
    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        this.strictUpdateFill(metaObject, "updateBy", Long.class, getCurrentUserId());
    }
    
    private Long getCurrentUserId() {
        // 从 SecurityContext 获取当前用户 ID
        return 1L;
    }
}
```

### 6.2 实体类配置

```java
@Data
@TableName("user")
public class User {
    
    @TableId
    private Long id;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableField(fill = FieldFill.INSERT)
    private Long createBy;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateBy;
}
```

---

## 7. 乐观锁

### 7.1 配置乐观锁插件

```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
    return interceptor;
}
```

### 7.2 实体类配置

```java
@Data
@TableName("product")
public class Product {
    
    @TableId
    private Long id;
    
    private String name;
    
    private Integer stock;
    
    @Version
    private Integer version;  // 乐观锁版本号
}
```

### 7.3 使用示例

```java
// 1. 查询商品
Product product = productMapper.selectById(1L);

// 2. 修改库存
product.setStock(product.getStock() - 1);

// 3. 更新（会自动检查版本号）
int result = productMapper.updateById(product);

if (result == 0) {
    // 更新失败，版本号已被修改
    throw new OptimisticLockException("库存已被修改");
}
```

---

## 8. 逻辑删除

### 8.1 全局配置

```yaml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
```

### 8.2 局部配置

```java
@Data
@TableName("user")
public class User {
    
    @TableId
    private Long id;
    
    private String username;
    
    @TableLogic  // 逻辑删除注解
    private Integer deleted;
}
```

### 8.3 效果

```java
// 删除操作实际执行的是 UPDATE
userMapper.deleteById(1L);
// 执行：UPDATE user SET deleted=1 WHERE id=1 AND deleted=0

// 查询自动添加条件
userMapper.selectById(1L);
// 执行：SELECT * FROM user WHERE id=1 AND deleted=0
```

---

## 9. 代码生成器

### 9.1 依赖

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-generator</artifactId>
    <version>3.5.4</version>
</dependency>
<dependency>
    <groupId>org.apache.velocity</groupId>
    <artifactId>velocity-engine-core</artifactId>
    <version>2.3</version>
</dependency>
```

### 9.2 快速生成

```java
public class CodeGenerator {
    
    public static void main(String[] args) {
        FastAutoGenerator.create("jdbc:mysql://localhost:3306/mydb?useSSL=false", 
                "root", "password")
            .globalConfig(builder -> builder
                .author("涛哥")
                .outputDir("src/main/java")
                .disableOpenDir()
                .commentDate("yyyy-MM-dd"))
            .packageConfig(builder -> builder
                .parent("com.example")
                .moduleName("system")
                .entity("entity")
                .mapper("mapper")
                .service("service")
                .serviceImpl("service.impl")
                .controller("controller"))
            .strategyConfig(builder -> builder
                .addInclude("user", "role", "permission")
                .entityBuilder()
                    .enableLombok()
                    .enableTableFieldAnnotation()
                    .logicDeleteColumnName("deleted")
                .mapperBuilder()
                    .enableBaseResultMap()
                    .enableBaseColumnList()
                .serviceBuilder()
                    .formatServiceFileName("%sService")
                    .formatServiceImplFileName("%sServiceImpl")
                .controllerBuilder()
                    .enableRestStyle())
            .execute();
    }
}
```

---

## 10. 最佳实践

### 10.1 命名规范

```java
// Mapper 接口
public interface UserMapper extends BaseMapper<User> { }

// Service 接口
public interface UserService extends IService<User> { }

// Service 实现
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
    implements UserService { }
```

### 10.2 避免 N+1 问题

```java
// ❌ 避免在循环中查询
List<Order> orders = orderMapper.selectList(wrapper);
for (Order order : orders) {
    User user = userMapper.selectById(order.getUserId());  // N 次查询
}

// ✅ 使用 JOIN 或批量查询
List<Order> orders = orderMapper.selectList(wrapper);
List<Long> userIds = orders.stream()
    .map(Order::getUserId)
    .distinct()
    .collect(Collectors.toList());
List<User> users = userMapper.selectBatchIds(userIds);  // 1 次查询
```

### 10.3 合理使用缓存

```java
// 启用二级缓存
@Mapper
@CacheNamespace
public interface UserMapper extends BaseMapper<User> { }

// 或使用 Redis 缓存
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
    implements UserService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Override
    @Cacheable(value = "user", key = "#id")
    public User getById(Long id) {
        return super.getById(id);
    }
}
```

---

## 📝 待办事项

- [ ] MyBatis-Plus 基础配置
- [ ] CRUD 操作实战
- [ ] 条件构造器使用
- [ ] 分页插件配置
- [ ] 自动填充实现
- [ ] 乐观锁实战
- [ ] 代码生成器使用
- [ ] 完整项目集成

---

**推荐资源：**
- 📖 MyBatis-Plus 官方文档：https://baomidou.com
- 🔗 GitHub：https://github.com/baomidou/mybatis-plus
