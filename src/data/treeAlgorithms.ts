export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  height: number;
}

export interface PositionedTreeNode {
  value: number;
  x: number;
  y: number;
  parentX: number | null;
  parentY: number | null;
}

export type TreeAlgorithmType = "inorder" | "preorder" | "postorder" | "levelOrder" | "search";

export interface TreeAlgorithmInfo {
  name: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  goodFor: string[];
  badFor: string[];
}

export const TREE_ALGORITHMS: Record<TreeAlgorithmType, TreeAlgorithmInfo> = {
  inorder: {
    name: "Inorder Traversal (LNR)",
    description:
      "Visits the left subtree first, then the current node, then the right subtree. In a Binary Search Tree, this traversal visits all nodes in ascending sorted order, which is one of the key properties of BSTs.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    goodFor: [
      "Getting elements in sorted order from a BST",
      "Validating whether a tree is a valid BST",
      "Flattening a BST into a sorted array",
    ],
    badFor: [
      "Finding a specific element — BST search is faster at O(log n)",
      "Very deep or skewed trees where stack depth becomes an issue",
      "When you need to process the root before its children",
    ],
  },
  preorder: {
    name: "Preorder Traversal (NLR)",
    description:
      "Visits the current node first, then the left subtree, then the right subtree. This order preserves the tree structure, making it ideal for serializing or copying a tree — if you insert values in preorder sequence, you reconstruct the same BST.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    goodFor: [
      "Serializing a tree to recreate the exact same structure",
      "Creating a copy of the tree (clone)",
      "Evaluating prefix expressions in expression trees",
    ],
    badFor: [
      "Getting sorted output — inorder is better for that",
      "Bottom-up computations (e.g., calculating subtree sizes)",
      "Very deep trees due to recursion stack depth",
    ],
  },
  postorder: {
    name: "Postorder Traversal (LRN)",
    description:
      "Visits the left subtree first, then the right subtree, then the current node last. Since children are processed before their parent, this is the safe order for deleting a tree and for computing values that depend on subtree results.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    goodFor: [
      "Safely deleting or freeing a tree (children before parent)",
      "Evaluating postfix expressions in expression trees",
      "Computing subtree-dependent values (e.g., height, size)",
    ],
    badFor: [
      "Getting sorted output — inorder is the right choice",
      "When you need to process the root before exploring children",
      "Very deep trees due to recursion stack depth",
    ],
  },
  levelOrder: {
    name: "Level-Order Traversal (BFS)",
    description:
      "Visits all nodes at depth 0 first, then depth 1, then depth 2, and so on. Uses a queue (FIFO) instead of recursion. This is a Breadth-First Search applied to a tree, ensuring nodes closest to the root are visited first.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(w)",
    goodFor: [
      "Finding the shortest path from the root to any node",
      "Printing or processing the tree level by level",
      "Finding the minimum depth of the tree",
    ],
    badFor: [
      "Memory usage on very wide trees — the queue can hold up to n/2 nodes",
      "Problems that require full subtree processing before moving on",
      "Deep, narrow trees where DFS traversals are more memory-efficient",
    ],
  },
  search: {
    name: "BST Search",
    description:
      "Searches for a target value by comparing it with the current node: if smaller, go left; if larger, go right. This halves the search space at each step in a balanced tree, making it very efficient. The animation highlights each node visited along the search path.",
    timeComplexity: "O(h) — O(log n) balanced, O(n) skewed",
    spaceComplexity: "O(1) iterative",
    goodFor: [
      "Fast lookups in balanced BSTs — logarithmic time",
      "Range queries and ordered data retrieval",
      "Dynamic datasets with frequent insertions and searches",
    ],
    badFor: [
      "Skewed trees degrade to O(n) — self-balancing trees (AVL, Red-Black) solve this",
      "Datasets that are mostly static — hash tables offer O(1) average lookup",
      "When the data does not have a natural ordering",
    ],
  },
};

// Inserted in this order to build a balanced BST
export const INITIAL_TREE_VALUES = [50, 25, 75, 12, 37, 62, 87];
