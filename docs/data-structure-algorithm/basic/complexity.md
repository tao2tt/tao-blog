# 复杂度分析

> 学习日期：2026-03-13  
> 状态：📝 学习中  
> 预计完成：2026-06-10  
> 难度：⭐⭐⭐☆☆  
> 前置知识：无

---

## 📚 目录

[[toc]]

---

## 1. 算法复杂度基础

### 1.1 为什么需要复杂度分析

**问题：** 如何评价一个算法的好坏？

**错误做法：** 直接运行程序，看执行时间

```python
import time

def algorithm_a(n):
    start = time.time()
    # 算法逻辑
    end = time.time()
    return end - start
```

**问题所在：**
- ❌ 依赖硬件性能（不同电脑结果不同）
- ❌ 依赖数据规模（小数据看不出差异）
- ❌ 依赖编程语言（Python vs C++）
- ❌ 无法提前预估（需要实现后才能测试）

**正确做法：** 时间复杂度 + 空间复杂度分析

```
复杂度分析的优势：
✅ 不依赖硬件
✅ 不依赖数据规模
✅ 不依赖编程语言
✅ 可以提前预估
```

### 1.2 大 O 表示法

**定义：** 大 O 表示法（Big O Notation）用于描述算法的**渐进时间复杂度**，表示算法执行时间随数据规模增长的趋势。

**公式：** T(n) = O(f(n))

| 符号 | 含义 |
|------|------|
| **T(n)** | 算法执行时间 |
| **n** | 数据规模 |
| **f(n)** | 每行代码执行次数之和 |
| **O** | 表示 T(n) 与 f(n) 成正比 |

**通俗理解：**
```
O(n) 不是表示具体时间，而是表示增长趋势

例如：
O(1)  → 不增长（常数）
O(n)  → 线性增长
O(n²) → 平方增长
```

### 1.3 复杂度对比图

```
复杂度增长趋势（n 增大时）：

O(1)         ────────────────  最优
O(log n)     ────────────╱
O(n)         ────────╱
O(n log n)   ─────╱
O(n²)        ──╱
O(2^n)      ╱
O(n!)      ╱                            最差

数据规模 n = 1000 时的执行次数对比：

O(1)         → 1 次
O(log n)     → 10 次
O(n)         → 1,000 次
O(n log n)   → 10,000 次
O(n²)        → 1,000,000 次
O(2^n)       → 10^301 次（宇宙毁灭都算不完）
O(n!)        → 4×10^2567 次（无法计算）
```

---

## 2. 时间复杂度

### 2.1 常见时间复杂度

| 复杂度 | 名称 | 示例算法 | 1000 数据规模 |
|--------|------|---------|-------------|
| **O(1)** | 常数阶 | 数组访问、哈希表查找 | 1 次 |
| **O(log n)** | 对数阶 | 二分查找 | 10 次 |
| **O(n)** | 线性阶 | 顺序查找、遍历 | 1,000 次 |
| **O(n log n)** | 线性对数阶 | 快速排序、归并排序 | 10,000 次 |
| **O(n²)** | 平方阶 | 冒泡排序、选择排序 | 1,000,000 次 |
| **O(n³)** | 立方阶 | 三重循环 | 10 亿次 |
| **O(2^n)** | 指数阶 | 递归斐波那契 | 无法计算 |
| **O(n!)** | 阶乘阶 | 全排列 | 无法计算 |

### 2.2 O(1) - 常数阶

```python
def constant_time(n):
    """
    时间复杂度：O(1)
    
    说明：
    执行时间不随 n 增长而变化
    
    示例：
    - 数组访问：arr[i]
    - 哈希表查找：dict[key]
    - 栈操作：push/pop
    """
    a = 1
    b = 2
    c = a + b
    return c

# 无论 n 多大，都只执行 3 次操作
# 时间复杂度：O(1)

# 注意：O(1) 不等于只执行一次
# 只要执行次数固定，就是 O(1)
def constant_time_100(n):
    # 执行 100 次，但仍是 O(1)
    for i in range(100):
        print(i)
```

### 2.3 O(log n) - 对数阶

```python
def logarithmic_time(n):
    """
    时间复杂度：O(log n)
    
    说明：
    每次操作将问题规模缩小一半
    
    示例：
    - 二分查找
    - 堆操作
    - 树的遍历
    """
    count = 0
    i = 1
    
    # i 每次乘以 2，直到超过 n
    # 执行次数：log₂(n)
    while i <= n:
        count += 1
        i = i * 2
    
    return count

# 示例：n = 1024
# 执行次数：log₂(1024) = 10 次
print(logarithmic_time(1024))  # 输出：10

# n = 1048576 (2^20)
# 执行次数：log₂(1048576) = 20 次
print(logarithmic_time(1048576))  # 输出：20
```

**二分查找示例：**

```python
def binary_search(arr, target):
    """
    二分查找
    
    时间复杂度：O(log n)
    
    每次将搜索范围缩小一半
    """
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# 1000 个元素，最多比较 log₂(1000) ≈ 10 次
# 100 万个元素，最多比较 log₂(1000000) ≈ 20 次
```

### 2.4 O(n) - 线性阶

```python
def linear_time(n):
    """
    时间复杂度：O(n)
    
    说明：
    执行时间与 n 成正比
    
    示例：
    - 顺序查找
    - 数组遍历
    - 链表遍历
    """
    count = 0
    
    # 执行 n 次
    for i in range(n):
        count += 1
    
    return count

# n = 1000，执行 1000 次
# n = 10000，执行 10000 次
print(linear_time(1000))  # 输出：1000
```

**顺序查找示例：**

```python
def sequential_search(arr, target):
    """
    顺序查找
    
    时间复杂度：O(n)
    
    最坏情况：遍历整个数组
    """
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

# 最坏情况：目标在最后或不存在
# 需要遍历 n 个元素
```

### 2.5 O(n log n) - 线性对数阶

```python
def linearithmic_time(n):
    """
    时间复杂度：O(n log n)
    
    说明：
    外层循环 n 次，内层循环 log n 次
    
    示例：
    - 快速排序（平均）
    - 归并排序
    - 堆排序
    """
    count = 0
    
    # 外层循环 n 次
    for i in range(n):
        # 内层循环 log n 次
        j = 1
        while j < n:
            count += 1
            j = j * 2
    
    return count

# n = 1024
# 执行次数：1024 × log₂(1024) = 1024 × 10 = 10240 次
print(linearithmic_time(1024))  # 输出：10240
```

**归并排序示例：**

```python
def merge_sort(arr):
    """
    归并排序
    
    时间复杂度：O(n log n)
    
    分解：log n 层
    每层合并：O(n)
    总计：O(n log n)
    """
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    # O(n) 合并
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    
    return result
```

### 2.6 O(n²) - 平方阶

```python
def quadratic_time(n):
    """
    时间复杂度：O(n²)
    
    说明：
    双重循环，执行 n × n 次
    
    示例：
    - 冒泡排序
    - 选择排序
    - 插入排序
    """
    count = 0
    
    # 外层循环 n 次
    for i in range(n):
        # 内层循环 n 次
        for j in range(n):
            count += 1
    
    return count

# n = 100，执行 10000 次
# n = 1000，执行 1000000 次
print(quadratic_time(100))    # 输出：10000
print(quadratic_time(1000))   # 输出：1000000
```

**冒泡排序示例：**

```python
def bubble_sort(arr):
    """
    冒泡排序
    
    时间复杂度：O(n²)
    
    双重循环：
    - 外层：n-1 次
    - 内层：平均 n/2 次
    总计：O(n²)
    """
    n = len(arr)
    
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    
    return arr
```

### 2.7 O(2^n) - 指数阶

```python
def exponential_time(n):
    """
    时间复杂度：O(2^n)
    
    说明：
    每次递归产生两个分支
    
    示例：
    - 递归斐波那契（未优化）
    - 穷举所有子集
    """
    if n <= 1:
        return 1
    
    # 每次调用产生两个新调用
    return exponential_time(n - 1) + exponential_time(n - 2)

# n = 10，调用 177 次
# n = 20，调用 21891 次
# n = 40，调用 3 亿多次（非常慢）
# n = 100，宇宙毁灭都算不完

# 递归树：
# fib(5)
# ├── fib(4)
# │   ├── fib(3)
# │   └── fib(2)
# └── fib(3)
#     ├── fib(2)
#     └── fib(1)
```

**优化版（记忆化）：**

```python
def fibonacci_memo(n, memo={}):
    """
    斐波那契（记忆化）
    
    时间复杂度：O(n)
    
    使用字典缓存已计算的结果
    避免重复计算
    """
    if n in memo:
        return memo[n]
    
    if n <= 1:
        return n
    
    memo[n] = fibonacci_memo(n - 1, memo) + fibonacci_memo(n - 2, memo)
    return memo[n]

# n = 100，瞬间完成
print(fibonacci_memo(100))
```

### 2.8 O(n!) - 阶乘阶

```python
def factorial_time(n):
    """
    时间复杂度：O(n!)
    
    说明：
    全排列问题，n 个元素有 n! 种排列
    
    示例：
    - 全排列
    - 旅行商问题（穷举）
    """
    from math import factorial
    return factorial(n)

# n = 5，120 次
# n = 10，3628800 次
# n = 20，2.4×10^18 次（超级计算机也要算几年）
# n = 100，4×10^157 次（宇宙原子总数才 10^80）

print(factorial_time(5))    # 输出：120
print(factorial_time(10))   # 输出：3628800
```

**全排列示例：**

```python
def permute(nums):
    """
    全排列
    
    时间复杂度：O(n!)
    
    n 个元素有 n! 种排列
    """
    result = []
    
    def backtrack(path, remaining):
        if not remaining:
            result.append(path[:])
            return
        
        for i in range(len(remaining)):
            path.append(remaining[i])
            backtrack(path, remaining[:i] + remaining[i+1:])
            path.pop()
    
    backtrack([], nums)
    return result

# 3 个元素：3! = 6 种排列
# 10 个元素：10! = 3628800 种排列
```

---

## 3. 空间复杂度

### 3.1 什么是空间复杂度

**定义：** 空间复杂度（Space Complexity）表示算法所需的存储空间随数据规模增长的趋势。

**公式：** S(n) = O(f(n))

**包含内容：**
- 输入数据所占空间
- 额外空间（临时变量、递归栈等）

**注意：** 通常只计算**额外空间**

### 3.2 常见空间复杂度

| 复杂度 | 示例算法 | 说明 |
|--------|---------|------|
| **O(1)** | 冒泡排序 | 只需常数个临时变量 |
| **O(n)** | 归并排序 | 需要额外数组 |
| **O(log n)** | 快速排序 | 递归栈深度 |
| **O(n)** | BFS/DFS | 队列/栈空间 |

### 3.3 O(1) - 常数空间

```python
def constant_space(arr):
    """
    空间复杂度：O(1)
    
    说明：
    只使用固定数量的临时变量
    不随 n 增长
    """
    n = len(arr)
    max_val = arr[0]
    
    for i in range(1, n):
        if arr[i] > max_val:
            max_val = arr[i]
    
    return max_val

# 只使用了 n, max_val, i 三个变量
# 空间复杂度：O(1)
```

**冒泡排序（原地排序）：**

```python
def bubble_sort(arr):
    """
    冒泡排序
    
    空间复杂度：O(1)
    
    原地排序，只需一个临时变量
    """
    n = len(arr)
    
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                # 只需一个临时变量
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    
    return arr
```

### 3.4 O(n) - 线性空间

```python
def linear_space(n):
    """
    空间复杂度：O(n)
    
    说明：
    需要与 n 成正比的额外空间
    """
    # 创建一个大小为 n 的数组
    arr = [0] * n
    
    for i in range(n):
        arr[i] = i
    
    return arr

# 额外空间：n 个元素
# 空间复杂度：O(n)
```

**归并排序：**

```python
def merge_sort(arr):
    """
    归并排序
    
    空间复杂度：O(n)
    
    需要额外数组存储合并结果
    """
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    # 需要额外空间存储合并结果
    return merge(left, right)

def merge(left, right):
    result = []  # O(n) 额外空间
    # ... 合并逻辑
    return result
```

### 3.5 O(log n) - 对数空间

```python
def logarithmic_space(n):
    """
    空间复杂度：O(log n)
    
    说明：
    递归深度为 log n
    
    示例：
    - 快速排序（平均）
    - 二分查找（递归版）
    - 树的遍历
    """
    if n <= 1:
        return
    
    # 递归深度：log n
    logarithmic_space(n // 2)
```

**快速排序：**

```python
def quick_sort(arr, left=0, right=None):
    """
    快速排序
    
    空间复杂度：O(log n)（平均）
    
    递归栈深度：log n
    """
    if right is None:
        right = len(arr) - 1
    
    if left < right:
        pivot_idx = partition(arr, left, right)
        quick_sort(arr, left, pivot_idx - 1)
        quick_sort(arr, pivot_idx + 1, right)
    
    return arr

# 平均递归深度：log n
# 最坏递归深度：n（已排序数组）
```

---

## 4. 复杂度分析技巧

### 4.1 只关注最高阶项

```python
def example(n):
    # 执行次数：3n² + 2n + 1
    
    # O(1)
    a = 1
    
    # O(n)
    for i in range(n):
        a += 1
    
    # O(n²)
    for i in range(n):
        for j in range(n):
            a += 1
    
    return a

# 总执行次数：3n² + 2n + 1
# 大 O 表示法：O(n²)

# 原因：
# 当 n 很大时，低阶项和常数可以忽略
# n = 10000 时：
# 3n² = 300,000,000
# 2n = 20,000
# 1 = 1
# 显然 3n² 占主导地位
```

### 4.2 去掉系数

```python
def example(n):
    # 执行次数：2n
    
    for i in range(n):
        print(i)
    
    for i in range(n):
        print(i)
    
    return

# 总执行次数：2n
# 大 O 表示法：O(n)

# 原因：
# 系数不影响增长趋势
# O(2n) = O(n)
# O(100n) = O(n)
```

### 4.3 加法法则

```python
def example(n, m):
    # 代码段 1：O(n)
    for i in range(n):
        print(i)
    
    # 代码段 2：O(m)
    for j in range(m):
        print(j)
    
    return

# 总复杂度：O(n + m)

# 如果 n 和 m 同数量级
# 可以简化为：O(n)
```

### 4.4 乘法法则

```python
def example(n):
    # 外层：O(n)
    for i in range(n):
        # 内层：O(n)
        for j in range(n):
            print(i, j)
    
    return

# 总复杂度：O(n) × O(n) = O(n²)

# 嵌套循环，复杂度相乘
```

### 4.5 多分支取最大值

```python
def example(arr):
    n = len(arr)
    
    if n < 100:
        # O(n²)
        for i in range(n):
            for j in range(n):
                print(i, j)
    else:
        # O(n log n)
        merge_sort(arr)
    
    return

# 复杂度：max(O(n²), O(n log n)) = O(n²)

# 取最坏情况
```

---

## 5. 最好、最坏、平均复杂度

### 5.1 定义

| 类型 | 说明 | 使用场景 |
|------|------|---------|
| **最好情况** | 最有利的输入 | 理论下限 |
| **最坏情况** | 最不利的输入 | 保证上限 |
| **平均情况** | 随机输入 | 实际表现 |

### 5.2 示例：顺序查找

```python
def sequential_search(arr, target):
    """
    顺序查找
    
    最好情况：O(1)  → 目标在第一个位置
    最坏情况：O(n)  → 目标在最后或不存在
    平均情况：O(n)  → 目标在中间
    """
    for i in range(len(arr)):
        if arr[i] == target:
            return i  # 找到
    return -1  # 未找到
```

### 5.3 示例：快速排序

```python
def quick_sort(arr):
    """
    快速排序
    
    最好情况：O(n log n)  → 每次平分
    最坏情况：O(n²)       → 已排序数组
    平均情况：O(n log n)  → 随机数组
    """
    # 实现略
    pass
```

### 5.4 均摊复杂度

**定义：** 将多个操作的总复杂度均摊到每个操作上。

**示例：动态数组扩容**

```python
class DynamicArray:
    """
    动态数组
    
    单次 push：
    - 最好：O(1)
    - 最坏：O(n)（需要扩容）
    
    均摊复杂度：O(1)
    
    原因：
    扩容不频繁，均摊到每次操作是 O(1)
    """
    def __init__(self):
        self.arr = [0] * 1
        self.size = 0
        self.capacity = 1
    
    def push(self, val):
        if self.size == self.capacity:
            # 扩容：O(n)
            new_arr = [0] * (self.capacity * 2)
            for i in range(self.size):
                new_arr[i] = self.arr[i]
            self.arr = new_arr
            self.capacity *= 2
        
        # 添加元素：O(1)
        self.arr[self.size] = val
        self.size += 1
```

---

## 6. 实战案例

### 6.1 两数之和

```python
def two_sum_brute_force(nums, target):
    """
    两数之和（暴力法）
    
    时间复杂度：O(n²)
    空间复杂度：O(1)
    
    双重循环遍历所有组合
    """
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

def two_sum_hash(nums, target):
    """
    两数之和（哈希表优化）
    
    时间复杂度：O(n)
    空间复杂度：O(n)
    
    使用哈希表存储已遍历的数字
    一次遍历即可找到答案
    """
    hash_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    
    return []

# 对比：
# n = 10000
# 暴力法：100,000,000 次操作
# 哈希法：10,000 次操作
```

### 6.2 最大子数组和

```python
def max_subarray_brute_force(nums):
    """
    最大子数组和（暴力法）
    
    时间复杂度：O(n²)
    空间复杂度：O(1)
    
    枚举所有子数组
    """
    max_sum = float('-inf')
    n = len(nums)
    
    for i in range(n):
        current_sum = 0
        for j in range(i, n):
            current_sum += nums[j]
            max_sum = max(max_sum, current_sum)
    
    return max_sum

def max_subarray_kadane(nums):
    """
    最大子数组和（ Kadane 算法）
    
    时间复杂度：O(n)
    空间复杂度：O(1)
    
    动态规划思想
    """
    max_sum = current_sum = nums[0]
    
    for num in nums[1:]:
        # 选择：继续当前子数组 or 重新开始
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    
    return max_sum

# 对比：
# n = 10000
# 暴力法：100,000,000 次操作
# Kadane：10,000 次操作
```

### 6.3 合并两个有序数组

```python
def merge_arrays_extra_space(arr1, arr2):
    """
    合并两个有序数组（额外空间）
    
    时间复杂度：O(m + n)
    空间复杂度：O(m + n)
    
    使用额外数组存储结果
    """
    result = []
    i = j = 0
    
    while i < len(arr1) and j < len(arr2):
        if arr1[i] <= arr2[j]:
            result.append(arr1[i])
            i += 1
        else:
            result.append(arr2[j])
            j += 1
    
    result.extend(arr1[i:])
    result.extend(arr2[j:])
    
    return result

def merge_arrays_in_place(arr1, m, arr2, n):
    """
    合并两个有序数组（原地）
    
    时间复杂度：O(m + n)
    空间复杂度：O(1)
    
    从后向前合并，避免覆盖
    """
    # arr1 有足够空间容纳 arr2
    i, j, k = m - 1, n - 1, m + n - 1
    
    while j >= 0:
        if i >= 0 and arr1[i] > arr2[j]:
            arr1[k] = arr1[i]
            i -= 1
        else:
            arr1[k] = arr2[j]
            j -= 1
        k -= 1
    
    return arr1
```

---

## 7. 复杂度速查表

### 7.1 数据结构操作复杂度

| 数据结构 | 访问 | 查找 | 插入 | 删除 |
|---------|------|------|------|------|
| **数组** | O(1) | O(n) | O(n) | O(n) |
| **链表** | O(n) | O(n) | O(1) | O(1) |
| **栈** | O(n) | O(n) | O(1) | O(1) |
| **队列** | O(n) | O(n) | O(1) | O(1) |
| **哈希表** | - | O(1) | O(1) | O(1) |
| **二叉搜索树** | O(log n) | O(log n) | O(log n) | O(log n) |
| **AVL 树** | O(log n) | O(log n) | O(log n) | O(log n) |
| **堆** | O(1) | O(n) | O(log n) | O(log n) |

### 7.2 排序算法复杂度

| 算法 | 最好 | 平均 | 最坏 | 空间 | 稳定 |
|------|------|------|------|------|------|
| **冒泡排序** | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| **选择排序** | O(n²) | O(n²) | O(n²) | O(1) | ❌ |
| **插入排序** | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| **快速排序** | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ |
| **归并排序** | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |
| **堆排序** | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ |
| **计数排序** | O(n+k) | O(n+k) | O(n+k) | O(k) | ✅ |

### 7.3 常用算法复杂度

| 算法 | 时间复杂度 | 空间复杂度 |
|------|-----------|-----------|
| **二分查找** | O(log n) | O(1) |
| **BFS** | O(V + E) | O(V) |
| **DFS** | O(V + E) | O(V) |
| **Dijkstra** | O((V+E)log V) | O(V) |
| **KMP** | O(m + n) | O(m) |
| **Manacher** | O(n) | O(n) |

---

## 📝 练习题

### 基础题

1. **判断复杂度**：分析给定代码片段的时间复杂度

2. **比较算法**：比较两个算法的复杂度优劣

3. **空间分析**：分析算法的空间复杂度

### 进阶题

4. **优化代码**：将 O(n²) 的代码优化到 O(n)

5. **均摊分析**：分析动态数组的均摊复杂度

6. **递归分析**：分析递归算法的复杂度

### 挑战题

7. **主定理应用**：使用主定理分析分治算法

8. **复杂度证明**：证明某个算法的复杂度

9. **实际场景**：为实际问题选择合适的算法

---

## 🔗 参考资料

### 经典书籍
- 📚 《算法导论》第 3 章：函数的增长
- 📚 《数据结构与算法分析》第 2 章：算法分析
- 📚 《编程珠玑》第 8 章：算法设计技术

### 在线资源
- 🔗 [Big O Cheat Sheet](https://www.bigocheatsheet.com/)
- 🔗 [VisuAlgo 复杂度可视化](https://visualgo.net/en/sorting)
- 🔗 [GeeksforGeeks 复杂度分析](https://www.geeksforgeeks.org/analysis-algorithms-big-o-analysis/)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 大 O 表示法 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 常见复杂度 | ⭐⭐⭐⭐⭐ | 熟练判断 |
| 复杂度分析技巧 | ⭐⭐⭐⭐ | 理解掌握 |
| 最好/最坏/平均 | ⭐⭐⭐⭐ | 理解区别 |
| 数据结构复杂度 | ⭐⭐⭐⭐⭐ | 熟记于心 |

---

**上一章：** [数组与链表](/data-structure-algorithm/basic/array-list)  
**下一章：** [栈与队列](/data-structure-algorithm/basic/stack-queue)

**最后更新**：2026-03-13
