# 回溯算法

> 学习日期：2026-03-13  
> 状态：📝 学习中  
> 预计完成：2026-06-07  
> 难度：⭐⭐⭐⭐⭐  
> 前置知识：[递归与分治](/data-structure-algorithm/algorithm/recursion)、[动态规划](/data-structure-algorithm/algorithm/dp)

---

## 📚 目录

[[toc]]

---

## 1. 回溯算法基础

### 1.1 什么是回溯算法

**回溯算法（Backtracking）** 是一种通过探索所有可能的候选解来找出所有解的算法。如果候选解被确认不是一个有效的解（或者至少不是最后一个解），回溯算法会通过在上一步进行一些变化来丢弃该解，即"回溯"并尝试其他可能。

**核心思想：** 走不通就退回来，换一条路再试

**通俗理解：**
```
回溯 = 递归 + 剪枝

或者说：
回溯 = 深度优先搜索 + 状态重置
```

**生活案例：**
```
走迷宫：
1. 选择一个方向走
2. 如果走不通，退回到上一个路口
3. 换一个方向继续走
4. 重复直到找到出口
```

### 1.2 回溯 vs 递归 vs 动态规划

| 对比项 | 回溯算法 | 递归 | 动态规划 |
|--------|---------|------|---------|
| **目的** | 找出所有解 | 解决问题 | 找最优解 |
| **搜索方式** | DFS + 剪枝 | 函数调用自身 | 填表 |
| **状态重置** | ✅ 需要 | ❌ 不需要 | ❌ 不需要 |
| **时间复杂度** | 通常指数级 | 取决于问题 | 通常多项式 |
| **典型问题** | 排列组合、N 皇后 | 阶乘、斐波那契 | 背包、LCS |

### 1.3 回溯算法三要素

**回溯算法三要素：**

1. **路径（Path）**
   - 已经做出的选择
   - 当前已经走过的路径

2. **选择列表（Choices）**
   - 当前可以做的选择
   - 通常由路径推导出来

3. **结束条件（Base Case）**
   - 到达决策树底层
   - 无法再做选择

### 1.4 回溯算法框架

```python
def backtrack_template():
    """
    回溯算法通用模板
    
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
    
    return result
    """
    result = []
    
    def backtrack(path, choices):
        # 结束条件
        if is_done(path):
            result.append(path[:])  # 复制路径
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

### 1.5 回溯算法解题步骤

```
回溯算法五步法：

1. 画出决策树
   - 理解问题的选择过程
   - 明确每个节点的选择列表

2. 定义状态
   - 路径：已经做的选择
   - 选择列表：当前可以做的选择

3. 确定结束条件
   - 何时停止递归
   - 何时将路径加入结果

4. 实现选择与撤销
   - 做选择：修改状态
   - 撤销选择：恢复状态

5. 剪枝优化（可选）
   - 提前排除不可能的分支
   - 减少不必要的搜索
```

---

## 2. 排列组合问题

### 2.1 全排列

```python
def permute(nums):
    """
    全排列问题
    
    LeetCode 46. 全排列
    
    问题描述：
    给定一个不含重复数字的数组，返回所有可能的全排列
    
    回溯五步法：
    1. 决策树：每个位置可以选择任意未使用的数字
    2. 定义状态：
       - 路径：已经选择的数字
       - 选择列表：未使用的数字
    3. 结束条件：路径长度等于数组长度
    4. 选择与撤销：添加/移除数字
    5. 剪枝：使用过的数字不能再选
    
    时间复杂度：O(n!)
    空间复杂度：O(n)
    
    参数:
        nums: 输入数组
    
    返回:
        所有全排列
    """
    result = []
    
    def backtrack(path, used):
        # 3. 结束条件
        if len(path) == len(nums):
            result.append(path[:])  # 复制路径
            return
        
        # 遍历所有选择
        for i in range(len(nums)):
            # 5. 剪枝：已使用的数字不能选
            if used[i]:
                continue
            
            # 4. 做选择
            path.append(nums[i])
            used[i] = True
            
            # 递归
            backtrack(path, used)
            
            # 4. 撤销选择
            path.pop()
            used[i] = False
    
    backtrack([], [False] * len(nums))
    return result

# 示例
nums = [1, 2, 3]
result = permute(nums)
# 输出：
# [
#   [1, 2, 3], [1, 3, 2],
#   [2, 1, 3], [2, 3, 1],
#   [3, 1, 2], [3, 2, 1]
# ]
print(result)
```

### 2.2 全排列 II（含重复元素）

```python
def permute_unique(nums):
    """
    全排列 II（含重复元素）
    
    LeetCode 47. 全排列 II
    
    问题描述：
    给定一个可包含重复数字的数组，返回所有不重复的全排列
    
    剪枝优化：
    1. 先排序，使相同元素相邻
    2. 同一层中，相同元素只能选一次
    
    时间复杂度：O(n! / k!)，k 为重复元素个数
    空间复杂度：O(n)
    
    参数:
        nums: 输入数组（可能含重复）
    
    返回:
        所有不重复的全排列
    """
    result = []
    nums.sort()  # 排序，使相同元素相邻
    
    def backtrack(path, used):
        # 结束条件
        if len(path) == len(nums):
            result.append(path[:])
            return
        
        for i in range(len(nums)):
            # 已使用的不能选
            if used[i]:
                continue
            
            # 剪枝：同一层中，相同元素只能选一次
            # i > 0 and nums[i] == nums[i-1] and not used[i-1]
            # 表示当前元素与前一个相同，且前一个在同一层未被使用
            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                continue
            
            # 做选择
            path.append(nums[i])
            used[i] = True
            
            # 递归
            backtrack(path, used)
            
            # 撤销选择
            path.pop()
            used[i] = False
    
    backtrack([], [False] * len(nums))
    return result

# 示例
nums = [1, 1, 2]
result = permute_unique(nums)
# 输出：
# [
#   [1, 1, 2], [1, 2, 1],
#   [2, 1, 1]
# ]
print(result)
```

### 2.3 组合

```python
def combine(n, k):
    """
    组合问题
    
    LeetCode 77. 组合
    
    问题描述：
    给定两个整数 n 和 k，返回 1 到 n 中所有可能的 k 个数的组合
    
    回溯五步法：
    1. 决策树：每个数字可以选或不选
    2. 定义状态：
       - 路径：已经选择的数字
       - 选择列表：剩余可选的数字
    3. 结束条件：路径长度等于 k
    4. 选择与撤销：添加/移除数字
    5. 剪枝：剩余数字不够时提前结束
    
    时间复杂度：O(C(n,k))
    空间复杂度：O(k)
    
    参数:
        n: 范围上限
        k: 组合大小
    
    返回:
        所有组合
    """
    result = []
    
    def backtrack(start, path):
        # 3. 结束条件
        if len(path) == k:
            result.append(path[:])
            return
        
        # 5. 剪枝优化
        # 剩余数字不够时，提前结束
        # 还需要 k - len(path) 个数字
        # 所以 i 最大为 n - (k - len(path)) + 1
        for i in range(start, n - (k - len(path)) + 2):
            # 4. 做选择
            path.append(i)
            
            # 递归（i+1，不能重复选）
            backtrack(i + 1, path)
            
            # 4. 撤销选择
            path.pop()
    
    backtrack(1, [])
    return result

# 示例
n = 4
k = 2
result = combine(n, k)
# 输出：
# [
#   [1, 2], [1, 3], [1, 4],
#   [2, 3], [2, 4],
#   [3, 4]
# ]
print(result)
```

### 2.4 组合总和

```python
def combination_sum(candidates, target):
    """
    组合总和
    
    LeetCode 39. 组合总和
    
    问题描述：
    给定一个无重复元素的数组和一个目标数
    找出所有可以使数字和为目标数的组合
    同一个数字可以无限制重复被选取
    
    回溯五步法：
    1. 决策树：每个数字可以选多次
    2. 定义状态：
       - 路径：已经选择的数字
       - 选择列表：剩余可选的数字
    3. 结束条件：路径和等于 target
    4. 选择与撤销：添加/移除数字
    5. 剪枝：路径和超过 target 时提前结束
    
    时间复杂度：O(S)，S 为所有解的长度之和
    空间复杂度：O(target)
    
    参数:
        candidates: 候选数字数组
        target: 目标和
    
    返回:
        所有组合
    """
    result = []
    
    def backtrack(start, path, total):
        # 3. 结束条件
        if total == target:
            result.append(path[:])
            return
        
        # 5. 剪枝：超过目标值，提前结束
        if total > target:
            return
        
        for i in range(start, len(candidates)):
            # 4. 做选择
            path.append(candidates[i])
            
            # 递归（i，可以重复选）
            backtrack(i, path, total + candidates[i])
            
            # 4. 撤销选择
            path.pop()
    
    backtrack(0, [], 0)
    return result

# 示例
candidates = [2, 3, 6, 7]
target = 7
result = combination_sum(candidates, target)
# 输出：
# [
#   [7],
#   [2, 2, 3]
# ]
print(result)
```

---

## 3. N 皇后问题

### 3.1 N 皇后

```python
def solve_n_queens(n):
    """
    N 皇后问题
    
    LeetCode 51. N 皇后
    
    问题描述：
    在 n×n 的棋盘上放置 n 个皇后
    使得它们互不攻击（不在同一行、列、对角线）
    返回所有可能的放置方案
    
    回溯五步法：
    1. 决策树：每行选择一个位置放置皇后
    2. 定义状态：
       - 路径：已经放置的皇后位置
       - 选择列表：当前行可以放置的列
    3. 结束条件：放置了 n 个皇后
    4. 选择与撤销：放置/移除皇后
    5. 剪枝：检查是否合法（列、对角线）
    
    时间复杂度：O(n!)
    空间复杂度：O(n)
    
    参数:
        n: 皇后数量
    
    返回:
        所有放置方案
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
        # 3. 结束条件
        if row == n:
            result.append([''.join(r) for r in board])
            return
        
        # 遍历当前行的所有列
        for col in range(n):
            # 5. 剪枝：检查是否安全
            if not is_safe(row, col):
                continue
            
            # 4. 做选择
            board[row][col] = 'Q'
            
            # 递归（下一行）
            backtrack(row + 1)
            
            # 4. 撤销选择
            board[row][col] = '.'
    
    backtrack(0)
    return result

# 示例
n = 4
result = solve_n_queens(n)
print(f"{n} 皇后有 {len(result)} 种解法")
# 输出：
# [
#   [".Q..", "...Q", "Q...", "..Q."],
#   ["..Q.", "Q...", "...Q", ".Q.."]
# ]
for solution in result:
    for row in solution:
        print(row)
    print()
```

### 3.2 N 皇后 II（只求数量）

```python
def total_n_queens(n):
    """
    N 皇后 II（只求数量）
    
    LeetCode 52. N 皇后 II
    
    问题描述：
    与 N 皇后相同，但只返回解的数量
    
    优化：
    使用集合记录已占用的列和对角线
    
    时间复杂度：O(n!)
    空间复杂度：O(n)
    
    参数:
        n: 皇后数量
    
    返回:
        解的数量
    """
    count = [0]
    
    # 记录已占用的列和对角线
    cols = set()
    diag1 = set()  # 主对角线（左上到右下）
    diag2 = set()  # 副对角线（右上到左下）
    
    def backtrack(row):
        if row == n:
            count[0] += 1
            return
        
        for col in range(n):
            # 计算对角线标识
            d1 = row - col  # 主对角线
            d2 = row + col  # 副对角线
            
            # 剪枝：检查是否冲突
            if col in cols or d1 in diag1 or d2 in diag2:
                continue
            
            # 做选择
            cols.add(col)
            diag1.add(d1)
            diag2.add(d2)
            
            # 递归
            backtrack(row + 1)
            
            # 撤销选择
            cols.remove(col)
            diag1.remove(d1)
            diag2.remove(d2)
    
    backtrack(0)
    return count[0]

# 示例
n = 4
print(total_n_queens(n))  # 输出：2

n = 8
print(total_n_queens(n))  # 输出：92
```

---

## 4. 数独问题

### 4.1 解数独

```python
def solve_sudoku(board):
    """
    解数独
    
    LeetCode 37. 解数独
    
    问题描述：
    给定一个部分填好的 9×9 数独棋盘
    填入剩余数字，使得每行、每列、每个 3×3 宫都包含 1-9
    
    回溯五步法：
    1. 决策树：每个空格可以填 1-9
    2. 定义状态：
       - 路径：已经填入的数字
       - 选择列表：当前空格可以填的数字
    3. 结束条件：所有空格都填满
    4. 选择与撤销：填入/擦除数字
    5. 剪枝：检查是否合法（行、列、宫）
    
    时间复杂度：O(9^(n*n))，n=9
    空间复杂度：O(n*n)
    
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
                            # 4. 做选择
                            board[row][col] = num
                            
                            # 递归
                            if backtrack():
                                return True
                            
                            # 4. 撤销选择（回溯）
                            board[row][col] = '.'
                    
                    # 1-9 都试过了，无解
                    return False
        
        # 所有格子都填好了
        return True
    
    backtrack()

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
for row in board:
    print(' '.join(row))
```

---

## 5. 子集问题

### 5.1 子集

```python
def subsets(nums):
    """
    子集问题（幂集）
    
    LeetCode 78. 子集
    
    问题描述：
    给定一个不含重复元素的数组，返回所有可能的子集
    
    回溯五步法：
    1. 决策树：每个元素可以选或不选
    2. 定义状态：
       - 路径：已经选择的元素
       - 选择列表：剩余可选的元素
    3. 结束条件：遍历完所有元素
    4. 选择与撤销：添加/移除元素
    5. 剪枝：无
    
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
            # 4. 做选择
            path.append(nums[i])
            
            # 递归
            backtrack(i + 1, path)
            
            # 4. 撤销选择（回溯）
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

### 5.2 子集 II（含重复元素）

```python
def subsets_with_dup(nums):
    """
    子集 II（含重复元素）
    
    LeetCode 90. 子集 II
    
    问题描述：
    给定一个可能包含重复元素的数组，返回所有不重复的子集
    
    剪枝优化：
    1. 先排序，使相同元素相邻
    2. 同一层中，相同元素只能选一次
    
    时间复杂度：O(2^n)
    空间复杂度：O(n)
    
    参数:
        nums: 输入数组（可能含重复）
    
    返回:
        所有不重复的子集
    """
    result = []
    nums.sort()  # 排序，使相同元素相邻
    
    def backtrack(start, path):
        # 每个节点都是一个子集
        result.append(path[:])
        
        for i in range(start, len(nums)):
            # 剪枝：同一层中，相同元素只能选一次
            if i > start and nums[i] == nums[i - 1]:
                continue
            
            # 做选择
            path.append(nums[i])
            
            # 递归
            backtrack(i + 1, path)
            
            # 撤销选择
            path.pop()
    
    backtrack(0, [])
    return result

# 示例
nums = [1, 2, 2]
result = subsets_with_dup(nums)
# 输出：
# [
#   [], [1], [1, 2], [1, 2, 2],
#   [2], [2, 2]
# ]
print(result)
```

---

## 6. 括号生成

### 6.1 括号生成

```python
def generate_parenthesis(n):
    """
    括号生成
    
    LeetCode 22. 括号生成
    
    问题描述：
    给定 n 对括号，生成所有有效的括号组合
    
    回溯五步法：
    1. 决策树：每个位置可以放左括号或右括号
    2. 定义状态：
       - 路径：已经放置的括号
       - 选择列表：可以放左括号或右括号
    3. 结束条件：放置了 2n 个括号
    4. 选择与撤销：添加/移除括号
    5. 剪枝：
       - 左括号数量 < n 时可以放左括号
       - 右括号数量 < 左括号数量时可以放右括号
    
    时间复杂度：O(4^n / √n)
    空间复杂度：O(n)
    
    参数:
        n: 括号对数
    
    返回:
        所有有效的括号组合
    """
    result = []
    
    def backtrack(path, left, right):
        # 3. 结束条件
        if len(path) == 2 * n:
            result.append(path)
            return
        
        # 5. 剪枝：可以放左括号
        if left < n:
            backtrack(path + '(', left + 1, right)
        
        # 5. 剪枝：可以放右括号
        if right < left:
            backtrack(path + ')', left, right + 1)
    
    backtrack('', 0, 0)
    return result

# 示例
n = 3
result = generate_parenthesis(n)
# 输出：
# [
#   "((()))", "(()())", "(())()",
#   "()(())", "()()()"
# ]
print(result)
```

---

## 7. 单词搜索

### 7.1 单词搜索

```python
def exist(board, word):
    """
    单词搜索
    
    LeetCode 79. 单词搜索
    
    问题描述：
    给定一个 m x n 二维字符网格和一个单词
    判断单词是否存在于网格中
    单词必须按照字母顺序，通过相邻的格子构成
    
    回溯五步法：
    1. 决策树：从每个格子开始，向四个方向搜索
    2. 定义状态：
       - 路径：已经匹配的字符
       - 选择列表：上下左右四个方向
    3. 结束条件：匹配完整个单词
    4. 选择与撤销：标记/取消标记已访问
    5. 剪枝：
       - 越界
       - 字符不匹配
       - 已访问过
    
    时间复杂度：O(m * n * 4^L)，L 为单词长度
    空间复杂度：O(L)
    
    参数:
        board: m x n 二维字符网格
        word: 目标单词
    
    返回:
        是否存在
    """
    m, n = len(board), len(board[0])
    
    def backtrack(row, col, index):
        # 3. 结束条件：匹配完整个单词
        if index == len(word):
            return True
        
        # 5. 剪枝：越界、字符不匹配、已访问
        if (row < 0 or row >= m or col < 0 or col >= n or
            board[row][col] != word[index]):
            return False
        
        # 4. 做选择：标记已访问
        temp = board[row][col]
        board[row][col] = '#'
        
        # 递归：向四个方向搜索
        found = (
            backtrack(row + 1, col, index + 1) or  # 下
            backtrack(row - 1, col, index + 1) or  # 上
            backtrack(row, col + 1, index + 1) or  # 右
            backtrack(row, col - 1, index + 1)     # 左
        )
        
        # 4. 撤销选择：恢复原字符
        board[row][col] = temp
        
        return found
    
    # 从每个格子开始搜索
    for i in range(m):
        for j in range(n):
            if backtrack(i, j, 0):
                return True
    
    return False

# 示例
board = [
    ['A', 'B', 'C', 'E'],
    ['S', 'F', 'C', 'S'],
    ['A', 'D', 'E', 'E']
]

word = "ABCCED"
print(exist(board, word))  # 输出：True

word = "SEE"
print(exist(board, word))  # 输出：True

word = "ABCB"
print(exist(board, word))  # 输出：False
```

---

## 8. 回溯算法总结

### 8.1 回溯算法适用场景

| 问题类型 | 是否适用回溯 | 说明 |
|---------|------------|------|
| **排列组合** | ✅ | 全排列、组合、子集 |
| **N 皇后** | ✅ | 放置问题 |
| **数独** | ✅ | 填数字问题 |
| **括号生成** | ✅ | 生成有效组合 |
| **单词搜索** | ✅ | 路径搜索 |
| **最短路径** | ❌ | BFS 更合适 |
| **最优化问题** | ❌ | 动态规划更合适 |

### 8.2 回溯算法优化技巧

| 优化方法 | 说明 | 适用场景 |
|---------|------|---------|
| **剪枝** | 提前排除不可能的分支 | 所有回溯问题 |
| **排序** | 使相同元素相邻，便于去重 | 含重复元素的问题 |
| **状态压缩** | 用位运算表示状态 | 状态数量少 |
| **记忆化** | 缓存已计算的状态 | 有重叠子问题 |
| **启发式搜索** | 优先搜索更可能的分支 | 大规模搜索 |

### 8.3 回溯 vs 其他算法

```
算法选择指南：

1. 需要找出所有解
   → 回溯算法

2. 需要找最优解
   → 动态规划或贪心

3. 需要找最短路径
   → BFS

4. 问题规模大，需要优化
   → 考虑剪枝、记忆化
```

---

## 📝 练习题

### 基础题

1. **全排列**：实现不含重复元素的全排列

2. **组合**：实现 1 到 n 中 k 个数的组合

3. **子集**：实现数组的所有子集

### 进阶题

4. **全排列 II**：实现含重复元素的全排列（去重）

5. **组合总和**：实现组合总和问题

6. **括号生成**：生成所有有效的括号组合

### 挑战题

7. **N 皇后**：实现 N 皇后问题，返回所有解法

8. **解数独**：实现数独求解器

9. **单词搜索**：实现二维网格中的单词搜索

---

## 🔗 参考资料

### 经典书籍
- 📚 《算法导论》第 11 章：回溯
- 📚 《数据结构与算法分析》第 10 章：算法设计技巧
- 📚 《剑指 Offer》回溯相关题目

### 在线资源
- 🔗 [LeetCode 回溯专题](https://leetcode.com/tag/backtracking/)
- 🔗 [GeeksforGeeks 回溯算法教程](https://www.geeksforgeeks.org/backtracking-algorithms/)
- 🔗 [OI Wiki 回溯](https://oi-wiki.org/search/backtracking/)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 回溯思想 | ⭐⭐⭐⭐⭐ | 理解本质 |
| 回溯框架 | ⭐⭐⭐⭐⭐ | 熟练手写 |
| 排列组合 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| N 皇后 | ⭐⭐⭐⭐ | 理解原理 |
| 剪枝优化 | ⭐⭐⭐⭐ | 理解掌握 |

---

**上一章：** [动态规划](/data-structure-algorithm/algorithm/dp)  
**下一章：** [复杂度分析](/data-structure-algorithm/basic/complexity)

**最后更新**：2026-03-13
