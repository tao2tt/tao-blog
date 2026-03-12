# Java 核心语法

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-03-25  
> 难度：⭐⭐☆☆☆  
> 前置知识：无

---

## 📚 目录

[[toc]]

---

## 1. Java 简介

### 1.1 什么是 Java

Java 是一种**面向对象**、**跨平台**的编程语言，由 Sun Microsystems 公司于 1995 年发布，现属于 Oracle 公司。

**核心特点：**

| 特点 | 说明 | 示例 |
|------|------|------|
| **跨平台** | 一次编写，到处运行 | Windows、Linux、Mac 都能运行 |
| **面向对象** | 一切皆对象 | 类、对象、继承、多态 |
| **安全性** | 内置安全机制 | 字节码验证、沙箱机制 |
| **多线程** | 原生支持并发 | Thread 类、Runnable 接口 |
| **健壮性** | 强类型、异常处理 | 编译时检查类型错误 |

### 1.2 Java 版本历史

```
JDK 1.0 (1996)  → Java 诞生
    ↓
JDK 1.5 (2004)  → 泛型、注解、枚举
    ↓
JDK 8 (2014)    → Lambda 表达式、Stream API（里程碑版本）
    ↓
JDK 11 (2018)   → LTS 版本，局部变量类型推断
    ↓
JDK 17 (2021)   → LTS 版本，密封类、模式匹配
    ↓
JDK 21 (2023)   → LTS 版本，虚拟线程（最新 LTS）
```

**💡 提示：** 目前企业主流使用 JDK 8、JDK 11、JDK 17，建议从 JDK 17 或 21 开始学习。

---

## 2. 第一个 Java 程序

### 2.1 Hello World

```java
/**
 * 第一个 Java 程序
 * 
 * @author 涛哥
 * @date 2026-03-12
 */
public class HelloWorld {  // 定义一个公共类，类名必须与文件名相同
    
    /**
     * main 方法 - 程序的入口点
     * 
     * @param args 命令行参数，字符串数组
     */
    public static void main(String[] args) {
        // 在控制台打印输出
        System.out.println("Hello, World!");  // 输出：Hello, World!
    }
}
```

### 2.2 代码详解

| 关键字 | 作用 | 是否必须 |
|--------|------|---------|
| `public` | 公共访问修饰符 | 是（类） |
| `class` | 定义类 | 是 |
| `static` | 静态方法，无需创建对象即可调用 | 是（main 方法） |
| `void` | 方法无返回值 | 是（main 方法） |
| `String[] args` | 命令行参数数组 | 是（main 方法） |

### 2.3 编译与运行

```bash
# 1. 编译（生成 .class 字节码文件）
javac HelloWorld.java

# 2. 运行（JVM 执行字节码）
java HelloWorld

# 输出结果
Hello, World!
```

**⚠️ 注意事项：**
- 文件名必须与 public 类名完全一致（区分大小写）
- 一个 Java 文件只能有一个 public 类
- main 方法签名必须完全正确

---

## 3. 变量与数据类型

### 3.1 变量的定义

**变量三要素：** 数据类型、变量名、变量值

```java
// 语法：数据类型 变量名 = 值;
int age = 25;              // 定义整型变量，存储年龄
String name = "涛哥";      // 定义字符串变量，存储姓名
double salary = 15000.50;  // 定义双精度浮点型，存储工资
boolean isMarried = false; // 定义布尔型，存储婚姻状态
```

### 3.2 八大基本数据类型

Java 有 **8 种基本数据类型**，分为 4 类：

#### 3.2.1 整数类型（4 种）

| 类型 | 字节 | 取值范围 | 默认值 | 示例 |
|------|------|---------|--------|------|
| `byte` | 1 | -128 ~ 127 | 0 | `byte b = 100;` |
| `short` | 2 | -32,768 ~ 32,767 | 0 | `short s = 1000;` |
| `int` | 4 | -2³¹ ~ 2³¹-1 | 0 | `int i = 100000;` |
| `long` | 8 | -2⁶³ ~ 2⁶³-1 | 0L | `long l = 100000L;` |

```java
// 整数类型示例
byte byteValue = 127;           // byte 最大值
short shortValue = 32767;       // short 最大值
int intValue = 2147483647;      // int 最大值（约 21 亿）
long longValue = 9223372036854775807L;  // long 最大值，必须加 L 后缀

// ⚠️ 错误示例：超出范围会编译失败
// byte overflow = 128;  // ❌ 编译错误：超出 byte 范围
```

#### 3.2.2 浮点类型（2 种）

| 类型 | 字节 | 精度 | 默认值 | 示例 |
|------|------|------|--------|------|
| `float` | 4 | 6-7 位有效数字 | 0.0f | `float f = 3.14f;` |
| `double` | 8 | 15-16 位有效数字 | 0.0d | `double d = 3.14159;` |

```java
// 浮点类型示例
float floatValue = 3.14f;     // 必须加 f 后缀，否则默认是 double
double doubleValue = 3.1415926535;  // 可以加 d 后缀，也可省略

// ⚠️ 浮点数精度问题
double result = 0.1 + 0.2;
System.out.println(result);  // 输出：0.30000000000000004（不是 0.3！）

// ✅ 解决方案：使用 BigDecimal（金融计算必须用）
import java.math.BigDecimal;
BigDecimal a = new BigDecimal("0.1");
BigDecimal b = new BigDecimal("0.2");
System.out.println(a.add(b));  // 输出：0.3
```

#### 3.2.3 字符类型（1 种）

| 类型 | 字节 | 取值范围 | 默认值 | 示例 |
|------|------|---------|--------|------|
| `char` | 2 | '\u0000' ~ '\uffff' | '\u0000' | `char c = 'A';` |

```java
// 字符类型示例
char charValue = 'A';         // 单个字符，必须用单引号
char unicodeChar = '\u4e2d';  // Unicode 字符（中）
char numberChar = '6';        // 字符数字，不是数字 6

// char 本质是整数（Unicode 编码）
char c = 'A';
int ascii = (int) c;          // 强制转换为 int
System.out.println(ascii);    // 输出：65（A 的 ASCII 码）
```

#### 3.2.4 布尔类型（1 种）

| 类型 | 字节 | 取值 | 默认值 | 示例 |
|------|------|------|--------|------|
| `boolean` | 1 | true / false | false | `boolean b = true;` |

```java
// 布尔类型示例
boolean isJavaFun = true;     // true 表示真
boolean isBugFree = false;    // false 表示假

// ⚠️ 注意：Java 中 boolean 不能与整数转换
// int num = isJavaFun;  // ❌ 编译错误
```

### 3.3 引用数据类型

除了 8 种基本类型，其他都是**引用类型**：

```java
// 常见的引用类型
String name = "涛哥";              // 字符串
int[] numbers = {1, 2, 3};         // 数组
Person person = new Person();      // 对象
List<String> list = new ArrayList<>(); // 集合
```

**💡 基本类型 vs 引用类型：**

| 对比项 | 基本类型 | 引用类型 |
|--------|---------|---------|
| 存储位置 | 栈内存 | 堆内存（引用在栈） |
| 默认值 | 0、false 等 | null |
| 大小 | 固定 | 不固定 |
| 传递方式 | 值传递 | 引用传递 |

---

## 4. 运算符

### 4.1 算术运算符

| 运算符 | 说明 | 示例 | 结果 |
|--------|------|------|------|
| `+` | 加法 | `5 + 3` | 8 |
| `-` | 减法 | `5 - 3` | 2 |
| `*` | 乘法 | `5 * 3` | 15 |
| `/` | 除法 | `5 / 3` | 1（整数除法） |
| `%` | 取余 | `5 % 3` | 2 |
| `++` | 自增 | `i++` | i = i + 1 |
| `--` | 自减 | `i--` | i = i - 1 |

```java
int a = 10;
int b = 3;

System.out.println(a + b);  // 13
System.out.println(a - b);  // 7
System.out.println(a * b);  // 30
System.out.println(a / b);  // 3（整数除法，丢弃小数）
System.out.println(a % b);  // 1（余数）

// 自增自减
int i = 5;
i++;  // i = 6
++i;  // i = 7

// ⚠️ 前缀 vs 后缀
int x = 5;
int y = x++;  // y = 5, x = 6（先用后加）
int z = ++x;  // z = 7, x = 7（先加后用）
```

### 4.2 关系运算符

| 运算符 | 说明 | 示例 | 结果 |
|--------|------|------|------|
| `==` | 等于 | `5 == 3` | false |
| `!=` | 不等于 | `5 != 3` | true |
| `>` | 大于 | `5 > 3` | true |
| `<` | 小于 | `5 < 3` | false |
| `>=` | 大于等于 | `5 >= 5` | true |
| `<=` | 小于等于 | `5 <= 3` | false |

```java
int a = 10;
int b = 5;

System.out.println(a == b);  // false
System.out.println(a != b);  // true
System.out.println(a > b);   // true
System.out.println(a < b);   // false
System.out.println(a >= 10); // true
System.out.println(b <= 3);  // false

// ⚠️ 注意：== 比较引用类型时比较的是地址
String s1 = new String("hello");
String s2 = new String("hello");
System.out.println(s1 == s2);      // false（地址不同）
System.out.println(s1.equals(s2)); // true（内容相同）
```

### 4.3 逻辑运算符

| 运算符 | 说明 | 示例 | 结果 |
|--------|------|------|------|
| `&&` | 短路与 | `true && false` | false |
| `||` | 短路或 | `true \|\| false` | true |
| `!` | 非 | `!true` | false |
| `&` | 按位与/逻辑与 | `true & false` | false |
| `|` | 按位或/逻辑或 | `true | false` | true |

```java
boolean a = true;
boolean b = false;

System.out.println(a && b);  // false（短路与）
System.out.println(a || b);  // true（短路或）
System.out.println(!a);      // false（非）

// 短路特性：如果前面已经能确定结果，后面不执行
int x = 5;
if (x > 10 && x++ > 5) {  // x > 10 为 false，x++ 不执行
    System.out.println("条件成立");
}
System.out.println(x);  // 5（x 没有自增）

// ⚠️ & 和 && 的区别
if (x > 10 & x++ > 5) {  // & 不短路，x++ 会执行
    System.out.println("条件成立");
}
System.out.println(x);  // 6（x 自增了）
```

### 4.4 赋值运算符

| 运算符 | 说明 | 示例 | 等价于 |
|--------|------|------|--------|
| `=` | 赋值 | `a = 5` | - |
| `+=` | 加后赋值 | `a += 3` | `a = a + 3` |
| `-=` | 减后赋值 | `a -= 3` | `a = a - 3` |
| `*=` | 乘后赋值 | `a *= 3` | `a = a * 3` |
| `/=` | 除后赋值 | `a /= 3` | `a = a / 3` |
| `%=` | 取余后赋值 | `a %= 3` | `a = a % 3` |

```java
int a = 10;
a += 5;  // a = 15
a -= 3;  // a = 12
a *= 2;  // a = 24
a /= 4;  // a = 6
a %= 4;  // a = 2
```

### 4.5 三元运算符

**语法：** `条件 ? 表达式 1 : 表达式 2`

```java
int age = 20;

// 如果 age >= 18，返回"成年"，否则返回"未成年"
String status = age >= 18 ? "成年" : "未成年";
System.out.println(status);  // 输出：成年

// 等价于 if-else
String status2;
if (age >= 18) {
    status2 = "成年";
} else {
    status2 = "未成年";
}

// 三元运算符可以嵌套
int score = 85;
String level = score >= 90 ? "优秀" 
                : score >= 80 ? "良好" 
                : score >= 60 ? "及格" 
                : "不及格";
System.out.println(level);  // 输出：良好
```

---

## 5. 控制流程

### 5.1 if-else 条件语句

```java
int score = 85;

// 基础 if-else
if (score >= 60) {
    System.out.println("及格");
} else {
    System.out.println("不及格");
}

// if-else if-else 多分支
if (score >= 90) {
    System.out.println("优秀");
} else if (score >= 80) {
    System.out.println("良好");
} else if (score >= 70) {
    System.out.println("中等");
} else if (score >= 60) {
    System.out.println("及格");
} else {
    System.out.println("不及格");
}

// ⚠️ 常见错误：忘记加大括号
if (score >= 60)
    System.out.println("及格");  // 只有一行时可以省略
    System.out.println("恭喜！"); // ❌ 这行不在 if 内，总是执行
```

### 5.2 switch 语句

```java
int day = 3;

// 传统 switch
switch (day) {
    case 1:
        System.out.println("星期一");
        break;  // 必须加 break，否则会穿透到下一个 case
    case 2:
        System.out.println("星期二");
        break;
    case 3:
        System.out.println("星期三");
        break;
    default:
        System.out.println("其他");
}

// Java 14+ 新语法（推荐）
String dayName = switch (day) {
    case 1 -> "星期一";
    case 2 -> "星期二";
    case 3 -> "星期三";
    default -> "其他";
};
System.out.println(dayName);  // 输出：星期三

// 多个 case 合并
int month = 5;
String season = switch (month) {
    case 3, 4, 5 -> "春季";
    case 6, 7, 8 -> "夏季";
    case 9, 10, 11 -> "秋季";
    default -> "冬季";
};
```

### 5.3 for 循环

```java
// 基础 for 循环
for (int i = 0; i < 5; i++) {
    System.out.println("第" + i + "次循环");
}
// 输出：第 0 次循环 ... 第 4 次循环

// 倒序循环
for (int i = 10; i > 0; i--) {
    System.out.println(i);
}

// 步长为 2
for (int i = 0; i < 10; i += 2) {
    System.out.println(i);  // 0, 2, 4, 6, 8
}

// 增强 for 循环（遍历数组/集合）
int[] numbers = {1, 2, 3, 4, 5};
for (int num : numbers) {
    System.out.println(num);
}
```

### 5.4 while 循环

```java
// while 循环（先判断后执行）
int i = 0;
while (i < 5) {
    System.out.println(i);
    i++;
}

// do-while 循环（先执行后判断，至少执行一次）
int j = 0;
do {
    System.out.println(j);
    j++;
} while (j < 5);

// ⚠️ 区别：do-while 至少执行一次
int k = 10;
while (k < 5) {
    System.out.println("不会执行");  // ❌ 不执行
}

do {
    System.out.println("执行一次");  // ✅ 执行一次
} while (k < 5);
```

### 5.5 break 和 continue

```java
// break：跳出整个循环
for (int i = 0; i < 10; i++) {
    if (i == 5) {
        break;  // i=5 时跳出循环
    }
    System.out.println(i);  // 输出：0, 1, 2, 3, 4
}

// continue：跳过本次循环，继续下一次
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) {
        continue;  // 偶数跳过
    }
    System.out.println(i);  // 输出：1, 3, 5, 7, 9
}

// 带标签的 break（跳出多层循环）
outer:  // 外层循环标签
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (i == 1 && j == 1) {
            break outer;  // 直接跳出外层循环
        }
        System.out.println("i=" + i + ", j=" + j);
    }
}
```

---

## 6. 数组

### 6.1 数组的声明与初始化

```java
// 方式 1：声明后初始化
int[] numbers;          // 声明数组
numbers = new int[5];   // 分配内存，长度为 5，默认值为 0

// 方式 2：声明同时初始化
int[] nums = new int[5];

// 方式 3：直接赋值
int[] arr = {1, 2, 3, 4, 5};

// 方式 4：匿名数组
int[] data = new int[]{10, 20, 30};
```

### 6.2 数组的访问

```java
int[] numbers = {10, 20, 30, 40, 50};

// 访问元素（索引从 0 开始）
System.out.println(numbers[0]);  // 10
System.out.println(numbers[2]);  // 30

// 修改元素
numbers[1] = 25;
System.out.println(numbers[1]);  // 25

// 数组长度
int length = numbers.length;
System.out.println(length);  // 5

// ⚠️ 数组越界异常
// System.out.println(numbers[5]);  // ❌ ArrayIndexOutOfBoundsException
```

### 6.3 数组遍历

```java
int[] numbers = {1, 2, 3, 4, 5};

// 方式 1：普通 for 循环
for (int i = 0; i < numbers.length; i++) {
    System.out.println(numbers[i]);
}

// 方式 2：增强 for 循环（推荐）
for (int num : numbers) {
    System.out.println(num);
}

// 方式 3：Java 8 Stream
import java.util.Arrays;
Arrays.stream(numbers).forEach(System.out::println);
```

### 6.4 二维数组

```java
// 二维数组本质：数组的数组
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// 访问元素
System.out.println(matrix[0][0]);  // 1（第一行第一列）
System.out.println(matrix[1][2]);  // 6（第二行第三列）

// 遍历二维数组
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.print(matrix[i][j] + " ");
    }
    System.out.println();
}

// 增强 for 循环遍历
for (int[] row : matrix) {
    for (int cell : row) {
        System.out.print(cell + " ");
    }
    System.out.println();
}
```

---

## 7. 方法（函数）

### 7.1 方法的定义

```java
/**
 * 计算两个整数的和
 * 
 * @param a 第一个加数
 * @param b 第二个加数
 * @return 两数之和
 */
public static int add(int a, int b) {
    return a + b;
}

// 调用方法
int result = add(5, 3);
System.out.println(result);  // 输出：8
```

### 7.2 方法的组成部分

```java
修饰符  返回值类型  方法名 (参数列表)  throws 异常
  ↓        ↓       ↓       ↓          ↓
public   int     sum   (int a, int b)  throws Exception
```

| 部分 | 说明 | 示例 |
|------|------|------|
| **修饰符** | 控制访问权限 | public、private、protected |
| **返回值类型** | 方法返回的数据类型 | int、String、void（无返回） |
| **方法名** | 方法的名称，小驼峰命名 | calculateSum、getName |
| **参数列表** | 传入的参数 | (int a, int b) |
| **异常** | 可能抛出的异常 | throws IOException |

### 7.3 方法重载（Overload）

**同一个类中，方法名相同，参数列表不同**

```java
public class Calculator {
    
    // 两个整数相加
    public int add(int a, int b) {
        return a + b;
    }
    
    // 三个整数相加（重载）
    public int add(int a, int b, int c) {
        return a + b + c;
    }
    
    // 两个小数相加（重载）
    public double add(double a, double b) {
        return a + b;
    }
}

// 调用
Calculator calc = new Calculator();
calc.add(1, 2);        // 调用第一个方法
calc.add(1, 2, 3);     // 调用第二个方法
calc.add(1.5, 2.5);    // 调用第三个方法
```

### 7.4 可变参数

```java
/**
 * 计算任意个整数的和
 * 
 * @param numbers 可变参数，本质是数组
 * @return 总和
 */
public static int sum(int... numbers) {
    int total = 0;
    for (int num : numbers) {
        total += num;
    }
    return total;
}

// 调用
sum(1, 2, 3);           // 6
sum(1, 2, 3, 4, 5);     // 15
sum();                  // 0

// ⚠️ 可变参数必须是最后一个参数
// public void method(int... nums, String name) {}  // ❌ 编译错误
```

### 7.5 递归方法

```java
/**
 * 计算阶乘：n! = n * (n-1) * ... * 1
 * 
 * @param n 正整数
 * @return n 的阶乘
 */
public static int factorial(int n) {
    // 终止条件
    if (n == 1) {
        return 1;
    }
    // 递归调用
    return n * factorial(n - 1);
}

// 调用
int result = factorial(5);
System.out.println(result);  // 120 (5! = 5*4*3*2*1)

// 执行过程：
// factorial(5)
// = 5 * factorial(4)
// = 5 * 4 * factorial(3)
// = 5 * 4 * 3 * factorial(2)
// = 5 * 4 * 3 * 2 * factorial(1)
// = 5 * 4 * 3 * 2 * 1
// = 120
```

---

## 8. 字符串

### 8.1 String 的创建

```java
// 方式 1：字面量（推荐，存入字符串常量池）
String s1 = "hello";

// 方式 2：new 关键字（创建新对象）
String s2 = new String("hello");

// 区别
String a = "hello";
String b = "hello";
String c = new String("hello");

System.out.println(a == b);      // true（同一引用）
System.out.println(a == c);      // false（不同对象）
System.out.println(a.equals(c)); // true（内容相同）
```

### 8.2 常用方法

```java
String str = "Hello, World!";

// 获取长度
int len = str.length();  // 13

// 获取字符
char c = str.charAt(0);  // 'H'

// 截取子串
String sub1 = str.substring(0, 5);    // "Hello"
String sub2 = str.substring(7);       // "World!"

// 查找
int index = str.indexOf("World");     // 7
boolean contains = str.contains("lo"); // true

// 替换
String replaced = str.replace("World", "Java");  // "Hello, Java!"

// 分割
String csv = "apple,banana,orange";
String[] fruits = csv.split(",");  // ["apple", "banana", "orange"]

// 去除空格
String spaced = "  hello  ";
String trimmed = spaced.trim();  // "hello"

// 大小写转换
String upper = str.toUpperCase();  // "HELLO, WORLD!"
String lower = str.toLowerCase();  // "hello, world!"
```

### 8.3 字符串拼接

```java
// 方式 1：+ 运算符（简单场景）
String name = "涛哥";
String greeting = "你好，" + name + "!";

// 方式 2：StringBuilder（循环中推荐）
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 100; i++) {
    sb.append(i).append(",");
}
String result = sb.toString();

// 方式 3：String.format（格式化）
String formatted = String.format("姓名：%s, 年龄：%d", "涛哥", 25);

// 方式 4：Java 8 String.join
String joined = String.join(", ", "A", "B", "C");  // "A, B, C"
```

### 8.4 StringBuilder vs StringBuffer

| 特性 | StringBuilder | StringBuffer |
|------|--------------|--------------|
| 线程安全 | ❌ 否 | ✅ 是 |
| 性能 | 快 | 慢 |
| 适用场景 | 单线程 | 多线程 |

```java
// StringBuilder（推荐，单线程）
StringBuilder sb = new StringBuilder();
sb.append("Hello");
sb.append(" ");
sb.append("World");
String result = sb.toString();

// StringBuffer（多线程安全）
StringBuffer sbf = new StringBuffer();
sbf.append("线程安全");
```

---

## 9. 最佳实践与常见误区

### 9.1 命名规范

```java
// ✅ 正确示例
int studentCount;          // 变量：小驼峰
String STUDENT_MAX_COUNT;  // 常量：全大写 + 下划线
class StudentInfo { }      // 类：大驼峰
void calculateTotal() { }  // 方法：小驼峰

// ❌ 错误示例
int StudentCount;          // 变量不应大驼峰
String student_max_count;  // 变量不应下划线命名
```

### 9.2 类型选择

```java
// ✅ 推荐
int age = 25;              // 整数优先用 int
long population = 14_0000_0000L;  // 大数用 long
double price = 99.99;      // 小数优先用 double
boolean isValid = true;    // 布尔用 boolean

// ⚠️ 注意
float pi = 3.14f;          // float 必须加 f
BigDecimal money = new BigDecimal("19.99");  // 金额用 BigDecimal
```

### 9.3 常见误区

```java
// ❌ 误区 1：浮点数比较
double a = 0.1 + 0.2;
if (a == 0.3) {  // ❌ 永远为 false
    System.out.println("相等");
}
// ✅ 正确做法
if (Math.abs(a - 0.3) < 0.00001) {  // 判断差值是否足够小
    System.out.println("近似相等");
}

// ❌ 误区 2：字符串比较
String s1 = "hello";
String s2 = new String("hello");
if (s1 == s2) {  // ❌ 比较的是地址
    System.out.println("相等");
}
// ✅ 正确做法
if (s1.equals(s2)) {  // 比较内容
    System.out.println("相等");
}

// ❌ 误区 3：数组越界
int[] arr = {1, 2, 3};
// System.out.println(arr[3]);  // ❌ ArrayIndexOutOfBoundsException
// ✅ 正确做法
for (int i = 0; i < arr.length; i++) {
    System.out.println(arr[i]);
}
```

---

## 📝 练习题

### 基础题

1. **变量声明**：声明一个整型变量存储年龄，一个字符串变量存储姓名，并打印输出

2. **运算符练习**：计算 1 到 100 的和（使用 for 循环）

3. **数组操作**：创建一个包含 5 个整数的数组，找出最大值和最小值

4. **方法编写**：编写一个方法判断一个数是否为质数

### 进阶题

5. **字符串处理**：统计一个字符串中每个字符出现的次数

6. **递归练习**：使用递归计算斐波那契数列的第 n 项

7. **综合练习**：实现一个简单的计算器，支持加减乘除运算

---

## 🔗 参考资料

### 官方文档
- [Oracle Java 官方文档](https://docs.oracle.com/en/java/)
- [Java 语言规范](https://docs.oracle.com/javase/specs/jls/se17/html/index.html)

### 推荐书籍
- 📚 《Java 核心技术 卷 I》（第 11 版）- Cay S. Horstmann
- 📚 《Effective Java》（第 3 版）- Joshua Bloch
- 📚 《Head First Java》- Kathy Sierra

### 在线资源
- 🔗 [菜鸟教程 Java](https://www.runoob.com/java/java-tutorial.html)
- 🔗 [廖雪峰 Java 教程](https://www.liaoxuefeng.com/wiki/1252599548343744)
- 🔗 [B 站尚硅谷 Java 基础](https://www.bilibili.com/video/BV1Kb411W75N)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 变量与数据类型 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 运算符 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 控制流程 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 数组 | ⭐⭐⭐⭐ | 理解掌握 |
| 方法 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 字符串 | ⭐⭐⭐⭐⭐ | 熟练运用 |

---

**下一章：** [面向对象编程](/java/basic/oop)

**最后更新**：2026-03-12
