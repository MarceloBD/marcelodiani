"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";
import { TreeAlgorithmDetails } from "./TreeAlgorithmDetails";
import {
  type TreeAlgorithmType,
  type TreeNode,
  INITIAL_TREE_VALUES,
} from "@/data/treeAlgorithms";
import {
  buildTree,
  insertNodeUnbalanced,
  removeNodeUnbalanced,
  findAndFixDeepestImbalance,
  getBalanceFactorMap,
  searchPath,
  getDeleteSteps,
  countNodes,
  inorderTraversal,
  preorderTraversal,
  postorderTraversal,
  levelOrderTraversal,
  calculateNodePositions,
  getTreeHeight,
} from "@/lib/treeOperations";

const SVG_WIDTH = 700;
const NODE_RADIUS = 16;
const ANIMATION_DELAY_MS = 400;
const MAX_NODES = 31;
const VALUE_MIN = 1;
const VALUE_MAX = 99;

const TRAVERSAL_RUNNERS = {
  inorder: inorderTraversal,
  preorder: preorderTraversal,
  postorder: postorderTraversal,
  levelOrder: levelOrderTraversal,
} as const;

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function formatBalanceFactor(value: number): string {
  if (value > 0) return `+${value}`;
  return `${value}`;
}

function getBalanceFactorColor(value: number): string {
  const absolute = Math.abs(value);
  if (absolute >= 2) return "#ef4444"; // red — unbalanced
  if (absolute === 1) return "#f59e0b"; // amber — acceptable
  return "rgba(148, 163, 184, 0.4)"; // dim — perfectly balanced
}

export function TreeVisualizer() {
  const translations = useTranslations("treeVisualizer");
  const [tree, setTree] = useState(() => buildTree(INITIAL_TREE_VALUES));
  const [inputValue, setInputValue] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<TreeAlgorithmType>("inorder");
  const [animatedValues, setAnimatedValues] = useState<number[]>([]);
  const [successorValues, setSuccessorValues] = useState<number[]>([]);
  const [rebalancingPivot, setRebalancingPivot] = useState<number | null>(null);
  const [rebalancingNewRoot, setRebalancingNewRoot] = useState<number | null>(null);
  const [showBalanceFactors, setShowBalanceFactors] = useState(false);
  const [searchFound, setSearchFound] = useState<boolean | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const cancelReference = useRef(false);

  const treeHeight = useMemo(() => getTreeHeight(tree), [tree]);
  const svgHeight = Math.max(180, 35 + treeHeight * 65 + 40);
  const positionedNodes = useMemo(
    () => calculateNodePositions(tree, SVG_WIDTH),
    [tree],
  );
  const balanceFactors = useMemo(
    () => (showBalanceFactors ? getBalanceFactorMap(tree) : new Map<number, number>()),
    [showBalanceFactors, tree],
  );

  const clearAnimation = useCallback(() => {
    setAnimatedValues([]);
    setSuccessorValues([]);
    setRebalancingPivot(null);
    setRebalancingNewRoot(null);
    setShowBalanceFactors(false);
    setSearchFound(null);
    setMessage(null);
  }, []);

  const showTemporaryMessage = useCallback((text: string, durationMs = 3500) => {
    setMessage(text);
    setTimeout(() => setMessage(null), durationMs);
  }, []);

  const parseInput = useCallback((): number | null => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < VALUE_MIN || parsed > VALUE_MAX) {
      showTemporaryMessage(translations("messageEnterNumber", { min: VALUE_MIN, max: VALUE_MAX }));
      return null;
    }
    return parsed;
  }, [inputValue, showTemporaryMessage, translations]);

  // Shared helper: animate a list of values one by one
  const animateSteps = useCallback(
    async (
      values: number[],
      setter: React.Dispatch<React.SetStateAction<number[]>>,
    ): Promise<boolean> => {
      for (const value of values) {
        if (cancelReference.current) return false;
        setter((previous) => [...previous, value]);
        await sleep(ANIMATION_DELAY_MS);
      }
      return true;
    },
    [],
  );

  // Shared helper: animate step-by-step AVL rebalancing with balance factors shown
  const animateRebalancing = useCallback(
    async (startingTree: TreeNode): Promise<TreeNode> => {
      let currentTree = startingTree;

      // Show balance factors on all nodes
      setShowBalanceFactors(true);
      await sleep(600);

      while (!cancelReference.current) {
        const step = findAndFixDeepestImbalance(currentTree);
        if (!step) break;

        const direction = step.balanceFactor > 0 ? "left-heavy" : "right-heavy";

        // Step 1: Highlight the unbalanced node — explain WHY
        setRebalancingPivot(step.pivotValue);
        setMessage(
          translations("messageNodeUnbalanced", {
            value: step.pivotValue,
            direction,
            balance: formatBalanceFactor(step.balanceFactor),
          }),
        );
        await sleep(1200);

        if (cancelReference.current) break;

        // Step 2: Also highlight the new root — explain WHAT will happen
        setRebalancingNewRoot(step.newRootValue);
        setMessage(step.description);
        await sleep(1200);

        if (cancelReference.current) break;

        // Step 3: Apply the rotation — tree visually rearranges
        currentTree = step.tree;
        setTree(currentTree);
        setRebalancingPivot(null);
        setRebalancingNewRoot(null);
        await sleep(600);
      }

      setShowBalanceFactors(false);
      setMessage(null);
      return currentTree;
    },
    [],
  );

  // --- Animated Insert ---
  const handleInsert = useCallback(async () => {
    const value = parseInput();
    if (value === null || isAnimating) return;

    if (tree) {
      const { found } = searchPath(tree, value);
      if (found) {
        showTemporaryMessage(translations("messageAlreadyExists", { value }));
        return;
      }
    }

    if (countNodes(tree) >= MAX_NODES) {
      showTemporaryMessage(translations("messageTreeFull", { max: MAX_NODES }));
      return;
    }

    setIsAnimating(true);
    clearAnimation();
    cancelReference.current = false;

    // Phase 1: Animate traversal path to insertion point
    if (tree) {
      const { path } = searchPath(tree, value);
      const completed = await animateSteps(path, setAnimatedValues);
      if (!completed) {
        setIsAnimating(false);
        return;
      }
      await sleep(250);
    }

    // Phase 2: Apply unbalanced insert
    const unbalancedTree = insertNodeUnbalanced(tree, value);
    setTree(unbalancedTree);
    setAnimatedValues([]);
    setSuccessorValues([]);
    await sleep(500);

    if (cancelReference.current) {
      setIsAnimating(false);
      return;
    }

    // Phase 3: Step-by-step AVL rebalancing with balance factors
    await animateRebalancing(unbalancedTree);

    setInputValue("");
    setIsAnimating(false);
  }, [parseInput, isAnimating, tree, clearAnimation, showTemporaryMessage, animateSteps, animateRebalancing]);

  // --- Animated Delete ---
  const performAnimatedDelete = useCallback(
    async (value: number) => {
      if (!tree || isAnimating) return;

      setIsAnimating(true);
      clearAnimation();
      cancelReference.current = false;

      // Phase 1: Animate search path to the target node
      const { searchPath: deletePath, successorPath: succPath } =
        getDeleteSteps(tree, value);

      const foundTarget = await animateSteps(deletePath, setAnimatedValues);
      if (!foundTarget) {
        setIsAnimating(false);
        return;
      }

      if (succPath.length > 0) {
        await sleep(200);
        const foundSuccessor = await animateSteps(succPath, setSuccessorValues);
        if (!foundSuccessor) {
          setIsAnimating(false);
          return;
        }
      }

      await sleep(300);

      // Phase 2: Apply unbalanced remove
      const unbalancedTree = removeNodeUnbalanced(tree, value);
      setTree(unbalancedTree);
      setAnimatedValues([]);
      setSuccessorValues([]);
      await sleep(500);

      if (cancelReference.current) {
        setIsAnimating(false);
        return;
      }

      // Phase 3: Step-by-step AVL rebalancing with balance factors
      if (unbalancedTree) {
        await animateRebalancing(unbalancedTree);
      }

      setIsAnimating(false);
    },
    [tree, isAnimating, clearAnimation, animateSteps, animateRebalancing],
  );

  const handleRemoveByInput = useCallback(async () => {
    const value = parseInput();
    if (value === null || isAnimating) return;

    if (tree) {
      const { found } = searchPath(tree, value);
      if (!found) {
        showTemporaryMessage(translations("messageNotFound", { value }));
        return;
      }
    }

    await performAnimatedDelete(value);
    setInputValue("");
  }, [parseInput, isAnimating, tree, showTemporaryMessage, performAnimatedDelete]);

  const handleRemoveByClick = useCallback(
    async (value: number) => {
      await performAnimatedDelete(value);
    },
    [performAnimatedDelete],
  );

  // --- Run Traversal / Search ---
  const handleRun = useCallback(async () => {
    if (isAnimating || !tree) return;

    cancelReference.current = false;
    setIsAnimating(true);
    clearAnimation();

    let valuesToAnimate: number[] = [];
    let isSearch = false;
    let wasFound = false;

    if (selectedAlgorithm === "search") {
      isSearch = true;
      const value = parseInput();
      if (value === null) {
        setIsAnimating(false);
        return;
      }
      const result = searchPath(tree, value);
      valuesToAnimate = result.path;
      wasFound = result.found;
    } else {
      const traversalRunner = TRAVERSAL_RUNNERS[selectedAlgorithm];
      valuesToAnimate = traversalRunner(tree);
    }

    const completed = await animateSteps(valuesToAnimate, setAnimatedValues);

    if (completed && isSearch) {
      setSearchFound(wasFound);
      if (!wasFound) {
        showTemporaryMessage(translations("messageValueNotFound"));
      }
    }

    setIsAnimating(false);
  }, [
    isAnimating,
    tree,
    selectedAlgorithm,
    parseInput,
    clearAnimation,
    showTemporaryMessage,
    animateSteps,
  ]);

  const handleReset = useCallback(() => {
    cancelReference.current = true;
    setIsAnimating(false);
    setTree(buildTree(INITIAL_TREE_VALUES));
    setInputValue("");
    clearAnimation();
  }, [clearAnimation]);

  const getNodeColor = useCallback(
    (value: number): string => {
      // Rebalancing: unbalanced pivot (red)
      if (value === rebalancingPivot) return "#ef4444";

      // Rebalancing: new root after rotation (teal)
      if (value === rebalancingNewRoot) return "#06b6d4";

      // Successor path: purple
      if (successorValues.includes(value)) return "#a855f7";

      // Not in animated values: default blue
      if (!animatedValues.includes(value)) return "#3b82f6";

      // For search: last node is green (found) or red (not found)
      if (
        selectedAlgorithm === "search" &&
        searchFound !== null &&
        value === animatedValues[animatedValues.length - 1]
      ) {
        return searchFound ? "#22c55e" : "#ef4444";
      }

      return "#f59e0b"; // amber for visited
    },
    [animatedValues, successorValues, rebalancingPivot, rebalancingNewRoot, selectedAlgorithm, searchFound],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") handleInsert();
    },
    [handleInsert],
  );

  return (
    <ScrollReveal className="mt-8">
      <div className="glass-card rounded-xl p-6 border border-card-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground/80">
              {translations("title")}
            </span>
            <span className="text-[9px] text-muted/70 font-mono">
              {translations("techStack")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedAlgorithm}
              onChange={(event) =>
                setSelectedAlgorithm(
                  event.target.value as TreeAlgorithmType,
                )
              }
              disabled={isAnimating}
              aria-label={translations("ariaSelectAlgorithm")}
              className="text-[10px] bg-card-border/50 border border-card-border rounded px-2 py-1 text-foreground/80 outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="inorder">{translations("algorithmInorder")}</option>
              <option value="preorder">{translations("algorithmPreorder")}</option>
              <option value="postorder">{translations("algorithmPostorder")}</option>
              <option value="levelOrder">{translations("algorithmLevelOrder")}</option>
              <option value="search">{translations("algorithmBSTSearch")}</option>
            </select>

            <button
              onClick={handleRun}
              disabled={isAnimating || !tree}
              className="text-[10px] px-3 py-1 rounded bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isAnimating ? translations("buttonRunning") : translations("buttonRun")}
            </button>

            <button
              onClick={handleReset}
              className="text-[10px] px-3 py-1 rounded border border-card-border text-muted hover:text-foreground hover:border-accent/40 transition-colors cursor-pointer"
            >
              {translations("buttonReset")}
            </button>
          </div>
        </div>

        {/* Input controls */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <input
            type="number"
            min={VALUE_MIN}
            max={VALUE_MAX}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={translations("placeholderValue")}
            disabled={isAnimating}
            aria-label={translations("ariaNodeValue")}
            className="w-16 text-[10px] bg-card-border/50 border border-card-border rounded px-2 py-1 text-foreground/80 outline-none placeholder:text-muted/50 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={handleInsert}
            disabled={isAnimating}
            className="text-[9px] px-2 py-0.5 rounded border border-card-border text-muted hover:text-foreground hover:border-accent/30 transition-colors cursor-pointer disabled:opacity-50"
          >
            {translations("buttonInsert")}
          </button>
          <button
            onClick={handleRemoveByInput}
            disabled={isAnimating}
            className="text-[9px] px-2 py-0.5 rounded border border-card-border text-muted hover:text-foreground hover:border-accent/30 transition-colors cursor-pointer disabled:opacity-50"
          >
            {translations("buttonRemove")}
          </button>
          <span className="text-[8px] text-muted/60 ml-1 hidden sm:inline">
            {translations("messageClickToRemove")}
          </span>
          {message && (
            <span className="text-[8px] text-accent/80 ml-auto font-medium">
              {message}
            </span>
          )}
        </div>

        {/* SVG Canvas */}
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
          className="w-full rounded-lg bg-card-border/10 border border-card-border/30 select-none"
          style={{ aspectRatio: `${SVG_WIDTH} / ${svgHeight}` }}
          role="img"
          aria-label={translations("ariaAVLTree", { count: positionedNodes.length })}
        >
          {tree === null && (
            <text
              x={SVG_WIDTH / 2}
              y={svgHeight / 2}
              textAnchor="middle"
              fill="rgba(148, 163, 184, 0.5)"
              fontSize={12}
            >
              {translations("messageInsertToStart")}
            </text>
          )}

          {/* Edges */}
          {positionedNodes.map((node) => {
            if (node.parentX === null || node.parentY === null) return null;
            return (
              <line
                key={`edge-${node.value}`}
                x1={node.parentX}
                y1={node.parentY}
                x2={node.x}
                y2={node.y}
                stroke="rgba(148, 163, 184, 0.3)"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* Nodes + Balance Factor labels */}
          {positionedNodes.map((node) => {
            const color = getNodeColor(node.value);
            const balanceFactor = balanceFactors.get(node.value);

            return (
              <g
                key={`node-${node.value}`}
                className="cursor-pointer"
                onClick={() => handleRemoveByClick(node.value)}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={color}
                  fillOpacity={0.15}
                  stroke={color}
                  strokeWidth={2}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={color}
                  fontSize={11}
                  fontWeight={600}
                  fontFamily="monospace"
                  className="pointer-events-none"
                >
                  {node.value}
                </text>

                {/* Balance factor label (shown during rebalancing phase) */}
                {showBalanceFactors && balanceFactor !== undefined && (
                  <text
                    x={node.x}
                    y={node.y + NODE_RADIUS + 12}
                    textAnchor="middle"
                    fill={getBalanceFactorColor(balanceFactor)}
                    fontSize={9}
                    fontWeight={600}
                    fontFamily="monospace"
                    className="pointer-events-none"
                  >
                    {formatBalanceFactor(balanceFactor)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {[
            { color: "#3b82f6", label: translations("legendDefault") },
            { color: "#f59e0b", label: translations("legendTraversing") },
            { color: "#a855f7", label: translations("legendSuccessor") },
            { color: "#ef4444", label: translations("legendUnbalanced") },
            { color: "#06b6d4", label: translations("legendNewRoot") },
            { color: "#22c55e", label: translations("legendFound") },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[9px] text-muted">{label}</span>
            </div>
          ))}
        </div>

        {/* Algorithm Details */}
        <TreeAlgorithmDetails selectedAlgorithm={selectedAlgorithm} />
      </div>
    </ScrollReveal>
  );
}
