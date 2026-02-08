import { useTranslations } from "next-intl";
import { type CircuitType, CIRCUIT_EXAMPLES } from "@/data/circuitExamples";

interface CircuitDetailsProps {
  selectedCircuit: CircuitType;
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] text-muted/70">{label}</span>
      <span className="text-[10px] font-mono text-accent font-semibold">{value}</span>
    </div>
  );
}

function DetailList({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "good" | "tip";
}) {
  const iconColor = variant === "good" ? "text-emerald-400" : "text-blue-400";
  const icon = variant === "good" ? "\u2713" : "\u2022";

  return (
    <div className="flex-1 min-w-[200px]">
      <span className="text-[10px] font-semibold text-foreground/70 block mb-1.5">
        {title}
      </span>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-1.5">
            <span className={`text-[10px] ${iconColor} mt-px shrink-0`}>
              {icon}
            </span>
            <span className="text-[9px] text-muted leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CircuitDetails({ selectedCircuit }: CircuitDetailsProps) {
  const {
    name,
    description,
    keyPrinciple,
    formulas,
    applications,
    tips,
  } = CIRCUIT_EXAMPLES[selectedCircuit];

  return (
    <div className="mt-4 pt-4 border-t border-card-border/50 space-y-3">
      <div>
        <h4 className="text-[11px] font-semibold text-foreground/90 mb-1">
          {name}
        </h4>
        <p className="text-[9px] text-muted leading-relaxed">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 bg-card-border/20 rounded-lg px-3 py-2">
        <InfoBadge label="Key Principle" value={keyPrinciple} />
        {formulas.map((formula) => (
          <InfoBadge key={formula} label="" value={formula} />
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <DetailList title="Applications" items={applications} variant="good" />
        <DetailList title="Tips" items={tips} variant="tip" />
      </div>
    </div>
  );
}
