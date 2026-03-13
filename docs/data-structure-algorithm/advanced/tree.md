# 树与二叉树

> 学习日期：2026-03-13  
> 状态：📝 学习中  
> 预计完成：2026-05-20  
> 难度：⭐⭐⭐⭐☆  
> 前置知识：[数组与链表](/data-structure-algorithm/basic/array-list)、[递归与分治](/data-structure-algorithm/algorithm/recursion)

---

## 📚 目录

[[toc]]

---

## 1. 树的基本概念

### 1.1 什么是树

**树（Tree）** 是一种**非线性数据结构**，由 n（n≥0）个节点组成的有限集合。

**生活案例：**
```
公司组织架构图
        CEO
       / | \
     CTO CFO COO
     / \      / \
   开发 测试  运营 客服
```

**树的术语：**

| 术语 | 说明 | 示例 |
|------|------|------|
| **节点** | 树中的每个元素 | CEO、CTO 等 |
| **根节点** | 最顶层的节点（无父节点） | CEO |
| **父节点** | 直接上级节点 | CTO 的父节点是 CEO |
| **子节点** | 直接下级节点 | CEO 的子节点是 CTO、CFO、COO |
| **兄弟节点** | 同一父节点的子节点 | CTO、CFO、COO 互为兄弟 |
| **叶子节点** | 没有子节点的节点 | 开发、测试、运营、客服 |
| **节点度** | 节点拥有的子树数量 | CEO 的度为 3 |
| **树高度** | 树的最大层数 | 上述树高度为 3 |
| **深度** | 节点到根节点的层数 | 开发节点的深度为 3 |

### 1.2 树的表示

```python
# 树的节点定义
class TreeNode:
    def __init__(self, value):
        self.value = value          # 节点值
        self.children = []          # 子节点列表（可以有多个）

# 创建树
root = TreeNode("CEO")
cto = TreeNode("CTO")
cfo = TreeNode("CFO")

root.children.append(cto)
root.children.append(cfo)
```

---

## 2. 二叉树

### 2.1 什么是二叉树

**二叉树（Binary Tree）** 是每个节点**最多有两个子节点**的树，分别称为**左子节点**和**右子节点**。

**特点：**
- ✅ 每个节点最多 2 个子节点
- ✅ 子节点有左右之分（有序）
- ✅ 即使只有一个子节点，也要区分左右

```
    A        A        A
   /          \      / \
  B            B    B   C
 (左子树)     (右子树)  (完整二叉树)
```

### 2.2 二叉树的节点定义

```python
class BinaryTreeNode:
    def __init__(self, value):
        self.value = value      # 节点值
        self.left = None        # 左子节点
        self.right = None       # 右子节点
```

### 2.3 特殊二叉树

| 类型 | 说明 | 图示 |
|------|------|------|
| **满二叉树** | 所有非叶子节点都有 2 个子节点 | 完美三角形 |
| **完全二叉树** | 除最后一层外，其他层都是满的，最后一层从左到右填充 | 接近满二叉树 |
| **二叉搜索树** | 左子树 < 根 < 右子树 | 有序排列 |
| **平衡二叉树** | 左右子树高度差不超过 1 | 平衡的树 |

**满二叉树示例：**
```
       A
      / \
     B   C
    / \ / \
   D  E F  G
```

**完全二叉树示例：**
```
       A
      / \
     B   C
    / \ /
   D  E F
```

---

## 3. 二叉树的遍历

### 3.1 遍历方式

**遍历（Traversal）** 是按照某种顺序访问树中所有节点的过程。

| 遍历方式 | 访问顺序 | 记忆口诀 |
|---------|---------|---------|
| **前序遍历** | 根 → 左 → 右 | 根左右 |
| **中序遍历** | 左 → 根 → 右 | 左根右 |
| **后序遍历** | 左 → 右 → 根 | 左右根 |
| **层序遍历** | 从上到下，从左到右 | 逐层访问 |

### 3.2 前序遍历（Pre-order）

**递归实现：**

```python
def preorder_traversal(root):
    """
    前序遍历：根 → 左 → 右
    
    参数:
        root: 二叉树根节点
    
    返回:
        遍历结果列表
    """
    result = []
    
    def traverse(node):
        # 终止条件：节点为空
        if node is None:
            return
        
        # 1. 访问根节点
        result.append(node.value)
        
        # 2. 遍历左子树
        traverse(node.left)
        
        # 3. 遍历右子树
        traverse(node.right)
    
    traverse(root)
    return result

# 示例
#       A
#      / \
#     B   C
#    / \
#   D   E

root = BinaryTreeNode("A")
root.left = BinaryTreeNode("B")
root.right = BinaryTreeNode("C")
root.left.left = BinaryTreeNode("D")
root.left.right = BinaryTreeNode("E")

print(preorder_traversal(root))  # 输出：['A', 'B', 'D', 'E', 'C']
```

**迭代实现（使用栈）：**

```python
def preorder_iterative(root):
    """
    前序遍历迭代实现（使用栈）
    
    思路：
    1. 使用栈保存待访问的节点
    2. 先访问根节点，然后右子节点，最后左子节点
    3. 出栈时访问节点
    
    参数:
        root: 二叉树根节点
    
    返回:
        遍历结果列表
    """
    if root is None:
        return []
    
    result = []
    stack = [root]  # 栈初始化，放入根节点
    
    while stack:
        # 弹出栈顶节点
        node = stack.pop()
        result.append(node.value)  # 访问节点
        
        # 先压入右子节点（后访问）
        if node.right:
            stack.append(node.right)
        
        # 再压入左子节点（先访问）
        if node.left:
            stack.append(node.left)
    
    return result
```

### 3.3 中序遍历（In-order）

**递归实现：**

```python
def inorder_traversal(root):
    """
    中序遍历：左 → 根 → 右
    
    参数:
        root: 二叉树根节点
    
    返回:
        遍历结果列表
    """
    result = []
    
    def traverse(node):
        # 终止条件
        if node is None:
            return
        
        # 1. 遍历左子树
        traverse(node.left)
        
        # 2. 访问根节点
        result.append(node.value)
        
        # 3. 遍历右子树
        traverse(node.right)
    
    traverse(root)
    return result

# 对于二叉搜索树，中序遍历得到有序序列
#       4
#      / \
#     2   6
#    / \ / \
#   1  3 5  7

# 中序遍历输出：[1, 2, 3, 4, 5, 6, 7]（有序！）
```

**迭代实现：**

```python
def inorder_iterative(root):
    """
    中序遍历迭代实现（使用栈）
    
    思路：
    1. 一直向左走，把路径上的节点入栈
    2. 到达最左后，出栈访问
    3. 转向右子树，重复过程
    
    参数:
        root: 二叉树根节点
    
    返回:
        遍历结果列表
    """
    result = []
    stack = []
    current = root
    
    while current or stack:
        # 一直向左走，入栈
        while current:
            stack.append(current)
            current = current.left
        
        # 到达最左，出栈访问
        current = stack.pop()
        result.append(current.value)
        
        # 转向右子树
        current = current.right
    
    return result
```

### 3.4 后序遍历（Post-order）

**递归实现：**

```python
def postorder_traversal(root):
    """
    后序遍历：左 → 右 → 根
    
    参数:
        root: 二叉树根节点
    
    返回:
        遍历结果列表
    """
    result = []
    
    def traverse(node):
        # 终止条件
        if node is None:
            return
        
        # 1. 遍历左子树
        traverse(node.left)
        
        # 2. 遍历右子树
        traverse(node.right)
        
        # 3. 访问根节点
        result.append(node.value)
    
    traverse(root)
    return result

# 后序遍历的应用：计算目录大小、删除树等
# 需要先处理子节点，再处理父节点
```

**迭代实现：**

```python
def postorder_iterative(root):
    """
    后序遍历迭代实现（使用双栈）
    
    思路：
    1. 使用两个栈
    2. 第一个栈按"根右左"顺序入栈
    3. 第二个栈记录出栈顺序
    4. 最后第二个栈的出栈顺序就是"左右根"
    
    参数:
        root: 二叉树根节点
    
    返回:
        遍历结果列表
    """
    if root is None:
        return []
    
    stack1 = [root]  # 处理栈
    stack2 = []       # 结果栈
    
    while stack1:
        node = stack1.pop()
        stack2.append(node)
        
        # 先左后右（与后序相反）
        if node.left:
            stack1.append(node.left)
        if node.right:
            stack1.append(node.right)
    
    # 从结果栈弹出，得到后序遍历
    result = []
    while stack2:
        result.append(stack2.pop().value)
    
    return result
```

### 3.5 层序遍历（Level-order）

**使用队列实现：**

```python
from collections import deque

def level_order_traversal(root):
    """
    层序遍历：从上到下，从左到右
    
    思路：
    1. 使用队列保存待访问的节点
    2. 每次从队列取出一个节点
    3. 将该节点的子节点加入队列
    
    参数:
        root: 二叉树根节点
    
    返回:
        遍历结果列表
    """
    if root is None:
        return []
    
    result = []
    queue = deque([root])  # 队列初始化
    
    while queue:
        # 出队
        node = queue.popleft()
        result.append(node.value)
        
        # 子节点入队（先左后右）
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    
    return result

# 分层输出
def level_order_by_level(root):
    """
    层序遍历（按层输出）
    
    返回:
        二维列表，每层一个列表
    """
    if root is None:
        return []
    
    result = []
    queue = deque([root])
    
    while queue:
        level_size = len(queue)  # 当前层的节点数
        level = []
        
        # 处理当前层的所有节点
        for _ in range(level_size):
            node = queue.popleft()
            level.append(node.value)
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        
        result.append(level)
    
    return result

# 示例
#       A
#      / \
#     B   C
#    / \   \
#   D   E   F

# 输出：[['A'], ['B', 'C'], ['D', 'E', 'F']]
```

### 3.6 遍历复杂度对比

| 遍历方式 | 时间复杂度 | 空间复杂度 | 应用场景 |
|---------|-----------|-----------|---------|
| **前序** | O(n) | O(h) | 复制树、序列化 |
| **中序** | O(n) | O(h) | 二叉搜索树排序 |
| **后序** | O(n) | O(h) | 删除树、计算大小 |
| **层序** | O(n) | O(w) | 按层处理、BFS |

> n = 节点数，h = 树高，w = 树的最大宽度

---

## 4. 二叉搜索树（BST）

### 4.1 什么是二叉搜索树

**二叉搜索树（Binary Search Tree, BST）** 是一种特殊的二叉树，满足：

1. 左子树所有节点 < 根节点
2. 右子树所有节点 > 根节点
3. 左右子树也都是二叉搜索树

```
       8
      / \
     3   10
    / \    \
   1   6    14
      / \   /
     4   7 13
```

### 4.2 BST 的节点定义

```python
class BSTNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
```

### 4.3 查找操作

```python
def search_bst(root, target):
    """
    在 BST 中查找目标值
    
    思路：
    1. 从根节点开始
    2. 目标值 < 当前值，向左走
    3. 目标值 > 当前值，向右走
    4. 相等则找到
    
    时间复杂度：O(h)，h 为树高
    
    参数:
        root: BST 根节点
        target: 目标值
    
    返回:
        找到的节点，未找到返回 None
    """
    current = root
    
    while current:
        if target == current.value:
            return current  # 找到
        elif target < current.value:
            current = current.left  # 向左
        else:
            current = current.right  # 向右
    
    return None  # 未找到

# 递归版本
def search_bst_recursive(root, target):
    if root is None:
        return None
    
    if target == root.value:
        return root
    elif target < root.value:
        return search_bst_recursive(root.left, target)
    else:
        return search_bst_recursive(root.right, target)
```

### 4.4 插入操作

```python
def insert_bst(root, value):
    """
    在 BST 中插入新值
    
    思路：
    1. 从根节点开始
    2. 新值 < 当前值，向左走
    3. 新值 > 当前值，向右走
    4. 找到空位置，插入新节点
    
    时间复杂度：O(h)
    
    参数:
        root: BST 根节点
        value: 要插入的值
    
    返回:
        插入后的根节点
    """
    # 空树，创建根节点
    if root is None:
        return BSTNode(value)
    
    current = root
    while True:
        if value < current.value:
            # 向左
            if current.left is None:
                current.left = BSTNode(value)
                break
            current = current.left
        else:
            # 向右
            if current.right is None:
                current.right = BSTNode(value)
                break
            current = current.right
    
    return root

# 递归版本
def insert_bst_recursive(root, value):
    if root is None:
        return BSTNode(value)
    
    if value < root.value:
        root.left = insert_bst_recursive(root.left, value)
    else:
        root.right = insert_bst_recursive(root.right, value)
    
    return root
```

### 4.5 删除操作

```python
def delete_bst(root, value):
    """
    在 BST 中删除节点
    
    三种情况：
    1. 叶子节点：直接删除
    2. 只有一个子节点：子节点替代
    3. 有两个子节点：用右子树最小值（或左子树最大值）替代
    
    时间复杂度：O(h)
    
    参数:
        root: BST 根节点
        value: 要删除的值
    
    返回:
        删除后的根节点
    """
    if root is None:
        return None
    
    # 查找要删除的节点
    if value < root.value:
        root.left = delete_bst(root.left, value)
    elif value > root.value:
        root.right = delete_bst(root.right, value)
    else:
        # 找到要删除的节点
        
        # 情况 1 & 2：没有子节点或只有一个子节点
        if root.left is None:
            return root.right  # 返回右子节点（可能为 None）
        elif root.right is None:
            return root.left  # 返回左子节点
        
        # 情况 3：有两个子节点
        # 找到右子树的最小值
        min_node = find_min(root.right)
        
        # 用最小值替代当前节点
        root.value = min_node.value
        
        # 删除右子树的最小值节点
        root.right = delete_bst(root.right, min_node.value)
    
    return root

def find_min(node):
    """
    找到 BST 中的最小值节点（最左节点）
    """
    while node.left:
        node = node.left
    return node
```

### 4.6 验证 BST

```python
def is_valid_bst(root):
    """
    验证是否为有效的 BST
    
    思路：
    1. 中序遍历应该是递增序列
    2. 或者递归验证每个节点的值在合法范围内
    
    参数:
        root: 二叉树根节点
    
    返回:
        是否为有效 BST
    """
    def validate(node, min_val, max_val):
        # 空节点是有效的
        if node is None:
            return True
        
        # 当前节点值必须在 (min_val, max_val) 范围内
        if node.value <= min_val or node.value >= max_val:
            return False
        
        # 递归验证左右子树
        # 左子树：上界更新为当前节点值
        # 右子树：下界更新为当前节点值
        return (validate(node.left, min_val, node.value) and
                validate(node.right, node.value, max_val))
    
    return validate(root, float('-inf'), float('inf'))

# 示例
# 有效的 BST：
#       5
#      / \
#     3   7
#    / \
#   1   4

# 无效的 BST：
#       5
#      / \
#     3   7
#    / \
#   1   6  # 6 应该在右子树
```

---

## 5. 平衡二叉树（AVL 树）

### 5.1 什么是 AVL 树

**AVL 树** 是一种自平衡的二叉搜索树，满足：

1. 是二叉搜索树
2. 任意节点的左右子树高度差不超过 1

**平衡因子 = 左子树高度 - 右子树高度**

| 平衡因子 | 说明 |
|---------|------|
| -1, 0, 1 | 平衡 |
| < -1 或 > 1 | 不平衡，需要旋转 |

### 5.2 旋转操作

**LL 旋转（右旋）：**

```python
def rotate_right(y):
    """
    LL 旋转（右旋）
    
    场景：左子树过高
    
        y                    x
       /                    / \
      x       →           T1   y
     / \                       / \
    T1  T2                   T2  T3
    
    参数:
        y: 不平衡的节点
    
    返回:
        新的根节点 x
    """
    x = y.left
    T2 = x.right
    
    # 旋转
    x.right = y
    y.left = T2
    
    # 更新高度
    y.height = 1 + max(get_height(y.left), get_height(y.right))
    x.height = 1 + max(get_height(x.left), get_height(x.right))
    
    return x
```

**RR 旋转（左旋）：**

```python
def rotate_left(x):
    """
    RR 旋转（左旋）
    
    场景：右子树过高
    
    x                        y
     \                      / \
      y       →            x   T3
     / \                  / \
    T1  T3              T1  T2
    
    参数:
        x: 不平衡的节点
    
    返回:
        新的根节点 y
    """
    y = x.right
    T1 = y.left
    
    # 旋转
    y.left = x
    x.right = T1
    
    # 更新高度
    x.height = 1 + max(get_height(x.left), get_height(x.right))
    y.height = 1 + max(get_height(y.left), get_height(y.right))
    
    return y
```

### 5.3 AVL 树插入

```python
class AVLNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        self.height = 1  # 节点高度

def get_height(node):
    """获取节点高度"""
    if node is None:
        return 0
    return node.height

def get_balance(node):
    """获取平衡因子"""
    if node is None:
        return 0
    return get_height(node.left) - get_height(node.right)

def insert_avl(root, value):
    """
    AVL 树插入
    
    步骤：
    1. 按 BST 规则插入
    2. 更新高度
    3. 检查平衡
    4. 不平衡则旋转
    
    参数:
        root: AVL 树根节点
        value: 要插入的值
    
    返回:
        插入后的根节点
    """
    # 1. 标准 BST 插入
    if root is None:
        return AVLNode(value)
    
    if value < root.value:
        root.left = insert_avl(root.left, value)
    else:
        root.right = insert_avl(root.right, value)
    
    # 2. 更新高度
    root.height = 1 + max(get_height(root.left), get_height(root.right))
    
    # 3. 检查平衡因子
    balance = get_balance(root)
    
    # 4. 如果不平衡，进行旋转
    
    # LL 情况：左子树的左边插入
    if balance > 1 and value < root.left.value:
        return rotate_right(root)
    
    # RR 情况：右子树的右边插入
    if balance < -1 and value > root.right.value:
        return rotate_left(root)
    
    # LR 情况：左子树的右边插入
    if balance > 1 and value > root.left.value:
        root.left = rotate_left(root.left)
        return rotate_right(root)
    
    # RL 情况：右子树的左边插入
    if balance < -1 and value < root.right.value:
        root.right = rotate_right(root.right)
        return rotate_left(root)
    
    return root
```

---

## 6. 堆与优先队列

### 6.1 什么是堆

**堆（Heap）** 是一种特殊的完全二叉树，满足：

- **大顶堆**：每个节点 ≥ 其子节点
- **小顶堆**：每个节点 ≤ 其子节点

```
大顶堆：
       9
      / \
     7   8
    / \ /
   5  6 4

小顶堆：
       1
      / \
     3   2
    / \ /
   5  4 6
```

### 6.2 堆的数组表示

```python
# 堆可以用数组表示（完全二叉树）
# 索引关系：
# - 父节点：(i - 1) // 2
# - 左子节点：2 * i + 1
# - 右子节点：2 * i + 2

class MaxHeap:
    def __init__(self):
        self.heap = []
    
    def parent(self, i):
        return (i - 1) // 2
    
    def left_child(self, i):
        return 2 * i + 1
    
    def right_child(self, i):
        return 2 * i + 2
```

### 6.3 堆的插入

```python
class MaxHeap:
    def __init__(self):
        self.heap = []
    
    def insert(self, value):
        """
        堆插入
        
        步骤：
        1. 添加到末尾
        2. 向上调整（heapify up）
        
        时间复杂度：O(log n)
        """
        self.heap.append(value)
        self._heapify_up(len(self.heap) - 1)
    
    def _heapify_up(self, i):
        """
        向上调整
        
        与父节点比较，如果比父节点大则交换
        """
        while i > 0:
            parent_idx = self.parent(i)
            
            # 如果当前节点比父节点大，交换
            if self.heap[i] > self.heap[parent_idx]:
                self.heap[i], self.heap[parent_idx] = \
                    self.heap[parent_idx], self.heap[i]
                i = parent_idx
            else:
                break
```

### 6.4 堆的删除

```python
class MaxHeap:
    def extract_max(self):
        """
        删除并返回最大值（堆顶）
        
        步骤：
        1. 保存堆顶
        2. 末尾元素移到堆顶
        3. 向下调整（heapify down）
        
        时间复杂度：O(log n)
        """
        if not self.heap:
            return None
        
        # 保存最大值
        max_value = self.heap[0]
        
        # 末尾移到堆顶
        self.heap[0] = self.heap[-1]
        self.heap.pop()
        
        # 向下调整
        self._heapify_down(0)
        
        return max_value
    
    def _heapify_down(self, i):
        """
        向下调整
        
        与较大的子节点比较，如果比子节点小则交换
        """
        n = len(self.heap)
        
        while True:
            largest = i
            left = self.left_child(i)
            right = self.right_child(i)
            
            # 找最大的节点
            if left < n and self.heap[left] > self.heap[largest]:
                largest = left
            
            if right < n and self.heap[right] > self.heap[largest]:
                largest = right
            
            # 如果当前节点已经是最大的，结束
            if largest == i:
                break
            
            # 交换
            self.heap[i], self.heap[largest] = \
                self.heap[largest], self.heap[i]
            i = largest
```

---

## 7. 实战案例

### 7.1 文件系统目录结构

```python
class DirectoryNode:
    """文件系统目录节点"""
    def __init__(self, name, is_file=False, size=0):
        self.name = name
        self.is_file = is_file
        self.size = size
        self.children = {}  # 子目录/文件
    
    def add_child(self, name, node):
        self.children[name] = node
    
    def get_total_size(self):
        """计算目录总大小（后序遍历）"""
        if self.is_file:
            return self.size
        
        total = 0
        for child in self.children.values():
            total += child.get_total_size()
        
        return total
    
    def find_file(self, name):
        """查找文件（DFS）"""
        if self.name == name and self.is_file:
            return self
        
        for child in self.children.values():
            result = child.find_file(name)
            if result:
                return result
        
        return None

# 使用
root = DirectoryNode("/", is_file=False)
root.add_child("home", DirectoryNode("home"))
root.add_child("etc", DirectoryNode("etc"))
root.children["home"].add_child("user", DirectoryNode("user"))
```

### 7.2 表达式树

```python
class ExpressionNode:
    """表达式树节点"""
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
    
    def evaluate(self):
        """计算表达式值（后序遍历）"""
        # 叶子节点是数字
        if self.left is None and self.right is None:
            return float(self.value)
        
        # 内部节点是运算符
        left_val = self.left.evaluate()
        right_val = self.right.evaluate()
        
        if self.value == '+':
            return left_val + right_val
        elif self.value == '-':
            return left_val - right_val
        elif self.value == '*':
            return left_val * right_val
        elif self.value == '/':
            return left_val / right_val

# 表达式：(3 + 5) * 2
#       *
#      / \
#     +   2
#    / \
#   3   5

root = ExpressionNode('*')
root.left = ExpressionNode('+')
root.right = ExpressionNode('2')
root.left.left = ExpressionNode('3')
root.left.right = ExpressionNode('5')

print(root.evaluate())  # 输出：16.0
```

### 7.3 Huffman 编码

```python
import heapq
from collections import Counter

class HuffmanNode:
    def __init__(self, char=None, freq=0):
        self.char = char
        self.freq = freq
        self.left = None
        self.right = None
    
    def __lt__(self, other):
        return self.freq < other.freq

def build_huffman_tree(text):
    """
    构建 Huffman 树
    
    步骤：
    1. 统计字符频率
    2. 创建优先队列（最小堆）
    3. 反复合并频率最小的两个节点
    """
    # 统计频率
    freq_map = Counter(text)
    
    # 创建最小堆
    heap = [HuffmanNode(char, freq) for char, freq in freq_map.items()]
    heapq.heapify(heap)
    
    # 合并节点
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
    """生成 Huffman 编码（前序遍历）"""
    if node is None:
        return
    
    # 叶子节点
    if node.char is not None:
        codes[node.char] = prefix
        return
    
    # 左子树编码加 0
    generate_codes(node.left, prefix + "0", codes)
    
    # 右子树编码加 1
    generate_codes(node.right, prefix + "1", codes)
    
    return codes

# 使用
text = "hello world"
tree = build_huffman_tree(text)
codes = generate_codes(tree)
print(codes)  # 输出每个字符的 Huffman 编码
```

---

## 📝 练习题

### 基础题

1. **树的遍历**：实现二叉树的前序、中序、后序遍历（递归 + 迭代）

2. **树的高度**：编写函数计算二叉树的高度

3. **对称二叉树**：判断一棵二叉树是否是对称的

### 进阶题

4. **二叉搜索树验证**：验证一棵二叉树是否为有效的 BST

5. **最近公共祖先**：找到二叉树中两个节点的最近公共祖先

6. **路径总和**：判断二叉树中是否存在从根到叶子的路径，路径和等于目标值

### 挑战题

7. **序列化与反序列化**：实现二叉树的序列化和反序列化

8. **AVL 树实现**：完整实现 AVL 树的插入、删除、旋转

9. **Huffman 编码**：实现完整的 Huffman 编码和解码

---

## 🔗 参考资料

### 经典书籍
- 📚 《算法导论》第 10-12 章：树
- 📚 《数据结构与算法分析》第 4 章：树
- 📚 《剑指 Offer》树相关题目

### 在线资源
- 🔗 [VisuAlgo 树可视化](https://visualgo.net/en/bst)
- 🔗 [LeetCode 树专题](https://leetcode.com/tag/tree/)
- 🔗 [GeeksforGeeks 树教程](https://www.geeksforgeeks.org/tree-data-structure/)

---

## 📊 本章小结

| 知识点 | 重要程度 | 掌握要求 |
|--------|---------|---------|
| 二叉树遍历 | ⭐⭐⭐⭐⭐ | 熟练手写 |
| 二叉搜索树 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| AVL 树 | ⭐⭐⭐⭐ | 理解原理 |
| 堆与优先队列 | ⭐⭐⭐⭐⭐ | 熟练运用 |
| 实战应用 | ⭐⭐⭐⭐ | 理解掌握 |

---

**上一章：** [递归与分治](/data-structure-algorithm/algorithm/recursion)  
**下一章：** [堆与优先队列](/data-structure-algorithm/advanced/heap)

**最后更新**：2026-03-13
