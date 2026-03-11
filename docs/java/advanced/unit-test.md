# 单元测试

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-05-15

---

## 📚 目录

[[toc]]

---

## 1. JUnit 5

### 1.1 基础注解

```java
@ExtendWith(SpringExtension.class)
class UserServiceTest {
    
    @BeforeAll
    static void beforeAll() { }  // 所有测试之前执行一次
    
    @AfterAll
    static void afterAll() { }   // 所有测试之后执行一次
    
    @BeforeEach
    void beforeEach() { }        // 每个测试之前执行
    
    @AfterEach
    void afterEach() { }         // 每个测试之后执行
    
    @Test
    @DisplayName("测试用户创建")
    void testCreateUser() { }
    
    @Test
    @Disabled("暂时跳过")
    void testSkip() { }
    
    @ParameterizedTest
    @ValueSource(strings = {"a", "b", "c"})
    void testParameterized(String input) { }
}
```

### 1.2 断言

```java
import static org.junit.jupiter.api.Assertions.*;

@Test
void testAssertions() {
    // 基础断言
    assertEquals(1, 1);
    assertEquals("expected", "actual");
    assertTrue(true);
    assertFalse(false);
    assertNull(null);
    assertNotNull(object);
    
    // 数组/集合
    assertArrayEquals(new int[]{1, 2}, new int[]{1, 2});
    assertIterableEquals(list1, list2);
    
    // 异常
    assertThrows(IllegalArgumentException.class, () -> {
        throw new IllegalArgumentException("error");
    });
    
    // 超时
    assertTimeout(Duration.ofMillis(100), () -> {
        // 快速执行
    });
    
    // 组合断言
    assertAll("user",
        () -> assertEquals("张三", user.getName()),
        () -> assertEquals(25, user.getAge())
    );
}
```

---

## 2. Mockito

### 2.1 Mock 对象

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    
    @Mock
    private OrderMapper orderMapper;
    
    @Mock
    private UserClient userClient;
    
    @InjectMocks
    private OrderService orderService;
    
    @Test
    void testCreateOrder() {
        // 定义行为
        when(orderMapper.insert(any())).thenReturn(1);
        when(userClient.getUserById(1L)).thenReturn(new User("张三"));
        
        // 执行测试
        Order order = new Order();
        order.setUserId(1L);
        int result = orderService.createOrder(order);
        
        // 验证结果
        assertEquals(1, result);
        
        // 验证调用
        verify(orderMapper, times(1)).insert(any());
        verify(userClient, times(1)).getUserById(1L);
    }
}
```

### 2.2 常用注解

```java
@Mock              // 创建 Mock 对象
@Spy               // 创建 Spy 对象（部分 mock）
@InjectMocks       // 自动注入 Mock 到被测试类
@MockitoSettings   // Mockito 配置
```

### 2.3 Stubbing

```java
// 返回值
when(mock.method()).thenReturn(value);
when(mock.method(arg1)).thenReturn(value1, value2);  // 多次调用返回不同值

// 抛出异常
when(mock.method()).thenThrow(new RuntimeException("error"));

// 自定义响应
when(mock.method()).thenAnswer(invocation -> {
    Object arg = invocation.getArgument(0);
    return "processed: " + arg;
});

// 参数匹配
when(mock.method(any())).thenReturn(value);
when(mock.method(eq("specific"))).thenReturn(value);
when(mock.method(argThat(s -> s.length() > 5))).thenReturn(value);
```

---

## 3. Spring Boot Test

### 3.1 测试切片

```java
// Web 层测试
@WebMvcTest(UserController.class)
class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @Test
    void testGetUser() throws Exception {
        when(userService.getUser(1L)).thenReturn(new User("张三"));
        
        mockMvc.perform(get("/api/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("张三"));
    }
}

// Service 层测试
@SpringBootTest
class UserServiceTest {
    
    @Autowired
    private UserService userService;
    
    @MockBean
    private UserMapper userMapper;
}

// 数据层测试
@DataJpaTest
class UserRepositoryTest {
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Autowired
    private UserRepository userRepository;
}
```

### 3.2 测试配置

```java
@SpringBootTest
@ActiveProfiles("test")  // 使用 test 配置
@TestPropertySource(properties = {
    "app.test.mode=true"
})
class IntegrationTest {
}
```

```yaml
# application-test.yml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: 
  h2:
    console:
      enabled: true
```

---

## 4. 测试覆盖率

### 4.1 JaCoCo 配置

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
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
    <configuration>
        <rules>
            <rule>
                <element>BUNDLE</element>
                <limits>
                    <limit>
                        <counter>INSTRUCTION</counter>
                        <value>COVEREDRATIO</value>
                        <minimum>0.80</minimum>
                    </limit>
                </limits>
            </rule>
        </rules>
    </configuration>
</plugin>
```

### 4.2 执行报告

```bash
# 生成报告
mvn test jacoco:report

# 查看报告
open target/site/jacoco/index.html
```

---

## 5. 最佳实践

### 5.1 测试命名

```java
// 推荐：方法名_场景_预期结果
@Test
void createUser_validInput_success() { }

@Test
void createUser_duplicateEmail_throwsException() { }

// 或使用 Given-When-Then
@Test
void given_validUser_when_create_then_success() { }
```

### 5.2 测试结构

```java
@Test
void testOrderCreation() {
    // Given
    User user = new User("张三");
    Order order = new Order();
    order.setUser(user);
    when(userMapper.selectById(1L)).thenReturn(user);
    
    // When
    Order result = orderService.createOrder(order);
    
    // Then
    assertNotNull(result.getId());
    assertEquals(user.getId(), result.getUserId());
    verify(orderMapper, times(1)).insert(any());
}
```

### 5.3 避免的陷阱

```java
// ❌ 不要测试私有方法（通过公共方法测试）
// ❌ 不要过度 Mock（只 Mock 外部依赖）
// ❌ 不要依赖测试执行顺序
// ❌ 不要在生产代码中写测试逻辑
```

---

## 6. 实战：完整测试案例

### 6.1 Service 层测试

```java
@ExtendWith(SpringExtension.class)
@SpringBootTest
class UserServiceTest {
    
    @Autowired
    private UserService userService;
    
    @MockBean
    private UserMapper userMapper;
    
    @MockBean
    private RedisTemplate<String, Object> redisTemplate;
    
    @Test
    @DisplayName("创建用户 - 成功")
    void testCreateUser_success() {
        // Given
        User user = new User();
        user.setUsername("test");
        user.setEmail("test@example.com");
        
        when(userMapper.selectByUsername("test")).thenReturn(null);
        when(userMapper.insert(any())).thenReturn(1);
        
        // When
        User result = userService.createUser(user);
        
        // Then
        assertNotNull(result.getId());
        assertEquals("test", result.getUsername());
        verify(userMapper, times(1)).insert(any());
    }
    
    @Test
    @DisplayName("创建用户 - 用户名已存在")
    void testCreateUser_duplicateUsername() {
        // Given
        User user = new User();
        user.setUsername("test");
        
        when(userMapper.selectByUsername("test"))
            .thenReturn(new User("existing"));
        
        // When & Then
        assertThrows(BusinessException.class, () -> {
            userService.createUser(user);
        });
    }
    
    @Test
    @DisplayName("查询用户 - 缓存命中")
    void testGetUser_cacheHit() {
        // Given
        Long userId = 1L;
        User cachedUser = new User("cached");
        cachedUser.setId(userId);
        
        when(redisTemplate.opsForValue().get("user:" + userId))
            .thenReturn(cachedUser);
        
        // When
        User result = userService.getUser(userId);
        
        // Then
        assertEquals(cachedUser, result);
        verify(userMapper, never()).selectById(any());
    }
    
    @Test
    @DisplayName("查询用户 - 缓存未命中")
    void testGetUser_cacheMiss() {
        // Given
        Long userId = 1L;
        User dbUser = new User("db");
        dbUser.setId(userId);
        
        when(redisTemplate.opsForValue().get("user:" + userId))
            .thenReturn(null);
        when(userMapper.selectById(userId)).thenReturn(dbUser);
        
        // When
        User result = userService.getUser(userId);
        
        // Then
        assertEquals(dbUser, result);
        verify(redisTemplate).opsForValue()
            .set(eq("user:" + userId), eq(dbUser), anyLong(), any());
    }
}
```

### 6.2 Controller 层测试

```java
@WebMvcTest(UserController.class)
class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @Test
    @DisplayName("创建用户接口 - 成功")
    void testCreateUser_success() throws Exception {
        // Given
        User request = new User();
        request.setUsername("test");
        request.setEmail("test@example.com");
        
        User response = new User("test");
        response.setId(1L);
        
        when(userService.createUser(any())).thenReturn(response);
        
        // When & Then
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(JsonUtils.toJson(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.id").value(1))
            .andExpect(jsonPath("$.data.username").value("test"));
    }
    
    @Test
    @DisplayName("查询用户接口 - 参数校验失败")
    void testGetUser_invalidParam() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/users/-1"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value(400));
    }
    
    @Test
    @DisplayName("查询用户列表 - 分页")
    void testListUsers_pagination() throws Exception {
        // Given
        Page<User> page = new Page<>();
        page.setRecords(Arrays.asList(
            new User("user1"),
            new User("user2")
        ));
        page.setTotal(100);
        page.setCurrent(1);
        page.setSize(10);
        
        when(userService.listUsers(any()))
            .thenReturn(page);
        
        // When & Then
        mockMvc.perform(get("/api/users")
                .param("current", "1")
                .param("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.records").isArray())
            .andExpect(jsonPath("$.data.total").value(100))
            .andExpect(jsonPath("$.data.current").value(1))
            .andExpect(jsonPath("$.data.size").value(10));
    }
}
```

### 6.3 集成测试

```java
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class OrderIntegrationTest {
    
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
        .withDatabaseName("test")
        .withUsername("test")
        .withPassword("test");
    
    @Container
    static RedisContainer redis = new RedisContainer("redis:7-alpine");
    
    @DynamicPropertySource
    static void configureTestProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.redis.host", redis::getHost);
        registry.add("spring.redis.port", () -> redis.getMappedPort(6379).toString());
    }
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private OrderMapper orderMapper;
    
    @BeforeEach
    void setUp() {
        orderMapper.delete(null);
    }
    
    @Test
    @DisplayName("创建订单 - 完整流程")
    void testCreateOrder_fullProcess() {
        // Given
        Order order = new Order();
        order.setUserId(1L);
        order.setProductId(100L);
        order.setCount(2);
        order.setAmount(new BigDecimal("199.00"));
        
        // When
        Order result = orderService.createOrder(order);
        
        // Then
        assertNotNull(result.getId());
        assertEquals(OrderStatus.PENDING, result.getStatus());
        
        // 验证数据库
        Order dbOrder = orderMapper.selectById(result.getId());
        assertNotNull(dbOrder);
        assertEquals(OrderStatus.PENDING, dbOrder.getStatus());
    }
}
```

---

## 7. 测试规范

### 7.1 命名规范

```java
// 测试类：被测试类名 + Test
class UserServiceTest { }
class UserControllerTest { }

// 测试方法：方法名_场景_预期结果
@Test
void createUser_validInput_success() { }

@Test
void createUser_duplicateEmail_throwsException() { }

// 或使用 Given-When-Then 风格
@Test
void given_validUser_when_create_then_success() { }

@Test
void given_duplicateEmail_when_create_then_throwException() { }
```

### 7.2 测试结构

```java
@Test
void testOrderCreation() {
    // ========== Given（准备数据）==========
    User user = createUser();
    Product product = createProduct();
    Order order = new Order();
    order.setUser(user);
    order.setProduct(product);
    order.setCount(2);
    
    // ========== When（执行操作）==========
    Order result = orderService.createOrder(order);
    
    // ========== Then（验证结果）==========
    // 1. 验证返回值
    assertNotNull(result.getId());
    assertEquals(OrderStatus.PENDING, result.getStatus());
    
    // 2. 验证数据库
    Order dbOrder = orderMapper.selectById(result.getId());
    assertNotNull(dbOrder);
    
    // 3. 验证交互
    verify(orderMapper, times(1)).insert(any());
    verify(eventPublisher).publishEvent(any());
}
```

### 7.3 测试覆盖率要求

```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
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
        <execution>
            <id>check</id>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>BUNDLE</element>
                        <limits>
                            <limit>
                                <counter>INSTRUCTION</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum>  <!-- 行覆盖率 >= 80% -->
                            </limit>
                            <limit>
                                <counter>BRANCH</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.70</minimum>  <!-- 分支覆盖率 >= 70% -->
                            </limit>
                        </limits>
                    </rule>
                    <rule>
                        <element>CLASS</element>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum>
                            </limit>
                        </limits>
                        <excludes>
                            <exclude>**/entity/*</exclude>
                            <exclude>**/dto/*</exclude>
                            <exclude>**/config/*</exclude>
                        </excludes>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

---

## 📝 实战清单

**JUnit 5：**
- [ ] 基础注解（@Test/@BeforeEach/@AfterEach）
- [ ] 断言（assertEquals/assertThrows）
- [ ] 参数化测试（@ParameterizedTest）
- [ ] 嵌套测试（@Nested）
- [ ] 超时测试（@Timeout）

**Mockito：**
- [ ] Mock 对象创建（@Mock）
- [ ] Spy 对象（@Spy）
- [ ] 行为定义（when/thenReturn）
- [ ] 参数匹配（any/eq/argThat）
- [ ] 验证（verify/never/timeout）
- [ ] 注入（@InjectMocks）

**Spring Boot Test：**
- [ ] @SpringBootTest 集成测试
- [ ] @WebMvcTest Controller 测试
- [ ] @DataJpaTest Repository 测试
- [ ] @MockBean Mock Bean
- [ ] MockMvc 请求测试
- [ ] Testcontainers 容器测试

**测试质量：**
- [ ] 测试命名规范
- [ ] AAA 结构（Given-When-Then）
- [ ] 测试独立性（无依赖）
- [ ] 测试可重复性
- [ ] JaCoCo 覆盖率配置
- [ ] CI 集成（测试失败阻断）

**最佳实践：**
- [ ] 测试私有方法（通过公共方法）
- [ ] 不测试框架代码
- [ ] 测试边界条件
- [ ] 测试异常情况
- [ ] 保持测试简洁
- [ ] 定期重构测试

---

**推荐资源：**
- 📚 《JUnit in Action》
- 📚 《Effective Testing with JUnit 5》
- 📖 JUnit 5 官方文档：https://junit.org/junit5/
- 🔗 Mockito 官方文档：https://site.mockito.org
- 🛠️ JaCoCo：https://www.eclemma.org/jacoco/
