# 递归与分治

> 学习日期：2026-03-13  
> 状态：📝 学习中  
> 预计完成：2026-05-31  
> 难度：⭐⭐⭐⭐☆  
> 前置知识：[栈与队列](/data-structure-algorithm/basic/stack-queue)、[树与二叉树](/data-structure-algorithm/advanced/tree)

---

## 📚 目录

[[toc]]

---

## 1. 递归基础

### 1.1 什么是递归

**递归（Recursion）** 是函数调用自身的一种编程技巧。

**递归三要素：**
1. **终止条件**：何时停止递归
2. **递归调用**：函数调用自身
3. **状态转移**：如何向终止条件靠近

**生活案例：**
```
什么是递归？
- 要理解递归，首先要理解递归
- 要理解递归，首先要理解递归
- ...
- 好了，别递归了，会栈溢出的！
```

### 1.2 递归 vs 迭代

| 对比项 | 递归 | 迭代 |
|--------|------|------|
| **代码简洁性** | ✅ 简洁优雅 | ❌ 相对冗长 |
| **理解难度** | ❌ 较难理解 | ✅ 容易理解 |
| **空间复杂度** | ❌ O(n) 栈空间 | ✅ O(1) |
| **性能** | ❌ 函数调用开销 | ✅ 循环效率高 |
| **适用场景** | 树、图、分治 | 简单循环 |

### 1.3 递归执行过程

```python
def factorial(n):
    """
    计算阶乘：n!
    
    递归三要素：
    1. 终止条件：n == 0 或 n == 1
    2. 递归调用：factorial(n-1)
    3. 状态转移：n * factorial(n-1)
    """
    # 终止条件
    if n <= 1:
        return 1
    
    # 递归调用
    return n * factorial(n - 1)

# 执行过程演示
# factorial(5)
# = 5 * factorial(4)
# = 5 * 4 * factorial(3)
# = 5 * 4 * 3 * factorial(2)
# = 5 * 4 * 3 * 2 * factorial(1)
# = 5 * 4 * 3 * 2 * 1
# = 120

print(factorial(5))  # 输出：120
```

**栈帧变化：**
```
调用 factorial(5)
┌─────────────┐
│ n = 5       │
│ return 5 *  │ ← 等待 factorial(4)
└─────────────┘

调用 factorial(4)
┌─────────────┐
│ n = 4       │
│ return 4 *  │ ← 等待 factorial(3)
├─────────────┤
│ n = 5       │
│ return 5 *  │
└─────────────┘

... 继续深入

调用 factorial(1)
┌─────────────┐
│ n = 1       │
│ return 1    │ ← 终止条件，返回
├─────────────┤
│ ...         │
└─────────────┘

开始返回：
factorial(1) = 1
factorial(2) = 2 * 1 = 2
factorial(3) = 3 * 2 = 6
factorial(4) = 4 * 6 = 24
factorial(5) = 5 * 24 = 120
```

### 1.4 递归优化技巧

**技巧 1：记忆化（Memoization）**

```python
def fibonacci_memo(n, memo=None):
    """
    斐波那契数列（记忆化递归）
    
    问题：
    普通递归会重复计算相同子问题
    
    优化：
    使用字典缓存已计算的结果
    
    时间复杂度：O(n)
    空间复杂度：O(n)
    """
    if memo is None:
        memo = {}
    
    # 检查缓存
    if n in memo:
        return memo[n]
    
    # 终止条件
    if n <= 1:
        return n
    
    # 递归计算并缓存
    memo[n] = fibonacci_memo(n - 1, memo) + fibonacci_memo(n - 2, memo)
    
    return memo[n]

# 对比普通递归
def fibonacci_naive(n):
    """普通递归（指数级时间复杂度）"""
    if n <= 1:
        return n
    return fibonacci_naive(n - 1) + fibonacci_naive(n - 2)

# 性能对比
# fibonacci_naive(40)  # 需要几秒
# fibonacci_memo(40)   # 瞬间完成

print(fibonacci_memo(10))  # 输出：55
```

**技巧 2：尾递归优化**

```python
def factorial_tail(n, acc=1):
    """
    尾递归计算阶乘
    
    尾递归特点：
    1. 递归调用是函数的最后一步
    2. 返回值不包含递归调用的结果
    3. 某些语言可以优化为迭代（Python 不支持）
    
    时间复杂度：O(n)
    空间复杂度：O(n)（Python 不优化）
    """
    if n <= 1:
        return acc
    
    return factorial_tail(n - 1, n * acc)

# 执行过程
# factorial_tail(5, 1)
# = factorial_tail(4, 5)
# = factorial_tail(3, 20)
# = factorial_tail(2, 60)
# = factorial_tail(1, 120)
# = 120

print(factorial_tail(5))  # 输出：120
```

**技巧 3：转换为迭代**

```python
def factorial_iterative(n):
    """
    迭代计算阶乘（递归转迭代）
    
    任何递归都可以转换为迭代
    
    时间复杂度：O(n)
    空间复杂度：O(1)
    """
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

print(factorial_iterative(5))  # 输出：120
```

---

## 2. 分治算法

### 2.1 什么是分治

**分治（Divide and Conquer）** 是将大问题分解为小问题，分别解决后合并结果的算法思想。

**分治三步骤：**
1. **分解（Divide）**：将问题分解为子问题
2. **解决（Conquer）**：递归解决子问题
3. **合并（Combine）**：合并子问题的解

**分治 vs 递归：**
- 递归是一种编程技巧
- 分治是一种算法思想
- 分治通常用递归实现

### 2.2 归并排序（分治经典案例）

```python
def merge_sort(arr):
    """
    归并排序（分治算法）
    
    分治三步骤：
    1. 分解：将数组分成两半
    2. 解决：递归排序左右两半
    3. 合并：合并两个有序数组
    
    时间复杂度：O(n log n)
    空间复杂度：O(n)
    稳定性：稳定
    """
    # 终止条件
    if len(arr) <= 1:
        return arr
    
    # 1. 分解
    mid = len(arr) // 2
    left = arr[:mid]
    right = arr[mid:]
    
    # 2. 解决（递归排序）
    left_sorted = merge_sort(left)
    right_sorted = merge_sort(right)
    
    # 3. 合并
    return merge(left_sorted, right_sorted)

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

### 2.3 快速排序（分治经典案例）

```python
def quick_sort(arr, left=0, right=None):
    """
    快速排序（分治算法）
    
    分治三步骤：
    1. 分解：选择基准值，分区
    2. 解决：递归排序左右两部分
    3. 合并：无需合并（原地排序）
    
    时间复杂度：
    - 最好：O(n log n)
    - 平均：O(n log n)
    - 最坏：O(n²)
    
    空间复杂度：O(log n)
    稳定性：不稳定
    """
    if right is None:
        right = len(arr) - 1
    
    if left < right:
        # 1. 分解（分区）
        pivot_idx = partition(arr, left, right)
        
        # 2. 解决（递归排序）
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
    pivot = arr[right]  # 选择最右边为基准
    i = left - 1
    
    for j in range(left, right):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    arr[i + 1], arr[right] = arr[right], arr[i + 1]
    
    return i + 1

# 示例
arr = [8, 3, 5, 9, 1, 4, 2, 7]
print(quick_sort(arr))  # [1, 2, 3, 4, 5, 7, 8, 9]
```

### 2.4 二分查找（分治应用）

```python
def binary_search(arr, target, left=0, right=None):
    """
    二分查找（分治思想）
    
    分治三步骤：
    1. 分解：选择中间位置
    2. 解决：在左半或右半继续查找
    3. 合并：无需合并
    
    时间复杂度：O(log n)
    空间复杂度：O(1)（迭代）/ O(log n)（递归）
    """
    if right is None:
        right = len(arr) - 1
    
    # 终止条件
    if left > right:
        return -1
    
    # 分解
    mid = left + (right - left) // 2
    
    # 解决
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search(arr, target, mid + 1, right)
    else:
        return binary_search(arr, target, left, mid - 1)

# 示例
arr = [1, 3, 5, 7, 9, 11, 13, 15]
print(binary_search(arr, 7))  # 输出：3
```

---

## 3. 递归经典问题

### 3.1 汉诺塔问题

```python
def hanoi(n, source, target, auxiliary):
    """
    汉诺塔问题
    
    问题描述：
    有三根柱子 A、B、C，A 上有 n 个盘子（从小到大）
    将所有盘子从 A 移到 C，每次只能移动一个盘子
    大盘子不能放在小盘子上面
    
    分治思想：
    1. 将 n-1 个盘子从 A 移到 B（借助 C）
    2. 将第 n 个盘子从 A 移到 C
    3. 将 n-1 个盘子从 B 移到 C（借助 A）
    
    时间复杂度：O(2^n)
    空间复杂度：O(n)（递归栈）
    
    参数:
        n: 盘子数量
        source: 源柱子
        target: 目标柱子
        auxiliary: 辅助柱子
    """
    # 终止条件
    if n == 1:
        print(f"{source} → {target}")
        return
    
    # 1. 将 n-1 个盘子从 source 移到 auxiliary
    hanoi(n - 1, source, auxiliary, target)
    
    # 2. 将第 n 个盘子从 source 移到 target
    print(f"{source} → {target}")
    
    # 3. 将 n-1 个盘子从 auxiliary 移到 target
    hanoi(n - 1, auxiliary, target, source)

# 示例：3 个盘子
# A → C
# A → B
# C → B
# A → C
# B → A
# B → C
# A → C

hanoi(3, 'A', 'C', 'B')
# 输出：
# A → C
# A → B
# C → B
# A → C
# B → A
# B → C
# A → C
```

### 3.2 全排列问题

```python
def permutations(nums):
    """
    全排列问题
    
    问题描述：
    给定一个不含重复数字的数组，返回所有可能的全排列
    
    回溯思想：
    1. 选择一个数字放入路径
    2. 递归处理剩余数字
    3. 回溯（撤销选择）
    
    时间复杂度：O(n!)
    空间复杂度：O(n)
    
    参数:
        nums: 输入数组
    
    返回:
        所有全排列
    """
    result = []
    
    def backtrack(path, remaining):
        # 终止条件：没有剩余数字
        if not remaining:
            result.append(path[:])  # 复制路径
            return
        
        # 遍历所有选择
        for i in range(len(remaining)):
            # 做选择
            path.append(remaining[i])
            
            # 递归
            backtrack(path, remaining[:i] + remaining[i+1:])
            
            # 撤销选择（回溯）
            path.pop()
    
    backtrack([], nums)
    return result

# 示例
nums = [1, 2, 3]
result = permutations(nums)
# 输出：
# [
#   [1, 2, 3], [1, 3, 2],
#   [2, 1, 3], [2, 3, 1],
#   [3, 1, 2], [3, 2, 1]
# ]
print(result)
```

### 3.3 组合问题

```python
def combinations(n, k):
    """
    组合问题
    
    问题描述：
    从 1 到 n 中选出 k 个数的所有组合
    
    回溯思想：
    1. 选择一个数字
    2. 递归选择剩余数字
    3. 回溯
    
    时间复杂度：O(C(n,k))
    空间复杂度：O(k)
    
    参数:
        n: 范围上限
        k: 选择数量
    
    返回:
        所有组合
    """
    result = []
    
    def backtrack(start, path):
        # 终止条件：已选择 k 个数
        if len(path) == k:
            result.append(path[:])
            return
        
        # 遍历所有选择（剪枝优化）
        for i in range(start, n - (k - len(path)) + 2):
            # 做选择
            path.append(i)
            
            # 递归
            backtrack(i + 1, path)
            
            # 撤销选择（回溯）
            path.pop()
    
    backtrack(1, [])
    return result

# 示例
result = combinations(4, 2)
# 输出：
# [
#   [1, 2], [1, 3], [1, 4],
#   [2, 3], [2, 4],
#   [3, 4]
# ]
print(result)
```

### 3.4 子集问题

```python
def subsets(nums):
    """
    子集问题（幂集）
    
    问题描述：
    给定一个不含重复元素的数组，返回所有可能的子集
    
    回溯思想：
    1. 每个元素有选或不选两种选择
    2. 递归处理
    3. 回溯
    
    时间复杂度：O(2^n)
    空间复杂度：O(n)
    
    参数:
        nums: 输入数组
    
    返回:
        所有子集
    """
    result = []
    
    def backtrack(start, path):
        # 每个节点都是一个子集
        result.append(path[:])
        
        # 遍历所有选择
        for i in range(start, len(nums)):
            # 做选择
            path.append(nums[i])
            
            # 递归
            backtrack(i + 1, path)
            
            # 撤销选择（回溯）
            path.pop()
    
    backtrack(0, [])
    return result

# 示例
nums = [1, 2, 3]
result = subsets(nums)
# 输出：
# [
#   [], [1], [1, 2], [1, 2, 3],
#   [1, 3], [2], [2, 3], [3]
# ]
print(result)
```

---

## 4. 回溯算法

### 4.1 回溯算法框架

```python
def backtrack_template():
    """
    回溯算法通用模板
    
    回溯三要素：
    1. 路径：已经做的选择
    2. 选择列表：当前可以做的选择
    3. 结束条件：到达决策树底层
    
    框架：
    result = []
    def backtrack(路径，选择列表):
        if 满足结束条件:
            result.add(路径)
            return
        
        for 选择 in 选择列表:
            做选择
            backtrack(路径，选择列表)
            撤销选择
    """
    result = []
    
    def backtrack(path, choices):
        # 结束条件
        if is_done(path):
            result.append(path[:])
            return
        
        # 遍历所有选择
        for choice in choices:
            # 做选择
            make_choice(path, choice)
            
            # 递归
            backtrack(path, new_choices)
            
            # 撤销选择（回溯）
            undo_choice(path, choice)
    
    backtrack([], initial_choices)
    return result
```

### 4.2 N 皇后问题

```python
def solve_n_queens(n):
    """
    N 皇后问题
    
    问题描述：
    在 n×n 的棋盘上放置 n 个皇后
    使得它们互不攻击（不在同一行、列、对角线）
    
    回溯思想：
    1. 逐行放置皇后
    2. 检查是否合法
    3. 不合法则回溯
    
    时间复杂度：O(n!)
    空间复杂度：O(n)
    
    参数:
        n: 皇后数量
    
    返回:
        所有解法
    """
    result = []
    board = [['.'] * n for _ in range(n)]
    
    def is_safe(row, col):
        """检查位置是否安全"""
        # 检查列
        for i in range(row):
            if board[i][col] == 'Q':
                return False
        
        # 检查左上对角线
        i, j = row - 1, col - 1
        while i >= 0 and j >= 0:
            if board[i][j] == 'Q':
                return False
            i -= 1
            j -= 1
        
        # 检查右上对角线
        i, j = row - 1, col + 1
        while i >= 0 and j < n:
            if board[i][j] == 'Q':
                return False
            i -= 1
            j += 1
        
        return True
    
    def backtrack(row):
        # 结束条件：所有皇后都放置好了
        if row == n:
            result.append([''.join(row) for row in board])
            return
        
        # 遍历当前行的所有列
        for col in range(n):
            if is_safe(row, col):
                # 做选择
                board[row][col] = 'Q'
                
                # 递归
                backtrack(row + 1)
                
                # 撤销选择（回溯）
                board[row][col] = '.'
    
    backtrack(0)
    return result

# 示例：4 皇后
result = solve_n_queens(4)
# 输出：
# [
#   [".Q..", "...Q", "Q...", "..Q."],
#   ["..Q.", "Q...", "...Q", ".Q.."]
# ]
print(f"4 皇后有 {len(result)} 种解法")
```

### 4.3 数独求解

```python
def solve_sudoku(board):
    """
    数独求解
    
    问题描述：
    9×9 的数独棋盘，部分已填数字
    填入剩余数字，使得每行、每列、每个 3×3 宫都包含 1-9
    
    回溯思想：
    1. 找到空格
    2. 尝试填入 1-9
    3. 检查是否合法
    4. 不合法则回溯
    
    参数:
        board: 9×9 数独棋盘（'.'表示空格）
    
    返回:
        是否成功求解
    """
    def is_valid(row, col, num):
        """检查填入数字是否合法"""
        for i in range(9):
            # 检查行
            if board[row][i] == num:
                return False
            
            # 检查列
            if board[i][col] == num:
                return False
            
            # 检查 3×3 宫
            box_row = 3 * (row // 3) + i // 3
            box_col = 3 * (col // 3) + i % 3
            if board[box_row][box_col] == num:
                return False
        
        return True
    
    def backtrack():
        # 遍历棋盘
        for row in range(9):
            for col in range(9):
                # 找到空格
                if board[row][col] == '.':
                    # 尝试填入 1-9
                    for num in '123456789':
                        if is_valid(row, col, num):
                            # 做选择
                            board[row][col] = num
                            
                            # 递归
                            if backtrack():
                                return True
                            
                            # 撤销选择（回溯）
                            board[row][col] = '.'
                    
                    # 1-9 都试过了，无解
                    return False
        
        # 所有格子都填好了
        return True
    
    return backtrack()

# 示例
board = [
    ['5', '3', '.', '.', '7', '.', '.', '.', '.'],
    ['6', '.', '.', '1', '9', '5', '.', '.', '.'],
    ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
    ['8', '.', '.', '.', '6', '.', '.', '.', '3'],
    ['4', '.', '.', '8', '.', '3', '.', '.', '1'],
    ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
    ['.', '6', '.', '.', '.', '.', '2', '8', '.'],
    ['.', '.', '.', '4', '1', '9', '.', '.', '5'],
    ['.', '.', '.', '.', '8', '.', '.', '7', '9']
]

solve_sudoku(board)
# 输出求解后的数独
```

---

## 5. 分治经典问题

### 5.1 最大子数组和

```python
def max_subarray_divide_conquer(nums):
    """
    最大子数组和（分治算法）
    
    问题描述：
    给定一个整数数组，找到和最大的连续子数组
    
    分治思想：
    1. 分解：将数组分成两半
    2. 解决：
       - 最大子数组在左半
       - 最大子数组在右半
       - 最大子数组跨越中点
    3. 合并：取三者最大值
    
    时间复杂度：O(n log n)
    空间复杂度：O(log n)
    
    参数:
        nums: 输入数组
    
    返回:
        最大子数组和
    """
    def cross_sum(left, right, mid):
        """计算跨越中点的最大和"""
        if left == right:
            return nums[left]
        
        # 左半部分最大和（必须包含 mid）
        left_sum = float('-inf')
        curr_sum = 0
        for i in range(mid, left - 1, -1):
            curr_sum += nums[i]
            left_sum = max(left_sum, curr_sum)
        
        # 右半部分最大和（必须包含 mid+1）
        right_sum = float('-inf')
        curr_sum = 0
        for i in range(mid + 1, right + 1):
            curr_sum += nums[i]
            right_sum = max(right_sum, curr_sum)
        
        return left_sum + right_sum
    
    def divide_and_conquer(left, right):
        # 终止条件
        if left == right:
            return nums[left]
        
        # 分解
        mid = (left + right) // 2
        
        # 解决
        left_max = divide_and_conquer(left, mid)
        right_max = divide_and_conquer(mid + 1, right)
        cross_max = cross_sum(left, right, mid)
        
        # 合并
        return max(left_max, right_max, cross_max)
    
    return divide_and_conquer(0, len(nums) - 1)

# 示例
nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print(max_subarray_divide_conquer(nums))  # 输出：6（子数组 [4,-1,2,1]）
```

### 5.2 多数组第 K 小元素

```python
def find_kth_smallest(nums, k):
    """
    查找第 K 小元素（快速选择算法）
    
    问题描述：
    在未排序数组中找到第 k 小的元素
    
    分治思想：
    1. 选择一个基准值
    2. 分区
    3. 根据 k 的位置决定在左半还是右半继续
    
    时间复杂度：
    - 平均：O(n)
    - 最坏：O(n²)
    
    空间复杂度：O(log n)
    
    参数:
        nums: 输入数组
        k: 第 k 小（从 1 开始）
    
    返回:
        第 k 小的元素
    """
    def partition(left, right, pivot_idx):
        """分区"""
        pivot = nums[pivot_idx]
        
        # 将 pivot 移到末尾
        nums[pivot_idx], nums[right] = nums[right], nums[pivot_idx]
        
        store_idx = left
        for i in range(left, right):
            if nums[i] < pivot:
                nums[store_idx], nums[i] = nums[i], nums[store_idx]
                store_idx += 1
        
        # 将 pivot 移到正确位置
        nums[right], nums[store_idx] = nums[store_idx], nums[right]
        
        return store_idx
    
    def select(left, right, k_smallest):
        """快速选择"""
        if left == right:
            return nums[left]
        
        # 选择基准（这里简单选择第一个）
        pivot_idx = left
        
        # 分区
        pivot_idx = partition(left, right, pivot_idx)
        
        # 根据 k 的位置决定
        if k_smallest == pivot_idx:
            return nums[k_smallest]
        elif k_smallest < pivot_idx:
            return select(left, pivot_idx - 1, k_smallest)
        else:
            return select(pivot_idx + 1, right, k_smallest)
    
    return select(0, len(nums) - 1, k - 1)

# 示例
nums = [3, 2, 1, 5, 6, 4]
print(find_kth_smallest(nums, 2))  # 输出：2（第 2 小）
```

### 5.3 棋盘覆盖问题

```python
def chessboard_cover(n, special_row, special_col):
    """
    棋盘覆盖问题
    
    问题描述：
    2^n × 2^n 的棋盘，有一个特殊格子
    用 L 型骨牌覆盖所有其他格子
    
    分治思想：
    1. 将棋盘分成 4 个 2^(n-1) × 2^(n-1) 的子棋盘
    2. 特殊格子在其中一个子棋盘
    3. 在中心放置一个 L 型骨牌，使其他三个子棋盘各有一个特殊格子
    4. 递归处理四个子棋盘
    
    参数:
        n: 棋盘大小为 2^n × 2^n
        special_row: 特殊格子行
        special_col: 特殊格子列
    """
    board = [[0] * (2 ** n) for _ in range(2 ** n)]
    tile = [1]  # 骨牌编号（使用列表以便在递归中修改）
    
    def cover(top_row, left_col, size, spec_row, spec_col):
        """
        覆盖棋盘
        
        参数:
            top_row: 当前棋盘左上角行
            left_col: 当前棋盘左上角列
            size: 当前棋盘大小
            spec_row: 特殊格子行
            spec_col: 特殊格子列
        """
        if size == 1:
            return
        
        half = size // 2
        current_tile = tile[0]
        tile[0] += 1
        
        # 特殊格子在左上子棋盘
        if spec_row < top_row + half and spec_col < left_col + half:
            cover(top_row, left_col, half, spec_row, spec_col)
        else:
            # 在中心放置骨牌
            board[top_row + half - 1][left_col + half - 1] = current_tile
            cover(top_row, left_col, half, 
                  top_row + half - 1, left_col + half - 1)
        
        # 特殊格子在右上子棋盘
        if spec_row < top_row + half and spec_col >= left_col + half:
            cover(top_row, left_col + half, half, spec_row, spec_col)
        else:
            board[top_row + half - 1][left_col + half] = current_tile
            cover(top_row, left_col + half, half,
                  top_row + half - 1, left_col + half)
        
        # 特殊格子在左下子棋盘
        if spec_row >= top_row + half and spec_col < left_col + half:
            cover(top_row + half, left_col, half, spec_row, spec_col)
        else:
            board[top_row + half][left_col + half - 1] = current_tile
            cover(top_row + half, left_col, half,
                  top_row + half, left_col + half - 1)
        
        # 特殊格子在右下子棋盘
        if spec_row >= top_row + half and spec_col >= left_col + half:
            cover(top_row + half, left_col + half, half, spec_row, spec_col)
        else:
            board[top_row + half][left_col + half] = current_tile
            cover(top_row + half, left_col + half, half,
                  top_row + half, left_col + half)
    
    cover(0, 0, 2 ** n, special_row, special_col)
    return board

# 示例：n=2，特殊格子在 (1, 1)
board = chessboard_cover(2, 1, 1)
for row in board:
    print(row)
```

---

## 📝 练习题

### 基础题

1. **阶乘计算**：实现递归和迭代两个版本的阶乘函数

2. **斐波那契数列**：实现记忆化递归版本

3. **二分查找**：实现递归版本的二分查找

### 进阶题

4. **汉诺塔**：实现汉诺塔问题，打印移动步骤

5. **全排列**：实现数组的全排列

6. **N 皇后**：实现 N 皇后问题，返回所有解法

### 挑战题

7. **数独求解**：实现数独求解器

8. **最大子数组和**：使用分治算法实现

9. **第 K 小元素**：实现快速选择算法

---

## 🔗 参考资料

### 经典书籍
- 📚 《算法导论》第 2-4 章：递归与分治
- 📚 《数据结构与算法分析》第 10 章：算法设计技巧
- 📚 《剑指 Offer》递归相关题目

### 在线资源
- 🔗 [VisuAlgo 递归可视化](https://visualgo.net/en/recursion)
- 🔗 [LeetCode 递归专题](https://leetcode.com/tag/recursion/)
- 🔗 [LeetCode 回溯专题](https://leetcode.com/tag/backtracking/)
- 🔗 [LeetCode 分治专题](https://leetcode.com/tag/divide-and-conquer/)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 递归基础 | ⭐⭐⭐⭐⭐ | 熟练手写 |
| 分治思想 | ⭐⭐⭐⭐⭐ | 理解并应用 |
| 回溯算法 | ⭐⭐⭐⭐⭐ | 熟练手写框架 |
| 记忆化优化 | ⭐⭐⭐⭐ | 理解并应用 |
| 经典问题 | ⭐⭐⭐⭐ | 理解思路 |

---

**上一章：** [查找算法](/data-structure-algorithm/algorithm/searching)  
**下一章：** [贪心算法](/data-structure-algorithm/algorithm/greedy)

**最后更新**：2026-03-13
