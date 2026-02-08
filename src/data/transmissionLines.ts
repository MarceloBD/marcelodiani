import type { SimulatorDetailsData } from "@/components/interactiveLab/SimulatorDetails";

export type TransmissionLineMode = "propagation" | "standingWave" | "smithChart" | "types";

export interface CableType {
  name: string;
  impedance: string;
  description: string;
  applications: string[];
  diagram: "coaxial" | "microstrip" | "twistedPair" | "waveguide";
}

export const CABLE_TYPES: CableType[] = [
  {
    name: "Coaxial Cable",
    impedance: "50Ω / 75Ω",
    description: "Inner conductor surrounded by dielectric insulator and outer conductor shield. Excellent shielding against electromagnetic interference.",
    applications: ["TV/Cable signals", "Ethernet (10BASE2)", "RF test equipment", "CCTV systems"],
    diagram: "coaxial",
  },
  {
    name: "Microstrip",
    impedance: "50Ω typical",
    description: "A conducting strip separated from a ground plane by a dielectric substrate. Common on printed circuit boards (PCBs).",
    applications: ["PCB traces", "Microwave circuits", "Antenna feeds", "RF amplifiers"],
    diagram: "microstrip",
  },
  {
    name: "Twisted Pair",
    impedance: "100Ω / 120Ω",
    description: "Two insulated conductors twisted together. Twisting reduces electromagnetic interference from external sources and crosstalk.",
    applications: ["Ethernet (Cat5/6)", "Telephone lines", "DSL connections", "Industrial control"],
    diagram: "twistedPair",
  },
  {
    name: "Waveguide",
    impedance: "Depends on mode",
    description: "Hollow metallic tube that guides electromagnetic waves. Used at microwave and millimeter-wave frequencies where cable losses are too high.",
    applications: ["Radar systems", "Satellite comms", "Microwave ovens", "Particle accelerators"],
    diagram: "waveguide",
  },
];

export const TL_MODE_INFO: Record<TransmissionLineMode, SimulatorDetailsData> = {
  propagation: {
    name: "Wave Propagation",
    description: "Watch voltage and current waves travel along a transmission line, reflecting at impedance mismatches.",
    badges: [
      { label: "Reflection Coeff.", value: "Γ = (ZL−Z0)/(ZL+Z0)" },
      { label: "Concept", value: "Impedance Matching" },
    ],
    lists: [
      { title: "Key Ideas", items: ["Waves reflect when impedance changes", "Matched load (Γ=0) absorbs all energy", "Short/open circuit reflects everything"], variant: "info" },
    ],
  },
  standingWave: {
    name: "Standing Waves",
    description: "When reflected waves combine with incident waves, standing wave patterns form along the line.",
    badges: [
      { label: "VSWR", value: "(1+|Γ|)/(1−|Γ|)" },
      { label: "Perfect Match", value: "VSWR = 1" },
    ],
    lists: [
      { title: "Key Ideas", items: ["Voltage maxima and minima appear at fixed positions", "VSWR measures mismatch severity", "Distance between nodes = λ/2"], variant: "info" },
    ],
  },
  smithChart: {
    name: "Smith Chart",
    description: "The Smith Chart is a graphical tool for solving transmission line problems. It maps complex impedance to a unit circle, making it easy to visualize impedance transformations, matching networks, and VSWR.",
    badges: [
      { label: "Normalized Z", value: "z = Z/Z₀ = r + jx" },
      { label: "Γ mapping", value: "|Γ| = distance from center" },
      { label: "Center", value: "Z = Z₀ (perfect match)" },
    ],
    lists: [
      { title: "Key Features", items: ["Center = matched impedance (Γ=0)", "Edge = total reflection (|Γ|=1)", "Constant-r circles: vertical lines on impedance plane", "Constant-x arcs: horizontal lines on impedance plane", "Rotate clockwise = move toward load"], variant: "info" },
    ],
  },
  types: {
    name: "Transmission Line Types",
    description: "Different physical structures guide electromagnetic waves for various frequency ranges and applications.",
    badges: [
      { label: "Key Parameter", value: "Characteristic Impedance Z₀" },
      { label: "Goal", value: "Minimize losses & reflections" },
    ],
    lists: [
      { title: "Common Types", items: ["Coaxial cable — shielded, versatile", "Microstrip — PCB integrated", "Twisted pair — low cost networking", "Waveguide — high frequency, low loss"], variant: "info" },
    ],
  },
};
