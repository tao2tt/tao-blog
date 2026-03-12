# 集合框架

> 学习日期：2026-03-12  
> 状态：📝 学习中  
> 预计完成：2026-03-25  
> 难度：⭐⭐⭐⭐☆  
> 前置知识：[Java 核心语法](/java/basic/core)、[面向对象编程](/java/basic/oop)

---

## 📚 目录

[[toc]]

---

## 1. 集合框架简介

### 1.1 为什么需要集合

**数组的局限性：**
- ❌ 长度固定，创建后不能改变
- ❌ 只能存储同类型数据
- ❌ 功能单一（只能遍历、访问）

**集合的优势：**
- ✅ 长度可变，自动扩容
- ✅ 可以存储不同类型（泛型限制除外）
- ✅ 功能丰富（增删改查、排序、过滤）

```java
// 数组的局限
int[] arr = new int[5];  // 长度固定 5
// arr = new int[10];    // ❌ 不能改变原数组长度

// 集合的优势
List<Integer> list = new ArrayList<>();
list.add(1);  // 自动扩容
list.add(2);
list.add(3);
// ... 可以无限添加
```

### 1.2 集合框架体系

```
Collection 接口（根接口）
    ├── List 接口（有序、可重复）
    │   ├── ArrayList（数组实现，查询快）
    │   ├── LinkedList（链表实现，增删快）
    │   └── Vector（线程安全，已过时）
    │
    ├── Set 接口（无序、不可重复）
    │   ├── HashSet（哈希表实现）
    │   ├── LinkedHashSet（保持插入顺序）
    │   └── TreeSet（红黑树实现，可排序）
    │
    └── Queue 接口（队列）
        ├── LinkedList（也可作为队列）
        └── PriorityQueue（优先队列）

Map 接口（键值对，独立体系）
    ├── HashMap（哈希表实现）
    ├── LinkedHashMap（保持插入顺序）
    ├── TreeMap（红黑树实现，可排序）
    └── Hashtable（线程安全，已过时）
```

---

## 2. List 接口

### 2.1 List 的特点

| 特点 | 说明 |
|------|------|
| **有序** | 元素按插入顺序存储 |
| **可重复** | 可以存储重复元素 |
| **有索引** | 可以通过索引访问元素 |
| **允许 null** | 可以存储 null 值 |

### 2.2 ArrayList

#### 2.2.1 基本使用

```java
import java.util.ArrayList;
import java.util.List;

public class ArrayListDemo {
    public static void main(String[] args) {
        // 创建 ArrayList
        List<String> list = new ArrayList<>();
        
        // 添加元素
        list.add("张三");  // 自动扩容
        list.add("李四");
        list.add("王五");
        list.add("张三");  // ✅ 允许重复
        
        System.out.println(list);  // [张三，李四，王五，张三]
        
        // 获取元素（通过索引）
        String name = list.get(0);  // "张三"
        System.out.println(name);
        
        // 获取大小
        int size = list.size();  // 4
        
        // 修改元素
        list.set(1, "赵六");  // 将索引 1 的元素改为赵六
        System.out.println(list);  // [张三，赵六，王五，张三]
        
        // 删除元素
        list.remove(0);           // 删除索引 0 的元素
        list.remove("张三");      // 删除指定值的元素（删除第一个匹配的）
        System.out.println(list);  // [赵六，王五，张三]
        
        // 判断元素是否存在
        boolean contains = list.contains("王五");  // true
        
        // 清空集合
        list.clear();
        System.out.println(list.isEmpty());  // true
    }
}
```

#### 2.2.2 底层原理

**ArrayList 基于动态数组实现**

```
初始容量：10（默认）
扩容机制：当容量不足时，扩容为原来的 1.5 倍

[张三][李四][王五][null][null]...
  0    1    2    3     4
```

**性能特点：**

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| 查询（get） | O(1) | 通过索引直接访问 |
| 尾部添加 | O(1) | 直接添加到末尾 |
| 中间插入 | O(n) | 需要移动后续元素 |
| 中间删除 | O(n) | 需要移动后续元素 |

#### 2.2.3 遍历方式

```java
List<String> list = new ArrayList<>();
list.add("张三");
list.add("李四");
list.add("王五");

// 方式 1：普通 for 循环（可获取索引）
for (int i = 0; i < list.size(); i++) {
    String name = list.get(i);
    System.out.println(i + ": " + name);
}

// 方式 2：增强 for 循环（推荐）
for (String name : list) {
    System.out.println(name);
}

// 方式 3：迭代器（可在遍历时删除）
Iterator<String> iterator = list.iterator();
while (iterator.hasNext()) {
    String name = iterator.next();
    if (name.equals("李四")) {
        iterator.remove();  // ✅ 安全删除
    }
}

// 方式 4：Java 8 forEach + Lambda
list.forEach(name -> System.out.println(name));
// 简化写法
list.forEach(System.out::println);
```

#### 2.2.4 注意事项

```java
List<String> list = new ArrayList<>();

// ⚠️ 注意 1：删除元素时的坑
for (int i = 0; i < list.size(); i++) {
    if (list.get(i).equals("张三")) {
        list.remove(i);  // ❌ 可能导致跳过元素
        i--;  // 需要手动回退索引
    }
}

// ✅ 正确做法 1：使用迭代器
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().equals("张三")) {
        it.remove();  // 安全删除
    }
}

// ✅ 正确做法 2：Java 8 removeIf
list.removeIf(name -> name.equals("张三"));

// ⚠️ 注意 2：泛型类型必须是引用类型
// List<int> list = new ArrayList<>();  // ❌ 编译错误
List<Integer> list = new ArrayList<>();  // ✅ 使用包装类
```

### 2.3 LinkedList

#### 2.3.1 基本使用

```java
import java.util.LinkedList;
import java.util.List;

List<String> list = new LinkedList<>();

// 基本操作与 ArrayList 相同
list.add("张三");
list.add("李四");
list.get(0);
list.remove(0);

// LinkedList 特有的双端队列方法
LinkedList<String> linkedList = new LinkedList<>();

// 头部操作（栈）
linkedList.push("第一个");  // 压入栈
linkedList.pop();           // 弹出栈

// 头部操作（队列）
linkedList.addFirst("头");
linkedList.getFirst();
linkedList.removeFirst();

// 尾部操作
linkedList.addLast("尾");
linkedList.getLast();
linkedList.removeLast();
```

#### 2.3.2 底层原理

**LinkedList 基于双向链表实现**

```
null ←→ [张三] ←→ [李四] ←→ [王五] ←→ null
```

**性能特点：**

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| 查询（get） | O(n) | 需要从头/尾遍历 |
| 头部插入/删除 | O(1) | 直接修改指针 |
| 尾部插入/删除 | O(1) | 直接修改指针 |
| 中间插入/删除 | O(1) | 找到位置后 O(1) |

#### 2.3.3 ArrayList vs LinkedList

| 对比项 | ArrayList | LinkedList |
|--------|-----------|------------|
| **底层结构** | 动态数组 | 双向链表 |
| **查询效率** | O(1) 快 | O(n) 慢 |
| **增删效率** | O(n) 慢 | O(1) 快 |
| **内存占用** | 较少 | 较多（每个节点存前后指针） |
| **适用场景** | 查询多、增删少 | 增删多、查询少 |

```java
// ✅ 推荐场景
List<String> list1 = new ArrayList<>();  // 存储配置列表，很少修改
List<String> list2 = new LinkedList<>(); // 实现队列/栈，频繁头尾操作
```

---

## 3. Set 接口

### 3.1 Set 的特点

| 特点 | 说明 |
|------|------|
| **无序** | 不保证元素的顺序（某些实现除外） |
| **不可重复** | 不能存储重复元素 |
| **允许一个 null** | HashSet 允许一个 null，TreeSet 不允许 |

### 3.2 HashSet

#### 3.2.1 基本使用

```java
import java.util.HashSet;
import java.util.Set;

Set<String> set = new HashSet<>();

// 添加元素
set.add("张三");
set.add("李四");
set.add("张三");  // ✅ 不会报错，但不会添加（重复）
set.add(null);    // ✅ 允许一个 null

System.out.println(set);  // [张三，李四，null]（顺序可能不同）
System.out.println(set.size());  // 3

// 删除元素
set.remove("张三");

// 判断元素是否存在
boolean contains = set.contains("李四");  // true

// 遍历（无序）
for (String name : set) {
    System.out.println(name);
}
```

#### 3.2.2 去重原理

**HashSet 基于 HashMap 实现，通过 hashCode() 和 equals() 判断重复**

```java
class Student {
    String name;
    int age;
    
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // ⚠️ 必须重写 hashCode() 和 equals()
    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Student student = (Student) obj;
        return age == student.age && Objects.equals(name, student.name);
    }
}

// 使用
Set<Student> students = new HashSet<>();
students.add(new Student("张三", 20));
students.add(new Student("张三", 20));  // ✅ 会被识别为重复

System.out.println(students.size());  // 1（去重成功）
```

**💡 去重规则：**
1. 先比较 hashCode()，不同则一定不重复
2. hashCode() 相同，再比较 equals()
3. equals() 返回 true 则认为是重复

### 3.3 LinkedHashSet

**保持插入顺序的 HashSet**

```java
Set<String> set = new LinkedHashSet<>();
set.add("张三");
set.add("李四");
set.add("王五");

// 遍历顺序与插入顺序一致
for (String name : set) {
    System.out.println(name);  // 张三、李四、王五
}
```

### 3.4 TreeSet

**可排序的 Set**

```java
import java.util.TreeSet;

// 方式 1：自然排序（元素实现 Comparable 接口）
TreeSet<Integer> set = new TreeSet<>();
set.add(5);
set.add(2);
set.add(8);
set.add(1);

System.out.println(set);  // [1, 2, 5, 8]（自动排序）

// 方式 2：定制排序（传入 Comparator）
TreeSet<String> set2 = new TreeSet<>((a, b) -> b.length() - a.length());
set2.add("张三");
set2.add("李四");
set2.add("欧阳锋");

System.out.println(set2);  // [欧阳锋，张三，李四]（按长度降序）
```

---

## 4. Map 接口

### 4.1 Map 的特点

| 特点 | 说明 |
|------|------|
| **键值对存储** | key-value 形式 |
| **key 不可重复** | 重复的 key 会覆盖原 value |
| **value 可重复** | 不同的 key 可以有相同的 value |
| **key 可为 null** | HashMap 允许一个 null key |

### 4.2 HashMap

#### 4.2.1 基本使用

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Integer> map = new HashMap<>();

// 添加元素（key-value）
map.put("张三", 20);
map.put("李四", 25);
map.put("王五", 30);

System.out.println(map);  // {张三=20, 李四=25, 王五=30}

// 获取元素
Integer age = map.get("张三");  // 20
System.out.println(age);

// 获取不存在的 key
Integer notExist = map.get("赵六");  // null

// 修改元素（覆盖）
map.put("张三", 21);  // 张三的年龄变为 21

// 删除元素
map.remove("李四");

// 判断 key 是否存在
boolean hasKey = map.containsKey("张三");  // true

// 判断 value 是否存在
boolean hasValue = map.containsValue(25);  // false（李四已被删除）

// 获取大小
int size = map.size();  // 2

// 清空
map.clear();
```

#### 4.2.2 遍历方式

```java
Map<String, Integer> map = new HashMap<>();
map.put("张三", 20);
map.put("李四", 25);
map.put("王五", 30);

// 方式 1：entrySet 遍历（推荐，可获取 key 和 value）
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    String key = entry.getKey();
    Integer value = entry.getValue();
    System.out.println(key + "=" + value);
}

// 方式 2：keySet 遍历
for (String key : map.keySet()) {
    Integer value = map.get(key);
    System.out.println(key + "=" + value);
}

// 方式 3：values 遍历（只遍历 value）
for (Integer value : map.values()) {
    System.out.println(value);
}

// 方式 4：Java 8 forEach + Lambda
map.forEach((key, value) -> System.out.println(key + "=" + value));
```

#### 4.2.3 常用方法

```java
Map<String, Integer> map = new HashMap<>();

// getOrDefault：获取值，不存在则返回默认值
Integer age = map.getOrDefault("张三", 18);  // 如果张三不存在，返回 18

// putIfAbsent：不存在才添加
map.putIfAbsent("张三", 20);  // 如果张三不存在，添加

// computeIfAbsent：不存在则计算并添加
map.computeIfAbsent("张三", k -> 20);  // 如果张三不存在，计算并添加

// replace：替换值
map.replace("张三", 21);  // 将张三的值替换为 21

// merge：合并
map.merge("张三", 1, Integer::sum);  // 如果张三存在，值 +1；不存在则添加 1
```

#### 4.2.4 底层原理

**HashMap 基于数组 + 链表 + 红黑树实现**

```
JDK 1.8+ 结构：

数组（桶）
  ↓
[0] → null
[1] → Node(key1, value1) → Node(key2, value2) → null
[2] → null
[3] → Node(key3, value3) → Node(key4, value4)
                      ↓
                   红黑树（链表长度 > 8 时转换）
```

**put 方法执行流程：**
1. 计算 key 的 hash 值
2. 确定数组索引位置
3. 如果该位置为空，直接放入
4. 如果不为空，遍历链表/红黑树
   - 如果 key 已存在，覆盖 value
   - 如果 key 不存在，添加到链表末尾
5. 链表长度 > 8，转换为红黑树

### 4.3 LinkedHashMap

**保持插入顺序的 HashMap**

```java
Map<String, Integer> map = new LinkedHashMap<>();
map.put("张三", 20);
map.put("李四", 25);
map.put("王五", 30);

// 遍历顺序与插入顺序一致
for (String key : map.keySet()) {
    System.out.println(key);  // 张三、李四、王五
}
```

### 4.4 TreeMap

**可排序的 Map**

```java
import java.util.TreeMap;

// 方式 1：自然排序（key 实现 Comparable）
TreeMap<Integer, String> map = new TreeMap<>();
map.put(3, "三");
map.put(1, "一");
map.put(2, "二");

System.out.println(map);  // {1=一，2=二，3=三}（按 key 排序）

// 方式 2：定制排序
TreeMap<String, Integer> map2 = new TreeMap<>((a, b) -> b.length() - a.length());
map2.put("张三", 20);
map2.put("欧阳锋", 25);

System.out.println(map2);  // 按 key 长度降序
```

### 4.5 HashMap vs Hashtable vs ConcurrentHashMap

| 对比项 | HashMap | Hashtable | ConcurrentHashMap |
|--------|---------|-----------|-------------------|
| **线程安全** | ❌ 否 | ✅ 是 | ✅ 是 |
| **null key/value** | ✅ 允许 | ❌ 不允许 | ❌ 不允许 |
| **性能** | 快 | 慢（全表锁） | 快（分段锁/CAS） |
| **推荐使用** | 单线程 | ❌ 已过时 | 多线程 |

```java
// ✅ 推荐
Map<String, Integer> map1 = new HashMap<>();  // 单线程
Map<String, Integer> map2 = new ConcurrentHashMap<>();  // 多线程

// ❌ 不推荐
Map<String, Integer> map3 = new Hashtable<>();  // 已过时
```

---

## 5. Collections 工具类

### 5.1 常用方法

```java
import java.util.Collections;
import java.util.ArrayList;
import java.util.List;

List<Integer> list = new ArrayList<>();
list.add(5);
list.add(2);
list.add(8);
list.add(1);

// 排序
Collections.sort(list);
System.out.println(list);  // [1, 2, 5, 8]

// 逆序
Collections.reverse(list);
System.out.println(list);  // [8, 5, 2, 1]

// 查找最大值
Integer max = Collections.max(list);  // 8

// 查找最小值
Integer min = Collections.min(list);  // 1

// 填充
Collections.fill(list, 0);
System.out.println(list);  // [0, 0, 0, 0]

// 交换
Collections.swap(list, 0, 1);

// 随机打乱
Collections.shuffle(list);
```

### 5.2 同步集合

```java
// 将非线程安全的集合转为线程安全
List<String> syncList = Collections.synchronizedList(new ArrayList<>());
Map<String, Integer> syncMap = Collections.synchronizedMap(new HashMap<>());
```

### 5.3 不可变集合

```java
// Java 9+
List<String> list = List.of("张三", "李四", "王五");
Map<String, Integer> map = Map.of("张三", 20, "李四", 25);

// ⚠️ 不可修改
// list.add("赵六");  // ❌ UnsupportedOperationException
```

---

## 6. 实战案例

### 6.1 学生管理系统

```java
import java.util.*;

class Student {
    private String id;
    private String name;
    private int age;
    
    // 构造方法、getter、setter 省略
}

public class StudentManager {
    // 使用 Map 存储学生，key 为学号
    private Map<String, Student> studentMap = new HashMap<>();
    
    // 添加学生
    public void addStudent(Student student) {
        studentMap.put(student.getId(), student);
    }
    
    // 删除学生
    public void removeStudent(String id) {
        studentMap.remove(id);
    }
    
    // 查询学生
    public Student getStudent(String id) {
        return studentMap.get(id);
    }
    
    // 遍历所有学生
    public void printAllStudents() {
        for (Map.Entry<String, Student> entry : studentMap.entrySet()) {
            Student s = entry.getValue();
            System.out.println("学号：" + s.getId() + ", 姓名：" + s.getName() + ", 年龄：" + s.getAge());
        }
    }
    
    // 按年龄排序
    public List<Student> getStudentsSortedByAge() {
        List<Student> list = new ArrayList<>(studentMap.values());
        list.sort((s1, s2) -> s1.getAge() - s2.getAge());
        return list;
    }
}
```

### 6.2 词频统计

```java
public class WordCount {
    public static void main(String[] args) {
        String text = "hello world hello java world hello";
        String[] words = text.split(" ");
        
        Map<String, Integer> wordCount = new HashMap<>();
        
        for (String word : words) {
            // 方式 1：传统写法
            // if (wordCount.containsKey(word)) {
            //     wordCount.put(word, wordCount.get(word) + 1);
            // } else {
            //     wordCount.put(word, 1);
            // }
            
            // 方式 2：merge 方法（推荐）
            wordCount.merge(word, 1, Integer::sum);
        }
        
        // 输出结果
        for (Map.Entry<String, Integer> entry : wordCount.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue() + "次");
        }
        // 输出：
        // hello: 3 次
        // world: 2 次
        // java: 1 次
    }
}
```

---

## 📝 练习题

### 基础题

1. **ArrayList 练习**：创建一个 ArrayList，添加 5 个学生姓名，遍历输出，删除第三个学生

2. **HashSet 练习**：使用 HashSet 对数组 `{1, 2, 3, 2, 4, 3, 5}` 去重

3. **HashMap 练习**：创建一个 HashMap 存储 5 个学生的姓名和成绩，遍历输出所有学生信息

### 进阶题

4. **排序练习**：使用 TreeSet 对学生对象按年龄排序，年龄相同按姓名排序

5. **词频统计**：统计一篇文章中每个单词出现的次数，按次数降序输出前 10 个

6. **综合练习**：实现一个简单的购物车功能，支持添加商品、删除商品、修改数量、计算总价

---

## 🔗 参考资料

### 官方文档
- [Java Collections Framework](https://docs.oracle.com/javase/8/docs/technotes/guides/collections/overview.html)

### 推荐书籍
- 📚 《Java 核心技术 卷 I》第 9 章：集合
- 📚 《Effective Java》第 6 章：泛型和集合

### 在线资源
- 🔗 [菜鸟教程 Java 集合](https://www.runoob.com/java/java-collections.html)
- 🔗 [B 站尚硅谷 Java 集合详解](https://www.bilibili.com/video/BV1Kb411W75N)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| ArrayList | ⭐⭐⭐⭐⭐ | 熟练运用 |
| LinkedList | ⭐⭐⭐⭐ | 理解掌握 |
| HashSet | ⭐⭐⭐⭐⭐ | 熟练运用 |
| HashMap | ⭐⭐⭐⭐⭐ | 熟练运用 |
| TreeMap | ⭐⭐⭐⭐ | 理解掌握 |
| Collections 工具类 | ⭐⭐⭐⭐ | 理解掌握 |

---

**上一章：** [泛型与注解](/java/basic/generics-annotations)  
**下一章：** [Stream API](/java/basic/stream)

**最后更新**：2026-03-12
