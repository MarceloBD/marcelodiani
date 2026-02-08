"use client";

type DriftAnimation = "math-drift-up" | "math-drift-down" | "math-drift-diagonal";

interface MathFormula {
  text: string;
  top: string;
  left: string;
  fontSize: string;
  opacity: number;
  animation: DriftAnimation;
  duration: string;
  delay: string;
}

const MATH_FORMULAS: MathFormula[] = [
  // === TOP ROW ===
  { text: "E = mc²", top: "2%", left: "3%", fontSize: "1.2rem", opacity: 0.55, animation: "math-drift-up", duration: "8s", delay: "0s" },
  { text: "π", top: "5%", left: "14%", fontSize: "2.2rem", opacity: 0.4, animation: "math-drift-diagonal", duration: "10s", delay: "1s" },
  { text: "∫₀^∞ e⁻ˣ² dx", top: "10%", left: "7%", fontSize: "0.9rem", opacity: 0.5, animation: "math-drift-down", duration: "9s", delay: "0.5s" },
  { text: "e^(iπ) + 1 = 0", top: "4%", left: "30%", fontSize: "1rem", opacity: 0.5, animation: "math-drift-up", duration: "9s", delay: "1.5s" },
  { text: "42", top: "9%", left: "47%", fontSize: "1.8rem", opacity: 0.4, animation: "math-drift-diagonal", duration: "12s", delay: "0s" },
  { text: "d/dx(sin x) = cos x", top: "3%", left: "58%", fontSize: "0.8rem", opacity: 0.45, animation: "math-drift-down", duration: "10s", delay: "2s" },
  { text: "∇ × B = μ₀J", top: "2%", left: "76%", fontSize: "0.85rem", opacity: 0.48, animation: "math-drift-up", duration: "11s", delay: "2s" },
  { text: "1729", top: "8%", left: "88%", fontSize: "1.4rem", opacity: 0.5, animation: "math-drift-diagonal", duration: "7s", delay: "0s" },
  { text: "φ = 1.618...", top: "14%", left: "70%", fontSize: "0.85rem", opacity: 0.45, animation: "math-drift-down", duration: "10s", delay: "3s" },
  { text: "ζ(2) = π²/6", top: "12%", left: "24%", fontSize: "0.8rem", opacity: 0.42, animation: "math-drift-up", duration: "9s", delay: "0.5s" },
  { text: "6.022×10²³", top: "16%", left: "42%", fontSize: "0.8rem", opacity: 0.4, animation: "math-drift-diagonal", duration: "10s", delay: "3s" },
  { text: "ln(e) = 1", top: "13%", left: "92%", fontSize: "0.75rem", opacity: 0.42, animation: "math-drift-down", duration: "8s", delay: "1s" },

  // === LEFT SIDE ===
  { text: "∂f/∂x", top: "24%", left: "1%", fontSize: "1rem", opacity: 0.52, animation: "math-drift-up", duration: "8s", delay: "2s" },
  { text: "137", top: "32%", left: "5%", fontSize: "1.5rem", opacity: 0.45, animation: "math-drift-down", duration: "10s", delay: "0.5s" },
  { text: "Σ(n²)", top: "40%", left: "2%", fontSize: "0.95rem", opacity: 0.5, animation: "math-drift-diagonal", duration: "9s", delay: "1s" },
  { text: "∞", top: "50%", left: "6%", fontSize: "2rem", opacity: 0.35, animation: "math-drift-up", duration: "11s", delay: "3s" },
  { text: "∫∫∫ dV", top: "60%", left: "3%", fontSize: "0.9rem", opacity: 0.48, animation: "math-drift-up", duration: "9s", delay: "0s" },
  { text: "cos²θ + sin²θ = 1", top: "68%", left: "1%", fontSize: "0.75rem", opacity: 0.45, animation: "math-drift-diagonal", duration: "10s", delay: "2s" },
  { text: "∇·E = ρ/ε₀", top: "76%", left: "5%", fontSize: "0.8rem", opacity: 0.45, animation: "math-drift-down", duration: "8s", delay: "1s" },
  { text: "√2", top: "84%", left: "10%", fontSize: "1.3rem", opacity: 0.42, animation: "math-drift-up", duration: "9s", delay: "1.5s" },

  // === RIGHT SIDE ===
  { text: "a² + b² = c²", top: "22%", left: "89%", fontSize: "0.85rem", opacity: 0.52, animation: "math-drift-down", duration: "9s", delay: "0s" },
  { text: "∆x · ∆p ≥ ℏ/2", top: "30%", left: "84%", fontSize: "0.8rem", opacity: 0.45, animation: "math-drift-up", duration: "10s", delay: "2.5s" },
  { text: "e", top: "40%", left: "93%", fontSize: "1.7rem", opacity: 0.35, animation: "math-drift-diagonal", duration: "8s", delay: "1s" },
  { text: "dx/dt", top: "48%", left: "87%", fontSize: "1rem", opacity: 0.48, animation: "math-drift-down", duration: "11s", delay: "0.5s" },
  { text: "W = F·d", top: "56%", left: "91%", fontSize: "0.85rem", opacity: 0.45, animation: "math-drift-up", duration: "9s", delay: "2s" },
  { text: "c = 3×10⁸", top: "64%", left: "86%", fontSize: "0.8rem", opacity: 0.42, animation: "math-drift-diagonal", duration: "10s", delay: "0s" },
  { text: "∮ B·dl = μ₀I", top: "72%", left: "90%", fontSize: "0.75rem", opacity: 0.42, animation: "math-drift-down", duration: "8s", delay: "3s" },
  { text: "det(A)", top: "82%", left: "85%", fontSize: "0.9rem", opacity: 0.45, animation: "math-drift-up", duration: "9s", delay: "1s" },
  { text: "θ", top: "90%", left: "93%", fontSize: "1.5rem", opacity: 0.35, animation: "math-drift-diagonal", duration: "7s", delay: "2s" },

  // === CENTER-LEFT (between content) ===
  { text: "λ", top: "26%", left: "28%", fontSize: "1.5rem", opacity: 0.32, animation: "math-drift-up", duration: "10s", delay: "2s" },
  { text: "∮", top: "44%", left: "22%", fontSize: "1.8rem", opacity: 0.32, animation: "math-drift-down", duration: "12s", delay: "1s" },
  { text: "n! = n(n-1)!", top: "36%", left: "16%", fontSize: "0.8rem", opacity: 0.42, animation: "math-drift-diagonal", duration: "9s", delay: "0s" },
  { text: "Γ(n)", top: "54%", left: "20%", fontSize: "0.9rem", opacity: 0.4, animation: "math-drift-up", duration: "10s", delay: "2.5s" },
  { text: "∂²u/∂t²", top: "62%", left: "28%", fontSize: "0.85rem", opacity: 0.42, animation: "math-drift-down", duration: "8s", delay: "1s" },

  // === CENTER ===
  { text: "F = ma", top: "20%", left: "52%", fontSize: "0.95rem", opacity: 0.45, animation: "math-drift-diagonal", duration: "9s", delay: "0s" },
  { text: "9.81 m/s²", top: "34%", left: "45%", fontSize: "1rem", opacity: 0.38, animation: "math-drift-down", duration: "8s", delay: "3s" },
  { text: "3.14159265", top: "42%", left: "62%", fontSize: "0.85rem", opacity: 0.42, animation: "math-drift-up", duration: "10s", delay: "2s" },
  { text: "∫ sin(x) dx = -cos(x)", top: "28%", left: "38%", fontSize: "0.7rem", opacity: 0.4, animation: "math-drift-diagonal", duration: "11s", delay: "0.5s" },
  { text: "V = IR", top: "50%", left: "42%", fontSize: "0.9rem", opacity: 0.42, animation: "math-drift-up", duration: "9s", delay: "1s" },

  // === CENTER-RIGHT ===
  { text: "∇²Ψ = -k²Ψ", top: "26%", left: "72%", fontSize: "0.8rem", opacity: 0.42, animation: "math-drift-down", duration: "10s", delay: "1.5s" },
  { text: "Ω", top: "38%", left: "78%", fontSize: "1.4rem", opacity: 0.32, animation: "math-drift-up", duration: "8s", delay: "0s" },
  { text: "P = mv", top: "52%", left: "74%", fontSize: "0.9rem", opacity: 0.42, animation: "math-drift-diagonal", duration: "9s", delay: "2s" },
  { text: "log₂(1024) = 10", top: "60%", left: "68%", fontSize: "0.75rem", opacity: 0.4, animation: "math-drift-down", duration: "10s", delay: "0.5s" },

  // === BOTTOM ROW ===
  { text: "v = λf", top: "70%", left: "35%", fontSize: "0.85rem", opacity: 0.45, animation: "math-drift-diagonal", duration: "8s", delay: "0s" },
  { text: "lim x→∞", top: "74%", left: "48%", fontSize: "0.9rem", opacity: 0.42, animation: "math-drift-up", duration: "11s", delay: "2s" },
  { text: "Ψ(x,t)", top: "78%", left: "60%", fontSize: "1rem", opacity: 0.45, animation: "math-drift-diagonal", duration: "9s", delay: "0s" },
  { text: "1, 1, 2, 3, 5, 8, 13", top: "82%", left: "32%", fontSize: "0.8rem", opacity: 0.42, animation: "math-drift-down", duration: "10s", delay: "1s" },
  { text: "∇²φ = ρ/ε₀", top: "72%", left: "76%", fontSize: "0.8rem", opacity: 0.42, animation: "math-drift-up", duration: "10s", delay: "1s" },
  { text: "2.71828", top: "86%", left: "4%", fontSize: "0.85rem", opacity: 0.45, animation: "math-drift-diagonal", duration: "10s", delay: "0.5s" },
  { text: "i² = -1", top: "80%", left: "72%", fontSize: "0.9rem", opacity: 0.45, animation: "math-drift-down", duration: "9s", delay: "0.5s" },
  { text: "ℝ", top: "90%", left: "16%", fontSize: "1.4rem", opacity: 0.35, animation: "math-drift-up", duration: "11s", delay: "1.5s" },
  { text: "KE = ½mv²", top: "88%", left: "52%", fontSize: "0.85rem", opacity: 0.42, animation: "math-drift-diagonal", duration: "9s", delay: "0s" },
  { text: "ℏ = h/2π", top: "92%", left: "38%", fontSize: "0.8rem", opacity: 0.42, animation: "math-drift-up", duration: "10s", delay: "2s" },
  { text: "S = k ln W", top: "94%", left: "70%", fontSize: "0.75rem", opacity: 0.42, animation: "math-drift-down", duration: "8s", delay: "1s" },
  { text: "ΔG = ΔH − TΔS", top: "86%", left: "22%", fontSize: "0.7rem", opacity: 0.4, animation: "math-drift-up", duration: "10s", delay: "3s" },

  // === BIG SYMBOLS (large backdrop accents) ===
  { text: "∫", top: "15%", left: "50%", fontSize: "3.5rem", opacity: 0.22, animation: "math-drift-up", duration: "14s", delay: "0s" },
  { text: "Σ", top: "55%", left: "12%", fontSize: "3rem", opacity: 0.22, animation: "math-drift-diagonal", duration: "13s", delay: "2s" },
  { text: "∂", top: "45%", left: "80%", fontSize: "3.2rem", opacity: 0.2, animation: "math-drift-down", duration: "15s", delay: "1s" },
  { text: "∇", top: "75%", left: "55%", fontSize: "2.8rem", opacity: 0.22, animation: "math-drift-up", duration: "12s", delay: "3s" },
  { text: "∆", top: "30%", left: "65%", fontSize: "2.5rem", opacity: 0.2, animation: "math-drift-diagonal", duration: "14s", delay: "0.5s" },
];

export function MathBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {MATH_FORMULAS.map(({ text, top, left, fontSize, opacity, animation, duration, delay }, index) => (
        <span
          key={index}
          className="absolute font-mono text-accent whitespace-nowrap"
          style={{
            top,
            left,
            fontSize,
            opacity,
            animation: `${animation} ${duration} ease-in-out ${delay} infinite alternate`,
          }}
        >
          {text}
        </span>
      ))}
    </div>
  );
}
