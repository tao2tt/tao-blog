# 泛型与注解

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-03-28  
> 难度：⭐⭐⭐⭐☆  
> 前置知识：[Java 核心语法](/java/basic/core)、[面向对象编程](/java/basic/oop)

---

## 📚 目录

[[toc]]

---

## 1. 泛型（Generics）

### 1.1 为什么需要泛型

**没有泛型的问题：**

```java
// ❌ 问题 1：类型不安全
List list = new ArrayList();
list.add("张三");
list.add(123);  // ✅ 可以添加任何类型

String name = (String) list.get(1);  // ❌ ClassCastException：整数强转为字符串

// ❌ 问题 2：需要强制类型转换
Object obj = list.get(0);
String name = (String) obj;  // 每次获取都要强转
```

**使用泛型的优势：**

```java
// ✅ 类型安全
List<String> list = new ArrayList<>();
list.add("张三");
// list.add(123);  // ❌ 编译错误：只能添加 String

// ✅ 无需强转
String name = list.get(0);  // 自动类型转换

// ✅ 代码可读性更好
Map<String, Integer> map = new HashMap<>();  // 一眼看出 key 和 value 的类型
```

### 1.2 泛型的定义

**泛型（Generics）** 是 Java 5 引入的特性，允许在定义类、接口和方法时使用**类型参数**。

**核心思想：** 将类型作为参数传递，实现类型参数化。

```java
// 泛型类
public class Box<T> {
    private T value;
    
    public T get() {
        return value;
    }
    
    public void set(T value) {
        this.value = value;
    }
}

// 使用
Box<String> stringBox = new Box<>();
stringBox.set("hello");
String value = stringBox.get();  // 自动类型转换

Box<Integer> intBox = new Box<>();
intBox.set(123);
Integer num = intBox.get();
```

### 1.3 泛型类

```java
/**
 * 泛型类定义
 * 
 * @param <T> 类型参数，可以是任何引用类型
 */
public class GenericClass<T> {
    private T data;
    
    public GenericClass(T data) {
        this.data = data;
    }
    
    public T getData() {
        return data;
    }
    
    public void setData(T data) {
        this.data = data;
    }
}

// 使用
GenericClass<String> stringObj = new GenericClass<>("hello");
String str = stringObj.getData();

GenericClass<Integer> intObj = new GenericClass<>(123);
Integer num = intObj.getData();
```

### 1.4 泛型方法

**泛型方法** 是在方法上定义类型参数，可以在普通类或泛型类中定义。

```java
public class GenericMethod {
    
    /**
     * 泛型方法定义
     * 
     * @param <T> 类型参数（在返回值前声明）
     * @param array 泛型数组
     * @return 数组中间的元素
     */
    public static <T> T getMiddle(T[] array) {
        return array[array.length / 2];
    }
    
    /**
     * 泛型方法：打印数组
     */
    public static <T> void printArray(T[] array) {
        for (T element : array) {
            System.out.println(element);
        }
    }
}

// 使用
String[] strings = {"A", "B", "C"};
String middle = GenericMethod.getMiddle(strings);  // 自动推断 T 为 String

Integer[] numbers = {1, 2, 3, 4, 5};
Integer mid = GenericMethod.getMiddle(numbers);  // 自动推断 T 为 Integer

// 调用泛型方法
GenericMethod.printArray(strings);
```

### 1.5 泛型接口

```java
// 定义泛型接口
public interface Generator<T> {
    T next();
}

// 实现泛型接口
public class StringGenerator implements Generator<String> {
    @Override
    public String next() {
        return "hello";
    }
}

// 使用
Generator<String> generator = new StringGenerator();
String value = generator.next();
```

### 1.6 类型通配符

#### 1.6.1 无界通配符 `<?>`

**表示任意类型**

```java
public static void printList(List<?> list) {
    for (Object elem : list) {
        System.out.println(elem);
    }
}

// 可以接收任何类型的 List
printList(new ArrayList<String>());
printList(new ArrayList<Integer>());
```

#### 1.6.2 上界通配符 `<? extends T>`

**表示 T 或其子类**

```java
// 可以接收 Number 或其子类（Integer、Double 等）
public static double sum(List<? extends Number> list) {
    double total = 0.0;
    for (Number num : list) {
        total += num.doubleValue();
    }
    return total;
}

// 使用
List<Integer> integers = Arrays.asList(1, 2, 3);
List<Double> doubles = Arrays.asList(1.1, 2.2, 3.3);

System.out.println(sum(integers));  // 6.0
System.out.println(sum(doubles));   // 6.6
```

**💡 记忆口诀：** 上界只能读不能写（除了 null）

#### 1.6.3 下界通配符 `<? super T>`

**表示 T 或其父类**

```java
// 可以接收 Integer 或其父类（Number、Object）
public static void addNumbers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
    list.add(3);
}

// 使用
List<Integer> integers = new ArrayList<>();
List<Number> numbers = new ArrayList<>();
List<Object> objects = new ArrayList<>();

addNumbers(integers);  // ✅
addNumbers(numbers);   // ✅
addNumbers(objects);   // ✅
```

**💡 记忆口诀：** 下界只能写不能读（读取返回 Object）

#### 1.6.4 PECS 原则

**Producer Extends, Consumer Super**

| 场景 | 通配符 | 说明 |
|------|--------|------|
| **生产者**（只读） | `<? extends T>` | 从集合中读取数据 |
| **消费者**（只写） | `<? super T>` | 向集合中写入数据 |
| **既读又写** | 不使用通配符 | 使用具体类型 |

```java
// 生产者（只读）
public static void printNumbers(List<? extends Number> list) {
    for (Number num : list) {
        System.out.println(num);
    }
    // list.add(1);  // ❌ 编译错误：不能写入
}

// 消费者（只写）
public static void fillNumbers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
    // Number num = list.get(0);  // ❌ 编译错误：读取返回 Object
}
```

### 1.7 类型擦除

**泛型只在编译时有效，运行时会被擦除**

```java
// 编译前（源码）
List<String> list1 = new ArrayList<>();
List<Integer> list2 = new ArrayList<>();

// 编译后（字节码）
List list1 = new ArrayList();  // String 被擦除
List list2 = new ArrayList();  // Integer 被擦除
```

**类型擦除的影响：**

```java
// ❌ 不能使用泛型创建数组
// List<String>[] array = new List<String>[10];  // 编译错误

// ❌ 不能使用 instanceof 检查泛型类型
List<String> list = new ArrayList<>();
// if (list instanceof List<String>) {}  // 编译错误

// ✅ 正确做法
if (list instanceof List) {}  // 只能检查原始类型

// ❌ 不能创建泛型实例
// T obj = new T();  // 编译错误

// ✅ 正确做法：通过 Class 对象
public class Factory<T> {
    private Class<T> clazz;
    
    public Factory(Class<T> clazz) {
        this.clazz = clazz;
    }
    
    public T createInstance() throws Exception {
        return clazz.newInstance();
    }
}
```

---

## 2. 注解（Annotations）

### 2.1 什么是注解

**注解（Annotation）** 是 Java 5 引入的元数据机制，用于为代码提供额外信息。

**作用：**
- ✅ 编译检查（如 `@Override`）
- ✅ 代码生成（如 Lombok）
- ✅ 运行时处理（如 Spring 的 `@Autowired`）

### 2.2 内置注解

#### 2.2.1 `@Override`

**表示方法重写**

```java
class Parent {
    void speak() {
        System.out.println("动物叫");
    }
}

class Dog extends Parent {
    @Override  // ✅ 编译检查：确保是重写父类方法
    void speak() {
        System.out.println("汪汪汪");
    }
    
    // @Override
    // void bark() {}  // ❌ 编译错误：不是重写父类方法
}
```

#### 2.2.2 `@Deprecated`

**表示已过时，不推荐使用**

```java
/**
 * 已过时的方法
 * 
 * @deprecated 请使用新方法 {@link #newMethod()}
 */
@Deprecated
public void oldMethod() {
    System.out.println("旧方法");
}

// 使用
obj.oldMethod();  // ⚠️ IDE 会显示删除线警告
```

#### 2.2.3 `@SuppressWarnings`

**抑制编译器警告**

```java
// 抑制所有警告
@SuppressWarnings("all")
public void method1() {
    // ...
}

// 抑制特定警告
@SuppressWarnings({"unchecked", "rawtypes"})
public void method2() {
    List list = new ArrayList();  // 不会显示未使用泛型警告
}

// 常见警告类型
// "unchecked" - 未检查的转换
// "deprecation" - 使用已过时的 API
// "rawtypes" - 使用原始类型
// "resource" - 未关闭资源
```

### 2.3 元注解

**元注解是用于注解其他注解的注解**

#### 2.3.1 `@Target`

**指定注解可以应用的位置**

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Target;

// 只能用于类
@Target(ElementType.TYPE)
@interface ClassAnnotation { }

// 只能用于方法
@Target(ElementType.METHOD)
@interface MethodAnnotation { }

// 可以用于多个位置
@Target({ElementType.FIELD, ElementType.METHOD})
@interface FieldOrMethodAnnotation { }

// ElementType 枚举值：
// TYPE - 类、接口、枚举
// FIELD - 字段
// METHOD - 方法
// PARAMETER - 参数
// CONSTRUCTOR - 构造方法
// LOCAL_VARIABLE - 局部变量
```

#### 2.3.2 `@Retention`

**指定注解的保留策略（生命周期）**

```java
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

// 源码级别，编译后丢弃
@Retention(RetentionPolicy.SOURCE)
@interface SourceAnnotation { }

// 类文件级别，运行时不可见
@Retention(RetentionPolicy.CLASS)
@interface ClassAnnotation { }

// 运行时级别，可以通过反射获取（最常用）
@Retention(RetentionPolicy.RUNTIME)
@interface RuntimeAnnotation { }
```

#### 2.3.3 `@Documented`

**指定注解会被包含在 Javadoc 中**

```java
@Documented
@interface MyAnnotation {
    String value();
}
```

#### 2.3.4 `@Inherited`

**指定注解可以被子类继承**

```java
@Inherited
@interface InheritedAnnotation { }

@InheritedAnnotation
class Parent { }

class Child extends Parent {
    // Child 也会继承 InheritedAnnotation
}
```

### 2.4 自定义注解

#### 2.4.1 基础语法

```java
import java.lang.annotation.*;

// 定义注解
@Retention(RetentionPolicy.RUNTIME)  // 运行时可见
@Target(ElementType.METHOD)           // 只能用于方法
@interface MyAnnotation {
    // 声明属性（类似方法）
    String value();          // value 属性（特殊，可省略属性名）
    int count() default 1;   // 带默认值
    String name() default "";
}

// 使用注解
public class MyClass {
    
    @MyAnnotation(value = "测试", count = 5)
    public void method1() {
        // ...
    }
    
    @MyAnnotation("简写")  // 只有 value 属性时可省略
    public void method2() {
        // ...
    }
}
```

#### 2.4.2 注解属性类型

```java
@interface ComplexAnnotation {
    // 基本类型
    int intValue();
    String stringValue();
    boolean booleanValue();
    
    // 数组
    int[] intArray();
    String[] stringArray() default {"a", "b"};
    
    // 枚举
    ElementType elementType();
    
    // 注解
    MyAnnotation annotation();
    
    // Class
    Class<?> clazz();
}
```

### 2.5 注解处理器

**通过反射获取注解信息**

```java
import java.lang.reflect.Method;

// 定义注解
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface MyTest {
    String value() default "";
}

// 使用注解
public class TestClass {
    
    @MyTest("测试方法 1")
    public void testMethod1() {
        System.out.println("执行测试 1");
    }
    
    @MyTest("测试方法 2")
    public void testMethod2() {
        System.out.println("执行测试 2");
    }
    
    public void normalMethod() {  // 没有注解
        System.out.println("普通方法");
    }
}

// 注解处理器
public class AnnotationProcessor {
    public static void main(String[] args) throws Exception {
        Class<?> clazz = TestClass.class;
        
        // 获取所有方法
        Method[] methods = clazz.getDeclaredMethods();
        
        for (Method method : methods) {
            // 检查是否有 MyTest 注解
            if (method.isAnnotationPresent(MyTest.class)) {
                // 获取注解
                MyTest annotation = method.getAnnotation(MyTest.class);
                System.out.println("方法：" + method.getName());
                System.out.println("注解值：" + annotation.value());
                
                // 调用方法
                method.invoke(clazz.newInstance());
            }
        }
    }
}
```

---

## 3. 实战案例

### 3.1 泛型工具类

```java
/**
 * 泛型工具类
 */
public class GenericUtils {
    
    /**
     * 交换数组中的两个元素
     */
    public static <T> void swap(T[] array, int i, int j) {
        T temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    
    /**
     * 将数组转为 List
     */
    public static <T> List<T> asList(T... elements) {
        List<T> list = new ArrayList<>();
        for (T element : elements) {
            list.add(element);
        }
        return list;
    }
    
    /**
     * 填充数组
     */
    public static <T> void fill(T[] array, T value) {
        for (int i = 0; i < array.length; i++) {
            array[i] = value;
        }
    }
}

// 使用
String[] strings = {"A", "B", "C"};
GenericUtils.swap(strings, 0, 2);  // ["C", "B", "A"]

List<Integer> list = GenericUtils.asList(1, 2, 3, 4, 5);
```

### 3.2 简易版 Spring 注解

```java
// 定义@Component 注解
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@interface Component {
    String value() default "";
}

// 定义@Autowired 注解
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@interface Autowired { }

// 使用注解
@Component("userService")
class UserService {
    public void sayHello() {
        System.out.println("Hello from UserService");
    }
}

@Component("userController")
class UserController {
    @Autowired
    private UserService userService;
}

// 简易 IOC 容器
class ApplicationContext {
    private Map<String, Object> beans = new HashMap<>();
    
    public ApplicationContext(String packageName) throws Exception {
        // 扫描包下的所有类
        // 创建带有@Component 的实例
        // 注入带有@Autowired 的字段
    }
    
    public Object getBean(String name) {
        return beans.get(name);
    }
}
```

---

## 📝 练习题

### 基础题

1. **泛型类练习**：创建一个泛型类 Pair<K, V>，可以存储一对键值对，提供 getter/setter 方法

2. **泛型方法练习**：编写一个泛型方法，统计数组中某个元素出现的次数

3. **自定义注解练习**：创建一个@MaxLength 注解，用于限制字符串最大长度

### 进阶题

4. **通配符练习**：编写一个方法，可以计算任何 Number 子类型 List 的总和

5. **注解处理器练习**：实现一个简单的测试框架，使用@MyTest 注解标记测试方法并执行

6. **综合练习**：使用泛型和注解实现一个简单的 ORM 框架（将对象映射到数据库表）

---

## 🔗 参考资料

### 官方文档
- [Java 泛型教程](https://docs.oracle.com/javase/tutorial/java/generics/index.html)
- [Java 注解教程](https://docs.oracle.com/javase/tutorial/java/annotations/index.html)

### 推荐书籍
- 📚 《Effective Java》第 5 章：泛型
- 📚 《Java 核心技术 卷 I》第 12 章：注解

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 泛型类/方法 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 类型通配符 | ⭐⭐⭐⭐ | 理解掌握 |
| PECS 原则 | ⭐⭐⭐⭐ | 理解掌握 |
| 内置注解 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 自定义注解 | ⭐⭐⭐⭐ | 理解掌握 |
| 注解处理器 | ⭐⭐⭐ | 了解 |

---

**上一章：** [面向对象编程](/java/basic/oop)  
**下一章：** [Java 21 新特性](/java/basic/java21)

**最后更新**：2026-03-12
