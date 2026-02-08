import type { SimulatorDetailsData } from "@/components/interactiveLab/SimulatorDetails";

export type TransistorMode = "mosfet" | "bjt" | "cmosInverter";

export const TRANSISTOR_MODE_INFO: Record<TransistorMode, SimulatorDetailsData> = {
  mosfet: {
    name: "MOSFET (Metal-Oxide-Semiconductor Field-Effect Transistor)",
    description:
      "MOSFETs are voltage-controlled transistors that form the foundation of modern digital electronics. The gate voltage controls the conductivity of the channel between source and drain. Enhancement-mode MOSFETs require a gate voltage to create a channel, while depletion-mode MOSFETs have a channel that can be pinched off. MOSFETs dominate modern CPU design due to their low power consumption and scalability.",
    badges: [
      { label: "Gate Voltage", value: "VGS controls channel" },
      { label: "Modes", value: "Enhancement / Depletion" },
      { label: "Control", value: "Voltage-controlled" },
    ],
    lists: [
      {
        title: "Operation Modes",
        items: [
          "Cutoff: VGS < Vth, no channel, no current",
          "Triode/Linear: VGS > Vth, VDS < VGS - Vth, channel acts as resistor",
          "Saturation: VGS > Vth, VDS > VGS - Vth, constant current",
        ],
        variant: "info",
      },
      {
        title: "Key Advantages",
        items: [
          "Voltage-controlled: minimal gate current",
          "High input impedance",
          "Low power consumption",
          "Excellent scalability to nanometer sizes",
        ],
        variant: "good",
      },
      {
        title: "Modern Applications",
        items: [
          "CPU and GPU transistors (billions per chip)",
          "Power electronics and switching",
          "RF amplifiers",
          "Memory cells (DRAM, flash)",
        ],
        variant: "info",
      },
    ],
  },
  bjt: {
    name: "BJT (Bipolar Junction Transistor)",
    description:
      "BJTs are current-controlled transistors with three terminals: emitter, base, and collector. A small base current controls a much larger collector current, with the current gain (β or hFE) typically ranging from 20 to 200. NPN transistors use electrons as majority carriers, while PNP uses holes. BJTs excel in analog amplification and switching applications.",
    badges: [
      { label: "Current Gain", value: "β = IC / IB" },
      { label: "Types", value: "NPN / PNP" },
      { label: "Control", value: "Current-controlled" },
    ],
    lists: [
      {
        title: "Operation Regions",
        items: [
          "Cutoff: IB ≈ 0, no collector current",
          "Active: IB > 0, IC = β × IB, amplification region",
          "Saturation: both junctions forward-biased, switch ON",
        ],
        variant: "info",
      },
      {
        title: "Key Characteristics",
        items: [
          "Current amplification: small base current controls large collector current",
          "Forward current gain β typically 50-200",
          "Lower input impedance than MOSFETs",
          "Higher power consumption than MOSFETs",
        ],
        variant: "info",
      },
      {
        title: "Common Applications",
        items: [
          "Analog amplifiers (audio, RF)",
          "Switching circuits",
          "Oscillators and signal generators",
          "Current mirrors and differential amplifiers",
        ],
        variant: "good",
      },
    ],
  },
  cmosInverter: {
    name: "CMOS Inverter",
    description:
      "A CMOS inverter consists of a PMOS pull-up transistor and an NMOS pull-down transistor connected in series. When input is LOW, PMOS conducts and output is HIGH. When input is HIGH, NMOS conducts and output is LOW. The key advantage is zero static power consumption since one transistor is always OFF. CMOS logic forms the foundation of modern digital integrated circuits.",
    badges: [
      { label: "Static Power", value: "Zero (one transistor OFF)" },
      { label: "Logic Family", value: "CMOS" },
      { label: "Transistors", value: "PMOS + NMOS" },
    ],
    lists: [
      {
        title: "Operation",
        items: [
          "Input LOW: PMOS ON, NMOS OFF → Output HIGH",
          "Input HIGH: PMOS OFF, NMOS ON → Output LOW",
          "Transition: brief current spike during switching",
          "No DC path: zero static power consumption",
        ],
        variant: "info",
      },
      {
        title: "Key Advantages",
        items: [
          "Zero static power: critical for battery devices",
          "High noise margins: robust operation",
          "Full rail-to-rail swing: VDD to GND",
          "Excellent scalability: foundation of Moore's Law",
        ],
        variant: "good",
      },
      {
        title: "CMOS Logic Family",
        items: [
          "NAND, NOR gates: universal logic gates",
          "Flip-flops and latches: sequential logic",
          "Microprocessors: billions of CMOS gates",
          "Memory: SRAM cells use CMOS inverters",
        ],
        variant: "info",
      },
    ],
  },
};
