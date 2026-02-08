export type SignalType = "sine" | "square" | "triangle" | "sawtooth";

export interface SignalInfo {
  name: string;
  description: string;
  formula: string;
  harmonicContent: string;
  applications: string[];
  characteristics: string[];
}

export const SIGNAL_TYPES: Record<SignalType, SignalInfo> = {
  sine: {
    name: "Sine Wave",
    description:
      "The most fundamental waveform in signal processing. A pure sine wave contains only a single frequency component (no harmonics). It represents the natural oscillation of many physical systems, from AC power to sound waves to electromagnetic radiation.",
    formula: "y(t) = A * sin(2pi * f * t + phi)",
    harmonicContent:
      "Single frequency only - no harmonics. The building block of all other waveforms via Fourier synthesis.",
    applications: [
      "AC power generation and distribution (50/60 Hz mains)",
      "Audio test tones and calibration signals",
      "Carrier waves for AM/FM radio and wireless communication",
    ],
    characteristics: [
      "Smooth, continuous waveform with no abrupt transitions",
      "RMS value = Peak / sqrt(2) = 0.707 * Peak",
      "Crest factor = sqrt(2) = 1.414",
    ],
  },
  square: {
    name: "Square Wave",
    description:
      "A waveform that alternates between two fixed voltage levels with instantaneous transitions. Fundamental in digital electronics where signals represent binary states (HIGH/LOW). Rich in odd harmonics, which is why square waves sound buzzy in audio.",
    formula: "y(t) = A * sign(sin(2pi * f * t + phi))",
    harmonicContent:
      "Contains all odd harmonics (1st, 3rd, 5th, 7th...) with amplitudes decreasing as 1/n.",
    applications: [
      "Digital clock signals and microcontroller I/O (GPIO)",
      "PWM (Pulse Width Modulation) for motor speed and LED dimming",
      "Timing and synchronization in digital communication protocols",
    ],
    characteristics: [
      "Instantaneous transitions between HIGH and LOW (ideal case)",
      "50% duty cycle - equal time at each level",
      "RMS value = Peak (for symmetric square wave)",
    ],
  },
  triangle: {
    name: "Triangle Wave",
    description:
      "A waveform that rises and falls linearly at a constant rate, creating a triangular shape. Contains only odd harmonics like the square wave, but they fall off much faster (as 1/n squared), resulting in a softer, mellower sound.",
    formula: "y(t) = (2A/pi) * arcsin(sin(2pi * f * t + phi))",
    harmonicContent:
      "Contains odd harmonics only, but amplitudes decrease as 1/n squared, much less harmonic content than square waves.",
    applications: [
      "Audio synthesis - produces a soft, flute-like tone",
      "Sweep generators for frequency response testing",
      "Ramp inputs for ADC testing and calibration",
    ],
    characteristics: [
      "Linear rise and fall - constant slew rate",
      "RMS value = Peak / sqrt(3) = 0.577 * Peak",
      "Smoother than square wave but sharper than sine wave",
    ],
  },
  sawtooth: {
    name: "Sawtooth Wave",
    description:
      "A waveform that rises linearly then drops sharply. Contains both odd and even harmonics, giving it the richest harmonic spectrum of common waveforms. Widely used in music synthesis for bright, buzzy tones and as a basis for subtractive synthesis.",
    formula: "y(t) = 2A * (t/T - floor(t/T + 0.5))",
    harmonicContent:
      "Contains ALL harmonics (odd and even) with amplitudes decreasing as 1/n, the richest harmonic content.",
    applications: [
      "Music synthesizers - basis for subtractive synthesis (filter + sawtooth)",
      "Horizontal sweep in CRT displays and oscilloscopes",
      "Frequency modulation and phase-locked loop (PLL) circuits",
    ],
    characteristics: [
      "Linear ramp followed by instantaneous reset",
      "RMS value = Peak / sqrt(3) = 0.577 * Peak",
      "Asymmetric waveform - contains both odd and even harmonics",
    ],
  },
};
