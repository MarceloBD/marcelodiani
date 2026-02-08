import { useTranslations } from "next-intl";
import { type AlgorithmType, SORTING_ALGORITHMS } from "@/data/sortingAlgorithms";

interface AlgorithmDetailsProps {
  selectedAlgorithm: AlgorithmType;
}

function ComplexityBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] text-muted/70">{label}</span>
      <span className="text-[10px] font-mono text-accent font-semibold">{value}</span>
    </div>
  );
}

function UseCaseList({ title, items, variant }: { title: string; items: string[]; variant: "good" | "bad" }) {
  const iconColor = variant === "good" ? "text-emerald-400" : "text-red-400";
  const icon = variant === "good" ? "✓" : "✗";

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

export function AlgorithmDetails({ selectedAlgorithm }: AlgorithmDetailsProps) {
  const translations = useTranslations("algorithmVisualizer");
  const { name, description, timeComplexity, spaceComplexity, stable, goodFor, badFor } =
    SORTING_ALGORITHMS[selectedAlgorithm];

  return (
    <div className="mt-4 pt-4 border-t border-card-border/50 space-y-3">
      {/* Algorithm name and description */}
      <div>
        <h4 className="text-[11px] font-semibold text-foreground/90 mb-1">{name}</h4>
        <p className="text-[9px] text-muted leading-relaxed">{description}</p>
      </div>

      {/* Complexity info */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 bg-card-border/20 rounded-lg px-3 py-2">
        <ComplexityBadge label={translations("best")} value={timeComplexity.best} />
        <ComplexityBadge label={translations("average")} value={timeComplexity.average} />
        <ComplexityBadge label={translations("worst")} value={timeComplexity.worst} />
        <div className="w-px h-3 bg-card-border/50 hidden sm:block" />
        <ComplexityBadge label={translations("space")} value={spaceComplexity} />
        <div className="w-px h-3 bg-card-border/50 hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-muted/70">{translations("stable")}</span>
          <span className={`text-[10px] font-semibold ${stable ? "text-emerald-400" : "text-red-400"}`}>
            {stable ? translations("yes") : translations("no")}
          </span>
        </div>
      </div>

      {/* Good for / Bad for */}
      <div className="flex flex-wrap gap-4">
        <UseCaseList title={translations("goodFor")} items={goodFor} variant="good" />
        <UseCaseList title={translations("badFor")} items={badFor} variant="bad" />
      </div>
    </div>
  );
}
