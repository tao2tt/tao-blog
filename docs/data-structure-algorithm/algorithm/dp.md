# 动态规划

> 学习日期：2026-03-13  
> 状态：📝 学习中  
> 预计完成：2026-06-05  
> 难度：⭐⭐⭐⭐⭐  
> 前置知识：[递归与分治](/data-structure-algorithm/algorithm/recursion)、[贪心算法](/data-structure-algorithm/algorithm/greedy)

---

## 📚 目录

[[toc]]

---

## 1. 动态规划基础

### 1.1 什么是动态规划

**动态规划（Dynamic Programming，DP）** 是将复杂问题分解为更小的子问题，通过保存子问题的解来避免重复计算的算法思想。

**核心思想：** 记住已经解决过的子问题的答案

**通俗理解：**
```
动态规划 = 递归 + 记忆化

或者说：
动态规划 = 分治 + 重叠子问题 + 最优子结构
```

### 1.2 动态规划 vs 贪心 vs 分治

| 对比项 | 动态规划 | 贪心算法 | 分治算法 |
|--------|---------|---------|---------|
| **子问题** | 重叠子问题 | 无重叠 | 不重叠 |
| **选择策略** | 全局最优 | 局部最优 | 分别解决 |
| **回溯** | ✅ 会回溯 | ❌ 不回溯 | ❌ 不回溯 |
| **空间复杂度** | 通常 O(n) | O(1) | O(log n) |
| **典型问题** | 背包、LCS | 活动选择 | 归并排序 |

### 1.3 动态规划两要素

**动态规划问题必须满足：**

1. **最优子结构**
   - 问题的最优解包含子问题的最优解
   - 可以通过子问题的最优解构造原问题的最优解

2. **重叠子问题**
   - 子问题会被重复计算
   - 适合用记忆化或表格保存

### 1.4 动态规划解题步骤

```
动态规划五步法：

1. 定义状态
   - dp[i] 表示什么？
   - 状态如何表示问题？

2. 状态转移方程
   - 如何从已知状态推导未知状态？
   - dp[i] = f(dp[i-1], dp[i-2], ...)

3. 初始条件
   - 边界情况是什么？
   - dp[0] = ? dp[1] = ?

4. 计算顺序
   - 从前往后？从后往前？
   - 如何保证计算 dp[i] 时所需状态已知？

5. 返回结果
   - 返回 dp[n]？dp[n-1]？max(dp)？
```

### 1.5 斐波那契数列（DP 入门）

```python
def fibonacci_dp(n):
    """
    斐波那契数列（动态规划）
    
    问题：
    F(0) = 0, F(1) = 1
    F(n) = F(n-1) + F(n-2)
    
    动态规划五步法：
    1. 定义状态：dp[i] 表示第 i 个斐波那契数
    2. 状态转移：dp[i] = dp[i-1] + dp[i-2]
    3. 初始条件：dp[0] = 0, dp[1] = 1
    4. 计算顺序：从前往后
    5. 返回结果：dp[n]
    
    时间复杂度：O(n)
    空间复杂度：O(n)
    """
    if n <= 1:
        return n
    
    # 1. 定义状态
    dp = [0] * (n + 1)
    
    # 3. 初始条件
    dp[0] = 0
    dp[1] = 1
    
    # 4. 计算顺序：从前往后
    for i in range(2, n + 1):
        # 2. 状态转移
        dp[i] = dp[i - 1] + dp[i - 2]
    
    # 5. 返回结果
    return dp[n]

# 空间优化版
def fibonacci_optimized(n):
    """
    斐波那契数列（空间优化）
    
    观察：
    dp[i] 只依赖 dp[i-1] 和 dp[i-2]
    不需要保存整个数组
    
    空间复杂度：O(1)
    """
    if n <= 1:
        return n
    
    prev2 = 0  # dp[i-2]
    prev1 = 1  # dp[i-1]
    
    for i in range(2, n + 1):
        curr = prev1 + prev2
        prev2 = prev1
        prev1 = curr
    
    return prev1

# 示例
print(fibonacci_dp(10))        # 输出：55
print(fibonacci_optimized(10)) # 输出：55
```

---

## 2. 背包问题

### 2.1 0-1 背包问题

```python
def knapsack_01(weights, values, capacity):
    """
    0-1 背包问题
    
    问题描述：
    有 n 个物品，每个物品有重量 weight[i] 和价值 value[i]
    背包容量为 capacity
    每个物品只能选或不选（0-1）
    求能装入的最大价值
    
    动态规划五步法：
    1. 定义状态：dp[i][w] 表示前 i 个物品，容量为 w 时的最大价值
    2. 状态转移：
       - 不选第 i 个：dp[i][w] = dp[i-1][w]
       - 选第 i 个：dp[i][w] = dp[i-1][w-weight[i]] + value[i]
       - 取最大值：dp[i][w] = max(不选，选)
    3. 初始条件：dp[0][w] = 0（没有物品）
    4. 计算顺序：从前往后
    5. 返回结果：dp[n][capacity]
    
    时间复杂度：O(n * capacity)
    空间复杂度：O(n * capacity)
    
    参数:
        weights: 物品重量列表
        values: 物品价值列表
        capacity: 背包容量
    
    返回:
        最大价值
    """
    n = len(weights)
    
    # 1. 定义状态
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    # 4. 计算顺序
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            # 不选第 i 个物品
            dp[i][w] = dp[i - 1][w]
            
            # 选第 i 个物品（如果装得下）
            if w >= weights[i - 1]:
                dp[i][w] = max(
                    dp[i][w],
                    dp[i - 1][w - weights[i - 1]] + values[i - 1]
                )
    
    # 5. 返回结果
    return dp[n][capacity]

# 示例
weights = [2, 3, 4, 5]
values = [3, 4, 5, 6]
capacity = 8

# 最优解：选物品 0、1、3（重量 2+3+5=10>8，不行）
# 最优解：选物品 1、3（重量 3+5=8，价值 4+6=10）
# 或选物品 0、2（重量 2+4=6，价值 3+5=8）
# 或选物品 0、1、2（重量 2+3+4=9>8，不行）

print(knapsack_01(weights, values, capacity))  # 输出：10
```

**空间优化版（一维数组）：**

```python
def knapsack_01_optimized(weights, values, capacity):
    """
    0-1 背包问题（空间优化）
    
    观察：
    dp[i][w] 只依赖 dp[i-1][...]
    可以用一维数组
    
    注意：
    内层循环要从后往前遍历
    避免同一物品被选多次
    
    空间复杂度：O(capacity)
    """
    n = len(weights)
    
    # 一维 dp 数组
    dp = [0] * (capacity + 1)
    
    for i in range(n):
        # 从后往前遍历（重要！）
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    
    return dp[capacity]

# 示例
weights = [2, 3, 4, 5]
values = [3, 4, 5, 6]
capacity = 8

print(knapsack_01_optimized(weights, values, capacity))  # 输出：10
```

### 2.2 完全背包问题

```python
def knapsack_complete(weights, values, capacity):
    """
    完全背包问题
    
    问题描述：
    与 0-1 背包类似，但每个物品可以选无限次
    
    动态规划：
    1. 定义状态：dp[w] 表示容量为 w 时的最大价值
    2. 状态转移：dp[w] = max(dp[w], dp[w-weight[i]] + value[i])
    3. 初始条件：dp[0] = 0
    4. 计算顺序：从前往后（与 0-1 背包相反！）
    5. 返回结果：dp[capacity]
    
    时间复杂度：O(n * capacity)
    空间复杂度：O(capacity)
    
    参数:
        weights: 物品重量列表
        values: 物品价值列表
        capacity: 背包容量
    
    返回:
        最大价值
    """
    n = len(weights)
    dp = [0] * (capacity + 1)
    
    for i in range(n):
        # 从前往后遍历（允许重复选择）
        for w in range(weights[i], capacity + 1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    
    return dp[capacity]

# 示例
weights = [2, 3, 4]
values = [3, 4, 5]
capacity = 10

# 最优解：选 5 个物品 0（重量 10，价值 15）
# 或选 3 个物品 1 + 1 个物品 0（重量 11>10，不行）

print(knapsack_complete(weights, values, capacity))  # 输出：15
```

### 2.3 背包问题对比

| 问题类型 | 物品数量 | 遍历顺序 | 状态转移 |
|---------|---------|---------|---------|
| **0-1 背包** | 1 次 | 从后往前 | dp[w] = max(dp[w], dp[w-w[i]]+v[i]) |
| **完全背包** | 无限次 | 从前往后 | dp[w] = max(dp[w], dp[w-w[i]]+v[i]) |
| **多重背包** | 有限次 | 分解为 0-1 背包 | 二进制分解 |

---

## 3. 子序列问题

### 3.1 最长递增子序列（LIS）

```python
def length_of_lis(nums):
    """
    最长递增子序列
    
    LeetCode 300. 最长递增子序列
    
    问题描述：
    给定一个无序数组，找到最长递增子序列的长度
    子序列不要求连续
    
    动态规划：
    1. 定义状态：dp[i] 表示以 nums[i] 结尾的 LIS 长度
    2. 状态转移：dp[i] = max(dp[j] + 1)，其中 j < i 且 nums[j] < nums[i]
    3. 初始条件：dp[i] = 1（每个元素本身是一个 LIS）
    4. 计算顺序：从前往后
    5. 返回结果：max(dp)
    
    时间复杂度：O(n²)
    空间复杂度：O(n)
    
    参数:
        nums: 输入数组
    
    返回:
        LIS 长度
    """
    if not nums:
        return 0
    
    n = len(nums)
    
    # 1. 定义状态
    dp = [1] * n
    
    # 4. 计算顺序
    for i in range(n):
        # 2. 状态转移
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    
    # 5. 返回结果
    return max(dp)

# 示例
nums = [10, 9, 2, 5, 3, 7, 101, 18]
# LIS: [2, 3, 7, 18] 或 [2, 3, 7, 101]
# 长度：4

print(length_of_lis(nums))  # 输出：4
```

**优化版（二分查找，O(n log n)）：**

```python
def length_of_lis_optimized(nums):
    """
    最长递增子序列（二分查找优化）
    
    思路：
    维护一个 tails 数组
    tails[i] 表示长度为 i+1 的 LIS 的最小末尾元素
    
    时间复杂度：O(n log n)
    空间复杂度：O(n)
    """
    if not nums:
        return 0
    
    tails = []
    
    for num in nums:
        # 二分查找第一个 >= num 的位置
        left, right = 0, len(tails)
        while left < right:
            mid = (left + right) // 2
            if tails[mid] < num:
                left = mid + 1
            else:
                right = mid
        
        # 如果没找到，添加到末尾
        if left == len(tails):
            tails.append(num)
        else:
            # 否则替换
            tails[left] = num
    
    return len(tails)

# 示例
nums = [10, 9, 2, 5, 3, 7, 101, 18]
print(length_of_lis_optimized(nums))  # 输出：4
```

### 3.2 最长公共子序列（LCS）

```python
def longest_common_subsequence(text1, text2):
    """
    最长公共子序列
    
    LeetCode 1143. 最长公共子序列
    
    问题描述：
    给定两个字符串，找到它们的最长公共子序列
    子序列不要求连续
    
    动态规划：
    1. 定义状态：dp[i][j] 表示 text1[:i] 和 text2[:j] 的 LCS 长度
    2. 状态转移：
       - 如果 text1[i-1] == text2[j-1]：dp[i][j] = dp[i-1][j-1] + 1
       - 否则：dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    3. 初始条件：dp[0][j] = 0, dp[i][0] = 0
    4. 计算顺序：从前往后
    5. 返回结果：dp[m][n]
    
    时间复杂度：O(m * n)
    空间复杂度：O(m * n)
    
    参数:
        text1: 字符串 1
        text2: 字符串 2
    
    返回:
        LCS 长度
    """
    m, n = len(text1), len(text2)
    
    # 1. 定义状态
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # 4. 计算顺序
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            # 2. 状态转移
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    
    # 5. 返回结果
    return dp[m][n]

# 示例
text1 = "abcde"
text2 = "ace"
# LCS: "ace"
# 长度：3

print(longest_common_subsequence(text1, text2))  # 输出：3

text1 = "abc"
text2 = "def"
# LCS: ""
# 长度：0

print(longest_common_subsequence(text1, text2))  # 输出：0
```

### 3.3 编辑距离

```python
def min_distance(word1, word2):
    """
    编辑距离
    
    LeetCode 72. 编辑距离
    
    问题描述：
    给定两个单词，计算将 word1 转换成 word2 所需的最少操作数
    操作包括：插入、删除、替换一个字符
    
    动态规划：
    1. 定义状态：dp[i][j] 表示 word1[:i] 转换成 word2[:j] 的最少操作数
    2. 状态转移：
       - 如果 word1[i-1] == word2[j-1]：dp[i][j] = dp[i-1][j-1]
       - 否则：dp[i][j] = 1 + min(
           dp[i-1][j],    # 删除
           dp[i][j-1],    # 插入
           dp[i-1][j-1]   # 替换
         )
    3. 初始条件：dp[i][0] = i, dp[0][j] = j
    4. 计算顺序：从前往后
    5. 返回结果：dp[m][n]
    
    时间复杂度：O(m * n)
    空间复杂度：O(m * n)
    
    参数:
        word1: 单词 1
        word2: 单词 2
    
    返回:
        最少操作数
    """
    m, n = len(word1), len(word2)
    
    # 1. 定义状态
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # 3. 初始条件
    for i in range(m + 1):
        dp[i][0] = i  # 删除 i 个字符
    for j in range(n + 1):
        dp[0][j] = j  # 插入 j 个字符
    
    # 4. 计算顺序
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            # 2. 状态转移
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],    # 删除
                    dp[i][j - 1],    # 插入
                    dp[i - 1][j - 1] # 替换
                )
    
    # 5. 返回结果
    return dp[m][n]

# 示例
word1 = "horse"
word2 = "ros"
# 转换过程：
# horse → rorse (h→r，替换)
# rorse → rorse (删除 r)
# rorse → ros (删除 e)
# 操作数：3

print(min_distance(word1, word2))  # 输出：3

word1 = "intention"
word2 = "execution"
print(min_distance(word1, word2))  # 输出：5
```

---

## 4. 区间 DP

### 4.1 最长回文子序列

```python
def longest_palindromic_subsequence(s):
    """
    最长回文子序列
    
    LeetCode 516. 最长回文子序列
    
    问题描述：
    给定一个字符串，找到最长回文子序列的长度
    子序列不要求连续
    
    区间 DP：
    1. 定义状态：dp[i][j] 表示 s[i:j+1] 的最长回文子序列长度
    2. 状态转移：
       - 如果 s[i] == s[j]：dp[i][j] = dp[i+1][j-1] + 2
       - 否则：dp[i][j] = max(dp[i+1][j], dp[i][j-1])
    3. 初始条件：dp[i][i] = 1（单个字符是回文）
    4. 计算顺序：从短到长，从下到上
    5. 返回结果：dp[0][n-1]
    
    时间复杂度：O(n²)
    空间复杂度：O(n²)
    
    参数:
        s: 输入字符串
    
    返回:
        最长回文子序列长度
    """
    n = len(s)
    
    # 1. 定义状态
    dp = [[0] * n for _ in range(n)]
    
    # 3. 初始条件
    for i in range(n):
        dp[i][i] = 1
    
    # 4. 计算顺序：从短到长
    for length in range(2, n + 1):  # 子串长度
        for i in range(n - length + 1):
            j = i + length - 1
            
            # 2. 状态转移
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    
    # 5. 返回结果
    return dp[0][n - 1]

# 示例
s = "bbbab"
# 最长回文子序列："bbbb"
# 长度：4

print(longest_palindromic_subsequence(s))  # 输出：4

s = "cbbd"
# 最长回文子序列："bb"
# 长度：2

print(longest_palindromic_subsequence(s))  # 输出：2
```

### 4.2 矩阵链乘法

```python
def matrix_chain_order(dimensions):
    """
    矩阵链乘法
    
    问题描述：
    给定 n 个矩阵的维度，找到最优的乘法顺序
    使得标量乘法次数最少
    
    矩阵 A(i) 的维度：dimensions[i-1] × dimensions[i]
    
    区间 DP：
    1. 定义状态：dp[i][j] 表示计算 A(i)...A(j) 的最少乘法次数
    2. 状态转移：dp[i][j] = min(dp[i][k] + dp[k+1][j] + dimensions[i-1]*dimensions[k]*dimensions[j])
    3. 初始条件：dp[i][i] = 0（单个矩阵无需乘法）
    4. 计算顺序：从短到长
    5. 返回结果：dp[1][n]
    
    时间复杂度：O(n³)
    空间复杂度：O(n²)
    
    参数:
        dimensions: 维度数组，长度为 n+1
    
    返回:
        最少乘法次数
    """
    n = len(dimensions) - 1  # 矩阵数量
    
    # 1. 定义状态
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    
    # 4. 计算顺序：从短到长
    for length in range(2, n + 1):  # 链长度
        for i in range(1, n - length + 2):
            j = i + length - 1
            dp[i][j] = float('inf')
            
            # 尝试所有分割点
            for k in range(i, j):
                # 2. 状态转移
                cost = dp[i][k] + dp[k + 1][j] + dimensions[i - 1] * dimensions[k] * dimensions[j]
                dp[i][j] = min(dp[i][j], cost)
    
    # 5. 返回结果
    return dp[1][n]

# 示例
# 矩阵：A1(10×20), A2(20×30), A3(30×40)
dimensions = [10, 20, 30, 40]

# 方案 1：(A1×A2)×A3
# A1×A2: 10×20×30 = 6000
# 结果×A3: 10×30×40 = 12000
# 总计：18000

# 方案 2：A1×(A2×A3)
# A2×A3: 20×30×40 = 24000
# A1×结果：10×20×40 = 8000
# 总计：32000

# 最优：方案 1，18000 次

print(matrix_chain_order(dimensions))  # 输出：18000
```

---

## 5. 树形 DP

### 5.1 二叉树最大路径和

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def max_path_sum(root):
    """
    二叉树最大路径和
    
    LeetCode 124. 二叉树中的最大路径和
    
    问题描述：
    给定一个二叉树，找到路径和的最大值
    路径可以从任意节点开始和结束
    
    树形 DP：
    1. 定义状态：
       - 返回值：从当前节点向下的最大路径和
       - 全局变量：记录最大路径和
    2. 状态转移：
       - 左子树贡献：max(0, dfs(left))
       - 右子树贡献：max(0, dfs(right))
       - 当前路径和：node.val + 左贡献 + 右贡献
    3. 初始条件：空节点返回 0
    4. 计算顺序：后序遍历
    5. 返回结果：全局最大值
    
    时间复杂度：O(n)
    空间复杂度：O(h)
    
    参数:
        root: 二叉树根节点
    
    返回:
        最大路径和
    """
    max_sum = float('-inf')
    
    def dfs(node):
        nonlocal max_sum
        
        if node is None:
            return 0
        
        # 递归计算左右子树
        left_gain = max(0, dfs(node.left))
        right_gain = max(0, dfs(node.right))
        
        # 当前节点作为路径顶点的最大路径和
        current_path_sum = node.val + left_gain + right_gain
        
        # 更新全局最大值
        max_sum = max(max_sum, current_path_sum)
        
        # 返回从当前节点向下的最大路径和（只能选一边）
        return node.val + max(left_gain, right_gain)
    
    dfs(root)
    return max_sum

# 示例
#       -10
#       / \
#      9  20
#        /  \
#       15   7
# 
# 最大路径：15 → 20 → 7
# 路径和：42

root = TreeNode(-10)
root.left = TreeNode(9)
root.right = TreeNode(20)
root.right.left = TreeNode(15)
root.right.right = TreeNode(7)

print(max_path_sum(root))  # 输出：42
```

### 5.2 打家劫舍 III

```python
def rob(root):
    """
    打家劫舍 III
    
    LeetCode 337. 打家劫舍 III
    
    问题描述：
    二叉树表示房屋，相邻房屋不能同时偷
    求能偷到的最大金额
    
    树形 DP：
    1. 定义状态：
       - 返回值：[不偷当前节点的最大金额，偷当前节点的最大金额]
    2. 状态转移：
       - 不偷当前：max(左偷，左不偷) + max(右偷，右不偷)
       - 偷当前：当前值 + 左不偷 + 右不偷
    3. 初始条件：空节点返回 [0, 0]
    4. 计算顺序：后序遍历
    5. 返回结果：max(不偷，偷)
    
    时间复杂度：O(n)
    空间复杂度：O(h)
    
    参数:
        root: 二叉树根节点
    
    返回:
        最大金额
    """
    def dfs(node):
        """
        返回：[不偷当前节点的最大金额，偷当前节点的最大金额]
        """
        if node is None:
            return [0, 0]
        
        # 递归
        left = dfs(node.left)
        right = dfs(node.right)
        
        # 不偷当前节点：左右子节点可以偷或不偷
        not_rob = max(left[0], left[1]) + max(right[0], right[1])
        
        # 偷当前节点：左右子节点不能偷
        rob = node.val + left[0] + right[0]
        
        return [not_rob, rob]
    
    result = dfs(root)
    return max(result[0], result[1])

# 示例
#       3
#      / \
#     2   3
#      \   \
#       3   1
# 
# 最优：偷 3（根）+ 3（左子右）+ 1（右子右）= 7

root = TreeNode(3)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.left.right = TreeNode(3)
root.right.right = TreeNode(1)

print(rob(root))  # 输出：7
```

---

## 6. 实战案例

### 6.1 零钱兑换

```python
def coin_change(coins, amount):
    """
    零钱兑换
    
    LeetCode 322. 零钱兑换
    
    问题描述：
    给定不同面额的硬币和总金额
    计算凑成总金额所需的最少硬币数
    无法凑成返回 -1
    
    动态规划：
    1. 定义状态：dp[i] 表示凑成金额 i 所需的最少硬币数
    2. 状态转移：dp[i] = min(dp[i - coin] + 1)，遍历所有硬币
    3. 初始条件：dp[0] = 0
    4. 计算顺序：从前往后
    5. 返回结果：dp[amount]
    
    时间复杂度：O(amount * n)
    空间复杂度：O(amount)
    
    参数:
        coins: 硬币面额列表
        amount: 总金额
    
    返回:
        最少硬币数，无法凑成返回 -1
    """
    # 初始化 dp 数组
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    # 计算每个金额
    for i in range(1, amount + 1):
        for coin in coins:
            if i >= coin:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1

# 示例
coins = [1, 2, 5]
amount = 11
# 最优：5 + 5 + 1 = 11
# 硬币数：3

print(coin_change(coins, amount))  # 输出：3

coins = [2]
amount = 3
# 无法凑成

print(coin_change(coins, amount))  # 输出：-1
```

### 6.2 分割等和子集

```python
def can_partition(nums):
    """
    分割等和子集
    
    LeetCode 416. 分割等和子集
    
    问题描述：
    给定一个只包含正整数的非空数组
    判断是否可以将这个数组分割成两个子集，使得两个子集的元素和相等
    
    动态规划（0-1 背包变种）：
    1. 如果总和是奇数，直接返回 False
    2. 目标：找到一个子集，和为 sum/2
    3. 定义状态：dp[i] 表示能否凑成和为 i
    4. 状态转移：dp[i] = dp[i] or dp[i - num]
    5. 初始条件：dp[0] = True
    
    时间复杂度：O(n * sum)
    空间复杂度：O(sum)
    
    参数:
        nums: 输入数组
    
    返回:
        是否可以分割
    """
    total = sum(nums)
    
    # 总和是奇数，无法平分
    if total % 2 != 0:
        return False
    
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    
    for num in nums:
        # 从后往前遍历（0-1 背包）
        for i in range(target, num - 1, -1):
            dp[i] = dp[i] or dp[i - num]
    
    return dp[target]

# 示例
nums = [1, 5, 11, 5]
# 总和：22，目标：11
# 子集 1：[1, 5, 5] = 11
# 子集 2：[11] = 11
# 可以分割

print(can_partition(nums))  # 输出：True

nums = [1, 2, 3, 5]
# 总和：11，奇数
# 无法分割

print(can_partition(nums))  # 输出：False
```

### 6.3 最大正方形

```python
def maximal_square(matrix):
    """
    最大正方形
    
    LeetCode 221. 最大正方形
    
    问题描述：
    给定一个由 '0' 和 '1' 组成的二维矩阵
    找到只包含 '1' 的最大正方形，返回其面积
    
    动态规划：
    1. 定义状态：dp[i][j] 表示以 (i,j) 为右下角的最大正方形边长
    2. 状态转移：
       - 如果 matrix[i][j] == '0'：dp[i][j] = 0
       - 如果 matrix[i][j] == '1'：dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1
    3. 初始条件：第一行和第一列直接复制
    4. 计算顺序：从前往后
    5. 返回结果：max(dp)²
    
    时间复杂度：O(m * n)
    空间复杂度：O(m * n)
    
    参数:
        matrix: 二维字符矩阵
    
    返回:
        最大正方形面积
    """
    if not matrix or not matrix[0]:
        return 0
    
    m, n = len(matrix), len(matrix[0])
    
    # 1. 定义状态
    dp = [[0] * n for _ in range(m)]
    max_side = 0
    
    # 4. 计算顺序
    for i in range(m):
        for j in range(n):
            if matrix[i][j] == '1':
                # 2. 状态转移
                if i == 0 or j == 0:
                    # 第一行或第一列
                    dp[i][j] = 1
                else:
                    dp[i][j] = min(
                        dp[i - 1][j],    # 上方
                        dp[i][j - 1],    # 左方
                        dp[i - 1][j - 1] # 左上方
                    ) + 1
                
                max_side = max(max_side, dp[i][j])
    
    # 5. 返回结果
    return max_side * max_side

# 示例
matrix = [
    ['1', '0', '1', '0', '0'],
    ['1', '0', '1', '1', '1'],
    ['1', '1', '1', '1', '1'],
    ['1', '0', '0', '1', '0']
]
# 最大正方形边长：2
# 面积：4

print(maximal_square(matrix))  # 输出：4
```

---

## 7. 动态规划总结

### 7.1 动态规划题型分类

| 题型 | 典型问题 | 状态定义 | 状态转移 |
|------|---------|---------|---------|
| **线性 DP** | 斐波那契、爬楼梯 | dp[i] | dp[i] = f(dp[i-1], dp[i-2]) |
| **背包 DP** | 0-1 背包、完全背包 | dp[i][w] | dp[i][w] = max(选，不选) |
| **区间 DP** | 最长回文子序列 | dp[i][j] | dp[i][j] = f(dp[i+1][j-1]) |
| **子序列 DP** | LIS、LCS | dp[i] | dp[i] = max(dp[j] + 1) |
| **树形 DP** | 打家劫舍 III | [不偷，偷] | 后序遍历 |
| **状态压缩 DP** | 旅行商问题 | dp[mask][i] | 位运算 |

### 7.2 动态规划优化技巧

| 优化方法 | 说明 | 适用场景 |
|---------|------|---------|
| **空间优化** | 滚动数组、一维化 | 状态只依赖前几个 |
| **记忆化搜索** | 递归 + 缓存 |  top-down 思路 |
| **状态压缩** | 位运算表示状态 | 状态数量少 |
| **四边形不等式** | 优化区间 DP | 特定区间 DP |
| **斜率优化** | 优化转移方程 | 特定形式转移 |

### 7.3 动态规划 vs 其他算法

```
算法选择指南：

1. 问题可以分解为重叠子问题
   → 动态规划

2. 问题具有贪心选择性质
   → 贪心算法（更高效）

3. 需要遍历所有可能解
   → 回溯/暴力搜索

4. 问题可以分解为独立子问题
   → 分治算法
```

---

## 📝 练习题

### 基础题

1. **爬楼梯**：n 阶楼梯，每次可以爬 1 或 2 阶，求多少种方法

2. **打家劫舍**：不能偷相邻房屋，求最大金额

3. **零钱兑换**：凑成总金额的最少硬币数

### 进阶题

4. **最长递增子序列**：求 LIS 长度

5. **最长公共子序列**：求两个字符串的 LCS

6. **编辑距离**：求两个单词的最少操作数

### 挑战题

7. **正则表达式匹配**：实现支持 '.' 和 '*' 的正则匹配

8. **戳气球**：戳破气球获得最大硬币数

9. **不同路径 II**：有障碍物的网格路径数

---

## 🔗 参考资料

### 经典书籍
- 📚 《算法导论》第 15 章：动态规划
- 📚 《数据结构与算法分析》第 10 章：算法设计技巧
- 📚 《剑指 Offer》动态规划相关题目

### 在线资源
- 🔗 [LeetCode 动态规划专题](https://leetcode.com/tag/dynamic-programming/)
- 🔗 [GeeksforGeeks 动态规划教程](https://www.geeksforgeeks.org/dynamic-programming/)
- 🔗 [OI Wiki 动态规划](https://oi-wiki.org/dp/)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 动态规划思想 | ⭐⭐⭐⭐⭐ | 理解本质 |
| 背包问题 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 子序列问题 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 区间 DP | ⭐⭐⭐⭐ | 理解掌握 |
| 树形 DP | ⭐⭐⭐⭐ | 理解掌握 |

---

**上一章：** [贪心算法](/data-structure-algorithm/algorithm/greedy)  
**下一章：** [回溯算法](/data-structure-algorithm/algorithm/backtracking)

**最后更新**：2026-03-13
