import type { SimulatorDetailsData } from "@/components/interactiveLab/SimulatorDetails";

export type NeuralNetworkMode = "simpleNN" | "transformer";

export type ActivationFunction = "relu" | "sigmoid" | "tanh" | "step";

export interface ActivationFunctionInfo {
  name: string;
  expression: string;
  evaluate: (x: number) => number;
}

export const ACTIVATION_FUNCTIONS: Record<ActivationFunction, ActivationFunctionInfo> = {
  relu: {
    name: "ReLU (Rectified Linear Unit)",
    expression: "max(0, x)",
    evaluate: (x: number) => Math.max(0, x),
  },
  sigmoid: {
    name: "Sigmoid",
    expression: "1/(1+e⁻ˣ)",
    evaluate: (x: number) => 1 / (1 + Math.exp(-x)),
  },
  tanh: {
    name: "Hyperbolic Tangent",
    expression: "(eˣ - e⁻ˣ)/(eˣ + e⁻ˣ)",
    evaluate: (x: number) => Math.tanh(x),
  },
  step: {
    name: "Step (Perceptron)",
    expression: "x ≥ 0 → 1, else 0",
    evaluate: (x: number) => x >= 0 ? 1 : 0,
  },
};

export type InputExample = "binary" | "small" | "large" | "negative" | "custom";

export interface InputExampleDef {
  label: string;
  values: number[];
}

export const INPUT_EXAMPLES: Record<Exclude<InputExample, "custom">, InputExampleDef> = {
  binary: { label: "Binary", values: [1, 0, 1] },
  small: { label: "Small", values: [0.1, 0.2, 0.3] },
  large: { label: "Large", values: [5, -3, 2] },
  negative: { label: "Negative", values: [-1, -2, -1] },
};

export function forwardPass(
  inputValues: number[],
  weights: number[][][],
  layerSizes: number[],
  activationFunction: (x: number) => number,
): number[][] {
  const layerOutputs: number[][] = [inputValues];

  for (let layer = 0; layer < weights.length; layer++) {
    const previousOutput = layerOutputs[layer];
    const currentOutput: number[] = [];

    for (let neuronIndex = 0; neuronIndex < layerSizes[layer + 1]; neuronIndex++) {
      let sum = 0;
      for (let inputIndex = 0; inputIndex < layerSizes[layer]; inputIndex++) {
        sum += previousOutput[inputIndex] * weights[layer][inputIndex][neuronIndex];
      }
      // Add a small bias based on neuron index for variety
      sum += Math.sin(neuronIndex * 0.5) * 0.1;
      currentOutput.push(activationFunction(sum));
    }

    layerOutputs.push(currentOutput);
  }

  return layerOutputs;
}

export const NN_MODE_INFO: Record<NeuralNetworkMode, SimulatorDetailsData> = {
  simpleNN: {
    name: "Feedforward Neural Network",
    description:
      "A feedforward neural network processes information through layers of interconnected neurons. Each neuron applies a weighted sum of inputs, adds a bias, and passes the result through an activation function. Information flows in one direction from input to output layers, with hidden layers enabling complex pattern recognition.",
    badges: [
      { label: "Forward Pass", value: "y = σ(Wx + b)" },
      { label: "Backpropagation", value: "∂L/∂w = ∂L/∂y · ∂y/∂w" },
      { label: "Loss Function", value: "L = Σ(y - ŷ)²" },
    ],
    lists: [
      {
        title: "Key Components",
        items: [
          "Input layer: receives feature vectors",
          "Hidden layers: learn hierarchical representations",
          "Output layer: produces predictions or classifications",
          "Weights and biases: learned parameters",
          "Activation functions: introduce non-linearity",
        ],
        variant: "info",
      },
      {
        title: "Training Process",
        items: [
          "Forward propagation: compute predictions",
          "Loss calculation: measure prediction error",
          "Backpropagation: compute gradients",
          "Gradient descent: update weights and biases",
          "Iterate until convergence",
        ],
        variant: "good",
      },
      {
        title: "Common Loss Functions",
        items: [
          "Mean Squared Error (MSE): regression tasks",
          "Cross-Entropy: classification tasks",
          "Binary Cross-Entropy: binary classification",
        ],
        variant: "info",
      },
    ],
  },
  transformer: {
    name: "Transformer Architecture",
    description:
      "Transformers revolutionized NLP with the self-attention mechanism, allowing models to process entire sequences in parallel rather than sequentially. The architecture consists of encoder-decoder stacks with multi-head attention, enabling models like GPT and BERT to understand context and relationships across long sequences.",
    badges: [
      { label: "Attention", value: "Attention(Q,K,V) = softmax(QKᵀ/√dₖ)V" },
      { label: "Multi-Head", value: "MultiHead = Concat(head₁...headₕ)Wᵒ" },
      { label: "Positional Encoding", value: "PE(pos,2i) = sin(pos/10000²ⁱ/ᵈ)" },
    ],
    lists: [
      {
        title: "Core Mechanisms",
        items: [
          "Self-attention: computes relationships between all positions",
          "Multi-head attention: parallel attention computations",
          "Positional encoding: injects sequence order information",
          "Layer normalization: stabilizes training",
          "Feedforward networks: processes attention outputs",
        ],
        variant: "info",
      },
      {
        title: "Architecture Variants",
        items: [
          "GPT (Generative Pre-trained Transformer): decoder-only, autoregressive",
          "BERT (Bidirectional Encoder Representations): encoder-only, bidirectional",
          "T5 (Text-to-Text Transfer Transformer): encoder-decoder, sequence-to-sequence",
        ],
        variant: "good",
      },
      {
        title: "Key Advantages",
        items: [
          "Parallel processing: faster training than RNNs",
          "Long-range dependencies: attention captures distant relationships",
          "Transfer learning: pre-trained models adapt to new tasks",
          "Scalability: performance improves with model size",
        ],
        variant: "info",
      },
    ],
  },
};
