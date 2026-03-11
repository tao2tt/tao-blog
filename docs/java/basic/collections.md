# 集合框架

> 学习日期：2026-03-__  
> 预计完成：2026-03-__  
> 状态：📝 学习中

## 学习目标

- [ ] 理解 Collection 体系结构
- [ ] 掌握 List、Set、Map 的使用场景
- [ ] 理解 HashMap 底层原理
- [ ] 掌握 ConcurrentHashMap 实现

## 学习内容

### 1. Collection 体系

```
Collection
├── List
│   ├── ArrayList    // 数组实现，查询快，增删慢
│   ├── LinkedList   // 链表实现，增删快，查询慢
│   └── Vector       // 线程安全（已过时）
├── Set
│   ├── HashSet      // HashMap 实现，无序
│   ├── LinkedHashSet // 有序
│   └── TreeSet      // 红黑树，可排序
└── Queue
```

### 2. Map 体系

```
Map
├── HashMap          // 最常用，非线程安全
├── LinkedHashMap    // 有序
├── TreeMap          // 可排序
├── ConcurrentHashMap // 线程安全
└── Hashtable        // 线程安全（已过时）
```

### 3. HashMap 核心知识点

- **数据结构**：数组 + 链表 + 红黑树（JDK8+）
- **扩容机制**：容量翻倍，重新 hash
- **hash 计算**：`(key.hashCode()) ^ (key.hashCode() >>> 16)`
- **put 流程**：计算 hash → 定位桶 → 插入/更新 → 检查扩容
- **线程安全问题**：多线程 put 可能丢失数据

## 代码示例

```java
// HashMap 使用示例
Map<String, User> map = new HashMap<>();
map.put("001", new User("张三"));
map.put("002", new User("李四"));

// 遍历方式
for (Map.Entry<String, User> entry : map.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// ConcurrentHashMap 线程安全
ConcurrentMap<String, User> concurrentMap = new ConcurrentHashMap<>();
concurrentMap.putIfAbsent("001", new User("张三"));
```

## 常见问题

1. **HashMap 为什么线程不安全？**
   - 多线程 put 可能导致数据覆盖
   - JDK7 扩容时可能死循环（JDK8 已修复）

2. **HashMap 和 Hashtable 区别？**
   - HashMap 非线程安全，允许 null 键值
   - Hashtable 线程安全，不允许 null

3. **ConcurrentHashMap 如何实现线程安全？**
   - JDK7：分段锁（Segment）
   - JDK8：CAS + synchronized

## 参考资料

- 《Java 核心技术》第 9 章
- [Java Collection Framework 官方文档](https://docs.oracle.com/javase/8/docs/technotes/guides/collections/overview.html)

## 待办

- [ ] 阅读 HashMap 源码
- [ ] 完成 LeetCode 相关题目 5 道
- [ ] 整理笔记到博客
