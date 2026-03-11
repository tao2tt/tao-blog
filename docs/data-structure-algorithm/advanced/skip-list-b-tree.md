# 跳表与 B 树

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-21  
> 难度：⭐⭐⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 跳表（Skip List）

### 1.1 定义

**跳表：** 基于链表 + 多级索引的有序数据结构

**特点：**
- ✅ 插入/删除/查找：平均 O(log n)
- ✅ 实现简单（相比平衡树）
- ✅ 支持范围查询
- ❌ 额外空间 O(n)

**应用：** Redis Sorted Set、LevelDB

### 1.2 跳表结构

```
Level 3:  1 --------------------------> 15
Level 2:  1 ------------> 10 --------> 15
Level 1:  1 ----> 5 ----> 10 ----> 15
Level 0:  1 -> 3 -> 5 -> 7 -> 10 -> 12 -> 15
```

### 1.3 跳表实现

```java
/**
 * 跳表节点
 */
public class SkipListNode<T extends Comparable<T>> {
    T value;
    SkipListNode<T>[] next;
    int level;
    
    SkipListNode(T value, int level) {
        this.value = value;
        this.level = level;
        this.next = new SkipListNode[level + 1];
    }
}

/**
 * 跳表
 */
public class SkipList<T extends Comparable<T>> {
    private SkipListNode<T> head;
    private int maxLevel;
    private int size;
    private static final double P = 0.5;  // 升级概率
    private static final int MAX_LEVEL = 16;
    
    private Random random = new Random();
    
    public SkipList() {
        this.head = new SkipListNode<>(null, MAX_LEVEL);
        this.maxLevel = 0;
        this.size = 0;
    }
    
    // 随机生成层级
    private int randomLevel() {
        int level = 0;
        while (random.nextDouble() < P && level < MAX_LEVEL) {
            level++;
        }
        return level;
    }
    
    // 查找 O(log n) 平均
    public boolean contains(T value) {
        SkipListNode<T> curr = head;
        
        for (int i = maxLevel; i >= 0; i--) {
            while (curr.next[i] != null && 
                   curr.next[i].value.compareTo(value) < 0) {
                curr = curr.next[i];
            }
        }
        
        curr = curr.next[0];
        return curr != null && curr.value.compareTo(value) == 0;
    }
    
    // 插入 O(log n) 平均
    public void add(T value) {
        int newLevel = randomLevel();
        
        if (newLevel > maxLevel) {
            maxLevel = newLevel;
        }
        
        SkipListNode<T> newNode = new SkipListNode<>(value, newLevel);
        SkipListNode<T> curr = head;
        
        // 记录每层的前驱节点
        SkipListNode<T>[] update = new SkipListNode[maxLevel + 1];
        
        for (int i = maxLevel; i >= 0; i--) {
            while (curr.next[i] != null && 
                   curr.next[i].value.compareTo(value) < 0) {
                curr = curr.next[i];
            }
            update[i] = curr;
        }
        
        // 插入新节点
        for (int i = 0; i <= newLevel; i++) {
            newNode.next[i] = update[i].next[i];
            update[i].next[i] = newNode;
        }
        
        size++;
    }
    
    // 删除 O(log n) 平均
    public boolean remove(T value) {
        SkipListNode<T> curr = head;
        SkipListNode<T>[] update = new SkipListNode[maxLevel + 1];
        
        for (int i = maxLevel; i >= 0; i--) {
            while (curr.next[i] != null && 
                   curr.next[i].value.compareTo(value) < 0) {
                curr = curr.next[i];
            }
            update[i] = curr;
        }
        
        curr = curr.next[0];
        
        if (curr == null || curr.value.compareTo(value) != 0) {
            return false;
        }
        
        // 删除节点
        for (int i = 0; i <= maxLevel; i++) {
            if (update[i].next[i] != curr) break;
            update[i].next[i] = curr.next[i];
        }
        
        // 更新最大层级
        while (maxLevel > 0 && head.next[maxLevel] == null) {
            maxLevel--;
        }
        
        size--;
        return true;
    }
    
    // 范围查询 O(log n + k)
    public List<T> range(T from, T to) {
        List<T> result = new ArrayList<>();
        SkipListNode<T> curr = head;
        
        // 找到第一个 >= from 的节点
        for (int i = maxLevel; i >= 0; i--) {
            while (curr.next[i] != null && 
                   curr.next[i].value.compareTo(from) < 0) {
                curr = curr.next[i];
            }
        }
        
        curr = curr.next[0];
        
        // 收集范围内的所有节点
        while (curr != null && curr.value.compareTo(to) <= 0) {
            result.add(curr.value);
            curr = curr.next[0];
        }
        
        return result;
    }
    
    public int size() {
        return size;
    }
}
```

### 1.4 跳表 vs 平衡树

| 特性 | 跳表 | 平衡树（AVL/红黑） |
|------|------|-------------------|
| 查找 | O(log n) | O(log n) |
| 插入 | O(log n) | O(log n) |
| 删除 | O(log n) | O(log n) |
| 实现难度 | 简单 | 复杂 |
| 范围查询 | O(log n + k) | O(log n + k) |
| 空间 | O(n) | O(n) |
| 实际应用 | Redis | Java TreeMap |

---

## 2. B 树

### 2.1 定义

**B 树：** 自平衡的多路搜索树，保持数据有序

**特点：**
- ✅ 所有叶子节点在同一层
- ✅ 每个节点可以有多个子节点
- ✅ 适合磁盘存储（减少 IO）
- ❌ 实现复杂

**应用：** 数据库索引（MySQL、PostgreSQL）

### 2.2 B 树性质（m 阶）

1. 根节点至少有 2 个子节点（除非是叶子）
2. 每个非根节点至少有 ⌈m/2⌉ 个子节点
3. 每个节点最多有 m 个子节点
4. 所有叶子节点在同一层
5. 每个节点有 k-1 个关键字，k 个子节点

### 2.3 B 树结构

```
        [50]
       /    \
   [20,30]  [70,80,90]
   /  |  \   /  |  |  \
 [10][25][35][60][75][85][95]
```

### 2.4 B 树操作

```java
/**
 * B 树节点
 */
public class BTreeNode {
    int[] keys;
    BTreeNode[] children;
    int n;  // 当前关键字数
    boolean isLeaf;
    
    public BTreeNode(int t, boolean isLeaf) {
        this.keys = new int[2 * t - 1];
        this.children = new BTreeNode[2 * t];
        this.n = 0;
        this.isLeaf = isLeaf;
    }
}

/**
 * B 树
 */
public class BTree {
    private BTreeNode root;
    private int t;  // 最小度数
    
    public BTree(int t) {
        this.t = t;
        this.root = null;
    }
    
    // 查找 O(log n)
    public Integer search(int key) {
        return search(root, key);
    }
    
    private Integer search(BTreeNode node, int key) {
        if (node == null) return null;
        
        int i = 0;
        while (i < node.n && key > node.keys[i]) {
            i++;
        }
        
        if (i < node.n && key == node.keys[i]) {
            return node.keys[i];
        }
        
        if (node.isLeaf) {
            return null;
        }
        
        return search(node.children[i], key);
    }
    
    // 插入（简化版）
    public void insert(int key) {
        if (root == null) {
            root = new BTreeNode(t, true);
            root.keys[0] = key;
            root.n = 1;
        } else {
            if (root.n == 2 * t - 1) {
                // 根节点满，分裂
                BTreeNode newRoot = new BTreeNode(t, false);
                newRoot.children[0] = root;
                splitChild(newRoot, 0);
                insertNonFull(newRoot, key);
                root = newRoot;
            } else {
                insertNonFull(root, key);
            }
        }
    }
    
    private void splitChild(BTreeNode parent, int i) {
        BTreeNode full = parent.children[i];
        BTreeNode newNode = new BTreeNode(full.t, full.isLeaf);
        
        newNode.n = t - 1;
        
        // 复制关键字
        for (int j = 0; j < t - 1; j++) {
            newNode.keys[j] = full.keys[j + t];
        }
        
        // 复制子节点
        if (!full.isLeaf) {
            for (int j = 0; j < t; j++) {
                newNode.children[j] = full.children[j + t];
            }
        }
        
        full.n = t - 1;
        
        // 移动父节点关键字
        for (int j = parent.n; j > i; j--) {
            parent.children[j + 1] = parent.children[j];
        }
        parent.children[i + 1] = newNode;
        
        for (int j = parent.n - 1; j >= i; j--) {
            parent.keys[j + 1] = parent.keys[j];
        }
        parent.keys[i] = full.keys[t - 1];
        parent.n++;
    }
    
    private void insertNonFull(BTreeNode node, int key) {
        int i = node.n - 1;
        
        if (node.isLeaf) {
            while (i >= 0 && key < node.keys[i]) {
                node.keys[i + 1] = node.keys[i];
                i--;
            }
            node.keys[i + 1] = key;
            node.n++;
        } else {
            while (i >= 0 && key < node.keys[i]) {
                i--;
            }
            i++;
            
            if (node.children[i].n == 2 * t - 1) {
                splitChild(node, i);
                if (key > node.keys[i]) {
                    i++;
                }
            }
            insertNonFull(node.children[i], key);
        }
    }
}

// 时间复杂度：查找/插入/删除 O(log n)
// 空间复杂度：O(n)
```

---

## 3. B+ 树

### 3.1 定义

**B+ 树：** B 树的变体，所有数据存储在叶子节点

**特点：**
- ✅ 所有数据在叶子节点，形成链表
- ✅ 范围查询更高效
- ✅ 非叶子节点只存索引
- ❌ 实现更复杂

**应用：** MySQL InnoDB、文件系统

### 3.2 B+ 树 vs B 树

| 特性 | B 树 | B+ 树 |
|------|------|-------|
| 数据存储 | 所有节点 | 仅叶子节点 |
| 范围查询 | O(log n + k) | O(log n + k) |
| 点查询 | O(log n) | O(log n) |
| 叶子节点链接 | ❌ | ✅ |
| 非叶子节点大小 | 大 | 小（存更多索引） |
| 数据库应用 | 少 | 多 |

### 3.3 B+ 树结构

```
        [50]
       /    \
   [20,30]  [70,80,90]
   /  |  \   /  |  |  \
 [10][25][35][60][75][85][95]
  ↑                        ↑
  └────────────────────────┘
        叶子节点链表
```

---

## 4. 数据库索引原理

### 4.1 为什么用 B+ 树

```
1. 减少磁盘 IO
   - 树高度低（通常 3-4 层）
   - 每个节点大小 = 磁盘页大小（16KB）

2. 范围查询高效
   - 叶子节点形成有序链表

3. 稳定性好
   - 自平衡，保证 O(log n)
```

### 4.2 MySQL 索引

```sql
-- 创建索引
CREATE INDEX idx_user_name ON user(name);

-- 联合索引
CREATE INDEX idx_user_name_age ON user(name, age);

-- 最左前缀原则
SELECT * FROM user WHERE name = '张三';           -- ✅ 使用索引
SELECT * FROM user WHERE name = '张三' AND age = 25; -- ✅ 使用索引
SELECT * FROM user WHERE age = 25;                -- ❌ 不使用索引
```

### 4.3 聚簇索引 vs 非聚簇索引

| 特性 | 聚簇索引 | 非聚簇索引 |
|------|----------|------------|
| 数据存储 | 数据与索引在一起 | 索引与数据分离 |
| 数量 | 每张表 1 个 | 可以有多个 |
| 查询速度 | 快 | 需要回表 |
| 应用 | InnoDB 主键 | InnoDB 辅助索引 |

---

## 5. LeetCode 例题

### 5.1 设计跳表

```java
/**
 * LeetCode 1206. 设计跳表
 */
class Skiplist {
    private static final int MAX_LEVEL = 16;
    private static final double P = 0.5;
    
    private class Node {
        int val;
        Node[] next;
        
        Node(int val, int level) {
            this.val = val;
            this.next = new Node[level + 1];
        }
    }
    
    private Node head;
    private int level;
    private Random random;
    
    public Skiplist() {
        this.head = new Node(-1, MAX_LEVEL);
        this.level = 0;
        this.random = new Random();
    }
    
    public boolean search(int target) {
        Node curr = head;
        
        for (int i = level; i >= 0; i--) {
            while (curr.next[i] != null && curr.next[i].val < target) {
                curr = curr.next[i];
            }
        }
        
        curr = curr.next[0];
        return curr != null && curr.val == target;
    }
    
    public void add(int num) {
        int newLevel = randomLevel();
        Node newNode = new Node(num, newLevel);
        Node[] update = new Node[MAX_LEVEL];
        Node curr = head;
        
        for (int i = level; i >= 0; i--) {
            while (curr.next[i] != null && curr.next[i].val < num) {
                curr = curr.next[i];
            }
            update[i] = curr;
        }
        
        for (int i = 0; i <= newLevel; i++) {
            newNode.next[i] = update[i].next[i];
            update[i].next[i] = newNode;
        }
        
        level = Math.max(level, newLevel);
    }
    
    public boolean erase(int num) {
        Node[] update = new Node[MAX_LEVEL];
        Node curr = head;
        
        for (int i = level; i >= 0; i--) {
            while (curr.next[i] != null && curr.next[i].val < num) {
                curr = curr.next[i];
            }
            update[i] = curr;
        }
        
        curr = curr.next[0];
        if (curr == null || curr.val != num) {
            return false;
        }
        
        for (int i = 0; i <= level; i++) {
            if (update[i].next[i] != curr) break;
            update[i].next[i] = curr.next[i];
        }
        
        while (level > 0 && head.next[level] == null) {
            level--;
        }
        
        return true;
    }
    
    private int randomLevel() {
        int level = 0;
        while (random.nextDouble() < P && level < MAX_LEVEL) {
            level++;
        }
        return level;
    }
}
```

---

## 📝 待办事项

- [ ] 理解跳表原理
- [ ] 掌握跳表实现
- [ ] 理解 B 树性质
- [ ] 理解 B+ 树与 B 树区别
- [ ] 理解数据库索引原理
- [ ] 完成 LeetCode 设计跳表
- [ ] 了解聚簇索引与非聚簇索引

---

**下一讲：[排序算法](/data-structure-algorithm/algorithm/sorting)**

---

**推荐资源：**
- 📖 《算法 4》第 3.5 节
- 📖 《数据库系统概念》
- 🔗 Redis 跳表实现
- 🔗 MySQL 索引原理
