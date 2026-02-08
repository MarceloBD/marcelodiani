import type { SimulatorDetailsData } from "@/components/interactiveLab/SimulatorDetails";

export type IntegrationMethod = "leftRiemann" | "rightRiemann" | "midpoint" | "trapezoidal";

export type CalculusMode = "riemann" | "volume" | "fourier";

export type CoordinateSystem = "cartesian" | "cylindrical" | "spherical";

export type FourierTarget = "square" | "sawtooth" | "triangle";

export interface MathFunctionDef {
  label: string;
  expression: string;
  evaluate: (x: number) => number;
  exactIntegral: (a: number, b: number) => number;
}

export const QUADRATIC_FUNCTION: MathFunctionDef = {
  label: "x²",
  expression: "f(x) = x²",
  evaluate: (x) => x * x,
  exactIntegral: (a, b) => (b ** 3 - a ** 3) / 3,
};

export const COORDINATE_SYSTEMS: Record<CoordinateSystem, { label: string; integralSetup: string; description: string }> = {
  cartesian: {
    label: "Cartesian",
    integralSetup: "V = ∫∫∫ dx dy dz",
    description: "Integrate over slices along one axis. For a sphere: stack circular disks of varying radius.",
  },
  cylindrical: {
    label: "Cylindrical (r, θ, z)",
    integralSetup: "V = ∫∫∫ r dr dθ dz",
    description: "Use radial symmetry. The extra factor r comes from the Jacobian of the cylindrical coordinate transformation.",
  },
  spherical: {
    label: "Spherical (ρ, θ, φ)",
    integralSetup: "V = ∫∫∫ ρ² sin(φ) dρ dθ dφ",
    description: "Perfect for spheres. The factor ρ²sin(φ) is the Jacobian. Integrating over full ranges gives (4/3)πR³.",
  },
};

export const FOURIER_TARGETS: Record<FourierTarget, { label: string; description: string }> = {
  square: {
    label: "Square Wave",
    description: "Built from odd harmonics: (4/π) · [sin(x) + sin(3x)/3 + sin(5x)/5 + ...]",
  },
  sawtooth: {
    label: "Sawtooth Wave",
    description: "Built from all harmonics: (2/π) · [sin(x) - sin(2x)/2 + sin(3x)/3 - ...]",
  },
  triangle: {
    label: "Triangle Wave",
    description: "Built from odd harmonics: (8/π²) · [sin(x) - sin(3x)/9 + sin(5x)/25 - ...]",
  },
};

export function computeFourierTerm(target: FourierTarget, harmonicIndex: number, x: number): number {
  const n = harmonicIndex + 1;
  switch (target) {
    case "square": {
      const k = 2 * n - 1; // odd harmonics: 1, 3, 5, ...
      return (4 / Math.PI) * Math.sin(k * x) / k;
    }
    case "sawtooth": {
      return (2 / Math.PI) * ((-1) ** (n + 1)) * Math.sin(n * x) / n;
    }
    case "triangle": {
      const k = 2 * n - 1; // odd harmonics
      return (8 / (Math.PI * Math.PI)) * ((-1) ** (n - 1)) * Math.sin(k * x) / (k * k);
    }
  }
}

export function computeFourierSum(target: FourierTarget, termCount: number, x: number): number {
  let sum = 0;
  for (let i = 0; i < termCount; i++) {
    sum += computeFourierTerm(target, i, x);
  }
  return sum;
}

export function targetWaveform(target: FourierTarget, x: number): number {
  const normalized = ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  switch (target) {
    case "square":
      return normalized < Math.PI ? 1 : -1;
    case "sawtooth":
      return 1 - normalized / Math.PI;
    case "triangle":
      if (normalized < Math.PI / 2) return normalized / (Math.PI / 2);
      if (normalized < (3 * Math.PI) / 2) return 1 - 2 * (normalized - Math.PI / 2) / Math.PI;
      return -1 + (normalized - (3 * Math.PI) / 2) / (Math.PI / 2);
  }
}

export const INTEGRATION_METHODS: Record<IntegrationMethod, SimulatorDetailsData> = {
  leftRiemann: {
    name: "Left Riemann Sum",
    description:
      "Approximates the integral by summing rectangles whose heights are determined by the function value at the left endpoint of each subinterval.",
    badges: [
      { label: "Formula", value: "∑ f(x_i) · Δx" },
      { label: "Error", value: "O(Δx)" },
      { label: "Order", value: "1st order" },
    ],
    lists: [
      { title: "Applications", items: ["Basic numerical integration", "Lower bound estimation for monotone increasing functions", "Foundation for higher-order methods"], variant: "good" },
    ],
  },
  rightRiemann: {
    name: "Right Riemann Sum",
    description:
      "Uses the function value at the right endpoint of each subinterval. Overestimates for increasing functions.",
    badges: [
      { label: "Formula", value: "∑ f(x_{i+1}) · Δx" },
      { label: "Error", value: "O(Δx)" },
      { label: "Order", value: "1st order" },
    ],
    lists: [
      { title: "Applications", items: ["Upper bound estimation for monotone increasing functions", "Averaging left and right gives the trapezoidal rule"], variant: "good" },
    ],
  },
  midpoint: {
    name: "Midpoint Rule",
    description:
      "Evaluates the function at the center of each subinterval. More accurate because errors tend to cancel out.",
    badges: [
      { label: "Formula", value: "∑ f((x_i+x_{i+1})/2) · Δx" },
      { label: "Error", value: "O(Δx²)" },
      { label: "Order", value: "2nd order" },
    ],
    lists: [
      { title: "Applications", items: ["Higher accuracy at same cost", "Basis for higher-order quadrature methods"], variant: "good" },
    ],
  },
  trapezoidal: {
    name: "Trapezoidal Rule",
    description:
      "Approximates the area using trapezoids instead of rectangles, capturing the slope of the function.",
    badges: [
      { label: "Formula", value: "∑ (f(x_i)+f(x_{i+1}))/2 · Δx" },
      { label: "Error", value: "O(Δx²)" },
      { label: "Order", value: "2nd order" },
    ],
    lists: [
      { title: "Applications", items: ["Standard numerical integration method", "Foundation for Simpson's rule"], variant: "good" },
    ],
  },
};

export const CALCULUS_MODE_DETAILS: Record<CalculusMode, SimulatorDetailsData> = {
  riemann: {
    name: "Riemann Integration",
    description: "Approximate definite integrals by summing the areas of rectangles under a curve.",
    badges: [
      { label: "Function", value: "f(x) = x²" },
      { label: "Concept", value: "Numerical Integration" },
    ],
    lists: [
      { title: "Key Ideas", items: ["Area under curve ≈ sum of rectangle areas", "More rectangles → better approximation", "Different sampling points give different methods"], variant: "info" },
    ],
  },
  volume: {
    name: "Volume of Revolution",
    description: "Compute the volume of a sphere using triple integrals in different coordinate systems.",
    badges: [
      { label: "Result", value: "(4/3)πR³" },
      { label: "Concept", value: "Triple Integrals" },
    ],
    lists: [
      { title: "Key Ideas", items: ["Same volume, different integral setups", "Coordinate choice simplifies computation", "Jacobian factor accounts for coordinate scaling"], variant: "info" },
    ],
  },
  fourier: {
    name: "Fourier Series",
    description: "Any periodic function can be expressed as a sum of sines and cosines.",
    badges: [
      { label: "Formula", value: "f(x) = Σ (aₙcos(nx) + bₙsin(nx))" },
      { label: "Concept", value: "Harmonic Analysis" },
    ],
    lists: [
      { title: "Key Ideas", items: ["Complex waves = sum of simple harmonics", "More terms → closer approximation", "Gibbs phenomenon at discontinuities"], variant: "info" },
    ],
  },
};
