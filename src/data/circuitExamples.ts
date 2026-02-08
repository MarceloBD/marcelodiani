export type CircuitType =
  | "resistor"
  | "voltageDivider"
  | "led"
  | "transistorSwitch"
  | "rcFilter";

export interface CircuitParameter {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface CircuitInfo {
  name: string;
  description: string;
  tags: string;
  parameters: CircuitParameter[];
  keyPrinciple: string;
  formulas: string[];
  applications: string[];
  tips: string[];
}

export const CIRCUIT_EXAMPLES: Record<CircuitType, CircuitInfo> = {
  resistor: {
    name: "Simple Resistor (Ohm's Law)",
    description:
      "The most fundamental circuit: a voltage source connected to a single resistor. Demonstrates Ohm's Law — the linear relationship between voltage (V), current (I), and resistance (R). Current flows from the positive terminal through the resistor to the negative terminal.",
    tags: "Ohm's Law / DC / Fundamentals",
    parameters: [
      { id: "voltage", label: "Voltage", unit: "V", min: 1, max: 24, step: 0.5, defaultValue: 9 },
      { id: "resistance", label: "Resistance", unit: "Ω", min: 100, max: 10000, step: 100, defaultValue: 1000 },
    ],
    keyPrinciple: "V = I × R",
    formulas: ["I = V / R", "P = V × I = V² / R = I² × R"],
    applications: [
      "Current limiting in any electronic circuit",
      "Voltage-to-current conversion for sensors",
      "Heating elements (toasters, heaters use resistive heating)",
    ],
    tips: [
      "Higher resistance → less current for the same voltage",
      "Power is dissipated as heat — ensure the resistor's wattage rating is sufficient",
      "Color bands on physical resistors encode their resistance value",
    ],
  },
  voltageDivider: {
    name: "Voltage Divider",
    description:
      "Two resistors in series create an output voltage that is a fraction of the input. The output voltage depends on the ratio of R2 to the total resistance (R1 + R2). One of the most common sub-circuits in electronics.",
    tags: "Resistive / DC / Biasing",
    parameters: [
      { id: "voltage", label: "Vin", unit: "V", min: 1, max: 24, step: 0.5, defaultValue: 12 },
      { id: "resistance1", label: "R1", unit: "Ω", min: 100, max: 10000, step: 100, defaultValue: 2000 },
      { id: "resistance2", label: "R2", unit: "Ω", min: 100, max: 10000, step: 100, defaultValue: 1000 },
    ],
    keyPrinciple: "Vout = Vin × R2 / (R1 + R2)",
    formulas: [
      "Vout = Vin × R2 / (R1 + R2)",
      "I = Vin / (R1 + R2)",
      "P_total = Vin² / (R1 + R2)",
    ],
    applications: [
      "Level shifting for ADC inputs (e.g., 5V sensor → 3.3V MCU)",
      "Biasing transistor base voltage in amplifier circuits",
      "Potentiometers are variable voltage dividers used in volume knobs",
    ],
    tips: [
      "Output voltage is always less than input voltage (unloaded)",
      "Connecting a load to Vout changes the effective ratio — use buffering if needed",
      "Use high-value resistors to minimize quiescent current draw",
    ],
  },
  led: {
    name: "LED Circuit",
    description:
      "An LED (Light Emitting Diode) with a current-limiting resistor. The LED has a forward voltage drop (~2V for red). The resistor limits current to a safe level — without it, the LED would draw excessive current and burn out instantly.",
    tags: "Diode / LED / DC",
    parameters: [
      { id: "voltage", label: "Vsource", unit: "V", min: 3, max: 12, step: 0.5, defaultValue: 5 },
      { id: "resistance", label: "R", unit: "Ω", min: 47, max: 1000, step: 1, defaultValue: 220 },
    ],
    keyPrinciple: "I_LED = (Vsource − V_forward) / R",
    formulas: [
      "I = (Vs − Vf) / R",
      "P_resistor = I² × R",
      "P_LED = Vf × I",
    ],
    applications: [
      "Status indicators on circuit boards and appliances",
      "Lighting and display systems (LED arrays)",
      "Optocouplers for electrical isolation between circuits",
    ],
    tips: [
      "Typical LED current: 10–20 mA — exceeding max rating destroys the LED",
      "Forward voltage varies by color: Red ~2V, Green ~2.2V, Blue/White ~3.3V",
      "Always use a current-limiting resistor — LEDs have very low internal resistance",
    ],
  },
  transistorSwitch: {
    name: "NPN Transistor Switch",
    description:
      "An NPN BJT transistor used as an electronic switch. A small base current (IB) controls a much larger collector current (IC), allowing a low-power signal (e.g., from a microcontroller GPIO) to switch a high-power load. When VB exceeds ~0.7V, the transistor turns ON.",
    tags: "BJT / Transistor / Switching",
    parameters: [
      { id: "supplyVoltage", label: "Vcc", unit: "V", min: 3, max: 12, step: 0.5, defaultValue: 9 },
      { id: "baseVoltage", label: "Vbase", unit: "V", min: 0, max: 5, step: 0.1, defaultValue: 3.3 },
      { id: "baseResistance", label: "Rb", unit: "kΩ", min: 1, max: 100, step: 1, defaultValue: 10 },
      { id: "collectorResistance", label: "Rc", unit: "Ω", min: 100, max: 1000, step: 10, defaultValue: 330 },
    ],
    keyPrinciple: "IC = β × IB  (β ≈ 100 typical)",
    formulas: [
      "IB = (VB − VBE) / RB   where VBE ≈ 0.7V",
      "IC = β × IB   (limited by saturation)",
      "VCE = Vcc − IC × RC",
    ],
    applications: [
      "Switching motors, relays, and high-power LEDs from microcontrollers",
      "Logic gates in TTL digital circuits",
      "Amplifier stages for audio and RF signals",
    ],
    tips: [
      "VBE ≈ 0.7V for silicon — base voltage must exceed this threshold to turn ON",
      "Saturation: VCE drops to ~0.2V when fully ON (transistor acts as closed switch)",
      "Always calculate IB to ensure enough base drive for the required collector current",
    ],
  },
  rcFilter: {
    name: "RC Low-Pass Filter",
    description:
      "A resistor and capacitor form a frequency-selective filter. Low-frequency signals pass through with minimal attenuation, while high-frequency signals are progressively blocked. The cutoff frequency (fc) is where the output drops to 70.7% (−3 dB) of the input.",
    tags: "Filter / AC / Capacitor",
    parameters: [
      { id: "resistance", label: "R", unit: "kΩ", min: 0.1, max: 100, step: 0.1, defaultValue: 10 },
      { id: "capacitance", label: "C", unit: "nF", min: 1, max: 1000, step: 1, defaultValue: 100 },
    ],
    keyPrinciple: "fc = 1 / (2π × R × C)",
    formulas: [
      "fc = 1 / (2π × R × C)",
      "τ = R × C  (time constant)",
      "Gain at fc = −3 dB ≈ 70.7%",
    ],
    applications: [
      "Removing high-frequency noise from sensor readings",
      "Audio tone control (treble cut / bass pass)",
      "Smoothing PWM outputs into analog voltage levels",
    ],
    tips: [
      "At the cutoff frequency, output power is halved (−3 dB point)",
      "Roll-off: −20 dB/decade above cutoff (first-order filter)",
      "Time constant τ = RC — capacitor charges to 63.2% of final value in one τ",
    ],
  },
};
