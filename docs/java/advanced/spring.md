# Spring/SpringBoot

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-05-15

---

## 📚 目录

1. [Spring 概述](#1-spring-概述)
2. [IOC 与 DI](#2-ioc-与-di)
3. [AOP 面向切面编程](#3-aop-面向切面编程)
4. [Spring MVC](#4-spring-mvc)
5. [SpringBoot 核心](#5-springboot-核心)
6. [自动配置原理](#6-自动配置原理)
7. [SpringBoot 实战](#7-springboot-实战)
8. [最佳实践](#8-最佳实践)

---

## 1. Spring 概述

### 1.1 什么是 Spring

**Spring** 是一个开源的 Java EE 框架，由 Rod Johnson 于 2003 年创建。

**核心特性：**
- ✅ **IOC（Inversion of Control）**：控制反转，依赖注入
- ✅ **AOP（Aspect Oriented Programming）**：面向切面编程
- ✅ **声明式事务**：@Transactional
- ✅ **MVC 框架**：Spring MVC
- ✅ **测试支持**：Spring Test

### 1.2 Spring 生态系统

```
Spring Ecosystem
├── Spring Framework（核心框架）
├── SpringBoot（快速开发）
├── Spring Cloud（微服务）
├── Spring Data（数据访问）
├── Spring Security（安全认证）
├── Spring Cloud Alibaba（阿里生态）
└── Spring AI（AI 应用开发）
```

### 1.3 Spring 优势

- ✅ **轻量级**：核心框架约 2MB
- ✅ **非侵入式**：POJO 编程，无需继承特定类
- ✅ **松耦合**：依赖注入，模块解耦
- ✅ **AOP 支持**：横切关注点分离
- ✅ **声明式事务**：@Transactional 简化事务管理
- ✅ **测试友好**：内置测试支持

---

## 2. IOC 与 DI

### 2.1 什么是 IOC

**IOC（Inversion of Control）**：控制反转，将对象创建和依赖关系的管理交给 Spring 容器。

```java
// ❌ 传统方式：主动创建依赖
public class UserService {
    private UserRepository userRepository = new UserRepositoryImpl();
}

// ✅ IOC 方式：依赖注入
public class UserService {
    @Autowired
    private UserRepository userRepository;
}
```

### 2.2 依赖注入方式

#### 构造器注入（推荐 ⭐）

```java
@Service
public class UserService {
    private final UserRepository userRepository;
    
    @Autowired  // 单个构造器可省略
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}

// 优势：
// 1. 依赖不可变（final）
// 2. 保证依赖不为 null
// 3. 便于单元测试
```

#### Setter 注入

```java
@Service
public class UserService {
    private UserRepository userRepository;
    
    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}

// 适用场景：可选依赖
```

#### 字段注入（不推荐 ❌）

```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
}

// 缺点：
// 1. 依赖可变
// 2. 无法保证不为 null
// 3. 难以单元测试
// 4. 违反单一职责原则
```

### 2.3 Bean 作用域

```java
// 1. singleton（默认）：单例
@Scope("singleton")
@Component
class SingletonBean {}

// 2. prototype：多例
@Scope("prototype")
@Component
class PrototypeBean {}

// 3. request：HTTP 请求级别
@Scope(value = WebApplicationContext.SCOPE_REQUEST)
@Component
class RequestBean {}

// 4. session：HTTP Session 级别
@Scope(value = WebApplicationContext.SCOPE_SESSION)
@Component
class SessionBean {}

// 5. application：应用级别
@Scope(value = WebApplicationContext.SCOPE_APPLICATION)
@Component
class ApplicationBean {}
```

### 2.4 Bean 生命周期

```
实例化 → 属性赋值 → 初始化 → 销毁

1. 实例化（Constructor）
2. 属性赋值（@Autowired）
3. Aware 接口回调（BeanNameAware、BeanFactoryAware）
4. BeanPostProcessor.postProcessBeforeInitialization
5. 初始化方法（@PostConstruct、InitializingBean.afterPropertiesSet）
6. BeanPostProcessor.postProcessAfterInitialization
7. 使用 Bean
8. 销毁方法（@PreDestroy、DisposableBean.destroy）
```

#### 生命周期示例

```java
@Component
public class MyBean implements InitializingBean, DisposableBean {
    
    private static final Logger log = LoggerFactory.getLogger(MyBean.class);
    
    public MyBean() {
        log.info("1. 构造方法");
    }
    
    @Override
    public void setBeanName(String name) {
        log.info("2. BeanNameAware: {}", name);
    }
    
    @Override
    public void setBeanFactory(BeanFactory beanFactory) {
        log.info("3. BeanFactoryAware");
    }
    
    @PostConstruct
    public void postConstruct() {
        log.info("4. @PostConstruct");
    }
    
    @Override
    public void afterPropertiesSet() {
        log.info("5. InitializingBean.afterPropertiesSet");
    }
    
    @PreDestroy
    public void preDestroy() {
        log.info("6. @PreDestroy");
    }
    
    @Override
    public void destroy() {
        log.info("7. DisposableBean.destroy");
    }
}
```

### 2.5 Bean 定义方式

#### XML 配置（传统方式）

```xml
<bean id="userService" class="com.example.UserService">
    <property name="userRepository" ref="userRepository"/>
</bean>
```

#### 注解配置（推荐 ⭐）

```java
// 1. @Component：通用组件
@Component
public class MyComponent {}

// 2. @Service：业务层
@Service
public class UserService {}

// 3. @Repository：数据访问层
@Repository
public class UserRepository {}

// 4. @Controller：控制层
@Controller
public class UserController {}

// 5. @RestController：RESTful 控制层
@RestController
@RequestMapping("/api/users")
public class UserController {}
```

#### Java Config（推荐 ⭐）

```java
@Configuration
public class AppConfig {
    
    @Bean
    public UserService userService(UserRepository userRepository) {
        return new UserService(userRepository);
    }
    
    @Bean
    public UserRepository userRepository() {
        return new UserRepositoryImpl();
    }
}

// 使用
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
UserService userService = context.getBean(UserService.class);
```

### 2.6 循环依赖解决

```java
// 场景：A 依赖 B，B 依赖 A
@Service
public class ServiceA {
    @Autowired
    private ServiceB serviceB;
}

@Service
public class ServiceB {
    @Autowired
    private ServiceA serviceA;
}

// Spring 解决：三级缓存
// 1. singletonObjects：成品缓存
// 2. earlySingletonObjects：早期对象缓存
// 3. singletonFactories：对象工厂缓存

// 注意：构造器注入无法解决循环依赖
// 解决：使用 @Lazy 或 Setter 注入
@Service
public class ServiceA {
    @Autowired
    @Lazy  // 延迟注入
    private ServiceB serviceB;
}
```

---

## 3. AOP 面向切面编程

### 3.1 什么是 AOP

**AOP（Aspect Oriented Programming）**：面向切面编程，将横切关注点（日志、事务、权限）与业务逻辑分离。

```
业务逻辑：订单创建、订单支付、订单取消
横切关注点：日志记录、事务管理、权限校验

AOP 将横切关注点模块化，通过切面织入到业务逻辑中
```

### 3.2 AOP 核心概念

| 概念 | 说明 | 示例 |
|------|------|------|
| **Aspect（切面）** | 横切关注点的模块化 | 日志切面、事务切面 |
| **Joinpoint（连接点）** | 程序执行过程中的点 | 方法执行、异常抛出 |
| **Pointcut（切点）** | 匹配连接点的表达式 | `execution(* com.example.service.*.*(..))` |
| **Advice（通知）** | 切面在连接点执行的动作 | @Before、@After、@Around |
| **Target（目标对象）** | 被代理的对象 | UserService |
| **Weaving（织入）** | 将切面应用到目标对象 | 编译时、运行时 |

### 3.3 通知类型

```java
@Aspect
@Component
public class LoggingAspect {
    
    // 1. Before：方法执行前
    @Before("execution(* com.example.service.*.*(..))")
    public void before(JoinPoint joinPoint) {
        log.info("方法执行前：{}", joinPoint.getSignature().getName());
    }
    
    // 2. After：方法执行后（无论是否异常）
    @After("execution(* com.example.service.*.*(..))")
    public void after(JoinPoint joinPoint) {
        log.info("方法执行后：{}", joinPoint.getSignature().getName());
    }
    
    // 3. AfterReturning：方法正常返回后
    @AfterReturning(pointcut = "execution(* com.example.service.*.*(..))", returning = "result")
    public void afterReturning(JoinPoint joinPoint, Object result) {
        log.info("方法返回：{}", result);
    }
    
    // 4. AfterThrowing：方法抛出异常后
    @AfterThrowing(pointcut = "execution(* com.example.service.*.*(..))", throwing = "ex")
    public void afterThrowing(JoinPoint joinPoint, Exception ex) {
        log.error("方法异常：", ex);
    }
    
    // 5. Around：环绕通知（最强大）
    @Around("execution(* com.example.service.*.*(..))")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        
        // 前置逻辑
        log.info("方法执行前：{}", pjp.getSignature().getName());
        
        // 执行目标方法
        Object result = pjp.proceed();
        
        // 后置逻辑
        long cost = System.currentTimeMillis() - start;
        log.info("方法执行后，耗时：{}ms", cost);
        
        return result;
    }
}
```

### 3.4 切点表达式

```java
// 语法：execution(修饰符？ 返回类型 类路径？方法名 (参数) 异常？)

// 1. 匹配所有方法
execution(* *(..))

// 2. 匹配指定包下所有方法
execution(* com.example.service.*.*(..))

// 3. 匹配指定类的所有方法
execution(* com.example.service.UserService.*(..))

// 4. 匹配指定方法
execution(* com.example.service.UserService.save(..))

// 5. 匹配无参方法
execution(* com.example.service.UserService.save())

// 6. 匹配一个参数方法
execution(* com.example.service.UserService.save(String))

// 7. 匹配任意参数方法
execution(* com.example.service.UserService.save(..))

// 8. 匹配注解
@annotation(org.springframework.transaction.annotation.Transactional)

// 9. 组合表达式
execution(* com.example.service.*.*(..)) && @annotation(Transactional)
```

### 3.5 AOP 实现原理

#### JDK 动态代理（接口）

```java
// 目标类实现接口
public interface UserService {
    void save(User user);
}

public class UserServiceImpl implements UserService {
    public void save(User user) {
        // 业务逻辑
    }
}

// Spring 创建 JDK 动态代理
UserService proxy = (UserService) Proxy.newProxyInstance(
    UserServiceImpl.class.getClassLoader(),
    new Class<?>[] { UserService.class },
    (proxy1, method, args) -> {
        // 前置逻辑
        Object result = method.invoke(target, args);
        // 后置逻辑
        return result;
    }
);
```

#### CGLIB 代理（类）

```java
// 目标类不实现接口
public class UserService {
    public void save(User user) {
        // 业务逻辑
    }
}

// Spring 创建 CGLIB 代理
Enhancer enhancer = new Enhancer();
enhancer.setSuperclass(UserService.class);
enhancer.setCallback((MethodInterceptor) (obj, method, args, proxy) -> {
    // 前置逻辑
    Object result = proxy.invokeSuper(obj, args);
    // 后置逻辑
    return result;
});
UserService proxy = (UserService) enhancer.create();
```

#### SpringBoot 2.x 默认策略

```java
// SpringBoot 2.x 默认使用 CGLIB
spring:
  aop:
    proxy-target-class: true  # 强制使用 CGLIB
```

### 3.6 AOP 实战：日志切面

```java
@Aspect
@Component
@Slf4j
public class LogAspect {
    
    // 定义切点
    @Pointcut("execution(* com.example.controller.*.*(..))")
    public void controllerPointcut() {}
    
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void servicePointcut() {}
    
    // 环绕通知
    @Around("controllerPointcut() || servicePointcut()")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        
        // 请求信息
        String className = pjp.getTarget().getClass().getSimpleName();
        String methodName = pjp.getSignature().getName();
        String args = Arrays.toString(pjp.getArgs());
        
        log.info(">>> 开始执行：{}.{}({})", className, methodName, args);
        
        try {
            Object result = pjp.proceed();
            long cost = System.currentTimeMillis() - start;
            log.info("<<< 执行完成：{}.{}，耗时：{}ms，返回：{}", className, methodName, cost, result);
            return result;
        } catch (Throwable e) {
            long cost = System.currentTimeMillis() - start;
            log.error("<<< 执行异常：{}.{}，耗时：{}ms", className, methodName, cost, e);
            throw e;
        }
    }
}
```

### 3.7 AOP 实战：权限校验切面

```java
@Aspect
@Component
@Slf4j
public class AuthAspect {
    
    @Autowired
    private AuthService authService;
    
    // 匹配 @RequirePermission 注解的方法
    @Around("@annotation(requirePermission)")
    public Object checkPermission(ProceedingJoinPoint pjp, RequirePermission requirePermission) throws Throwable {
        // 获取当前用户
        String userId = SecurityContextHolder.getCurrentUserId();
        
        // 获取所需权限
        String permission = requirePermission.value();
        
        // 校验权限
        if (!authService.hasPermission(userId, permission)) {
            throw new AccessDeniedException("无权限访问");
        }
        
        return pjp.proceed();
    }
}

// 自定义注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    String value();  // 权限标识
}

// 使用
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    @RequirePermission("order:create")
    @PostMapping
    public Result createOrder(@RequestBody Order order) {
        // 创建订单
        return Result.success();
    }
}
```

---

## 4. Spring MVC

### 4.1 Spring MVC 工作流程

```
1. 用户请求 → DispatcherServlet（前端控制器）
2. DispatcherServlet → HandlerMapping（处理器映射）
3. HandlerMapping → Handler（处理器/Controller）
4. Handler → ModelAndView
5. ModelAndView → ViewResolver（视图解析器）
6. ViewResolver → View（视图）
7. View → 渲染响应 → 用户
```

### 4.2 常用注解

#### 控制器注解

```java
@Controller           // MVC 控制器
@RestController       // RESTful 控制器（@Controller + @ResponseBody）
@RequestMapping       // 映射请求路径
@GetMapping           // GET 请求
@PostMapping          // POST 请求
@PutMapping           // PUT 请求
@DeleteMapping        // DELETE 请求
@PatchMapping         // PATCH 请求
```

#### 参数绑定注解

```java
@RequestParam         // 查询参数
@PathVariable         // 路径参数
@RequestBody          // 请求体（JSON → 对象）
@ResponseBody         // 响应体（对象 → JSON）
@RequestHeader        // 请求头
@CookieValue          // Cookie
@ModelAttribute       // 模型属性
```

### 4.3 RESTful API 示例

```java
@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // 1. 查询所有用户
    @GetMapping
    public Result<List<User>> list() {
        return Result.success(userService.list());
    }
    
    // 2. 分页查询
    @GetMapping("/page")
    public Result<Page<User>> page(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return Result.success(userService.page(page, size));
    }
    
    // 3. 根据 ID 查询
    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }
    
    // 4. 创建用户
    @PostMapping
    public Result<User> create(@Valid @RequestBody UserCreateRequest request) {
        User user = userService.create(request);
        return Result.success(user);
    }
    
    // 5. 更新用户
    @PutMapping("/{id}")
    public Result<User> update(
        @PathVariable Long id,
        @Valid @RequestBody UserUpdateRequest request
    ) {
        return Result.success(userService.update(id, request));
    }
    
    // 6. 删除用户
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return Result.success();
    }
}
```

### 4.4 全局异常处理

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    // 1. 参数校验异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return Result.fail(400, message);
    }
    
    // 2. 业务异常
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常：{}", e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }
    
    // 3. 权限异常
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Result<Void> handleAccessDeniedException(AccessDeniedException e) {
        return Result.fail(403, "无权限访问");
    }
    
    // 4. 未找到异常
    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result<Void> handleNotFoundException(NotFoundException e) {
        return Result.fail(404, e.getMessage());
    }
    
    // 5. 其他异常
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常：", e);
        return Result.fail(500, "系统异常");
    }
}
```

### 4.5 拦截器

```java
@Component
public class AuthInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 请求前处理
        String token = request.getHeader("Authorization");
        
        if (token == null || !authService.validateToken(token)) {
            response.setStatus(401);
            return false;
        }
        
        return true;
    }
    
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) {
        // 请求后处理
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // 完成后处理（清理资源）
    }
}

// 配置拦截器
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Autowired
    private AuthInterceptor authInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
            .addPathPatterns("/api/**")  // 拦截路径
            .excludePathPatterns("/api/login", "/api/register");  // 排除路径
    }
}
```

---

## 5. SpringBoot 核心

### 5.1 SpringBoot 优势

- ✅ **快速启动**：内嵌 Tomcat，无需部署 WAR
- ✅ **自动配置**：约定优于配置
- ✅ **起步依赖**：简化 Maven 配置
- ✅ **生产就绪**：健康检查、指标监控
- ✅ **无代码生成**：无需 XML 配置

### 5.2 项目结构

```
src/
├── main/
│   ├── java/
│   │   └── com/example/
│   │       ├── Application.java      # 启动类
│   │       ├── controller/           # 控制层
│   │       ├── service/              # 业务层
│   │       ├── repository/           # 数据访问层
│   │       ├── entity/               # 实体类
│   │       ├── dto/                  # 数据传输对象
│   │       ├── config/               # 配置类
│   │       └── common/               # 公共类
│   └── resources/
│       ├── application.yml           # 配置文件
│       ├── application-dev.yml       # 开发环境
│       ├── application-prod.yml      # 生产环境
│       ├── mapper/                   # MyBatis Mapper
│       └── static/                   # 静态资源
└── test/
    └── java/
        └── com/example/
            └── ApplicationTests.java
```

### 5.3 配置文件

#### application.yml

```yaml
spring:
  application:
    name: my-application
  
  # 数据源配置
  datasource:
    url: jdbc:mysql://localhost:3306/mydb?useSSL=false&serverTimezone=UTC
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  # Redis 配置
  redis:
    host: localhost
    port: 6379
    password: 
    database: 0
  
  # Jackson 配置
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: GMT+8
  
# 服务器配置
server:
  port: 8080
  servlet:
    context-path: /api
  
# 日志配置
logging:
  level:
    root: INFO
    com.example: DEBUG
  file:
    name: logs/application.log
```

#### 多环境配置

```yaml
# application-dev.yml（开发环境）
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/dev_db
  redis:
    host: localhost

# application-prod.yml（生产环境）
spring:
  datasource:
    url: jdbc:mysql://prod-db:3306/prod_db
  redis:
    host: prod-redis
```

#### 激活环境

```bash
# 方式 1：配置文件
spring:
  profiles:
    active: dev

# 方式 2：命令行
java -jar app.jar --spring.profiles.active=prod

# 方式 3：环境变量
export SPRING_PROFILES_ACTIVE=prod
```

### 5.4 自定义配置

```java
// 1. @Value 注入
@Component
public class MyComponent {
    
    @Value("${my.custom.property:default}")
    private String customProperty;
}

// 2. @ConfigurationProperties 批量注入
@Component
@ConfigurationProperties(prefix = "my")
@Data
public class MyProperties {
    private String name;
    private int age;
    private List<String> hobbies;
}

// 配置文件
my:
  name: 张三
  age: 25
  hobbies:
    - 编程
    - 运动

// 3. @PropertySource 指定配置文件
@Configuration
@PropertySource("classpath:custom.properties")
public class CustomConfig {
    // ...
}
```

---

## 6. 自动配置原理

### 6.1 核心注解

```java
@SpringBootApplication
= @SpringBootConfiguration
+ @EnableAutoConfiguration
+ @ComponentScan
```

### 6.2 自动配置流程

```
1. @SpringBootApplication 启动
2. @EnableAutoConfiguration 导入 AutoConfigurationImportSelector
3. 扫描 META-INF/spring.factories（SpringBoot 2.x）
   或 META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports（SpringBoot 3.x）
4. 加载所有自动配置类
5. 根据 @Conditional 注解筛选符合条件的配置
6. 注册到 Spring 容器
```

### 6.3 源码分析

```java
// SpringBoot 启动类
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// @SpringBootApplication
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(excludeFilters = { ... })
public @interface SpringBootApplication { }

// @EnableAutoConfiguration
@AutoConfigurationPackage
@Import(AutoConfigurationImportSelector.class)
public @interface EnableAutoConfiguration { }

// AutoConfigurationImportSelector
public class AutoConfigurationImportSelector implements DeferredImportSelector {
    
    @Override
    public String[] selectImports(AnnotationMetadata annotationMetadata) {
        // 1. 获取所有自动配置类
        List<String> configurations = getCandidateConfigurations();
        
        // 2. 去重
        configurations = removeDuplicates(configurations);
        
        // 3. 排除（@Exclude）
        configurations = getExclusionAutoConfigurations(annotationMetadata);
        
        // 4. 过滤（@Conditional）
        configurations = filter(configurations);
        
        return configurations.toArray(new String[0]);
    }
    
    protected List<String> getCandidateConfigurations() {
        // 读取 META-INF/spring.factories
        return SpringFactoriesLoader.loadFactoryNames(
            EnableAutoConfiguration.class, 
            getClassLoader()
        );
    }
}
```

### 6.4 条件注解

```java
// 1. @ConditionalOnClass：类存在时生效
@ConditionalOnClass(DataSource.class)
@Configuration
public class DataSourceAutoConfig { }

// 2. @ConditionalOnMissingClass：类不存在时生效
@ConditionalOnMissingClass("com.example.CustomConfig")
@Configuration
public class DefaultConfig { }

// 3. @ConditionalOnBean：Bean 存在时生效
@ConditionalOnBean(UserService.class)
@Configuration
public class UserServiceConfig { }

// 4. @ConditionalOnMissingBean：Bean 不存在时生效
@ConditionalOnMissingBean
@Bean
public DataSource dataSource() {
    return new HikariDataSource();
}

// 5. @ConditionalOnProperty：配置属性存在时生效
@ConditionalOnProperty(prefix = "my.feature", name = "enabled", havingValue = "true")
@Configuration
public class FeatureConfig { }

// 6. @ConditionalOnWebApplication：Web 应用时生效
@ConditionalOnWebApplication
@Configuration
public class WebConfig { }

// 7. @ConditionalOnExpression：SpEL 表达式为 true 时生效
@ConditionalOnExpression("${my.enabled:true}")
@Configuration
public class ConditionalConfig { }
```

### 6.5 自定义自动配置

```java
// 1. 创建配置类
@Configuration
@ConditionalOnClass(MyService.class)
@EnableConfigurationProperties(MyProperties.class)
public class MyAutoConfiguration {
    
    @Autowired
    private MyProperties properties;
    
    @Bean
    @ConditionalOnMissingBean
    public MyService myService() {
        return new MyService(properties);
    }
}

// 2. 注册自动配置
// resources/META-INF/spring.factories
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.MyAutoConfiguration

// SpringBoot 3.x: resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
com.example.MyAutoConfiguration
```

---

## 7. SpringBoot 实战

### 7.1 整合 MyBatis

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
    map-underscore-to-camel-case: true  # 驼峰命名
```

```java
// Mapper 接口
@Mapper
public interface UserMapper {
    User getById(Long id);
    List<User> list();
    int insert(User user);
    int update(User user);
    int delete(Long id);
}
```

```xml
<!-- Mapper XML -->
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">
    
    <resultMap id="BaseResultMap" type="com.example.entity.User">
        <id column="id" property="id"/>
        <result column="name" property="name"/>
        <result column="age" property="age"/>
    </resultMap>
    
    <select id="getById" resultMap="BaseResultMap">
        SELECT * FROM user WHERE id = #{id}
    </select>
    
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO user (name, age) VALUES (#{name}, #{age})
    </insert>
</mapper>
```

### 7.2 整合 Redis

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

```yaml
# application.yml
spring:
  redis:
    host: localhost
    port: 6379
    password: 
    database: 0
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
```

```java
// Redis 配置
@Configuration
public class RedisConfig {
    
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        
        // JSON 序列化
        Jackson2JsonRedisSerializer<Object> serializer = 
            new Jackson2JsonRedisSerializer<>(Object.class);
        template.setValueSerializer(serializer);
        template.setKeySerializer(new StringRedisSerializer());
        
        return template;
    }
}

// 使用
@Service
public class UserService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    public User getById(Long id) {
        String key = "user:" + id;
        
        // 1. 查缓存
        User user = (User) redisTemplate.opsForValue().get(key);
        if (user != null) {
            return user;
        }
        
        // 2. 查数据库
        user = userMapper.getById(id);
        
        // 3. 写缓存
        if (user != null) {
            redisTemplate.opsForValue().set(key, user, 30, TimeUnit.MINUTES);
        }
        
        return user;
    }
}
```

### 7.3 整合 RabbitMQ

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

```yaml
# application.yml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
    virtual-host: /
    listener:
      simple:
        acknowledge-mode: manual  # 手动确认
```

```java
// 消息生产者
@Service
public class MessageProducer {
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public void send(String message) {
        rabbitTemplate.convertAndSend("my.exchange", "my.routing.key", message);
    }
}

// 消息消费者
@Component
public class MessageConsumer {
    
    @RabbitListener(queues = "my.queue")
    public void handle(Message message, Channel channel) throws IOException {
        try {
            String body = new String(message.getBody());
            System.out.println("收到消息：" + body);
            
            // 手动确认
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception e) {
            // 拒绝消息，重新入队
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, true);
        }
    }
}
```

### 7.4 事务管理

```java
@Service
public class OrderService {
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private InventoryMapper inventoryMapper;
    
    // 声明式事务
    @Transactional(rollbackFor = Exception.class)
    public void createOrder(Order order) {
        // 1. 创建订单
        orderMapper.insert(order);
        
        // 2. 扣减库存
        inventoryMapper.decrease(order.getItemId(), order.getCount());
        
        // 如果抛出异常，两个操作都会回滚
    }
    
    // 事务传播：REQUIRED（默认）
    @Transactional(propagation = Propagation.REQUIRED)
    public void method1() {
        // 加入现有事务或创建新事务
    }
    
    // 事务传播：REQUIRES_NEW
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void method2() {
        // 总是创建新事务，挂起现有事务
    }
    
    // 事务传播：NESTED
    @Transactional(propagation = Propagation.NESTED)
    public void method3() {
        // 嵌套事务，可以独立回滚
    }
}
```

### 7.5 定时任务

```java
// 开启定时任务
@EnableScheduling
@SpringBootApplication
public class Application { }

// 定时任务
@Component
public class ScheduledTasks {
    
    // 每 5 秒执行一次
    @Scheduled(fixedRate = 5000)
    public void task1() {
        System.out.println("任务 1 执行：" + LocalDateTime.now());
    }
    
    // 每天凌晨 1 点执行
    @Scheduled(cron = "0 0 1 * * ?")
    public void task2() {
        System.out.println("任务 2 执行：" + LocalDateTime.now());
    }
    
    // 延迟 5 秒后执行，间隔 10 秒
    @Scheduled(initialDelay = 5000, fixedDelay = 10000)
    public void task3() {
        System.out.println("任务 3 执行：" + LocalDateTime.now());
    }
}
```

### 7.6 异步任务

```java
// 开启异步
@EnableAsync
@SpringBootApplication
public class Application { }

// 配置线程池
@Configuration
public class AsyncConfig {
    
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}

// 异步方法
@Service
public class AsyncService {
    
    @Async("taskExecutor")
    public CompletableFuture<String> asyncTask() {
        System.out.println("异步任务执行：" + Thread.currentThread().getName());
        Thread.sleep(1000);
        return CompletableFuture.completedFuture("完成");
    }
}
```

---

## 8. 最佳实践

### 8.1 项目规范

```
1. 统一响应格式
2. 统一异常处理
3. 统一日志规范
4. 统一参数校验
5. 统一代码风格
```

### 8.2 统一响应格式

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Result<T> {
    
    private Integer code;
    private String message;
    private T data;
    
    public static <T> Result<T> success() {
        return new Result<>(200, "success", null);
    }
    
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }
    
    public static <T> Result<T> fail(Integer code, String message) {
        return new Result<>(code, message, null);
    }
}
```

### 8.3 参数校验

```java
// DTO 类
@Data
public class UserCreateRequest {
    
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度 2-20")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度 6-20")
    private String password;
    
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @Min(value = 1, message = "年龄最小 1 岁")
    @Max(value = 150, message = "年龄最大 150 岁")
    private Integer age;
}

// Controller
@PostMapping
public Result<User> create(@Valid @RequestBody UserCreateRequest request) {
    // 参数校验失败会抛 MethodArgumentNotValidException
    User user = userService.create(request);
    return Result.success(user);
}
```

### 8.4 日志规范

```java
@Slf4j
@Service
public class UserService {
    
    // 1. 使用占位符
    log.info("用户创建成功：userId={}, name={}", user.getId(), user.getName());
    
    // 2. 异常日志
    log.error("用户创建失败", e);
    
    // 3. 避免日志泛滥
    if (log.isDebugEnabled()) {
        log.debug("调试信息：{}", data);
    }
    
    // 4. 生产环境关闭 DEBUG
    // 5. 敏感信息脱敏
    log.info("用户登录：username={}", mask(username));
}
```

### 8.5 性能优化

```java
// 1. 批量操作
// ❌ 循环插入
for (User user : users) {
    userMapper.insert(user);
}

// ✅ 批量插入
userMapper.batchInsert(users);

// 2. 缓存热点数据
@Cacheable(value = "user", key = "#id")
public User getById(Long id) {
    return userMapper.getById(id);
}

// 3. 异步处理
@Async
public void sendEmail(User user) {
    // 发送邮件
}

// 4. 分页查询
Page<User> page = userMapper.page(pageNum, pageSize);

// 5. 避免 N+1 查询
// ❌ N+1 问题
List<Order> orders = orderMapper.list();
for (Order order : orders) {
    User user = userMapper.getById(order.getUserId());  // N 次查询
}

// ✅ 关联查询
List<Order> orders = orderMapper.listWithUser();
```

---

## 💡 常见面试题

1. **Spring IOC 和 AOP 的原理？**
2. **Bean 的生命周期？**
3. **Spring 事务传播机制？**
4. **SpringBoot 自动配置原理？**
5. **Spring MVC 工作流程？**
6. **@Autowired 和 @Resource 的区别？**
7. **SpringBoot 常用 Starter 有哪些？**
8. **如何自定义 Starter？**
9. **SpringBoot 如何实现热部署？**
10. **Spring 循环依赖如何解决？**

---

## 📚 参考资料

- 《Spring 实战》
- 《SpringBoot 实战》
- [Spring 官方文档](https://spring.io/docs)
- [SpringBoot 官方文档](https://spring.io/projects/spring-boot)
- [Spring 源码](https://github.com/spring-projects/spring-framework)

---

> 💡 **学习建议**：Spring/SpringBoot 是 Java 开发的核心框架，建议：
> 1. 理解 IOC 和 AOP 原理
> 2. 掌握 SpringBoot 自动配置
> 3. 实战项目练习
> 4. 阅读源码（从 @SpringBootApplication 开始）
