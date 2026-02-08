import type { SimulatorDetailsData } from "@/components/interactiveLab/SimulatorDetails";

export type FiberMode = "singleMode" | "multiModeStep" | "multiModeGraded";

export const FIBER_MODE_INFO: Record<FiberMode, SimulatorDetailsData> = {
  singleMode: {
    name: "Single-Mode Fiber",
    description:
      "Single-mode fiber has a very small core diameter (~9 μm) that allows only one light path (mode) to propagate. This eliminates modal dispersion, enabling transmission over very long distances (hundreds of kilometers) with minimal signal degradation. It uses longer wavelengths (1310 nm or 1550 nm) and requires precise alignment and more expensive laser sources. Single-mode fiber is the backbone of long-haul telecommunications networks.",
    badges: [
      { label: "Core Diameter", value: "~9 μm" },
      { label: "Wavelength", value: "1310 nm / 1550 nm" },
      { label: "Distance", value: "100+ km" },
    ],
    lists: [
      {
        title: "Advantages",
        items: [
          "No modal dispersion — single light path",
          "Very long transmission distances (100+ km)",
          "Highest bandwidth capacity",
          "Low signal attenuation",
          "Ideal for high-speed data transmission",
        ],
        variant: "good",
      },
      {
        title: "Applications",
        items: [
          "Long-haul telecommunications backbone",
          "Undersea cable systems",
          "Metro and regional networks",
          "High-speed internet infrastructure",
          "Data center interconnects",
        ],
        variant: "info",
      },
      {
        title: "Characteristics",
        items: [
          "Requires laser diode sources (more expensive)",
          "Precise connector alignment needed",
          "Smaller core makes splicing more difficult",
          "Higher cost per meter than multi-mode",
        ],
        variant: "info",
      },
    ],
  },
  multiModeStep: {
    name: "Multi-Mode Step-Index Fiber",
    description:
      "Multi-mode step-index fiber has a larger core diameter (typically 50 μm or 62.5 μm) that allows multiple light rays (modes) to propagate simultaneously. The core has a uniform refractive index, creating a sharp boundary with the cladding. Different modes travel at different speeds, causing modal dispersion that limits transmission distance to a few kilometers. It's less expensive and easier to work with than single-mode fiber.",
    badges: [
      { label: "Core Diameter", value: "50-62.5 μm" },
      { label: "Wavelength", value: "850 nm / 1300 nm" },
      { label: "Distance", value: "~2 km" },
    ],
    lists: [
      {
        title: "Characteristics",
        items: [
          "Step-index profile: uniform core refractive index",
          "Multiple light paths (modes) propagate simultaneously",
          "Modal dispersion limits distance and bandwidth",
          "Larger core allows LED sources (less expensive)",
          "Easier to connect and splice than single-mode",
        ],
        variant: "info",
      },
      {
        title: "Applications",
        items: [
          "Short-distance data links",
          "Local area networks (LANs)",
          "Building-to-building connections",
          "Legacy systems and upgrades",
          "Cost-sensitive installations",
        ],
        variant: "good",
      },
      {
        title: "Limitations",
        items: [
          "Modal dispersion reduces bandwidth over distance",
          "Limited to ~2 km transmission distance",
          "Lower data rates compared to single-mode",
          "Not suitable for long-haul applications",
        ],
        variant: "info",
      },
    ],
  },
  multiModeGraded: {
    name: "Multi-Mode Graded-Index Fiber",
    description:
      "Multi-mode graded-index fiber has the same core size as step-index fiber (50-62.5 μm) but uses a graded refractive index profile that decreases gradually from the center to the cladding. This parabolic index profile causes light rays to follow curved paths, reducing modal dispersion significantly compared to step-index fiber. It offers better performance than step-index while maintaining the cost advantages of multi-mode fiber, making it popular in data centers and enterprise networks.",
    badges: [
      { label: "Core Diameter", value: "50-62.5 μm" },
      { label: "Wavelength", value: "850 nm / 1300 nm" },
      { label: "Distance", value: "~500 m" },
    ],
    lists: [
      {
        title: "Advantages",
        items: [
          "Reduced modal dispersion vs. step-index",
          "Better bandwidth-distance product",
          "Parabolic index profile equalizes mode speeds",
          "Cost-effective for medium-distance applications",
          "Compatible with LED and VCSEL sources",
        ],
        variant: "good",
      },
      {
        title: "Applications",
        items: [
          "Data center interconnects",
          "Enterprise networks",
          "Campus and building backbones",
          "High-speed local area networks",
          "Storage area networks (SANs)",
        ],
        variant: "good",
      },
      {
        title: "How It Works",
        items: [
          "Refractive index decreases from center to edge",
          "Light rays follow curved paths (not straight)",
          "Outer rays travel faster paths, compensating for distance",
          "Modes arrive more simultaneously, reducing dispersion",
        ],
        variant: "info",
      },
    ],
  },
};
