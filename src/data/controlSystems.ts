import type { SimulatorDetailsData } from "@/components/interactiveLab/SimulatorDetails";

export type ControlMode = "p" | "pi" | "pd" | "pid" | "openLoop";

export const CONTROL_MODE_INFO: Record<ControlMode, SimulatorDetailsData> = {
  p: {
    name: "Proportional Controller (P)",
    description:
      "The proportional controller produces an output proportional to the current error signal. The gain Kp determines the sensitivity: higher Kp reduces steady-state error but increases oscillation risk. A P-only controller almost always has some residual steady-state error for step inputs, called the offset.",
    badges: [
      { label: "Control Law", value: "u(t) = Kp · e(t)" },
      { label: "Advantage", value: "Fast response" },
      { label: "Limitation", value: "Steady-state error" },
    ],
    lists: [
      {
        title: "Characteristics",
        items: [
          "Output proportional to error magnitude",
          "Higher Kp = faster response but more oscillation",
          "Cannot eliminate steady-state error for step inputs",
          "Simplest feedback controller",
        ],
        variant: "info",
      },
      {
        title: "Applications",
        items: [
          "Simple speed regulation systems",
          "Liquid level control",
          "Systems where some steady-state error is acceptable",
        ],
        variant: "good",
      },
    ],
  },
  pi: {
    name: "Proportional-Integral Controller (PI)",
    description:
      "PI adds integral action to the proportional controller. The integral term accumulates past errors over time, driving the steady-state error to zero. However, the integral wind-up can cause overshoot during transient response. PI controllers are the most commonly used controller type in industrial applications.",
    badges: [
      { label: "Control Law", value: "u = Kp·e + Ki∫e dt" },
      { label: "Advantage", value: "Zero steady-state error" },
      { label: "Risk", value: "Integral wind-up" },
    ],
    lists: [
      {
        title: "Characteristics",
        items: [
          "Eliminates steady-state error via integral action",
          "Integral term accumulates past errors",
          "May cause overshoot during transients",
          "Integral wind-up requires anti-windup measures",
        ],
        variant: "info",
      },
      {
        title: "Applications",
        items: [
          "Temperature control systems",
          "Flow and pressure regulation",
          "Most industrial process control loops",
          "Motor speed control",
        ],
        variant: "good",
      },
    ],
  },
  pd: {
    name: "Proportional-Derivative Controller (PD)",
    description:
      "PD adds derivative action which responds to the rate of change of the error. The derivative term provides anticipatory control, reducing overshoot and improving stability. However, it can amplify high-frequency noise in the error signal, which may cause chattering or instability.",
    badges: [
      { label: "Control Law", value: "u = Kp·e + Kd·de/dt" },
      { label: "Advantage", value: "Reduced overshoot" },
      { label: "Risk", value: "Noise amplification" },
    ],
    lists: [
      {
        title: "Characteristics",
        items: [
          "Derivative anticipates future error trend",
          "Reduces overshoot and oscillation",
          "Improves transient response stability",
          "Sensitive to measurement noise",
        ],
        variant: "info",
      },
      {
        title: "Applications",
        items: [
          "Robotic arm positioning",
          "Motion control systems",
          "Systems requiring minimal overshoot",
          "Stabilization of fast-responding processes",
        ],
        variant: "good",
      },
    ],
  },
  pid: {
    name: "PID Controller (Full)",
    description:
      "The PID controller combines proportional, integral, and derivative actions for optimal control. The P term responds to current error, I eliminates steady-state error by accumulating past errors, and D anticipates future error using its rate of change. Tuning the three gains (Kp, Ki, Kd) balances speed, accuracy, and stability.",
    badges: [
      { label: "Control Law", value: "u = Kp·e + Ki∫e dt + Kd·de/dt" },
      { label: "Tuning", value: "Ziegler-Nichols method" },
      { label: "Usage", value: "90%+ of industrial controllers" },
    ],
    lists: [
      {
        title: "Three Actions",
        items: [
          "Proportional (P): responds to current error magnitude",
          "Integral (I): eliminates accumulated offset error",
          "Derivative (D): anticipates and dampens error changes",
          "Combined: optimal balance of speed and stability",
        ],
        variant: "info",
      },
      {
        title: "Tuning Methods",
        items: [
          "Ziegler-Nichols: oscillation-based tuning rules",
          "Cohen-Coon: process reaction curve method",
          "Trial and error: manual iterative tuning",
          "Auto-tuning: relay feedback identification",
        ],
        variant: "good",
      },
    ],
  },
  openLoop: {
    name: "Open Loop Control",
    description:
      "Open loop control operates without feedback from the output. The controller sends a predetermined signal to the plant based only on the reference input. While simple to implement, it cannot correct for disturbances, model errors, or parameter changes. Open loop serves as a baseline to understand the benefit of feedback control.",
    badges: [
      { label: "Control Law", value: "u(t) = f(r(t))" },
      { label: "Feedback", value: "None" },
      { label: "Error Correction", value: "None" },
    ],
    lists: [
      {
        title: "Characteristics",
        items: [
          "No feedback loop, no error correction",
          "Output depends only on input and system model",
          "Cannot compensate for disturbances",
          "Simple and inexpensive to implement",
        ],
        variant: "info",
      },
      {
        title: "Comparison with Closed Loop",
        items: [
          "No stability issues from feedback",
          "Cannot achieve precise regulation",
          "Performance degrades with model uncertainty",
          "Useful as baseline comparison for PID controllers",
        ],
        variant: "good",
      },
    ],
  },
};
