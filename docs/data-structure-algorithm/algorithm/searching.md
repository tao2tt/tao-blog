# 查找算法

> 学习日期：2026-03-13  
> 状态：📝 学习中  
> 预计完成：2026-05-29  
> 难度：⭐⭐⭐☆☆  
> 前置知识：[数组与链表](/data-structure-algorithm/basic/array-list)、[排序算法](/data-structure-algorithm/algorithm/sorting)、[树与二叉树](/data-structure-algorithm/advanced/tree)

---

## 📚 目录

[[toc]]

---

## 1. 查找算法概述

### 1.1 什么是查找

**查找（Searching）** 是在一组数据中找到特定元素的算法。

**查找的重要性：**
- ✅ 数据库查询基础
- ✅ 搜索引擎核心
- ✅ 日常编程常用

### 1.2 查找算法分类

| 分类 | 算法 | 时间复杂度 | 适用场景 |
|------|------|-----------|---------|
| **线性查找** | 顺序查找 | O(n) | 无序数据 |
| **二分查找** | 二分查找 | O(log n) | 有序数组 |
| **插值查找** | 插值查找 | O(log log n) | 均匀分布有序数据 |
| **哈希查找** | 哈希表 | O(1) 平均 | 快速查找 |
| **树形查找** | BST/AVL/红黑树 | O(log n) | 动态数据 |
| **分块查找** | 分块查找 | O(√n) | 分块有序数据 |

### 1.3 查找性能对比

```
查找速度对比：

O(1)     哈希表          最快，但有冲突
O(log n)  二分、树形查找   高效，需要有序
O(√n)    分块查找        中等
O(n)     顺序查找        最慢，通用

空间复杂度对比：

O(1)     顺序、二分、插值   原地查找
O(n)     哈希表、树形      需要额外空间
```

---

## 2. 线性查找

### 2.1 顺序查找（Sequential Search）

**思想：** 从头到尾逐个比较。

```python
def sequential_search(arr, target):
    """
    顺序查找
    
    思想：
    1. 从第一个元素开始
    2. 逐个比较
    3. 找到返回索引，未找到返回 -1
    
    时间复杂度：O(n)
    空间复杂度：O(1)
    
    参数:
        arr: 待查找数组（可无序）
        target: 目标值
    
    返回:
        目标值索引，未找到返回 -1
    """
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    
    return -1

# 示例
arr = [5, 3, 8, 4, 2]
print(sequential_search(arr, 4))  # 输出：3
print(sequential_search(arr, 7))  # 输出：-1
```

**顺序查找优化（哨兵）：**

```python
def sequential_search_sentinel(arr, target):
    """
    顺序查找优化版（哨兵）
    
    思想：
    1. 将目标值放在数组末尾（哨兵）
    2. 无需每次检查边界
    3. 找到后检查是否是哨兵
    
    优化点：
    - 减少一次比较操作
    
    时间复杂度：O(n)
    空间复杂度：O(1)
    """
    if not arr:
        return -1
    
    # 保存原末尾值
    last = arr[-1]
    
    # 设置哨兵
    if last == target:
        return len(arr) - 1
    
    arr[-1] = target
    
    # 查找（无需检查边界）
    i = 0
    while arr[i] != target:
        i += 1
    
    # 恢复原值
    arr[-1] = last
    
    # 检查是否找到
    if i < len(arr) - 1:
        return i
    else:
        return -1
```

### 2.2 二分查找（Binary Search）

**思想：** 在有序数组中，每次将查找范围缩小一半。

```python
def binary_search(arr, target):
    """
    二分查找（迭代实现）
    
    思想：
    1. 数组必须有序
    2. 比较中间元素
    3. 缩小查找范围到左半或右半
    4. 重复直到找到或范围为空
    
    时间复杂度：O(log n)
    空间复杂度：O(1)
    
    参数:
        arr: 有序数组
        target: 目标值
    
    返回:
        目标值索引，未找到返回 -1
    """
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        # 计算中间位置（防止溢出）
        mid = left + (right - left) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            # 在右半部分
            left = mid + 1
        else:
            # 在左半部分
            right = mid - 1
    
    return -1

# 示例演示
# 数组：[1, 3, 5, 7, 9, 11, 13, 15]
# 查找：7
# 
# 第 1 轮：left=0, right=7, mid=3, arr[3]=7
# 找到！返回 3

arr = [1, 3, 5, 7, 9, 11,13, 15]
print(binary_search(arr, 7))   # 输出：3
print(binary_search(arr, 8))   # 输出：-1
```

**二分查找递归实现：**

```python
def binary_search_recursive(arr, target, left=0, right=None):
    """
    二分查找（递归实现）
    
    时间复杂度：O(log n)
    空间复杂度：O(log n)（递归栈）
    """
    if right is None:
        right = len(arr) - 1
    
    # 终止条件
    if left > right:
        return -1
    
    mid = left + (right - left) // 2
    
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    else:
        return binary_search_recursive(arr, target, left, mid - 1)

# 示例
arr = [1, 3, 5, 7, 9, 11, 13, 15]
print(binary_search_recursive(arr, 7))  # 输出：3
```

### 2.3 二分查找变体

**查找第一个等于目标值的元素：**

```python
def binary_search_first(arr, target):
    """
    二分查找第一个等于目标值的元素
    
    应用场景：
    - 数组中有重复元素
    - 需要找到第一个匹配的位置
    
    时间复杂度：O(log n)
    """
    left = 0
    right = len(arr) - 1
    result = -1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if arr[mid] == target:
            result = mid  # 记录位置
            right = mid - 1  # 继续在左边查找
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return result

# 示例
arr = [1, 3, 3, 3, 5, 7, 9]
print(binary_search_first(arr, 3))  # 输出：1（第一个 3 的位置）
```

**查找最后一个等于目标值的元素：**

```python
def binary_search_last(arr, target):
    """
    二分查找最后一个等于目标值的元素
    
    时间复杂度：O(log n)
    """
    left = 0
    right = len(arr) - 1
    result = -1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if arr[mid] == target:
            result = mid  # 记录位置
            left = mid + 1  # 继续在右边查找
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return result

# 示例
arr = [1, 3, 3, 3, 5, 7, 9]
print(binary_search_last(arr, 3))  # 输出：3（最后一个 3 的位置）
```

**查找第一个大于等于目标值的元素：**

```python
def binary_search_first_ge(arr, target):
    """
    二分查找第一个大于等于目标值的元素（lower_bound）
    
    应用场景：
    - 查找插入位置
    - 查找下界
    
    时间复杂度：O(log n)
    """
    left = 0
    right = len(arr) - 1
    result = len(arr)  # 默认返回数组长度（所有元素都小于 target）
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if arr[mid] >= target:
            result = mid  # 记录位置
            right = mid - 1  # 继续在左边查找
        else:
            left = mid + 1
    
    return result

# 示例
arr = [1, 3, 5, 7, 9]
print(binary_search_first_ge(arr, 4))  # 输出：2（第一个>=4 的元素是 5）
print(binary_search_first_ge(arr, 6))  # 输出：3（第一个>=6 的元素是 7）
```

**查找最后一个小于等于目标值的元素：**

```python
def binary_search_last_le(arr, target):
    """
    二分查找最后一个小于等于目标值的元素（upper_bound）
    
    时间复杂度：O(log n)
    """
    left = 0
    right = len(arr) - 1
    result = -1  # 默认返回 -1（所有元素都大于 target）
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if arr[mid] <= target:
            result = mid  # 记录位置
            left = mid + 1  # 继续在右边查找
        else:
            right = mid - 1
    
    return result

# 示例
arr = [1, 3, 5, 7, 9]
print(binary_search_last_le(arr, 4))  # 输出：1（最后一个<=4 的元素是 3）
print(binary_search_last_le(arr, 6))  # 输出：2（最后一个<=6 的元素是 5）
```

---

## 3. 插值查找

### 3.1 插值查找原理

**思想：** 在二分查找基础上，根据目标值自适应选择中间位置。

**适用场景：** 数据均匀分布的有序数组。

```python
def interpolation_search(arr, target):
    """
    插值查找
    
    思想：
    1. 根据目标值自适应选择中间位置
    2. 公式：mid = left + (target - arr[left]) * (right - left) / (arr[right] - arr[left])
    3. 类似查字典（不会从中间开始，而是根据目标字母位置）
    
    时间复杂度：
    - 最好：O(log log n)（均匀分布）
    - 平均：O(log log n)
    - 最坏：O(n)（极端不均匀）
    
    空间复杂度：O(1)
    
    参数:
        arr: 有序数组（均匀分布）
        target: 目标值
    
    返回:
        目标值索引，未找到返回 -1
    """
    left = 0
    right = len(arr) - 1
    
    while left <= right and arr[left] <= target <= arr[right]:
        # 避免除以 0
        if arr[left] == arr[right]:
            if arr[left] == target:
                return left
            break
        
        # 插值公式计算中间位置
        mid = left + (target - arr[left]) * (right - left) // (arr[right] - arr[left])
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# 示例演示
# 数组：[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
# 查找：9
# 
# 二分查找：mid = 0 + (9-0)//2 = 4，arr[4]=5
# 插值查找：mid = 0 + (9-1)*(9-0)/(10-1) = 8，arr[8]=9
# 插值查找一次就找到！

arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
print(interpolation_search(arr, 9))  # 输出：8
print(interpolation_search(arr, 1))  # 输出：0
```

### 3.2 插值查找 vs 二分查找

| 对比项 | 二分查找 | 插值查找 |
|--------|---------|---------|
| **中间位置** | 固定中点 | 自适应计算 |
| **时间复杂度** | O(log n) | O(log log n)（均匀分布） |
| **适用场景** | 任何有序数组 | 均匀分布有序数组 |
| **稳定性** | 稳定 | 数据分布影响大 |

---

## 4. 哈希查找

### 4.1 哈希表基础

**哈希表（Hash Table）** 是通过哈希函数将键映射到数组索引的数据结构。

**核心概念：**

| 概念 | 说明 |
|------|------|
| **哈希函数** | 将键转换为数组索引 |
| **哈希冲突** | 不同键映射到同一索引 |
| **负载因子** | 元素数/桶数，衡量填充程度 |

### 4.2 哈希函数设计

```python
class HashTable:
    """哈希表实现"""
    
    def __init__(self, size=16):
        """
        初始化哈希表
        
        参数:
            size: 初始大小（质数更好）
        """
        self.size = size
        self.buckets = [[] for _ in range(size)]  # 链地址法
        self.count = 0
    
    def _hash(self, key):
        """
        哈希函数
        
        常用哈希函数：
        1. 除留余数法：key % size
        2. 乘法哈希：(key * A) % 1
        3. 通用哈希：hash(key) % size
        
        参数:
            key: 键
        
        返回:
            数组索引
        """
        # Python 内置 hash 函数
        return hash(key) % self.size
    
    def _rehash(self, old_hash):
        """
        再哈希函数（处理冲突）
        
        线性探测法：(old_hash + 1) % size
        """
        return (old_hash + 1) % self.size
```

### 4.3 冲突解决方法

**方法 1：链地址法（Separate Chaining）**

```python
class HashTableChaining:
    """哈希表（链地址法）"""
    
    def __init__(self, size=16):
        self.size = size
        self.buckets = [[] for _ in range(size)]
        self.count = 0
    
    def _hash(self, key):
        return hash(key) % self.size
    
    def put(self, key, value):
        """
        插入键值对
        
        时间复杂度：O(1) 平均，O(n) 最坏
        """
        idx = self._hash(key)
        
        # 检查是否已存在
        for i, (k, v) in enumerate(self.buckets[idx]):
            if k == key:
                self.buckets[idx][i] = (key, value)  # 更新
                return
        
        # 插入新键值对
        self.buckets[idx].append((key, value))
        self.count += 1
        
        # 负载因子过大时扩容
        if self.count / self.size > 0.75:
            self._resize()
    
    def get(self, key):
        """
        查找键
        
        时间复杂度：O(1) 平均，O(n) 最坏
        """
        idx = self._hash(key)
        
        for k, v in self.buckets[idx]:
            if k == key:
                return v
        
        raise KeyError(key)
    
    def delete(self, key):
        """删除键"""
        idx = self._hash(key)
        
        for i, (k, v) in enumerate(self.buckets[idx]):
            if k == key:
                del self.buckets[idx][i]
                self.count -= 1
                return
        
        raise KeyError(key)
    
    def _resize(self):
        """扩容"""
        old_buckets = self.buckets
        self.size *= 2
        self.buckets = [[] for _ in range(self.size)]
        self.count = 0
        
        for bucket in old_buckets:
            for key, value in bucket:
                self.put(key, value)
    
    def __getitem__(self, key):
        return self.get(key)
    
    def __setitem__(self, key, value):
        self.put(key, value)
    
    def __contains__(self, key):
        """支持 in 操作符"""
        idx = self._hash(key)
        for k, v in self.buckets[idx]:
            if k == key:
                return True
        return False

# 示例
ht = HashTableChaining()
ht["name"] = "张三"
ht["age"] = 25
ht["city"] = "北京"

print(ht["name"])  # 输出：张三
print("age" in ht)  # 输出：True
```

**方法 2：开放地址法（Open Addressing）**

```python
class HashTableOpenAddressing:
    """哈希表（开放地址法 - 线性探测）"""
    
    def __init__(self, size=16):
        self.size = size
        self.keys = [None] * size
        self.values = [None] * size
        self.count = 0
    
    def _hash(self, key):
        return hash(key) % self.size
    
    def _rehash(self, old_hash):
        """线性探测"""
        return (old_hash + 1) % self.size
    
    def put(self, key, value):
        """
        插入键值对
        
        时间复杂度：O(1) 平均，O(n) 最坏
        """
        idx = self._hash(key)
        
        # 线性探测找到空位或已存在的键
        while self.keys[idx] is not None:
            if self.keys[idx] == key:
                self.values[idx] = value  # 更新
                return
            idx = self._rehash(idx)
        
        # 插入
        self.keys[idx] = key
        self.values[idx] = value
        self.count += 1
        
        # 负载因子过大时扩容
        if self.count / self.size > 0.75:
            self._resize()
    
    def get(self, key):
        """
        查找键
        
        时间复杂度：O(1) 平均，O(n) 最坏
        """
        idx = self._hash(key)
        start_idx = idx
        
        while self.keys[idx] is not None:
            if self.keys[idx] == key:
                return self.values[idx]
            idx = self._rehash(idx)
            
            # 回到起点，未找到
            if idx == start_idx:
                break
        
        raise KeyError(key)
    
    def _resize(self):
        """扩容"""
        old_keys = self.keys
        old_values = self.values
        self.size *= 2
        self.keys = [None] * self.size
        self.values = [None] * self.size
        self.count = 0
        
        for key, value in zip(old_keys, old_values):
            if key is not None:
                self.put(key, value)
```

### 4.4 哈希查找复杂度

| 操作 | 平均时间复杂度 | 最坏时间复杂度 |
|------|--------------|--------------|
| **查找** | O(1) | O(n) |
| **插入** | O(1) | O(n) |
| **删除** | O(1) | O(n) |

**最坏情况：** 所有键都哈希到同一位置（退化为链表）

---

## 5. 树形查找

### 5.1 二叉搜索树查找

```python
class BSTNode:
    """二叉搜索树节点"""
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BinarySearchTree:
    """二叉搜索树"""
    
    def __init__(self):
        self.root = None
    
    def search(self, target):
        """
        查找目标值
        
        思想：
        1. 从根节点开始
        2. 目标值 < 当前值，向左
        3. 目标值 > 当前值，向右
        4. 相等则找到
        
        时间复杂度：
        - 最好：O(log n)
        - 平均：O(log n)
        - 最坏：O(n)（退化为链表）
        
        参数:
            target: 目标值
        
        返回:
            找到的节点，未找到返回 None
        """
        return self._search_recursive(self.root, target)
    
    def _search_recursive(self, node, target):
        """递归查找"""
        if node is None:
            return None
        
        if target == node.value:
            return node
        elif target < node.value:
            return self._search_recursive(node.left, target)
        else:
            return self._search_recursive(node.right, target)
    
    def search_iterative(self, target):
        """迭代查找"""
        current = self.root
        
        while current:
            if target == current.value:
                return current
            elif target < current.value:
                current = current.left
            else:
                current = current.right
        
        return None
    
    def insert(self, value):
        """插入值"""
        self.root = self._insert_recursive(self.root, value)
    
    def _insert_recursive(self, node, value):
        if node is None:
            return BSTNode(value)
        
        if value < node.value:
            node.left = self._insert_recursive(node.left, value)
        else:
            node.right = self._insert_recursive(node.right, value)
        
        return node

# 示例
bst = BinarySearchTree()
for val in [8, 3, 10, 1, 6, 14, 4, 7, 13]:
    bst.insert(val)

#       8
#      / \
#     3   10
#    / \    \
#   1   6    14
#      / \   /
#     4   7 13

result = bst.search(6)
print(result.value if result else "未找到")  # 输出：6

result = bst.search(5)
print(result if result else "未找到")  # 输出：未找到
```

### 5.2 平衡二叉树查找（AVL 树）

**AVL 树** 通过旋转保持平衡，确保查找时间复杂度为 O(log n)。

```python
class AVLNode:
    """AVL 树节点"""
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        self.height = 1

class AVLTree:
    """AVL 树（平衡二叉搜索树）"""
    
    def __init__(self):
        self.root = None
    
    def _get_height(self, node):
        """获取节点高度"""
        if node is None:
            return 0
        return node.height
    
    def _get_balance(self, node):
        """获取平衡因子"""
        if node is None:
            return 0
        return self._get_height(node.left) - self._get_height(node.right)
    
    def _update_height(self, node):
        """更新节点高度"""
        node.height = 1 + max(self._get_height(node.left), self._get_height(node.right))
    
    def _rotate_right(self, y):
        """右旋（LL 情况）"""
        x = y.left
        T2 = x.right
        
        # 旋转
        x.right = y
        y.left = T2
        
        # 更新高度
        self._update_height(y)
        self._update_height(x)
        
        return x
    
    def _rotate_left(self, x):
        """左旋（RR 情况）"""
        y = x.right
        T1 = y.left
        
        # 旋转
        y.left = x
        x.right = T1
        
        # 更新高度
        self._update_height(x)
        self._update_height(y)
        
        return y
    
    def insert(self, value):
        """插入值（自动平衡）"""
        self.root = self._insert_recursive(self.root, value)
    
    def _insert_recursive(self, node, value):
        # 标准 BST 插入
        if node is None:
            return AVLNode(value)
        
        if value < node.value:
            node.left = self._insert_recursive(node.left, value)
        else:
            node.right = self._insert_recursive(node.right, value)
        
        # 更新高度
        self._update_height(node)
        
        # 检查平衡
        balance = self._get_balance(node)
        
        # LL 情况
        if balance > 1 and value < node.left.value:
            return self._rotate_right(node)
        
        # RR 情况
        if balance < -1 and value > node.right.value:
            return self._rotate_left(node)
        
        # LR 情况
        if balance > 1 and value > node.left.value:
            node.left = self._rotate_left(node.left)
            return self._rotate_right(node)
        
        # RL 情况
        if balance < -1 and value < node.right.value:
            node.right = self._rotate_right(node.right)
            return self._rotate_left(node)
        
        return node
    
    def search(self, target):
        """
        查找目标值
        
        时间复杂度：O(log n)（保证平衡）
        """
        return self._search_recursive(self.root, target)
    
    def _search_recursive(self, node, target):
        if node is None:
            return None
        
        if target == node.value:
            return node
        elif target < node.value:
            return self._search_recursive(node.left, target)
        else:
            return self._search_recursive(node.right, target)

# 示例
avl = AVLTree()
for val in [10, 20, 30, 40, 50, 25]:
    avl.insert(val)

# AVL 树会自动平衡，保持 O(log n) 查找
result = avl.search(25)
print(result.value if result else "未找到")  # 输出：25
```

### 5.3 红黑树查找

**红黑树** 是另一种自平衡二叉搜索树，Java 的 TreeMap、HashMap 都使用红黑树。

**红黑树性质：**
1. 每个节点是红色或黑色
2. 根节点是黑色
3. 叶子节点（NIL）是黑色
4. 红色节点的子节点必须是黑色
5. 从任一节点到叶子的所有路径包含相同数量的黑色节点

**查找时间复杂度：** O(log n)

---

## 6. 分块查找

### 6.1 分块查找原理

**思想：** 将数据分成若干块，块内无序，块间有序。

```python
def block_search(arr, block_size, target):
    """
    分块查找
    
    思想：
    1. 将数组分成若干块
    2. 块内无序，块间有序（每块的最大值递增）
    3. 先在块索引中二分查找
    4. 再在块内顺序查找
    
    时间复杂度：O(√n)
    空间复杂度：O(n/block_size)
    
    参数:
        arr: 待查找数组
        block_size: 块大小
        target: 目标值
    
    返回:
        目标值索引，未找到返回 -1
    """
    n = len(arr)
    
    # 构建块索引（每块的最大值）
    block_index = []
    for i in range(0, n, block_size):
        block_max = max(arr[i:min(i + block_size, n)])
        block_index.append((block_max, i))
    
    # 在块索引中二分查找
    block_idx = -1
    left, right = 0, len(block_index) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if block_index[mid][0] >= target:
            block_idx = mid
            right = mid - 1
        else:
            left = mid + 1
    
    if block_idx == -1:
        return -1
    
    # 在块内顺序查找
    start = block_index[block_idx][1]
    end = min(start + block_size, n)
    
    for i in range(start, end):
        if arr[i] == target:
            return i
    
    return -1

# 示例
# 数组分块：[8, 3, 5] | [9, 1, 4] | [12, 6, 2]
# 块索引：[8, 9, 12]
arr = [8, 3, 5, 9, 1, 4, 12, 6, 2]
print(block_search(arr, 3, 4))  # 输出：5
print(block_search(arr, 3, 7))  # 输出：-1
```

---

## 7. 查找算法对比

### 7.1 复杂度对比表

| 算法 | 最好 | 平均 | 最坏 | 空间 | 要求 |
|------|------|------|------|------|------|
| **顺序查找** | O(1) | O(n) | O(n) | O(1) | 无 |
| **二分查找** | O(1) | O(log n) | O(log n) | O(1) | 有序 |
| **插值查找** | O(1) | O(log log n) | O(n) | O(1) | 有序、均匀 |
| **哈希查找** | O(1) | O(1) | O(n) | O(n) | 哈希函数 |
| **BST 查找** | O(log n) | O(log n) | O(n) | O(n) | BST |
| **AVL 查找** | O(log n) | O(log n) | O(log n) | O(n) | AVL 树 |
| **分块查找** | O(1) | O(√n) | O(√n) | O(√n) | 分块有序 |

### 7.2 选择指南

```
如何选择查找算法？

1. 数据无序，查找次数少
   → 顺序查找（简单）

2. 数据有序，静态数据
   → 二分查找（高效）

3. 数据有序，均匀分布
   → 插值查找（更快）

4. 频繁查找，频繁插入删除
   → 哈希表（O(1) 平均）

5. 需要有序遍历
   → 二叉搜索树/AVL 树

6. 数据分块有序
   → 分块查找
```

---

## 8. 实战案例

### 8.1 搜索旋转排序数组

```python
def search_rotated_array(nums, target):
    """
    搜索旋转排序数组
    
    LeetCode 33. 搜索旋转排序数组
    
    题目：
    有序数组在某个点旋转，查找目标值
    
    思路：
    1. 修改二分查找
    2. 判断哪一半是有序的
    3. 在有序的一半中查找
    
    时间复杂度：O(log n)
    """
    left = 0
    right = len(nums) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if nums[mid] == target:
            return mid
        
        # 判断左半部分是否有序
        if nums[left] <= nums[mid]:
            # 左半部分有序
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            # 右半部分有序
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    
    return -1

# 示例
nums = [4, 5, 6, 7, 0, 1, 2]
print(search_rotated_array(nums, 0))  # 输出：4
print(search_rotated_array(nums, 3))  # 输出：-1
```

### 8.2 查找第一个和最后一个位置

```python
def search_range(nums, target):
    """
    查找第一个和最后一个位置
    
    LeetCode 34. 在排序数组中查找元素的第一个和最后一个位置
    
    思路：
    1. 两次二分查找
    2. 第一次找第一个位置
    3. 第二次找最后一个位置
    
    时间复杂度：O(log n)
    """
    def find_first():
        left, right = 0, len(nums) - 1
        result = -1
        
        while left <= right:
            mid = left + (right - left) // 2
            
            if nums[mid] == target:
                result = mid
                right = mid - 1  # 继续在左边找
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        
        return result
    
    def find_last():
        left, right = 0, len(nums) - 1
        result = -1
        
        while left <= right:
            mid = left + (right - left) // 2
            
            if nums[mid] == target:
                result = mid
                left = mid + 1  # 继续在右边找
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        
        return result
    
    if not nums:
        return [-1, -1]
    
    return [find_first(), find_last()]

# 示例
nums = [5, 7, 7, 8, 8, 10]
print(search_range(nums, 8))  # 输出：[3, 4]
print(search_range(nums, 6))  # 输出：[-1, -1]
```

### 8.3 设计哈希集合

```python
class MyHashSet:
    """
    设计哈希集合
    
    LeetCode 705. 设计哈希集合
    
    实现功能：
    - add(key): 添加
    - remove(key): 删除
    - contains(key): 查找
    """
    
    def __init__(self):
        self.size = 1000
        self.buckets = [[] for _ in range(self.size)]
    
    def _hash(self, key):
        return key % self.size
    
    def add(self, key):
        """添加元素"""
        idx = self._hash(key)
        
        if key not in self.buckets[idx]:
            self.buckets[idx].append(key)
    
    def remove(self, key):
        """删除元素"""
        idx = self._hash(key)
        
        if key in self.buckets[idx]:
            self.buckets[idx].remove(key)
    
    def contains(self, key):
        """查找元素"""
        idx = self._hash(key)
        return key in self.buckets[idx]

# 示例
hs = MyHashSet()
hs.add(1)
hs.add(2)
print(hs.contains(1))  # True
print(hs.contains(3))  # False
hs.remove(1)
print(hs.contains(1))  # False
```

---

## 📝 练习题

### 基础题

1. **顺序查找**：实现顺序查找（带哨兵优化）

2. **二分查找**：实现二分查找（递归 + 迭代）

3. **哈希表**：实现简单的哈希表（链地址法）

### 进阶题

4. **二分查找变体**：实现查找第一个/最后一个等于目标值的元素

5. **旋转数组查找**：在旋转排序数组中查找目标值

6. **查找范围**：查找目标值的第一个和最后一个位置

### 挑战题

7. **Median of Two Sorted Arrays**：在两个有序数组中查找中位数

8. **First Missing Positive**：查找第一个缺失的正整数

9. **Word Search II**：在二维字符网格中查找多个单词

---

## 🔗 参考资料

### 经典书籍
- 📚 《算法导论》第 11 章：哈希表
- 📚 《数据结构与算法分析》第 4 章：查找
- 📚 《剑指 Offer》查找相关题目

### 在线资源
- 🔗 [VisuAlgo 查找可视化](https://visualgo.net/en/bst)
- 🔗 [LeetCode 查找专题](https://leetcode.com/tag/binary-search/)
- 🔗 [GeeksforGeeks 查找教程](https://www.geeksforgeeks.org/searching-algorithms/)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 二分查找 | ⭐⭐⭐⭐⭐ | 熟练手写所有变体 |
| 哈希查找 | ⭐⭐⭐⭐⭐ | 理解原理和实现 |
| 树形查找 | ⭐⭐⭐⭐ | 理解 BST/AVL |
| 插值查找 | ⭐⭐⭐ | 了解适用场景 |
| 分块查找 | ⭐⭐⭐ | 了解原理 |

---

**上一章：** [排序算法](/data-structure-algorithm/algorithm/sorting)  
**下一章：** [递归与分治](/data-structure-algorithm/algorithm/recursion)

**最后更新**：2026-03-13
