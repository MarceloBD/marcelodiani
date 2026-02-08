import type { SimulatorDetailsData } from "@/components/interactiveLab/SimulatorDetails";

export type PhysicsMode = "projectile" | "pendulum" | "spring";

export const PHYSICS_INFO: Record<PhysicsMode, SimulatorDetailsData> = {
  projectile: {
    name: "Projectile Motion",
    description:
      "An object launched at an angle follows a parabolic trajectory under gravity (ignoring air resistance). The horizontal and vertical components of motion are independent: horizontal velocity is constant while vertical velocity changes due to gravitational acceleration.",
    badges: [
      { label: "Range", value: "R = v² sin(2θ) / g" },
      { label: "Max Height", value: "H = v² sin²(θ) / 2g" },
      { label: "Time", value: "T = 2v sin(θ) / g" },
    ],
    lists: [
      { title: "Applications", items: ["Ballistics and artillery trajectory planning", "Sports physics (basketball arc, golf drives)", "Spacecraft launch trajectory calculations"], variant: "good" },
      { title: "Key Concepts", items: ["Horizontal and vertical motion are independent", "Maximum range at 45° launch angle", "Energy: KE + PE = constant (no air resistance)"], variant: "info" },
    ],
  },
  pendulum: {
    name: "Simple Pendulum",
    description:
      "A mass on a string swinging under gravity. For small angles, the motion is approximately simple harmonic with a period that depends only on length and gravity — not mass or amplitude. This property made pendulums essential for early timekeeping.",
    badges: [
      { label: "Period", value: "T = 2π√(L/g)" },
      { label: "Frequency", value: "f = 1/(2π)√(g/L)" },
      { label: "Energy", value: "E = mgL(1 - cosθ)" },
    ],
    lists: [
      { title: "Applications", items: ["Pendulum clocks (Huygens, 1656)", "Measuring gravitational acceleration g", "Seismometers for earthquake detection"], variant: "good" },
      { title: "Key Concepts", items: ["Period independent of mass (for ideal pendulum)", "Small angle approximation: sin(θ) ≈ θ", "Continuous exchange between KE and PE"], variant: "info" },
    ],
  },
  spring: {
    name: "Spring (Hooke's Law)",
    description:
      "A mass attached to a spring oscillates with simple harmonic motion. The restoring force is proportional to displacement (F = -kx). The natural frequency depends on the spring constant k and mass m. Damping can be added to model real-world energy loss.",
    badges: [
      { label: "Force", value: "F = -kx (Hooke's Law)" },
      { label: "Period", value: "T = 2π√(m/k)" },
      { label: "Energy", value: "E = ½kx² + ½mv²" },
    ],
    lists: [
      { title: "Applications", items: ["Vehicle suspension systems", "MEMS accelerometers in phones", "Vibration isolation in buildings"], variant: "good" },
      { title: "Key Concepts", items: ["Linear restoring force: F proportional to -x", "Period depends on mass and spring constant, not amplitude", "PE = ½kx² stored in spring deformation"], variant: "info" },
    ],
  },
};
