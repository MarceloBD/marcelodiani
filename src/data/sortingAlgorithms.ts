export interface AlgorithmInfo {
  name: string;
  description: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  stable: boolean;
  goodFor: string[];
  badFor: string[];
}

export type AlgorithmType = "bubble" | "quick" | "merge";

export const SORTING_ALGORITHMS: Record<AlgorithmType, AlgorithmInfo> = {
  bubble: {
    name: "Bubble Sort",
    description:
      "Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted. Named because smaller elements 'bubble' to the top of the list.",
    timeComplexity: {
      best: "O(n)",
      average: "O(n²)",
      worst: "O(n²)",
    },
    spaceComplexity: "O(1)",
    stable: true,
    goodFor: [
      "Small datasets or nearly sorted data",
      "Educational purposes to understand sorting concepts",
      "When memory is extremely limited (in-place sorting)",
    ],
    badFor: [
      "Large datasets — quadratic time makes it very slow",
      "Performance-critical applications",
      "Datasets with many elements out of order",
    ],
  },
  quick: {
    name: "Quick Sort",
    description:
      "A divide-and-conquer algorithm that selects a 'pivot' element and partitions the array into two sub-arrays: elements less than the pivot and elements greater than the pivot. It then recursively sorts the sub-arrays. One of the most widely used sorting algorithms in practice.",
    timeComplexity: {
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n²)",
    },
    spaceComplexity: "O(log n)",
    stable: false,
    goodFor: [
      "General-purpose sorting — fast average case",
      "Large datasets where average performance matters",
      "When in-place sorting is preferred over extra memory",
    ],
    badFor: [
      "Already sorted or nearly sorted data (worst case without randomization)",
      "When stability is required (does not preserve equal element order)",
      "Datasets where worst-case guarantees are critical",
    ],
  },
  merge: {
    name: "Merge Sort",
    description:
      "A divide-and-conquer algorithm that splits the array in half, recursively sorts each half, and then merges the two sorted halves back together. It guarantees O(n log n) time in all cases, making it predictable and reliable.",
    timeComplexity: {
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n log n)",
    },
    spaceComplexity: "O(n)",
    stable: true,
    goodFor: [
      "When guaranteed O(n log n) performance is needed",
      "Sorting linked lists (no random access needed)",
      "When stability is required (preserves equal element order)",
    ],
    badFor: [
      "Memory-constrained environments — requires O(n) extra space",
      "Small datasets where simpler algorithms are faster due to overhead",
      "When in-place sorting is strictly required",
    ],
  },
};
