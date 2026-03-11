# Spring Security

> 学习日期：2026-03-11  
> 状态：⏳ 待开始  
> 预计完成：2026-04-20

---

## 📚 目录

[[toc]]

---

## 1. Spring Security 概述

### 1.1 什么是 Spring Security

**Spring Security** 是 Spring 生态的安全框架，提供认证、授权、攻击防护等功能。

**核心功能：**
- 用户认证（Authentication）
- 权限授权（Authorization）
- 会话管理
- CSRF 防护
- CORS 配置

### 1.2 安全术语

| 术语 | 说明 |
|------|------|
| Authentication | 认证，验证用户身份 |
| Authorization | 授权，验证用户权限 |
| Principal | 当前登录用户 |
| GrantedAuthority | 授予的权限 |
| Role | 角色，权限的集合 |

---

## 2. 核心概念

### 2.1 认证流程

```
用户请求
  ↓
AuthenticationFilter（拦截请求）
  ↓
AuthenticationManager（认证管理器）
  ↓
UserDetailsService（加载用户信息）
  ↓
PasswordEncoder（密码验证）
  ↓
SecurityContext（存储认证信息）
```

### 2.2 核心类

```java
// UserDetailsService - 加载用户信息
public interface UserDetailsService {
    UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;
}

// UserDetails - 用户详情
public interface UserDetails {
    Collection<? extends GrantedAuthority> getAuthorities();
    String getPassword();
    String getUsername();
    boolean isAccountNonExpired();
    boolean isAccountNonLocked();
    boolean isCredentialsNonExpired();
    boolean isEnabled();
}

// GrantedAuthority - 权限
public interface GrantedAuthority {
    String getAuthority();
}
```

---

## 3. Spring Security 6 配置

### 3.1 基础配置

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            );
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### 3.2 自定义 UserDetailsService

```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("用户不存在"));
        
        List<GrantedAuthority> authorities = user.getRoles().stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
            .collect(Collectors.toList());
        
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            authorities
        );
    }
}
```

---

## 4. JWT 认证

### 4.1 JWT 结构

```
JWT = Header.Payload.Signature

Header: {"alg": "HS256", "typ": "JWT"}
Payload: {"sub": "123", "name": "John", "exp": 1516239022}
Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

### 4.2 JWT 工具类

```java
@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    // 生成 Token
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(SignatureAlgorithm.HS256, secret)
            .compact();
    }
    
    // 验证 Token
    public Boolean validateToken(String token, UserDetails userDetails) {
        String username = getUsernameFromToken(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
    
    // 获取用户名
    public String getUsernameFromToken(String token) {
        return Jwts.parser()
            .setSigningKey(secret)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
    
    private Boolean isTokenExpired(String token) {
        Date expiration = Jwts.parser()
            .setSigningKey(secret)
            .parseClaimsJws(token)
            .getBody()
            .getExpiration();
        return expiration.before(new Date());
    }
}
```

### 4.3 JWT 认证过滤器

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) {
        String token = getTokenFromRequest(request);
        
        if (token != null && jwtUtil.validateToken(token, userDetailsService)) {
            String username = jwtUtil.getUsernameFromToken(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
    
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

---

## 5. 方法级权限控制

### 5.1 启用方法安全

```java
@Configuration
@EnableMethodSecurity  // Spring Security 6
public class MethodSecurityConfig {
}
```

### 5.2 权限注解

```java
@Service
public class UserService {
    
    // 需要认证
    @PreAuthorize("isAuthenticated()")
    public User getCurrentUser() { }
    
    // 需要角色
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() { }
    
    // 需要权限
    @PreAuthorize("hasAuthority('USER:DELETE')")
    public void deleteUser(Long id) { }
    
    // 表达式
    @PreAuthorize("#userId == authentication.principal.id")
    public User getUserById(Long userId) { }
    
    // 后置校验
    @PostAuthorize("returnObject.owner == authentication.name")
    public Document getDocument(Long id) { }
}
```

---

## 6. OAuth2 认证

### 6.1 OAuth2 流程

```
1. 用户访问客户端
2. 客户端重定向到授权服务器
3. 用户登录并授权
4. 授权服务器返回授权码
5. 客户端用授权码换取访问令牌
6. 客户端用访问令牌访问资源
```

### 6.2 OAuth2 配置

```java
@Configuration
@EnableWebSecurity
public class OAuth2Config {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/login")
                .defaultSuccessUrl("/home")
            );
        
        return http.build();
    }
}
```

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
```

---

## 7. 实战：RBAC 权限系统

### 7.1 数据库设计

```sql
-- 用户表
CREATE TABLE `user` (
    `id` bigint PRIMARY KEY,
    `username` varchar(50) UNIQUE,
    `password` varchar(100),
    `enabled` tinyint DEFAULT 1
);

-- 角色表
CREATE TABLE `role` (
    `id` bigint PRIMARY KEY,
    `name` varchar(50) UNIQUE  -- ROLE_ADMIN, ROLE_USER
);

-- 权限表
CREATE TABLE `permission` (
    `id` bigint PRIMARY KEY,
    `name` varchar(50) UNIQUE,  -- USER:CREATE, USER:DELETE
    `url` varchar(100)
);

-- 用户角色关联
CREATE TABLE `user_role` (
    `user_id` bigint,
    `role_id` bigint,
    PRIMARY KEY (`user_id`, `role_id`)
);

-- 角色权限关联
CREATE TABLE `role_permission` (
    `role_id` bigint,
    `permission_id` bigint,
    PRIMARY KEY (`role_id`, `permission_id`)
);
```

### 7.2 动态权限加载

```java
@Service
public class DynamicSecurityService implements FilterInvocationSecurityMetadataSource {
    
    @Autowired
    private PermissionMapper permissionMapper;
    
    private AntPathMatcher pathMatcher = new AntPathMatcher();
    
    @Override
    public Collection<ConfigAttribute> getAttributes(Object object) {
        FilterInvocation fi = (FilterInvocation) object;
        String url = fi.getRequestUrl();
        
        List<Permission> permissions = permissionMapper.findAll();
        for (Permission permission : permissions) {
            if (pathMatcher.match(permission.getUrl(), url)) {
                return SecurityConfig.createList(permission.getName());
            }
        }
        return SecurityConfig.createList("ROLE_USER");
    }
    
    @Override
    public Collection<ConfigAttribute> getAllConfigAttributes() {
        return null;
    }
    
    @Override
    public boolean supports(Class<?> clazz) {
        return FilterInvocation.class.isAssignableFrom(clazz);
    }
}
```

---

## 8. 最佳实践

### 8.1 密码加密

```java
// 使用 BCrypt
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);  // strength 越大越安全
}

// 多编码器支持
@Bean
public PasswordEncoder passwordEncoder() {
    return new DelegatingPasswordEncoder(
        "bcrypt",
        Map.of(
            "bcrypt", new BCryptPasswordEncoder(),
            "pbkdf2", Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8()
        )
    );
}
```

### 8.2 CSRF 防护

```java
http.csrf(csrf -> csrf
    .ignoringRequestMatchers("/api/**")  // API 接口通常关闭 CSRF
    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
);
```

### 8.3 CORS 配置

```java
@Bean
public CorsFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    
    return new CorsFilter(source);
}
```

---

## 📝 待办事项

- [ ] Spring Security 基础配置
- [ ] 自定义 UserDetailsService
- [ ] JWT 认证实现
- [ ] 方法级权限控制
- [ ] OAuth2 第三方登录
- [ ] RBAC 权限系统实战
- [ ] 动态权限管理

---

**推荐资源：**
- 📚 《Spring Security 实战》
- 📖 Spring Security 官方文档
- 🔗 JWT.io
