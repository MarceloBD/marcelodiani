import type { TreeNode, PositionedTreeNode } from "@/data/treeAlgorithms";

const LEVEL_HEIGHT = 65;
const PADDING_TOP = 35;

// --- AVL Helpers ---

function getNodeHeight(node: TreeNode | null): number {
  return node ? node.height : 0;
}

function getBalanceFactor(node: TreeNode | null): number {
  return node ? getNodeHeight(node.left) - getNodeHeight(node.right) : 0;
}

function withUpdatedHeight(node: TreeNode): TreeNode {
  return {
    ...node,
    height: 1 + Math.max(getNodeHeight(node.left), getNodeHeight(node.right)),
  };
}

function rotateRight(node: TreeNode): TreeNode {
  const newRoot = node.left!;
  const movingSubtree = newRoot.right;
  return withUpdatedHeight({
    ...newRoot,
    right: withUpdatedHeight({ ...node, left: movingSubtree }),
  });
}

function rotateLeft(node: TreeNode): TreeNode {
  const newRoot = node.right!;
  const movingSubtree = newRoot.left;
  return withUpdatedHeight({
    ...newRoot,
    left: withUpdatedHeight({ ...node, right: movingSubtree }),
  });
}

function balanceNode(node: TreeNode, rotationLog: string[]): TreeNode {
  const updatedNode = withUpdatedHeight(node);
  const balance = getBalanceFactor(updatedNode);

  // Left heavy
  if (balance > 1) {
    if (getBalanceFactor(updatedNode.left) < 0) {
      rotationLog.push(`Left-Right rotation at ${updatedNode.value}`);
      return rotateRight({
        ...updatedNode,
        left: rotateLeft(updatedNode.left!),
      });
    }
    rotationLog.push(`Right rotation at ${updatedNode.value}`);
    return rotateRight(updatedNode);
  }

  // Right heavy
  if (balance < -1) {
    if (getBalanceFactor(updatedNode.right) > 0) {
      rotationLog.push(`Right-Left rotation at ${updatedNode.value}`);
      return rotateLeft({
        ...updatedNode,
        right: rotateRight(updatedNode.right!),
      });
    }
    rotationLog.push(`Left rotation at ${updatedNode.value}`);
    return rotateLeft(updatedNode);
  }

  return updatedNode;
}

// --- AVL Insert / Remove (fully balanced, used for buildTree) ---

function insertNodeBalanced(root: TreeNode | null, value: number): TreeNode {
  if (!root) return { value, left: null, right: null, height: 1 };

  if (value < root.value) {
    return balanceNode(
      { ...root, left: insertNodeBalanced(root.left, value) },
      [],
    );
  }
  if (value > root.value) {
    return balanceNode(
      { ...root, right: insertNodeBalanced(root.right, value) },
      [],
    );
  }

  return root;
}

// --- Unbalanced Insert / Remove (for animated step-by-step visualization) ---

export function insertNodeUnbalanced(
  root: TreeNode | null,
  value: number,
): TreeNode {
  if (!root) return { value, left: null, right: null, height: 1 };

  if (value < root.value) {
    return withUpdatedHeight({
      ...root,
      left: insertNodeUnbalanced(root.left, value),
    });
  }
  if (value > root.value) {
    return withUpdatedHeight({
      ...root,
      right: insertNodeUnbalanced(root.right, value),
    });
  }

  return root; // duplicate ignored
}

export function removeNodeUnbalanced(
  root: TreeNode | null,
  value: number,
): TreeNode | null {
  if (!root) return null;

  if (value < root.value) {
    return withUpdatedHeight({
      ...root,
      left: removeNodeUnbalanced(root.left, value),
    });
  }
  if (value > root.value) {
    return withUpdatedHeight({
      ...root,
      right: removeNodeUnbalanced(root.right, value),
    });
  }

  // Found the node to remove
  if (!root.left) return root.right;
  if (!root.right) return root.left;

  // Two children: replace with inorder successor
  let successor = root.right;
  while (successor.left) {
    successor = successor.left;
  }

  return withUpdatedHeight({
    value: successor.value,
    left: root.left,
    right: removeNodeUnbalanced(root.right, successor.value),
    height: root.height,
  });
}

// --- Step-by-step Rebalancing ---

export interface RotationStep {
  tree: TreeNode;
  description: string;
  pivotValue: number;
  newRootValue: number;
  balanceFactor: number;
}

export function findAndFixDeepestImbalance(
  root: TreeNode,
): RotationStep | null {
  // Try children first (deeper imbalances have priority — bottom-up)
  if (root.left) {
    const leftResult = findAndFixDeepestImbalance(root.left);
    if (leftResult) {
      return {
        ...leftResult,
        tree: withUpdatedHeight({ ...root, left: leftResult.tree }),
      };
    }
  }

  if (root.right) {
    const rightResult = findAndFixDeepestImbalance(root.right);
    if (rightResult) {
      return {
        ...rightResult,
        tree: withUpdatedHeight({ ...root, right: rightResult.tree }),
      };
    }
  }

  // Check this node
  const balance = getBalanceFactor(root);

  if (balance > 1) {
    if (getBalanceFactor(root.left) < 0) {
      const newRootValue = root.left!.right!.value;
      return {
        tree: rotateRight({ ...root, left: rotateLeft(root.left!) }),
        description: `Left-Right rotation \u2192 ${newRootValue} becomes subtree root`,
        pivotValue: root.value,
        newRootValue,
        balanceFactor: balance,
      };
    }
    const newRootValue = root.left!.value;
    return {
      tree: rotateRight(root),
      description: `Rotating right \u2192 ${newRootValue} becomes subtree root`,
      pivotValue: root.value,
      newRootValue,
      balanceFactor: balance,
    };
  }

  if (balance < -1) {
    if (getBalanceFactor(root.right) > 0) {
      const newRootValue = root.right!.left!.value;
      return {
        tree: rotateLeft({ ...root, right: rotateRight(root.right!) }),
        description: `Right-Left rotation \u2192 ${newRootValue} becomes subtree root`,
        pivotValue: root.value,
        newRootValue,
        balanceFactor: balance,
      };
    }
    const newRootValue = root.right!.value;
    return {
      tree: rotateLeft(root),
      description: `Rotating left \u2192 ${newRootValue} becomes subtree root`,
      pivotValue: root.value,
      newRootValue,
      balanceFactor: balance,
    };
  }

  return null; // this node is balanced
}

// --- Balance Factor Map (for visualization) ---

export function getBalanceFactorMap(
  root: TreeNode | null,
): Map<number, number> {
  const factorMap = new Map<number, number>();

  function traverse(node: TreeNode | null): void {
    if (!node) return;
    factorMap.set(node.value, getBalanceFactor(node));
    traverse(node.left);
    traverse(node.right);
  }

  traverse(root);
  return factorMap;
}

// --- Search & Animation Paths ---

export function searchPath(
  root: TreeNode | null,
  target: number,
): { path: number[]; found: boolean } {
  const path: number[] = [];
  let current = root;

  while (current) {
    path.push(current.value);
    if (target === current.value) return { path, found: true };
    current = target < current.value ? current.left : current.right;
  }

  return { path, found: false };
}

export function getDeleteSteps(
  root: TreeNode | null,
  value: number,
): { searchPath: number[]; successorPath: number[] } {
  // Build the search path from root to target
  const deletePath: number[] = [];
  let current = root;
  let targetNode: TreeNode | null = null;

  while (current) {
    deletePath.push(current.value);
    if (value === current.value) {
      targetNode = current;
      break;
    }
    current = value < current.value ? current.left : current.right;
  }

  // If node has two children, trace the inorder successor path
  const successorPath: number[] = [];
  if (targetNode?.left && targetNode?.right) {
    let successor = targetNode.right;
    while (successor) {
      successorPath.push(successor.value);
      if (!successor.left) break;
      successor = successor.left;
    }
  }

  return { searchPath: deletePath, successorPath };
}

// --- Build Tree ---

export function buildTree(values: number[]): TreeNode | null {
  let root: TreeNode | null = null;
  for (const value of values) {
    root = insertNodeBalanced(root, value);
  }
  return root;
}

// --- Traversals ---

export function inorderTraversal(root: TreeNode | null): number[] {
  if (!root) return [];
  return [
    ...inorderTraversal(root.left),
    root.value,
    ...inorderTraversal(root.right),
  ];
}

export function preorderTraversal(root: TreeNode | null): number[] {
  if (!root) return [];
  return [
    root.value,
    ...preorderTraversal(root.left),
    ...preorderTraversal(root.right),
  ];
}

export function postorderTraversal(root: TreeNode | null): number[] {
  if (!root) return [];
  return [
    ...postorderTraversal(root.left),
    ...postorderTraversal(root.right),
    root.value,
  ];
}

export function levelOrderTraversal(root: TreeNode | null): number[] {
  if (!root) return [];
  const result: number[] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current.value);
    if (current.left) queue.push(current.left);
    if (current.right) queue.push(current.right);
  }

  return result;
}

// --- Layout ---

interface NodeMetadata {
  value: number;
  depth: number;
  inorderIndex: number;
  parentValue: number | null;
}

export function calculateNodePositions(
  root: TreeNode | null,
  svgWidth: number,
): PositionedTreeNode[] {
  if (!root) return [];

  // Pass 1: Collect metadata with inorder indices
  const metadata: NodeMetadata[] = [];
  let currentIndex = 0;

  function assignIndices(
    node: TreeNode | null,
    depth: number,
    parentValue: number | null,
  ): void {
    if (!node) return;
    assignIndices(node.left, depth + 1, node.value);
    metadata.push({
      value: node.value,
      depth,
      inorderIndex: currentIndex++,
      parentValue,
    });
    assignIndices(node.right, depth + 1, node.value);
  }

  assignIndices(root, 0, null);

  // Pass 2: Convert indices to SVG coordinates
  const totalNodes = metadata.length;
  const spacing = svgWidth / (totalNodes + 1);

  const positionMap = new Map<number, { x: number; y: number }>();
  for (const node of metadata) {
    positionMap.set(node.value, {
      x: (node.inorderIndex + 1) * spacing,
      y: PADDING_TOP + node.depth * LEVEL_HEIGHT,
    });
  }

  return metadata.map((node) => {
    const { x, y } = positionMap.get(node.value)!;
    const parent =
      node.parentValue !== null ? positionMap.get(node.parentValue) : null;
    return {
      value: node.value,
      x,
      y,
      parentX: parent?.x ?? null,
      parentY: parent?.y ?? null,
    };
  });
}

export function getTreeHeight(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + Math.max(getTreeHeight(root.left), getTreeHeight(root.right));
}

export function countNodes(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + countNodes(root.left) + countNodes(root.right);
}
