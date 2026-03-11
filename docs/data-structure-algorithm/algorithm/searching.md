# 查找算法

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-23  
> 难度：⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 查找算法对比

| 算法 | 平均时间 | 最好 | 最坏 | 空间 | 要求 |
|------|----------|------|------|------|------|
| 顺序查找 | O(n) | O(1) | O(n) | O(1) | 无 |
| 二分查找 | O(log n) | O(1) | O(log n) | O(1) | 有序 |
| 插值查找 | O(log log n) | O(1) | O(n) | O(1) | 有序且均匀 |
| 斐波那契查找 | O(log n) | O(1) | O(log n) | O(1) | 有序 |
| 哈希查找 | O(1) | O(1) | O(n) | O(n) | 哈希表 |

---

## 2. 顺序查找

### 2.1 原理

从头到尾依次检查每个元素。

### 2.2 实现

```java
/**
 * 顺序查找 O(n)
 */
public int sequentialSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

---

## 3. 二分查找

### 3.1 原理

在有序数组中，每次取中间元素与目标比较，缩小查找范围。

### 3.2 实现（迭代）

```java
/**
 * 二分查找 O(log n)
 */
public int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;  // 防止溢出
        
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

// 时间复杂度：O(log n)
// 空间复杂度：O(1)
```

### 3.3 实现（递归）

```java
/**
 * 二分查找（递归）
 */
public int binarySearchRecursive(int[] arr, int target) {
    return binarySearch(arr, 0, arr.length - 1, target);
}

private int binarySearch(int[] arr, int left, int right, int target) {
    if (left > right) return -1;
    
    int mid = left + (right - left) / 2;
    
    if (arr[mid] == target) {
        return mid;
    } else if (arr[mid] < target) {
        return binarySearch(arr, mid + 1, right, target);
    } else {
        return binarySearch(arr, left, mid - 1, target);
    }
}
```

### 3.4 变体

```java
/**
 * 查找第一个等于 target 的位置
 */
public int findFirst(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    int result = -1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            result = mid;
            right = mid - 1;  // 继续在左边查找
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}

/**
 * 查找最后一个等于 target 的位置
 */
public int findLast(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    int result = -1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            result = mid;
            left = mid + 1;  // 继续在右边查找
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}

/**
 * 查找第一个大于等于 target 的位置
 */
public int findFirstGreaterOrEqual(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] >= target) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    
    return left < arr.length ? left : -1;
}

/**
 * 查找最后一个小于等于 target 的位置
 */
public int findLastLessOrEqual(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] <= target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return right >= 0 ? right : -1;
}
```

---

## 4. 插值查找

### 4.1 原理

改进的二分查找，根据目标值自适应选择中间位置。

### 4.2 实现

```java
/**
 * 插值查找 O(log log n)
 */
public int interpolationSearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left <= right && target >= arr[left] && target <= arr[right]) {
        // 自适应计算 mid
        int mid = left + (right - left) * (target - arr[left]) / (arr[right] - arr[left]);
        
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

// 时间复杂度：平均 O(log log n)，最坏 O(n)
// 空间复杂度：O(1)
// 适用：有序且数据均匀分布
```

---

## 5. 斐波那契查找

### 5.1 原理

利用斐波那契数列分割数组，避免除法运算。

### 5.2 实现

```java
/**
 * 斐波那契查找 O(log n)
 */
public int fibonacciSearch(int[] arr, int target) {
    int n = arr.length;
    
    // 构建斐波那契数列
    int[] fib = new int[n + 1];
    fib[0] = 0;
    fib[1] = 1;
    for (int i = 2; i <= n; i++) {
        fib[i] = fib[i - 1] + fib[i - 2];
    }
    
    // 找到大于等于 n 的最小斐波那契数
    int k = 0;
    while (fib[k] < n) {
        k++;
    }
    
    int left = 0, right = n - 1;
    
    while (left <= right) {
        int mid = left + fib[k - 1] - 1;
        
        if (mid > right) {
            k--;
            continue;
        }
        
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
            k -= 2;
        } else {
            right = mid - 1;
            k--;
        }
    }
    
    return -1;
}

// 时间复杂度：O(log n)
// 空间复杂度：O(n)
```

---

## 6. 哈希查找

### 6.1 原理

通过哈希函数直接定位元素位置。

### 6.2 实现

```java
/**
 * 哈希查找 O(1) 平均
 */
public class HashSearch {
    private Map<Integer, Integer> map;
    
    public HashSearch() {
        map = new HashMap<>();
    }
    
    public void insert(int key, int value) {
        map.put(key, value);
    }
    
    public Integer search(int key) {
        return map.get(key);
    }
    
    public boolean contains(int key) {
        return map.containsKey(key);
    }
}

// 时间复杂度：平均 O(1)，最坏 O(n)
// 空间复杂度：O(n)
```

---

## 7. LeetCode 例题

### 7.1 二分查找

```java
/**
 * LeetCode 704. 二分查找
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
```

### 7.2 搜索旋转排序数组

```java
/**
 * LeetCode 33. 搜索旋转排序数组
 */
public int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (nums[mid] == target) {
            return mid;
        }
        
        // 判断哪边有序
        if (nums[left] <= nums[mid]) {
            // 左边有序
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            // 右边有序
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

### 7.3 寻找峰值

```java
/**
 * LeetCode 162. 寻找峰值
 */
public int findPeakElement(int[] nums) {
    int left = 0, right = nums.length - 1;
    
    while (left < right) {
        int mid = left + (right - left) / 2;
        
        if (nums[mid] > nums[mid + 1]) {
            // 峰值在左边（包括 mid）
            right = mid;
        } else {
            // 峰值在右边
            left = mid + 1;
        }
    }
    
    return left;
}

// 时间复杂度：O(log n)
// 空间复杂度：O(1)
```

### 7.4 第一个错误的版本

```java
/**
 * LeetCode 278. 第一个错误的版本
 */
public int firstBadVersion(int n) {
    int left = 1, right = n;
    
    while (left < right) {
        int mid = left + (right - left) / 2;
        
        if (isBadVersion(mid)) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    
    return left;
}

private boolean isBadVersion(int version) {
    // API 调用
    return true;
}

// 时间复杂度：O(log n)
// 空间复杂度：O(1)
```

### 7.5 搜索二维矩阵

```java
/**
 * LeetCode 74. 搜索二维矩阵
 */
public boolean searchMatrix(int[][] matrix, int target) {
    int m = matrix.length, n = matrix[0].length;
    
    // 将二维矩阵视为一维数组
    int left = 0, right = m * n - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        int midVal = matrix[mid / n][mid % n];
        
        if (midVal == target) {
            return true;
        } else if (midVal < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return false;
}

// 时间复杂度：O(log(mn))
// 空间复杂度：O(1)
```

---

## 8. 实战技巧

### 8.1 二分查找模板

```java
// 模板 1：查找等于 target 的位置
int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    
    return -1;
}

// 模板 2：查找第一个满足条件的位置
int findFirst(int[] arr, Predicate<Integer> predicate) {
    int left = 0, right = arr.length;
    
    while (left < right) {
        int mid = left + (right - left) / 2;
        
        if (predicate.test(mid)) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    
    return left;
}
```

### 8.2 注意事项

1. **防止溢出** - 使用 `left + (right - left) / 2` 而不是 `(left + right) / 2`
2. **循环条件** - `left <= right` vs `left < right`
3. **边界更新** - `mid ± 1` vs `mid`
4. **返回值** - 找到返回索引，找不到返回 -1 或插入位置

---

## 📝 待办事项

- [ ] 掌握二分查找及其变体
- [ ] 理解插值查找原理
- [ ] 了解斐波那契查找
- [ ] 掌握哈希查找
- [ ] 完成 LeetCode 5 道题
- [ ] 理解二分查找模板

---

**下一讲：[递归与分治](/data-structure-algorithm/algorithm/recursion)**

---

**推荐资源：**
- 📖 《算法 4》第 3.1 节
- 🔗 LeetCode 二分查找专题
- 🎥 B 站：二分查找详解
