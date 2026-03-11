# 回溯算法

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-27  
> 难度：⭐⭐⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 回溯算法定义

**回溯算法：** 一种通过探索所有可能候选解来找出问题解的算法

**核心思想：** 试错法，发现当前路径不能得到解时，回退到上一步

**适用场景：**
- 组合问题
- 排列问题
- 切割问题
- 子集问题
- 棋盘问题（N 皇后、数独）

---

## 2. 回溯算法模板

```java
/**
 * 回溯算法通用模板
 */
public List<ResultType> result = new ArrayList<>();

public void backtrack(路径，选择列表) {
    // 终止条件
    if (满足终止条件) {
        result.add(路径);
        return;
    }
    
    // 遍历选择列表
    for (选择 : 选择列表) {
        // 做选择
        路径.add(选择);
        做出选择;
        
        // 递归
        backtrack(路径，选择列表);
        
        // 撤销选择（回溯）
        路径.remove(选择);
        撤销选择;
    }
}
```

---

## 3. 组合问题

### 3.1 组合

```java
/**
 * LeetCode 77. 组合
 * 
 * 给定两个整数 n 和 k，返回 1 ... n 中所有可能的 k 个数的组合。
 */
public List<List<Integer>> combine(int n, int k) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(n, k, 1, new ArrayList<>(), result);
    return result;
}

private void backtrack(int n, int k, int start, 
                       List<Integer> path, List<List<Integer>> result) {
    // 终止条件
    if (path.size() == k) {
        result.add(new ArrayList<>(path));
        return;
    }
    
    // 遍历选择列表
    for (int i = start; i <= n; i++) {
        path.add(i);  // 做选择
        backtrack(n, k, i + 1, path, result);
        path.remove(path.size() - 1);  // 撤销选择
    }
}

// 时间复杂度：O(C(n,k))
// 空间复杂度：O(k)
```

### 3.2 组合总和

```java
/**
 * LeetCode 39. 组合总和
 * 
 * 给定一个无重复元素的数组 candidates 和一个目标数 target，
 * 找出 candidates 中所有可以使数字和为 target 的组合。
 */
public List<List<Integer>> combinationSum(int[] candidates, int target) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(candidates, target, 0, new ArrayList<>(), result, 0);
    return result;
}

private void backtrack(int[] candidates, int target, int start,
                       List<Integer> path, List<List<Integer>> result, int sum) {
    // 终止条件
    if (sum == target) {
        result.add(new ArrayList<>(path));
        return;
    }
    
    if (sum > target) return;
    
    for (int i = start; i < candidates.length; i++) {
        path.add(candidates[i]);
        // 可以重复使用，所以从 i 开始
        backtrack(candidates, target, i, path, result, sum + candidates[i]);
        path.remove(path.size() - 1);
    }
}

// 时间复杂度：O(S)，S 为所有可行解的长度之和
// 空间复杂度：O(target)
```

### 3.3 组合总和 II（元素不能重复使用）

```java
/**
 * LeetCode 40. 组合总和 II
 */
public List<List<Integer>> combinationSum2(int[] candidates, int target) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(candidates);  // 排序，方便去重
    backtrack(candidates, target, 0, new ArrayList<>(), result, 0);
    return result;
}

private void backtrack(int[] candidates, int target, int start,
                       List<Integer> path, List<List<Integer>> result, int sum) {
    if (sum == target) {
        result.add(new ArrayList<>(path));
        return;
    }
    
    for (int i = start; i < candidates.length; i++) {
        // 去重：同一层不能使用相同的元素
        if (i > start && candidates[i] == candidates[i - 1]) continue;
        
        if (sum + candidates[i] > target) break;
        
        path.add(candidates[i]);
        // 不能重复使用，所以从 i+1 开始
        backtrack(candidates, target, i + 1, path, result, sum + candidates[i]);
        path.remove(path.size() - 1);
    }
}

// 时间复杂度：O(2^n)
// 空间复杂度：O(n)
```

---

## 4. 排列问题

### 4.1 全排列

```java
/**
 * LeetCode 46. 全排列
 */
public List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    boolean[] used = new boolean[nums.length];
    backtrack(nums, new ArrayList<>(), used, result);
    return result;
}

private void backtrack(int[] nums, List<Integer> path, 
                       boolean[] used, List<List<Integer>> result) {
    if (path.size() == nums.length) {
        result.add(new ArrayList<>(path));
        return;
    }
    
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        
        path.add(nums[i]);
        used[i] = true;
        
        backtrack(nums, path, used, result);
        
        path.remove(path.size() - 1);
        used[i] = false;
    }
}

// 时间复杂度：O(n!)
// 空间复杂度：O(n)
```

### 4.2 全排列 II（含重复元素）

```java
/**
 * LeetCode 47. 全排列 II
 */
public List<List<Integer>> permuteUnique(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(nums);  // 排序，方便去重
    boolean[] used = new boolean[nums.length];
    backtrack(nums, new ArrayList<>(), used, result);
    return result;
}

private void backtrack(int[] nums, List<Integer> path,
                       boolean[] used, List<List<Integer>> result) {
    if (path.size() == nums.length) {
        result.add(new ArrayList<>(path));
        return;
    }
    
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        
        // 去重：同一层不能使用相同的元素
        if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;
        
        path.add(nums[i]);
        used[i] = true;
        
        backtrack(nums, path, used, result);
        
        path.remove(path.size() - 1);
        used[i] = false;
    }
}

// 时间复杂度：O(n!)
// 空间复杂度：O(n)
```

---

## 5. 子集问题

### 5.1 子集

```java
/**
 * LeetCode 78. 子集
 */
public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, int start, 
                       List<Integer> path, List<List<Integer>> result) {
    // 每个节点都是一个解
    result.add(new ArrayList<>(path));
    
    for (int i = start; i < nums.length; i++) {
        path.add(nums[i]);
        backtrack(nums, i + 1, path, result);
        path.remove(path.size() - 1);
    }
}

// 时间复杂度：O(n * 2^n)
// 空间复杂度：O(n)
```

### 5.2 子集 II（含重复元素）

```java
/**
 * LeetCode 90. 子集 II
 */
public List<List<Integer>> subsetsWithDup(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(nums);  // 排序，方便去重
    backtrack(nums, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, int start,
                       List<Integer> path, List<List<Integer>> result) {
    result.add(new ArrayList<>(path));
    
    for (int i = start; i < nums.length; i++) {
        // 去重
        if (i > start && nums[i] == nums[i - 1]) continue;
        
        path.add(nums[i]);
        backtrack(nums, i + 1, path, result);
        path.remove(path.size() - 1);
    }
}

// 时间复杂度：O(n * 2^n)
// 空间复杂度：O(n)
```

---

## 6. 切割问题

### 6.1 分割回文串

```java
/**
 * LeetCode 131. 分割回文串
 */
public List<List<String>> partition(String s) {
    List<List<String>> result = new ArrayList<>();
    backtrack(s, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(String s, int start, 
                       List<String> path, List<List<String>> result) {
    if (start == s.length()) {
        result.add(new ArrayList<>(path));
        return;
    }
    
    for (int i = start; i < s.length(); i++) {
        if (isPalindrome(s, start, i)) {
            path.add(s.substring(start, i + 1));
            backtrack(s, i + 1, path, result);
            path.remove(path.size() - 1);
        }
    }
}

private boolean isPalindrome(String s, int left, int right) {
    while (left < right) {
        if (s.charAt(left++) != s.charAt(right--)) {
            return false;
        }
    }
    return true;
}

// 时间复杂度：O(n * 2^n)
// 空间复杂度：O(n)
```

---

## 7. 棋盘问题

### 7.1 N 皇后

```java
/**
 * LeetCode 51. N 皇后
 */
public List<List<String>> solveNQueens(int n) {
    List<List<String>> result = new ArrayList<>();
    char[][] board = new char[n][n];
    
    for (char[] row : board) {
        Arrays.fill(row, '.');
    }
    
    backtrack(board, 0, result);
    return result;
}

private void backtrack(char[][] board, int row, List<List<String>> result) {
    if (row == board.length) {
        result.add(construct(board));
        return;
    }
    
    for (int col = 0; col < board.length; col++) {
        if (!isValid(board, row, col)) continue;
        
        board[row][col] = 'Q';
        backtrack(board, row + 1, result);
        board[row][col] = '.';
    }
}

private boolean isValid(char[][] board, int row, int col) {
    int n = board.length;
    
    // 检查列
    for (int i = 0; i < row; i++) {
        if (board[i][col] == 'Q') return false;
    }
    
    // 检查左上对角线
    for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j] == 'Q') return false;
    }
    
    // 检查右上对角线
    for (int i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
        if (board[i][j] == 'Q') return false;
    }
    
    return true;
}

private List<String> construct(char[][] board) {
    List<String> solution = new ArrayList<>();
    for (char[] row : board) {
        solution.add(new String(row));
    }
    return solution;
}

// 时间复杂度：O(N!)
// 空间复杂度：O(N)
```

### 7.2 解数独

```java
/**
 * LeetCode 37. 解数独
 */
public void solveSudoku(char[][] board) {
    backtrack(board, 0, 0);
}

private boolean backtrack(char[][] board, int row, int col) {
    int n = board.length;
    
    // 到达末尾
    if (row == n) return true;
    
    // 到达列末尾
    if (col == n) {
        return backtrack(board, row + 1, 0);
    }
    
    // 已有数字
    if (board[row][col] != '.') {
        return backtrack(board, row, col + 1);
    }
    
    // 尝试填 1-9
    for (char num = '1'; num <= '9'; num++) {
        if (!isValid(board, row, col, num)) continue;
        
        board[row][col] = num;
        
        if (backtrack(board, row, col + 1)) {
            return true;
        }
        
        board[row][col] = '.';
    }
    
    return false;
}

private boolean isValid(char[][] board, int row, int col, char num) {
    for (int i = 0; i < 9; i++) {
        // 检查行
        if (board[row][i] == num) return false;
        // 检查列
        if (board[i][col] == num) return false;
        // 检查 3x3 宫格
        if (board[3 * (row / 3) + i / 3][3 * (col / 3) + i % 3] == num) {
            return false;
        }
    }
    return true;
}

// 时间复杂度：O(9^(n*n))
// 空间复杂度：O(n*n)
```

---

## 8. LeetCode 例题

### 8.1 电话号码的字母组合

```java
/**
 * LeetCode 17. 电话号码的字母组合
 */
public List<String> letterCombinations(String digits) {
    List<String> result = new ArrayList<>();
    if (digits.isEmpty()) return result;
    
    String[] phone = {"", "", "abc", "def", "ghi", "jkl", 
                      "mno", "pqrs", "tuv", "wxyz"};
    
    backtrack(digits, 0, new StringBuilder(), result, phone);
    return result;
}

private void backtrack(String digits, int index, StringBuilder path,
                       List<String> result, String[] phone) {
    if (index == digits.length()) {
        result.add(path.toString());
        return;
    }
    
    String letters = phone[digits.charAt(index) - '0'];
    
    for (char c : letters.toCharArray()) {
        path.append(c);
        backtrack(digits, index + 1, path, result, phone);
        path.deleteCharAt(path.length() - 1);
    }
}

// 时间复杂度：O(4^n)
// 空间复杂度：O(n)
```

### 8.2 单词搜索

```java
/**
 * LeetCode 79. 单词搜索
 */
public boolean exist(char[][] board, String word) {
    int m = board.length, n = board[0].length;
    boolean[][] visited = new boolean[m][n];
    
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (backtrack(board, word, i, j, 0, visited)) {
                return true;
            }
        }
    }
    
    return false;
}

private boolean backtrack(char[][] board, String word, 
                          int i, int j, int index, boolean[][] visited) {
    if (index == word.length()) return true;
    
    if (i < 0 || i >= board.length || j < 0 || j >= board[0].length ||
        visited[i][j] || board[i][j] != word.charAt(index)) {
        return false;
    }
    
    visited[i][j] = true;
    
    boolean found = backtrack(board, word, i + 1, j, index + 1, visited) ||
                    backtrack(board, word, i - 1, j, index + 1, visited) ||
                    backtrack(board, word, i, j + 1, index + 1, visited) ||
                    backtrack(board, word, i, j - 1, index + 1, visited);
    
    visited[i][j] = false;
    
    return found;
}

// 时间复杂度：O(mn * 4^L)
// 空间复杂度：O(L)
```

---

## 📝 待办事项

- [ ] 掌握回溯算法模板
- [ ] 理解组合问题
- [ ] 理解排列问题
- [ ] 理解子集问题
- [ ] 理解切割问题
- [ ] 掌握棋盘问题
- [ ] 完成 LeetCode 10 道题
- [ ] 理解去重技巧

---

**下一讲：[LeetCode 高频 100 道](/data-structure-algorithm/practice/leetcode-100)**

---

**推荐资源：**
- 📖 《算法导论》回溯章节
- 🔗 LeetCode 回溯专题
- 🎥 B 站：回溯算法详解
- 🎥 Labuladong 的算法小抄
