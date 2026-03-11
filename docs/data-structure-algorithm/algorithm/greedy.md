# 贪心算法

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-25  
> 难度：⭐⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 贪心算法定义

**贪心算法：** 每一步都做出当前看起来最优的选择，希望最终结果是全局最优

**特点：**
- ✅ 简单高效
- ✅ 某些问题能得到最优解
- ❌ 不能保证所有问题都得到最优解
- ❌ 需要证明贪心策略的正确性

**适用场景：**
- 最优子结构
- 贪心选择性质

---

## 2. 贪心 vs 动态规划

| 特性 | 贪心算法 | 动态规划 |
|------|----------|----------|
| 选择方式 | 当前最优 | 所有可能 |
| 最优解 | 不一定 | 一定 |
| 效率 | 高 | 较低 |
| 实现难度 | 简单 | 复杂 |
| 回溯 | 不回溯 | 需要 |

---

## 3. 贪心经典问题

### 3.1 活动选择问题

```java
/**
 * 活动选择问题
 * 
 * 有 n 个活动，每个活动有开始时间和结束时间，
 * 选择最多的互不冲突的活动。
 */
public int activitySelection(int[] start, int[] end) {
    int n = start.length;
    int[][] activities = new int[n][2];
    
    for (int i = 0; i < n; i++) {
        activities[i] = new int[]{start[i], end[i]};
    }
    
    // 按结束时间排序
    Arrays.sort(activities, (a, b) -> a[1] - b[1]);
    
    int count = 1;
    int lastEnd = activities[0][1];
    
    for (int i = 1; i < n; i++) {
        if (activities[i][0] >= lastEnd) {
            count++;
            lastEnd = activities[i][1];
        }
    }
    
    return count;
}

// 时间复杂度：O(n log n)
// 空间复杂度：O(n)
```

### 3.2 区间调度

```java
/**
 * LeetCode 435. 无重叠区间
 */
public int eraseOverlapIntervals(int[][] intervals) {
    if (intervals.length == 0) return 0;
    
    // 按结束时间排序
    Arrays.sort(intervals, (a, b) -> a[1] - b[1]);
    
    int count = 0;
    int lastEnd = intervals[0][1];
    
    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < lastEnd) {
            // 重叠，需要删除
            count++;
        } else {
            lastEnd = intervals[i][1];
        }
    }
    
    return count;
}

// 时间复杂度：O(n log n)
// 空间复杂度：O(1)
```

### 3.3 跳跃游戏

```java
/**
 * LeetCode 55. 跳跃游戏
 */
public boolean canJump(int[] nums) {
    int maxReach = 0;
    
    for (int i = 0; i < nums.length; i++) {
        if (i > maxReach) return false;
        
        maxReach = Math.max(maxReach, i + nums[i]);
        
        if (maxReach >= nums.length - 1) {
            return true;
        }
    }
    
    return true;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

### 3.4 跳跃游戏 II

```java
/**
 * LeetCode 45. 跳跃游戏 II
 */
public int jump(int[] nums) {
    int jumps = 0;
    int currentEnd = 0;
    int farthest = 0;
    
    for (int i = 0; i < nums.length - 1; i++) {
        farthest = Math.max(farthest, i + nums[i]);
        
        if (i == currentEnd) {
            jumps++;
            currentEnd = farthest;
        }
    }
    
    return jumps;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

---

## 4. LeetCode 例题

### 4.1 分发饼干

```java
/**
 * LeetCode 455. 分发饼干
 */
public int findContentChildren(int[] g, int[] s) {
    Arrays.sort(g);  // 孩子胃口
    Arrays.sort(s);  // 饼干大小
    
    int i = 0, j = 0;
    
    while (i < g.length && j < s.length) {
        if (s[j] >= g[i]) {
            // 饼干满足孩子
            i++;
        }
        j++;
    }
    
    return i;
}

// 时间复杂度：O(n log n)
// 空间复杂度：O(1)
```

### 4.2 柠檬水找零

```java
/**
 * LeetCode 860. 柠檬水找零
 */
public boolean lemonadeChange(int[] bills) {
    int five = 0, ten = 0;
    
    for (int bill : bills) {
        if (bill == 5) {
            five++;
        } else if (bill == 10) {
            if (five == 0) return false;
            five--;
            ten++;
        } else {  // bill == 20
            if (ten > 0 && five > 0) {
                ten--;
                five--;
            } else if (five >= 3) {
                five -= 3;
            } else {
                return false;
            }
        }
    }
    
    return true;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

### 4.3 最长回文串

```java
/**
 * LeetCode 409. 最长回文串
 */
public int longestPalindrome(String s) {
    Map<Character, Integer> count = new HashMap<>();
    
    for (char c : s.toCharArray()) {
        count.put(c, count.getOrDefault(c, 0) + 1);
    }
    
    int length = 0;
    boolean hasOdd = false;
    
    for (int freq : count.values()) {
        length += freq / 2 * 2;
        if (freq % 2 == 1) {
            hasOdd = true;
        }
    }
    
    return hasOdd ? length + 1 : length;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

### 4.4 买卖股票的最佳时机 II

```java
/**
 * LeetCode 122. 买卖股票的最佳时机 II
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

### 4.5 根据身高重建队列

```java
/**
 * LeetCode 406. 根据身高重建队列
 */
public int[][] reconstructQueue(int[][] people) {
    // 按身高降序，k 升序排序
    Arrays.sort(people, (a, b) -> {
        if (a[0] != b[0]) {
            return b[0] - a[0];
        } else {
            return a[1] - b[1];
        }
    });
    
    List<int[]> result = new ArrayList<>();
    
    for (int[] person : people) {
        result.add(person[1], person);
    }
    
    return result.toArray(new int[people.length][]);
}

// 时间复杂度：O(n²)
// 空间复杂度：O(n)
```

### 4.6 划分字母区间

```java
/**
 * LeetCode 763. 划分字母区间
 */
public List<Integer> partitionLabels(String s) {
    int[] last = new int[26];
    
    // 记录每个字符最后出现的位置
    for (int i = 0; i < s.length(); i++) {
        last[s.charAt(i) - 'a'] = i;
    }
    
    List<Integer> result = new ArrayList<>();
    int start = 0, end = 0;
    
    for (int i = 0; i < s.length(); i++) {
        end = Math.max(end, last[s.charAt(i) - 'a']);
        
        if (i == end) {
            result.add(end - start + 1);
            start = i + 1;
        }
    }
    
    return result;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

### 4.7 合并区间

```java
/**
 * LeetCode 56. 合并区间
 */
public int[][] merge(int[][] intervals) {
    if (intervals.length == 0) return new int[0][];
    
    // 按开始时间排序
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

### 4.8 加油站

```java
/**
 * LeetCode 134. 加油站
 */
public int canCompleteCircuit(int[] gas, int[] cost) {
    int totalTank = 0, currTank = 0;
    int startIndex = 0;
    
    for (int i = 0; i < gas.length; i++) {
        totalTank += gas[i] - cost[i];
        currTank += gas[i] - cost[i];
        
        if (currTank < 0) {
            startIndex = i + 1;
            currTank = 0;
        }
    }
    
    return totalTank >= 0 ? startIndex : -1;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

---

## 5. 贪心策略证明

### 5.1 交换论证

**思路：** 假设存在最优解，通过交换操作证明贪心解不会更差

**示例：** 活动选择问题
- 假设最优解不是贪心解
- 将最优解的第一个活动替换为贪心选择的第一个活动
- 证明替换后仍然是可行解且活动数不减少

### 5.2 归纳法

**思路：** 证明贪心选择后，剩余子问题的最优解加上贪心选择就是原问题的最优解

---

## 📝 待办事项

- [ ] 理解贪心算法思想
- [ ] 掌握贪心 vs 动态规划
- [ ] 掌握活动选择问题
- [ ] 掌握区间调度问题
- [ ] 完成 LeetCode 8 道题
- [ ] 理解贪心策略证明方法

---

**下一讲：[动态规划](/data-structure-algorithm/algorithm/dp)**

---

**推荐资源：**
- 📖 《算法导论》第 16 章
- 🔗 LeetCode 贪心专题
- 🎥 B 站：贪心算法详解
