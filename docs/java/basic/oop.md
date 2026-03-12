# 面向对象编程

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-03-20  
> 难度：⭐⭐⭐☆☆  
> 前置知识：[Java 核心语法](/java/basic/core)

---

## 📚 目录

[[toc]]

---

## 1. 面向对象简介

### 1.1 什么是面向对象

**面向对象编程（Object-Oriented Programming，OOP）** 是一种编程思想，将现实世界的事物抽象为**对象**，通过对象之间的交互来完成程序功能。

**核心思想：** 万物皆对象

| 编程范式 | 核心单元 | 关注点 | 示例 |
|---------|---------|--------|------|
| **面向过程** | 函数/过程 | 怎么做（How） | C 语言 |
| **面向对象** | 对象 | 谁来做（Who） | Java、Python |

### 1.2 面向对象 vs 面向过程

**场景：把大象装进冰箱**

```java
// 面向过程（关注步骤）
openFridge();      // 1. 打开冰箱
putElephantIn();   // 2. 把大象放进去
closeFridge();     // 3. 关闭冰箱

// 面向对象（关注对象）
Fridge fridge = new Fridge();
Elephant elephant = new Elephant();

fridge.open();              // 冰箱自己打开
fridge.putIn(elephant);     // 冰箱把大象放进去
fridge.close();             // 冰箱自己关闭
```

**💡 理解：** 面向对象让对象自己做事，而不是操作对象做事。

### 1.3 面向对象的三大特性

| 特性 | 说明 | 作用 | 生活案例 |
|------|------|------|---------|
| **封装** | 隐藏内部实现，暴露公共接口 | 安全性、简化使用 | 手机：你只需要按按钮，不需要知道内部电路 |
| **继承** | 子类继承父类的属性和方法 | 代码复用、扩展性 | 儿子继承父亲的财产和特征 |
| **多态** | 同一操作作用于不同对象，产生不同行为 | 灵活性、可扩展性 | 按钮：在电视上是开关，在电梯上是楼层 |

---

## 2. 类与对象

### 2.1 什么是类

**类（Class）** 是对一类事物的抽象描述，是对象的模板。

```java
/**
 * 学生类 - 描述所有学生的共同特征
 */
public class Student {
    // 属性（成员变量）- 描述学生的特征
    String name;      // 姓名
    int age;          // 年龄
    String studentId; // 学号
    
    // 方法（成员函数）- 描述学生的行为
    void study() {
        System.out.println(name + " 正在学习");
    }
    
    void introduce() {
        System.out.println("大家好，我叫" + name + "，今年" + age + "岁");
    }
}
```

### 2.2 什么是对象

**对象（Object）** 是类的具体实例，是实际存在的个体。

```java
// 创建对象（实例化）
Student student1 = new Student();  // 创建一个学生对象
student1.name = "张三";
student1.age = 20;
student1.studentId = "2024001";

Student student2 = new Student();  // 创建另一个学生对象
student2.name = "李四";
student2.age = 21;
student2.studentId = "2024002";

// 调用对象的方法
student1.study();      // 输出：张三 正在学习
student1.introduce();  // 输出：大家好，我叫张三，今年 20 岁

student2.introduce();  // 输出：大家好，我叫李四，今年 21 岁
```

### 2.3 类与对象的关系

```
类（Class）          对象（Object）
   ↓                    ↓
 模板/图纸           实际产品
 抽象概念           具体实例
 Student            张三、李四
 汽车图纸           具体的宝马、奔驰
```

**💡 比喻：**
- **类** = 月饼模具
- **对象** = 用模具做出来的月饼

---

## 3. 封装（Encapsulation）

### 3.1 什么是封装

**封装** 是将对象的属性和方法隐藏起来，只对外提供公共的访问方式。

**目的：**
- ✅ 保护数据安全（防止随意修改）
- ✅ 隐藏实现细节（简化使用）
- ✅ 便于维护和修改

### 3.2 访问修饰符

| 修饰符 | 同类 | 同包 | 子类 | 全局 | 说明 |
|--------|------|------|------|------|------|
| `private` | ✅ | ❌ | ❌ | ❌ | 私有，仅本类可访问 |
| `default` | ✅ | ✅ | ❌ | ❌ | 默认，同包可访问（不写修饰符） |
| `protected` | ✅ | ✅ | ✅ | ❌ | 受保护，子类可访问 |
| `public` | ✅ | ✅ | ✅ | ✅ | 公共，全局可访问 |

```java
public class Person {
    // private 属性：外部不能直接访问
    private String name;
    private int age;
    
    // public 方法：外部通过方法访问
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public int getAge() {
        return age;
    }
    
    // 设置年龄时进行验证
    public void setAge(int age) {
        if (age > 0 && age < 150) {
            this.age = age;
        } else {
            System.out.println("年龄不合法！");
        }
    }
}

// 使用
Person p = new Person();
// p.age = -5;  // ❌ 编译错误：age 是 private
p.setAge(-5);   // ✅ 可以调用，但方法内会验证
p.setAge(25);   // ✅ 设置合法年龄
```

### 3.3 getter 和 setter 方法

**标准 JavaBean 规范：**

```java
public class Student {
    // 私有属性
    private String name;
    private int age;
    
    // 无参构造方法（必须）
    public Student() {
    }
    
    // 全参构造方法
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // getter 方法：获取属性值
    public String getName() {
        return name;
    }
    
    // setter 方法：设置属性值
    public void setName(String name) {
        this.name = name;
    }
    
    public int getAge() {
        return age;
    }
    
    public void setAge(int age) {
        this.age = age;
    }
}

// 使用
Student s = new Student();
s.setName("张三");  // 设置属性
s.setAge(20);
System.out.println(s.getName());  // 获取属性：张三
```

**💡 提示：** IDEA 中可以自动生成 getter/setter：`Alt + Insert` → `Getter and Setter`

---

## 4. 继承（Inheritance）

### 4.1 什么是继承

**继承** 是子类继承父类的属性和方法，实现代码复用。

**语法：** `class 子类 extends 父类`

```java
// 父类（基类、超类）
public class Animal {
    String name;
    int age;
    
    void eat() {
        System.out.println(name + " 正在吃东西");
    }
    
    void sleep() {
        System.out.println(name + " 正在睡觉");
    }
}

// 子类（派生类）继承父类
public class Dog extends Animal {
    // 子类特有的方法
    void bark() {
        System.out.println(name + " 汪汪叫");
    }
}

// 使用
Dog dog = new Dog();
dog.name = "旺财";  // 继承自父类的属性
dog.age = 3;        // 继承自父类的属性
dog.eat();          // 继承自父类的方法：旺财 正在吃东西
dog.sleep();        // 继承自父类的方法：旺财 正在睡觉
dog.bark();         // 子类自己的方法：旺财 汪汪叫
```

### 4.2 继承的特点

| 特点 | 说明 | 示例 |
|------|------|------|
| **单继承** | Java 只支持单继承，一个类只能有一个父类 | `class A extends B` ✅ |
| **多层继承** | 可以形成继承链 | `A extends B extends C` ✅ |
| **不能继承** | 构造方法、私有成员 | 子类不能直接访问父类 private 成员 |

```java
// ✅ 多层继承
class GrandParent { }
class Parent extends GrandParent { }
class Child extends Parent { }

// ❌ 不支持多继承
// class Child extends Parent1, Parent2 { }  // 编译错误
```

### 4.3 super 关键字

**super** 用于引用父类成员。

```java
public class Animal {
    String name = "动物";
    
    void speak() {
        System.out.println("动物叫");
    }
}

public class Dog extends Animal {
    String name = "狗";
    
    void printName() {
        System.out.println(name);      // 狗（子类自己的）
        System.out.println(super.name); // 动物（父类的）
    }
    
    @Override
    void speak() {
        super.speak();  // 调用父类方法：动物叫
        System.out.println("汪汪汪");    // 子类方法
    }
}
```

### 4.4 方法重写（Override）

**子类重新定义父类的方法**

```java
public class Animal {
    void speak() {
        System.out.println("动物叫");
    }
}

public class Dog extends Animal {
    @Override  // 注解：告诉编译器这是重写方法
    void speak() {
        System.out.println("汪汪汪");
    }
}

public class Cat extends Animal {
    @Override
    void speak() {
        System.out.println("喵喵喵");
    }
}

// 使用
Animal animal = new Animal();
animal.speak();  // 动物叫

Dog dog = new Dog();
dog.speak();     // 汪汪汪（调用子类重写的方法）

Cat cat = new Cat();
cat.speak();     // 喵喵喵（调用子类重写的方法）
```

**💡 重写规则：**
- ✅ 方法名必须相同
- ✅ 参数列表必须相同
- ✅ 返回值类型相同或是其子类
- ✅ 访问权限不能低于父类

---

## 5. 多态（Polymorphism）

### 5.1 什么是多态

**多态** 是同一操作作用于不同对象，产生不同的执行结果。

**前提条件：**
1. 有继承关系
2. 有方法重写
3. 父类引用指向子类对象

### 5.2 多态的示例

```java
// 父类
public class Animal {
    void speak() {
        System.out.println("动物叫");
    }
}

// 子类 1
public class Dog extends Animal {
    @Override
    void speak() {
        System.out.println("汪汪汪");
    }
}

// 子类 2
public class Cat extends Animal {
    @Override
    void speak() {
        System.out.println("喵喵喵");
    }
}

// 多态的使用
Animal a1 = new Dog();  // 父类引用指向子类对象
Animal a2 = new Cat();

a1.speak();  // 汪汪汪（实际调用 Dog 的方法）
a2.speak();  // 喵喵喵（实际调用 Cat 的方法）
```

**💡 理解：** 编译时看左边（Animal），运行时看右边（Dog/Cat）。

### 5.3 多态的应用

#### 5.3.1 方法参数使用父类类型

```java
public class AnimalShop {
    
    // 方法参数使用父类类型，可以接收任何子类对象
    public void feed(Animal animal) {
        System.out.print("喂食：");
        animal.speak();
    }
}

// 使用
AnimalShop shop = new AnimalShop();
shop.feed(new Dog());  // 喂食：汪汪汪
shop.feed(new Cat());  // 喂食：喵喵喵

// ✅ 好处：新增动物类型不需要修改 feed 方法
shop.feed(new Pig());  // 自动支持
```

#### 5.3.2 集合中的多态

```java
List<Animal> animals = new ArrayList<>();
animals.add(new Dog());
animals.add(new Cat());
animals.add(new Pig());

for (Animal animal : animals) {
    animal.speak();  // 每个对象调用自己的方法
}
// 输出：
// 汪汪汪
// 喵喵喵
// 哼哼哼
```

### 5.4 类型转换

#### 5.4.1 向上转型（自动）

```java
Animal animal = new Dog();  // 向上转型，自动完成
```

#### 5.4.2 向下转型（强制）

```java
Animal animal = new Dog();

// 向下转型需要强制类型转换
Dog dog = (Dog) animal;
dog.bark();  // 调用子类特有方法

// ⚠️ 错误示例：会抛出 ClassCastException
// Cat cat = (Cat) animal;  // ❌ animal 实际是 Dog，不能转为 Cat

// ✅ 安全做法：先 instanceof 判断
if (animal instanceof Dog) {
    Dog d = (Dog) animal;
    d.bark();
}
```

---

## 6. 抽象类（Abstract Class）

### 6.1 什么是抽象类

**抽象类** 是包含抽象方法的类，不能被实例化，只能被继承。

**关键字：** `abstract`

```java
// 抽象类
public abstract class Shape {
    String color;
    
    // 抽象方法：只有声明，没有实现
    public abstract double getArea();
    
    // 普通方法：可以有实现
    public void setColor(String color) {
        this.color = color;
    }
}

// 子类必须实现抽象方法
public class Circle extends Shape {
    double radius;
    
    @Override
    public double getArea() {
        return Math.PI * radius * radius;
    }
}

// 使用
// Shape shape = new Shape();  // ❌ 抽象类不能实例化
Shape shape = new Circle();    // ✅ 父类引用指向子类对象
shape.setColor("红色");
```

### 6.2 抽象类的特点

| 特点 | 说明 |
|------|------|
| **不能实例化** | 不能使用 `new` 创建对象 |
| **必须有子类** | 抽象类存在的意义是被继承 |
| **子类必须实现** | 子类必须实现所有抽象方法，否则也是抽象类 |
| **可以有构造方法** | 供子类调用（`super()`） |

---

## 7. 接口（Interface）

### 7.1 什么是接口

**接口** 是一种完全抽象的类型，定义了一组规范，实现接口的类必须遵守这些规范。

```java
// 定义接口
public interface Flyable {
    // 常量（public static final）
    int MAX_HEIGHT = 10000;
    
    // 抽象方法（public abstract）
    void fly();
    
    // Java 8+ 默认方法
    default void land() {
        System.out.println("降落");
    }
    
    // Java 8+ 静态方法
    static void printInfo() {
        System.out.println("这是飞行接口");
    }
}

// 实现接口
public class Bird implements Flyable {
    @Override
    public void fly() {
        System.out.println("鸟儿在飞翔");
    }
}

// 使用
Bird bird = new Bird();
bird.fly();      // 鸟儿在飞翔
bird.land();     // 降落（默认方法）
Flyable.printInfo();  // 这是飞行接口（静态方法）
```

### 7.2 接口的特点

| 特点 | 说明 | 示例 |
|------|------|------|
| **多实现** | 一个类可以实现多个接口 | `class A implements B, C` ✅ |
| **全抽象** | 所有方法默认是 public abstract | 不能修改 |
| **常量** | 所有字段默认是 public static final | 必须初始化 |
| **不能实例化** | 接口不能创建对象 | `new Flyable()` ❌ |

### 7.3 接口 vs 抽象类

| 对比项 | 接口 | 抽象类 |
|--------|------|--------|
| **继承方式** | implements（多实现） | extends（单继承） |
| **成员变量** | 只能是常量 | 可以是各种类型 |
| **构造方法** | 不能有 | 可以有 |
| **设计目的** | 定义行为规范（能做什么） | 代码复用（是什么） |
| **使用场景** | 功能扩展、解耦 | 共性抽取 |

```java
// 接口：定义能力
interface Swimmable {
    void swim();
}

interface Flyable {
    void fly();
}

// 抽象类：定义是什么
abstract class Animal {
    String name;
    abstract void eat();
}

// 类可以继承一个抽象类，实现多个接口
public class Duck extends Animal implements Swimmable, Flyable {
    @Override
    void eat() {
        System.out.println("吃鱼");
    }
    
    @Override
    public void swim() {
        System.out.println("游泳");
    }
    
    @Override
    public void fly() {
        System.out.println("飞翔");
    }
}
```

---

## 8. 内部类

### 8.1 什么是内部类

**内部类** 是定义在类内部的类。

### 8.2 内部类的分类

```java
public class OuterClass {
    
    // 1. 成员内部类
    class InnerClass {
        void print() {
            System.out.println("成员内部类");
        }
    }
    
    // 2. 静态内部类
    static class StaticInnerClass {
        void print() {
            System.out.println("静态内部类");
        }
    }
    
    // 3. 局部内部类（定义在方法内）
    void method() {
        class LocalInnerClass {
            void print() {
                System.out.println("局部内部类");
            }
        }
        new LocalInnerClass().print();
    }
    
    // 4. 匿名内部类（没有名字的内部类）
    void createRunnable() {
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

### 8.3 内部类的使用

```java
// 成员内部类
OuterClass outer = new OuterClass();
OuterClass.InnerClass inner = outer.new InnerClass();
inner.print();

// 静态内部类（不需要外部类对象）
OuterClass.StaticInnerClass staticInner = new OuterClass.StaticInnerClass();
staticInner.print();
```

---

## 9. 实战案例

### 9.1 员工管理系统

```java
// 抽象员工类
public abstract class Employee {
    private String name;
    private double baseSalary;
    
    public Employee(String name, double baseSalary) {
        this.name = name;
        this.baseSalary = baseSalary;
    }
    
    // 抽象方法：计算工资
    public abstract double calculateSalary();
    
    // 普通方法
    public void work() {
        System.out.println(name + " 正在工作");
    }
    
    // getter
    public String getName() {
        return name;
    }
}

// 程序员类
public class Programmer extends Employee {
    private int projectCount;  // 完成项目数
    private double bonusPerProject;  // 每个项目奖金
    
    public Programmer(String name, double baseSalary, 
                     int projectCount, double bonusPerProject) {
        super(name, baseSalary);
        this.projectCount = projectCount;
        this.bonusPerProject = bonusPerProject;
    }
    
    @Override
    public double calculateSalary() {
        return getBaseSalary() + (projectCount * bonusPerProject);
    }
}

// 销售经理类
public class SalesManager extends Employee {
    private double salesAmount;  // 销售额
    private double commissionRate;  // 提成比例
    
    public SalesManager(String name, double baseSalary,
                       double salesAmount, double commissionRate) {
        super(name, baseSalary);
        this.salesAmount = salesAmount;
        this.commissionRate = commissionRate;
    }
    
    @Override
    public double calculateSalary() {
        return getBaseSalary() + (salesAmount * commissionRate);
    }
}

// 使用
public class Company {
    public static void main(String[] args) {
        List<Employee> employees = new ArrayList<>();
        
        employees.add(new Programmer("张三", 10000, 3, 2000));
        employees.add(new SalesManager("李四", 8000, 500000, 0.05));
        
        for (Employee emp : employees) {
            emp.work();
            System.out.println(emp.getName() + " 的工资：" + emp.calculateSalary());
        }
    }
}
```

---

## 📝 练习题

### 基础题

1. **封装练习**：创建一个 Person 类，包含私有属性 name 和 age，提供 getter/setter 方法，并在 setAge 中验证年龄范围（0-150）

2. **继承练习**：创建 Animal 父类和 Dog、Cat 子类，实现 speak 方法的重写

3. **多态练习**：创建一个方法接收 Animal 参数，传入 Dog 或 Cat 对象，观察执行结果

### 进阶题

4. **抽象类练习**：创建抽象图形类 Shape，包含抽象方法 getArea()，创建 Circle 和 Rectangle 子类实现面积计算

5. **接口练习**：创建 Flyable 和 Swimmable 接口，创建 Duck 类同时实现这两个接口

6. **综合练习**：设计一个简单的支付系统，包含支付宝、微信、银行卡等多种支付方式（使用接口）

---

## 🔗 参考资料

### 推荐书籍
- 📚 《Effective Java》第 4 章：类与接口
- 📚 《Java 核心技术 卷 I》第 5 章：继承
- 📚 《Head First Java》第 7-9 章

### 在线资源
- 🔗 [Oracle Java 面向对象教程](https://docs.oracle.com/javase/tutorial/java/concepts/index.html)
- 🔗 [菜鸟教程 Java 面向对象](https://www.runoob.com/java/java-object-class.html)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 类与对象 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 封装 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 继承 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 多态 | ⭐⭐⭐⭐⭐ | 理解掌握 |
| 抽象类 | ⭐⭐⭐⭐ | 理解掌握 |
| 接口 | ⭐⭐⭐⭐⭐ | 熟练运用 |

---

**上一章：** [Java 核心语法](/java/basic/core)  
**下一章：** [泛型与注解](/java/basic/generics-annotations)

**最后更新**：2026-03-12
