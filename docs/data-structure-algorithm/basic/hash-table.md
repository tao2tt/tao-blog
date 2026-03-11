# 哈希表

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-16  
> 难度：⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 哈希表定义

**哈希表（Hash Table）：** 根据键（Key）直接访问内存存储位置的数据结构

**核心思想：** 通过哈希函数将键映射到数组下标

**特点：**
- ✅ 插入/删除/查找：平均 O(1)
- ❌ 最坏情况：O(n)
- ❌ 无序

---

## 2. 哈希函数

### 2.1 定义

**哈希函数：** 将任意长度的输入映射为固定长度的输出

```
hash(key) → index
```

### 2.2 设计要求

1. **确定性** - 相同输入产生相同输出
2. **均匀性** - 输出均匀分布
3. **高效性** - 计算速度快
4. **低碰撞** - 不同输入尽量产生不同输出

### 2.3 常见哈希函数

```java
/**
 * 除留余数法（最常用）
 */
public int hash1(int key, int capacity) {
    return key % capacity;
}

/**
 * Java String hashCode()
 */
public int hashCode() {
    int h = hash;
    if (h == 0 && value.length > 0) {
        byte val[] = value;
        for (int i = 0; i < value.length; i++) {
            h = 31 * h + val[i];
        }
        hash = h;
    }
    return h;
}

/**
 * 乘法哈希
 */
public int hash2(int key, int capacity) {
    double A = 0.6180339887;  // 黄金比例
    double val = key * A;
    val = val - Math.floor(val);  // 取小数部分
    return (int) (val * capacity);
}
```

---

## 3. 哈希冲突解决

### 3.1 冲突定义

**冲突：** 不同的键映射到相同的下标

### 3.2 链地址法（Separate Chaining）

**原理：** 每个数组位置存储一个链表

```java
/**
 * 链地址法实现哈希表
 */
public class ChainingHashMap<K, V> {
    
    private static class Node<K, V> {
        K key;
        V value;
        Node<K, V> next;
        
        Node(K key, V value) {
            this.key = key;
            this.value = value;
        }
    }
    
    private Node<K, V>[] buckets;
    private int capacity;
    private int size;
    private static final double LOAD_FACTOR = 0.75;
    
    public ChainingHashMap(int capacity) {
        this.capacity = capacity;
        this.buckets = new Node[capacity];
        this.size = 0;
    }
    
    private int hash(K key) {
        int h = key.hashCode();
        return (h ^ (h >>> 16)) & (capacity - 1);  // 扰动函数
    }
    
    // 插入 O(1) 平均
    public void put(K key, V value) {
        int index = hash(key);
        Node<K, V> curr = buckets[index];
        
        // 查找是否已存在
        while (curr != null) {
            if (curr.key.equals(key)) {
                curr.value = value;
                return;
            }
            curr = curr.next;
        }
        
        // 头插法
        Node<K, V> newNode = new Node<>(key, value);
        newNode.next = buckets[index];
        buckets[index] = newNode;
        size++;
        
        // 扩容
        if ((double) size / capacity > LOAD_FACTOR) {
            resize();
        }
    }
    
    // 查找 O(1) 平均
    public V get(K key) {
        int index = hash(key);
        Node<K, V> curr = buckets[index];
        
        while (curr != null) {
            if (curr.key.equals(key)) {
                return curr.value;
            }
            curr = curr.next;
        }
        
        return null;
    }
    
    // 删除 O(1) 平均
    public V remove(K key) {
        int index = hash(key);
        Node<K, V> curr = buckets[index];
        Node<K, V> prev = null;
        
        while (curr != null) {
            if (curr.key.equals(key)) {
                if (prev == null) {
                    buckets[index] = curr.next;
                } else {
                    prev.next = curr.next;
                }
                size--;
                return curr.value;
            }
            prev = curr;
            curr = curr.next;
        }
        
        return null;
    }
    
    // 扩容
    private void resize() {
        Node<K, V>[] oldBuckets = buckets;
        capacity *= 2;
        buckets = new Node[capacity];
        size = 0;
        
        for (Node<K, V> head : oldBuckets) {
            while (head != null) {
                Node<K, V> next = head.next;
                head.next = null;
                put(head.key, head.value);
                head = next;
            }
        }
    }
    
    public int size() {
        return size;
    }
    
    public boolean isEmpty() {
        return size == 0;
    }
}
```

### 3.3 开放寻址法（Open Addressing）

**原理：** 冲突时寻找下一个空位

**探测方法：**
1. **线性探测** - `hash(key, i) = (hash(key) + i) % capacity`
2. **二次探测** - `hash(key, i) = (hash(key) + i²) % capacity`
3. **双重哈希** - `hash(key, i) = (hash1(key) + i * hash2(key)) % capacity`

```java
/**
 * 线性探测实现哈希表
 */
public class OpenAddressingHashMap<K, V> {
    
    private static class Entry<K, V> {
        K key;
        V value;
        boolean isDeleted;
        
        Entry(K key, V value) {
            this.key = key;
            this.value = value;
        }
    }
    
    private Entry<K, V>[] table;
    private int capacity;
    private int size;
    private static final double LOAD_FACTOR = 0.75;
    
    public OpenAddressingHashMap(int capacity) {
        this.capacity = capacity;
        this.table = new Entry[capacity];
        this.size = 0;
    }
    
    private int hash(K key, int i) {
        int h = key.hashCode();
        return ((h ^ (h >>> 16)) + i) & (capacity - 1);
    }
    
    public void put(K key, V value) {
        if ((double) size / capacity > LOAD_FACTOR) {
            resize();
        }
        
        for (int i = 0; i < capacity; i++) {
            int index = hash(key, i);
            
            if (table[index] == null || table[index].isDeleted) {
                table[index] = new Entry<>(key, value);
                size++;
                return;
            }
            
            if (table[index].key.equals(key)) {
                table[index].value = value;
                return;
            }
        }
    }
    
    public V get(K key) {
        for (int i = 0; i < capacity; i++) {
            int index = hash(key, i);
            
            if (table[index] == null) {
                return null;
            }
            
            if (!table[index].isDeleted && table[index].key.equals(key)) {
                return table[index].value;
            }
        }
        
        return null;
    }
    
    public V remove(K key) {
        for (int i = 0; i < capacity; i++) {
            int index = hash(key, i);
            
            if (table[index] == null) {
                return null;
            }
            
            if (!table[index].isDeleted && table[index].key.equals(key)) {
                V value = table[index].value;
                table[index].isDeleted = true;
                size--;
                return value;
            }
        }
        
        return null;
    }
    
    private void resize() {
        Entry<K, V>[] oldTable = table;
        capacity *= 2;
        table = new Entry[capacity];
        size = 0;
        
        for (Entry<K, V> entry : oldTable) {
            if (entry != null && !entry.isDeleted) {
                put(entry.key, entry.value);
            }
        }
    }
}
```

---

## 4. Java 内置哈希表

### 4.1 HashMap

```java
// 创建
Map<String, Integer> map = new HashMap<>();

// 插入
map.put("a", 1);
map.put("b", 2);

// 查找
Integer val = map.get("a");

// 删除
map.remove("a");

// 遍历
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    System.out.println(entry.getKey() + " = " + entry.getValue());
}

// 或者
map.forEach((k, v) -> System.out.println(k + " = " + v));
```

### 4.2 HashSet

```java
// 创建
Set<String> set = new HashSet<>();

// 添加
set.add("a");
set.add("b");

// 查找
boolean exists = set.contains("a");

// 删除
set.remove("a");

// 遍历
for (String s : set) {
    System.out.println(s);
}
```

### 4.3 LinkedHashMap（有序）

```java
// 按插入顺序遍历
Map<String, Integer> map = new LinkedHashMap<>();
map.put("c", 3);
map.put("a", 1);
map.put("b", 2);

// 遍历顺序：c, a, b
```

### 4.4 TreeMap（排序）

```java
// 按 key 排序
Map<String, Integer> map = new TreeMap<>();
map.put("c", 3);
map.put("a", 1);
map.put("b", 2);

// 遍历顺序：a, b, c
```

---

## 5. LeetCode 例题

### 5.1 两数之和

```java
/**
 * LeetCode 1. 两数之和
 */
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        
        map.put(nums[i], i);
    }
    
    throw new IllegalArgumentException("No solution");
}

// 时间复杂度：O(n)
// 空间复杂度：O(n)
```

### 5.2 字母异位词分组

```java
/**
 * LeetCode 49. 字母异位词分组
 * 
 * 将字母异位词组合在一起。
 */
public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();
    
    for (String s : strs) {
        char[] chars = s.toCharArray();
        Arrays.sort(chars);
        String key = new String(chars);
        
        map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
    }
    
    return new ArrayList<>(map.values());
}

// 时间复杂度：O(n * k log k)
// 空间复杂度：O(n * k)
```

### 5.3 最长连续序列

```java
/**
 * LeetCode 128. 最长连续序列
 * 
 * 给定一个未排序的整数数组，找出最长连续序列的长度。
 */
public int longestConsecutive(int[] nums) {
    Set<Integer> set = new HashSet<>();
    for (int num : nums) {
        set.add(num);
    }
    
    int longest = 0;
    
    for (int num : set) {
        // 只从序列起点开始
        if (!set.contains(num - 1)) {
            int currentNum = num;
            int currentStreak = 1;
            
            while (set.contains(currentNum + 1)) {
                currentNum++;
                currentStreak++;
            }
            
            longest = Math.max(longest, currentStreak);
        }
    }
    
    return longest;
}

// 时间复杂度：O(n)
// 空间复杂度：O(n)
```

### 5.4 有效的数独

```java
/**
 * LeetCode 36. 有效的数独
 */
public boolean isValidSudoku(char[][] board) {
    Set<String> seen = new HashSet<>();
    
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            char num = board[i][j];
            
            if (num != '.') {
                String rowKey = "row" + i + num;
                String colKey = "col" + j + num;
                String boxKey = "box" + (i / 3) + (j / 3) + num;
                
                if (!seen.add(rowKey) || 
                    !seen.add(colKey) || 
                    !seen.add(boxKey)) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

// 时间复杂度：O(1) - 固定 9x9
// 空间复杂度：O(1)
```

### 5.5 前 K 个高频元素

```java
/**
 * LeetCode 347. 前 K 个高频元素
 */
public int[] topKFrequent(int[] nums, int k) {
    // 统计频率
    Map<Integer, Integer> freq = new HashMap<>();
    for (int num : nums) {
        freq.put(num, freq.getOrDefault(num, 0) + 1);
    }
    
    // 桶排序
    List<Integer>[] buckets = new List[nums.length + 1];
    for (Map.Entry<Integer, Integer> entry : freq.entrySet()) {
        int num = entry.getKey();
        int f = entry.getValue();
        
        if (buckets[f] == null) {
            buckets[f] = new ArrayList<>();
        }
        buckets[f].add(num);
    }
    
    // 收集前 K 个
    int[] result = new int[k];
    int index = 0;
    
    for (int i = buckets.length - 1; i >= 0 && index < k; i--) {
        if (buckets[i] != null) {
            for (int num : buckets[i]) {
                result[index++] = num;
                if (index == k) break;
            }
        }
    }
    
    return result;
}

// 时间复杂度：O(n)
// 空间复杂度：O(n)
```

---

## 6. 实战技巧

### 6.1 哈希表 + 数组

```java
// 统计频率
Map<Integer, Integer> freq = new HashMap<>();
for (int num : nums) {
    freq.put(num, freq.getOrDefault(num, 0) + 1);
}
```

### 6.2 哈希表 + 集合

```java
// 去重
Set<Integer> set = new HashSet<>();
for (int num : nums) {
    if (!set.add(num)) {
        // 重复元素
    }
}
```

### 6.3 双向映射

```java
// 需要双向查找时使用两个 Map
Map<K, V> kvMap = new HashMap<>();
Map<V, K> vkMap = new HashMap<>();
```

---

## 📝 待办事项

- [ ] 理解哈希表原理
- [ ] 掌握哈希函数设计
- [ ] 理解链地址法
- [ ] 理解开放寻址法
- [ ] 掌握 HashMap 使用
- [ ] 完成 LeetCode 5 道题
- [ ] 理解负载因子

---

**下一讲：[树与二叉树](/data-structure-algorithm/advanced/tree)**

---

**推荐资源：**
- 📖 《算法 4》第 3.4 节
- 🔗 LeetCode 哈希表专题
- 🔗 Java HashMap 源码分析
