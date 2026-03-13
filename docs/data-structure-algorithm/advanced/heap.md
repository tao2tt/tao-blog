# 堆与优先队列

> 学习日期：2026-03-13  
> 状态：📝 学习中  
> 预计完成：2026-05-22  
> 难度：⭐⭐⭐⭐☆  
> 前置知识：[树与二叉树](/data-structure-algorithm/advanced/tree)、[数组与链表](/data-structure-algorithm/basic/array-list)

---

## 📚 目录

[[toc]]

---

## 1. 堆的基本概念

### 1.1 什么是堆

**堆（Heap）** 是一种特殊的**完全二叉树**，满足**堆序性**：

- **大顶堆（Max Heap）**：每个节点 ≥ 其子节点
- **小顶堆（Min Heap）**：每个节点 ≤ 其子节点

**大顶堆示例：**
```
       50
      /  \
     45   40
    / \   /
   30 35 25
  / \
 10 20

特点：根节点最大，每个子树也是堆
```

**小顶堆示例：**
```
       10
      /  \
     20   25
    / \   /
   30 35 40
  / \
 45 50

特点：根节点最小，每个子树也是堆
```

### 1.2 堆的性质

| 性质 | 说明 |
|------|------|
| **结构特性** | 必须是完全二叉树 |
| **堆序特性** | 父节点 ≥（或≤）子节点 |
| **根节点** | 大顶堆根最大，小顶堆根最小 |
| **数组表示** | 可以用数组紧凑存储 |

### 1.3 堆的数组表示

**完全二叉树可以用数组紧凑存储：**

```python
# 索引关系（0-based）：
# - 父节点索引：(i - 1) // 2
# - 左子节点索引：2 * i + 1
# - 右子节点索引：2 * i + 2

# 示例：大顶堆
#       50(0)
#      /    \
#   45(1)   40(2)
#   /  \     /
# 30(3) 35(4) 25(5)

heap = [50, 45, 40, 30, 35, 25]

# 验证索引关系
i = 1  # 节点 45
parent = (1 - 1) // 2  # 0 → 50 ✓
left = 2 * 1 + 1  # 3 → 30 ✓
right = 2 * 1 + 2  # 4 → 35 ✓
```

**索引关系图：**
```
索引：0  1  2  3  4  5  6  7  8
值：  50 45 40 30 35 25 20 15 10

节点 1（45）的父节点：(1-1)//2 = 0 → 50
节点 1（45）的左子：2*1+1 = 3 → 30
节点 1（45）的右子：2*1+2 = 4 → 35
```

---

## 2. 堆的基本操作

### 2.1 堆的节点定义

```python
class MaxHeap:
    """大顶堆实现"""
    
    def __init__(self):
        """初始化空堆"""
        self.heap = []  # 用数组存储堆
    
    def parent(self, i):
        """返回父节点索引"""
        return (i - 1) // 2
    
    def left_child(self, i):
        """返回左子节点索引"""
        return 2 * i + 1
    
    def right_child(self, i):
        """返回右子节点索引"""
        return 2 * i + 2
    
    def size(self):
        """返回堆大小"""
        return len(self.heap)
```

### 2.2 插入操作（上浮）

```python
class MaxHeap:
    def insert(self, value):
        """
        向堆中插入元素
        
        步骤：
        1. 将元素添加到数组末尾
        2. 执行"上浮"操作，调整堆
        
        时间复杂度：O(log n)
        
        参数:
            value: 要插入的值
        """
        # 1. 添加到末尾
        self.heap.append(value)
        
        # 2. 上浮调整
        self._heapify_up(len(self.heap) - 1)
    
    def _heapify_up(self, i):
        """
        上浮操作（从下往上调整）
        
        思路：
        1. 与父节点比较
        2. 如果比父节点大，交换
        3. 继续向上，直到满足堆性质
        
        参数:
            i: 当前节点索引
        """
        # 当不是根节点时继续
        while i > 0:
            parent_idx = self.parent(i)
            
            # 如果当前节点比父节点大，交换
            if self.heap[i] > self.heap[parent_idx]:
                # 交换
                self.heap[i], self.heap[parent_idx] = \
                    self.heap[parent_idx], self.heap[i]
                
                # 继续向上
                i = parent_idx
            else:
                # 已经满足堆性质，结束
                break
    
    # 示例演示
    # 插入过程：[50, 45, 40] 插入 48
    # 
    # 初始：
    #       50
    #      /  \
    #    45    40
    #
    # 添加 48 到末尾：
    #       50
    #      /  \
    #    45    40
    #   /
    #  48
    #
    # 48 > 45，交换：
    #       50
    #      /  \
    #    48    40
    #   /
    #  45
    #
    # 48 < 50，停止
```

### 2.3 删除堆顶（下沉）

```python
class MaxHeap:
    def extract_max(self):
        """
        删除并返回堆顶元素（最大值）
        
        步骤：
        1. 保存堆顶元素
        2. 将末尾元素移到堆顶
        3. 删除末尾
        4. 执行"下沉"操作，调整堆
        
        时间复杂度：O(log n)
        
        返回:
            堆顶元素，堆空返回 None
        """
        # 堆空
        if not self.heap:
            return None
        
        # 1. 保存堆顶
        max_value = self.heap[0]
        
        # 2. 末尾移到堆顶
        self.heap[0] = self.heap[-1]
        
        # 3. 删除末尾
        self.heap.pop()
        
        # 4. 下沉调整
        if self.heap:  # 堆不为空才调整
            self._heapify_down(0)
        
        return max_value
    
    def _heapify_down(self, i):
        """
        下沉操作（从上往下调整）
        
        思路：
        1. 与较大的子节点比较
        2. 如果比子节点小，交换
        3. 继续向下，直到满足堆性质
        
        参数:
            i: 当前节点索引
        """
        n = len(self.heap)
        
        while True:
            largest = i  # 假设当前节点最大
            left = self.left_child(i)
            right = self.right_child(i)
            
            # 与左子节点比较
            if left < n and self.heap[left] > self.heap[largest]:
                largest = left
            
            # 与右子节点比较
            if right < n and self.heap[right] > self.heap[largest]:
                largest = right
            
            # 如果当前节点已经是最大的，结束
            if largest == i:
                break
            
            # 交换当前节点与较大的子节点
            self.heap[i], self.heap[largest] = \
                self.heap[largest], self.heap[i]
            
            # 继续向下
            i = largest
    
    # 示例演示
    # 删除堆顶：[50, 45, 40, 30, 35]
    # 
    # 初始：
    #       50
    #      /  \
    #    45    40
    #   / \
    #  30  35
    #
    # 末尾 35 移到堆顶：
    #       35
    #      /  \
    #    45    40
    #   / 
    #  30
    #
    # 35 < 45，交换：
    #       45
    #      /  \
    #    35    40
    #   / 
    #  30
    #
    # 35 > 30，停止
```

### 2.4 获取堆顶

```python
class MaxHeap:
    def peek(self):
        """
        查看堆顶元素（不删除）
        
        时间复杂度：O(1)
        
        返回:
            堆顶元素，堆空返回 None
        """
        return self.heap[0] if self.heap else None
```

---

## 3. 堆的构建

### 3.1 逐个插入法

```python
def build_heap_insert(arr):
    """
    构建堆（逐个插入法）
    
    思路：
    1. 创建空堆
    2. 逐个插入元素
    
    时间复杂度：O(n log n)
    
    参数:
        arr: 输入数组
    
    返回:
        构建好的堆
    """
    heap = MaxHeap()
    
    for value in arr:
        heap.insert(value)
    
    return heap.heap

# 示例
arr = [3, 1, 4, 1, 5, 9, 2, 6]
heap = build_heap_insert(arr)
print(heap)  # 大顶堆
```

### 3.2 原地建堆法（推荐）

```python
def build_heap_inplace(arr):
    """
    构建堆（原地建堆法）
    
    思路：
    1. 从最后一个非叶子节点开始
    2. 向前遍历，对每个节点执行下沉操作
    3. 最后一个非叶子节点索引：(n - 2) // 2
    
    时间复杂度：O(n)  ← 比逐个插入快！
    
    参数:
        arr: 输入数组
    
    返回:
        原地修改后的数组（已满足堆性质）
    """
    n = len(arr)
    
    # 从最后一个非叶子节点开始
    # 叶子节点不需要调整
    for i in range((n - 2) // 2, -1, -1):
        _heapify_down(arr, i, n)
    
    return arr

def _heapify_down(arr, i, n):
    """
    数组下沉操作
    
    参数:
        arr: 数组
        i: 当前节点索引
        n: 数组长度
    """
    while True:
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2
        
        # 与左子节点比较
        if left < n and arr[left] > arr[largest]:
            largest = left
        
        # 与右子节点比较
        if right < n and arr[right] > arr[largest]:
            largest = right
        
        # 如果当前节点最大，结束
        if largest == i:
            break
        
        # 交换
        arr[i], arr[largest] = arr[largest], arr[i]
        i = largest

# 示例演示
# 数组：[3, 1, 4, 1, 5, 9, 2, 6]
# 
# 最后一个非叶子节点索引：(8-2)//2 = 3
# 
# i=3（值为 1）：
#       3
#      / \
#     1   4
#    / \ / \
#   1  5 9  2
#  /
# 6
# 
# 调整节点 3（值 1）：
# 1 < 6，交换
# 
# i=2（值为 4）：
# 4 < 9，交换
# 
# i=1（值为 1）：
# 1 < 6，交换
# 1 < 5，交换
# 
# i=0（值为 3）：
# 3 < 9，交换
# 3 < 6，交换
# 
# 最终大顶堆：
#       9
#      / \
#     6   4
#    / \ / \
#   1  5 3  2
#  /
# 1
```

### 3.3 两种方法对比

| 方法 | 时间复杂度 | 空间复杂度 | 适用场景 |
|------|-----------|-----------|---------|
| **逐个插入** | O(n log n) | O(1) | 动态插入 |
| **原地建堆** | O(n) | O(1) | 批量构建 |

---

## 4. 堆排序

### 4.1 堆排序原理

**堆排序（Heap Sort）** 是利用堆的性质进行排序的算法。

**步骤：**
1. 构建大顶堆
2. 交换堆顶与末尾元素
3. 堆大小减 1，执行下沉
4. 重复步骤 2-3，直到堆大小为 1

### 4.2 堆排序实现

```python
def heap_sort(arr):
    """
    堆排序（升序）
    
    思路：
    1. 构建大顶堆
    2. 依次将堆顶（最大值）与末尾交换
    3. 调整剩余元素为堆
    
    时间复杂度：O(n log n)
    空间复杂度：O(1)
    稳定性：不稳定
    
    参数:
        arr: 待排序数组
    
    返回:
        排序后的数组
    """
    n = len(arr)
    
    # 1. 构建大顶堆
    for i in range((n - 2) // 2, -1, -1):
        _heapify_down(arr, i, n)
    
    # 2. 依次取出堆顶
    for i in range(n - 1, 0, -1):
        # 交换堆顶与末尾
        arr[0], arr[i] = arr[i], arr[0]
        
        # 调整剩余元素
        _heapify_down(arr, 0, i)
    
    return arr

# 示例演示
# 数组：[4, 1, 7, 3, 8, 2, 9]
# 
# 构建大顶堆：
#       9
#      / \
#     8   7
#    / \ / \
#   3  1 2  4
# 
# 第 1 轮：9 与 4 交换
#       4
#      / \
#     8   7
#    / \ / \
#   3  1 2  9
# 
# 调整堆（排除 9）：
#       8
#      / \
#     4   7
#    / \ /
#   3  1 2
# 
# 第 2 轮：8 与 2 交换
#       2
#      / \
#     4   7
#    / \ / \
#   3  1 8  9
# 
# ... 继续
# 
# 最终结果：[1, 2, 3, 4, 7, 8, 9]
```

### 4.3 堆排序复杂度

| 指标 | 值 | 说明 |
|------|-----|------|
| **最好情况** | O(n log n) | 已经是堆 |
| **最坏情况** | O(n log n) | 完全逆序 |
| **平均情况** | O(n log n) | - |
| **空间复杂度** | O(1) | 原地排序 |
| **稳定性** | 不稳定 | 交换可能改变相对顺序 |

---

## 5. 优先队列

### 5.1 什么是优先队列

**优先队列（Priority Queue）** 是一种特殊的队列，元素出队顺序由**优先级**决定，而不是入队顺序。

**与普通队列对比：**

| 队列类型 | 出队规则 | 应用场景 |
|---------|---------|---------|
| **普通队列** | 先进先出（FIFO） | 排队、消息队列 |
| **优先队列** | 优先级高的先出 | 任务调度、Dijkstra 算法 |

### 5.2 优先队列的实现

```python
import heapq

class PriorityQueue:
    """优先队列（小顶堆实现）"""
    
    def __init__(self):
        """初始化空队列"""
        self.heap = []
        self.counter = 0  # 用于处理优先级相同的情况
    
    def push(self, item, priority):
        """
        入队
        
        参数:
            item: 元素
            priority: 优先级（数字越小优先级越高）
        """
        # 使用元组 (priority, counter, item)
        # counter 用于优先级相同时保持 FIFO
        entry = (priority, self.counter, item)
        heapq.heappush(self.heap, entry)
        self.counter += 1
    
    def pop(self):
        """
        出队（优先级最高的元素）
        
        返回:
            元素，队列空返回 None
        """
        if self.heap:
            priority, counter, item = heapq.heappop(self.heap)
            return item
        return None
    
    def peek(self):
        """
        查看队首元素（不出队）
        
        返回:
            队首元素，队列空返回 None
        """
        if self.heap:
            return self.heap[0][2]
        return None
    
    def is_empty(self):
        """判断队列是否为空"""
        return len(self.heap) == 0
    
    def size(self):
        """返回队列大小"""
        return len(self.heap)

# 使用示例
pq = PriorityQueue()

# 入队（优先级，任务）
pq.push("任务 C", 3)  # 优先级 3
pq.push("任务 A", 1)  # 优先级 1（最高）
pq.push("任务 B", 2)  # 优先级 2

# 出队（按优先级）
print(pq.pop())  # 任务 A（优先级 1）
print(pq.pop())  # 任务 B（优先级 2）
print(pq.pop())  # 任务 C（优先级 3）
```

### 5.3 Python heapq 模块

```python
import heapq

# 小顶堆操作
heap = []

# 入堆
heapq.heappush(heap, 3)
heapq.heappush(heap, 1)
heapq.heappush(heap, 2)

# 出堆（最小值）
min_val = heapq.heappop(heap)  # 1

# 查看堆顶
min_val = heap[0]  # 2

# 堆化现有列表
arr = [5, 3, 8, 1, 2]
heapq.heapify(arr)  # 原地转换为堆

# 弹出最小的 n 个元素
top_n = heapq.nsmallest(3, arr)  # [1, 2, 3]

# 弹出最大的 n 个元素
top_n = heapq.nlargest(3, arr)  # [8, 5, 3]

# 大顶堆技巧：取负数
max_heap = []
heapq.heappush(max_heap, -5)
heapq.heappush(max_heap, -3)
heapq.heappush(max_heap, -8)
max_val = -heapq.heappop(max_heap)  # 8
```

---

## 6. 实战案例

### 6.1 Top K 问题

```python
import heapq

def top_k_largest(arr, k):
    """
    找出数组中最大的 K 个元素
    
    思路：
    1. 维护一个大小为 K 的小顶堆
    2. 遍历数组，比堆顶大的元素入堆
    3. 堆大小超过 K 时，弹出堆顶
    
    时间复杂度：O(n log k)
    空间复杂度：O(k)
    
    参数:
        arr: 输入数组
        k: 需要找的元素个数
    
    返回:
        最大的 K 个元素
    """
    if k <= 0 or k > len(arr):
        return []
    
    # 创建大小为 K 的小顶堆
    heap = arr[:k]
    heapq.heapify(heap)
    
    # 遍历剩余元素
    for i in range(k, len(arr)):
        # 比堆顶大，入堆
        if arr[i] > heap[0]:
            heapq.heapreplace(heap, arr[i])
    
    return heap

# 示例
arr = [3, 2, 1, 5, 6, 4]
k = 2
result = top_k_largest(arr, k)
print(result)  # [5, 6] 或 [6, 5]

# 使用内置函数（更简单）
result = heapq.nlargest(k, arr)  # [6, 5]
```

### 6.2 合并 K 个有序链表

```python
import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def merge_k_lists(lists):
    """
    合并 K 个有序链表
    
    思路：
    1. 使用小顶堆存储每个链表的头节点
    2. 每次取出最小节点
    3. 将该节点的下一个节点入堆
    
    时间复杂度：O(n log k)，n 为总节点数，k 为链表数
    空间复杂度：O(k)
    
    参数:
        lists: K 个有序链表的头节点列表
    
    返回:
        合并后的链表头节点
    """
    if not lists:
        return None
    
    # 创建小顶堆
    heap = []
    
    # 将每个链表的头节点入堆
    for i, node in enumerate(lists):
        if node:
            # (值，索引，节点)
            # 索引用于值相同时比较
            heapq.heappush(heap, (node.val, i, node))
    
    #  dummy 节点
    dummy = ListNode(0)
    current = dummy
    
    while heap:
        # 取出最小节点
        val, idx, node = heapq.heappop(heap)
        
        # 连接到结果链表
        current.next = node
        current = current.next
        
        # 该节点的下一个节点入堆
        if node.next:
            heapq.heappush(heap, (node.next.val, idx, node.next))
    
    return dummy.next

# 示例
# 链表 1: 1 -> 4 -> 5
# 链表 2: 1 -> 3 -> 4
# 链表 3: 2 -> 6
# 
# 合并后：1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5 -> 6
```

### 6.3 数据流中位数

```python
import heapq

class MedianFinder:
    """
    数据流中位数查找器
    
    思路：
    1. 使用两个堆
       - 大顶堆：存储较小的一半
       - 小顶堆：存储较大的一半
    2. 保持两个堆大小平衡
    3. 中位数 = 堆顶平均值（偶数）或 大顶堆堆顶（奇数）
    """
    
    def __init__(self):
        # 大顶堆（存储较小的一半，取负数实现大顶堆）
        self.max_heap = []
        # 小顶堆（存储较大的一半）
        self.min_heap = []
    
    def add_num(self, num):
        """
        添加数字
        
        时间复杂度：O(log n)
        """
        # 先加入大顶堆
        heapq.heappush(self.max_heap, -num)
        
        # 平衡：大顶堆的最大值移到小顶堆
        val = -heapq.heappop(self.max_heap)
        heapq.heappush(self.min_heap, val)
        
        # 保持大顶堆大小 >= 小顶堆
        if len(self.max_heap) < len(self.min_heap):
            val = heapq.heappop(self.min_heap)
            heapq.heappush(self.max_heap, -val)
    
    def find_median(self):
        """
        查找中位数
        
        时间复杂度：O(1)
        
        返回:
            中位数
        """
        if len(self.max_heap) == len(self.min_heap):
            # 偶数个，返回两个堆顶的平均值
            return (-self.max_heap[0] + self.min_heap[0]) / 2
        else:
            # 奇数个，返回大顶堆堆顶
            return -self.max_heap[0]

# 示例
mf = MedianFinder()
mf.add_num(1)
print(mf.find_median())  # 1.0

mf.add_num(2)
print(mf.find_median())  # 1.5

mf.add_num(3)
print(mf.find_median())  # 2.0

# 数据流：1, 2, 3
# 大顶堆：[1, 2]（实际存储 [-2, -1]）
# 小顶堆：[3]
# 中位数：2
```

### 6.4 任务调度系统

```python
import heapq
from dataclasses import dataclass, field
from typing import Any

@dataclass(order=True)
class Task:
    """任务类"""
    priority: int  # 优先级
    task_id: int = field(compare=False)  # 任务 ID
    description: str = field(compare=False)  # 描述

class TaskScheduler:
    """任务调度器"""
    
    def __init__(self):
        self.task_queue = []
        self.task_counter = 0
    
    def add_task(self, description, priority):
        """
        添加任务
        
        参数:
            description: 任务描述
            priority: 优先级（数字越小优先级越高）
        """
        task = Task(priority, self.task_counter, description)
        heapq.heappush(self.task_queue, task)
        self.task_counter += 1
        print(f"添加任务：{description}（优先级 {priority}）")
    
    def execute_next(self):
        """
        执行下一个任务（优先级最高）
        
        返回:
            执行的任务描述
        """
        if self.task_queue:
            task = heapq.heappop(self.task_queue)
            print(f"执行任务：{task.description}（优先级 {task.priority}）")
            return task.description
        else:
            print("没有待执行任务")
            return None
    
    def get_queue_size(self):
        """返回队列大小"""
        return len(self.task_queue)

# 使用示例
scheduler = TaskScheduler()

# 添加任务
scheduler.add_task("修复紧急 bug", 1)
scheduler.add_task("编写文档", 3)
scheduler.add_task("代码审查", 2)
scheduler.add_task("处理紧急故障", 0)

# 执行任务（按优先级）
print("\n开始执行任务：")
while scheduler.get_queue_size() > 0:
    scheduler.execute_next()

# 输出：
# 执行任务：处理紧急故障（优先级 0）
# 执行任务：修复紧急 bug（优先级 1）
# 执行任务：代码审查（优先级 2）
# 执行任务：编写文档（优先级 3）
```

---

## 7. 堆的变种

### 7.1 双堆实现中位数

```python
# 见 6.3 数据流中位数
```

### 7.2 可删除堆

```python
import heapq
import collections

class removableHeap:
    """
    支持删除任意元素的堆
    
    思路：
    1. 使用延迟删除
    2. 记录待删除元素
    3. 弹出时跳过已标记删除的元素
    """
    
    def __init__(self):
        self.heap = []
        self.removed = collections.defaultdict(int)
    
    def push(self, val):
        """入堆"""
        heapq.heappush(self.heap, val)
    
    def remove(self, val):
        """
        标记删除
        
        时间复杂度：O(1)
        """
        self.removed[val] += 1
    
    def pop(self):
        """
        弹出堆顶（跳过已删除的）
        
        时间复杂度：O(log n) 均摊
        """
        while self.heap:
            val = heapq.heappop(self.heap)
            
            # 检查是否被标记删除
            if self.removed[val] > 0:
                self.removed[val] -= 1
                continue
            
            return val
        
        return None
    
    def peek(self):
        """查看堆顶（跳过已删除的）"""
        while self.heap:
            val = self.heap[0]
            
            if self.removed[val] > 0:
                heapq.heappop(self.heap)
                self.removed[val] -= 1
                continue
            
            return val
        
        return None
```

---

## 📝 练习题

### 基础题

1. **堆的基本操作**：实现大顶堆的插入、删除、获取堆顶操作

2. **堆排序**：使用堆排序对数组进行升序排序

3. **优先队列**：使用 Python heapq 实现优先队列

### 进阶题

4. **Top K 问题**：找出数组中最大的 K 个元素

5. **合并 K 个有序链表**：使用堆合并 K 个有序链表

6. **数据流中位数**：实现支持动态添加的中位数查找器

### 挑战题

7. **滑动窗口最大值**：给定数组和窗口大小 k，找出每个滑动窗口的最大值

8. **前 K 个高频元素**：找出数组中出现频率最高的 K 个元素

9. **最小路径和**：在矩阵中从左上角到右下角，每次只能向右或向下，找出最小路径和

---

## 🔗 参考资料

### 经典书籍
- 📚 《算法导论》第 6 章：堆排序
- 📚 《数据结构与算法分析》第 6 章：优先队列
- 📚 《剑指 Offer》堆相关题目

### 在线资源
- 🔗 [VisuAlgo 堆可视化](https://visualgo.net/en/heap)
- 🔗 [LeetCode 堆专题](https://leetcode.com/tag/heap/)
- 🔗 [Python heapq 文档](https://docs.python.org/3/library/heapq.html)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 堆的基本操作 | ⭐⭐⭐⭐⭐ | 熟练手写 |
| 堆排序 | ⭐⭐⭐⭐ | 理解原理 |
| 优先队列 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| Top K 问题 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 堆的应用 | ⭐⭐⭐⭐ | 理解掌握 |

---

**上一章：** [树与二叉树](/data-structure-algorithm/advanced/tree)  
**下一章：** [图论基础](/data-structure-algorithm/advanced/graph)

**最后更新**：2026-03-13
