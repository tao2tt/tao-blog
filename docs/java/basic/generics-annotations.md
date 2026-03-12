# 泛型与注解

> 学习日期：2026-03-12  
> 状态：⏳ 待开始  
> 预计完成：2026-03-18

---

## 📚 目录

[[toc]]

---

## 1. 泛型（Generics）

### 1.1 为什么需要泛型

### 1.2 泛型类

```java
public class Box<T> {
    private T value;
    
    public T get() { return value; }
    public void set(T value) { this.value = value; }
}
```

### 1.3 泛型方法

### 1.4 类型通配符

- `?` - 无界通配符
- `? extends T` - 上界通配符
- `? super T` - 下界通配符

### 1.5 类型擦除

---

## 2. 注解（Annotations）

### 2.1 内置注解

- `@Override`
- `@Deprecated`
- `@SuppressWarnings`

### 2.2 元注解

- `@Target`
- `@Retention`
- `@Documented`
- `@Inherited`

### 2.3 自定义注解

### 2.4 注解处理器

---

## 3. 反射（Reflection）

### 3.1 Class 对象

### 3.2 获取构造方法

### 3.3 获取字段

### 3.4 获取方法

---

## 📝 练习题

1. 实现一个泛型工具类
2. 创建一个自定义注解
3. 使用反射动态调用方法

---

## 🔗 参考资料

- 《Effective Java》第 5 章、第 39 条
- [Java 泛型教程](https://docs.oracle.com/javase/tutorial/java/generics/)

---

**最后更新**：2026-03-12
