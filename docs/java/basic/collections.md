# 集合框架

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-30

---

## 📚 目录

[[toc]]
---

## 1. 集合框架概述

### 1.1 集合框架体系结构

```
Java 集合框架
├── Collection 接口（单列集合）
│   ├── List 接口（有序、可重复）
│   │   ├── ArrayList
│   │   ├── LinkedList
│   │   └── Vector（已过时）
│   ├── Set 接口（无序、不可重复）
│   │   ├── HashSet
│   │   ├── LinkedHashSet
│   │   └── TreeSet
│   └── Queue 接口（队列）
│       ├── PriorityQueue
│       ├── ArrayDeque
│       └── LinkedList
└── Map 接口（双列集合、键值对）
    ├── HashMap
    ├── LinkedHashMap
    ├── TreeMap
    ├── Hashtable（已过时）
    └── ConcurrentHashMap
```

### 1.2 集合 vs 数组

| 对比项 | 数组 | 集合 |
|--------|------|------|
| 长度 | 固定 | 可变 |
| 类型 | 基本类型/引用类型 | 只能存储引用类型 |
| 功能 | 简单 | 丰富（增删改查、排序等） |
| 性能 | 高 | 略低 |
| 使用场景 | 存储固定数量的同类型数据 | 存储动态数量的数据 |

### 1.3 集合选择指南

```
是否需要键值对？
├── 是 → 选择 Map
│   ├── 需要排序？ → TreeMap
│   ├── 需要线程安全？ → ConcurrentHashMap
│   └── 不需要 → HashMap（最常用）
└── 否 → 选择 Collection
    ├── 是否需要唯一？
    │   ├── 是 → Set
    │   │   ├── 需要排序？ → TreeSet
    │   │   └── 不需要 → HashSet
    │   └── 否 → List
    │       ├── 频繁查询？ → ArrayList
    │       ├── 频繁增删？ → LinkedList
    │       └── 需要线程安全？ → Vector/CopyOnWriteArrayList
```

---

## 2. Collection 接口

### 2.1 Collection 常用方法

```java
Collection<String> collection = new ArrayList<>();

// 添加元素
collection.add("张三");           // 添加单个元素
collection.addAll(Arrays.asList("李四", "王五"));  // 添加集合

// 获取大小
int size = collection.size();     // 3

// 判断
boolean isEmpty = collection.isEmpty();           // false
boolean contains = collection.contains("张三");    // true

// 删除
collection.remove("张三");        // 删除指定元素
collection.removeAll(Arrays.asList("李四", "王五")); // 删除集合

// 遍历
for (String s : collection) {
    System.out.println(s);
}

// 转数组
String[] array = collection.toArray(new String[0]);

// 清空
collection.clear();
```

### 2.2 遍历方式对比

```java
List<String> list = Arrays.asList("A", "B", "C");

// 1. 普通 for 循环（仅适用于 List）
for (int i = 0; i < list.size(); i++) {
    System.out.println(list.get(i));
}

// 2. 增强 for 循环（推荐）
for (String s : list) {
    System.out.println(s);
}

// 3. Iterator 迭代器
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
    System.out.println(s);
    // it.remove();  // 可以在遍历中安全删除
}

// 4. forEach + Lambda（JDK 8+，推荐）
list.forEach(System.out::println);
list.forEach(s -> System.out.println(s));

// 5. Stream API（JDK 8+）
list.stream().forEach(System.out::println);
```

---

## 3. List 接口

### 3.1 List 特性

- ✅ **有序**：元素按插入顺序存储
- ✅ **可重复**：允许存储重复元素
- ✅ **有索引**：可以通过索引访问元素
- ✅ **允许 null**：可以存储 null 值

### 3.2 ArrayList vs LinkedList vs Vector

| 特性 | ArrayList | LinkedList | Vector |
|------|-----------|------------|--------|
| **底层结构** | 动态数组 | 双向链表 | 动态数组 |
| **随机访问** | O(1) 快 | O(n) 慢 | O(1) 快 |
| **插入/删除** | O(n) 慢（中间） | O(1) 快 | O(n) 慢 |
| **线程安全** | ❌ 非线程安全 | ❌ 非线程安全 | ✅ 线程安全（synchronized） |
| **扩容机制** | 1.5 倍 | 无扩容 | 2 倍 |
| **内存占用** | 低 | 高（节点指针） | 低 |
| **使用场景** | 频繁查询 | 频繁增删 | 已过时，不推荐 |

### 3.3 ArrayList 详解

#### 源码分析

```java
// ArrayList 核心源码
public class ArrayList<E> extends AbstractList<E> implements List<E>, RandomAccess, Cloneable, Serializable {
    
    // 默认容量
    private static final int DEFAULT_CAPACITY = 10;
    
    // 存储元素的数组
    transient Object[] elementData;
    
    // 实际元素个数
    private int size;
    
    // 构造方法
    public ArrayList() {
        this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
    }
    
    public ArrayList(int initialCapacity) {
        if (initialCapacity > 0) {
            this.elementData = new Object[initialCapacity];
        }
    }
    
    // 添加元素
    public boolean add(E e) {
        ensureCapacityInternal(size + 1);  // 确保容量
        elementData[size++] = e;
        return true;
    }
    
    // 扩容机制
    private void ensureCapacityInternal(int minCapacity) {
        if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
            minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity);
        }
        if (minCapacity - elementData.length > 0) {
            grow(minCapacity);
        }
    }
    
    // 扩容算法：原容量 + 原容量 >> 1（1.5 倍）
    private void grow(int minCapacity) {
        int oldCapacity = elementData.length;
        int newCapacity = oldCapacity + (oldCapacity >> 1);
        if (newCapacity - minCapacity < 0)
            newCapacity = minCapacity;
        elementData = Arrays.copyOf(elementData, newCapacity);
    }
}
```

#### 使用示例

```java
// 创建
ArrayList<String> list = new ArrayList<>();
ArrayList<String> list2 = new ArrayList<>(20);  // 指定初始容量

// 添加
list.add("张三");
list.add(0, "李四");  // 指定位置插入
list.addAll(Arrays.asList("王五", "赵六"));

// 查询
String name = list.get(0);  // 根据索引查询
int index = list.indexOf("张三");  // 根据元素查索引
boolean contains = list.contains("张三");

// 修改
list.set(0, "新名字");

// 删除
list.remove(0);  // 根据索引删除
list.remove("张三");  // 根据元素删除
list.removeAll(Arrays.asList("王五", "赵六"));

// 遍历
for (int i = 0; i < list.size(); i++) {
    System.out.println(list.get(i));
}

// 转数组
String[] array = list.toArray(new String[0]);

// 排序
Collections.sort(list);
list.sort(Comparator.naturalOrder());

// 截取
List<String> subList = list.subList(0, 2);
```

#### 注意事项

```java
// ❌ 错误：在 foreach 中直接删除元素
for (String s : list) {
    if ("张三".equals(s)) {
        list.remove(s);  // ConcurrentModificationException
    }
}

// ✅ 正确：使用 Iterator
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if ("张三".equals(it.next())) {
        it.remove();  // 安全删除
    }
}

// ✅ 正确：使用 removeIf（JDK 8+）
list.removeIf(s -> "张三".equals(s));

// ✅ 正确：使用 Stream
list = list.stream()
    .filter(s -> !"张三".equals(s))
    .collect(Collectors.toList());
```

---

### 3.4 LinkedList 详解

#### 源码分析

```java
// LinkedList 核心源码
public class LinkedList<E> extends AbstractSequentialList<E>
    implements List<E>, Deque<E>, Cloneable, Serializable {
    
    // 节点个数
    transient int size = 0;
    
    // 头节点
    transient Node<E> first;
    
    // 尾节点
    transient Node<E> last;
    
    // 节点结构
    private static class Node<E> {
        E item;
        Node<E> next;
        Node<E> prev;
        
        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.prev = prev;
            this.next = next;
        }
    }
    
    // 添加元素（尾插）
    public boolean add(E e) {
        linkLast(e);
        return true;
    }
    
    // 链接到尾部
    void linkLast(E e) {
        final Node<E> l = last;
        final Node<E> newNode = new Node<>(l, e, null);
        last = newNode;
        if (l == null)
            first = newNode;
        else
            l.next = newNode;
        size++;
    }
}
```

#### 使用示例

```java
LinkedList<String> list = new LinkedList<>();

// 作为 List 使用
list.add("张三");
list.get(0);
list.remove(0);

// 作为双端队列使用
list.addFirst("头");      // 头插
list.addLast("尾");       // 尾插
list.getFirst();          // 获取头元素
list.getLast();           // 获取尾元素
list.removeFirst();       // 删除头元素
list.removeLast();        // 删除尾元素

// 作为栈使用
list.push("元素");        // 入栈
list.pop();               // 出栈
list.peek();              // 查看栈顶

// 作为队列使用
list.offer("元素");       // 入队
list.poll();              // 出队
```

---

### 3.5 CopyOnWriteArrayList（线程安全）

```java
// 线程安全的 List，适用于读多写少场景
List<String> list = new CopyOnWriteArrayList<>();

// 特点：
// 1. 写操作时复制新数组，不影响读操作
// 2. 读操作无锁，性能高
// 3. 写操作性能低（需要复制数组）
// 4. 弱一致性：读到的可能是旧数据

// 使用场景：监听器列表、白名单等读多写少场景
```

---

## 4. Set 接口

### 4.1 Set 特性

- ✅ **无序**：不保证元素的迭代顺序（LinkedHashSet 除外）
- ✅ **不可重复**：不允许存储重复元素
- ✅ **允许一个 null**：大多数实现允许存储一个 null 值

### 4.2 HashSet vs LinkedHashSet vs TreeSet

| 特性 | HashSet | LinkedHashSet | TreeSet |
|------|---------|---------------|---------|
| **底层结构** | HashMap | LinkedHashMap | TreeMap |
| **有序性** | 无序 | 插入顺序有序 | 自然排序/定制排序 |
| **性能** | 最快 | 略慢 | 较慢（O(log n)） |
| **null 值** | 允许一个 | 允许一个 | 不允许 |
| **使用场景** | 去重 | 需要顺序的去重 | 需要排序的去重 |

### 4.3 HashSet 详解

#### 源码分析

```java
// HashSet 核心源码
public class HashSet<E> extends AbstractSet<E>
    implements Set<E>, Cloneable, Serializable {
    
    // 底层是 HashMap
    private transient HashMap<E,Object> map;
    
    // 作为 Map 的 value
    private static final Object PRESENT = new Object();
    
    // 构造方法
    public HashSet() {
        map = new HashMap<>();
    }
    
    // 添加元素（实际是添加到 HashMap 的 key）
    public boolean add(E e) {
        return map.put(e, PRESENT) == null;
    }
    
    // 删除元素
    public boolean remove(Object o) {
        return map.remove(o) == PRESENT;
    }
}
```

#### 使用示例

```java
Set<String> set = new HashSet<>();

// 添加
set.add("张三");
set.add("李四");
set.add("张三");  // 重复，添加失败

// 获取大小
int size = set.size();  // 2

// 判断
boolean contains = set.contains("张三");

// 删除
set.remove("张三");

// 遍历
for (String s : set) {
    System.out.println(s);
}

// 集合运算
Set<Integer> set1 = new HashSet<>(Arrays.asList(1, 2, 3, 4, 5));
Set<Integer> set2 = new HashSet<>(Arrays.asList(4, 5, 6, 7, 8));

// 并集
Set<Integer> union = new HashSet<>(set1);
union.addAll(set2);  // [1,2,3,4,5,6,7,8]

// 交集
Set<Integer> intersection = new HashSet<>(set1);
intersection.retainAll(set2);  // [4,5]

// 差集
Set<Integer> difference = new HashSet<>(set1);
difference.removeAll(set2);  // [1,2,3]
```

#### 去重原理

```java
// HashSet 去重依赖 hashCode() 和 equals()
// 1. 先比较 hashCode，不同则直接添加
// 2. hashCode 相同再比较 equals
// 3. equals 返回 true 则认为重复

// 自定义对象去重示例
class Person {
    private String name;
    private int age;
    
    // ⚠️ 必须重写 hashCode() 和 equals()
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Person person = (Person) o;
        return age == person.age && Objects.equals(name, person.name);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
}

Set<Person> set = new HashSet<>();
set.add(new Person("张三", 25));
set.add(new Person("张三", 25));  // 重复，添加失败
```

---

### 4.4 LinkedHashSet 详解

```java
// LinkedHashSet 继承自 HashSet，底层是 LinkedHashMap
// 特点：在 HashSet 基础上维护插入顺序

Set<String> set = new LinkedHashSet<>();
set.add("张三");
set.add("李四");
set.add("王五");

// 遍历顺序：张三 → 李四 → 王五（插入顺序）
for (String s : set) {
    System.out.println(s);
}

// 使用场景：需要去重且保持插入顺序，如浏览器历史记录
```

---

### 4.5 TreeSet 详解

```java
// TreeSet 底层是 TreeMap，元素有序
// 排序方式：自然排序 or 定制排序

// 1. 自然排序（实现 Comparable 接口）
TreeSet<Integer> set = new TreeSet<>();
set.add(5);
set.add(2);
set.add(8);
// 遍历：2 → 5 → 8（升序）

// 2. 定制排序（传入 Comparator）
TreeSet<String> set2 = new TreeSet<>((a, b) -> b.compareTo(a));
set2.add("A");
set2.add("C");
set2.add("B");
// 遍历：C → B → A（降序）

// 特有方法
TreeSet<Integer> treeSet = new TreeSet<>(Arrays.asList(1, 3, 5, 7, 9));
treeSet.first();    // 1（第一个元素）
treeSet.last();     // 9（最后一个元素）
treeSet.headSet(5); // [1, 3]（小于 5 的元素）
treeSet.tailSet(5); // [5, 7, 9]（大于等于 5 的元素）
treeSet.subSet(3, 7); // [3, 5]（3 <= x < 7）
treeSet.lower(5);   // 3（小于 5 的最大元素）
treeSet.higher(5);  // 7（大于 5 的最小元素）
```

---

## 5. Queue 接口

### 5.1 Queue 体系

```
Queue 接口
├── Deque 接口（双端队列）
│   ├── ArrayDeque
│   └── LinkedList
├── PriorityQueue（优先级队列）
└── BlockingQueue 接口（阻塞队列，并发包）
    ├── ArrayBlockingQueue
    ├── LinkedBlockingQueue
    └── PriorityBlockingQueue
```

### 5.2 Queue 常用方法

| 方法 | 含义 | 异常 | 特殊值 |
|------|------|------|--------|
| `add(e)` | 添加元素 | 满时抛异常 | - |
| `offer(e)` | 添加元素 | 满时返回 false | - |
| `remove()` | 删除队首 | 空时抛异常 | - |
| `poll()` | 删除队首 | 空时返回 null | - |
| `element()` | 查看队首 | 空时抛异常 | - |
| `peek()` | 查看队首 | 空时返回 null | - |

### 5.3 PriorityQueue（优先级队列）

```java
// 底层是堆结构（小顶堆）
// 特点：每次取出的是优先级最高（最小）的元素

// 自然排序
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(5);
pq.offer(2);
pq.offer(8);
pq.offer(1);

// 取出顺序：1 → 2 → 5 → 8（升序）
while (!pq.isEmpty()) {
    System.out.println(pq.poll());
}

// 定制排序（大顶堆）
PriorityQueue<Integer> pq2 = new PriorityQueue<>((a, b) -> b - a);
pq2.offer(5);
pq2.offer(2);
pq2.offer(8);

// 取出顺序：8 → 5 → 2（降序）

// 使用场景：TopK 问题、任务调度、哈夫曼编码等
```

---

## 6. Map 接口

### 6.1 Map 特性

- ✅ **键值对存储**：key-value 形式
- ✅ **key 唯一**：不允许重复，重复会覆盖
- ✅ **value 可重复**：可以存储相同的值
- ✅ **key 可为 null**：大多数实现允许一个 null key

### 6.2 HashMap vs LinkedHashMap vs TreeMap vs Hashtable

| 特性 | HashMap | LinkedHashMap | TreeMap | Hashtable |
|------|---------|---------------|---------|-----------|
| **底层结构** | 数组 + 链表 + 红黑树 | HashMap + 双向链表 | 红黑树 | 数组 + 链表 |
| **有序性** | 无序 | 插入顺序有序 | 自然排序/定制排序 | 无序 |
| **null key** | 允许一个 | 允许一个 | 不允许 | 不允许 |
| **null value** | 允许 | 允许 | 不允许 | 不允许 |
| **线程安全** | ❌ | ❌ | ❌ | ✅（synchronized） |
| **性能** | 最快 O(1) | 略慢 | O(log n) | 慢 |
| **使用场景** | 最常用 | 需要顺序 | 需要排序 | 已过时 |

### 6.3 HashMap 详解（重点 ⭐）

#### 源码分析（JDK 1.8）

```java
// HashMap 核心源码
public class HashMap<K,V> extends AbstractMap<K,V>
    implements Map<K,V>, Cloneable, Serializable {
    
    // 默认容量：16
    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4;
    
    // 最大容量：2^30
    static final int MAXIMUM_CAPACITY = 1 << 30;
    
    // 默认负载因子：0.75
    static final float DEFAULT_LOAD_FACTOR = 0.75f;
    
    // 树化阈值：8（链表长度 >= 8 转红黑树）
    static final int TREEIFY_THRESHOLD = 8;
    
    // 退化阈值：6（红黑树节点 <= 6 退化为链表）
    static final int UNTREEIFY_THRESHOLD = 6;
    
    // 最小树化容量：64
    static final int MIN_TREEIFY_CAPACITY = 64;
    
    // 存储数组
    transient Node<K,V>[] table;
    
    // 实际元素个数
    transient int size;
    
    // 修改次数（用于 fail-fast）
    transient int modCount;
    
    // 阈值 = 容量 * 负载因子
    int threshold;
    
    // 负载因子
    final float loadFactor;
    
    // 节点结构
    static class Node<K,V> implements Map.Entry<K,V> {
        final int hash;
        final K key;
        V value;
        Node<K,V> next;  // 链表下一个节点
        
        Node(int hash, K key, V value, Node<K,V> next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }
        
        // 红黑树节点（JDK 1.8 新增）
        static final class TreeNode<K,V> extends Node<K,V> {
            TreeNode<K,V> parent;  // 父节点
            TreeNode<K,V> left;    // 左子节点
            TreeNode<K,V> right;   // 右子节点
            TreeNode<K,V> prev;    // 前驱节点
            boolean red;           // 颜色
        }
    }
    
    // put 方法
    public V put(K key, V value) {
        return putVal(hash(key), key, value, false, true);
    }
    
    // 核心 put 逻辑
    final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        
        // 1. 数组为空或长度为 0，初始化
        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;
        
        // 2. 计算索引位置，如果该位置为空，直接插入
        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);
        else {
            Node<K,V> e; K k;
            
            // 3. key 已存在，覆盖 value
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
            // 4. 红黑树节点，调用树插入方法
            else if (p instanceof TreeNode)
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            else {
                // 5. 链表插入
                for (int binCount = 0; ; ++binCount) {
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        // 6. 链表长度 >= 8，树化
                        if (binCount >= TREEIFY_THRESHOLD - 1)
                            treeifyBin(tab, hash);
                        break;
                    }
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }
            
            // 7. key 已存在，覆盖 value
            if (e != null) {
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
        
        ++modCount;
        
        // 8. 元素个数超过阈值，扩容
        if (++size > threshold)
            resize();
        
        afterNodeInsertion(evict);
        return null;
    }
    
    // 扩容方法
    final Node<K,V>[] resize() {
        Node<K,V>[] oldTab = table;
        int oldCap = (oldTab == null) ? 0 : oldTab.length;
        int oldThr = threshold;
        int newCap, newThr = 0;
        
        // 计算新容量和新阈值
        if (oldCap > 0) {
            if (oldCap >= MAXIMUM_CAPACITY) {
                threshold = Integer.MAX_VALUE;
                return oldTab;
            }
            else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                     oldCap >= DEFAULT_INITIAL_CAPACITY)
                newThr = oldThr << 1; // 扩容 2 倍
        }
        
        // 创建新数组
        Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
        table = newTab;
        
        // 重新 hash 分布（rehash）
        if (oldTab != null) {
            for (int j = 0; j < oldCap; ++j) {
                Node<K,V> e;
                if ((e = oldTab[j]) != null) {
                    oldTab[j] = null;
                    if (e.next == null)
                        newTab[e.hash & (newCap - 1)] = e;
                    else if (e instanceof TreeNode)
                        ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                    else {
                        // 链表重新分布
                        Node<K,V> loHead = null, loTail = null;
                        Node<K,V> hiHead = null, hiTail = null;
                        Node<K,V> next;
                        do {
                            next = e.next;
                            if ((e.hash & oldCap) == 0) {
                                if (loTail == null)
                                    loHead = e;
                                else
                                    loTail.next = e;
                                loTail = e;
                            }
                            else {
                                if (hiTail == null)
                                    hiHead = e;
                                else
                                    hiTail.next = e;
                                hiTail = e;
                            }
                        } while ((e = next) != null);
                        
                        if (loTail != null) {
                            loTail.next = null;
                            newTab[j] = loHead;
                        }
                        if (hiTail != null) {
                            hiTail.next = null;
                            newTab[j + oldCap] = hiHead;
                        }
                    }
                }
            }
        }
        return newTab;
    }
    
    // get 方法
    public V get(Object key) {
        Node<K,V> e;
        return (e = getNode(hash(key), key)) == null ? null : e.value;
    }
    
    final Node<K,V> getNode(int hash, Object key) {
        Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
        
        // 1. 定位桶
        if ((tab = table) != null && (n = tab.length) > 0 &&
            (first = tab[(n - 1) & hash]) != null) {
            
            // 2. 检查第一个节点
            if (first.hash == hash &&
                ((k = first.key) == key || (key != null && key.equals(k))))
                return first;
            
            // 3. 遍历链表或红黑树
            if ((e = first.next) != null) {
                if (first instanceof TreeNode)
                    return ((TreeNode<K,V>)first).getTreeNode(hash, key);
                do {
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        return e;
                } while ((e = e.next) != null);
            }
        }
        return null;
    }
}
```

#### 关键知识点

**1. 数据结构**
- JDK 1.7：数组 + 链表
- JDK 1.8：数组 + 链表 + 红黑树

**2. hash 计算**
```java
// 扰动函数：减少 hash 冲突
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

**3. 索引计算**
```java
// (n - 1) & hash 等价于 hash % n，但性能更高
// 要求：数组长度必须是 2 的幂
index = (table.length - 1) & hash
```

**4. 扩容机制**
- 默认容量：16
- 扩容阈值：容量 * 负载因子（16 * 0.75 = 12）
- 扩容倍数：2 倍
- 扩容时机：元素个数 > 阈值

**5. 链表树化**
- 链表长度 >= 8 且 数组长度 >= 64 → 转红黑树
- 红黑树节点 <= 6 → 退化为链表

#### 使用示例

```java
// 创建
Map<String, Integer> map = new HashMap<>();
Map<String, Integer> map2 = new HashMap<>(32);
Map<String, Integer> map3 = new HashMap<>(16, 0.75f);

// 添加
map.put("张三", 25);
map.put("李四", 30);

// 查询
Integer age = map.get("张三");
boolean contains = map.containsKey("张三");
boolean containsValue = map.containsValue(25);

// 修改
map.put("张三", 26);  // 覆盖

// 删除
map.remove("张三");

// 大小
int size = map.size();

// 遍历（推荐）
// 方式 1：entrySet（最常用）
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    System.out.println(entry.getKey() + " = " + entry.getValue());
}

// 方式 2：keySet
for (String key : map.keySet()) {
    System.out.println(key + " = " + map.get(key));
}

// 方式 3：forEach + Lambda（JDK 8+）
map.forEach((k, v) -> System.out.println(k + " = " + v));

// 方式 4：Stream API
map.entrySet().stream()
    .filter(e -> e.getValue() > 25)
    .forEach(e -> System.out.println(e.getKey()));

// 合并
map.putAll(map2);

// 清空
map.clear();

// 获取或默认值
Integer age2 = map.getOrDefault("王五", 0);  // 不存在返回 0

// 计算
map.compute("张三", (k, v) -> v == null ? 1 : v + 1);
map.computeIfAbsent("张三", k -> 25);
map.computeIfPresent("张三", (k, v) -> v + 1);
```

#### 线程安全问题

```java
// ❌ HashMap 非线程安全，多线程环境下会出现问题

// 解决方案 1：Hashtable（已过时，不推荐）
Map<String, Integer> map = new Hashtable<>();

// 解决方案 2：Collections.synchronizedMap
Map<String, Integer> map = Collections.synchronizedMap(new HashMap<>());

// 解决方案 3：ConcurrentHashMap（推荐 ⭐）
Map<String, Integer> map = new ConcurrentHashMap<>();
```

---

### 6.4 ConcurrentHashMap 详解（重点 ⭐）

#### 源码分析（JDK 1.8）

```java
// ConcurrentHashMap 核心源码
public class ConcurrentHashMap<K,V> extends AbstractMap<K,V>
    implements ConcurrentMap<K,V>, Serializable {
    
    // 默认容量：16
    private static final int DEFAULT_CAPACITY = 16;
    
    // 默认并发级别：16
    private static final int DEFAULT_CONCURRENCY_LEVEL = 16;
    
    // 默认负载因子：0.75
    private static final float LOAD_FACTOR = 0.75f;
    
    // 树化阈值：8
    private static final int TREEIFY_THRESHOLD = 8;
    
    // 节点结构
    static class Node<K,V> implements Map.Entry<K,V> {
        final int hash;
        final K key;
        volatile V val;  // volatile 保证可见性
        volatile Node<K,V> next;
        
        Node(int hash, K key, V val) {
            this.hash = hash;
            this.key = key;
            this.val = val;
            this.next = null;
        }
    }
    
    // put 方法（CAS + synchronized）
    public V put(K key, V value) {
        return putVal(key, value, false);
    }
    
    final V putVal(K key, V value, boolean onlyIfAbsent) {
        if (key == null || value == null)
            throw new NullPointerException();
        
        int hash = spread(key.hashCode());
        int binCount = 0;
        
        for (Node<K,V>[] tab = table;;) {
            Node<K,V> f; int n, i, fh;
            
            // 1. 数组为空，初始化
            if (tab == null || (n = tab.length) == 0)
                tab = initTable();
            
            // 2. 桶为空，CAS 插入
            else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
                if (casTabAt(tab, i, null,
                             new Node<K,V>(hash, key, value, null)))
                    break;
            }
            
            // 3. 正在扩容，帮助扩容
            else if ((fh = f.hash) == MOVED)
                tab = helpTransfer(tab, f);
            
            else {
                V oldVal = null;
                // 4. 桶不为空，synchronized 锁桶
                synchronized (f) {
                    if (tabAt(tab, i) == f) {
                        if (fh >= 0) {
                            binCount = 1;
                            // 链表遍历
                            for (Node<K,V> e = f;; ++binCount) {
                                K ek;
                                if (e.hash == hash &&
                                    ((ek = e.key) == key ||
                                     (ek != null && key.equals(ek)))) {
                                    oldVal = e.val;
                                    if (!onlyIfAbsent)
                                        e.val = value;
                                    break;
                                }
                                Node<K,V> pred = e;
                                if ((e = e.next) == null) {
                                    pred.next = new Node<K,V>(hash, key,
                                                              value, null);
                                    break;
                                }
                            }
                        }
                        else if (f instanceof TreeBin) {
                            // 红黑树插入
                            Node<K,V> p;
                            binCount = 2;
                            if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key,
                                                           value)) != null) {
                                oldVal = p.val;
                                if (!onlyIfAbsent)
                                    p.val = value;
                            }
                        }
                    }
                }
                
                if (binCount != 0) {
                    // 链表转红黑树
                    if (binCount >= TREEIFY_THRESHOLD)
                        treeifyBin(tab, i);
                    if (oldVal != null)
                        return oldVal;
                    break;
                }
            }
        }
        addCount(1L, binCount);
        return null;
    }
}
```

#### JDK 1.7 vs JDK 1.8

| 特性 | JDK 1.7 | JDK 1.8 |
|------|---------|---------|
| **数据结构** | 数组 + 链表 + Segment | 数组 + 链表 + 红黑树 |
| **锁粒度** | Segment（段锁） | Node（桶锁） |
| **并发度** | 16（默认） | 数组长度 |
| **hash 计算** | 二次 hash | 一次 hash |
| **扩容** | 需要全局锁 | 协助扩容 |

#### 使用示例

```java
// 创建
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
ConcurrentHashMap<String, Integer> map2 = new ConcurrentHashMap<>(32);
ConcurrentHashMap<String, Integer> map3 = new ConcurrentHashMap<>(16, 0.75f, 16);

// 常用方法
map.put("张三", 25);
map.get("张三");
map.remove("张三");

// 原子操作
map.putIfAbsent("张三", 25);  // 不存在才添加
map.replace("张三", 25, 26);  // 替换
map.compute("张三", (k, v) -> v == null ? 1 : v + 1);

// 批量操作
map.forEach(1, (k, v) -> System.out.println(k + " = " + v));
map.search(1, (k, v) -> v > 25 ? k : null);
map.reduce(1, (k, v) -> k + ":" + v, (s1, s2) -> s1 + ", " + s2);

// 大小（近似值）
int size = map.size();  // 不精确，但性能高
long count = map.mappingCount();  // 精确
```

---

### 6.5 TreeMap 详解

```java
// TreeMap 底层是红黑树，key 有序
// 排序方式：自然排序 or 定制排序

// 自然排序
TreeMap<Integer, String> map = new TreeMap<>();
map.put(3, "C");
map.put(1, "A");
map.put(2, "B");
// 遍历：1=A, 2=B, 3=C（升序）

// 定制排序
TreeMap<String, Integer> map2 = new TreeMap<>((a, b) -> b.compareTo(a));
map2.put("A", 1);
map2.put("C", 3);
map2.put("B", 2);
// 遍历：C=3, B=2, A=1（降序）

// 特有方法
TreeMap<Integer, String> treeMap = new TreeMap<>();
treeMap.put(1, "A");
treeMap.put(3, "C");
treeMap.put(5, "E");

treeMap.firstKey();     // 1
treeMap.lastKey();      // 5
treeMap.headMap(3);     // {1=A}
treeMap.tailMap(3);     // {3=C, 5=E}
treeMap.subMap(1, 5);   // {1=A, 3=C}
treeMap.lowerKey(3);    // 1
treeMap.higherKey(3);   // 5
treeMap.floorKey(3);    // 3
treeMap.ceilingKey(3);  // 3
```

---

## 7. Collections 工具类

### 7.1 排序

```java
List<Integer> list = Arrays.asList(5, 2, 8, 1, 9);

// 升序
Collections.sort(list);

// 降序
Collections.sort(list, Collections.reverseOrder());

// 定制排序
Collections.sort(list, (a, b) -> b - a);

// 随机打乱
Collections.shuffle(list);

// 反转
Collections.reverse(list);

// 旋转
Collections.rotate(list, 2);  // 向右旋转 2 位
```

### 7.2 查找

```java
List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);

// 二分查找（要求已排序）
int index = Collections.binarySearch(list, 3);

// 最大值/最小值
Integer max = Collections.max(list);
Integer min = Collections.min(list);

// 频率
int count = Collections.frequency(list, 3);

// 填充
Collections.fill(list, 0);  // 全部填充为 0

// 复制
Collections.copy(dest, src);

// 交换
Collections.swap(list, 0, 1);
```

### 7.3 同步包装

```java
// 线程安全的集合
List<String> list = Collections.synchronizedList(new ArrayList<>());
Set<String> set = Collections.synchronizedSet(new HashSet<>());
Map<String, Integer> map = Collections.synchronizedMap(new HashMap<>());

// 注意：遍历时需要手动同步
synchronized (list) {
    for (String s : list) {
        System.out.println(s);
    }
}
```

### 7.4 不可变集合

```java
// 不可变集合（JDK 9+）
List<String> list = List.of("A", "B", "C");
Set<String> set = Set.of("A", "B", "C");
Map<String, Integer> map = Map.of("A", 1, "B", 2, "C", 3);

// 添加/修改会抛 UnsupportedOperationException
list.add("D");  // ❌
```

---

## 8. 迭代器

### 8.1 Iterator

```java
List<String> list = Arrays.asList("A", "B", "C");
Iterator<String> it = list.iterator();

while (it.hasNext()) {
    String s = it.next();
    System.out.println(s);
    it.remove();  // 可以在遍历中安全删除
}
```

### 8.2 ListIterator（仅 List）

```java
List<String> list = Arrays.asList("A", "B", "C");
ListIterator<String> it = list.listIterator();

// 双向遍历
while (it.hasNext()) {
    System.out.println(it.next());
}

while (it.hasPrevious()) {
    System.out.println(it.previous());
}

// 添加/修改
it.add("D");
it.set("E");
```

---

## 9. 泛型

### 9.1 泛型类

```java
public class Box<T> {
    private T content;
    
    public void set(T content) {
        this.content = content;
    }
    
    public T get() {
        return content;
    }
}

// 使用
Box<String> stringBox = new Box<>();
stringBox.set("Hello");
String s = stringBox.get();
```

### 9.2 泛型方法

```java
public <T> void print(T t) {
    System.out.println(t);
}

// 使用
print("Hello");
print(123);
```

### 9.3 泛型通配符

```java
// 上界通配符：? extends T（只能读，不能写）
public void printList(List<? extends Number> list) {
    for (Number n : list) {
        System.out.println(n);
    }
}

// 下界通配符：? super T（只能写，不能读）
public void addNumbers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
}

// 无界通配符：?（可以读 Object，不能写）
public void printAnyList(List<?> list) {
    for (Object o : list) {
        System.out.println(o);
    }
}

// PECS 原则：Producer Extends, Consumer Super
```

---

## 10. 最佳实践

### 10.1 集合选择

```java
// ✅ 推荐
List<String> list = new ArrayList<>();  // 最常用
Set<String> set = new HashSet<>();      // 去重
Map<String, Integer> map = new HashMap<>();  // 键值对
Map<String, Integer> concurrentMap = new ConcurrentHashMap<>();  // 并发

// ❌ 不推荐
List<String> list = new Vector<>();     // 已过时
Map<String, Integer> map = new Hashtable<>();  // 已过时
List<String> list = new LinkedList<>(); // 除非明确需要频繁增删
```

### 10.2 初始化容量

```java
// 预估大小，避免扩容
List<String> list = new ArrayList<>(100);
Map<String, Integer> map = new HashMap<>(100);

// HashMap 容量计算：预期大小 / 负载因子 + 1
Map<String, Integer> map = new HashMap<>((int)(100 / 0.75f) + 1);
```

### 10.3 空集合

```java
// ✅ 推荐：使用空集合
List<String> list = Collections.emptyList();
Map<String, Integer> map = Collections.emptyMap();
Set<String> set = Collections.emptySet();

// ❌ 不推荐：返回 null
public List<String> getList() {
    return null;  // 调用方需要判空
}

// ✅ 推荐：返回空集合
public List<String> getList() {
    return Collections.emptyList();  // 调用方无需判空
}
```

### 10.4 集合转 Map

```java
List<Person> persons = Arrays.asList(
    new Person("张三", 25),
    new Person("李四", 30)
);

// JDK 8+ Stream API
Map<String, Integer> map = persons.stream()
    .collect(Collectors.toMap(
        Person::getName,
        Person::getAge,
        (v1, v2) -> v1  // key 冲突时的处理策略
    ));
```

### 10.5 并发集合

```java
// 读多写少：CopyOnWriteArrayList
List<String> list = new CopyOnWriteArrayList<>();

// 高并发读写：ConcurrentHashMap
Map<String, Integer> map = new ConcurrentHashMap<>();

// 阻塞队列：生产者 - 消费者模式
BlockingQueue<String> queue = new LinkedBlockingQueue<>(100);
queue.put("元素");  // 满时阻塞
String element = queue.take();  // 空时阻塞
```

---

## 💡 常见面试题

1. **ArrayList vs LinkedList 的区别？**
2. **HashMap 的底层原理？**
3. **HashMap 和 Hashtable 的区别？**
4. **ConcurrentHashMap 如何保证线程安全？**
5. **HashSet 如何保证元素不重复？**
6. **HashMap 的扩容机制？**
7. **HashMap 为什么线程不安全？**
8. **ArrayList 的扩容机制？**
9. **Collection 和 Collections 的区别？**
10. **fail-fast 机制是什么？**

---

## 📚 参考资料

- 《Java 核心技术 卷 I》
- 《Effective Java》
- 《Java 并发编程实战》
- [HashMap 源码分析](https://github.com/openclaw/openclaw)
- [Oracle Java 官方文档](https://docs.oracle.com/javase/tutorial/collections/)

---

> 💡 **学习建议**：集合框架是 Java 基础中的重点，务必掌握 HashMap、ConcurrentHashMap 源码！
