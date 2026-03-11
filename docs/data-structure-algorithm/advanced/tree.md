# 树与二叉树

> 学习日期：2026-03-11  
> 状态：📝 学习中  
> 预计完成：2026-03-18  
> 难度：⭐⭐⭐

---

## 📚 目录

[[toc]]

---

## 1. 树的定义

**树（Tree）：** n 个节点的有限集合，n=0 时为空树

**特点：**
- 有且仅有一个根节点
- 除根节点外，每个节点有且仅有一个父节点
- 节点可以有 0 个或多个子节点

**术语：**
- 根节点（Root）- 最顶层节点
- 叶子节点（Leaf）- 没有子节点的节点
- 高度（Height）- 根到叶子的最长路径
- 深度（Depth）- 根到当前节点的路径
- 度（Degree）- 节点的子节点数

---

## 2. 二叉树

### 2.1 定义

**二叉树：** 每个节点最多有两个子节点的树

**特点：**
- 左子树和右子树有序
- 第 i 层最多有 2^(i-1) 个节点
- 深度为 k 的二叉树最多有 2^k - 1 个节点

### 2.2 二叉树实现

```java
/**
 * 二叉树节点
 */
public class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    
    TreeNode(int val) {
        this.val = val;
    }
    
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

/**
 * 二叉树
 */
public class BinaryTree {
    TreeNode root;
    
    // 前序遍历（递归）
    public void preorderTraversal(TreeNode node) {
        if (node == null) return;
        
        System.out.print(node.val + " ");
        preorderTraversal(node.left);
        preorderTraversal(node.right);
    }
    
    // 中序遍历（递归）
    public void inorderTraversal(TreeNode node) {
        if (node == null) return;
        
        inorderTraversal(node.left);
        System.out.print(node.val + " ");
        inorderTraversal(node.right);
    }
    
    // 后序遍历（递归）
    public void postorderTraversal(TreeNode node) {
        if (node == null) return;
        
        postorderTraversal(node.left);
        postorderTraversal(node.right);
        System.out.print(node.val + " ");
    }
    
    // 层序遍历（BFS）
    public void levelOrderTraversal(TreeNode node) {
        if (node == null) return;
        
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(node);
        
        while (!queue.isEmpty()) {
            TreeNode curr = queue.poll();
            System.out.print(curr.val + " ");
            
            if (curr.left != null) {
                queue.offer(curr.left);
            }
            if (curr.right != null) {
                queue.offer(curr.right);
            }
        }
    }
    
    // 树的高度
    public int height(TreeNode node) {
        if (node == null) return 0;
        
        int leftHeight = height(node.left);
        int rightHeight = height(node.right);
        
        return Math.max(leftHeight, rightHeight) + 1;
    }
    
    // 节点数
    public int countNodes(TreeNode node) {
        if (node == null) return 0;
        
        return countNodes(node.left) + countNodes(node.right) + 1;
    }
}
```

### 2.3 遍历方式对比

| 遍历方式 | 访问顺序 | 应用 |
|----------|----------|------|
| 前序遍历 | 根→左→右 | 复制树、表达式前缀 |
| 中序遍历 | 左→根→右 | BST 中序=有序序列 |
| 后序遍历 | 左→右→根 | 删除树、表达式后缀 |
| 层序遍历 | 从上到下 | 层次处理、BFS |

---

## 3. 二叉搜索树（BST）

### 3.1 定义

**二叉搜索树：** 左子树所有节点 < 根节点 < 右子树所有节点

### 3.2 BST 实现

```java
/**
 * 二叉搜索树
 */
public class BinarySearchTree {
    TreeNode root;
    
    // 插入 O(log n) 平均
    public void insert(int val) {
        root = insert(root, val);
    }
    
    private TreeNode insert(TreeNode node, int val) {
        if (node == null) {
            return new TreeNode(val);
        }
        
        if (val < node.val) {
            node.left = insert(node.left, val);
        } else if (val > node.val) {
            node.right = insert(node.right, val);
        }
        
        return node;
    }
    
    // 查找 O(log n) 平均
    public boolean search(int val) {
        return search(root, val) != null;
    }
    
    private TreeNode search(TreeNode node, int val) {
        if (node == null || node.val == val) {
            return node;
        }
        
        if (val < node.val) {
            return search(node.left, val);
        } else {
            return search(node.right, val);
        }
    }
    
    // 删除 O(log n) 平均
    public void delete(int val) {
        root = delete(root, val);
    }
    
    private TreeNode delete(TreeNode node, int val) {
        if (node == null) return null;
        
        if (val < node.val) {
            node.left = delete(node.left, val);
        } else if (val > node.val) {
            node.right = delete(node.right, val);
        } else {
            // 找到要删除的节点
            
            // 情况 1：叶子节点
            if (node.left == null && node.right == null) {
                return null;
            }
            
            // 情况 2：只有一个子节点
            if (node.left == null) {
                return node.right;
            }
            if (node.right == null) {
                return node.left;
            }
            
            // 情况 3：有两个子节点
            // 找右子树最小值（或左子树最大值）
            TreeNode minNode = findMin(node.right);
            node.val = minNode.val;
            node.right = delete(node.right, minNode.val);
        }
        
        return node;
    }
    
    private TreeNode findMin(TreeNode node) {
        while (node.left != null) {
            node = node.left;
        }
        return node;
    }
    
    // 中序遍历（有序）
    public void inorder() {
        inorder(root);
        System.out.println();
    }
    
    private void inorder(TreeNode node) {
        if (node == null) return;
        
        inorder(node.left);
        System.out.print(node.val + " ");
        inorder(node.right);
    }
}
```

---

## 4. 平衡二叉树（AVL）

### 4.1 定义

**AVL 树：** 任意节点的左右子树高度差不超过 1

**平衡因子：** `balance = height(left) - height(right)`

### 4.2 旋转操作

```java
/**
 * AVL 树节点
 */
public class AVLNode {
    int val;
    int height;
    AVLNode left;
    AVLNode right;
    
    AVLNode(int val) {
        this.val = val;
        this.height = 1;
    }
}

/**
 * AVL 树
 */
public class AVLTree {
    AVLNode root;
    
    // 获取高度
    private int height(AVLNode node) {
        return node == null ? 0 : node.height;
    }
    
    // 获取平衡因子
    private int getBalance(AVLNode node) {
        return node == null ? 0 : height(node.left) - height(node.right);
    }
    
    // 更新高度
    private void updateHeight(AVLNode node) {
        node.height = Math.max(height(node.left), height(node.right)) + 1;
    }
    
    // 右旋
    private AVLNode rotateRight(AVLNode y) {
        AVLNode x = y.left;
        AVLNode T2 = x.right;
        
        // 旋转
        x.right = y;
        y.left = T2;
        
        // 更新高度
        updateHeight(y);
        updateHeight(x);
        
        return x;  // 新的根
    }
    
    // 左旋
    private AVLNode rotateLeft(AVLNode x) {
        AVLNode y = x.right;
        AVLNode T2 = y.left;
        
        // 旋转
        y.left = x;
        x.right = T2;
        
        // 更新高度
        updateHeight(x);
        updateHeight(y);
        
        return y;  // 新的根
    }
    
    // 插入
    public AVLNode insert(AVLNode node, int val) {
        // 1. BST 插入
        if (node == null) {
            return new AVLNode(val);
        }
        
        if (val < node.val) {
            node.left = insert(node.left, val);
        } else if (val > node.val) {
            node.right = insert(node.right, val);
        } else {
            return node;  // 不允许重复
        }
        
        // 2. 更新高度
        updateHeight(node);
        
        // 3. 检查平衡
        int balance = getBalance(node);
        
        // LL 型
        if (balance > 1 && val < node.left.val) {
            return rotateRight(node);
        }
        
        // RR 型
        if (balance < -1 && val > node.right.val) {
            return rotateLeft(node);
        }
        
        // LR 型
        if (balance > 1 && val > node.left.val) {
            node.left = rotateLeft(node.left);
            return rotateRight(node);
        }
        
        // RL 型
        if (balance < -1 && val < node.right.val) {
            node.right = rotateRight(node.right);
            return rotateLeft(node);
        }
        
        return node;
    }
}
```

---

## 5. LeetCode 例题

### 5.1 二叉树的最大深度

```java
/**
 * LeetCode 104. 二叉树的最大深度
 */
public int maxDepth(TreeNode root) {
    if (root == null) return 0;
    
    int left = maxDepth(root.left);
    int right = maxDepth(root.right);
    
    return Math.max(left, right) + 1;
}

// 时间复杂度：O(n)
// 空间复杂度：O(h)
```

### 5.2 验证二叉搜索树

```java
/**
 * LeetCode 98. 验证二叉搜索树
 */
public boolean isValidBST(TreeNode root) {
    return isValidBST(root, null, null);
}

private boolean isValidBST(TreeNode node, Integer min, Integer max) {
    if (node == null) return true;
    
    if (min != null && node.val <= min) return false;
    if (max != null && node.val >= max) return false;
    
    return isValidBST(node.left, min, node.val) &&
           isValidBST(node.right, node.val, max);
}

// 时间复杂度：O(n)
// 空间复杂度：O(h)
```

### 5.3 对称二叉树

```java
/**
 * LeetCode 101. 对称二叉树
 */
public boolean isSymmetric(TreeNode root) {
    return isMirror(root, root);
}

private boolean isMirror(TreeNode t1, TreeNode t2) {
    if (t1 == null && t2 == null) return true;
    if (t1 == null || t2 == null) return false;
    
    return (t1.val == t2.val)
        && isMirror(t1.right, t2.left)
        && isMirror(t1.left, t2.right);
}

// 时间复杂度：O(n)
// 空间复杂度：O(h)
```

### 5.4 路径总和

```java
/**
 * LeetCode 112. 路径总和
 */
public boolean hasPathSum(TreeNode root, int targetSum) {
    if (root == null) return false;
    
    if (root.left == null && root.right == null) {
        return root.val == targetSum;
    }
    
    int remainSum = targetSum - root.val;
    
    return hasPathSum(root.left, remainSum) ||
           hasPathSum(root.right, remainSum);
}

// 时间复杂度：O(n)
// 空间复杂度：O(h)
```

### 5.5 二叉树的层序遍历

```java
/**
 * LeetCode 102. 二叉树的层序遍历
 */
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    
    if (root == null) return result;
    
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    
    while (!queue.isEmpty()) {
        int levelSize = queue.size();
        List<Integer> level = new ArrayList<>();
        
        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        
        result.add(level);
    }
    
    return result;
}

// 时间复杂度：O(n)
// 空间复杂度：O(n)
```

### 5.6 二叉树的最近公共祖先

```java
/**
 * LeetCode 236. 二叉树的最近公共祖先
 */
public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) {
        return root;
    }
    
    TreeNode left = lowestCommonAncestor(root.left, p, q);
    TreeNode right = lowestCommonAncestor(root.right, p, q);
    
    if (left != null && right != null) {
        return root;  // p 和 q 在两侧
    }
    
    return left != null ? left : right;
}

// 时间复杂度：O(n)
// 空间复杂度：O(h)
```

---

## 📝 待办事项

- [ ] 理解树的定义和术语
- [ ] 掌握 4 种遍历方式
- [ ] 掌握 BST 的插入/删除/查找
- [ ] 理解 AVL 树的旋转
- [ ] 完成 LeetCode 6 道题
- [ ] 理解递归思想

---

**下一讲：[堆与优先队列](/data-structure-algorithm/advanced/heap)**

---

**推荐资源：**
- 📖 《算法 4》第 3.2-3.3 节
- 🔗 LeetCode 树专题
- 🎥 B 站：二叉树遍历详解
