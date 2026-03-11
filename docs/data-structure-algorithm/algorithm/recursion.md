# 递归与分治

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-24  
> 难度：⭐⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 递归

### 1.1 定义

**递归：** 函数调用自身来解决问题

**三要素：**
1. **基准情况** - 终止条件
2. **递归关系** - 如何分解问题
3. **进展** - 向基准情况靠近

### 1.2 递归实现

```java
/**
 * 斐波那契数列（递归）
 */
public int fibonacci(int n) {
    if (n <= 1) return n;  // 基准情况
    return fibonacci(n - 1) + fibonacci(n - 2);  // 递归关系
}

// 时间复杂度：O(2^n)
// 空间复杂度：O(n)
```

### 1.3 递归优化：记忆化

```java
/**
 * 斐波那契数列（记忆化递归）
 */
public int fibonacci(int n) {
    Map<Integer, Integer> memo = new HashMap<>();
    return fibonacci(n, memo);
}

private int fibonacci(int n, Map<Integer, Integer> memo) {
    if (n <= 1) return n;
    
    if (memo.containsKey(n)) {
        return memo.get(n);
    }
    
    int result = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
    memo.put(n, result);
    
    return result;
}

// 时间复杂度：O(n)
// 空间复杂度：O(n)
```

### 1.4 递归转迭代

```java
/**
 * 斐波那契数列（迭代）
 */
public int fibonacci(int n) {
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

## 2. 分治法

### 2.1 定义

**分治法：** 将问题分解为若干个子问题，分别解决后合并结果

**步骤：**
1. **分解** - 将问题分解为子问题
2. **解决** - 递归解决子问题
3. **合并** - 合并子问题的解

### 2.2 归并排序（分治典型）

```java
/**
 * 归并排序
 */
public void mergeSort(int[] arr) {
    if (arr.length < 2) return;
    
    mergeSort(arr, 0, arr.length - 1);
}

private void mergeSort(int[] arr, int left, int right) {
    if (left >= right) return;
    
    // 分解
    int mid = left + (right - left) / 2;
    
    // 解决
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    
    // 合并
    merge(arr, left, mid, right);
}

private void merge(int[] arr, int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    
    int[] L = new int[n1];
    int[] R = new int[n2];
    
    for (int i = 0; i < n1; i++) L[i] = arr[left + i];
    for (int i = 0; i < n2; i++) R[i] = arr[mid + 1 + i];
    
    int i = 0, j = 0, k = left;
    
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k++] = L[i++];
        } else {
            arr[k++] = R[j++];
        }
    }
    
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

// 时间复杂度：O(n log n)
// 空间复杂度：O(n)
```

### 2.3 快速排序（分治典型）

```java
/**
 * 快速排序
 */
public void quickSort(int[] arr) {
    quickSort(arr, 0, arr.length - 1);
}

private void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        // 分解
        int pi = partition(arr, low, high);
        
        // 解决
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
        
        // 合并：不需要，原地排序
    }
}

private int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr, i, j);
        }
    }
    
    swap(arr, i + 1, high);
    return i + 1;
}

// 时间复杂度：O(n log n) 平均
// 空间复杂度：O(log n)
```

---

## 3. 分治应用

### 3.1 最大子数组和

```java
/**
 * LeetCode 53. 最大子数组和（分治法）
 */
public int maxSubArray(int[] nums) {
    return maxSubArray(nums, 0, nums.length - 1);
}

private int maxSubArray(int[] nums, int left, int right) {
    if (left == right) return nums[left];
    
    int mid = left + (right - left) / 2;
    
    // 分解
    int leftMax = maxSubArray(nums, left, mid);
    int rightMax = maxSubArray(nums, mid + 1, right);
    
    // 跨越中点的最大子数组
    int leftSum = Integer.MIN_VALUE;
    int sum = 0;
    for (int i = mid; i >= left; i--) {
        sum += nums[i];
        leftSum = Math.max(leftSum, sum);
    }
    
    int rightSum = Integer.MIN_VALUE;
    sum = 0;
    for (int i = mid + 1; i <= right; i++) {
        sum += nums[i];
        rightSum = Math.max(rightSum, sum);
    }
    
    // 合并
    int crossMax = leftSum + rightSum;
    
    return Math.max(crossMax, Math.max(leftMax, rightMax));
}

// 时间复杂度：O(n log n)
// 空间复杂度：O(log n)
```

### 3.2 多数组第 K 小元素

```java
/**
 * 快速选择算法 O(n) 平均
 */
public int findKthLargest(int[] nums, int k) {
    return quickSelect(nums, 0, nums.length - 1, nums.length - k);
}

private int quickSelect(int[] arr, int low, int high, int k) {
    if (low == high) return arr[low];
    
    int pi = partition(arr, low, high);
    
    if (k == pi) {
        return arr[k];
    } else if (k < pi) {
        return quickSelect(arr, low, pi - 1, k);
    } else {
        return quickSelect(arr, pi + 1, high, k);
    }
}

private int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low;
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            swap(arr, i, j);
            i++;
        }
    }
    
    swap(arr, i, high);
    return i;
}

// 时间复杂度：O(n) 平均，O(n²) 最坏
// 空间复杂度：O(log n)
```

---

## 4. 递归经典问题

### 4.1 汉诺塔

```java
/**
 * 汉诺塔问题
 */
public void hanoi(int n, char from, char to, char aux) {
    if (n == 1) {
        System.out.println("Move disk 1 from " + from + " to " + to);
        return;
    }
    
    hanoi(n - 1, from, aux, to);
    System.out.println("Move disk " + n + " from " + from + " to " + to);
    hanoi(n - 1, aux, to, from);
}

// 时间复杂度：O(2^n)
// 空间复杂度：O(n)
```

### 4.2 全排列

```java
/**
 * LeetCode 46. 全排列
 */
public List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, 0, result);
    return result;
}

private void backtrack(int[] nums, int start, List<List<Integer>> result) {
    if (start == nums.length) {
        List<Integer> perm = new ArrayList<>();
        for (int num : nums) perm.add(num);
        result.add(perm);
        return;
    }
    
    for (int i = start; i < nums.length; i++) {
        swap(nums, start, i);
        backtrack(nums, start + 1, result);
        swap(nums, start, i);  // 回溯
    }
}

// 时间复杂度：O(n!)
// 空间复杂度：O(n)
```

### 4.3 组合

```java
/**
 * LeetCode 77. 组合
 */
public List<List<Integer>> combine(int n, int k) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(n, k, 1, new ArrayList<>(), result);
    return result;
}

private void backtrack(int n, int k, int start, 
                       List<Integer> current, List<List<Integer>> result) {
    if (current.size() == k) {
        result.add(new ArrayList<>(current));
        return;
    }
    
    for (int i = start; i <= n; i++) {
        current.add(i);
        backtrack(n, k, i + 1, current, result);
        current.remove(current.size() - 1);  // 回溯
    }
}

// 时间复杂度：O(C(n,k))
// 空间复杂度：O(k)
```

### 4.4 N 皇后

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
    
    boolean[] cols = new boolean[n];
    boolean[] diag1 = new boolean[2 * n];  // 主对角线
    boolean[] diag2 = new boolean[2 * n];  // 副对角线
    
    backtrack(board, 0, n, cols, diag1, diag2, result);
    
    return result;
}

private void backtrack(char[][] board, int row, int n,
                       boolean[] cols, boolean[] diag1, boolean[] diag2,
                       List<List<String>> result) {
    if (row == n) {
        List<String> solution = new ArrayList<>();
        for (char[] r : board) {
            solution.add(new String(r));
        }
        result.add(solution);
        return;
    }
    
    for (int col = 0; col < n; col++) {
        int d1 = row - col + n;
        int d2 = row + col;
        
        if (cols[col] || diag1[d1] || diag2[d2]) continue;
        
        board[row][col] = 'Q';
        cols[col] = diag1[d1] = diag2[d2] = true;
        
        backtrack(board, row + 1, n, cols, diag1, diag2, result);
        
        board[row][col] = '.';
        cols[col] = diag1[d1] = diag2[d2] = false;
    }
}

// 时间复杂度：O(N!)
// 空间复杂度：O(N)
```

---

## 5. LeetCode 例题

### 5.1  Pow(x, n)

```java
/**
 * LeetCode 50. Pow(x, n)
 */
public double myPow(double x, int n) {
    long N = n;
    return N >= 0 ? fastPow(x, N) : 1.0 / fastPow(x, -N);
}

private double fastPow(double x, long n) {
    if (n == 0) return 1.0;
    
    double half = fastPow(x, n / 2);
    
    if (n % 2 == 0) {
        return half * half;
    } else {
        return half * half * x;
    }
}

// 时间复杂度：O(log n)
// 空间复杂度：O(log n)
```

### 5.2 多数组的不同路径

```java
/**
 * LeetCode 62. 不同路径
 */
public int uniquePaths(int m, int n) {
    if (m == 1 || n == 1) return 1;
    
    return uniquePaths(m - 1, n) + uniquePaths(m, n - 1);
}

// 优化：记忆化
public int uniquePaths(int m, int n) {
    int[][] memo = new int[m][n];
    return uniquePaths(m, n, memo);
}

private int uniquePaths(int m, int n, int[][] memo) {
    if (m == 1 || n == 1) return 1;
    if (memo[m - 1][n - 1] > 0) return memo[m - 1][n - 1];
    
    memo[m - 1][n - 1] = uniquePaths(m - 1, n, memo) + 
                         uniquePaths(m, n - 1, memo);
    return memo[m - 1][n - 1];
}

// 时间复杂度：O(mn)
// 空间复杂度：O(mn)
```

### 5.3 为运算表达式设计优先级

```java
/**
 * LeetCode 241. 为运算表达式设计优先级
 */
public List<Integer> diffWaysToCompute(String expression) {
    List<Integer> result = new ArrayList<>();
    
    for (int i = 0; i < expression.length(); i++) {
        char c = expression.charAt(i);
        
        if (c == '+' || c == '-' || c == '*') {
            List<Integer> left = diffWaysToCompute(expression.substring(0, i));
            List<Integer> right = diffWaysToCompute(expression.substring(i + 1));
            
            for (int l : left) {
                for (int r : right) {
                    if (c == '+') result.add(l + r);
                    else if (c == '-') result.add(l - r);
                    else result.add(l * r);
                }
            }
        }
    }
    
    if (result.isEmpty()) {
        result.add(Integer.parseInt(expression));
    }
    
    return result;
}

// 时间复杂度：O(Catalan(n))
// 空间复杂度：O(n)
```

---

## 📝 待办事项

- [ ] 理解递归三要素
- [ ] 掌握递归优化（记忆化）
- [ ] 理解分治法步骤
- [ ] 掌握归并排序
- [ ] 掌握快速排序
- [ ] 掌握回溯算法模板
- [ ] 完成 LeetCode 5 道题

---

**下一讲：[贪心算法](/data-structure-algorithm/algorithm/greedy)**

---

**推荐资源：**
- 📖 《算法 4》第 2.3 节
- 🔗 LeetCode 递归专题
- 🎥 B 站：递归与分治详解
