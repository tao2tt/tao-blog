# 排序算法

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-22  
> 难度：⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 排序算法对比

| 算法 | 平均时间 | 最好 | 最坏 | 空间 | 稳定性 | 类型 |
|------|----------|------|------|------|--------|------|
| 冒泡排序 | O(n²) | O(n) | O(n²) | O(1) | ✅ 稳定 | 交换 |
| 选择排序 | O(n²) | O(n²) | O(n²) | O(1) | ❌ 不稳定 | 选择 |
| 插入排序 | O(n²) | O(n) | O(n²) | O(1) | ✅ 稳定 | 插入 |
| 希尔排序 | O(n log n) | O(n) | O(n²) | O(1) | ❌ 不稳定 | 插入 |
| 归并排序 | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ 稳定 | 归并 |
| 快速排序 | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ 不稳定 | 交换 |
| 堆排序 | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ 不稳定 | 选择 |
| 计数排序 | O(n + k) | O(n + k) | O(n + k) | O(k) | ✅ 稳定 | 非比较 |
| 桶排序 | O(n + k) | O(n + k) | O(n²) | O(n + k) | ✅ 稳定 | 非比较 |
| 基数排序 | O(n × k) | O(n × k) | O(n × k) | O(n + k) | ✅ 稳定 | 非比较 |

---

## 2. 冒泡排序

### 2.1 原理

重复地走访过要排序的元素，一次比较两个元素，如果顺序错误就交换。

### 2.2 实现

```java
/**
 * 冒泡排序 O(n²)
 */
public void bubbleSort(int[] arr) {
    int n = arr.length;
    boolean swapped;
    
    for (int i = 0; i < n - 1; i++) {
        swapped = false;
        
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr, j, j + 1);
                swapped = true;
            }
        }
        
        // 优化：如果没有交换，说明已经有序
        if (!swapped) break;
    }
}

private void swap(int[] arr, int i, int j) {
    int temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

// 时间复杂度：平均 O(n²)，最好 O(n)
// 空间复杂度：O(1)
// 稳定性：稳定
```

---

## 3. 选择排序

### 3.1 原理

每次从未排序部分选择最小（或最大）的元素，放到已排序部分的末尾。

### 3.2 实现

```java
/**
 * 选择排序 O(n²)
 */
public void selectionSort(int[] arr) {
    int n = arr.length;
    
    for (int i = 0; i < n - 1; i++) {
        int minIndex = i;
        
        // 找到最小元素
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        
        // 交换到前面
        if (minIndex != i) {
            swap(arr, i, minIndex);
        }
    }
}

// 时间复杂度：O(n²)
// 空间复杂度：O(1)
// 稳定性：不稳定
```

---

## 4. 插入排序

### 4.1 原理

将未排序的元素插入到已排序部分的正确位置。

### 4.2 实现

```java
/**
 * 插入排序 O(n²)
 */
public void insertionSort(int[] arr) {
    int n = arr.length;
    
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        
        // 将比 key 大的元素向后移动
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        
        arr[j + 1] = key;
    }
}

// 时间复杂度：平均 O(n²)，最好 O(n)
// 空间复杂度：O(1)
// 稳定性：稳定
```

### 4.3 希尔排序（优化的插入排序）

```java
/**
 * 希尔排序 O(n log n)
 */
public void shellSort(int[] arr) {
    int n = arr.length;
    
    // 增量序列
    for (int gap = n / 2; gap > 0; gap /= 2) {
        // 对每个增量进行插入排序
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j = i;
            
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            
            arr[j] = temp;
        }
    }
}

// 时间复杂度：平均 O(n log n)，最坏 O(n²)
// 空间复杂度：O(1)
// 稳定性：不稳定
```

---

## 5. 归并排序

### 5.1 原理

分治法：将数组分成两半，分别排序，然后合并。

### 5.2 实现

```java
/**
 * 归并排序 O(n log n)
 */
public void mergeSort(int[] arr) {
    if (arr.length < 2) return;
    
    mergeSort(arr, 0, arr.length - 1);
}

private void mergeSort(int[] arr, int left, int right) {
    if (left >= right) return;
    
    int mid = left + (right - left) / 2;
    
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
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
// 稳定性：稳定
```

---

## 6. 快速排序

### 6.1 原理

分治法：选择一个基准，将数组分为两部分，左边都小于基准，右边都大于基准。

### 6.2 实现

```java
/**
 * 快速排序 O(n log n)
 */
public void quickSort(int[] arr) {
    quickSort(arr, 0, arr.length - 1);
}

private void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

private int partition(int[] arr, int low, int high) {
    int pivot = arr[high];  // 选择最后一个元素作为基准
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

// 时间复杂度：平均 O(n log n)，最坏 O(n²)
// 空间复杂度：O(log n)
// 稳定性：不稳定
```

### 6.3 优化：三路快排

```java
/**
 * 三路快排（处理大量重复元素）
 */
public void quickSort3Way(int[] arr) {
    quickSort3Way(arr, 0, arr.length - 1);
}

private void quickSort3Way(int[] arr, int low, int high) {
    if (low >= high) return;
    
    int lt = low;      // arr[low...lt-1] < pivot
    int i = low + 1;   // arr[lt...i-1] == pivot
    int gt = high;     // arr[gt+1...high] > pivot
    int pivot = arr[low];
    
    while (i <= gt) {
        if (arr[i] < pivot) {
            swap(arr, lt++, i++);
        } else if (arr[i] > pivot) {
            swap(arr, i, gt--);
        } else {
            i++;
        }
    }
    
    quickSort3Way(arr, low, lt - 1);
    quickSort3Way(arr, gt + 1, high);
}

// 时间复杂度：O(n log n)，大量重复时接近 O(n)
// 空间复杂度：O(log n)
```

---

## 7. 堆排序

### 7.1 原理

利用堆这种数据结构，将最大元素移到末尾。

### 7.2 实现

```java
/**
 * 堆排序 O(n log n)
 */
public void heapSort(int[] arr) {
    int n = arr.length;
    
    // 建堆 O(n)
    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    // 排序 O(n log n)
    for (int i = n - 1; i > 0; i--) {
        swap(arr, 0, i);      // 将堆顶移到末尾
        heapify(arr, i, 0);   // 重新堆化
    }
}

private void heapify(int[] arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    
    if (largest != i) {
        swap(arr, i, largest);
        heapify(arr, n, largest);
    }
}

// 时间复杂度：O(n log n)
// 空间复杂度：O(1)
// 稳定性：不稳定
```

---

## 8. 非比较排序

### 8.1 计数排序

```java
/**
 * 计数排序 O(n + k)
 */
public void countingSort(int[] arr) {
    if (arr.length == 0) return;
    
    int min = arr[0], max = arr[0];
    for (int num : arr) {
        min = Math.min(min, num);
        max = Math.max(max, num);
    }
    
    int[] count = new int[max - min + 1];
    
    for (int num : arr) {
        count[num - min]++;
    }
    
    int index = 0;
    for (int i = 0; i < count.length; i++) {
        while (count[i]-- > 0) {
            arr[index++] = i + min;
        }
    }
}

// 时间复杂度：O(n + k)
// 空间复杂度：O(k)
// 稳定性：稳定
// 适用：整数范围较小
```

### 8.2 桶排序

```java
/**
 * 桶排序 O(n + k)
 */
public void bucketSort(int[] arr) {
    if (arr.length == 0) return;
    
    int min = arr[0], max = arr[0];
    for (int num : arr) {
        min = Math.min(min, num);
        max = Math.max(max, num);
    }
    
    int bucketCount = (max - min) / arr.length + 1;
    List<List<Integer>> buckets = new ArrayList<>();
    
    for (int i = 0; i < bucketCount; i++) {
        buckets.add(new ArrayList<>());
    }
    
    // 分配到桶
    for (int num : arr) {
        int index = (num - min) / arr.length;
        buckets.get(index).add(num);
    }
    
    // 每个桶内排序
    int index = 0;
    for (List<Integer> bucket : buckets) {
        Collections.sort(bucket);
        for (int num : bucket) {
            arr[index++] = num;
        }
    }
}

// 时间复杂度：平均 O(n + k)，最坏 O(n²)
// 空间复杂度：O(n + k)
// 稳定性：稳定
// 适用：数据均匀分布
```

### 8.3 基数排序

```java
/**
 * 基数排序 O(n × k)
 */
public void radixSort(int[] arr) {
    if (arr.length == 0) return;
    
    int max = arr[0];
    for (int num : arr) {
        max = Math.max(max, num);
    }
    
    // 按每一位排序
    for (int exp = 1; max / exp > 0; exp *= 10) {
        countingSortByDigit(arr, exp);
    }
}

private void countingSortByDigit(int[] arr, int exp) {
    int n = arr.length;
    int[] output = new int[n];
    int[] count = new int[10];
    
    for (int num : arr) {
        int digit = (num / exp) % 10;
        count[digit]++;
    }
    
    for (int i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }
    
    for (int i = n - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[--count[digit]] = arr[i];
    }
    
    System.arraycopy(output, 0, arr, 0, n);
}

// 时间复杂度：O(n × k)
// 空间复杂度：O(n + k)
// 稳定性：稳定
// 适用：整数，位数较少
```

---

## 9. LeetCode 例题

### 9.1 排序数组

```java
/**
 * LeetCode 912. 排序数组
 */
public int[] sortArray(int[] nums) {
    // 使用归并排序
    mergeSort(nums);
    return nums;
}

// 或者使用快速排序
public int[] sortArray(int[] nums) {
    quickSort(nums);
    return nums;
}
```

### 9.2 颜色分类

```java
/**
 * LeetCode 75. 颜色分类
 * 荷兰国旗问题
 */
public void sortColors(int[] nums) {
    int low = 0, mid = 0, high = nums.length - 1;
    
    while (mid <= high) {
        if (nums[mid] == 0) {
            swap(nums, low++, mid++);
        } else if (nums[mid] == 1) {
            mid++;
        } else {
            swap(nums, mid, high--);
        }
    }
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

### 9.3 最大数

```java
/**
 * LeetCode 179. 最大数
 */
public String largestNumber(int[] nums) {
    String[] strs = new String[nums.length];
    for (int i = 0; i < nums.length; i++) {
        strs[i] = String.valueOf(nums[i]);
    }
    
    // 自定义排序
    Arrays.sort(strs, (a, b) -> (b + a).compareTo(a + b));
    
    // 处理前导 0
    if (strs[0].equals("0")) {
        return "0";
    }
    
    StringBuilder sb = new StringBuilder();
    for (String s : strs) {
        sb.append(s);
    }
    
    return sb.toString();
}

// 时间复杂度：O(n log n)
// 空间复杂度：O(n)
```

---

## 📝 待办事项

- [ ] 理解 9 大排序算法原理
- [ ] 掌握手写冒泡/选择/插入排序
- [ ] 掌握归并排序
- [ ] 掌握快速排序
- [ ] 掌握堆排序
- [ ] 理解计数/桶/基数排序
- [ ] 完成 LeetCode 3 道题
- [ ] 理解稳定性概念

---

**下一讲：[查找算法](/data-structure-algorithm/algorithm/searching)**

---

**推荐资源：**
- 📖 《算法 4》第 2 章
- 🔗 LeetCode 排序专题
- 🎥 B 站：9 大排序算法详解
