# 贪心算法

> 学习日期：2026-03-13  
> 状态：📝 学习中  
> 预计完成：2026-06-02  
> 难度：⭐⭐⭐⭐☆  
> 前置知识：[递归与分治](/data-structure-algorithm/algorithm/recursion)、[排序算法](/data-structure-algorithm/algorithm/sorting)

---

## 📚 目录

[[toc]]

---

## 1. 贪心算法基础

### 1.1 什么是贪心算法

**贪心算法（Greedy Algorithm）** 是在每一步选择中都采取当前状态下最优的选择，从而希望导致全局最优解的算法。

**核心思想：** 局部最优 → 全局最优

**生活案例：**
```
找零钱问题：
要找 67 元，有 [50, 20, 10, 5, 1] 元纸币

贪心策略：每次选择最大面额
1. 选 50 元，剩余 17 元
2. 选 10 元，剩余 7 元
3. 选 5 元，剩余 2 元
4. 选 1 元，剩余 1 元
5. 选 1 元，剩余 0 元

结果：50+10+5+1+1 = 67 元（5 张纸币，最优解）
```

### 1.2 贪心 vs 动态规划

| 对比项 | 贪心算法 | 动态规划 |
|--------|---------|---------|
| **选择策略** | 当前最优 | 全局最优 |
| **回溯** | ❌ 不回溯 | ✅ 会回溯 |
| **子问题** | 依赖当前选择 | 依赖所有子问题 |
| **时间复杂度** | 通常较低 | 通常较高 |
| **适用场景** | 贪心选择性质 | 最优子结构 |

### 1.3 贪心算法要素

**贪心算法两要素：**

1. **贪心选择性质**
   - 可以通过局部最优选择达到全局最优
   - 不需要考虑子问题的解

2. **最优子结构**
   - 问题的最优解包含子问题的最优解
   - 原问题可以分解为子问题

### 1.4 贪心算法步骤

```
贪心算法步骤：

1. 建立数学模型描述问题
   ↓
2. 将问题分解为若干子问题
   ↓
3. 对每个子问题做出贪心选择
   ↓
4. 将所有子问题的解合并为原问题的解
```

---

## 2. 贪心经典问题

### 2.1 活动选择问题

```python
def activity_selection(activities):
    """
    活动选择问题
    
    问题描述：
    有 n 个活动，每个活动有开始时间和结束时间
    同一时间只能参加一个活动
    求最多能参加多少个活动
    
    贪心策略：
    每次选择结束时间最早且与已选活动不冲突的活动
    
    证明：
    选择结束时间最早的活动，给后续活动留下更多时间
    
    时间复杂度：O(n log n)（排序）
    空间复杂度：O(1)
    
    参数:
        activities: 活动列表 [(start, end), ...]
    
    返回:
        最多能参加的活动数
    """
    if not activities:
        return 0
    
    # 按结束时间排序
    activities.sort(key=lambda x: x[1])
    
    count = 1  # 至少可以选择第一个活动
    last_end = activities[0][1]
    
    # 遍历剩余活动
    for i in range(1, len(activities)):
        start, end = activities[i]
        
        # 如果开始时间 >= 上一个活动的结束时间，可以选择
        if start >= last_end:
            count += 1
            last_end = end
    
    return count

# 示例
# 活动：(开始时间，结束时间)
activities = [(1, 3), (2, 4), (3, 5), (0, 6), (5, 7), (8, 9), (5, 9)]
# 
# 按结束时间排序：
# (1,3), (2,4), (3,5), (0,6), (5,7), (8,9), (5,9)
# 
# 贪心选择：
# 1. 选 (1,3)，结束时间 3
# 2. (2,4) 冲突，跳过
# 3. 选 (3,5)，结束时间 5
# 4. (0,6) 冲突，跳过
# 5. 选 (5,7)，结束时间 7
# 6. 选 (8,9)，结束时间 9
# 
# 结果：4 个活动 [(1,3), (3,5), (5,7), (8,9)]

print(activity_selection(activities))  # 输出：4
```

### 2.2 区间调度问题

```python
def interval_scheduling(intervals):
    """
    区间调度问题（活动选择的变种）
    
    问题描述：
    给定多个区间，选择不重叠的区间，使得数量最多
    
    贪心策略：
    按结束时间排序，每次选择结束最早且不重叠的区间
    
    时间复杂度：O(n log n)
    空间复杂度：O(1)
    
    参数:
        intervals: 区间列表 [[start, end], ...]
    
    返回:
        最多不重叠区间数
    """
    if not intervals:
        return 0
    
    # 按结束时间排序
    intervals.sort(key=lambda x: x[1])
    
    count = 1
    last_end = intervals[0][1]
    
    for i in range(1, len(intervals)):
        start, end = intervals[i]
        
        if start >= last_end:
            count += 1
            last_end = end
    
    return count

# 示例
intervals = [[1, 3], [2, 4], [3, 5], [0, 6], [5, 7], [8, 9]]
print(interval_scheduling(intervals))  # 输出：4
```

### 2.3 区间合并问题

```python
def merge_intervals(intervals):
    """
    区间合并问题
    
    问题描述：
    给定多个区间，合并所有重叠的区间
    
    贪心策略：
    1. 按开始时间排序
    2. 遍历区间，如果重叠则合并
    
    时间复杂度：O(n log n)
    空间复杂度：O(1)
    
    参数:
        intervals: 区间列表 [[start, end], ...]
    
    返回:
        合并后的区间列表
    """
    if not intervals:
        return []
    
    # 按开始时间排序
    intervals.sort(key=lambda x: x[0])
    
    merged = [intervals[0]]
    
    for i in range(1, len(intervals)):
        start, end = intervals[i]
        last_start, last_end = merged[-1]
        
        # 如果重叠，合并
        if start <= last_end:
            merged[-1][1] = max(last_end, end)
        else:
            # 不重叠，添加新区间
            merged.append([start, end])
    
    return merged

# 示例
intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]
# 排序后：[[1,3], [2,6], [8,10], [15,18]]
# 
# 合并过程：
# 1. merged = [[1,3]]
# 2. [2,6] 与 [1,3] 重叠（2<=3），合并为 [1,6]
# 3. [8,10] 不重叠，添加
# 4. [15,18] 不重叠，添加
# 
# 结果：[[1,6], [8,10], [15,18]]

print(merge_intervals(intervals))
# 输出：[[1, 6], [8, 10], [15, 18]]
```

### 2.4 无重叠区间

```python
def erase_overlap_intervals(intervals):
    """
    无重叠区间
    
    LeetCode 435. 无重叠区间
    
    问题描述：
    给定多个区间，计算最少需要移除多少个区间，使得剩余区间不重叠
    
    贪心策略：
    等价于求最多能保留多少个不重叠区间
    按结束时间排序，每次选择结束最早且不重叠的区间
    
    时间复杂度：O(n log n)
    空间复杂度：O(1)
    
    参数:
        intervals: 区间列表 [[start, end], ...]
    
    返回:
        最少需要移除的区间数
    """
    if not intervals:
        return 0
    
    # 按结束时间排序
    intervals.sort(key=lambda x: x[1])
    
    count = 1  # 至少保留一个
    last_end = intervals[0][1]
    
    for i in range(1, len(intervals)):
        start, end = intervals[i]
        
        if start >= last_end:
            count += 1
            last_end = end
    
    # 需要移除的数量 = 总数 - 保留的数量
    return len(intervals) - count

# 示例
intervals = [[1, 2], [2, 3], [3, 4], [1, 3]]
# 按结束时间排序：[[1,2], [2,3], [1,3], [3,4]]
# 
# 贪心选择：
# 1. 选 [1,2]
# 2. 选 [2,3]
# 3. [1,3] 冲突，跳过
# 4. 选 [3,4]
# 
# 保留 3 个，移除 1 个

print(erase_overlap_intervals(intervals))  # 输出：1
```

---

## 3. 分配问题

### 3.1 分配饼干

```python
def find_content_children(g, s):
    """
    分配饼干
    
    LeetCode 455. 分发饼干
    
    问题描述：
    g[i] 表示第 i 个孩子的胃口值
    s[j] 表示第 j 块饼干的大小
    每个孩子最多一块饼干
    求最多能满足多少个孩子
    
    贪心策略：
    1. 小饼干优先满足小胃口的孩子
    2. 大饼干留给大胃口的孩子
    
    时间复杂度：O(n log n + m log m)
    空间复杂度：O(1)
    
    参数:
        g: 孩子的胃口值列表
        s: 饼干大小列表
    
    返回:
        最多能满足的孩子数
    """
    # 排序
    g.sort()
    s.sort()
    
    child_i = 0  # 孩子索引
    cookie_j = 0  # 饼干索引
    
    # 遍历饼干
    while cookie_j < len(s) and child_i < len(g):
        # 如果当前饼干能满足当前孩子
        if s[cookie_j] >= g[child_i]:
            child_i += 1  # 满足下一个孩子
        cookie_j += 1  # 使用下一块饼干
    
    return child_i

# 示例
g = [1, 2, 3]  # 孩子胃口
s = [1, 1]     # 饼干大小
# 
# 贪心分配：
# 1. 饼干 1 满足孩子 1
# 2. 饼干 1 不能满足孩子 2
# 
# 结果：满足 1 个孩子

print(find_content_children(g, s))  # 输出：1

g = [1, 2]
s = [1, 2, 3]
# 
# 贪心分配：
# 1. 饼干 1 满足孩子 1
# 2. 饼干 2 满足孩子 2
# 
# 结果：满足 2 个孩子

print(find_content_children(g, s))  # 输出：2
```

### 3.2 摇摆序列

```python
def wiggle_max_length(nums):
    """
    摇摆序列
    
    LeetCode 376. 摆动序列
    
    问题描述：
    如果连续数字之间的差严格地在正负之间交替，则该序列称为摇摆序列
    求最长摇摆子序列的长度
    
    贪心策略：
    统计波峰和波谷的数量
    
    时间复杂度：O(n)
    空间复杂度：O(1)
    
    参数:
        nums: 输入数组
    
    返回:
        最长摇摆子序列长度
    """
    if len(nums) < 2:
        return len(nums)
    
    # 初始状态
    UP = 1
    DOWN = 2
    
    state = 0  # 0: 初始，1: 上升，2: 下降
    count = 1  # 至少有一个元素
    
    for i in range(1, len(nums)):
        if nums[i] > nums[i - 1]:
            # 上升
            if state != UP:
                count += 1
                state = UP
        elif nums[i] < nums[i - 1]:
            # 下降
            if state != DOWN:
                count += 1
                state = DOWN
        # 相等则跳过
    
    return count

# 示例
nums = [1, 7, 4, 9, 2, 5]
# 差值：[+6, -3, +5, -7, +3]
# 正负交替，整个序列就是摇摆序列
print(wiggle_max_length(nums))  # 输出：6

nums = [1, 17, 5, 10, 13, 15, 10, 5, 16, 8]
# 最长摇摆子序列：[1, 17, 5, 10, 5, 16, 8]
print(wiggle_max_length(nums))  # 输出：7
```

### 3.3 跳跃游戏

```python
def can_jump(nums):
    """
    跳跃游戏
    
    LeetCode 55. 跳跃游戏
    
    问题描述：
    给定一个非负整数数组，你最初位于数组的第一个位置
    数组中的每个元素代表你在该位置可以跳跃的最大长度
    判断你是否能够到达最后一个位置
    
    贪心策略：
    维护一个最远可达位置，遍历数组更新
    
    时间复杂度：O(n)
    空间复杂度：O(1)
    
    参数:
        nums: 跳跃长度数组
    
    返回:
        是否能到达最后
    """
    max_reach = 0  # 最远可达位置
    
    for i in range(len(nums)):
        # 如果当前位置不可达，返回 False
        if i > max_reach:
            return False
        
        # 更新最远可达位置
        max_reach = max(max_reach, i + nums[i])
        
        # 如果已经可以到达最后，提前返回
        if max_reach >= len(nums) - 1:
            return True
    
    return max_reach >= len(nums) - 1

# 示例
nums = [2, 3, 1, 1, 4]
# 
# 位置 0：最远可达 0+2=2
# 位置 1：最远可达 1+3=4（可以到达最后）
# 
# 结果：True

print(can_jump(nums))  # 输出：True

nums = [3, 2, 1, 0, 4]
# 
# 位置 0：最远可达 0+3=3
# 位置 1：最远可达 1+2=3
# 位置 2：最远可达 2+1=3
# 位置 3：最远可达 3+0=3
# 位置 4：不可达（4>3）
# 
# 结果：False

print(can_jump(nums))  # 输出：False
```

---

## 4. 霍夫曼编码

### 4.1 霍夫曼编码原理

**霍夫曼编码（Huffman Coding）** 是一种用于无损数据压缩的贪心算法。

**核心思想：**
- 出现频率高的字符用短编码
- 出现频率低的字符用长编码

**构建步骤：**
1. 统计每个字符的频率
2. 创建优先队列（小顶堆）
3. 每次取出频率最小的两个节点
4. 合并为新节点，频率为两者之和
5. 重复直到只剩一个节点

### 4.2 霍夫曼编码实现

```python
import heapq
from collections import Counter

class HuffmanNode:
    """霍夫曼树节点"""
    def __init__(self, char=None, freq=0):
        self.char = char
        self.freq = freq
        self.left = None
        self.right = None
    
    def __lt__(self, other):
        return self.freq < other.freq

def build_huffman_tree(text):
    """
    构建霍夫曼树
    
    参数:
        text: 输入文本
    
    返回:
        霍夫曼树根节点
    """
    # 统计频率
    freq_map = Counter(text)
    
    # 创建优先队列
    heap = [HuffmanNode(char, freq) for char, freq in freq_map.items()]
    heapq.heapify(heap)
    
    # 构建霍夫曼树
    while len(heap) > 1:
        # 取出频率最小的两个节点
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)
        
        # 创建新节点
        merged = HuffmanNode(freq=left.freq + right.freq)
        merged.left = left
        merged.right = right
        
        heapq.heappush(heap, merged)
    
    return heap[0] if heap else None

def generate_codes(node, prefix="", codes={}):
    """
    生成霍夫曼编码
    
    参数:
        node: 霍夫曼树节点
        prefix: 当前前缀
        codes: 编码字典
    
    返回:
        字符到编码的映射
    """
    if node is None:
        return
    
    # 叶子节点
    if node.char is not None:
        codes[node.char] = prefix if prefix else "0"  # 单字符特殊情况
        return
    
    # 左子树编码加 0
    generate_codes(node.left, prefix + "0", codes)
    
    # 右子树编码加 1
    generate_codes(node.right, prefix + "1", codes)
    
    return codes

def huffman_encode(text):
    """
    霍夫曼编码
    
    参数:
        text: 输入文本
    
    返回:
        编码后的字符串，编码字典
    """
    if not text:
        return "", {}
    
    # 构建霍夫曼树
    root = build_huffman_tree(text)
    
    # 生成编码
    codes = generate_codes(root)
    
    # 编码
    encoded = "".join(codes[char] for char in text)
    
    return encoded, codes

def huffman_decode(encoded, root):
    """
    霍夫曼解码
    
    参数:
        encoded: 编码后的字符串
        root: 霍夫曼树根节点
    
    返回:
        解码后的文本
    """
    if not encoded or root is None:
        return ""
    
    decoded = []
    node = root
    
    for bit in encoded:
        if bit == "0":
            node = node.left
        else:
            node = node.right
        
        # 到达叶子节点
        if node.char is not None:
            decoded.append(node.char)
            node = root
    
    return "".join(decoded)

# 示例
text = "hello world"
encoded, codes = huffman_encode(text)

print("原文本:", text)
print("编码:", encoded)
print("编码字典:", codes)

# 解码
decoded = huffman_decode(encoded, build_huffman_tree(text))
print("解码:", decoded)
```

### 4.3 霍夫曼编码压缩率

```python
def compression_ratio(text):
    """
    计算霍夫曼编码的压缩率
    
    参数:
        text: 输入文本
    
    返回:
        压缩率（原始大小/压缩后大小）
    """
    if not text:
        return 1.0
    
    # 原始大小（每个字符 8 位）
    original_size = len(text) * 8
    
    # 霍夫曼编码
    encoded, _ = huffman_encode(text)
    compressed_size = len(encoded)
    
    # 压缩率
    ratio = original_size / compressed_size if compressed_size > 0 else 1.0
    
    return ratio

# 示例
text = "aaaaabbbbcccdde"
ratio = compression_ratio(text)
print(f"压缩率：{ratio:.2f}x")
# 输出：压缩率约 1.5-2.0x（取决于字符频率分布）
```

---

## 5. 其他贪心问题

### 5.1 最小生成树（Prim 算法）

```python
import heapq

def prim_mst(graph, n):
    """
    最小生成树（Prim 算法）
    
    问题描述：
    给定一个加权无向图，找到连接所有顶点的最小权重树
    
    贪心策略：
    从任意顶点开始，每次选择连接已选集合和未选集合的最小权重边
    
    时间复杂度：O((V + E) log V)
    空间复杂度：O(V)
    
    参数:
        graph: 邻接表 {u: [(v, w), ...]}
        n: 顶点数
    
    返回:
        MST 的边列表和总权重
    """
    if n == 0:
        return [], 0
    
    # 从顶点 0 开始
    start = 0
    visited = {start}
    mst = []
    total_weight = 0
    
    # 优先队列：(权重，起点，终点)
    pq = []
    
    # 将起点的边加入队列
    for neighbor, weight in graph.get(start, []):
        heapq.heappush(pq, (weight, start, neighbor))
    
    while pq and len(visited) < n:
        # 取出最小权重边
        weight, u, v = heapq.heappop(pq)
        
        # 已访问过，跳过
        if v in visited:
            continue
        
        # 加入 MST
        visited.add(v)
        mst.append((u, v, weight))
        total_weight += weight
        
        # 将新顶点的边加入队列
        for neighbor, w in graph.get(v, []):
            if neighbor not in visited:
                heapq.heappush(pq, (w, v, neighbor))
    
    return mst, total_weight

# 示例
# 图：
# 0 --(4)-- 1
# | \      |
# (2) (3)  (5)
# |   \    |
# 2 --(1)-- 3

graph = {
    0: [(1, 4), (2, 2), (3, 3)],
    1: [(0, 4), (3, 5)],
    2: [(0, 2), (3, 1)],
    3: [(0, 3), (1, 5), (2, 1)]
}

mst, weight = prim_mst(graph, 4)
print("最小生成树:", mst)
print("总权重:", weight)
# 输出：总权重 = 6
```

### 5.2 任务调度

```python
def min_platforms(arrival, departure):
    """
    最小站台数
    
    问题描述：
    给定火车到达和离开时间，求最少需要多少个站台
    
    贪心策略：
    1. 按时间排序所有事件
    2. 到达 +1，离开 -1
    3. 记录最大值
    
    时间复杂度：O(n log n)
    空间复杂度：O(n)
    
    参数:
        arrival: 到达时间列表
        departure: 离开时间列表
    
    返回:
        最少站台数
    """
    # 创建事件列表
    events = []
    for time in arrival:
        events.append((time, 1))  # 到达 +1
    for time in departure:
        events.append((time, -1))  # 离开 -1
    
    # 按时间排序
    events.sort()
    
    platforms = 0
    max_platforms = 0
    
    # 遍历事件
    for time, change in events:
        platforms += change
        max_platforms = max(max_platforms, platforms)
    
    return max_platforms

# 示例
arrival = [900, 940, 950, 1100, 1500, 1800]
departure = [910, 1200, 1120, 1130, 1900, 2000]
# 
# 时间线：
# 9:00  到达 (+1) → 1
# 9:10  离开 (-1) → 0
# 9:40  到达 (+1) → 1
# 9:50  到达 (+1) → 2
# 11:00 到达 (+1) → 3
# 11:20 离开 (-1) → 2
# 11:30 离开 (-1) → 1
# 12:00 离开 (-1) → 0
# 15:00 到达 (+1) → 1
# 18:00 到达 (+1) → 2
# 19:00 离开 (-1) → 1
# 20:00 离开 (-1) → 0
# 
# 最大值：3

print(min_platforms(arrival, departure))  # 输出：3
```

### 5.3 加油站问题

```python
def can_complete_circuit(gas, cost):
    """
    加油站问题
    
    LeetCode 134. 加油站
    
    问题描述：
    在一条环路上有 N 个加油站
    gas[i] 表示第 i 个加油站的汽油量
    cost[i] 表示从第 i 个加油站到下一个加油站需要的汽油量
    判断能否绕环路行驶一周，返回出发点索引
    
    贪心策略：
    1. 如果总油量 < 总消耗，肯定不行
    2. 从某个点开始，如果到某点油量为负，说明起点不对
    3. 从下一个点重新开始
    
    时间复杂度：O(n)
    空间复杂度：O(1)
    
    参数:
        gas: 各加油站油量
        cost: 各段路程消耗
    
    返回:
        出发点索引，无法完成返回 -1
    """
    # 如果总油量 < 总消耗，肯定不行
    if sum(gas) < sum(cost):
        return -1
    
    total_tank = 0  # 总油量差
    curr_tank = 0   # 当前油箱
    start = 0       # 出发点
    
    for i in range(len(gas)):
        # 油量差
        diff = gas[i] - cost[i]
        total_tank += diff
        curr_tank += diff
        
        # 如果当前油量为负，说明从 start 到 i 都不行
        if curr_tank < 0:
            # 从下一个点重新开始
            start = i + 1
            curr_tank = 0
    
    return start if total_tank >= 0 else -1

# 示例
gas = [1, 2, 3, 4, 5]
cost = [3, 4, 5, 1, 2]
# 
# 从索引 3 开始：
# 站 3：油 4，消耗 1，剩余 3
# 站 4：油 3+5=8，消耗 2，剩余 6
# 站 0：油 6+1=7，消耗 3，剩余 4
# 站 1：油 4+2=6，消耗 4，剩余 2
# 站 2：油 2+3=5，消耗 5，剩余 0
# 完成一圈！

print(can_complete_circuit(gas, cost))  # 输出：3
```

---

## 6. 贪心算法总结

### 6.1 贪心算法适用场景

| 问题类型 | 是否适用贪心 | 说明 |
|---------|------------|------|
| **活动选择** | ✅ | 按结束时间排序 |
| **区间调度** | ✅ | 按结束时间排序 |
| **霍夫曼编码** | ✅ | 频率最小的先合并 |
| **最小生成树** | ✅ | Prim/Kruskal 算法 |
| **最短路径（Dijkstra）** | ✅ | 每次选最近的 |
| **0-1 背包** | ❌ | 需要动态规划 |
| **旅行商问题** | ❌ | NP 完全问题 |

### 6.2 贪心算法证明方法

**证明贪心算法正确性的常用方法：**

1. **贪心选择性质**
   - 证明存在一个最优解包含贪心选择
   - 通过替换法证明

2. **最优子结构**
   - 证明原问题的最优解包含子问题的最优解
   - 通过归纳法证明

3. **交换论证**
   - 假设存在更优解
   - 通过交换操作导出矛盾

### 6.3 贪心 vs 其他算法

```
算法选择指南：

1. 问题具有贪心选择性质
   → 贪心算法（高效）

2. 问题具有最优子结构，但无贪心选择性质
   → 动态规划

3. 需要遍历所有可能
   → 回溯/暴力搜索

4. 最优化问题，规模较大
   → 考虑贪心或动态规划
```

---

## 📝 练习题

### 基础题

1. **活动选择**：实现活动选择问题

2. **区间合并**：实现区间合并问题

3. **分配饼干**：实现分配饼干问题

### 进阶题

4. **无重叠区间**：计算最少需要移除多少个区间

5. **跳跃游戏**：判断是否能到达最后位置

6. **摇摆序列**：求最长摇摆子序列长度

### 挑战题

7. **加油站问题**：找到可以绕环路一周的出发点

8. **霍夫曼编码**：完整实现霍夫曼编码和解码

9. **最小生成树**：实现 Prim 或 Kruskal 算法

---

## 🔗 参考资料

### 经典书籍
- 📚 《算法导论》第 16 章：贪心算法
- 📚 《数据结构与算法分析》第 10 章：算法设计技巧
- 📚 《剑指 Offer》贪心相关题目

### 在线资源
- 🔗 [LeetCode 贪心专题](https://leetcode.com/tag/greedy/)
- 🔗 [GeeksforGeeks 贪心算法教程](https://www.geeksforgeeks.org/greedy-algorithms/)
- 🔗 [VisuAlgo 霍夫曼编码可视化](https://visualgo.net/en/huffman)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 贪心思想 | ⭐⭐⭐⭐⭐ | 理解本质 |
| 活动选择 | ⭐⭐⭐⭐ | 熟练运用 |
| 区间问题 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 霍夫曼编码 | ⭐⭐⭐⭐ | 理解原理 |
| 贪心证明 | ⭐⭐⭐ | 了解方法 |

---

**上一章：** [递归与分治](/data-structure-algorithm/algorithm/recursion)  
**下一章：** [动态规划](/data-structure-algorithm/algorithm/dp)

**最后更新**：2026-03-13
