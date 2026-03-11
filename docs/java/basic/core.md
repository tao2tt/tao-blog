# Java 核心语法

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-25

---

## 📚 目录

[[toc]]
---

## 1. Java 简介

### 1.1 Java 发展历史

| 版本 | 发布时间 | 重要特性 |
|------|----------|----------|
| JDK 1.0 | 1996 年 | Java 诞生 |
| JDK 1.5 | 2004 年 | 泛型、枚举、注解、自动装箱 |
| JDK 1.8 | 2014 年 | Lambda 表达式、Stream API、默认方法 |
| JDK 11 | 2018 年 | LTS 版本、var 局部变量推断 |
| JDK 17 | 2021 年 | LTS 版本、sealed 类、pattern matching |
| JDK 21 | 2023 年 | LTS 版本、虚拟线程、record pattern |

### 1.2 Java 三大版本

- **Java SE**（Standard Edition）：标准版，桌面应用开发
- **Java EE**（Enterprise Edition）：企业版，Web 应用开发（现更名为 Jakarta EE）
- **Java ME**（Micro Edition）：微型版，嵌入式设备开发

### 1.3 JVM、JRE、JDK 的区别

```
JDK (Java Development Kit)
├── JRE (Java Runtime Environment)
│   └── JVM (Java Virtual Machine)
└── 开发工具 (javac, java, javadoc 等)
```

- **JVM**：Java 虚拟机，负责字节码执行
- **JRE**：Java 运行时环境 = JVM + 核心类库
- **JDK**：Java 开发工具包 = JRE + 开发工具

### 1.4 Java 特性

- ✅ **跨平台性**：Write Once, Run Anywhere（WORA）
- ✅ **面向对象**：封装、继承、多态
- ✅ **安全性**：字节码验证、沙箱机制
- ✅ **多线程**：内置线程支持
- ✅ **自动内存管理**：垃圾回收机制（GC）
- ✅ **健壮性**：强类型、异常处理

---

## 2. 变量与数据类型

### 2.1 变量声明

```java
// 基本语法
数据类型 变量名 = 值;

// 示例
int age = 25;
String name = "涛哥";
double salary = 15000.50;
```

### 2.2 数据类型分类

```
Java 数据类型
├── 基本数据类型（8 种）
│   ├── 整数类型：byte、short、int、long
│   ├── 浮点类型：float、double
│   ├── 字符类型：char
│   └── 布尔类型：boolean
└── 引用数据类型
    ├── 类：String、Object、自定义类等
    ├── 接口：Interface
    └── 数组：Array
```

### 2.3 基本数据类型详解

| 类型 | 位数 | 取值范围 | 默认值 | 示例 |
|------|------|----------|--------|------|
| **byte** | 8 位 | -128 ~ 127 | 0 | `byte b = 100;` |
| **short** | 16 位 | -32,768 ~ 32,767 | 0 | `short s = 1000;` |
| **int** | 32 位 | -2³¹ ~ 2³¹-1 | 0 | `int i = 100000;` |
| **long** | 64 位 | -2⁶³ ~ 2⁶³-1 | 0L | `long l = 100000L;` |
| **float** | 32 位 | 单精度浮点数 | 0.0f | `float f = 3.14f;` |
| **double** | 64 位 | 双精度浮点数 | 0.0d | `double d = 3.14159;` |
| **char** | 16 位 | '\u0000' ~ '\uffff' | '\u0000' | `char c = 'A';` |
| **boolean** | - | true / false | false | `boolean flag = true;` |

### 2.4 类型转换

#### 自动类型转换（隐式）

```java
// 小类型 → 大类型，自动转换
byte b = 10;
int i = b;  // byte → int，自动

int i2 = 100;
double d = i2;  // int → double，自动
```

#### 强制类型转换（显式）

```java
// 大类型 → 小类型，需要强制转换
double d = 3.14;
int i = (int) d;  // double → int，结果为 3

long l = 100L;
byte b = (byte) l;  // long → byte，可能丢失精度
```

#### 字符串转换

```java
// 数字 → 字符串
int num = 100;
String str1 = String.valueOf(num);
String str2 = Integer.toString(num);
String str3 = num + "";

// 字符串 → 数字
String str = "100";
int num1 = Integer.parseInt(str);
double num2 = Double.parseDouble(str);
long num3 = Long.parseLong(str);
```

### 2.5 包装类

| 基本类型 | 包装类 | 示例 |
|----------|--------|------|
| byte | Byte | `Integer.valueOf("100")` |
| short | Short | `Short.valueOf("100")` |
| int | Integer | `Integer.valueOf("100")` |
| long | Long | `Long.valueOf("100")` |
| float | Float | `Float.valueOf("3.14")` |
| double | Double | `Double.valueOf("3.14")` |
| char | Character | `Character.valueOf('A')` |
| boolean | Boolean | `Boolean.valueOf("true")` |

```java
// 自动装箱/拆箱（JDK 1.5+）
Integer i = 100;      // 自动装箱
int j = i;            // 自动拆箱

// 缓存池（-128 ~ 127）
Integer a = 127;
Integer b = 127;
System.out.println(a == b);  // true，使用缓存

Integer c = 128;
Integer d = 128;
System.out.println(c == d);  // false，新对象
```

---

## 3. 运算符

### 3.1 算术运算符

| 运算符 | 说明 | 示例 |
|--------|------|------|
| `+` | 加法 | `a + b` |
| `-` | 减法 | `a - b` |
| `*` | 乘法 | `a * b` |
| `/` | 除法 | `a / b` |
| `%` | 取模 | `a % b` |
| `++` | 自增 | `a++` / `++a` |
| `--` | 自减 | `a--` / `--a` |

```java
int a = 10;
int b = 3;

System.out.println(a / b);    // 3（整数除法）
System.out.println(a % b);    // 1（取模）
System.out.println((double) a / b);  // 3.333...（浮点除法）

// ++ 前置 vs 后置
int x = 5;
int y = x++;  // y = 5, x = 6（先赋值后自增）
int z = ++x;  // z = 7, x = 7（先自增后赋值）
```

### 3.2 关系运算符

| 运算符 | 说明 | 示例 | 结果 |
|--------|------|------|------|
| `==` | 等于 | `a == b` | boolean |
| `!=` | 不等于 | `a != b` | boolean |
| `>` | 大于 | `a > b` | boolean |
| `<` | 小于 | `a < b` | boolean |
| `>=` | 大于等于 | `a >= b` | boolean |
| `<=` | 小于等于 | `a <= b` | boolean |

```java
int a = 10, b = 20;
System.out.println(a == b);   // false
System.out.println(a != b);   // true
System.out.println(a > b);    // false
```

### 3.3 逻辑运算符

| 运算符 | 说明 | 示例 |
|--------|------|------|
| `&&` | 短路与 | `a && b` |
| `||` | 短路或 | `a \|\| b` |
| `!` | 非 | `!a` |
| `&` | 按位与/逻辑与 | `a & b` |
| `\|` | 按位或/逻辑或 | `a \| b` |
| `^` | 按位异或/逻辑异或 | `a ^ b` |

```java
boolean a = true, b = false;

System.out.println(a && b);   // false（短路与）
System.out.println(a || b);   // true（短路或）
System.out.println(!a);       // false

// 短路特性
int x = 5;
if (x > 10 && x++ > 5) {
    // 不会执行，因为 x > 10 为 false，短路不执行 x++
}
System.out.println(x);  // 5
```

### 3.4 位运算符

| 运算符 | 说明 | 示例 |
|--------|------|------|
| `&` | 按位与 | `a & b` |
| `\|` | 按位或 | `a \| b` |
| `^` | 按位异或 | `a ^ b` |
| `~` | 按位取反 | `~a` |
| `<<` | 左移 | `a << 2` |
| `>>` | 右移（带符号） | `a >> 2` |
| `>>>` | 右移（无符号） | `a >>> 2` |

```java
int a = 12;  // 0000 1100
int b = 5;   // 0000 0101

System.out.println(a & b);   // 4  (0000 0100)
System.out.println(a | b);   // 13 (0000 1101)
System.out.println(a ^ b);   // 9  (0000 1001)
System.out.println(a << 1);  // 24 (0001 1000)，相当于 a * 2
System.out.println(a >> 1);  // 6  (0000 0110)，相当于 a / 2
```

### 3.5 赋值运算符

| 运算符 | 说明 | 示例 |
|--------|------|------|
| `=` | 赋值 | `a = 10` |
| `+=` | 加后赋值 | `a += 5` |
| `-=` | 减后赋值 | `a -= 5` |
| `*=` | 乘后赋值 | `a *= 5` |
| `/=` | 除后赋值 | `a /= 5` |
| `%=` | 取模后赋值 | `a %= 5` |

### 3.6 三元运算符

```java
// 语法：条件 ? 表达式 1 : 表达式 2
int a = 10, b = 20;
int max = (a > b) ? a : b;  // max = 20

// 嵌套使用
int score = 85;
String grade = (score >= 90) ? "A" : 
               (score >= 80) ? "B" : 
               (score >= 70) ? "C" : "D";
```

---

## 4. 流程控制

### 4.1 if-else 语句

```java
// 基本 if
if (age >= 18) {
    System.out.println("成年人");
}

// if-else
if (age >= 18) {
    System.out.println("成年人");
} else {
    System.out.println("未成年人");
}

// if-else if-else
if (score >= 90) {
    grade = "A";
} else if (score >= 80) {
    grade = "B";
} else if (score >= 70) {
    grade = "C";
} else {
    grade = "D";
}
```

### 4.2 switch 语句

```java
// 传统 switch
int day = 3;
switch (day) {
    case 1:
        System.out.println("星期一");
        break;
    case 2:
        System.out.println("星期二");
        break;
    case 3:
        System.out.println("星期三");
        break;
    default:
        System.out.println("其他");
}

// JDK 1.5+ 支持 String
String fruit = "apple";
switch (fruit) {
    case "apple":
        System.out.println("苹果");
        break;
    case "banana":
        System.out.println("香蕉");
        break;
}

// JDK 14+ switch 表达式（新特性）
String result = switch (day) {
    case 1, 2, 3, 4, 5 -> "工作日";
    case 6, 7 -> "周末";
    default -> "未知";
};
```

### 4.3 for 循环

```java
// 基本 for 循环
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}

// 增强 for 循环（foreach）
int[] numbers = {1, 2, 3, 4, 5};
for (int num : numbers) {
    System.out.println(num);
}

// 二维数组遍历
int[][] matrix = {{1, 2}, {3, 4}, {5, 6}};
for (int[] row : matrix) {
    for (int cell : row) {
        System.out.println(cell);
    }
}
```

### 4.4 while 循环

```java
// while 循环
int i = 0;
while (i < 5) {
    System.out.println(i);
    i++;
}

// do-while 循环（至少执行一次）
int j = 0;
do {
    System.out.println(j);
    j++;
} while (j < 5);
```

### 4.5 跳转语句

```java
// break - 跳出循环
for (int i = 0; i < 10; i++) {
    if (i == 5) {
        break;  // 跳出整个循环
    }
    System.out.println(i);  // 输出 0-4
}

// continue - 跳过本次循环
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) {
        continue;  // 跳过偶数
    }
    System.out.println(i);  // 输出 1,3,5,7,9
}

// 带标签的 break（跳出指定循环）
outer:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (i == 1 && j == 1) {
            break outer;  // 跳出外层循环
        }
        System.out.println(i + "," + j);
    }
}
```

---

## 5. 数组

### 5.1 数组声明与初始化

```java
// 声明
int[] arr1;
int arr2[];

// 静态初始化
int[] arr3 = {1, 2, 3, 4, 5};
String[] names = {"张三", "李四", "王五"};

// 动态初始化
int[] arr4 = new int[5];  // 长度为 5，默认值 0
String[] arr5 = new String[3];  // 默认值 null

// 先声明后初始化
int[] arr6;
arr6 = new int[]{1, 2, 3};
```

### 5.2 数组操作

```java
int[] arr = {1, 2, 3, 4, 5};

// 获取长度
int length = arr.length;  // 5

// 访问元素
int first = arr[0];  // 1
arr[0] = 10;  // 修改元素

// 遍历数组
for (int i = 0; i < arr.length; i++) {
    System.out.println(arr[i]);
}

// 增强 for 循环
for (int num : arr) {
    System.out.println(num);
}

// Arrays 工具类
import java.util.Arrays;

Arrays.sort(arr);  // 排序
Arrays.fill(arr, 0);  // 填充
int index = Arrays.binarySearch(arr, 3);  // 二分查找
String str = Arrays.toString(arr);  // 转字符串
```

### 5.3 二维数组

```java
// 声明与初始化
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// 访问元素
int val = matrix[1][2];  // 6

// 遍历
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.println(matrix[i][j]);
    }
}

// 不规则数组
int[][] irregular = new int[3][];
irregular[0] = new int[2];
irregular[1] = new int[3];
irregular[2] = new int[4];
```

---

## 6. 方法

### 6.1 方法定义

```java
// 基本语法
修饰符 返回值类型 方法名 (参数列表) {
    // 方法体
    return 返回值;
}

// 示例
public int add(int a, int b) {
    return a + b;
}

// 无返回值
public void print(String msg) {
    System.out.println(msg);
}

// 无参数
public int getRandom() {
    return (int) (Math.random() * 100);
}
```

### 6.2 方法调用

```java
// 基本调用
int result = add(10, 20);

// 方法重载（Overload）
public int add(int a, int b) {
    return a + b;
}

public double add(double a, double b) {
    return a + b;
}

public int add(int a, int b, int c) {
    return a + b + c;
}

// 可变参数
public int sum(int... numbers) {
    int total = 0;
    for (int num : numbers) {
        total += num;
    }
    return total;
}
sum(1, 2, 3);      // 6
sum(1, 2, 3, 4, 5); // 15
```

### 6.3 参数传递

```java
// 基本类型：值传递
public void changeValue(int x) {
    x = 100;
}
int a = 10;
changeValue(a);
System.out.println(a);  // 10，原值不变

// 引用类型：引用传递（传递的是引用的副本）
public void changeArray(int[] arr) {
    arr[0] = 100;
}
int[] nums = {1, 2, 3};
changeArray(nums);
System.out.println(nums[0]);  // 100，原数组被修改
```

### 6.4 递归方法

```java
// 阶乘
public long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// 斐波那契数列
public int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// 递归遍历目录（示例）
public void listFiles(File dir, int level) {
    File[] files = dir.listFiles();
    for (File file : files) {
        System.out.println("  ".repeat(level) + file.getName());
        if (file.isDirectory()) {
            listFiles(file, level + 1);
        }
    }
}
```

---

## 7. 面向对象基础

### 7.1 类与对象

```java
// 类的定义
public class Person {
    // 成员变量（属性）
    private String name;
    private int age;
    
    // 构造方法
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // 成员方法
    public void sayHello() {
        System.out.println("Hello, I'm " + name);
    }
    
    // Getter/Setter
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
}

// 创建对象
Person p = new Person("涛哥", 30);
p.sayHello();
```

### 7.2 构造方法

```java
public class Person {
    private String name;
    private int age;
    
    // 无参构造
    public Person() {
    }
    
    // 有参构造
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // 构造方法重载
    public Person(String name) {
        this(name, 0);  // 调用其他构造方法
    }
}
```

### 7.3 this 关键字

```java
public class Person {
    private String name;
    
    public Person(String name) {
        this.name = name;  // this 指当前对象
    }
    
    public void introduce() {
        System.out.println("I'm " + this.name);
    }
    
    // 调用其他方法
    public void method1() {
        this.method2();  // this 可省略
    }
    
    public void method2() {
        // ...
    }
}
```

### 7.4 static 关键字

```java
public class Person {
    // 静态变量（类变量）
    private static int count = 0;
    
    // 静态方法
    public static int getCount() {
        return count;
    }
    
    // 静态代码块
    static {
        System.out.println("静态代码块执行");
    }
    
    public Person() {
        count++;
    }
}

// 调用
Person.count = 10;  // 通过类名访问
Person.getCount();
```

### 7.5 封装

```java
public class Person {
    // private 私有属性
    private String name;
    private int age;
    
    // public 方法提供访问
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        // 可以在这里添加验证逻辑
        if (name != null && !name.isEmpty()) {
            this.name = name;
        }
    }
    
    public int getAge() {
        return age;
    }
    
    public void setAge(int age) {
        if (age > 0 && age < 150) {
            this.age = age;
        }
    }
}
```

### 7.6 继承

```java
// 父类
public class Animal {
    protected String name;
    
    public void eat() {
        System.out.println("吃东西");
    }
}

// 子类
public class Dog extends Animal {
    private String breed;
    
    @Override
    public void eat() {
        System.out.println("狗吃东西");
    }
    
    public void bark() {
        System.out.println("汪汪汪");
    }
}

// 使用
Dog dog = new Dog();
dog.eat();   // 狗吃东西（重写）
dog.bark();  // 汪汪汪
```

### 7.7 super 关键字

```java
public class Animal {
    protected String name;
    
    public Animal(String name) {
        this.name = name;
    }
}

public class Dog extends Animal {
    private String breed;
    
    public Dog(String name, String breed) {
        super(name);  // 调用父类构造方法
        this.breed = breed;
    }
    
    @Override
    public String toString() {
        return super.toString() + " - " + breed;
    }
}
```

### 7.8 多态

```java
// 父类引用指向子类对象
Animal animal = new Dog();
animal.eat();  // 实际调用 Dog 的 eat 方法

// 向下转型
if (animal instanceof Dog) {
    Dog dog = (Dog) animal;
    dog.bark();
}

// 方法重写 vs 方法重载
// 重写：子类重写父类方法（运行时多态）
// 重载：同一类中方法名相同参数不同（编译时多态）
```

### 7.9 抽象类

```java
// 抽象类
public abstract class Shape {
    protected String color;
    
    public Shape(String color) {
        this.color = color;
    }
    
    // 抽象方法（无实现）
    public abstract double getArea();
    
    // 普通方法
    public String getColor() {
        return color;
    }
}

// 子类实现
public class Circle extends Shape {
    private double radius;
    
    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }
    
    @Override
    public double getArea() {
        return Math.PI * radius * radius;
    }
}
```

### 7.10 接口

```java
// 接口定义
public interface Flyable {
    // 常量（public static final）
    int MAX_HEIGHT = 1000;
    
    // 抽象方法（public abstract）
    void fly();
    
    // 默认方法（JDK 8+）
    default void land() {
        System.out.println("着陆");
    }
    
    // 静态方法（JDK 8+）
    static void info() {
        System.out.println("这是飞行接口");
    }
}

// 接口实现
public class Bird implements Flyable {
    @Override
    public void fly() {
        System.out.println("鸟在飞");
    }
}

// 多实现
public class SuperMan implements Flyable, Swimmable {
    @Override
    public void fly() {
        System.out.println("超人在飞");
    }
    
    @Override
    public void swim() {
        System.out.println("超人在游泳");
    }
}
```

### 7.11 内部类

```java
public class Outer {
    private String name = "外部类";
    
    // 成员内部类
    class Inner {
        public void show() {
            System.out.println(name);  // 访问外部类成员
            System.out.println(Outer.this.name);
        }
    }
    
    // 静态内部类
    static class StaticInner {
        public void show() {
            // 不能访问外部类非静态成员
        }
    }
    
    // 方法内部类
    public void method() {
        class LocalInner {
            public void show() {
                System.out.println("方法内部类");
            }
        }
        new LocalInner().show();
    }
    
    // 匿名内部类
    public void test() {
        Runnable r = new Runnable() {
            @Override
            public void run() {
                System.out.println("匿名内部类");
            }
        };
        new Thread(r).start();
    }
}
```

---

## 8. 异常处理

### 8.1 异常体系

```
Throwable
├── Error（错误，不可恢复）
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── ...
└── Exception（异常，可处理）
    ├── RuntimeException（运行时异常）
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   ├── ClassCastException
    │   └── IllegalArgumentException
    └── Checked Exception（编译时异常）
        ├── IOException
        ├── SQLException
        └── ClassNotFoundException
```

### 8.2 try-catch-finally

```java
try {
    // 可能抛出异常的代码
    int result = 10 / 0;
} catch (ArithmeticException e) {
    // 捕获特定异常
    System.out.println("除零异常：" + e.getMessage());
} catch (Exception e) {
    // 捕获其他异常
    System.out.println("其他异常：" + e.getMessage());
} finally {
    // 无论是否异常都会执行
    System.out.println("finally 块");
}
```

### 8.3 throws 声明异常

```java
// 方法声明可能抛出的异常
public void readFile(String path) throws IOException {
    FileReader fr = new FileReader(path);
    // ...
}

// 调用处理
try {
    readFile("test.txt");
} catch (IOException e) {
    e.printStackTrace();
}
```

### 8.4 throw 抛出异常

```java
// 手动抛出异常
public void setAge(int age) {
    if (age < 0 || age > 150) {
        throw new IllegalArgumentException("年龄不合法：" + age);
    }
    this.age = age;
}

// 自定义异常
public class BusinessException extends RuntimeException {
    private int code;
    
    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
    
    public int getCode() {
        return code;
    }
}

// 使用
throw new BusinessException(500, "业务异常");
```

### 8.5 try-with-resources（JDK 7+）

```java
// 自动关闭资源
try (FileReader fr = new FileReader("test.txt");
     BufferedReader br = new BufferedReader(fr)) {
    String line = br.readLine();
    System.out.println(line);
} catch (IOException e) {
    e.printStackTrace();
}
// 不需要 finally 关闭资源，自动关闭
```

### 8.6 异常最佳实践

```java
// ✅ 好的做法
try {
    // 具体操作
} catch (SpecificException e) {
    // 处理特定异常
    log.error("操作失败", e);
    throw new BusinessException("操作失败", e);
}

// ❌ 不好的做法
try {
    // ...
} catch (Exception e) {
    // 捕获所有异常，不处理
}

try {
    // ...
} catch (Exception e) {
    e.printStackTrace();  // 生产环境不要用 printStackTrace
}
```

---

## 📝 学习笔记

<!-- 在此记录个人学习心得 -->

---

## 💡 常见面试题

1. **== 和 equals() 的区别？**
2. **int 和 Integer 的区别？**
3. **final、finally、finalize 的区别？**
4. **重载和重写的区别？**
5. **抽象类和接口的区别？**
6. **运行时异常和编译时异常的区别？**

---

## 📚 参考资料

- 《Java 核心技术 卷 I》
- 《Effective Java》
- [Oracle Java 官方文档](https://docs.oracle.com/javase/tutorial/)
- [菜鸟教程 Java](https://www.runoob.com/java/java-tutorial.html)

---

> 💡 **学习建议**：多写代码，多实践，理论结合项目才能真正掌握！
