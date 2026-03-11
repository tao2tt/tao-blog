# 栈与队列

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-15  
> 难度：⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 栈（Stack）

### 1.1 栈的定义

**栈：** 后进先出（LIFO）的线性表

**特点：**
- 只在一端（栈顶）进行插入/删除
- 后进先出（Last In First Out）
- 操作：push（入栈）、pop（出栈）、peek（查看栈顶）

### 1.2 栈的实现

```java
/**
 * 基于数组的栈
 */
public class ArrayStack<T> {
    private Object[] data;
    private int size;
    private int capacity;
    
    public ArrayStack(int capacity) {
        this.capacity = capacity;
        this.data = new Object[capacity];
        this.size = 0;
    }
    
    // 入栈 O(1)
    public void push(T val) {
        if (size == capacity) {
            resize(capacity * 2);
        }
        data[size++] = val;
    }
    
    // 出栈 O(1)
    public T pop() {
        if (isEmpty()) {
            throw new RuntimeException("Stack is empty");
        }
        T val = (T) data[--size];
        data[size] = null;  // 帮助 GC
        
        if (size == capacity / 4 && capacity > 0) {
            resize(capacity / 2);
        }
        
        return val;
    }
    
    // 查看栈顶 O(1)
    public T peek() {
        if (isEmpty()) {
            throw new RuntimeException("Stack is empty");
        }
        return (T) data[size - 1];
    }
    
    public int size() {
        return size;
    }
    
    public boolean isEmpty() {
        return size == 0;
    }
    
    private void resize(int newCapacity) {
        Object[] newData = new Object[newCapacity];
        System.arraycopy(data, 0, newData, 0, size);
        data = newData;
        capacity = newCapacity;
    }
}
```

### 1.3 Java 内置栈

```java
// 使用 Deque 作为栈（推荐）
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);      // 入栈
stack.push(2);
stack.push(3);

int top = stack.pop();    // 出栈：3
int peek = stack.peek();  // 查看栈顶：2

// 或者使用 Stack 类（不推荐，已过时）
Stack<Integer> stack = new Stack<>();
```

### 1.4 栈的应用场景

- 函数调用栈
- 表达式求值
- 括号匹配
- 浏览器后退
- DFS（深度优先搜索）

---

## 2. 队列（Queue）

### 2.1 队列的定义

**队列：** 先进先出（FIFO）的线性表

**特点：**
- 在一端（队尾）插入，另一端（队头）删除
- 先进先出（First In First Out）
- 操作：enqueue（入队）、dequeue（出队）、peek（查看队头）

### 2.2 队列的实现

```java
/**
 * 基于链表的队列
 */
public class LinkedQueue<T> {
    
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
    
    // 入队 O(1)
    public void enqueue(T val) {
        Node<T> node = new Node<>(val);
        
        if (tail == null) {
            head = tail = node;
        } else {
            tail.next = node;
            tail = node;
        }
        size++;
    }
    
    // 出队 O(1)
    public T dequeue() {
        if (isEmpty()) {
            throw new RuntimeException("Queue is empty");
        }
        
        T val = head.val;
        head = head.next;
        
        if (head == null) {
            tail = null;
        }
        size--;
        
        return val;
    }
    
    // 查看队头 O(1)
    public T peek() {
        if (isEmpty()) {
            throw new RuntimeException("Queue is empty");
        }
        return head.val;
    }
    
    public int size() {
        return size;
    }
    
    public boolean isEmpty() {
        return size == 0;
    }
}
```

### 2.3 循环队列

```java
/**
 * 循环队列（基于数组）
 */
public class CircularQueue<T> {
    private Object[] data;
    private int capacity;
    private int head;  // 队头指针
    private int tail;  // 队尾指针
    private int size;
    
    public CircularQueue(int capacity) {
        this.capacity = capacity + 1;  // 多一个位置用于判断队满
        this.data = new Object[this.capacity];
        this.head = 0;
        this.tail = 0;
        this.size = 0;
    }
    
    // 入队 O(1)
    public void enqueue(T val) {
        if (isFull()) {
            throw new RuntimeException("Queue is full");
        }
        
        data[tail] = val;
        tail = (tail + 1) % capacity;
        size++;
    }
    
    // 出队 O(1)
    public T dequeue() {
        if (isEmpty()) {
            throw new RuntimeException("Queue is empty");
        }
        
        T val = (T) data[head];
        data[head] = null;
        head = (head + 1) % capacity;
        size--;
        
        return val;
    }
    
    public T peek() {
        if (isEmpty()) {
            throw new RuntimeException("Queue is empty");
        }
        return (T) data[head];
    }
    
    public boolean isFull() {
        return (tail + 1) % capacity == head;
    }
    
    public boolean isEmpty() {
        return head == tail;
    }
    
    public int size() {
        return size;
    }
}
```

### 2.4 Java 内置队列

```java
// 队列
Queue<Integer> queue = new LinkedList<>();
queue.offer(1);  // 入队
queue.offer(2);
queue.offer(3);

int front = queue.poll();  // 出队：1
int peek = queue.peek();   // 查看队头：2

// 双端队列
Deque<Integer> deque = new ArrayDeque<>();
deque.offerFirst(1);  // 队头插入
deque.offerLast(2);   // 队尾插入
deque.pollFirst();    // 队头删除
deque.pollLast();     // 队尾删除
```

### 2.5 队列的应用场景

- BFS（广度优先搜索）
- 任务调度
- 消息队列
- 缓冲区
- 打印队列

---

## 3. 单调栈

### 3.1 定义

**单调栈：** 栈内元素保持单调递增或单调递减

### 3.2 模板

```java
/**
 * 单调递增栈
 */
public int[] monotonicIncreasingStack(int[] nums) {
    Deque<Integer> stack = new ArrayDeque<>();
    int[] result = new int[nums.length];
    
    for (int i = 0; i < nums.length; i++) {
        // 维护单调性
        while (!stack.isEmpty() && nums[stack.peek()] > nums[i]) {
            int index = stack.pop();
            result[index] = nums[i];  // 右边第一个更小的元素
        }
        stack.push(i);
    }
    
    return result;
}
```

### 3.3 应用：每日温度

```java
/**
 * LeetCode 739. 每日温度
 * 
 * 给定一个整数数组 temperatures，表示每天的温度，
 * 返回一个数组 answer，其中 answer[i] 是指对于第 i 天，
 * 下一个更高温度出现在几天后。
 */
public int[] dailyTemperatures(int[] temperatures) {
    int n = temperatures.length;
    int[] answer = new int[n];
    Deque<Integer> stack = new ArrayDeque<>();
    
    for (int i = 0; i < n; i++) {
        // 维护单调递减栈
        while (!stack.isEmpty() && temperatures[stack.peek()] < temperatures[i]) {
            int prevIndex = stack.pop();
            answer[prevIndex] = i - prevIndex;
        }
        stack.push(i);
    }
    
    return answer;
}

// 时间复杂度：O(n)
// 空间复杂度：O(n)
```

---

## 4. 单调队列

### 4.1 定义

**单调队列：** 队列内元素保持单调递增或单调递减

### 4.2 应用：滑动窗口最大值

```java
/**
 * LeetCode 239. 滑动窗口最大值
 * 
 * 给你一个整数数组 nums，有一个大小为 k 的滑动窗口从数组的最左侧移动到最右侧。
 * 返回滑动窗口中的最大值。
 */
public int[] maxSlidingWindow(int[] nums, int k) {
    if (nums.length == 0) return new int[0];
    
    int n = nums.length;
    int[] result = new int[n - k + 1];
    int index = 0;
    
    // 双端队列，存储索引
    Deque<Integer> deque = new ArrayDeque<>();
    
    for (int i = 0; i < n; i++) {
        // 移除超出窗口的元素
        while (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {
            deque.pollFirst();
        }
        
        // 维护单调递减
        while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) {
            deque.pollLast();
        }
        
        deque.offerLast(i);
        
        // 窗口形成后记录最大值
        if (i >= k - 1) {
            result[index++] = nums[deque.peekFirst()];
        }
    }
    
    return result;
}

// 时间复杂度：O(n)
// 空间复杂度：O(k)
```

---

## 5. LeetCode 例题

### 5.1 有效的括号

```java
/**
 * LeetCode 20. 有效的括号
 * 
 * 给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s，
 * 判断字符串是否有效。
 */
public boolean isValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    
    for (char c : s.toCharArray()) {
        if (c == '(') {
            stack.push(')');
        } else if (c == '{') {
            stack.push('}');
        } else if (c == '[') {
            stack.push(']');
        } else {
            if (stack.isEmpty() || stack.pop() != c) {
                return false;
            }
        }
    }
    
    return stack.isEmpty();
}

// 时间复杂度：O(n)
// 空间复杂度：O(n)
```

### 5.2 用栈实现队列

```java
/**
 * LeetCode 232. 用栈实现队列
 */
class MyQueue {
    private Deque<Integer> stack1;
    private Deque<Integer> stack2;
    
    public MyQueue() {
        stack1 = new ArrayDeque<>();
        stack2 = new ArrayDeque<>();
    }
    
    public void push(int x) {
        stack1.push(x);
    }
    
    public int pop() {
        if (stack2.isEmpty()) {
            while (!stack1.isEmpty()) {
                stack2.push(stack1.pop());
            }
        }
        return stack2.pop();
    }
    
    public int peek() {
        if (stack2.isEmpty()) {
            while (!stack1.isEmpty()) {
                stack2.push(stack1.pop());
            }
        }
        return stack2.peek();
    }
    
    public boolean empty() {
        return stack1.isEmpty() && stack2.isEmpty();
    }
}
```

### 5.3 用队列实现栈

```java
/**
 * LeetCode 225. 用队列实现栈
 */
class MyStack {
    private Queue<Integer> queue1;
    private Queue<Integer> queue2;
    
    public MyStack() {
        queue1 = new LinkedList<>();
        queue2 = new LinkedList<>();
    }
    
    public void push(int x) {
        queue2.offer(x);
        while (!queue1.isEmpty()) {
            queue2.offer(queue1.poll());
        }
        
        // 交换两个队列
        Queue<Integer> temp = queue1;
        queue1 = queue2;
        queue2 = temp;
    }
    
    public int pop() {
        return queue1.poll();
    }
    
    public int top() {
        return queue1.peek();
    }
    
    public boolean empty() {
        return queue1.isEmpty();
    }
}
```

### 5.4 接雨水

```java
/**
 * LeetCode 42. 接雨水
 * 
 * 给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，
 * 计算按此排列的柱子，下雨之后能接多少雨水。
 */
public int trap(int[] height) {
    int water = 0;
    Deque<Integer> stack = new ArrayDeque<>();
    
    for (int i = 0; i < height.length; i++) {
        while (!stack.isEmpty() && height[i] > height[stack.peek()]) {
            int bottom = stack.pop();
            
            if (stack.isEmpty()) break;
            
            int left = stack.peek();
            int width = i - left - 1;
            int h = Math.min(height[left], height[i]) - height[bottom];
            
            water += width * h;
        }
        stack.push(i);
    }
    
    return water;
}

// 时间复杂度：O(n)
// 空间复杂度：O(n)
```

---

## 📝 待办事项

- [ ] 理解栈的 LIFO 特性
- [ ] 理解队列的 FIFO 特性
- [ ] 手写栈实现
- [ ] 手写队列实现
- [ ] 理解循环队列
- [ ] 掌握单调栈
- [ ] 掌握单调队列
- [ ] 完成 LeetCode 5 道题

---

**下一讲：[哈希表](/data-structure-algorithm/basic/hash-table)**

---

**推荐资源：**
- 📖 《算法 4》第 1.3 节
- 🔗 LeetCode 栈专题
- 🔗 LeetCode 队列专题
