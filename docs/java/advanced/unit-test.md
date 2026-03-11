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

## 📝 待办事项

- [ ] JUnit 5 基础
- [ ] Mockito 使用
- [ ] Spring Boot Test
- [ ] 测试覆盖率配置
- [ ] 集成测试实战
- [ ] 测试规范制定

---

**推荐资源：**
- 📚 《JUnit in Action》
- 📖 JUnit 5 官方文档
- 🔗 Mockito 官方文档
