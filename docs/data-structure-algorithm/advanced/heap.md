# 堆与优先队列

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-19  
> 难度：⭐⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 堆的定义

**堆（Heap）：** 一种完全二叉树，满足堆序性

**分类：**
- **大顶堆（Max Heap）** - 每个节点 >= 子节点
- **小顶堆（Min Heap）** - 每个节点 <= 子节点

**特点：**
- ✅ 插入 O(log n)
- ✅ 删除堆顶 O(log n)
- ✅ 获取堆顶 O(1)
- ❌ 查找任意元素 O(n)

---

## 2. 堆的实现

### 2.1 数组表示

```
索引关系（从 0 开始）：
- 父节点：(i - 1) / 2
- 左子节点：2 * i + 1
- 右子节点：2 * i + 2
```

### 2.2 小顶堆实现

```java
/**
 * 小顶堆
 */
public class MinHeap {
    private int[] heap;
    private int size;
    private int capacity;
    
    public MinHeap(int capacity) {
        this.capacity = capacity;
        this.heap = new int[capacity];
        this.size = 0;
    }
    
    // 获取父节点索引
    private int parent(int i) {
        return (i - 1) / 2;
    }
    
    // 获取左子节点索引
    private int leftChild(int i) {
        return 2 * i + 1;
    }
    
    // 获取右子节点索引
    private int rightChild(int i) {
        return 2 * i + 2;
    }
    
    // 交换元素
    private void swap(int i, int j) {
        int temp = heap[i];
        heap[i] = heap[j];
        heap[j] = temp;
    }
    
    // 上浮（插入时使用）
    private void swim(int i) {
        while (i > 0 && heap[parent(i)] > heap[i]) {
            swap(i, parent(i));
            i = parent(i);
        }
    }
    
    // 下沉（删除时使用）
    private void sink(int i) {
        int smallest = i;
        int left = leftChild(i);
        int right = rightChild(i);
        
        if (left < size && heap[left] < heap[smallest]) {
            smallest = left;
        }
        
        if (right < size && heap[right] < heap[smallest]) {
            smallest = right;
        }
        
        if (smallest != i) {
            swap(i, smallest);
            sink(smallest);
        }
    }
    
    // 插入 O(log n)
    public void offer(int val) {
        if (size == capacity) {
            resize(capacity * 2);
        }
        
        heap[size++] = val;
        swim(size - 1);
    }
    
    // 获取堆顶 O(1)
    public int peek() {
        if (size == 0) {
            throw new RuntimeException("Heap is empty");
        }
        return heap[0];
    }
    
    // 删除堆顶 O(log n)
    public int poll() {
        if (size == 0) {
            throw new RuntimeException("Heap is empty");
        }
        
        int min = heap[0];
        heap[0] = heap[--size];
        heap[size] = 0;  // 帮助 GC
        sink(0);
        
        if (size == capacity / 4 && capacity > 0) {
            resize(capacity / 2);
        }
        
        return min;
    }
    
    // 堆化（建堆）O(n)
    public void heapify(int[] arr) {
        heap = arr;
        size = arr.length;
        capacity = arr.length;
        
        // 从最后一个非叶子节点开始下沉
        for (int i = parent(size - 1); i >= 0; i--) {
            sink(i);
        }
    }
    
    // 扩容
    private void resize(int newCapacity) {
        int[] newHeap = new int[newCapacity];
        System.arraycopy(heap, 0, newHeap, 0, size);
        heap = newHeap;
        capacity = newCapacity;
    }
    
    public int size() {
        return size;
    }
    
    public boolean isEmpty() {
        return size == 0;
    }
}
```

### 2.3 大顶堆实现

```java
/**
 * 大顶堆
 */
public class MaxHeap {
    private int[] heap;
    private int size;
    
    // 下沉（大顶堆）
    private void sink(int i) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        
        if (left < size && heap[left] > heap[largest]) {
            largest = left;
        }
        
        if (right < size && heap[right] > heap[largest]) {
            largest = right;
        }
        
        if (largest != i) {
            swap(i, largest);
            sink(largest);
        }
    }
    
    // 上浮（大顶堆）
    private void swim(int i) {
        while (i > 0 && heap[(i - 1) / 2] < heap[i]) {
            swap(i, (i - 1) / 2);
            i = (i - 1) / 2;
        }
    }
}
```

---

## 3. Java 内置优先队列

### 3.1 小顶堆

```java
// 默认小顶堆
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
minHeap.offer(3);
minHeap.offer(1);
minHeap.offer(2);

System.out.println(minHeap.peek());  // 1
System.out.println(minHeap.poll());  // 1
```

### 3.2 大顶堆

```java
// 大顶堆
PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);
maxHeap.offer(3);
maxHeap.offer(1);
maxHeap.offer(2);

System.out.println(maxHeap.peek());  // 3
System.out.println(maxHeap.poll());  // 3
```

### 3.3 自定义对象

```java
// 按频率排序
PriorityQueue<Map.Entry<Integer, Integer>> pq = 
    new PriorityQueue<>((a, b) -> b.getValue() - a.getValue());

// 按字符串长度排序
PriorityQueue<String> pq = new PriorityQueue<>((a, b) -> a.length() - b.length());
```

---

## 4. 堆排序

```java
/**
 * 堆排序 O(n log n)
 */
public void heapSort(int[] arr) {
    int n = arr.length;
    
    // 1. 建堆 O(n)
    for (int i = parent(n - 1); i >= 0; i--) {
        sink(arr, i, n);
    }
    
    // 2. 排序 O(n log n)
    for (int i = n - 1; i > 0; i--) {
        // 将堆顶元素移到末尾
        swap(arr, 0, i);
        // 重新堆化
        sink(arr, 0, i);
    }
}

private void sink(int[] arr, int i, int n) {
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
        sink(arr, largest, n);
    }
}

private int parent(int i) {
    return (i - 1) / 2;
}

private void swap(int[] arr, int i, int j) {
    int temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

// 时间复杂度：O(n log n)
// 空间复杂度：O(1)
```

---

## 5. LeetCode 例题

### 5.1 数组中的第 K 个最大元素

```java
/**
 * LeetCode 215. 数组中的第 K 个最大元素
 */
public int findKthLargest(int[] nums, int k) {
    // 小顶堆，保持 k 个最大元素
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

### 5.2 前 K 个高频元素

```java
/**
 * LeetCode 347. 前 K 个高频元素
 */
public int[] topKFrequent(int[] nums, int k) {
    // 统计频率
    Map<Integer, Integer> freq = new HashMap<>();
    for (int num : nums) {
        freq.put(num, freq.getOrDefault(num, 0) + 1);
    }
    
    // 小顶堆，按频率排序
    PriorityQueue<Integer> pq = new PriorityQueue<>(
        (a, b) -> freq.get(a) - freq.get(b)
    );
    
    for (int num : freq.keySet()) {
        if (pq.size() < k) {
            pq.offer(num);
        } else if (freq.get(num) > freq.get(pq.peek())) {
            pq.poll();
            pq.offer(num);
        }
    }
    
    // 输出结果
    int[] result = new int[k];
    for (int i = 0; i < k; i++) {
        result[i] = pq.poll();
    }
    
    return result;
}

// 时间复杂度：O(n log k)
// 空间复杂度：O(n)
```

### 5.3 合并 K 个升序链表

```java
/**
 * LeetCode 23. 合并 K 个升序链表
 */
public ListNode mergeKLists(ListNode[] lists) {
    if (lists == null || lists.length == 0) {
        return null;
    }
    
    // 小顶堆，按节点值排序
    PriorityQueue<ListNode> pq = new PriorityQueue<>(
        (a, b) -> a.val - b.val
    );
    
    // 将每个链表的头节点加入堆
    for (ListNode node : lists) {
        if (node != null) {
            pq.offer(node);
        }
    }
    
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;
    
    while (!pq.isEmpty()) {
        ListNode node = pq.poll();
        curr.next = node;
        curr = curr.next;
        
        if (node.next != null) {
            pq.offer(node.next);
        }
    }
    
    return dummy.next;
}

// 时间复杂度：O(n log k)
// 空间复杂度：O(k)
```

### 5.4 数据流的中位数

```java
/**
 * LeetCode 295. 数据流的中位数
 */
class MedianFinder {
    // 大顶堆（左半部分）
    private PriorityQueue<Integer> left;
    // 小顶堆（右半部分）
    private PriorityQueue<Integer> right;
    
    public MedianFinder() {
        left = new PriorityQueue<>((a, b) -> b - a);
        right = new PriorityQueue<>();
    }
    
    public void addNum(int num) {
        // 先加入左半部分
        left.offer(num);
        // 将左半部分最大值移到右半部分
        right.offer(left.poll());
        
        // 保持平衡（左半部分可以比右半部分多 1 个）
        if (left.size() < right.size()) {
            left.offer(right.poll());
        }
    }
    
    public double findMedian() {
        if (left.size() == right.size()) {
            return (left.peek() + right.peek()) / 2.0;
        } else {
            return left.peek();
        }
    }
}

// 时间复杂度：addNum O(log n), findMedian O(1)
// 空间复杂度：O(n)
```

### 5.5 接雨水 II

```java
/**
 * LeetCode 407. 接雨水 II
 * 
 * 给你一个 m x n 的矩阵，其中的值均为非负整数，代表二维高度图每个单元的高度，
 * 请计算图中形状最多能接多少体积的雨水。
 */
public int trapRainWater(int[][] heightMap) {
    if (heightMap == null || heightMap.length < 3 || heightMap[0].length < 3) {
        return 0;
    }
    
    int m = heightMap.length;
    int n = heightMap[0].length;
    
    // 小顶堆，按高度排序
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[2] - b[2]);
    boolean[][] visited = new boolean[m][n];
    
    // 将边界加入堆
    for (int i = 0; i < m; i++) {
        pq.offer(new int[]{i, 0, heightMap[i][0]});
        pq.offer(new int[]{i, n - 1, heightMap[i][n - 1]});
        visited[i][0] = true;
        visited[i][n - 1] = true;
    }
    
    for (int j = 1; j < n - 1; j++) {
        pq.offer(new int[]{0, j, heightMap[0][j]});
        pq.offer(new int[]{m - 1, j, heightMap[m - 1][j]});
        visited[0][j] = true;
        visited[m - 1][j] = true;
    }
    
    int water = 0;
    int[][] dirs = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
    
    while (!pq.isEmpty()) {
        int[] cell = pq.poll();
        int x = cell[0], y = cell[1], h = cell[2];
        
        // 遍历四个方向
        for (int[] dir : dirs) {
            int nx = x + dir[0];
            int ny = y + dir[1];
            
            if (nx >= 0 && nx < m && ny >= 0 && ny < n && !visited[nx][ny]) {
                visited[nx][ny] = true;
                
                // 如果邻居高度小于当前高度，可以接水
                if (heightMap[nx][ny] < h) {
                    water += h - heightMap[nx][ny];
                }
                
                // 将邻居加入堆（高度取 max）
                pq.offer(new int[]{nx, ny, Math.max(h, heightMap[nx][ny])});
            }
        }
    }
    
    return water;
}

// 时间复杂度：O(mn log(m+n))
// 空间复杂度：O(mn)
```

---

## 6. 实战技巧

### 6.1 Top K 问题

```java
// 求最大的 K 个元素 → 用小顶堆
PriorityQueue<Integer> pq = new PriorityQueue<>(k);

// 求最小的 K 个元素 → 用大顶堆
PriorityQueue<Integer> pq = new PriorityQueue<>(k, (a, b) -> b - a);
```

### 6.2 中位数问题

```java
// 双堆法：大顶堆 + 小顶堆
PriorityQueue<Integer> left = new PriorityQueue<>((a, b) -> b - a);
PriorityQueue<Integer> right = new PriorityQueue<>();
```

### 6.3 合并多个有序序列

```java
// 多路归并：小顶堆维护每个序列的当前最小值
PriorityQueue<Node> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
```

---

## 📝 待办事项

- [ ] 理解堆的定义和性质
- [ ] 掌握堆的插入/删除操作
- [ ] 掌握上浮/下沉操作
- [ ] 理解堆排序原理
- [ ] 掌握优先队列使用
- [ ] 完成 LeetCode 5 道题
- [ ] 掌握 Top K 问题解法

---

**下一讲：[图论基础](/data-structure-algorithm/advanced/graph)**

---

**推荐资源：**
- 📖 《算法 4》第 2.4 节
- 🔗 LeetCode 堆专题
- 🔗 LeetCode 优先队列
