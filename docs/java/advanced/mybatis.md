# MyBatis

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-05-20

---

## 📚 目录

1. [MyBatis 概述](#1-mybatis-概述)
2. [核心配置](#2-核心配置)
3. [Mapper 映射](#3-mapper-映射)
4. [动态 SQL](#4-动态-sql)
5. [缓存机制](#5-缓存机制)
6. [插件开发](#6-插件开发)
7. [MyBatis-Plus](#7-mybatis-plus)
8. [最佳实践](#8-最佳实践)

---

## 1. MyBatis 概述

### 1.1 什么是 MyBatis

**MyBatis** 是一款优秀的持久层框架，支持自定义 SQL、存储过程以及高级映射。

**核心特点：**
- ✅ **SQL 与代码分离**：XML 或注解配置
- ✅ **支持动态 SQL**：灵活的 SQL 拼接
- ✅ **结果映射**：自动映射到 Java 对象
- ✅ **缓存支持**：一级缓存、二级缓存
- ✅ **插件扩展**：拦截器机制

### 1.2 MyBatis vs Hibernate

| 对比项 | MyBatis | Hibernate |
|--------|---------|-----------|
| **SQL 控制** | 手动编写 SQL | 自动生成 SQL |
| **学习成本** | 低 | 高 |
| **灵活性** | 高 | 低 |
| **性能优化** | 容易 | 较难 |
| **适用场景** | 复杂查询、高并发 | 简单 CRUD |

---

## 2. 核心配置

### 2.1 配置文件

```xml
<!-- mybatis-config.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    
    <!-- 1. 属性配置 -->
    <properties resource="db.properties">
        <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
        <property name="url" value="jdbc:mysql://localhost:3306/mydb"/>
        <property name="username" value="root"/>
        <property name="password" value="123456"/>
    </properties>
    
    <!-- 2. 设置 -->
    <settings>
        <setting name="mapUnderscoreToCamelCase" value="true"/>  <!-- 驼峰命名 -->
        <setting name="lazyLoadingEnabled" value="true"/>        <!-- 懒加载 -->
        <setting name="cacheEnabled" value="true"/>              <!-- 缓存 -->
        <setting name="logImpl" value="SLF4J"/>                  <!-- 日志 -->
    </settings>
    
    <!-- 3. 类型别名 -->
    <typeAliases>
        <package name="com.example.entity"/>
    </typeAliases>
    
    <!-- 4. 插件 -->
    <plugins>
        <plugin interceptor="com.example.plugin.MyPlugin"/>
    </plugins>
    
    <!-- 5. 环境配置 -->
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="${driver}"/>
                <property name="url" value="${url}"/>
                <property name="username" value="${username}"/>
                <property name="password" value="${password}"/>
            </dataSource>
        </environment>
    </environments>
    
    <!-- 6. Mapper 映射 -->
    <mappers>
        <mapper resource="mapper/UserMapper.xml"/>
        <package name="com.example.mapper"/>
    </mappers>
</configuration>
```

### 2.2 SpringBoot 整合

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>3.0.3</version>
</dependency>
```

```yaml
# application.yml
mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.example.entity
  configuration:
    map-underscore-to-camel-case: true
    cache-enabled: true
    lazy-loading-enabled: true
    log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl
```

---

## 3. Mapper 映射

### 3.1 Mapper XML

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">
    
    <!-- 1. 结果映射 -->
    <resultMap id="BaseResultMap" type="com.example.entity.User">
        <id column="id" property="id"/>
        <result column="username" property="username"/>
        <result column="email" property="email"/>
        <result column="age" property="age"/>
        <result column="create_time" property="createTime"/>
    </resultMap>
    
    <!-- 2. 通用列 -->
    <sql id="Base_Column_List">
        id, username, email, age, create_time
    </sql>
    
    <!-- 3. 查询单个 -->
    <select id="getById" resultMap="BaseResultMap">
        SELECT <include refid="Base_Column_List"/>
        FROM user
        WHERE id = #{id}
    </select>
    
    <!-- 4. 查询列表 -->
    <select id="list" resultMap="BaseResultMap">
        SELECT <include refid="Base_Column_List"/>
        FROM user
        WHERE is_deleted = 0
        ORDER BY create_time DESC
    </select>
    
    <!-- 5. 条件查询 -->
    <select id="listByCondition" resultMap="BaseResultMap">
        SELECT <include refid="Base_Column_List"/>
        FROM user
        <where>
            is_deleted = 0
            <if test="username != null and username != ''">
                AND username LIKE CONCAT('%', #{username}, '%')
            </if>
            <if test="email != null and email != ''">
                AND email = #{email}
            </if>
            <if test="minAge != null">
                AND age >= #{minAge}
            </if>
            <if test="maxAge != null">
                AND age <= #{maxAge}
            </if>
        </where>
        ORDER BY create_time DESC
    </select>
    
    <!-- 6. 分页查询 -->
    <select id="page" resultMap="BaseResultMap">
        SELECT <include refid="Base_Column_List"/>
        FROM user
        WHERE is_deleted = 0
        ORDER BY create_time DESC
        LIMIT #{offset}, #{limit}
    </select>
    
    <!-- 7. 插入 -->
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO user (username, email, age, create_time)
        VALUES (#{username}, #{email}, #{age}, NOW())
    </insert>
    
    <!-- 8. 批量插入 -->
    <insert id="batchInsert">
        INSERT INTO user (username, email, age, create_time)
        VALUES
        <foreach collection="list" item="item" separator=",">
            (#{item.username}, #{item.email}, #{item.age}, NOW())
        </foreach>
    </insert>
    
    <!-- 9. 更新 -->
    <update id="update">
        UPDATE user
        <set>
            <if test="username != null and username != ''">
                username = #{username},
            </if>
            <if test="email != null and email != ''">
                email = #{email},
            </if>
            <if test="age != null">
                age = #{age},
            </if>
        </set>
        WHERE id = #{id}
    </update>
    
    <!-- 10. 删除 -->
    <delete id="delete">
        DELETE FROM user WHERE id = #{id}
    </delete>
    
    <!-- 11. 逻辑删除 -->
    <update id="logicDelete">
        UPDATE user SET is_deleted = 1 WHERE id = #{id}
    </update>
</mapper>
```

### 3.2 Mapper 接口

```java
@Mapper
public interface UserMapper {
    
    User getById(Long id);
    
    List<User> list();
    
    List<User> listByCondition(@Param("username") String username,
                               @Param("email") String email,
                               @Param("minAge") Integer minAge,
                               @Param("maxAge") Integer maxAge);
    
    List<User> page(@Param("offset") int offset, @Param("limit") int limit);
    
    int insert(User user);
    
    int batchInsert(@Param("list") List<User> users);
    
    int update(User user);
    
    int delete(Long id);
    
    int logicDelete(Long id);
}
```

### 3.3 一对多映射

```xml
<!-- 订单（一） → 订单项（多） -->
<resultMap id="OrderWithItemsMap" type="com.example.entity.Order">
    <id column="order_id" property="id"/>
    <result column="order_code" property="code"/>
    <result column="amount" property="amount"/>
    
    <!-- 一对多 -->
    <collection property="items" ofType="com.example.entity.OrderItem">
        <id column="item_id" property="id"/>
        <result column="item_name" property="name"/>
        <result column="item_count" property="count"/>
        <result column="item_price" property="price"/>
    </collection>
</resultMap>

<select id="getOrderWithItems" resultMap="OrderWithItemsMap">
    SELECT 
        o.id AS order_id,
        o.code AS order_code,
        o.amount,
        i.id AS item_id,
        i.name AS item_name,
        i.count AS item_count,
        i.price AS item_price
    FROM `order` o
    LEFT JOIN order_item i ON o.id = i.order_id
    WHERE o.id = #{orderId}
</select>
```

### 3.4 多对一映射

```xml
<!-- 订单项（多） → 订单（一） -->
<resultMap id="ItemWithOrderMap" type="com.example.entity.OrderItem">
    <id column="item_id" property="id"/>
    <result column="item_name" property="name"/>
    
    <!-- 多对一 -->
    <association property="order" javaType="com.example.entity.Order">
        <id column="order_id" property="id"/>
        <result column="order_code" property="code"/>
    </association>
</resultMap>

<select id="getItemWithOrder" resultMap="ItemWithOrderMap">
    SELECT 
        i.id AS item_id,
        i.name AS item_name,
        o.id AS order_id,
        o.code AS order_code
    FROM order_item i
    LEFT JOIN `order` o ON i.order_id = o.id
    WHERE i.id = #{itemId}
</select>
```

### 3.5 多对多映射

```xml
<!-- 用户 ↔ 角色 -->
<resultMap id="UserWithRolesMap" type="com.example.entity.User">
    <id column="user_id" property="id"/>
    <result column="username" property="username"/>
    
    <!-- 多对多 -->
    <collection property="roles" ofType="com.example.entity.Role">
        <id column="role_id" property="id"/>
        <result column="role_name" property="name"/>
        <result column="role_code" property="code"/>
    </collection>
</resultMap>

<select id="getUserWithRoles" resultMap="UserWithRolesMap">
    SELECT 
        u.id AS user_id,
        u.username,
        r.id AS role_id,
        r.name AS role_name,
        r.code AS role_code
    FROM user u
    LEFT JOIN user_role_rel ur ON u.id = ur.user_id
    LEFT JOIN role r ON ur.role_id = r.id
    WHERE u.id = #{userId}
</select>
```

---

## 4. 动态 SQL

### 4.1 if 标签

```xml
<select id="listByCondition" resultMap="BaseResultMap">
    SELECT * FROM user
    <where>
        is_deleted = 0
        <if test="username != null and username != ''">
            AND username LIKE CONCAT('%', #{username}, '%')
        </if>
        <if test="email != null">
            AND email = #{email}
        </if>
        <if test="age != null">
            AND age = #{age}
        </if>
    </where>
</select>
```

### 4.2 choose/when/otherwise

```xml
<select id="listByType" resultMap="BaseResultMap">
    SELECT * FROM user
    <where>
        is_deleted = 0
        <choose>
            <when test="type == 1">
                AND age &lt; 18
            </when>
            <when test="type == 2">
                AND age BETWEEN 18 AND 60
            </when>
            <when test="type == 3">
                AND age &gt; 60
            </when>
            <otherwise>
                AND 1 = 1
            </otherwise>
        </choose>
    </where>
</select>
```

### 4.3 foreach 标签

```xml
<!-- 批量插入 -->
<insert id="batchInsert">
    INSERT INTO user (username, email, age)
    VALUES
    <foreach collection="list" item="item" separator=",">
        (#{item.username}, #{item.email}, #{item.age})
    </foreach>
</insert>

<!-- IN 查询 -->
<select id="listByIds" resultMap="BaseResultMap">
    SELECT * FROM user
    WHERE id IN
    <foreach collection="ids" item="id" open="(" separator="," close=")">
        #{id}
    </foreach>
</select>

<!-- 批量更新 -->
<update id="batchUpdate">
    <foreach collection="list" item="item" separator=";">
        UPDATE user
        <set>
            <if test="item.username != null">
                username = #{item.username},
            </if>
            <if test="item.email != null">
                email = #{item.email},
            </if>
        </set>
        WHERE id = #{item.id}
    </foreach>
</update>
```

### 4.4 set 标签

```xml
<update id="update">
    UPDATE user
    <set>
        <if test="username != null and username != ''">
            username = #{username},
        </if>
        <if test="email != null">
            email = #{email},
        </if>
        <if test="age != null">
            age = #{age},
        </if>
    </set>
    WHERE id = #{id}
</update>
```

### 4.5 trim 标签

```xml
<!-- 自定义 WHERE -->
<select id="listByCondition" resultMap="BaseResultMap">
    SELECT * FROM user
    <trim prefix="WHERE" prefixOverrides="AND |OR ">
        <if test="username != null">
            AND username = #{username}
        </if>
        <if test="email != null">
            AND email = #{email}
        </if>
    </trim>
</select>

<!-- 自定义 SET -->
<update id="update">
    UPDATE user
    <trim prefix="SET" suffixOverrides=",">
        <if test="username != null">
            username = #{username},
        </if>
        <if test="email != null">
            email = #{email},
        </if>
    </trim>
    WHERE id = #{id}
</update>
```

### 4.6 sql/include 标签

```xml
<!-- 定义 SQL 片段 -->
<sql id="Base_Column_List">
    id, username, email, age, create_time
</sql>

<!-- 引用 SQL 片段 -->
<select id="getById" resultMap="BaseResultMap">
    SELECT <include refid="Base_Column_List"/>
    FROM user
    WHERE id = #{id}
</select>
```

### 4.7 bind 标签

```xml
<select id="listByUsername" resultMap="BaseResultMap">
    <bind name="pattern" value="'%' + username + '%'"/>
    SELECT * FROM user
    WHERE username LIKE #{pattern}
</select>
```

---

## 5. 缓存机制

### 5.1 一级缓存（本地缓存）

```
- 默认开启
- SqlSession 级别
- 相同查询只执行一次 SQL
- 增删改操作后清空
```

```java
// 示例
SqlSession session1 = sqlSessionFactory.openSession();
User user1 = session1.selectOne("UserMapper.getById", 1L);  // 执行 SQL
User user2 = session1.selectOne("UserMapper.getById", 1L);  // 使用缓存
session1.close();  // 缓存清空

SqlSession session2 = sqlSessionFactory.openSession();
User user3 = session2.selectOne("UserMapper.getById", 1L);  // 重新执行 SQL
```

### 5.2 二级缓存（全局缓存）

```
- 需要手动开启
- Mapper 级别
- 多个 SqlSession 共享
- 需要实现 Serializable 接口
```

```xml
<!-- 开启二级缓存 -->
<settings>
    <setting name="cacheEnabled" value="true"/>
</settings>

<!-- Mapper 配置 -->
<mapper namespace="com.example.mapper.UserMapper">
    <cache eviction="LRU" flushInterval="60000" size="512" readOnly="true"/>
</mapper>
```

```java
// 实体类实现 Serializable
public class User implements Serializable {
    private Long id;
    private String username;
    // ...
}
```

### 5.3 缓存策略

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| **LRU** | 最近最少使用 | 默认，通用场景 |
| **FIFO** | 先进先出 | 队列场景 |
| **SOFT** | 软引用 | 内存敏感场景 |
| **WEAK** | 弱引用 | 极易回收场景 |

### 5.4 缓存配置

```xml
<cache
    eviction="LRU"           <!-- 回收策略 -->
    flushInterval="60000"    <!-- 刷新间隔（毫秒） -->
    size="512"               <!-- 缓存数量 -->
    readOnly="true"          <!-- 只读 -->
    blocking="true"          <!-- 阻塞 -->
/>
```

---

## 6. 插件开发

### 6.1 拦截器接口

```java
@Intercepts({
    @Signature(
        type = Executor.class,
        method = "query",
        args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class}
    )
})
public class MyPlugin implements Interceptor {
    
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        // 前置逻辑
        System.out.println("拦截查询：" + invocation.getArgs()[0]);
        
        // 执行目标方法
        Object result = invocation.proceed();
        
        // 后置逻辑
        System.out.println("查询完成");
        
        return result;
    }
    
    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }
    
    @Override
    public void setProperties(Properties properties) {
        // 配置属性
    }
}
```

### 6.2 分页插件

```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.github.pagehelper</groupId>
    <artifactId>pagehelper-spring-boot-starter</artifactId>
    <version>1.4.7</version>
</dependency>
```

```yaml
# application.yml
pagehelper:
  helper-dialect: mysql
  reasonable: true
  support-methods-arguments: true
```

```java
// 使用
public List<User> page(int pageNum, int pageSize) {
    PageHelper.startPage(pageNum, pageSize);
    return userMapper.list();
}

// 或使用 Page 对象
public Page<User> page(int pageNum, int pageSize) {
    PageHelper.startPage(pageNum, pageSize);
    List<User> list = userMapper.list();
    return (Page<User>) list;
}
```

### 6.3 通用 Mapper 插件

```xml
<!-- pom.xml -->
<dependency>
    <groupId>tk.mybatis</groupId>
    <artifactId>mapper-spring-boot-starter</artifactId>
    <version>2.3.4</version>
</dependency>
```

```java
// Mapper 接口继承通用 Mapper
public interface UserMapper extends Mapper<User> {
    // 自带 CRUD 方法
    // select、insert、update、delete 等
}

// 启动类添加扫描
@MapperScan(basePackages = "com.example.mapper", markerInterface = Mapper.class)
@SpringBootApplication
public class Application { }
```

---

## 7. MyBatis-Plus

### 7.1 简介

**MyBatis-Plus** 是 MyBatis 的增强工具，在 MyBatis 的基础上只做增强不做改变。

**核心特性：**
- ✅ **通用 CRUD**：无需编写 SQL
- ✅ **分页插件**：内置分页支持
- ✅ **条件构造器**：Lambda 表达式
- ✅ **代码生成器**：自动生成代码
- ✅ **乐观锁**：内置支持

### 7.2 整合配置

```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.3.1</version>
</dependency>
```

```yaml
# application.yml
mybatis-plus:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.example.entity
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl
  global-config:
    db-config:
      id-type: auto
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
```

### 7.3 实体类

```java
@Data
@TableName("user")
public class User {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String username;
    
    private String email;
    
    private Integer age;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}
```

### 7.4 Mapper 接口

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 自带 CRUD 方法
    // selectById、selectList、insert、updateById、deleteById 等
}
```

### 7.5 Service 层

```java
public interface UserService extends IService<User> {
    // 自带 CRUD 方法
}

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    // 实现类
}
```

### 7.6 条件构造器

```java
// 1. QueryWrapper
QueryWrapper<User> queryWrapper = new QueryWrapper<>();
queryWrapper.eq("age", 18)
    .like("username", "张")
    .orderByDesc("create_time");
List<User> users = userService.list(queryWrapper);

// 2. LambdaQueryWrapper（推荐 ⭐）
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getAge, 18)
    .like(User::getUsername, "张")
    .orderByDesc(User::getCreateTime);
List<User> users = userService.list(wrapper);

// 3. 链式调用
List<User> users = userService.lambdaQuery()
    .eq(User::getAge, 18)
    .like(User::getUsername, "张")
    .list();

// 4. 分页
Page<User> page = userService.lambdaQuery()
    .eq(User::getAge, 18)
    .page(new Page<>(1, 10));

// 5. 更新
boolean updated = userService.lambdaUpdate()
    .eq(User::getId, 1L)
    .set(User::getAge, 20)
    .update();

// 6. 删除
boolean removed = userService.lambdaUpdate()
    .eq(User::getAge, 18)
    .remove();
```

### 7.7 常用注解

```java
@TableName("user")              // 表名
@TableId(type = IdType.AUTO)    // 主键策略
@TableField("user_name")        // 字段名
@TableField(fill = FieldFill.INSERT)  // 自动填充
@TableLogic                     // 逻辑删除
@Version                        // 乐观锁
```

### 7.8 自动填充

```java
// 实现元对象处理器
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    @Override
    public void insertFill(MetaObject metaObject) {
        this.setFieldValByName("createTime", LocalDateTime.now(), metaObject);
        this.setFieldValByName("updateTime", LocalDateTime.now(), metaObject);
    }
    
    @Override
    public void updateFill(MetaObject metaObject) {
        this.setFieldValByName("updateTime", LocalDateTime.now(), metaObject);
    }
}
```

### 7.9 乐观锁

```java
// 实体类添加版本号字段
@Data
public class User {
    @TableId
    private Long id;
    
    @Version
    private Integer version;
    
    private String username;
}

// 配置插件
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public OptimisticLockerInnerInterceptor optimisticLockerInterceptor() {
        return new OptimisticLockerInnerInterceptor();
    }
}

// 使用
User user = userService.getById(1L);
user.setUsername("新名字");
boolean updated = userService.updateById(user);  // 自动检查版本号
```

### 7.10 代码生成器

```java
// 代码生成器
FastAutoGenerator.create("jdbc:mysql://localhost:3306/mydb", "root", "123456")
    .globalConfig(builder -> {
        builder.author("涛哥")
            .outputDir("src/main/java");
    })
    .packageConfig(builder -> {
        builder.parent("com.example")
            .entity("entity")
            .mapper("mapper")
            .service("service")
            .controller("controller");
    })
    .strategyConfig(builder -> {
        builder.addInclude("user", "order")
            .entityBuilder()
            .enableLombok()
            .enableTableFieldAnnotation()
            .mapperBuilder()
            .enableMapperAnnotation()
            .controllerBuilder()
            .enableRestStyle();
    })
    .execute();
```

---

## 8. 最佳实践

### 8.1 SQL 优化

```xml
<!-- ❌ 避免 SELECT * -->
<select id="list" resultType="User">
    SELECT * FROM user
</select>

<!-- ✅ 只查询需要的字段 -->
<select id="list" resultType="User">
    SELECT id, username, email FROM user
</select>

<!-- ❌ 避免 N+1 查询 -->
<!-- 先查订单，再循环查订单项 -->

<!-- ✅ 使用关联查询 -->
<select id="listWithItems" resultMap="OrderWithItemsMap">
    SELECT o.*, i.id AS item_id, i.name AS item_name
    FROM `order` o
    LEFT JOIN order_item i ON o.id = i.order_id
</select>
```

### 8.2 批量操作

```java
// ❌ 循环插入
for (User user : users) {
    userMapper.insert(user);
}

// ✅ 批量插入
userMapper.batchInsert(users);

// ✅ MyBatis-Plus 批量保存
userService.saveBatch(users, 1000);  // 每 1000 条一批
```

### 8.3 防止 SQL 注入

```java
// ❌ 错误：直接拼接 SQL
String sql = "SELECT * FROM user WHERE username = '" + username + "'";

// ✅ 正确：使用 #{} 预编译
<select id="getByUsername">
    SELECT * FROM user WHERE username = #{username}
</select>

// ⚠️ 注意：${} 会直接拼接，有 SQL 注入风险
<select id="listByTable">
    SELECT * FROM ${tableName}  <!-- 仅用于表名等动态场景 -->
</select>
```

### 8.4 事务管理

```java
@Service
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Transactional(rollbackFor = Exception.class)
    public void createUserWithOrder(User user, Order order) {
        // 1. 创建用户
        userMapper.insert(user);
        
        // 2. 创建订单
        orderMapper.insert(order);
        
        // 如果抛出异常，两个操作都会回滚
    }
}
```

### 8.5 日志配置

```yaml
# application.yml
mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl

# 开发环境开启 SQL 日志
logging:
  level:
    com.example.mapper: DEBUG
```

---

## 💡 常见面试题

1. **MyBatis 工作原理？**
2. **#{} 和 ${} 的区别？**
3. **MyBatis 缓存机制？**
4. **动态 SQL 标签有哪些？**
5. **MyBatis-Plus 的优势？**
6. **分页插件原理？**
7. **如何防止 SQL 注入？**
8. **MyBatis 插件开发流程？**
9. **一对多、多对一映射如何实现？**
10. **MyBatis 与 Hibernate 的区别？**

---

## 📚 参考资料

- 《MyBatis 技术内幕》
- [MyBatis 官方文档](https://mybatis.org/mybatis-3/)
- [MyBatis-Plus 官方文档](https://baomidou.com/)
- [MyBatis 源码](https://github.com/mybatis/mybatis-3)

---

> 💡 **学习建议**：MyBatis 是 Java 开发必备技能，建议：
> 1. 掌握 XML 配置和动态 SQL
> 2. 理解缓存机制
> 3. 学习 MyBatis-Plus 提高效率
> 4. 实战项目练习
