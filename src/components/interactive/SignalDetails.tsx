import { useTranslations } from "next-intl";
import { type SignalType, SIGNAL_TYPES } from "@/data/signalTypes";

interface SignalDetailsProps {
  selectedSignal: SignalType;
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] text-muted/70">{label}</span>
      <span className="text-[10px] font-mono text-accent font-semibold">{value}</span>
    </div>
  );
}

function DetailList({ title, items, variant }: { title: string; items: string[]; variant: "good" | "info" }) {
  const iconColor = variant === "good" ? "text-emerald-400" : "text-blue-400";
  const icon = variant === "good" ? "\u2713" : "\u2022";

  return (
    <div className="flex-1 min-w-[200px]">
      <span className="text-[10px] font-semibold text-foreground/70 block mb-1.5">{title}</span>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-1.5">
            <span className={`text-[10px] ${iconColor} mt-px shrink-0`}>{icon}</span>
            <span className="text-[9px] text-muted leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SignalDetails({ selectedSignal }: SignalDetailsProps) {
  const translations = useTranslations("signalVisualizer");
  const { name, description, formula, harmonicContent, applications, characteristics } =
    SIGNAL_TYPES[selectedSignal];

  return (
    <div className="mt-4 pt-4 border-t border-card-border/50 space-y-3">
      <div>
        <h4 className="text-[11px] font-semibold text-foreground/90 mb-1">{name}</h4>
        <p className="text-[9px] text-muted leading-relaxed">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 bg-card-border/20 rounded-lg px-3 py-2">
        <InfoBadge label="Formula" value={formula} />
      </div>

      <div className="text-[9px] text-muted leading-relaxed">
        <span className="text-[10px] font-semibold text-foreground/70">{translations("harmonicsLabel")} </span>
        {harmonicContent}
      </div>

      <div className="flex flex-wrap gap-4">
        <DetailList title={translations("applications")} items={applications} variant="good" />
        <DetailList title={translations("characteristics")} items={characteristics} variant="info" />
      </div>
    </div>
  );
}
