# 排序算法

> 学习日期：2026-03-13  
> 状态：📝 学习中  
> 预计完成：2026-05-27  
> 难度：⭐⭐⭐⭐☆  
> 前置知识：[数组与链表](/data-structure-algorithm/basic/array-list)、[递归与分治](/data-structure-algorithm/algorithm/recursion)、[堆与优先队列](/data-structure-algorithm/advanced/heap)

---

## 📚 目录

[[toc]]

---

## 1. 排序算法概述

### 1.1 什么是排序

**排序（Sorting）** 是将一组数据按照某种规则（通常是大小）重新排列的算法。

**排序的重要性：**
- ✅ 提高查找效率（二分查找 O(log n)）
- ✅ 数据分析基础
- ✅ 面试必考内容

### 1.2 排序算法分类

| 分类 | 算法 | 时间复杂度 | 空间复杂度 | 稳定性 |
|------|------|-----------|-----------|--------|
| **交换排序** | 冒泡排序 | O(n²) | O(1) | ✅ 稳定 |
| | 快速排序 | O(n log n) | O(log n) | ❌ 不稳定 |
| **选择排序** | 选择排序 | O(n²) | O(1) | ❌ 不稳定 |
| | 堆排序 | O(n log n) | O(1) | ❌ 不稳定 |
| **插入排序** | 插入排序 | O(n²) | O(1) | ✅ 稳定 |
| | 希尔排序 | O(n log n) | O(1) | ❌ 不稳定 |
| **归并排序** | 归并排序 | O(n log n) | O(n) | ✅ 稳定 |
| **线性排序** | 计数排序 | O(n+k) | O(k) | ✅ 稳定 |
| | 桶排序 | O(n+k) | O(n+k) | ✅ 稳定 |
| | 基数排序 | O(dn) | O(n) | ✅ 稳定 |

### 1.3 稳定性

**稳定排序**：相等元素的相对顺序在排序后保持不变。

```python
# 稳定排序示例
# 原始：[(A, 90), (B, 85), (C, 90)]
# 按分数排序后：[(B, 85), (A, 90), (C, 90)]
# A 和 C 分数相同，A 仍在 C 前面 → 稳定

# 不稳定排序示例
# 原始：[(A, 90), (B, 85), (C, 90)]
# 排序后：[(B, 85), (C, 90), (A, 90)]
# A 和 C 顺序变了 → 不稳定
```

**稳定性重要性：**
- ✅ 多关键字排序（先按成绩排，再按姓名排）
- ✅ 保持原有顺序

### 1.4 复杂度对比

```
时间复杂度对比：

O(n²)    冒泡、选择、插入    适合小数据量
O(n log n)  快速、归并、堆     适合大数据量
O(n)     计数、桶、基数     适合特定场景

空间复杂度对比：

O(1)     冒泡、选择、插入、堆、希尔    原地排序
O(log n) 快速                       递归栈
O(n)     归并、计数、桶             需要额外空间
```

---

## 2. 基础排序算法

### 2.1 冒泡排序（Bubble Sort）

**思想：** 相邻元素比较，大的往后冒。

```python
def bubble_sort(arr):
    """
    冒泡排序（稳定）
    
    思想：
    1. 相邻元素比较，大的交换到后面
    2. 每轮确定一个最大值
    3. 优化：如果某轮无交换，提前结束
    
    时间复杂度：
    - 最好：O(n)  （已排序）
    - 平均：O(n²)
    - 最坏：O(n²)
    
    空间复杂度：O(1)
    稳定性：稳定
    
    参数:
        arr: 待排序数组
    
    返回:
        排序后的数组
    """
    n = len(arr)
    
    for i in range(n - 1):
        swapped = False  # 优化标志
        
        # 每轮将最大值冒泡到最后
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                # 交换
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        
        # 如果某轮无交换，说明已排序
        if not swapped:
            break
    
    return arr

# 示例演示
# 初始：[5, 3, 8, 4, 2]
# 
# 第 1 轮：
# [3, 5, 8, 4, 2]  (5>3，交换)
# [3, 5, 8, 4, 2]  (5<8，不交换)
# [3, 5, 4, 8, 2]  (8>4，交换)
# [3, 5, 4, 2, 8]  (8>2，交换)
# 最大值 8 已到位
# 
# 第 2 轮：
# [3, 5, 4, 2, 8]
# [3, 4, 5, 2, 8]
# [3, 4, 2, 5, 8]
# 5 已到位
# 
# ... 继续
# 
# 最终：[2, 3, 4, 5, 8]

arr = [5, 3, 8, 4, 2]
print(bubble_sort(arr))  # [2, 3, 4, 5, 8]
```

### 2.2 选择排序（Selection Sort）

**思想：** 每轮选择最小值放到前面。

```python
def selection_sort(arr):
    """
    选择排序（不稳定）
    
    思想：
    1. 每轮选择未排序部分的最小值
    2. 放到已排序部分的末尾
    
    时间复杂度：
    - 最好：O(n²)
    - 平均：O(n²)
    - 最坏：O(n²)
    
    空间复杂度：O(1)
    稳定性：不稳定（交换可能改变相对顺序）
    
    参数:
        arr: 待排序数组
    
    返回:
        排序后的数组
    """
    n = len(arr)
    
    for i in range(n - 1):
        # 假设当前位置是最小值
        min_idx = i
        
        # 找到未排序部分的最小值
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        
        # 交换到已排序部分末尾
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
    
    return arr

# 示例演示
# 初始：[5, 3, 8, 4, 2]
# 
# 第 1 轮：找到最小值 2，与 5 交换
# [2, 3, 8, 4, 5]
# 
# 第 2 轮：找到最小值 3，已在正确位置
# [2, 3, 8, 4, 5]
# 
# 第 3 轮：找到最小值 4，与 8 交换
# [2, 3, 4, 8, 5]
# 
# 第 4 轮：找到最小值 5，与 8 交换
# [2, 3, 4, 5, 8]

arr = [5, 3, 8, 4, 2]
print(selection_sort(arr))  # [2, 3, 4, 5, 8]
```

### 2.3 插入排序（Insertion Sort）

**思想：** 将元素插入到已排序部分的正确位置。

```python
def insertion_sort(arr):
    """
    插入排序（稳定）
    
    思想：
    1. 将数组分为已排序和未排序两部分
    2. 每次取未排序部分的第一个元素
    3. 插入到已排序部分的正确位置
    
    时间复杂度：
    - 最好：O(n)  （已排序）
    - 平均：O(n²)
    - 最坏：O(n²)
    
    空间复杂度：O(1)
    稳定性：稳定
    
    参数:
        arr: 待排序数组
    
    返回:
        排序后的数组
    """
    n = len(arr)
    
    for i in range(1, n):
        # 待插入的元素
        key = arr[i]
        
        # 在已排序部分找到插入位置
        j = i - 1
        
        # 比 key 大的元素向后移动
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        
        # 插入到正确位置
        arr[j + 1] = key
    
    return arr

# 示例演示（类似扑克牌理牌）
# 初始：[5, 3, 8, 4, 2]
# 
# i=1，key=3：
# [5] | [3, 8, 4, 2]  （已排序 | 未排序）
# 5>3，5 后移
# [3, 5] | [8, 4, 2]
# 
# i=2，key=8：
# [3, 5] | [8, 4, 2]
# 8>5，直接插入
# [3, 5, 8] | [4, 2]
# 
# i=3，key=4：
# [3, 5, 8] | [4, 2]
# 8>4，8 后移
# 5>4，5 后移
# 3<4，插入
# [3, 4, 5, 8] | [2]
# 
# i=4，key=2：
# [3, 4, 5, 8] | [2]
# 所有元素后移
# [2, 3, 4, 5, 8]

arr = [5, 3, 8, 4, 2]
print(insertion_sort(arr))  # [2, 3, 4, 5, 8]
```

**插入排序优化（二分查找插入位置）：**

```python
def insertion_sort_binary(arr):
    """
    插入排序优化版（二分查找插入位置）
    
    时间复杂度：O(n log n) 查找 + O(n²) 移动 = O(n²)
    空间复杂度：O(1)
    稳定性：稳定
    """
    import bisect
    
    for i in range(1, len(arr)):
        key = arr[i]
        
        # 二分查找插入位置
        pos = bisect.bisect_left(arr, key, 0, i)
        
        # 移动元素
        arr[pos + 1:i + 1] = arr[pos:i]
        arr[pos] = key
    
    return arr
```

---

## 3. 高级排序算法

### 3.1 希尔排序（Shell Sort）

**思想：** 插入排序的改进版，先排序间隔较大的元素。

```python
def shell_sort(arr):
    """
    希尔排序（不稳定）
    
    思想：
    1. 选择间隔序列（如 n/2, n/4, ..., 1）
    2. 对每个间隔进行插入排序
    3. 间隔逐渐减小到 1
    
    时间复杂度：
    - 最好：O(n log n)
    - 平均：O(n log n)
    - 最坏：O(n²)（取决于间隔序列）
    
    空间复杂度：O(1)
    稳定性：不稳定
    
    参数:
        arr: 待排序数组
    
    返回:
        排序后的数组
    """
    n = len(arr)
    
    # 选择间隔（Knuth 序列：1, 4, 13, 40, ...）
    gap = 1
    while gap < n // 3:
        gap = 3 * gap + 1
    
    # 逐渐缩小间隔
    while gap >= 1:
        # 对每个间隔进行插入排序
        for i in range(gap, n):
            key = arr[i]
            j = i - gap
            
            # 插入排序
            while j >= 0 and arr[j] > key:
                arr[j + gap] = arr[j]
                j -= gap
            
            arr[j + gap] = key
        
        # 缩小间隔
        gap //= 3
    
    return arr

# 示例演示
# 初始：[8, 3, 5, 9, 1, 4, 2, 7]
# n=8, gap=1
# 
# gap=4：
# [8, _, _, _, 1, _, _, _] → [1, _, _, _, 8, _, _, _]
# [_, 3, _, _, _, 4, _, _] → [_, 3, _, _, _, 4, _, _]
# [_, _, 5, _, _, _, 2, _] → [_, _, 2, _, _, _, 5, _]
# [_, _, _, 9, _, _, _, 7] → [_, _, _, 7, _, _, _, 9]
# 结果：[1, 3, 2, 7, 8, 4, 5, 9]
# 
# gap=1（普通插入排序）：
# [1, 2, 3, 4, 5, 7, 8, 9]

arr = [8, 3, 5, 9, 1, 4, 2, 7]
print(shell_sort(arr))  # [1, 2, 3, 4, 5, 7, 8, 9]
```

### 3.2 归并排序（Merge Sort）

**思想：** 分治法，递归地将数组分成两半，分别排序后合并。

```python
def merge_sort(arr):
    """
    归并排序（稳定）
    
    思想：
    1. 将数组分成两半
    2. 递归排序左右两半
    3. 合并两个有序数组
    
    时间复杂度：
    - 最好：O(n log n)
    - 平均：O(n log n)
    - 最坏：O(n log n)
    
    空间复杂度：O(n)
    稳定性：稳定
    
    参数:
        arr: 待排序数组
    
    返回:
        排序后的数组
    """
    # 递归终止条件
    if len(arr) <= 1:
        return arr
    
    # 分成两半
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    # 合并
    return merge(left, right)

def merge(left, right):
    """
    合并两个有序数组
    
    参数:
        left: 左半部分（已排序）
        right: 右半部分（已排序）
    
    返回:
        合并后的有序数组
    """
    result = []
    i = j = 0
    
    # 合并过程
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:  # <= 保证稳定性
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    # 添加剩余元素
    result.extend(left[i:])
    result.extend(right[j:])
    
    return result

# 示例演示
# 初始：[8, 3, 5, 9, 1, 4, 2, 7]
# 
# 分解：
# [8, 3, 5, 9, 1, 4, 2, 7]
#   ↓
# [8, 3, 5, 9] [1, 4, 2, 7]
#   ↓           ↓
# [8, 3] [5, 9] [1, 4] [2, 7]
#   ↓     ↓     ↓     ↓
# [3, 8] [5, 9] [1, 4] [2, 7]
#   ↓           ↓
# [3, 5, 8, 9] [1, 2, 4, 7]
#   ↓
# [1, 2, 3, 4, 5, 7, 8, 9]

arr = [8, 3, 5, 9, 1, 4, 2, 7]
print(merge_sort(arr))  # [1, 2, 3, 4, 5, 7, 8, 9]
```

**归并排序迭代实现（自底向上）：**

```python
def merge_sort_iterative(arr):
    """
    归并排序迭代实现（自底向上）
    
    思想：
    1. 从长度为 1 的子数组开始
    2. 两两合并
    3. 子数组长度倍增
    
    时间复杂度：O(n log n)
    空间复杂度：O(n)
    """
    n = len(arr)
    size = 1  # 子数组长度
    
    while size < n:
        # 两两合并
        for start in range(0, n, 2 * size):
            mid = min(start + size, n)
            end = min(start + 2 * size, n)
            
            if mid < end:
                left = arr[start:mid]
                right = arr[mid:end]
                merged = merge(left, right)
                arr[start:start + len(merged)] = merged
        
        size *= 2
    
    return arr
```

### 3.3 快速排序（Quick Sort）

**思想：** 分治法，选择一个基准值，将数组分为小于和大于基准的两部分。

```python
def quick_sort(arr, left=0, right=None):
    """
    快速排序（不稳定）
    
    思想：
    1. 选择基准值（pivot）
    2. 分区：小于 pivot 的放左边，大于的放右边
    3. 递归排序左右两部分
    
    时间复杂度：
    - 最好：O(n log n)
    - 平均：O(n log n)
    - 最坏：O(n²)（已排序数组，每次选到端点）
    
    空间复杂度：O(log n)（递归栈）
    稳定性：不稳定
    
    参数:
        arr: 待排序数组
        left: 左边界
        right: 右边界
    
    返回:
        排序后的数组
    """
    if right is None:
        right = len(arr) - 1
    
    if left < right:
        # 分区，返回基准值位置
        pivot_idx = partition(arr, left, right)
        
        # 递归排序左右两部分
        quick_sort(arr, left, pivot_idx - 1)
        quick_sort(arr, pivot_idx + 1, right)
    
    return arr

def partition(arr, left, right):
    """
    分区函数（Lomuto 分区方案）
    
    参数:
        arr: 数组
        left: 左边界
        right: 右边界
    
    返回:
        基准值的最终位置
    """
    # 选择最右边元素作为基准
    pivot = arr[right]
    
    # i 指向小于 pivot 部分的末尾
    i = left - 1
    
    for j in range(left, right):
        if arr[j] <= pivot:
            i += 1
            # 交换
            arr[i], arr[j] = arr[j], arr[i]
    
    # 将基准值放到正确位置
    arr[i + 1], arr[right] = arr[right], arr[i + 1]
    
    return i + 1

# 示例演示
# 初始：[8, 3, 5, 9, 1, 4, 2, 7]
# 
# 第 1 轮：pivot=7
# [3, 5, 1, 4, 2] [7] [8, 9]
#   ↓              ↓    ↓
# 小于 7          基准  大于 7
# 
# 递归排序左边：
# [3, 5, 1, 4, 2], pivot=2
# [1] [2] [3, 5, 4]
# 
# ... 继续
# 
# 最终：[1, 2, 3, 4, 5, 7, 8, 9]

arr = [8, 3, 5, 9, 1, 4, 2, 7]
print(quick_sort(arr))  # [1, 2, 3, 4, 5, 7, 8, 9]
```

**快速排序优化（三数取中 + 小区间插入排序）：**

```python
def quick_sort_optimized(arr, left=0, right=None):
    """
    快速排序优化版
    
    优化点：
    1. 三数取中选择基准（避免最坏情况）
    2. 小区间使用插入排序（减少递归开销）
    3. 三路分区（处理大量重复元素）
    """
    if right is None:
        right = len(arr) - 1
    
    # 小区间使用插入排序
    if right - left < 10:
        insertion_sort_partial(arr, left, right)
        return arr
    
    if left < right:
        # 三数取中选择基准
        pivot_idx = median_of_three(arr, left, right)
        
        # 分区
        pivot_idx = partition(arr, left, right, pivot_idx)
        
        # 递归
        quick_sort_optimized(arr, left, pivot_idx - 1)
        quick_sort_optimized(arr, pivot_idx + 1, right)
    
    return arr

def median_of_three(arr, left, right):
    """三数取中：选择 left、mid、right 的中值作为基准"""
    mid = (left + right) // 2
    
    if arr[left] > arr[mid]:
        arr[left], arr[mid] = arr[mid], arr[left]
    if arr[left] > arr[right]:
        arr[left], arr[right] = arr[right], arr[left]
    if arr[mid] > arr[right]:
        arr[mid], arr[right] = arr[right], arr[mid]
    
    return mid

def insertion_sort_partial(arr, left, right):
    """部分插入排序"""
    for i in range(left + 1, right + 1):
        key = arr[i]
        j = i - 1
        while j >= left and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
```

**快速排序三路分区（处理大量重复元素）：**

```python
def quick_sort_3way(arr, left=0, right=None):
    """
    快速排序三路分区
    
    思想：
    1. 将数组分为 < pivot、= pivot、> pivot 三部分
    2. 只递归排序 < 和 > 部分
    3. = 部分已经有序
    
    适合：大量重复元素的数组
    """
    if right is None:
        right = len(arr) - 1
    
    if left < right:
        lt, gt = partition_3way(arr, left, right)
        quick_sort_3way(arr, left, lt - 1)
        quick_sort_3way(arr, gt + 1, right)
    
    return arr

def partition_3way(arr, left, right):
    """
    三路分区
    
    返回:
        lt: = part 的左边界
        gt: = part 的右边界
    """
    pivot = arr[left]
    lt = left      # < pivot 部分的末尾
    gt = right     # > pivot 部分的开头
    i = left + 1   # 当前元素
    
    while i <= gt:
        if arr[i] < pivot:
            arr[lt], arr[i] = arr[i], arr[lt]
            lt += 1
            i += 1
        elif arr[i] > pivot:
            arr[i], arr[gt] = arr[gt], arr[i]
            gt -= 1
        else:
            i += 1
    
    return lt, gt
```

---

## 4. 线性排序算法

### 4.1 堆排序（Heap Sort）

```python
def heap_sort(arr):
    """
    堆排序（不稳定）
    
    思想：
    1. 构建大顶堆
    2. 将堆顶（最大值）与末尾交换
    3. 调整剩余元素为堆
    4. 重复步骤 2-3
    
    时间复杂度：
    - 最好：O(n log n)
    - 平均：O(n log n)
    - 最坏：O(n log n)
    
    空间复杂度：O(1)
    稳定性：不稳定
    
    参数:
        arr: 待排序数组
    
    返回:
        排序后的数组
    """
    n = len(arr)
    
    # 构建大顶堆
    for i in range((n - 2) // 2, -1, -1):
        heapify(arr, n, i)
    
    # 依次取出堆顶
    for i in range(n - 1, 0, -1):
        # 交换堆顶与末尾
        arr[0], arr[i] = arr[i], arr[0]
        
        # 调整剩余元素
        heapify(arr, i, 0)
    
    return arr

def heapify(arr, n, i):
    """
    调整堆（下沉操作）
    
    参数:
        arr: 数组
        n: 堆大小
        i: 当前节点索引
    """
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    
    # 与左子节点比较
    if left < n and arr[left] > arr[largest]:
        largest = left
    
    # 与右子节点比较
    if right < n and arr[right] > arr[largest]:
        largest = right
    
    # 如果当前节点不是最大，交换并继续调整
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

# 示例
arr = [8, 3, 5, 9, 1, 4, 2, 7]
print(heap_sort(arr))  # [1, 2, 3, 4, 5, 7, 8, 9]
```

### 4.2 计数排序（Counting Sort）

```python
def counting_sort(arr):
    """
    计数排序（稳定）
    
    思想：
    1. 统计每个元素出现的次数
    2. 计算前缀和，确定每个元素的位置
    3. 从后向前放置元素（保证稳定性）
    
    时间复杂度：O(n + k)，k 为数据范围
    空间复杂度：O(k)
    稳定性：稳定
    
    适用场景：
    - 数据范围较小
    - 整数排序
    
    参数:
        arr: 待排序数组（非负整数）
    
    返回:
        排序后的数组
    """
    if not arr:
        return arr
    
    # 找到最大值
    max_val = max(arr)
    
    # 计数数组
    count = [0] * (max_val + 1)
    
    # 统计次数
    for num in arr:
        count[num] += 1
    
    # 计算前缀和
    for i in range(1, len(count)):
        count[i] += count[i - 1]
    
    # 放置元素（从后向前，保证稳定性）
    result = [0] * len(arr)
    for i in range(len(arr) - 1, -1, -1):
        num = arr[i]
        count[num] -= 1
        result[count[num]] = num
    
    return result

# 示例
arr = [4, 2, 2, 8, 3, 3, 1]
print(counting_sort(arr))  # [1, 2, 2, 3, 3, 4, 8]
```

### 4.3 桶排序（Bucket Sort）

```python
def bucket_sort(arr, bucket_size=5):
    """
    桶排序（稳定）
    
    思想：
    1. 将数据分到多个桶中
    2. 对每个桶内排序
    3. 合并所有桶
    
    时间复杂度：O(n + k)，k 为桶数
    空间复杂度：O(n + k)
    稳定性：稳定
    
    适用场景：
    - 数据均匀分布
    - 浮点数排序
    
    参数:
        arr: 待排序数组
        bucket_size: 每个桶的大小
    
    返回:
        排序后的数组
    """
    if not arr:
        return arr
    
    # 找到最大值和最小值
    min_val = min(arr)
    max_val = max(arr)
    
    # 计算桶数
    bucket_count = (max_val - min_val) // bucket_size + 1
    
    # 创建桶
    buckets = [[] for _ in range(bucket_count)]
    
    # 分桶
    for num in arr:
        idx = (num - min_val) // bucket_size
        buckets[idx].append(num)
    
    # 对每个桶排序
    result = []
    for bucket in buckets:
        if bucket:
            # 桶内使用插入排序
            insertion_sort_inplace(bucket)
            result.extend(bucket)
    
    return result

def insertion_sort_inplace(arr):
    """原地插入排序"""
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key

# 示例
arr = [0.42, 0.32, 0.33, 0.52, 0.37, 0.47, 0.51]
print(bucket_sort(arr))  # [0.32, 0.33, 0.37, 0.42, 0.47, 0.51, 0.52]
```

### 4.4 基数排序（Radix Sort）

```python
def radix_sort(arr):
    """
    基数排序（稳定）
    
    思想：
    1. 按低位到高位依次排序
    2. 每位使用计数排序
    
    时间复杂度：O(d * n)，d 为最大位数
    空间复杂度：O(n)
    稳定性：稳定
    
    适用场景：
    - 整数排序
    - 位数较少
    
    参数:
        arr: 待排序数组（非负整数）
    
    返回:
        排序后的数组
    """
    if not arr:
        return arr
    
    # 找到最大值，确定位数
    max_val = max(arr)
    d = 0
    while max_val > 0:
        max_val //= 10
        d += 1
    
    # 按位排序
    for i in range(d):
        arr = counting_sort_by_digit(arr, i)
    
    return arr

def counting_sort_by_digit(arr, digit):
    """
    按指定位进行计数排序
    
    参数:
        arr: 数组
        digit: 位数（0 表示个位，1 表示十位...）
    """
    # 计数数组（0-9）
    count = [0] * 10
    result = [0] * len(arr)
    
    # 统计每位数字出现次数
    for num in arr:
        d = (num // (10 ** digit)) % 10
        count[d] += 1
    
    # 前缀和
    for i in range(1, 10):
        count[i] += count[i - 1]
    
    # 放置元素（从后向前，保证稳定性）
    for i in range(len(arr) - 1, -1, -1):
        d = (arr[i] // (10 ** digit)) % 10
        count[d] -= 1
        result[count[d]] = arr[i]
    
    return result

# 示例
arr = [170, 45, 75, 90, 802, 24, 2, 66]
print(radix_sort(arr))  # [2, 24, 45, 66, 75, 90, 170, 802]
```

---

## 5. 排序算法对比

### 5.1 复杂度对比表

| 算法 | 最好 | 平均 | 最坏 | 空间 | 稳定 | 适用场景 |
|------|------|------|------|------|------|---------|
| **冒泡排序** | O(n) | O(n²) | O(n²) | O(1) | ✅ | 小数据、教学 |
| **选择排序** | O(n²) | O(n²) | O(n²) | O(1) | ❌ | 小数据 |
| **插入排序** | O(n) | O(n²) | O(n²) | O(1) | ✅ | 小数据、基本有序 |
| **希尔排序** | O(n log n) | O(n log n) | O(n²) | O(1) | ❌ | 中等数据 |
| **归并排序** | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ | 大数据、稳定要求 |
| **快速排序** | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ | 大数据、通用 |
| **堆排序** | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ | Top K 问题 |
| **计数排序** | O(n+k) | O(n+k) | O(n+k) | O(k) | ✅ | 范围小的整数 |
| **桶排序** | O(n+k) | O(n+k) | O(n²) | O(n+k) | ✅ | 均匀分布数据 |
| **基数排序** | O(dn) | O(dn) | O(dn) | O(n) | ✅ | 整数、位数少 |

### 5.2 选择指南

```
如何选择排序算法？

1. 数据量小（n < 50）
   → 插入排序（简单、常数因子小）

2. 数据量大，无特殊要求
   → 快速排序（通用、速度快）

3. 要求稳定性
   → 归并排序

4. 空间受限
   → 堆排序

5. 数据范围小（整数）
   → 计数排序

6. 数据均匀分布
   → 桶排序

7. 整数、位数少
   → 基数排序

8. Top K 问题
   → 堆排序
```

---

## 6. 实战案例

### 6.1 颜色分类（荷兰国旗问题）

```python
def sort_colors(nums):
    """
    颜色分类
    
    LeetCode 75. 颜色分类
    
    题目：
    给定一个包含 0、1、2 的数组，原地排序
    
    思路：
    三路快速排序思想
    0 放左边，2 放右边，1 放中间
    
    时间复杂度：O(n)
    空间复杂度：O(1)
    """
    left = 0      # 0 的右边界
    right = len(nums) - 1  # 2 的左边界
    i = 0         # 当前元素
    
    while i <= right:
        if nums[i] == 0:
            # 0 放到左边
            nums[left], nums[i] = nums[i], nums[left]
            left += 1
            i += 1
        elif nums[i] == 2:
            # 2 放到右边
            nums[right], nums[i] = nums[i], nums[right]
            right -= 1
            # i 不增加，需要继续检查交换过来的元素
        else:
            # 1 放中间
            i += 1
    
    return nums

# 示例
nums = [2, 0, 2, 1, 1, 0]
print(sort_colors(nums))  # [0, 0, 1, 1, 2, 2]
```

### 6.2 合并区间

```python
def merge_intervals(intervals):
    """
    合并区间
    
    LeetCode 56. 合并区间
    
    题目：
    给定一组区间，合并所有重叠的区间
    
    思路：
    1. 按起点排序
    2. 遍历合并
    
    时间复杂度：O(n log n)
    空间复杂度：O(1)
    """
    if not intervals:
        return []
    
    # 按起点排序
    intervals.sort(key=lambda x: x[0])
    
    result = [intervals[0]]
    
    for interval in intervals[1:]:
        last = result[-1]
        
        # 有重叠，合并
        if interval[0] <= last[1]:
            last[1] = max(last[1], interval[1])
        else:
            # 无重叠，添加新区间
            result.append(interval)
    
    return result

# 示例
intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]
print(merge_intervals(intervals))  # [[1, 6], [8, 10], [15, 18]]
```

### 6.3 最大间距

```python
def maximum_gap(nums):
    """
    最大间距
    
    LeetCode 164. 最大间距
    
    题目：
    给定无序数组，求排序后相邻元素的最大差值
    要求：O(n) 时间复杂度
    
    思路：
    桶排序思想
    1. 找到最大值和最小值
    2. 分桶，保证最大间距一定在不同桶之间
    3. 只记录每个桶的最大值和最小值
    4. 计算相邻桶的间距
    
    时间复杂度：O(n)
    空间复杂度：O(n)
    """
    if len(nums) < 2:
        return 0
    
    min_val = min(nums)
    max_val = max(nums)
    
    # 所有元素相同
    if min_val == max_val:
        return 0
    
    n = len(nums)
    # 桶大小（保证最大间距 > 桶大小）
    bucket_size = max(1, (max_val - min_val) // (n - 1))
    # 桶数
    bucket_count = (max_val - min_val) // bucket_size + 1
    
    # 桶：存储 (min, max)
    buckets = [(None, None)] * bucket_count
    
    # 分桶
    for num in nums:
        idx = (num - min_val) // bucket_size
        if buckets[idx][0] is None:
            buckets[idx] = (num, num)
        else:
            buckets[idx] = (min(buckets[idx][0], num),
                           max(buckets[idx][1], num))
    
    # 计算最大间距
    max_gap = 0
    prev_max = min_val
    
    for bucket in buckets:
        if bucket[0] is None:
            continue
        
        max_gap = max(max_gap, bucket[0] - prev_max)
        prev_max = bucket[1]
    
    return max_gap

# 示例
nums = [3, 6, 9, 1]
print(maximum_gap(nums))  # 3（排序后 [1, 3, 6, 9]，最大间距为 3）
```

---

## 📝 练习题

### 基础题

1. **冒泡排序**：实现冒泡排序并添加优化

2. **插入排序**：实现插入排序（递归 + 迭代）

3. **归并排序**：实现归并排序（递归 + 迭代）

### 进阶题

4. **快速排序**：实现快速排序（三种分区方案）

5. **颜色分类**：使用三路快排思想解决荷兰国旗问题

6. **最大间距**：使用桶排序思想求最大间距

### 挑战题

7. **合并区间**：排序后合并重叠区间

8. **前 K 个高频元素**：使用堆排序或快速选择

9. **摆动排序**：实现 nums[0] < nums[1] > nums[2] < nums[3]...

---

## 🔗 参考资料

### 经典书籍
- 📚 《算法导论》第 7-9 章：排序
- 📚 《数据结构与算法分析》第 7 章：排序
- 📚 《剑指 Offer》排序相关题目

### 在线资源
- 🔗 [VisuAlgo 排序可视化](https://visualgo.net/en/sorting)
- 🔗 [LeetCode 排序专题](https://leetcode.com/tag/sorting/)
- 🔗 [GeeksforGeeks 排序教程](https://www.geeksforgeeks.org/sorting-algorithms/)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 快速排序 | ⭐⭐⭐⭐⭐ | 熟练手写 |
| 归并排序 | ⭐⭐⭐⭐⭐ | 熟练手写 |
| 堆排序 | ⭐⭐⭐⭐ | 理解原理 |
| 插入排序 | ⭐⭐⭐⭐ | 熟练运用 |
| 线性排序 | ⭐⭐⭐⭐ | 理解适用场景 |

---

**上一章：** [图论基础](/data-structure-algorithm/advanced/graph)  
**下一章：** [查找算法](/data-structure-algorithm/algorithm/searching)

**最后更新**：2026-03-13
