# 类加载机制

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-04-22  
> 难度：⭐⭐⭐⭐☆  
> 前置知识：[JVM 内存模型](/java/basic/jvm)、[垃圾回收机制](/java/basic/gc)

---

## 📚 目录

[[toc]]

---

## 1. 类加载简介

### 1.1 什么是类加载

**类加载** 是 JVM 将类的 `.class` 文件加载到内存，并进行验证、准备、解析、初始化的过程。

**类加载时机：**

```
Java 源码 (.java)
    ↓ javac 编译
字节码文件 (.class)
    ↓ 类加载器
JVM 内存（Class 对象）
    ↓ 使用
创建对象、调用方法等
```

### 1.2 为什么需要类加载

| 原因 | 说明 |
|------|------|
| **动态加载** | 运行时按需加载类 |
| **安全性** | 验证字节码，防止恶意代码 |
| **隔离性** | 不同类加载器加载的类相互隔离 |
| **扩展性** | 支持自定义类加载器 |

---

## 2. 类加载过程

### 2.1 完整流程

```
加载（Loading）
    ↓
验证（Verification）
    ↓
准备（Preparation）
    ↓
解析（Resolution）
    ↓
初始化（Initialization）
    ↓
使用（Using）
    ↓
卸载（Unloading）
```

### 2.2 加载（Loading）

**通过全限定类名获取二进制字节流**

```java
// 类加载的三种方式
Class<?> clazz1 = Class.forName("com.example.MyClass");  // 常用
Class<?> clazz2 = MyClass.class;                          // 字面量
Class<?> clazz3 = obj.getClass();                         // 通过对象
```

**加载来源：**

| 来源 | 说明 |
|------|------|
| **本地文件** | 从文件系统加载 .class 文件 |
| **JAR 包** | 从 JAR/WAR 文件加载 |
| **网络** | 从远程服务器加载（Applet） |
| **动态生成** | 运行时动态生成（CGLib、ASM） |

### 2.3 验证（Verification）

**确保字节码符合 JVM 规范，保证安全性**

**验证步骤：**

| 步骤 | 说明 |
|------|------|
| **文件格式验证** | 验证魔数、版本号等 |
| **元数据验证** | 验证类的结构（继承、实现） |
| **字节码验证** | 验证指令流安全 |
| **符号引用验证** | 验证常量池中的引用 |

```java
// 验证失败示例
// ❌ 魔数错误：不是有效的 .class 文件
// ❌ 版本不支持：JDK 版本过低
// ❌ 字节码非法：被篡改的 class 文件
```

### 2.4 准备（Preparation）

**为类变量分配内存，设置默认初始值**

```java
class MyClass {
    static int a = 123;           // 准备阶段：a = 0
    static final int b = 456;     // 准备阶段：b = 456（final 直接赋值）
    static String name = "hello"; // 准备阶段：name = null
}
```

**关键点：**
- ✅ 只分配内存，不执行初始化代码
- ✅ 设置默认值（0、null、false 等）
- ✅ `final` 修饰的静态变量直接赋值为指定值

### 2.5 解析（Resolution）

**常量池中的符号引用替换为直接引用**

**符号引用 vs 直接引用：**

| 类型 | 说明 | 示例 |
|------|------|------|
| **符号引用** | 字符串描述 | `"java/lang/String"` |
| **直接引用** | 内存地址/句柄 | `0x12345678` |

**解析内容：**
- 类或接口的解析
- 字段解析
- 方法解析
- 接口方法解析

### 2.6 初始化（Initialization）

**执行类构造器 `<clinit>()` 方法，真正的初始化**

```java
class MyClass {
    static int a = 123;  // 初始化阶段：a = 123
    
    static {
        // 静态代码块，在初始化阶段执行
        System.out.println("初始化");
    }
}
```

**`<clinit>()` 方法特点：**
- ✅ 由编译器自动收集静态变量赋值语句和静态代码块
- ✅ 按源代码顺序执行
- ✅ 线程安全（JVM 自动加锁）
- ✅ 父类的 `<clinit>()` 先于子类执行

---

## 3. 类加载器

### 3.1 类加载器层次

```
Bootstrap ClassLoader（启动类加载器）
    ↑
Extension ClassLoader（扩展类加载器）
    ↑
Application ClassLoader（应用程序类加载器）
    ↑
Custom ClassLoader（自定义类加载器）
```

### 3.2 启动类加载器（Bootstrap ClassLoader）

```
特点：
- C++ 实现（JVM 内部）
- 加载 <JAVA_HOME>/lib 下的核心类
- 无法在 Java 代码中直接获取

加载范围：
- rt.jar（Java 核心类库）
- charsets.jar
- 其他核心类库

示例：
String.class.getClassLoader()  // 返回 null（Bootstrap 加载）
```

### 3.3 扩展类加载器（Extension ClassLoader）

```
特点：
- Java 实现（sun.misc.Launcher$ExtClassLoader）
- 加载 <JAVA_HOME>/lib/ext 下的类
- 父加载器：Bootstrap

加载范围：
- <JAVA_HOME>/lib/ext/*.jar
- 系统属性 java.ext.dirs 指定的目录

示例：
class ExtClassLoaderDemo {
    public static void main(String[] args) {
        ClassLoader extLoader = ClassLoader.getSystemClassLoader().getParent();
        System.out.println(extLoader);  // sun.misc.Launcher$ExtClassLoader
    }
}
```

### 3.4 应用程序类加载器（Application ClassLoader）

```
特点：
- Java 实现（sun.misc.Launcher$AppClassLoader）
- 加载 classpath 下的类
- 父加载器：Extension
- 默认类加载器

加载范围：
- classpath 指定的路径
- 系统属性 java.class.path 指定的目录

示例：
class AppClassLoaderDemo {
    public static void main(String[] args) {
        ClassLoader appLoader = ClassLoader.getSystemClassLoader();
        System.out.println(appLoader);  // sun.misc.Launcher$AppClassLoader
    }
}
```

### 3.5 自定义类加载器

**继承 ClassLoader 类**

```java
import java.io.*;

public class MyClassLoader extends ClassLoader {
    
    private final String classPath;
    
    public MyClassLoader(String classPath) {
        this.classPath = classPath;
    }
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        try {
            // 1. 读取字节码
            byte[] data = loadClassData(name);
            
            // 2. 定义类
            return defineClass(name, data, 0, data.length);
        } catch (IOException e) {
            throw new ClassNotFoundException(name, e);
        }
    }
    
    private byte[] loadClassData(String className) throws IOException {
        // 将类名转换为文件路径
        String filePath = classPath + "/" + className.replace('.', '/') + ".class";
        
        // 读取文件
        try (FileInputStream fis = new FileInputStream(filePath);
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            byte[] buffer = new byte[1024];
            int len;
            while ((len = fis.read(buffer)) != -1) {
                baos.write(buffer, 0, len);
            }
            return baos.toByteArray();
        }
    }
}

// 使用
MyClassLoader loader = new MyClassLoader("/path/to/classes");
Class<?> clazz = loader.loadClass("com.example.MyClass");
Object obj = clazz.newInstance();
```

---

## 4. 双亲委派模型

### 4.1 工作原理

```
收到类加载请求
    ↓
检查是否已加载
    ↓
委托给父加载器
    ↓
父加载器无法加载
    ↓
自己尝试加载
```

**流程图：**

```
        ┌─────────────────────┐
        │  Custom Loader      │
        └──────────┬──────────┘
                   │ 委托
        ┌──────────▼──────────┐
        │  Application Loader │
        └──────────┬──────────┘
                   │ 委托
        ┌──────────▼──────────┐
        │  Extension Loader   │
        └──────────┬──────────┘
                   │ 委托
        ┌──────────▼──────────┐
        │  Bootstrap Loader   │
        └──────────┬──────────┘
                   │ 加载
        ┌──────────▼──────────┐
        │  <JAVA_HOME>/lib    │
        └─────────────────────┘
```

### 4.2 代码实现

```java
protected Class<?> loadClass(String name, boolean resolve)
    throws ClassNotFoundException
{
    synchronized (getClassLoadingLock(name)) {
        // 1. 检查是否已加载
        Class<?> c = findLoadedClass(name);
        
        if (c == null) {
            try {
                // 2. 委托给父加载器
                if (parent != null) {
                    c = parent.loadClass(name, false);
                } else {
                    c = findBootstrapClassOrNull(name);
                }
            } catch (ClassNotFoundException e) {
                // 父加载器无法加载
            }
            
            if (c == null) {
                // 3. 自己尝试加载
                c = findClass(name);
            }
        }
        
        if (resolve) {
            resolveClass(c);
        }
        
        return c;
    }
}
```

### 4.3 优点

| 优点 | 说明 |
|------|------|
| **避免重复加载** | 父加载器已加载的类不会重复加载 |
| **保证安全性** | 防止核心 API 被篡改（如自定义 java.lang.String） |
| **层次清晰** | 类加载器职责分明 |

### 4.4 破坏双亲委派

**场景 1：SPI 机制（JDBC、JNDI）**

```java
// JDBC 驱动加载
// Bootstrap 加载器加载了 java.sql.Driver 接口
// 但具体实现（如 com.mysql.jdbc.Driver）需要应用类加载器加载

// 解决方案：使用线程上下文类加载器
ClassLoader contextLoader = Thread.currentThread().getContextClassLoader();
Class<?> driverClass = contextLoader.loadClass("com.mysql.jdbc.Driver");
```

**场景 2：Tomcat 类加载器**

```
Tomcat 自定义类加载器层次：

Common ClassLoader（公共类）
    ↑
Webapp ClassLoader（每个 Web 应用一个，隔离）
    ↑
Jasper ClassLoader（JSP 编译）

目的：
- Web 应用隔离（不同应用可使用不同版本的库）
- JSP 热部署（重新编译 JSP）
```

**场景 3：热部署/热加载**

```java
// 实现代码热更新
public class HotSwapClassLoader extends ClassLoader {
    
    // 每次加载新的字节码，实现热更新
    @Override
    protected Class<?> findClass(String name) {
        byte[] data = loadLatestClassData(name);  // 加载最新版本
        return defineClass(name, data, 0, data.length);
    }
}
```

---

## 5. 类加载器隔离

### 5.1 隔离规则

```java
// 同一个类被不同加载器加载，视为不同类
ClassLoader loader1 = new MyClassLoader("/path1");
ClassLoader loader2 = new MyClassLoader("/path2");

Class<?> class1 = loader1.loadClass("com.example.MyClass");
Class<?> class2 = loader2.loadClass("com.example.MyClass");

System.out.println(class1 == class2);  // false（不同的类）
```

### 5.2 应用场景

| 场景 | 说明 |
|------|------|
| **OSGi 模块化** | 每个模块独立类加载器 |
| **Tomcat 多应用** | 每个 Web 应用独立类加载器 |
| **插件系统** | 插件与主程序隔离 |
| **热部署** | 新旧版本共存 |

---

## 6. 实战案例

### 6.1 获取类加载器

```java
public class ClassLoaderDemo {
    
    public static void main(String[] args) {
        // 获取各种类加载器
        ClassLoader bootstrapLoader = String.class.getClassLoader();  // null
        ClassLoader extLoader = ClassLoader.getSystemClassLoader().getParent();
        ClassLoader appLoader = ClassLoader.getSystemClassLoader();
        
        System.out.println("Bootstrap: " + bootstrapLoader);  // null
        System.out.println("Extension: " + extLoader);
        System.out.println("Application: " + appLoader);
        
        // 获取当前类的类加载器
        ClassLoader currentLoader = ClassLoaderDemo.class.getClassLoader();
        System.out.println("Current: " + currentLoader);
        
        // 获取线程上下文类加载器
        ClassLoader contextLoader = Thread.currentThread().getContextClassLoader();
        System.out.println("Context: " + contextLoader);
    }
}
```

### 6.2 资源加载

```java
public class ResourceLoader {
    
    public static void main(String[] args) {
        // 方式 1：通过 Class 加载
        InputStream is1 = MyClass.class.getResourceAsStream("/config.properties");
        
        // 方式 2：通过类加载器加载
        InputStream is2 = MyClass.getClassLoader()
            .getResourceAsStream("config.properties");
        
        // 方式 3：通过线程上下文类加载器
        InputStream is3 = Thread.currentThread()
            .getContextClassLoader()
            .getResourceAsStream("config.properties");
        
        // 推荐：方式 3（最灵活，适用于框架开发）
    }
}
```

### 6.3 服务发现（SPI）

```java
// META-INF/services/java.sql.Driver 文件内容
com.mysql.jdbc.Driver
com.oracle.jdbc.Driver

// 使用 ServiceLoader 加载
ServiceLoader<Driver> drivers = ServiceLoader.load(Driver.class);
for (Driver driver : drivers) {
    System.out.println("发现驱动：" + driver);
}
```

### 6.4 自定义类加载器实战

```java
// 加密类加载器（解密后加载）
public class EncryptedClassLoader extends ClassLoader {
    
    private final String classPath;
    private final String decryptKey;
    
    public EncryptedClassLoader(String classPath, String decryptKey) {
        this.classPath = classPath;
        this.decryptKey = decryptKey;
    }
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        try {
            // 1. 读取加密的字节码
            byte[] encryptedData = loadClassData(name);
            
            // 2. 解密
            byte[] decryptedData = decrypt(encryptedData, decryptKey);
            
            // 3. 定义类
            return defineClass(name, decryptedData, 0, decryptedData.length);
        } catch (Exception e) {
            throw new ClassNotFoundException(name, e);
        }
    }
    
    private byte[] decrypt(byte[] data, String key) {
        // 解密逻辑（如 AES、DES）
        return data;
    }
}
```

---

## 7. 常见问题

### 7.1 ClassNotFoundException vs NoClassDefFoundError

| 对比项 | ClassNotFoundException | NoClassDefFoundError |
|--------|---------------------|---------------------|
| **类型** | 受检异常 | 错误（Error） |
| **时机** | 类加载时 | 类使用时 |
| **原因** | 类路径找不到类 | 类加载失败（依赖缺失等） |
| **处理** | try-catch 捕获 | 无法恢复 |

```java
// ClassNotFoundException
try {
    Class.forName("com.example.NonExistentClass");
} catch (ClassNotFoundException e) {
    e.printStackTrace();
}

// NoClassDefFoundError
// 编译时有 MyClass.class
// 运行时 MyClass.class 被删除或依赖类缺失
MyClass obj = new MyClass();  // NoClassDefFoundError
```

### 7.2 类加载顺序

```java
class Parent {
    static {
        System.out.println("Parent 静态代码块");
    }
}

class Child extends Parent {
    static {
        System.out.println("Child 静态代码块");
    }
}

public class Main {
    public static void main(String[] args) {
        new Child();
    }
}

// 输出顺序：
// 1. Parent 静态代码块（父类先初始化）
// 2. Child 静态代码块
// 3. Child 构造方法
```

### 7.3 类卸载条件

```
类卸载条件（同时满足）：
1. 该类的所有实例都已被回收
2. 加载该类的 ClassLoader 已被回收
3. 该类的 Class 对象没有被引用

注意：
- 类的卸载很少发生
- 主要发生在自定义类加载器场景
- Bootstrap 加载器加载的类不会卸载
```

---

## 📝 练习题

### 基础题

1. **类加载过程**：描述类加载的 5 个阶段及其作用

2. **类加载器层次**：列出 3 种类加载器及其加载范围

3. **双亲委派**：解释双亲委派模型的工作原理

### 进阶题

4. **自定义类加载器**：实现一个简单的自定义类加载器

5. **破坏双亲委派**：解释 SPI 机制为什么需要破坏双亲委派

6. **综合练习**：设计一个插件系统，使用类加载器实现插件隔离和热部署

---

## 🔗 参考资料

### 官方文档
- [Java ClassLoader](https://docs.oracle.com/javase/8/docs/api/java/lang/ClassLoader.html)
- [JVM 规范 - 类加载](https://docs.oracle.com/javase/specs/jvms/se11/html/jvms-5.html)

### 推荐书籍
- 📚 《深入理解 Java 虚拟机》（第 3 版）第 7 章：类加载机制
- 📚 《Java 核心技术 卷 I》第 3 章：类加载

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 类加载过程 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 类加载器层次 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 双亲委派模型 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 自定义类加载器 | ⭐⭐⭐⭐ | 理解掌握 |
| 破坏双亲委派 | ⭐⭐⭐⭐ | 理解掌握 |

---

**上一章：** [垃圾回收机制](/java/basic/gc)  
**下一章：** [OOP 实战](/java/basic/oop-practice)

**最后更新**：2026-03-12
