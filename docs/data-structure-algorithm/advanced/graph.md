# 图论基础

> 学习日期：2026-03-13  
> 状态：📝 学习中  
> 预计完成：2026-05-25  
> 难度：⭐⭐⭐⭐⭐  
> 前置知识：[树与二叉树](/data-structure-algorithm/advanced/tree)、[队列](/data-structure-algorithm/basic/stack-queue)

---

## 📚 目录

[[toc]]

---

## 1. 图的基本概念

### 1.1 什么是图

**图（Graph）** 是由**顶点（Vertex）**和**边（Edge）**组成的数据结构。

**形式化定义：** G = (V, E)
- V：顶点集合
- E：边集合

**生活案例：**
```
地图导航：
- 顶点：城市（北京、上海、广州...）
- 边：城市之间的道路
- 权重：距离或时间

社交网络：
- 顶点：用户
- 边：好友关系
- 权重：亲密度
```

### 1.2 图的术语

| 术语 | 说明 | 示例 |
|------|------|------|
| **顶点（Vertex）** | 图中的节点 | 城市 A、城市 B |
| **边（Edge）** | 连接两个顶点的线 | A-B 之间的道路 |
| **度（Degree）** | 顶点连接的边数 | 顶点 A 的度为 3 |
| **入度（In-degree）** | 有向图中指向该顶点的边数 | - |
| **出度（Out-degree）** | 有向图中从该顶点出发的边数 | - |
| **路径（Path）** | 顶点序列，相邻顶点有边连接 | A→B→C |
| **环（Cycle）** | 起点和终点相同的路径 | A→B→C→A |
| **连通图** | 任意两个顶点都有路径 | - |

### 1.3 图的分类

| 分类 | 说明 | 图示 |
|------|------|------|
| **无向图** | 边没有方向 | A-B = B-A |
| **有向图** | 边有方向 | A→B ≠ B→A |
| **加权图** | 边有权重 | A-B(5) 表示权重为 5 |
| **无权图** | 边没有权重 | 所有边权重为 1 |
| **连通图** | 任意两点可达 | - |
| **有向无环图（DAG）** | 有向图且无环 | 拓扑排序适用 |

**无向图示例：**
```
    A
   / \
  B---C
  |   |
  D---E

边：(A,B), (A,C), (B,C), (B,D), (C,E), (D,E)
```

**有向图示例：**
```
    A
   ↓ ↓
  B→C→D
  ↓  ↓
  E  F

边：A→B, A→C, B→C, B→E, C→D, C→F
```

---

## 2. 图的存储

### 2.1 邻接矩阵

**使用二维数组存储图的连接关系**

```python
class GraphAdjMatrix:
    """邻接矩阵表示的图"""
    
    def __init__(self, n, directed=False):
        """
        初始化图
        
        参数:
            n: 顶点数量
            directed: 是否为有向图
        """
        self.n = n  # 顶点数
        self.directed = directed  # 是否有向
        
        # 邻接矩阵，matrix[i][j] = 1 表示 i 和 j 之间有边
        self.matrix = [[0] * n for _ in range(n)]
    
    def add_edge(self, u, v, weight=1):
        """
        添加边
        
        参数:
            u: 起点
            v: 终点
            weight: 权重（无权图为 1）
        """
        self.matrix[u][v] = weight
        
        # 无向图，反向也要添加
        if not self.directed:
            self.matrix[v][u] = weight
    
    def has_edge(self, u, v):
        """判断 u 和 v 之间是否有边"""
        return self.matrix[u][v] != 0
    
    def get_neighbors(self, u):
        """获取 u 的所有邻居"""
        neighbors = []
        for v in range(self.n):
            if self.matrix[u][v] != 0:
                neighbors.append(v)
        return neighbors
    
    def __str__(self):
        """打印邻接矩阵"""
        return '\n'.join([' '.join(map(str, row)) for row in self.matrix])

# 示例
# 无向图：
#   0---1
#   |   |
#   2---3

g = GraphAdjMatrix(4, directed=False)
g.add_edge(0, 1)
g.add_edge(0, 2)
g.add_edge(1, 3)
g.add_edge(2, 3)

print(g)
# 输出：
# 0 1 1 0
# 1 0 0 1
# 1 0 0 1
# 0 1 1 0
```

**邻接矩阵优缺点：**

| 优点 | 缺点 |
|------|------|
| 判断两点是否有边：O(1) | 空间复杂度：O(V²) |
| 适合稠密图 | 添加/删除顶点困难 |
| 实现简单 | 遍历邻居：O(V) |

### 2.2 邻接表

**使用数组 + 链表存储每个顶点的邻居**

```python
from collections import defaultdict

class GraphAdjList:
    """邻接表表示的图"""
    
    def __init__(self, directed=False):
        """
        初始化图
        
        参数:
            directed: 是否为有向图
        """
        self.directed = directed
        # 使用字典存储邻接表
        self.adj_list = defaultdict(list)
    
    def add_edge(self, u, v, weight=1):
        """
        添加边
        
        参数:
            u: 起点
            v: 终点
            weight: 权重
        """
        # 存储 (邻居，权重) 元组
        self.adj_list[u].append((v, weight))
        
        # 无向图，反向也要添加
        if not self.directed:
            self.adj_list[v].append((u, weight))
    
    def get_neighbors(self, u):
        """获取 u 的所有邻居"""
        return [v for v, w in self.adj_list[u]]
    
    def get_edges(self, u):
        """获取 u 的所有边（包含权重）"""
        return self.adj_list[u]
    
    def has_edge(self, u, v):
        """判断 u 和 v 之间是否有边"""
        for neighbor, _ in self.adj_list[u]:
            if neighbor == v:
                return True
        return False
    
    def __str__(self):
        """打印邻接表"""
        result = []
        for u in sorted(self.adj_list.keys()):
            neighbors = ', '.join(f"{v}({w})" for v, w in self.adj_list[u])
            result.append(f"{u}: {neighbors}")
        return '\n'.join(result)

# 示例
# 有向加权图：
#   0 --(5)--> 1
#   |          |
#  (3)        (2)
#   ↓          ↓
#   2 --(4)--> 3

g = GraphAdjList(directed=True)
g.add_edge(0, 1, 5)
g.add_edge(0, 2, 3)
g.add_edge(1, 3, 2)
g.add_edge(2, 3, 4)

print(g)
# 输出：
# 0: 1(5), 2(3)
# 1: 3(2)
# 2: 3(4)
```

**邻接表优缺点：**

| 优点 | 缺点 |
|------|------|
| 空间复杂度：O(V+E) | 判断两点是否有边：O(degree) |
| 适合稀疏图 | - |
| 遍历邻居：O(degree) | - |
| 添加顶点容易 | - |

### 2.3 存储方式对比

| 操作 | 邻接矩阵 | 邻接表 |
|------|---------|--------|
| **空间复杂度** | O(V²) | O(V+E) |
| **判断边存在** | O(1) | O(degree) |
| **遍历邻居** | O(V) | O(degree) |
| **添加边** | O(1) | O(1) |
| **删除边** | O(1) | O(degree) |
| **适用场景** | 稠密图 | 稀疏图 |

---

## 3. 图的遍历

### 3.1 广度优先搜索（BFS）

**BFS（Breadth-First Search）** 是从起点开始，逐层访问节点的算法。

**应用场景：**
- ✅ 最短路径（无权图）
- ✅ 连通性判断
- ✅ 层次遍历

```python
from collections import deque

def bfs(graph, start):
    """
    广度优先搜索
    
    思路：
    1. 使用队列存储待访问节点
    2. 从起点开始，逐层访问
    3. 使用 visited 记录已访问节点，避免重复
    
    时间复杂度：O(V + E)
    空间复杂度：O(V)
    
    参数:
        graph: 图（邻接表）
        start: 起点
    
    返回:
        遍历顺序列表
    """
    visited = set()  # 已访问节点
    result = []  # 遍历结果
    queue = deque([start])  # 队列
    visited.add(start)
    
    while queue:
        # 出队
        node = queue.popleft()
        result.append(node)
        
        # 访问所有邻居
        for neighbor in graph.get_neighbors(node):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return result

# 示例
# 图：
#   0---1
#   |   |
#   2---3---4
#       |
#       5

g = GraphAdjList(directed=False)
g.add_edge(0, 1)
g.add_edge(0, 2)
g.add_edge(1, 3)
g.add_edge(2, 3)
g.add_edge(3, 4)
g.add_edge(3, 5)

result = bfs(g, 0)
print(result)  # 输出：[0, 1, 2, 3, 4, 5]（层次顺序）
```

**BFS 求最短路径（无权图）：**

```python
def bfs_shortest_path(graph, start, end):
    """
    BFS 求最短路径（无权图）
    
    思路：
    1. 使用队列进行 BFS
    2. 记录每个节点的前驱节点
    3. 到达终点后，回溯得到路径
    
    时间复杂度：O(V + E)
    
    参数:
        graph: 图
        start: 起点
        end: 终点
    
    返回:
        最短路径列表，无法到达返回 None
    """
    if start == end:
        return [start]
    
    visited = {start}
    queue = deque([start])
    parent = {start: None}  # 记录前驱节点
    
    while queue:
        node = queue.popleft()
        
        # 访问邻居
        for neighbor in graph.get_neighbors(node):
            if neighbor not in visited:
                visited.add(neighbor)
                parent[neighbor] = node  # 记录前驱
                queue.append(neighbor)
                
                # 到达终点
                if neighbor == end:
                    # 回溯路径
                    path = []
                    current = end
                    while current is not None:
                        path.append(current)
                        current = parent[current]
                    return path[::-1]  # 反转路径
    
    return None  # 无法到达

# 示例
path = bfs_shortest_path(g, 0, 5)
print(path)  # 输出：[0, 1, 3, 5] 或 [0, 2, 3, 5]
```

### 3.2 深度优先搜索（DFS）

**DFS（Depth-First Search）** 是从起点开始，尽可能深地搜索的算法。

**应用场景：**
- ✅ 连通性判断
- ✅ 环检测
- ✅ 拓扑排序
- ✅ 迷宫求解

```python
def dfs_recursive(graph, start, visited=None, result=None):
    """
    深度优先搜索（递归实现）
    
    思路：
    1. 访问当前节点
    2. 递归访问未访问的邻居
    
    时间复杂度：O(V + E)
    空间复杂度：O(V)
    
    参数:
        graph: 图
        start: 起点
        visited: 已访问集合
        result: 遍历结果
    
    返回:
        遍历顺序列表
    """
    if visited is None:
        visited = set()
    if result is None:
        result = []
    
    visited.add(start)
    result.append(start)
    
    # 递归访问邻居
    for neighbor in graph.get_neighbors(start):
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited, result)
    
    return result

def dfs_iterative(graph, start):
    """
    深度优先搜索（迭代实现，使用栈）
    
    思路：
    1. 使用栈存储待访问节点
    2. 每次访问栈顶节点
    3. 将未访问的邻居入栈
    
    时间复杂度：O(V + E)
    空间复杂度：O(V)
    
    参数:
        graph: 图
        start: 起点
    
    返回:
        遍历顺序列表
    """
    visited = set()
    result = []
    stack = [start]
    
    while stack:
        node = stack.pop()
        
        if node not in visited:
            visited.add(node)
            result.append(node)
            
            # 邻居入栈（逆序，保证正序访问）
            for neighbor in reversed(graph.get_neighbors(node)):
                if neighbor not in visited:
                    stack.append(neighbor)
    
    return result

# 示例
result_recursive = dfs_recursive(g, 0)
result_iterative = dfs_iterative(g, 0)

print(result_recursive)    # 输出：[0, 1, 3, 4, 5, 2]（可能不同）
print(result_iterative)    # 输出：[0, 2, 3, 5, 4, 1]（可能不同）
```

### 3.3 BFS vs DFS 对比

| 对比项 | BFS | DFS |
|--------|-----|-----|
| **数据结构** | 队列 | 栈（递归或显式） |
| **遍历顺序** | 层次遍历 | 深度优先 |
| **最短路径** | ✅ 无权图 | ❌ |
| **空间复杂度** | O(V) | O(V) |
| **应用场景** | 最短路径、层次遍历 | 环检测、拓扑排序 |

---

## 4. 最短路径算法

### 4.1 Dijkstra 算法

**Dijkstra 算法** 用于求解**单源最短路径**（带权图，权重非负）。

**算法思想：** 贪心策略，每次选择距离起点最近的未访问节点。

```python
import heapq

def dijkstra(graph, start):
    """
    Dijkstra 算法求单源最短路径
    
    思路：
    1. 使用优先队列（小顶堆）存储 (距离，节点)
    2. 每次取出距离最小的节点
    3. 更新邻居的距离
    
    时间复杂度：O((V + E) log V)
    空间复杂度：O(V)
    
    参数:
        graph: 加权图（邻接表）
        start: 起点
    
    返回:
        dist: 起点到各点的最短距离
        parent: 前驱节点（用于重构路径）
    """
    # 初始化
    dist = {node: float('inf') for node in graph.adj_list}
    dist[start] = 0
    parent = {node: None for node in graph.adj_list}
    
    # 优先队列：(距离，节点)
    pq = [(0, start)]
    visited = set()
    
    while pq:
        # 取出距离最小的节点
        current_dist, node = heapq.heappop(pq)
        
        # 已访问过，跳过
        if node in visited:
            continue
        
        visited.add(node)
        
        # 更新邻居
        for neighbor, weight in graph.get_edges(node):
            if neighbor not in visited:
                new_dist = current_dist + weight
                
                # 找到更短路径
                if new_dist < dist[neighbor]:
                    dist[neighbor] = new_dist
                    parent[neighbor] = node
                    heapq.heappush(pq, (new_dist, neighbor))
    
    return dist, parent

def get_path(parent, start, end):
    """
    根据前驱节点重构路径
    
    参数:
        parent: 前驱节点字典
        start: 起点
        end: 终点
    
    返回:
        路径列表
    """
    path = []
    current = end
    
    while current is not None:
        path.append(current)
        current = parent[current]
    
    return path[::-1] if path[0] == start else None

# 示例
# 加权图：
#   0 --(4)--> 1
#   |          |
#  (2)        (3)
#   ↓          ↓
#   2 --(1)--> 3

g = GraphAdjList(directed=True)
g.add_edge(0, 1, 4)
g.add_edge(0, 2, 2)
g.add_edge(1, 3, 3)
g.add_edge(2, 1, 1)
g.add_edge(2, 3, 5)

dist, parent = dijkstra(g, 0)

print("最短距离：", dist)
# 输出：{0: 0, 1: 3, 2: 2, 3: 6}

path = get_path(parent, 0, 3)
print("到节点 3 的最短路径：", path)
# 输出：[0, 2, 1, 3]
```

**Dijkstra 算法限制：**
- ❌ 不能处理负权边
- ✅ 适合非负权图

### 4.2 Bellman-Ford 算法

**Bellman-Ford 算法** 可以处理**负权边**，并能检测负权环。

```python
def bellman_ford(graph, start):
    """
    Bellman-Ford 算法
    
    思路：
    1. 初始化距离为无穷大，起点为 0
    2. 松弛所有边 V-1 次
    3. 检查是否有负权环
    
    时间复杂度：O(V * E)
    空间复杂度：O(V)
    
    参数:
        graph: 图
        start: 起点
    
    返回:
        dist: 最短距离，有负权环返回 None
    """
    # 初始化
    dist = {node: float('inf') for node in graph.adj_list}
    dist[start] = 0
    
    # 获取所有边
    edges = []
    for u in graph.adj_list:
        for v, w in graph.adj_list[u]:
            edges.append((u, v, w))
    
    # 松弛 V-1 次
    V = len(graph.adj_list)
    for _ in range(V - 1):
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    
    # 检查负权环
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            return None  # 存在负权环
    
    return dist
```

### 4.3 Floyd-Warshall 算法

**Floyd-Warshall 算法** 用于求解**所有点对之间的最短路径**。

```python
def floyd_warshall(graph):
    """
    Floyd-Warshall 算法
    
    思路：
    1. 使用动态规划
    2. dist[i][j] 表示 i 到 j 的最短距离
    3. 通过中间节点 k 更新距离
    
    时间复杂度：O(V³)
    空间复杂度：O(V²)
    
    参数:
        graph: 图
    
    返回:
        dist: 所有点对的最短距离矩阵
    """
    nodes = list(graph.adj_list.keys())
    n = len(nodes)
    node_idx = {node: i for i, node in enumerate(nodes)}
    
    # 初始化距离矩阵
    dist = [[float('inf')] * n for _ in range(n)]
    
    # 自己到自己距离为 0
    for i in range(n):
        dist[i][i] = 0
    
    # 初始化边的距离
    for u in graph.adj_list:
        for v, w in graph.adj_list[u]:
            i, j = node_idx[u], node_idx[v]
            dist[i][j] = w
    
    # 动态规划
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    
    return dist, nodes
```

### 4.4 最短路径算法对比

| 算法 | 单源/所有 | 负权边 | 时间复杂度 | 适用场景 |
|------|----------|--------|-----------|---------|
| **BFS** | 单源 | ❌ | O(V+E) | 无权图 |
| **Dijkstra** | 单源 | ❌ | O((V+E)logV) | 非负权图 |
| **Bellman-Ford** | 单源 | ✅ | O(V*E) | 有负权边 |
| **Floyd-Warshall** | 所有 | ✅ | O(V³) | 小图、所有点对 |

---

## 5. 最小生成树

### 5.1 什么是最小生成树

**最小生成树（MST, Minimum Spanning Tree）** 是连通图的生成树中，边的权重和最小的树。

**应用场景：**
- ✅ 网络布线（最小成本连接所有节点）
- ✅ 聚类分析
- ✅ 近似算法

### 5.2 Prim 算法

**Prim 算法** 从一个顶点开始，每次选择连接已选集合和未选集合的最小权重边。

```python
import heapq

def prim(graph, start=0):
    """
    Prim 算法求最小生成树
    
    思路：
    1. 从起点开始
    2. 使用优先队列存储 (权重，节点)
    3. 每次选择最小权重边
    
    时间复杂度：O((V + E) log V)
    空间复杂度：O(V)
    
    参数:
        graph: 加权无向图
        start: 起点
    
    返回:
        mst: 最小生成树的边列表
        total_weight: 总权重
    """
    visited = {start}
    mst = []
    total_weight = 0
    
    # 优先队列：(权重，起点，终点)
    pq = []
    
    # 将起点的边加入队列
    for neighbor, weight in graph.get_edges(start):
        heapq.heappush(pq, (weight, start, neighbor))
    
    while pq and len(visited) < len(graph.adj_list):
        # 取出最小权重边
        weight, u, v = heapq.heappop(pq)
        
        # 已访问过，跳过
        if v in visited:
            continue
        
        # 加入 MST
        visited.add(v)
        mst.append((u, v, weight))
        total_weight += weight
        
        # 将新节点的边加入队列
        for neighbor, w in graph.get_edges(v):
            if neighbor not in visited:
                heapq.heappush(pq, (w, v, neighbor))
    
    return mst, total_weight

# 示例
# 无向加权图：
#   0 --(4)-- 1
#   | \      |
#  (2) (3)  (5)
#   |   \    |
#   2 --(1)-- 3

g = GraphAdjList(directed=False)
g.add_edge(0, 1, 4)
g.add_edge(0, 2, 2)
g.add_edge(0, 3, 3)
g.add_edge(1, 3, 5)
g.add_edge(2, 3, 1)

mst, weight = prim(g, 0)

print("最小生成树：", mst)
# 输出：[(0, 2, 2), (2, 3, 1), (0, 1, 4)]

print("总权重：", weight)
# 输出：7
```

### 5.3 Kruskal 算法

**Kruskal 算法** 将所有边按权重排序，每次选择最小权重边，如果不成环则加入 MST。

```python
class UnionFind:
    """并查集，用于检测环"""
    
    def __init__(self, n):
        """初始化并查集"""
        self.parent = list(range(n))
        self.rank = [0] * n
    
    def find(self, x):
        """查找根节点（路径压缩）"""
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def union(self, x, y):
        """
        合并两个集合
        
        返回:
            True: 成功合并
            False: 已在同一集合（会成环）
        """
        root_x = self.find(x)
        root_y = self.find(y)
        
        if root_x == root_y:
            return False  # 已在同一集合
        
        # 按秩合并
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1
        
        return True

def kruskal(graph, n):
    """
    Kruskal 算法求最小生成树
    
    思路：
    1. 将所有边按权重排序
    2. 使用并查集检测环
    3. 选择不成环的最小权重边
    
    时间复杂度：O(E log E)
    空间复杂度：O(V)
    
    参数:
        graph: 加权无向图
        n: 顶点数
    
    返回:
        mst: 最小生成树的边列表
        total_weight: 总权重
    """
    # 获取所有边
    edges = []
    for u in graph.adj_list:
        for v, w in graph.adj_list[u]:
            if u < v:  # 无向图，避免重复
                edges.append((w, u, v))
    
    # 按权重排序
    edges.sort()
    
    # 并查集
    uf = UnionFind(n)
    
    mst = []
    total_weight = 0
    
    for weight, u, v in edges:
        # 不成环则加入 MST
        if uf.union(u, v):
            mst.append((u, v, weight))
            total_weight += weight
            
            # 已有 V-1 条边，结束
            if len(mst) == n - 1:
                break
    
    return mst, total_weight

# 使用上面的图示例
mst, weight = kruskal(g, 4)

print("最小生成树：", mst)
# 输出：[(2, 3, 1), (0, 2, 2), (0, 1, 4)]

print("总权重：", weight)
# 输出：7
```

### 5.4 Prim vs Kruskal 对比

| 对比项 | Prim | Kruskal |
|--------|------|---------|
| **思路** | 从点开始扩展 | 从边开始选择 |
| **时间复杂度** | O((V+E)logV) | O(E log E) |
| **适用场景** | 稠密图 | 稀疏图 |
| **数据结构** | 优先队列 | 并查集 |

---

## 6. 拓扑排序

### 6.1 什么是拓扑排序

**拓扑排序** 是对**有向无环图（DAG）**的顶点进行线性排序，使得对于每条边 u→v，u 在排序中都在 v 之前。

**应用场景：**
- ✅ 任务调度（依赖关系）
- ✅ 课程安排（先修课程）
- ✅ 编译顺序（文件依赖）

### 6.2 Kahn 算法（BFS）

```python
from collections import deque, defaultdict

def topological_sort_kahn(graph, n):
    """
    拓扑排序（Kahn 算法，BFS）
    
    思路：
    1. 计算每个节点的入度
    2. 将入度为 0 的节点入队
    3. 依次取出，减少邻居入度
    4. 入度为 0 的节点入队
    
    时间复杂度：O(V + E)
    
    参数:
        graph: 有向无环图
        n: 顶点数
    
    返回:
        拓扑排序结果，有环返回 None
    """
    # 计算入度
    in_degree = [0] * n
    for u in graph.adj_list:
        for v, _ in graph.adj_list[u]:
            in_degree[v] += 1
    
    # 入度为 0 的节点入队
    queue = deque([i for i in range(n) if in_degree[i] == 0])
    
    result = []
    
    while queue:
        node = queue.popleft()
        result.append(node)
        
        # 减少邻居入度
        for neighbor, _ in graph.get_edges(node):
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    # 检查是否有环
    if len(result) != n:
        return None  # 有环
    
    return result

# 示例
# 课程依赖：
#   0 → 1 → 3
#   ↓   ↓
#   2 → 4

g = GraphAdjList(directed=True)
g.add_edge(0, 1)
g.add_edge(0, 2)
g.add_edge(1, 3)
g.add_edge(1, 4)
g.add_edge(2, 4)

result = topological_sort_kahn(g, 5)
print(result)  # 输出：[0, 1, 2, 3, 4] 或 [0, 2, 1, 3, 4]
```

### 6.3 DFS 实现

```python
def topological_sort_dfs(graph, n):
    """
    拓扑排序（DFS 实现）
    
    思路：
    1. DFS 遍历
    2. 节点完成访问后加入结果
    3. 反转结果
    
    参数:
        graph: 有向无环图
        n: 顶点数
    
    返回:
        拓扑排序结果，有环返回 None
    """
    visited = [0] * n  # 0: 未访问，1: 访问中，2: 已完成
    result = []
    has_cycle = [False]
    
    def dfs(node):
        if has_cycle[0]:
            return
        
        visited[node] = 1  # 标记为访问中
        
        for neighbor, _ in graph.get_edges(node):
            if visited[neighbor] == 1:  # 遇到访问中的节点，有环
                has_cycle[0] = True
                return
            if visited[neighbor] == 0:
                dfs(neighbor)
        
        visited[node] = 2  # 标记为已完成
        result.append(node)
    
    # 对所有未访问节点进行 DFS
    for i in range(n):
        if visited[i] == 0:
            dfs(i)
    
    if has_cycle[0]:
        return None
    
    return result[::-1]  # 反转
```

---

## 7. 实战案例

### 7.1 课程表问题

```python
def can_finish(num_courses, prerequisites):
    """
    判断是否可以完成所有课程
    
    LeetCode 207. 课程表
    
    思路：
    1. 构建图
    2. 拓扑排序
    3. 检查是否有环
    
    参数:
        num_courses: 课程数
        prerequisites: 先修课程列表 [[课程，先修]]
    
    返回:
        是否可以完成
    """
    # 构建图
    graph = defaultdict(list)
    in_degree = [0] * num_courses
    
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        in_degree[course] += 1
    
    # Kahn 算法
    queue = deque([i for i in range(num_courses) if in_degree[i] == 0])
    count = 0
    
    while queue:
        node = queue.popleft()
        count += 1
        
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    return count == num_courses

# 示例
# 课程 0 需要先修课程 1
# 课程 1 需要先修课程 0
# 形成环，无法完成

print(can_finish(2, [[0, 1], [1, 0]]))  # False

# 课程 1 需要先修课程 0
# 可以完成

print(can_finish(2, [[1, 0]]))  # True
```

### 7.2 网络延迟时间

```python
def network_delay_time(times, n, k):
    """
    计算网络延迟时间
    
    LeetCode 743. 网络延迟时间
    
    思路：
    1. Dijkstra 算法求单源最短路径
    2. 返回最大距离
    
    参数:
        times: 边列表 [起点，终点，时间]
        n: 节点数
        k: 起点
    
    返回:
        最大延迟时间，无法到达返回 -1
    """
    # 构建图
    graph = defaultdict(list)
    for u, v, w in times:
        graph[u].append((v, w))
    
    # Dijkstra
    dist = {i: float('inf') for i in range(1, n + 1)}
    dist[k] = 0
    pq = [(0, k)]
    
    while pq:
        d, node = heapq.heappop(pq)
        
        if d > dist[node]:
            continue
        
        for neighbor, w in graph[node]:
            if dist[node] + w < dist[neighbor]:
                dist[neighbor] = dist[node] + w
                heapq.heappush(pq, (dist[neighbor], neighbor))
    
    max_dist = max(dist.values())
    return max_dist if max_dist != float('inf') else -1

# 示例
times = [[2, 1, 1], [2, 3, 1], [3, 4, 1]]
n = 4
k = 2

print(network_delay_time(times, n, k))  # 输出：2
```

### 7.3 岛屿数量

```python
def num_islands(grid):
    """
    计算岛屿数量
    
    LeetCode 200. 岛屿数量
    
    思路：
    1. DFS 遍历
    2. 访问过的陆地标记为水
    3. 统计 DFS 次数
    
    参数:
        grid: 二维网格，'1' 表示陆地，'0' 表示水
    
    返回:
        岛屿数量
    """
    if not grid:
        return 0
    
    rows, cols = len(grid), len(grid[0])
    count = 0
    
    def dfs(r, c):
        # 边界检查
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return
        # 是水则返回
        if grid[r][c] == '0':
            return
        
        # 标记为已访问
        grid[r][c] = '0'
        
        # 访问四个方向
        dfs(r - 1, c)  # 上
        dfs(r + 1, c)  # 下
        dfs(r, c - 1)  # 左
        dfs(r, c + 1)  # 右
    
    # 遍历网格
    for i in range(rows):
        for j in range(cols):
            if grid[i][j] == '1':
                dfs(i, j)
                count += 1
    
    return count

# 示例
grid = [
    ['1', '1', '0', '0', '0'],
    ['1', '1', '0', '0', '0'],
    ['0', '0', '1', '0', '0'],
    ['0', '0', '0', '1', '1']
]

print(num_islands(grid))  # 输出：3
```

---

## 📝 练习题

### 基础题

1. **图的遍历**：实现 BFS 和 DFS 遍历

2. **最短路径**：使用 Dijkstra 算法求单源最短路径

3. **拓扑排序**：实现 Kahn 算法进行拓扑排序

### 进阶题

4. **最小生成树**：使用 Prim 或 Kruskal 算法求 MST

5. **岛屿数量**：计算二维网格中的岛屿数量

6. **课程表**：判断是否可以完成所有课程

### 挑战题

7. **网络延迟时间**：计算信号传到所有节点的时间

8. **单词接龙**：找到最短的单词转换序列

9. ** cheapest flights**：在最多 K 站中转内找到最便宜航班

---

## 🔗 参考资料

### 经典书籍
- 📚 《算法导论》第 22-24 章：图算法
- 📚 《数据结构与算法分析》第 9 章：图
- 📚 《剑指 Offer》图相关题目

### 在线资源
- 🔗 [VisuAlgo 图可视化](https://visualgo.net/en/graphds)
- 🔗 [LeetCode 图专题](https://leetcode.com/tag/graph/)
- 🔗 [GeeksforGeeks 图教程](https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 图的存储 | ⭐⭐⭐⭐ | 熟练运用 |
| BFS/DFS | ⭐⭐⭐⭐⭐ | 熟练手写 |
| Dijkstra | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 最小生成树 | ⭐⭐⭐⭐ | 理解原理 |
| 拓扑排序 | ⭐⭐⭐⭐ | 熟练运用 |

---

**上一章：** [堆与优先队列](/data-structure-algorithm/advanced/heap)  
**下一章：** [排序算法](/data-structure-algorithm/algorithm/sorting)

**最后更新**：2026-03-13
