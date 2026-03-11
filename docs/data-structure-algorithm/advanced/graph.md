# 图论基础

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-20  
> 难度：⭐⭐⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 图的定义

**图（Graph）：** 由顶点（Vertex）和边（Edge）组成的数据结构

**表示：** G = (V, E)
- V：顶点集合
- E：边集合

**分类：**
- **有向图** - 边有方向
- **无向图** - 边无方向
- **加权图** - 边有权重
- **无权图** - 边无权重

---

## 2. 图的表示

### 2.1 邻接矩阵

```java
/**
 * 邻接矩阵表示图
 */
public class AdjacencyMatrixGraph {
    private int[][] matrix;
    private int n;  // 顶点数
    
    public AdjacencyMatrixGraph(int n) {
        this.n = n;
        this.matrix = new int[n][n];
    }
    
    // 添加边 O(1)
    public void addEdge(int u, int v, int weight) {
        matrix[u][v] = weight;
    }
    
    // 删除边 O(1)
    public void removeEdge(int u, int v) {
        matrix[u][v] = 0;
    }
    
    // 判断是否有边 O(1)
    public boolean hasEdge(int u, int v) {
        return matrix[u][v] != 0;
    }
    
    // 获取边的权重 O(1)
    public int getWeight(int u, int v) {
        return matrix[u][v];
    }
}

// 空间复杂度：O(n²)
// 适合稠密图
```

### 2.2 邻接表

```java
/**
 * 邻接表表示图
 */
public class AdjacencyListGraph {
    private List<List<Edge>> adjList;
    private int n;
    
    private static class Edge {
        int to;
        int weight;
        
        Edge(int to, int weight) {
            this.to = to;
            this.weight = weight;
        }
    }
    
    public AdjacencyListGraph(int n) {
        this.n = n;
        this.adjList = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adjList.add(new ArrayList<>());
        }
    }
    
    // 添加边 O(1)
    public void addEdge(int u, int v, int weight) {
        adjList.get(u).add(new Edge(v, weight));
    }
    
    // 获取邻居 O(1)
    public List<Edge> getNeighbors(int u) {
        return adjList.get(u);
    }
}

// 空间复杂度：O(n + m)
// 适合稀疏图
```

---

## 3. 图的遍历

### 3.1 DFS（深度优先搜索）

```java
/**
 * DFS - 递归实现
 */
public void dfs(int[][] graph, int start, boolean[] visited) {
    System.out.print(start + " ");
    visited[start] = true;
    
    for (int neighbor : graph[start]) {
        if (!visited[neighbor]) {
            dfs(graph, neighbor, visited);
        }
    }
}

/**
 * DFS - 迭代实现（使用栈）
 */
public void dfsIterative(int[][] graph, int start) {
    boolean[] visited = new boolean[graph.length];
    Deque<Integer> stack = new ArrayDeque<>();
    
    stack.push(start);
    
    while (!stack.isEmpty()) {
        int node = stack.pop();
        
        if (visited[node]) continue;
        
        System.out.print(node + " ");
        visited[node] = true;
        
        // 逆序入栈，保证正序访问
        for (int i = graph[node].length - 1; i >= 0; i--) {
            int neighbor = graph[node][i];
            if (!visited[neighbor]) {
                stack.push(neighbor);
            }
        }
    }
}

// 时间复杂度：O(V + E)
// 空间复杂度：O(V)
```

### 3.2 BFS（广度优先搜索）

```java
/**
 * BFS - 使用队列
 */
public void bfs(int[][] graph, int start) {
    boolean[] visited = new boolean[graph.length];
    Queue<Integer> queue = new LinkedList<>();
    
    queue.offer(start);
    visited[start] = true;
    
    while (!queue.isEmpty()) {
        int node = queue.poll();
        System.out.print(node + " ");
        
        for (int neighbor : graph[node]) {
            if (!visited[neighbor]) {
                queue.offer(neighbor);
                visited[neighbor] = true;
            }
        }
    }
}

// 时间复杂度：O(V + E)
// 空间复杂度：O(V)
```

### 3.3 DFS vs BFS

| 特性 | DFS | BFS |
|------|-----|-----|
| 数据结构 | 栈（递归） | 队列 |
| 应用场景 | 路径查找、拓扑排序 | 最短路径（无权）、层次遍历 |
| 空间复杂度 | O(V) | O(V) |
| 是否最短路径 | ❌ | ✅（无权图） |

---

## 4. 最短路径算法

### 4.1 Dijkstra 算法

```java
/**
 * Dijkstra 算法 - 单源最短路径（无负权边）
 */
public int[] dijkstra(int[][] graph, int start) {
    int n = graph.length;
    int[] dist = new int[n];
    boolean[] visited = new boolean[n];
    
    // 初始化
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[start] = 0;
    
    // 小顶堆：{节点，距离}
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
    pq.offer(new int[]{start, 0});
    
    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int u = curr[0];
        
        if (visited[u]) continue;
        visited[u] = true;
        
        // 遍历邻居
        for (int v = 0; v < n; v++) {
            if (graph[u][v] > 0 && !visited[v]) {
                int newDist = dist[u] + graph[u][v];
                
                if (newDist < dist[v]) {
                    dist[v] = newDist;
                    pq.offer(new int[]{v, newDist});
                }
            }
        }
    }
    
    return dist;
}

// 时间复杂度：O((V + E) log V)
// 空间复杂度：O(V)
```

### 4.2 Bellman-Ford 算法

```java
/**
 * Bellman-Ford 算法 - 支持负权边
 */
public int[] bellmanFord(int[][] edges, int n, int start) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[start] = 0;
    
    // 松弛 n-1 轮
    for (int i = 0; i < n - 1; i++) {
        for (int[] edge : edges) {
            int u = edge[0], v = edge[1], w = edge[2];
            
            if (dist[u] != Integer.MAX_VALUE && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
            }
        }
    }
    
    // 检查负权环
    for (int[] edge : edges) {
        int u = edge[0], v = edge[1], w = edge[2];
        
        if (dist[u] != Integer.MAX_VALUE && dist[u] + w < dist[v]) {
            throw new RuntimeException("存在负权环");
        }
    }
    
    return dist;
}

// 时间复杂度：O(V * E)
// 空间复杂度：O(V)
```

### 4.3 Floyd-Warshall 算法

```java
/**
 * Floyd-Warshall 算法 - 多源最短路径
 */
public int[][] floydWarshall(int[][] graph) {
    int n = graph.length;
    int[][] dist = new int[n][n];
    
    // 初始化
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            dist[i][j] = graph[i][j];
        }
    }
    
    // 动态规划
    for (int k = 0; k < n; k++) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (dist[i][k] != Integer.MAX_VALUE && 
                    dist[k][j] != Integer.MAX_VALUE) {
                    dist[i][j] = Math.min(dist[i][j], 
                                          dist[i][k] + dist[k][j]);
                }
            }
        }
    }
    
    return dist;
}

// 时间复杂度：O(V³)
// 空间复杂度：O(V²)
```

---

## 5. 最小生成树

### 5.1 Prim 算法

```java
/**
 * Prim 算法 - 最小生成树
 */
public int prim(int[][] graph) {
    int n = graph.length;
    boolean[] visited = new boolean[n];
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
    
    pq.offer(new int[]{0, 0});  // {节点，权重}
    int mstWeight = 0;
    int edges = 0;
    
    while (!pq.isEmpty() && edges < n) {
        int[] curr = pq.poll();
        int u = curr[0], w = curr[1];
        
        if (visited[u]) continue;
        
        visited[u] = true;
        mstWeight += w;
        edges++;
        
        for (int v = 0; v < n; v++) {
            if (graph[u][v] > 0 && !visited[v]) {
                pq.offer(new int[]{v, graph[u][v]});
            }
        }
    }
    
    return mstWeight;
}

// 时间复杂度：O((V + E) log V)
// 空间复杂度：O(V)
```

### 5.2 Kruskal 算法

```java
/**
 * Kruskal 算法 - 最小生成树 + 并查集
 */
public int kruskal(int[][] edges, int n) {
    // 按权重排序
    Arrays.sort(edges, (a, b) -> a[2] - b[2]);
    
    UnionFind uf = new UnionFind(n);
    int mstWeight = 0;
    int edgeCount = 0;
    
    for (int[] edge : edges) {
        int u = edge[0], v = edge[1], w = edge[2];
        
        if (!uf.isConnected(u, v)) {
            uf.union(u, v);
            mstWeight += w;
            edgeCount++;
        }
    }
    
    return edgeCount == n - 1 ? mstWeight : -1;
}

// 并查集
class UnionFind {
    private int[] parent;
    private int[] rank;
    
    public UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i;
            rank[i] = 1;
        }
    }
    
    public int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);  // 路径压缩
        }
        return parent[x];
    }
    
    public void union(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);
        
        if (rootX != rootY) {
            if (rank[rootX] > rank[rootY]) {
                parent[rootY] = rootX;
            } else if (rank[rootX] < rank[rootY]) {
                parent[rootX] = rootY;
            } else {
                parent[rootY] = rootX;
                rank[rootX]++;
            }
        }
    }
    
    public boolean isConnected(int x, int y) {
        return find(x) == find(y);
    }
}

// 时间复杂度：O(E log E)
// 空间复杂度：O(V)
```

---

## 6. 拓扑排序

```java
/**
 * 拓扑排序 - Kahn 算法（BFS）
 */
public int[] topologicalSort(int[][] graph) {
    int n = graph.length;
    int[] inDegree = new int[n];
    
    // 计算入度
    for (int u = 0; u < n; u++) {
        for (int v : graph[u]) {
            inDegree[v]++;
        }
    }
    
    // 入度为 0 的节点入队
    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < n; i++) {
        if (inDegree[i] == 0) {
            queue.offer(i);
        }
    }
    
    int[] result = new int[n];
    int index = 0;
    
    while (!queue.isEmpty()) {
        int u = queue.poll();
        result[index++] = u;
        
        for (int v : graph[u]) {
            inDegree[v]--;
            if (inDegree[v] == 0) {
                queue.offer(v);
            }
        }
    }
    
    // 检查是否有环
    if (index < n) {
        throw new RuntimeException("图中存在环，无法拓扑排序");
    }
    
    return result;
}

// 时间复杂度：O(V + E)
// 空间复杂度：O(V)
```

---

## 7. LeetCode 例题

### 7.1 岛屿数量

```java
/**
 * LeetCode 200. 岛屿数量
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
    
    grid[i][j] = '0';  // 标记为已访问
    
    dfs(grid, i + 1, j);
    dfs(grid, i - 1, j);
    dfs(grid, i, j + 1);
    dfs(grid, i, j - 1);
}

// 时间复杂度：O(mn)
// 空间复杂度：O(mn)
```

### 7.2 课程表

```java
/**
 * LeetCode 207. 课程表
 */
public boolean canFinish(int numCourses, int[][] prerequisites) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) {
        graph.add(new ArrayList<>());
    }
    
    int[] inDegree = new int[numCourses];
    
    // 建图
    for (int[] pair : prerequisites) {
        int course = pair[0], prereq = pair[1];
        graph.get(prereq).add(course);
        inDegree[course]++;
    }
    
    // Kahn 算法
    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < numCourses; i++) {
        if (inDegree[i] == 0) {
            queue.offer(i);
        }
    }
    
    int count = 0;
    
    while (!queue.isEmpty()) {
        int u = queue.poll();
        count++;
        
        for (int v : graph.get(u)) {
            inDegree[v]--;
            if (inDegree[v] == 0) {
                queue.offer(v);
            }
        }
    }
    
    return count == numCourses;
}

// 时间复杂度：O(V + E)
// 空间复杂度：O(V)
```

### 7.3 网络延迟时间

```java
/**
 * LeetCode 743. 网络延迟时间
 */
public int networkDelayTime(int[][] times, int n, int k) {
    // 建图
    List<List<int[]>> graph = new ArrayList<>();
    for (int i = 0; i <= n; i++) {
        graph.add(new ArrayList<>());
    }
    
    for (int[] time : times) {
        int u = time[0], v = time[1], w = time[2];
        graph.get(u).add(new int[]{v, w});
    }
    
    // Dijkstra
    int[] dist = new int[n + 1];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[k] = 0;
    
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
    pq.offer(new int[]{k, 0});
    
    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int u = curr[0];
        
        for (int[] edge : graph.get(u)) {
            int v = edge[0], w = edge[1];
            
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.offer(new int[]{v, dist[v]});
            }
        }
    }
    
    int maxDist = 0;
    for (int i = 1; i <= n; i++) {
        if (dist[i] == Integer.MAX_VALUE) return -1;
        maxDist = Math.max(maxDist, dist[i]);
    }
    
    return maxDist;
}

// 时间复杂度：O((V + E) log V)
// 空间复杂度：O(V)
```

---

## 📝 待办事项

- [ ] 理解图的表示方法
- [ ] 掌握 DFS 和 BFS
- [ ] 掌握 Dijkstra 算法
- [ ] 理解最小生成树
- [ ] 掌握拓扑排序
- [ ] 完成 LeetCode 3 道题
- [ ] 理解并查集

---

**下一讲：[跳表与 B 树](/data-structure-algorithm/advanced/skip-list-b-tree)**

---

**推荐资源：**
- 📖 《算法 4》第 4 章
- 🔗 LeetCode 图论专题
- 🎥 B 站：图论算法详解
