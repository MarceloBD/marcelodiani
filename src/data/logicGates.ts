import type { SimulatorDetailsData } from "@/components/interactiveLab/SimulatorDetails";

export type GateType = "and" | "or" | "not" | "nand" | "nor" | "xor" | "xnor";

export interface GateInfo {
  name: string;
  symbol: string; // Text representation
  expression: string; // Boolean algebra expression
  truthTable: boolean[][]; // [inputs..., output]
  inputCount: 1 | 2;
}

export const LOGIC_GATES: Record<GateType, GateInfo> = {
  and: {
    name: "AND Gate",
    symbol: "&",
    expression: "A · B",
    truthTable: [
      [false, false, false],
      [false, true, false],
      [true, false, false],
      [true, true, true],
    ],
    inputCount: 2,
  },
  or: {
    name: "OR Gate",
    symbol: "+",
    expression: "A + B",
    truthTable: [
      [false, false, false],
      [false, true, true],
      [true, false, true],
      [true, true, true],
    ],
    inputCount: 2,
  },
  not: {
    name: "NOT Gate (Inverter)",
    symbol: "¬",
    expression: "Ā",
    truthTable: [
      [false, true],
      [true, false],
    ],
    inputCount: 1,
  },
  nand: {
    name: "NAND Gate",
    symbol: "⊼",
    expression: "A · B",
    truthTable: [
      [false, false, true],
      [false, true, true],
      [true, false, true],
      [true, true, false],
    ],
    inputCount: 2,
  },
  nor: {
    name: "NOR Gate",
    symbol: "⊽",
    expression: "A + B",
    truthTable: [
      [false, false, true],
      [false, true, false],
      [true, false, false],
      [true, true, false],
    ],
    inputCount: 2,
  },
  xor: {
    name: "XOR Gate (Exclusive OR)",
    symbol: "⊕",
    expression: "A ⊕ B",
    truthTable: [
      [false, false, false],
      [false, true, true],
      [true, false, true],
      [true, true, false],
    ],
    inputCount: 2,
  },
  xnor: {
    name: "XNOR Gate (Equivalence)",
    symbol: "⊙",
    expression: "A ⊙ B",
    truthTable: [
      [false, false, true],
      [false, true, false],
      [true, false, false],
      [true, true, true],
    ],
    inputCount: 2,
  },
};

export const GATE_DETAILS: Record<GateType, SimulatorDetailsData> = {
  and: {
    name: "AND Gate",
    description:
      "The AND gate outputs HIGH (1) only when all inputs are HIGH. It implements logical conjunction: the output is true if and only if both inputs are true. In Boolean algebra, AND is represented as A · B or AB. AND gates are fundamental building blocks in digital circuits, used for masking, enabling, and implementing complex logic functions.",
    badges: [
      { label: "Expression", value: "A · B" },
      { label: "Output", value: "1 if A=1 AND B=1" },
      { label: "Symbol", value: "&" },
    ],
    lists: [
      {
        title: "Applications",
        items: [
          "Data masking and bit selection",
          "Enable/disable control signals",
          "Building complex combinational logic",
          "Address decoding in memory systems",
          "Implementing product terms in Boolean functions",
        ],
        variant: "good",
      },
      {
        title: "Key Properties",
        items: [
          "Output is 1 only when all inputs are 1",
          "Commutative: A · B = B · A",
          "Associative: (A · B) · C = A · (B · C)",
          "Identity element: A · 1 = A",
          "Annihilator: A · 0 = 0",
        ],
        variant: "info",
      },
    ],
  },
  or: {
    name: "OR Gate",
    description:
      "The OR gate outputs HIGH (1) when at least one input is HIGH. It implements logical disjunction: the output is true if any input is true. In Boolean algebra, OR is represented as A + B. OR gates are essential for combining conditions, implementing sum terms, and creating parallel signal paths in digital systems.",
    badges: [
      { label: "Expression", value: "A + B" },
      { label: "Output", value: "1 if A=1 OR B=1" },
      { label: "Symbol", value: "+" },
    ],
    lists: [
      {
        title: "Applications",
        items: [
          "Combining multiple enable signals",
          "Implementing sum-of-products (SOP) logic",
          "Priority encoders and multiplexers",
          "Error detection and fault tolerance",
          "Parallel signal combination",
        ],
        variant: "good",
      },
      {
        title: "Key Properties",
        items: [
          "Output is 1 when any input is 1",
          "Commutative: A + B = B + A",
          "Associative: (A + B) + C = A + (B + C)",
          "Identity element: A + 0 = A",
          "Dominance: A + 1 = 1",
        ],
        variant: "info",
      },
    ],
  },
  not: {
    name: "NOT Gate (Inverter)",
    description:
      "The NOT gate is a unary operator that outputs the logical complement of its input. It inverts the signal: HIGH becomes LOW and LOW becomes HIGH. In Boolean algebra, NOT is represented as Ā or ¬A. Inverters are fundamental in digital circuits, used for signal inversion, complement generation, and implementing De Morgan's laws.",
    badges: [
      { label: "Expression", value: "Ā" },
      { label: "Output", value: "Inverse of input" },
      { label: "Symbol", value: "¬" },
    ],
    lists: [
      {
        title: "Applications",
        items: [
          "Signal inversion and complementation",
          "Active-low enable signals",
          "Implementing De Morgan's laws",
          "Building NAND and NOR gates",
          "Clock signal generation and buffering",
        ],
        variant: "good",
      },
      {
        title: "Key Properties",
        items: [
          "Unary operator: operates on single input",
          "Double negation: Ā̄ = A",
          "Complement: A + Ā = 1 and A · Ā = 0",
          "De Morgan's: A + B = Ā · B̄",
          "Essential for universal gate sets",
        ],
        variant: "info",
      },
    ],
  },
  nand: {
    name: "NAND Gate",
    description:
      "The NAND gate (NOT-AND) outputs LOW (0) only when all inputs are HIGH. It's the complement of the AND gate: NAND = NOT(AND). NAND is a universal gate, meaning any Boolean function can be implemented using only NAND gates. This property makes NAND gates extremely important in digital design, especially in CMOS technology where NAND gates are naturally efficient.",
    badges: [
      { label: "Expression", value: "A · B" },
      { label: "Output", value: "0 if A=1 AND B=1" },
      { label: "Symbol", value: "⊼" },
    ],
    lists: [
      {
        title: "Applications",
        items: [
          "Universal gate: can implement any logic function",
          "CMOS technology: naturally efficient implementation",
          "Memory circuits (SRAM cells)",
          "Building other gates (AND, OR, NOT from NAND)",
          "Error detection and parity checking",
        ],
        variant: "good",
      },
      {
        title: "Key Properties",
        items: [
          "Universal gate: functionally complete",
          "NOT from NAND: A ⊼ A = Ā",
          "AND from NAND: (A ⊼ B) ⊼ (A ⊼ B) = A · B",
          "OR from NAND: (Ā ⊼ B̄) = A + B (De Morgan's)",
          "More efficient than AND in CMOS",
        ],
        variant: "info",
      },
    ],
  },
  nor: {
    name: "NOR Gate",
    description:
      "The NOR gate (NOT-OR) outputs HIGH (1) only when all inputs are LOW. It's the complement of the OR gate: NOR = NOT(OR). Like NAND, NOR is also a universal gate, capable of implementing any Boolean function. NOR gates are particularly useful in CMOS design and are fundamental in building flip-flops and memory elements.",
    badges: [
      { label: "Expression", value: "A + B" },
      { label: "Output", value: "1 if A=0 AND B=0" },
      { label: "Symbol", value: "⊽" },
    ],
    lists: [
      {
        title: "Applications",
        items: [
          "Universal gate: functionally complete",
          "Flip-flop and latch circuits",
          "SRAM memory cells",
          "Building other gates (AND, OR, NOT from NOR)",
          "CMOS logic implementation",
        ],
        variant: "good",
      },
      {
        title: "Key Properties",
        items: [
          "Universal gate: functionally complete",
          "NOT from NOR: A ⊽ A = Ā",
          "OR from NOR: (A ⊽ B) ⊽ (A ⊽ B) = A + B",
          "AND from NOR: (Ā ⊽ B̄) = A · B (De Morgan's)",
          "Dual of NAND gate",
        ],
        variant: "info",
      },
    ],
  },
  xor: {
    name: "XOR Gate (Exclusive OR)",
    description:
      "The XOR gate outputs HIGH (1) when the inputs are different (one HIGH, one LOW). It implements exclusive disjunction: true if exactly one input is true, but not both. XOR is fundamental in digital arithmetic, particularly for binary addition (sum bit) and parity checking. The XOR operation is commutative and associative.",
    badges: [
      { label: "Expression", value: "A ⊕ B" },
      { label: "Output", value: "1 if A ≠ B" },
      { label: "Symbol", value: "⊕" },
    ],
    lists: [
      {
        title: "Applications",
        items: [
          "Binary addition: sum bit in half/full adders",
          "Parity generation and checking",
          "Error detection codes (CRC, checksums)",
          "Cryptography: one-time pad encryption",
          "Comparator circuits (equality detection)",
        ],
        variant: "good",
      },
      {
        title: "Key Properties",
        items: [
          "Output is 1 when inputs differ",
          "Commutative: A ⊕ B = B ⊕ A",
          "Associative: (A ⊕ B) ⊕ C = A ⊕ (B ⊕ C)",
          "Identity: A ⊕ 0 = A",
          "Self-inverse: A ⊕ A = 0",
        ],
        variant: "info",
      },
    ],
  },
  xnor: {
    name: "XNOR Gate (Equivalence)",
    description:
      "The XNOR gate (Exclusive NOR) outputs HIGH (1) when the inputs are the same (both HIGH or both LOW). It's the complement of XOR: XNOR = NOT(XOR). XNOR implements logical equivalence: the output is true when both inputs have the same value. It's used in comparators, parity checking, and arithmetic circuits.",
    badges: [
      { label: "Expression", value: "A ⊙ B" },
      { label: "Output", value: "1 if A = B" },
      { label: "Symbol", value: "⊙" },
    ],
    lists: [
      {
        title: "Applications",
        items: [
          "Equality comparators",
          "Parity checking (even parity)",
          "Binary subtraction and arithmetic",
          "Error detection and correction",
          "Digital phase detectors",
        ],
        variant: "good",
      },
      {
        title: "Key Properties",
        items: [
          "Output is 1 when inputs are equal",
          "Complement of XOR: A ⊙ B = A ⊕ B",
          "Commutative: A ⊙ B = B ⊙ A",
          "Equivalence: A ⊙ B = (A · B) + (Ā · B̄)",
          "Identity: A ⊙ 1 = Ā",
        ],
        variant: "info",
      },
    ],
  },
};
