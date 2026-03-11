# 复杂度分析

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-13  
> 难度：⭐

---

## 📚 目录

[[toc]]

---

## 1. 为什么需要复杂度分析

### 1.1 问题引入

```java
// 方法 1：遍历求和
public int sum1(int n) {
    int sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

// 方法 2：公式计算
public int sum2(int n) {
    return n * (n + 1) / 2;
}
```

**问题：** 哪个方法更快？

**答案：** 方法 2（公式计算）

**原因：** 
- 方法 1：需要执行 n 次加法，时间复杂度 O(n)
- 方法 2：只需 1 次计算，时间复杂度 O(1)

### 1.2 事后统计法的局限

**事后统计：** 用计时器测量代码执行时间

**局限性：**
1. **依赖硬件环境** - 同一代码在不同机器上运行时间不同
2. **依赖数据规模** - 小数据看不出差异
3. **依赖具体实现** - 编译器优化影响结果

**解决方案：** 使用**大 O 复杂度分析法**

---

## 2. 大 O 复杂度表示法

### 2.1 定义

```
T(n) = O(f(n))
```

**含义：** 算法执行时间 T(n) 与数据规模 n 的增长趋势一致

**示例：**
```java
public int sum(int n) {
    int sum = 0;           // 1 个时间单位
    for (int i = 1; i <= n; i++) {  // n 个时间单位
        sum += i;          // n 个时间单位
    }
    return sum;            // 1 个时间单位
}

// 总执行时间：T(n) = (2n + 2) 个时间单位
// 大 O 表示：T(n) = O(n)
```

### 2.2 复杂度分析法则

#### 法则 1：只关注循环次数最多的代码

```java
public void example(int n) {
    int a = 1;                    // O(1)
    
    for (int i = 0; i < n; i++) { // O(n)
        a++;
    }
    
    for (int i = 0; i < n; i++) { // O(n)
        for (int j = 0; j < n; j++) { // O(n²)
            a++;
        }
    }
}

// 总复杂度：O(1) + O(n) + O(n²) = O(n²)
// 只保留最高阶：O(n²)
```

#### 法则 2：总复杂度 = 量级最大的那段代码

```java
public void example(int n) {
    // 第一段：O(1)
    int a = 1;
    
    // 第二段：O(n)
    for (int i = 0; i < n; i++) {
        a++;
    }
    
    // 第三段：O(n²)
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            a++;
        }
    }
}

// 总复杂度：O(n²)
```

#### 法则 3：嵌套代码复杂度 = 内外复杂度乘积

```java
public void example(int n) {
    for (int i = 0; i < n; i++) {      // O(n)
        for (int j = 0; j < n; j++) {  // O(n)
            for (int k = 0; k < n; k++) { // O(n)
                System.out.println(i + j + k);
            }
        }
    }
}

// 总复杂度：O(n) × O(n) × O(n) = O(n³)
```

#### 法则 4：多个数据规模取最大值

```java
public void example(int m, int n) {
    for (int i = 0; i < m; i++) { // O(m)
        System.out.println(i);
    }
    
    for (int i = 0; i < n; i++) { // O(n)
        System.out.println(i);
    }
}

// 总复杂度：O(m) + O(n) = O(m + n)
// 如果 m 和 n 大小不确定，不能简化

// 但如果知道 m >> n，则可以简化为 O(m)
```

---

## 3. 常见复杂度量级

### 3.1 复杂度排序（从优到劣）

```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)
```

### 3.2 O(1) - 常数阶

**定义：** 执行时间不随数据规模增长

```java
public int constant(int n) {
    int a = 1;
    int b = 2;
    int c = a + b;
    return c;
}

// 无论 n 多大，都只执行固定次数
// 时间复杂度：O(1)
```

**常见场景：**
- 数组访问：`arr[i]`
- 哈希表插入/查找（平均）
- 栈的 push/pop
- 队列的 enqueue/dequeue

### 3.3 O(log n) - 对数阶

**定义：** 执行时间与数据规模的对数成正比

```java
// 二分查找
public int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}

// 每次循环数据规模减半
// 时间复杂度：O(log n)
```

**常见场景：**
- 二分查找
- 二叉树遍历
- 堆操作
- 快速幂

### 3.4 O(n) - 线性阶

**定义：** 执行时间与数据规模成正比

```java
// 遍历数组
public void traverse(int[] arr) {
    for (int i = 0; i < arr.length; i++) {
        System.out.println(arr[i]);
    }
}

// 时间复杂度：O(n)
```

**常见场景：**
- 数组/链表遍历
- 线性查找
- 动态规划（一维）

### 3.5 O(n log n) - 线性对数阶

**定义：** 执行时间与 n × log n 成正比

```java
// 归并排序
public void mergeSort(int[] arr, int left, int right) {
    if (left >= right) return;
    
    int mid = left + (right - left) / 2;
    mergeSort(arr, left, mid);      // O(log n) 层
    mergeSort(arr, mid + 1, right); // O(log n) 层
    merge(arr, left, mid, right);   // O(n) 每层
}

// 时间复杂度：O(n log n)
```

**常见场景：**
- 归并排序
- 快速排序（平均）
- 堆排序

### 3.6 O(n²) - 平方阶

**定义：** 执行时间与数据规模的平方成正比

```java
// 冒泡排序
public void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {        // O(n)
        for (int j = 0; j < n - i - 1; j++) { // O(n)
            if (arr[j] > arr[j + 1]) {
                swap(arr, j, j + 1);
            }
        }
    }
}

// 时间复杂度：O(n) × O(n) = O(n²)
```

**常见场景：**
- 冒泡排序
- 插入排序
- 选择排序
- 双重循环

### 3.7 O(2ⁿ) - 指数阶

**定义：** 执行时间随数据规模指数增长

```java
// 斐波那契（递归）
public int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// 时间复杂度：O(2ⁿ)
// 递归树有 2ⁿ 个节点
```

**常见场景：**
- 朴素递归斐波那契
- 子集生成
- 某些回溯算法

### 3.8 O(n!) - 阶乘阶

**定义：** 执行时间随数据规模阶乘增长

```java
// 全排列
public void permute(int[] nums, int start) {
    if (start == nums.length) {
        System.out.println(Arrays.toString(nums));
        return;
    }
    
    for (int i = start; i < nums.length; i++) {
        swap(nums, start, i);
        permute(nums, start + 1);  // n! 种排列
        swap(nums, start, i);
    }
}

// 时间复杂度：O(n!)
```

**常见场景：**
- 全排列
- 旅行商问题（TSP）
- 某些 NP 完全问题

---

## 4. 最好、最坏、平均、均摊复杂度

### 4.1 最好情况时间复杂度

**定义：** 在最理想情况下，执行这段代码的时间复杂度

```java
// 在数组中查找目标值
public int find(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i;  // 最好情况：第一个就找到
        }
    }
    return -1;
}

// 最好情况时间复杂度：O(1)
```

### 4.2 最坏情况时间复杂度

**定义：** 在最糟糕情况下，执行这段代码的时间复杂度

```java
public int find(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;  // 最坏情况：遍历完都没找到
}

// 最坏情况时间复杂度：O(n)
```

### 4.3 平均情况时间复杂度

**定义：** 所有可能情况的期望时间复杂度

```java
public int find(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}

// 假设目标值在数组中的概率为 1/2
// 平均查找次数 = (1 + 2 + 3 + ... + n) / n = (n + 1) / 2
// 平均情况时间复杂度：O(n)
```

### 4.4 均摊时间复杂度

**定义：** 大部分情况下复杂度很低，个别情况下复杂度高，将高复杂度均摊到低复杂度上

```java
// 动态数组插入
public class DynamicArray {
    private int[] arr;
    private int size;
    private int capacity;
    
    public void insert(int val) {
        if (size == capacity) {
            // 扩容：O(n)
            int[] newArr = new int[capacity * 2];
            System.arraycopy(arr, 0, newArr, 0, capacity);
            arr = newArr;
            capacity *= 2;
        }
        
        arr[size++] = val;  // 插入：O(1)
    }
}

// 分析：
// - 大部分插入：O(1)
// - 扩容时插入：O(n)
// - n 次插入，扩容 log n 次
// - 均摊时间复杂度：O(1)
```

---

## 5. 空间复杂度

### 5.1 定义

**空间复杂度：** 算法占用的存储空间与数据规模的增长关系

### 5.2 示例

```java
// O(1) - 常数空间
public int sum(int n) {
    int sum = 0;  // 只占用固定空间
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

// O(n) - 线性空间
public int[] createArray(int n) {
    int[] arr = new int[n];  // 占用 n 个空间
    for (int i = 0; i < n; i++) {
        arr[i] = i;
    }
    return arr;
}

// O(n²) - 平方空间
public int[][] createMatrix(int n) {
    int[][] matrix = new int[n][n];  // 占用 n² 个空间
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            matrix[i][j] = i + j;
        }
    }
    return matrix;
}
```

### 5.3 常见数据结构空间复杂度

| 数据结构 | 空间复杂度 |
|----------|------------|
| 数组 | O(n) |
| 链表 | O(n) |
| 栈 | O(n) |
| 队列 | O(n) |
| 哈希表 | O(n) |
| 二叉树 | O(n) |
| 邻接矩阵（图） | O(n²) |
| 邻接表（图） | O(n + m) |

---

## 6. LeetCode 例题

### 6.1 两数之和（O(n)）

```java
/**
 * LeetCode 1. 两数之和
 * 
 * 给定一个整数数组 nums 和一个目标值 target，
 * 找出和为目标值的两个整数，返回它们的数组下标。
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

### 6.2 二分查找（O(log n)）

```java
/**
 * LeetCode 704. 二分查找
 * 
 * 给定一个升序整型数组 nums 和目标值 target，
 * 搜索 nums 中的目标值，如果存在返回下标，否则返回 -1。
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

### 6.3 合并两个有序数组（O(m + n)）

```java
/**
 * LeetCode 88. 合并两个有序数组
 * 
 * 给定两个有序整数数组 nums1 和 nums2，
 * 将 nums2 合并到 nums1 中，使 num1 成为一个有序数组。
 */
public void merge(int[] nums1, int m, int[] nums2, int n) {
    int i = m - 1, j = n - 1, k = m + n - 1;
    
    while (i >= 0 && j >= 0) {
        if (nums1[i] > nums2[j]) {
            nums1[k--] = nums1[i--];
        } else {
            nums1[k--] = nums2[j--];
        }
    }
    
    while (j >= 0) {
        nums1[k--] = nums2[j--];
    }
}

// 时间复杂度：O(m + n)
// 空间复杂度：O(1)
```

---

## 7. 实战技巧

### 7.1 如何分析代码复杂度

**步骤：**
1. **识别循环** - 找出所有循环结构
2. **计算循环次数** - 确定每层循环的执行次数
3. **应用法则** - 使用四大法则简化
4. **保留最高阶** - 只保留量级最大的项

### 7.2 复杂度优化技巧

**空间换时间：**
```java
// 优化前：O(n²)
public boolean hasDuplicate(int[] nums) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] == nums[j]) {
                return true;
            }
        }
    }
    return false;
}

// 优化后：O(n)，使用哈希表
public boolean hasDuplicate(int[] nums) {
    Set<Integer> set = new HashSet<>();
    for (int num : nums) {
        if (!set.add(num)) {
            return true;
        }
    }
    return false;
}
```

**时间换空间：**
```java
// 优化前：O(n) 空间
public int[] createSortedCopy(int[] arr) {
    int[] copy = Arrays.copyOf(arr, arr.length);
    Arrays.sort(copy);
    return copy;
}

// 优化后：O(1) 空间（原地排序）
public void sortInPlace(int[] arr) {
    Arrays.sort(arr);
}
```

---

## 📝 待办事项

- [ ] 理解大 O 表示法
- [ ] 掌握复杂度分析法则
- [ ] 记住常见复杂度量级
- [ ] 理解最好/最坏/平均/均摊复杂度
- [ ] 掌握空间复杂度分析
- [ ] 完成 LeetCode 例题
- [ ] 练习复杂度分析

---

## 💡 学习建议

1. **理解为主** - 不要死记硬背，理解为什么
2. **多画图** - 递归树、循环次数用图表示
3. **多练习** - 分析自己写的代码复杂度
4. **对比优化** - 同一问题尝试不同解法

---

**下一讲：[数组与链表](/data-structure-algorithm/basic/array-list)**

---

**推荐资源：**
- 📖 《算法 4》第 1 章
- 🔗 VisualAlgo：https://visualgo.net
- 🎥 B 站：复杂度分析详解
