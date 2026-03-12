# 类加载机制

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-04-01

---

## 📚 目录

[[toc]]

---

## 1. 类加载过程

### 1.1 加载（Loading）

- 通过全限定类名获取二进制字节流
- 将字节流转为方法区的运行时数据结构
- 生成 Class 对象

### 1.2 验证（Verification）

- 文件格式验证
- 元数据验证
- 字节码验证
- 符号引用验证

### 1.3 准备（Preparation）

- 为类变量分配内存
- 设置默认初始值

### 1.4 解析（Resolution）

- 常量池中的符号引用替换为直接引用

### 1.5 初始化（Initialization）

- 执行类构造器 `<clinit>()` 方法
- 执行静态代码块

---

## 2. 类加载器

### 2.1 启动类加载器（Bootstrap ClassLoader）

- C++ 实现
- 加载 `<JAVA_HOME>/lib` 下的核心类

### 2.2 扩展类加载器（Extension ClassLoader）

- Java 实现
- 加载 `<JAVA_HOME>/lib/ext` 下的类

### 2.3 应用程序类加载器（Application ClassLoader）

- Java 实现
- 加载 classpath 下的类

### 2.4 自定义类加载器

```java
public class MyClassLoader extends ClassLoader {
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] data = loadClassData(name);
        return defineClass(name, data, 0, data.length);
    }
    
    private byte[] loadClassData(String className) {
        // 从文件/网络加载字节码
    }
}
```

---

## 3. 双亲委派模型

### 3.1 工作原理

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

### 3.2 优点

- 避免重复加载
- 保证核心类安全

### 3.3 破坏双亲委派

- SPI 机制（JDBC、JNDI）
- Tomcat 类加载器
- 热部署

---

## 4. 类加载时机

- 创建类的实例
- 访问类的静态变量
- 调用类的静态方法
- 使用反射
- 初始化子类
- 启动类（main 方法所在类）

---

## 5. 类加载器隔离

```java
ClassLoader loader1 = new MyClassLoader();
ClassLoader loader2 = new MyClassLoader();

// 同一个类被不同加载器加载，视为不同类
Class<?> class1 = loader1.loadClass("com.example.MyClass");
Class<?> class2 = loader2.loadClass("com.example.MyClass");

System.out.println(class1 == class2); // false
```

---

## 📝 练习题

1. 实现一个自定义类加载器
2. 使用类加载器实现热部署
3. 分析 Tomcat 类加载器结构

---

## 🔗 参考资料

- 《深入理解 Java 虚拟机》第 7 章
- [JVM 规范 - 类加载](https://docs.oracle.com/javase/specs/jvms/se11/html/jvms-5.html)

---

**最后更新**：2026-03-12
