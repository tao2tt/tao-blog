# 数组与链表

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-14  
> 难度：⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 数组（Array）

### 1.1 数组的定义

**数组：** 相同类型元素的有序集合，在连续内存空间中存储。

**特点：**
- ✅ 随机访问快（O(1)）
- ❌ 插入/删除慢（O(n)）
- ❌ 大小固定（静态数组）

### 1.2 Java 数组实现

```java
/**
 * 自定义动态数组
 */
public class DynamicArray<T> {
    private Object[] data;
    private int size;
    private int capacity;
    
    public DynamicArray(int capacity) {
        this.capacity = capacity;
        this.data = new Object[capacity];
        this.size = 0;
    }
    
    // 添加元素
    public void add(T element) {
        if (size == capacity) {
            resize(capacity * 2);  // 扩容 2 倍
        }
        data[size++] = element;
    }
    
    // 在指定位置插入
    public void add(int index, T element) {
        if (index < 0 || index > size) {
            throw new IndexOutOfBoundsException();
        }
        
        if (size == capacity) {
            resize(capacity * 2);
        }
        
        // 元素后移
        for (int i = size; i > index; i--) {
            data[i] = data[i - 1];
        }
        
        data[index] = element;
        size++;
    }
    
    // 删除元素
    public T remove(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException();
        }
        
        T oldVal = (T) data[index];
        
        // 元素前移
        for (int i = index; i < size - 1; i--) {
            data[i] = data[i + 1];
        }
        
        data[--size] = null;  // 帮助 GC
        
        // 缩容（可选）
        if (size == capacity / 4 && capacity > 0) {
            resize(capacity / 2);
        }
        
        return oldVal;
    }
    
    // 获取元素
    public T get(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException();
        }
        return (T) data[index];
    }
    
    // 设置元素
    public void set(int index, T element) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException();
        }
        data[index] = element;
    }
    
    // 扩容
    private void resize(int newCapacity) {
        Object[] newData = new Object[newCapacity];
        System.arraycopy(data, 0, newData, 0, size);
        data = newData;
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

### 1.3 数组的优缺点

| 优点 | 缺点 |
|------|------|
| 随机访问 O(1) | 插入/删除 O(n) |
| 内存连续，缓存友好 | 大小固定（静态数组） |
| 实现简单 | 扩容成本高 |

---

## 2. 链表（Linked List）

### 2.1 链表的定义

**链表：** 由节点组成的线性表，节点在内存中可以不连续。

**特点：**
- ✅ 插入/删除快（O(1)）
- ❌ 随机访问慢（O(n)）
- ✅ 动态大小

### 2.2 单链表实现

```java
/**
 * 单链表
 */
public class SinglyLinkedList<T> {
    
    // 节点定义
    private static class Node<T> {
        T val;
        Node<T> next;
        
        Node(T val) {
            this.val = val;
        }
    }
    
    private Node<T> head;
    private Node<T> tail;
    private int size;
    
    // 头部插入 O(1)
    public void addFirst(T val) {
        Node<T> node = new Node<>(val);
        node.next = head;
        head = node;
        
        if (tail == null) {
            tail = head;
        }
        size++;
    }
    
    // 尾部插入 O(1)
    public void addLast(T val) {
        Node<T> node = new Node<>(val);
        
        if (tail == null) {
            head = tail = node;
        } else {
            tail.next = node;
            tail = node;
        }
        size++;
    }
    
    // 指定位置插入 O(n)
    public void add(int index, T val) {
        if (index < 0 || index > size) {
            throw new IndexOutOfBoundsException();
        }
        
        if (index == 0) {
            addFirst(val);
            return;
        }
        
        if (index == size) {
            addLast(val);
            return;
        }
        
        Node<T> prev = getNode(index - 1);
        Node<T> node = new Node<>(val);
        node.next = prev.next;
        prev.next = node;
        size++;
    }
    
    // 删除指定位置 O(n)
    public T remove(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException();
        }
        
        Node<T> removed;
        
        if (index == 0) {
            removed = head;
            head = head.next;
            if (head == null) {
                tail = null;
            }
        } else {
            Node<T> prev = getNode(index - 1);
            removed = prev.next;
            prev.next = removed.next;
            if (removed == tail) {
                tail = prev;
            }
        }
        
        size--;
        return removed.val;
    }
    
    // 获取元素 O(n)
    public T get(int index) {
        return getNode(index).val;
    }
    
    // 设置元素 O(n)
    public void set(int index, T val) {
        getNode(index).val = val;
    }
    
    // 获取节点（辅助方法）
    private Node<T> getNode(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException();
        }
        
        Node<T> curr = head;
        for (int i = 0; i < index; i++) {
            curr = curr.next;
        }
        return curr;
    }
    
    // 查找元素 O(n)
    public int indexOf(T val) {
        Node<T> curr = head;
        int index = 0;
        
        while (curr != null) {
            if (Objects.equals(curr.val, val)) {
                return index;
            }
            curr = curr.next;
            index++;
        }
        
        return -1;
    }
    
    public int size() {
        return size;
    }
    
    public boolean isEmpty() {
        return size == 0;
    }
    
    // 反转链表
    public void reverse() {
        Node<T> prev = null;
        Node<T> curr = head;
        
        while (curr != null) {
            Node<T> next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        
        tail = head;
        head = prev;
    }
    
    // 打印链表
    public void print() {
        Node<T> curr = head;
        while (curr != null) {
            System.out.print(curr.val + " -> ");
            curr = curr.next;
        }
        System.out.println("null");
    }
}
```

### 2.3 双链表实现

```java
/**
 * 双向链表
 */
public class DoublyLinkedList<T> {
    
    // 双链表节点
    private static class Node<T> {
        T val;
        Node<T> prev;
        Node<T> next;
        
        Node(T val) {
            this.val = val;
        }
    }
    
    private Node<T> head;
    private Node<T> tail;
    private int size;
    
    // 头部插入 O(1)
    public void addFirst(T val) {
        Node<T> node = new Node<>(val);
        node.next = head;
        
        if (head != null) {
            head.prev = node;
        }
        
        head = node;
        
        if (tail == null) {
            tail = head;
        }
        size++;
    }
    
    // 尾部插入 O(1)
    public void addLast(T val) {
        Node<T> node = new Node<>(val);
        
        if (tail == null) {
            head = tail = node;
        } else {
            tail.next = node;
            node.prev = tail;
            tail = node;
        }
        size++;
    }
    
    // 删除指定节点 O(1)
    public void removeNode(Node<T> node) {
        if (node.prev != null) {
            node.prev.next = node.next;
        } else {
            head = node.next;
        }
        
        if (node.next != null) {
            node.next.prev = node.prev;
        } else {
            tail = node.prev;
        }
        
        size--;
    }
    
    public int size() {
        return size;
    }
}
```

### 2.4 链表的优缺点

| 优点 | 缺点 |
|------|------|
| 插入/删除 O(1) | 随机访问 O(n) |
| 动态大小 | 额外内存（指针） |
| 无需扩容 | 缓存不友好 |

---

## 3. 数组 vs 链表对比

| 特性 | 数组 | 链表 |
|------|------|------|
| 访问 | O(1) | O(n) |
| 插入（头部） | O(n) | O(1) |
| 插入（尾部） | O(1)* | O(1)** |
| 删除 | O(n) | O(1)*** |
| 空间 | 连续，紧凑 | 分散，有指针开销 |
| 缓存友好 | ✅ | ❌ |
| 大小 | 固定/动态扩容 | 动态 |

* 动态数组尾部插入均摊 O(1)  
** 需要维护 tail 指针  
*** 需要知道前驱节点

---

## 4. LeetCode 例题

### 4.1 两数之和（数组 + 哈希表）

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

### 4.2 反转链表

```java
/**
 * LeetCode 206. 反转链表
 * 
 * 给你单链表的头节点 head，反转链表并返回反转后的链表。
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

### 4.3 合并两个有序链表

```java
/**
 * LeetCode 21. 合并两个有序链表
 * 
 * 将两个升序链表合并为一个新的升序链表并返回。
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

### 4.4 删除链表倒数第 N 个节点

```java
/**
 * LeetCode 19. 删除链表的倒数第 N 个节点
 * 
 * 给你一个链表，删除链表的倒数第 n 个结点，并且返回链表的头结点。
 */
public ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0);
    dummy.next = head;
    
    ListNode first = dummy;
    ListNode second = dummy;
    
    // first 先走 n+1 步
    for (int i = 0; i <= n; i++) {
        first = first.next;
    }
    
    // 同时移动，直到 first 到达末尾
    while (first != null) {
        first = first.next;
        second = second.next;
    }
    
    // 删除节点
    second.next = second.next.next;
    
    return dummy.next;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

### 4.5 环形链表

```java
/**
 * LeetCode 141. 环形链表
 * 
 * 给你一个链表的头节点 head，判断链表中是否有环。
 */
public boolean hasCycle(ListNode head) {
    if (head == null || head.next == null) {
        return false;
    }
    
    ListNode slow = head;
    ListNode fast = head.next;
    
    while (slow != fast) {
        if (fast == null || fast.next == null) {
            return false;
        }
        slow = slow.next;
        fast = fast.next.next;
    }
    
    return true;
}

// 时间复杂度：O(n)
// 空间复杂度：O(1)
```

---

## 5. 实战技巧

### 5.1 数组技巧

**双指针：**
```java
// 两数之和 II（有序数组）
public int[] twoSum(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    
    while (left < right) {
        int sum = nums[left] + nums[right];
        
        if (sum == target) {
            return new int[] { left + 1, right + 1 };
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return new int[] { -1, -1 };
}
```

**滑动窗口：**
```java
// 最大子数组和
public int maxSubArray(int[] nums) {
    int maxSum = nums[0];
    int currentSum = nums[0];
    
    for (int i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}
```

### 5.2 链表技巧

**虚拟头节点：**
```java
// 简化边界处理
ListNode dummy = new ListNode(0);
dummy.next = head;
```

**快慢指针：**
```java
// 找中点
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
}
// slow 指向中点
```

**链表反转：**
```java
// 记住三步：保存下一个、反转指针、移动指针
ListNode next = curr.next;
curr.next = prev;
prev = curr;
curr = next;
```

---

## 📝 待办事项

- [ ] 理解数组与链表的区别
- [ ] 手写动态数组实现
- [ ] 手写单链表实现
- [ ] 掌握链表反转
- [ ] 完成 LeetCode 5 道题
- [ ] 理解双指针技巧
- [ ] 理解快慢指针技巧

---

**下一讲：[栈与队列](/data-structure-algorithm/basic/stack-queue)**

---

**推荐资源：**
- 📖 《算法 4》第 1.3 节
- 🔗 LeetCode 数组专题
- 🔗 LeetCode 链表专题
