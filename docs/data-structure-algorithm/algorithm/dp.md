# 动态规划

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-26  
> 难度：⭐⭐⭐⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 动态规划定义

**动态规划（Dynamic Programming）：** 将复杂问题分解为更小的子问题，通过解决子问题来解决原问题

**核心思想：** 记住子问题的解，避免重复计算

**适用条件：**
1. **最优子结构** - 原问题的最优解包含子问题的最优解
2. **重叠子问题** - 子问题会被重复计算

---

## 2. 动态规划解题步骤

```
1. 定义状态（dp 数组的含义）
2. 状态转移方程（如何从一个状态转移到另一个状态）
3. 初始条件（base case）
4. 计算顺序（从上到下 or 从下到上）
5. 返回结果
```

---

## 3. 斐波那契数列（入门）

### 3.1 递归（超时）

```java
public int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

// 时间复杂度：O(2^n)
```

### 3.2 记忆化递归（自顶向下）

```java
public int fib(int n) {
    int[] memo = new int[n + 1];
    return fib(n, memo);
}

private int fib(int n, int[] memo) {
    if (n <= 1) return n;
    if (memo[n] > 0) return memo[n];
    
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
    return memo[n];
}

// 时间复杂度：O(n)
// 空间复杂度：O(n)
```

### 3.3 动态规划（自底向上）

```java
public int fib(int n) {
    if (n <= 1) return n;
    
    int[] dp = new int[n + 1];
    dp[0] = 0;
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}

// 时间复杂度：O(n)
// 空间复杂度：O(n)
```

### 3.4 状态压缩

```java
public int fib(int n) {
    if (n <= 1) return n;
    
    int prev2 = 0, prev1 = 1;
    
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    
    return prev1;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

---

## 4. 背包问题

### 4.1 0-1 背包

```java
/**
 * 0-1 背包问题
 * 
 * 有 n 个物品，每个物品重量 weight[i]，价值 value[i]，
 * 背包容量为 W，求能装下的最大价值。
 */
public int knapsack(int[] weight, int[] value, int W) {
    int n = weight.length;
    int[][] dp = new int[n + 1][W + 1];
    
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            // 不选第 i 个物品
            dp[i][w] = dp[i - 1][w];
            
            // 选第 i 个物品
            if (w >= weight[i - 1]) {
                dp[i][w] = Math.max(dp[i][w], 
                    dp[i - 1][w - weight[i - 1]] + value[i - 1]);
            }
        }
    }
    
    return dp[n][W];
}

// 时间复杂度：O(nW)
// 空间复杂度：O(nW)
```

### 4.2 0-1 背包（空间优化）

```java
public int knapsack(int[] weight, int[] value, int W) {
    int n = weight.length;
    int[] dp = new int[W + 1];
    
    for (int i = 1; i <= n; i++) {
        // 倒序遍历，防止重复使用
        for (int w = W; w >= weight[i - 1]; w--) {
            dp[w] = Math.max(dp[w], dp[w - weight[i - 1]] + value[i - 1]);
        }
    }
    
    return dp[W];
}

// 时间复杂度：O(nW)
// 空间复杂度：O(W)
```

### 4.3 完全背包

```java
/**
 * 完全背包问题
 * 
 * 每个物品可以无限次使用
 */
public int unboundedKnapsack(int[] weight, int[] value, int W) {
    int n = weight.length;
    int[] dp = new int[W + 1];
    
    for (int i = 1; i <= n; i++) {
        // 正序遍历，允许重复使用
        for (int w = weight[i - 1]; w <= W; w++) {
            dp[w] = Math.max(dp[w], dp[w - weight[i - 1]] + value[i - 1]);
        }
    }
    
    return dp[W];
}

// 时间复杂度：O(nW)
// 空间复杂度：O(W)
```

---

## 5. 子序列问题

### 5.1 最长递增子序列（LIS）

```java
/**
 * LeetCode 300. 最长递增子序列
 */
public int lengthOfLIS(int[] nums) {
    if (nums.length == 0) return 0;
    
    int[] dp = new int[nums.length];
    Arrays.fill(dp, 1);
    
    for (int i = 1; i < nums.length; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
    }
    
    int max = 0;
    for (int len : dp) {
        max = Math.max(max, len);
    }
    
    return max;
}

// 时间复杂度：O(n²)
// 空间复杂度：O(n)
```

### 5.2 最长公共子序列（LCS）

```java
/**
 * LeetCode 1143. 最长公共子序列
 */
public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length(), n = text2.length();
    int[][] dp = new int[m + 1][n + 1];
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    return dp[m][n];
}

// 时间复杂度：O(mn)
// 空间复杂度：O(mn)
```

### 5.3 编辑距离

```java
/**
 * LeetCode 72. 编辑距离
 */
public int minDistance(String word1, String word2) {
    int m = word1.length(), n = word2.length();
    int[][] dp = new int[m + 1][n + 1];
    
    // 初始化
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    Math.min(dp[i - 1][j], dp[i][j - 1]),  // 删除或插入
                    dp[i - 1][j - 1]  // 替换
                ) + 1;
            }
        }
    }
    
    return dp[m][n];
}

// 时间复杂度：O(mn)
// 空间复杂度：O(mn)
```

---

## 6. 路径问题

### 6.1 不同路径

```java
/**
 * LeetCode 62. 不同路径
 */
public int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];
    
    // 初始化
    for (int i = 0; i < m; i++) dp[i][0] = 1;
    for (int j = 0; j < n; j++) dp[0][j] = 1;
    
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    }
    
    return dp[m - 1][n - 1];
}

// 时间复杂度：O(mn)
// 空间复杂度：O(mn)
```

### 6.2 最小路径和

```java
/**
 * LeetCode 64. 最小路径和
 */
public int minPathSum(int[][] grid) {
    int m = grid.length, n = grid[0].length;
    int[][] dp = new int[m][n];
    
    dp[0][0] = grid[0][0];
    
    for (int i = 1; i < m; i++) {
        dp[i][0] = dp[i - 1][0] + grid[i][0];
    }
    
    for (int j = 1; j < n; j++) {
        dp[0][j] = dp[0][j - 1] + grid[0][j];
    }
    
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j];
        }
    }
    
    return dp[m - 1][n - 1];
}

// 时间复杂度：O(mn)
// 空间复杂度：O(mn)
```

---

## 7. 股票问题

### 7.1 买卖股票的最佳时机

```java
/**
 * LeetCode 121. 买卖股票的最佳时机
 */
public int maxProfit(int[] prices) {
    int minPrice = Integer.MAX_VALUE;
    int maxProfit = 0;
    
    for (int price : prices) {
        minPrice = Math.min(minPrice, price);
        maxProfit = Math.max(maxProfit, price - minPrice);
    }
    
    return maxProfit;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

### 7.2 买卖股票的最佳时机（含冷冻期）

```java
/**
 * LeetCode 309. 最佳买卖股票时机含冷冻期
 */
public int maxProfit(int[] prices) {
    if (prices.length == 0) return 0;
    
    int hold = -prices[0];  // 持有股票
    int sold = 0;           // 刚卖出
    int rest = 0;           // 休息
    
    for (int i = 1; i < prices.length; i++) {
        int prevHold = hold;
        hold = Math.max(hold, rest - prices[i]);
        rest = Math.max(rest, sold);
        sold = prevHold + prices[i];
    }
    
    return Math.max(sold, rest);
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

---

## 8. 区间 DP

### 8.1 最长回文子串

```java
/**
 * LeetCode 5. 最长回文子串
 */
public String longestPalindrome(String s) {
    int n = s.length();
    boolean[][] dp = new boolean[n][n];
    String result = "";
    
    for (int len = 1; len <= n; len++) {
        for (int i = 0; i <= n - len; i++) {
            int j = i + len - 1;
            
            if (len == 1) {
                dp[i][j] = true;
            } else if (len == 2) {
                dp[i][j] = (s.charAt(i) == s.charAt(j));
            } else {
                dp[i][j] = (s.charAt(i) == s.charAt(j)) && dp[i + 1][j - 1];
            }
            
            if (dp[i][j] && len > result.length()) {
                result = s.substring(i, j + 1);
            }
        }
    }
    
    return result;
}

// 时间复杂度：O(n²)
// 空间复杂度：O(n²)
```

### 8.2 回文子串

```java
/**
 * LeetCode 647. 回文子串
 */
public int countSubstrings(String s) {
    int n = s.length();
    boolean[][] dp = new boolean[n][n];
    int count = 0;
    
    for (int len = 1; len <= n; len++) {
        for (int i = 0; i <= n - len; i++) {
            int j = i + len - 1;
            
            if (len == 1) {
                dp[i][j] = true;
            } else if (len == 2) {
                dp[i][j] = (s.charAt(i) == s.charAt(j));
            } else {
                dp[i][j] = (s.charAt(i) == s.charAt(j)) && dp[i + 1][j - 1];
            }
            
            if (dp[i][j]) count++;
        }
    }
    
    return count;
}

// 时间复杂度：O(n²)
// 空间复杂度：O(n²)
```

---

## 9. 数位 DP

### 9.1 不同路径 II（含障碍）

```java
/**
 * LeetCode 63. 不同路径 II
 */
public int uniquePathsWithObstacles(int[][] obstacleGrid) {
    int m = obstacleGrid.length, n = obstacleGrid[0].length;
    
    if (obstacleGrid[0][0] == 1) return 0;
    
    int[][] dp = new int[m][n];
    dp[0][0] = 1;
    
    for (int i = 1; i < m; i++) {
        dp[i][0] = (obstacleGrid[i][0] == 0 && dp[i - 1][0] == 1) ? 1 : 0;
    }
    
    for (int j = 1; j < n; j++) {
        dp[0][j] = (obstacleGrid[0][j] == 0 && dp[0][j - 1] == 1) ? 1 : 0;
    }
    
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            if (obstacleGrid[i][j] == 0) {
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
            }
        }
    }
    
    return dp[m - 1][n - 1];
}

// 时间复杂度：O(mn)
// 空间复杂度：O(mn)
```

---

## 10. LeetCode 例题

### 10.1 爬楼梯

```java
/**
 * LeetCode 70. 爬楼梯
 */
public int climbStairs(int n) {
    if (n <= 2) return n;
    
    int prev2 = 1, prev1 = 2;
    
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    
    return prev1;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

### 10.2 打家劫舍

```java
/**
 * LeetCode 198. 打家劫舍
 */
public int rob(int[] nums) {
    if (nums.length == 0) return 0;
    if (nums.length == 1) return nums[0];
    
    int prev2 = 0, prev1 = 0;
    
    for (int num : nums) {
        int curr = Math.max(prev1, prev2 + num);
        prev2 = prev1;
        prev1 = curr;
    }
    
    return prev1;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

### 10.3 零钱兑换

```java
/**
 * LeetCode 322. 零钱兑换
 */
public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);
    dp[0] = 0;
    
    for (int coin : coins) {
        for (int i = coin; i <= amount; i++) {
            dp[i] = Math.min(dp[i], dp[i - coin] + 1);
        }
    }
    
    return dp[amount] > amount ? -1 : dp[amount];
}

// 时间复杂度：O(amount * coins.length)
// 空间复杂度：O(amount)
```

### 10.4 最大正方形

```java
/**
 * LeetCode 221. 最大正方形
 */
public int maximalSquare(char[][] matrix) {
    if (matrix.length == 0) return 0;
    
    int m = matrix.length, n = matrix[0].length;
    int[][] dp = new int[m + 1][n + 1];
    int maxSide = 0;
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (matrix[i - 1][j - 1] == '1') {
                dp[i][j] = Math.min(
                    Math.min(dp[i - 1][j], dp[i][j - 1]),
                    dp[i - 1][j - 1]
                ) + 1;
                maxSide = Math.max(maxSide, dp[i][j]);
            }
        }
    }
    
    return maxSide * maxSide;
}

// 时间复杂度：O(mn)
// 空间复杂度：O(mn)
```

---

## 📝 待办事项

- [ ] 理解动态规划思想
- [ ] 掌握斐波那契数列 DP 解法
- [ ] 掌握 0-1 背包问题
- [ ] 掌握完全背包问题
- [ ] 掌握 LIS/LCS 问题
- [ ] 掌握编辑距离
- [ ] 掌握股票问题系列
- [ ] 完成 LeetCode 10 道题
- [ ] 理解状态压缩技巧

---

**下一讲：[回溯算法](/data-structure-algorithm/algorithm/backtracking)**

---

**推荐资源：**
- 📖 《算法导论》第 15 章
- 📖 《动态规划专题》
- 🔗 LeetCode 动态规划专题
- 🎥 B 站：动态规划详解
