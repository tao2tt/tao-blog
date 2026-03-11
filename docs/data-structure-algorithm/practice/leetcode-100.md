# LeetCode 高频 100 道

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-28  
> 难度：⭐⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 数组（15 题）

### 1.1 两数之和

```java
/**
 * LeetCode 1. 两数之和
 * 难度：简单
 */
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        map.put(nums[i], i);
    }
    
    throw new IllegalArgumentException("No solution");
}

// 时间复杂度：O(n)
// 空间复杂度：O(n)
```

### 1.2 三数之和

```java
/**
 * LeetCode 15. 三数之和
 * 难度：中等
 */
public List<List<Integer>> threeSum(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(nums);
    
    for (int i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        
        int left = i + 1, right = nums.length - 1;
        
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            
            if (sum == 0) {
                result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                
                while (left < right && nums[left] == nums[left + 1]) left++;
                while (left < right && nums[right] == nums[right - 1]) right--;
                
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
}

// 时间复杂度：O(n²)
// 空间复杂度：O(1)
```

### 1.3 最大子数组和

```java
/**
 * LeetCode 53. 最大子数组和
 * 难度：中等
 */
public int maxSubArray(int[] nums) {
    int maxSum = nums[0];
    int currentSum = nums[0];
    
    for (int i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

### 1.4 合并区间

```java
/**
 * LeetCode 56. 合并区间
 * 难度：中等
 */
public int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    
    List<int[]> result = new ArrayList<>();
    
    for (int[] interval : intervals) {
        if (result.isEmpty() || result.get(result.size() - 1)[1] < interval[0]) {
            result.add(interval);
        } else {
            result.get(result.size() - 1)[1] = Math.max(
                result.get(result.size() - 1)[1], interval[1]);
        }
    }
    
    return result.toArray(new int[result.size()][]);
}

// 时间复杂度：O(n log n)
// 空间复杂度：O(1)
```

---

## 2. 链表（10 题）

### 2.1 反转链表

```java
/**
 * LeetCode 206. 反转链表
 * 难度：简单
 */
public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    
    return prev;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

### 2.2 合并两个有序链表

```java
/**
 * LeetCode 21. 合并两个有序链表
 * 难度：简单
 */
public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;
    
    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) {
            curr.next = l1;
            l1 = l1.next;
        } else {
            curr.next = l2;
            l2 = l2.next;
        }
        curr = curr.next;
    }
    
    curr.next = (l1 != null) ? l1 : l2;
    
    return dummy.next;
}

// 时间复杂度：O(m + n)
// 空间复杂度：O(1)
```

### 2.3 环形链表

```java
/**
 * LeetCode 141. 环形链表
 * 难度：简单
 */
public boolean hasCycle(ListNode head) {
    if (head == null || head.next == null) return false;
    
    ListNode slow = head;
    ListNode fast = head.next;
    
    while (slow != fast) {
        if (fast == null || fast.next == null) return false;
        slow = slow.next;
        fast = fast.next.next;
    }
    
    return true;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

---

## 3. 树（15 题）

### 3.1 二叉树的最大深度

```java
/**
 * LeetCode 104. 二叉树的最大深度
 * 难度：简单
 */
public int maxDepth(TreeNode root) {
    if (root == null) return 0;
    
    int left = maxDepth(root.left);
    int right = maxDepth(root.right);
    
    return Math.max(left, right) + 1;
}

// 时间复杂度：O(n)
// 空间复杂度：O(h)
```

### 3.2 验证二叉搜索树

```java
/**
 * LeetCode 98. 验证二叉搜索树
 * 难度：中等
 */
public boolean isValidBST(TreeNode root) {
    return isValidBST(root, null, null);
}

private boolean isValidBST(TreeNode node, Integer min, Integer max) {
    if (node == null) return true;
    
    if (min != null && node.val <= min) return false;
    if (max != null && node.val >= max) return false;
    
    return isValidBST(node.left, min, node.val) &&
           isValidBST(node.right, node.val, max);
}

// 时间复杂度：O(n)
// 空间复杂度：O(h)
```

### 3.3 二叉树的层序遍历

```java
/**
 * LeetCode 102. 二叉树的层序遍历
 * 难度：中等
 */
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
    
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    
    while (!queue.isEmpty()) {
        int levelSize = queue.size();
        List<Integer> level = new ArrayList<>();
        
        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        
        result.add(level);
    }
    
    return result;
}

// 时间复杂度：O(n)
// 空间复杂度：O(n)
```

---

## 4. 动态规划（15 题）

### 4.1 爬楼梯

```java
/**
 * LeetCode 70. 爬楼梯
 * 难度：简单
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

### 4.2 打家劫舍

```java
/**
 * LeetCode 198. 打家劫舍
 * 难度：中等
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

### 4.3 零钱兑换

```java
/**
 * LeetCode 322. 零钱兑换
 * 难度：中等
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

---

## 5. 回溯（10 题）

### 5.1 全排列

```java
/**
 * LeetCode 46. 全排列
 * 难度：中等
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

### 5.2 组合总和

```java
/**
 * LeetCode 39. 组合总和
 * 难度：中等
 */
public List<List<Integer>> combinationSum(int[] candidates, int target) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(candidates, target, 0, new ArrayList<>(), result, 0);
    return result;
}

private void backtrack(int[] candidates, int target, int start,
                       List<Integer> path, List<List<Integer>> result, int sum) {
    if (sum == target) {
        result.add(new ArrayList<>(path));
        return;
    }
    
    if (sum > target) return;
    
    for (int i = start; i < candidates.length; i++) {
        path.add(candidates[i]);
        backtrack(candidates, target, i, path, result, sum + candidates[i]);
        path.remove(path.size() - 1);
    }
}

// 时间复杂度：O(S)
// 空间复杂度：O(target)
```

---

## 6. 二分查找（10 题）

### 6.1 二分查找

```java
/**
 * LeetCode 704. 二分查找
 * 难度：简单
 */
public int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}

// 时间复杂度：O(log n)
// 空间复杂度：O(1)
```

### 6.2 搜索旋转排序数组

```java
/**
 * LeetCode 33. 搜索旋转排序数组
 * 难度：中等
 */
public int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (nums[mid] == target) return mid;
        
        if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    
    return -1;
}

// 时间复杂度：O(log n)
// 空间复杂度：O(1)
```

---

## 7. 贪心算法（10 题）

### 7.1 跳跃游戏

```java
/**
 * LeetCode 55. 跳跃游戏
 * 难度：中等
 */
public boolean canJump(int[] nums) {
    int maxReach = 0;
    
    for (int i = 0; i < nums.length; i++) {
        if (i > maxReach) return false;
        maxReach = Math.max(maxReach, i + nums[i]);
        if (maxReach >= nums.length - 1) return true;
    }
    
    return true;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

### 7.2 买卖股票的最佳时机 II

```java
/**
 * LeetCode 122. 买卖股票的最佳时机 II
 * 难度：中等
 */
public int maxProfit(int[] prices) {
    int profit = 0;
    
    for (int i = 1; i < prices.length; i++) {
        if (prices[i] > prices[i - 1]) {
            profit += prices[i] - prices[i - 1];
        }
    }
    
    return profit;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

---

## 8. 堆与优先队列（5 题）

### 8.1 数组中的第 K 个最大元素

```java
/**
 * LeetCode 215. 数组中的第 K 个最大元素
 * 难度：中等
 */
public int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> pq = new PriorityQueue<>(k);
    
    for (int num : nums) {
        if (pq.size() < k) {
            pq.offer(num);
        } else if (num > pq.peek()) {
            pq.poll();
            pq.offer(num);
        }
    }
    
    return pq.peek();
}

// 时间复杂度：O(n log k)
// 空间复杂度：O(k)
```

---

## 9. 图论（10 题）

### 9.1 岛屿数量

```java
/**
 * LeetCode 200. 岛屿数量
 * 难度：中等
 */
public int numIslands(char[][] grid) {
    if (grid == null || grid.length == 0) return 0;
    
    int m = grid.length, n = grid[0].length;
    int count = 0;
    
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == '1') {
                count++;
                dfs(grid, i, j);
            }
        }
    }
    
    return count;
}

private void dfs(char[][] grid, int i, int j) {
    int m = grid.length, n = grid[0].length;
    
    if (i < 0 || i >= m || j < 0 || j >= n || grid[i][j] == '0') {
        return;
    }
    
    grid[i][j] = '0';
    dfs(grid, i + 1, j);
    dfs(grid, i - 1, j);
    dfs(grid, i, j + 1);
    dfs(grid, i, j - 1);
}

// 时间复杂度：O(mn)
// 空间复杂度：O(mn)
```

---

## 10. 哈希表（10 题）

### 10.1 字母异位词分组

```java
/**
 * LeetCode 49. 字母异位词分组
 * 难度：中等
 */
public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();
    
    for (String s : strs) {
        char[] chars = s.toCharArray();
        Arrays.sort(chars);
        String key = new String(chars);
        map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
    }
    
    return new ArrayList<>(map.values());
}

// 时间复杂度：O(nk log k)
// 空间复杂度：O(nk)
```

---

## 📝 刷题计划

### 第 1 阶段：基础（30 题）
- 数组：10 题
- 链表：10 题
- 哈希表：10 题

### 第 2 阶段：进阶（40 题）
- 树：15 题
- 动态规划：15 题
- 回溯：10 题

### 第 3 阶段：提高（30 题）
- 二分查找：10 题
- 贪心算法：10 题
- 图论：10 题

---

## 💡 刷题技巧

### 1. 五遍刷题法
```
第 1 遍：看答案理解思路
第 2 遍：独立实现
第 3 遍：优化代码
第 4 遍：隔天复习
第 5 遍：面试前复习
```

### 2. 分类刷题
- 按类型刷题（数组、链表、树...）
- 按难度刷题（简单→中等→困难）
- 按公司刷题（目标公司高频题）

### 3. 总结模板
- 二分查找模板
- BFS/DFS 模板
- 动态规划模板
- 回溯模板

---

**推荐资源：**
- 🔗 LeetCode 热题 HOT 100
- 🔗 LeetCode 高频面试题
- 📖 《剑指 Offer》
- 📖 《程序员面试金典》
