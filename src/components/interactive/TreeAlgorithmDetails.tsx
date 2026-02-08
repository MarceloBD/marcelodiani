import { useTranslations } from "next-intl";
import { type TreeAlgorithmType, TREE_ALGORITHMS } from "@/data/treeAlgorithms";

interface TreeAlgorithmDetailsProps {
  selectedAlgorithm: TreeAlgorithmType;
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
  const icon = variant === "good" ? "\u2713" : "\u2717";

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

const ROTATION_TYPES = [
  {
    name: "Right (LL)",
    trigger: "Left child is left-heavy",
    description: "The left child becomes the new root, and the old root moves to the right.",
  },
  {
    name: "Left (RR)",
    trigger: "Right child is right-heavy",
    description: "The right child becomes the new root, and the old root moves to the left.",
  },
  {
    name: "Left-Right (LR)",
    trigger: "Left child is right-heavy",
    description: "First rotates the left child left, then rotates the unbalanced node right.",
  },
  {
    name: "Right-Left (RL)",
    trigger: "Right child is left-heavy",
    description: "First rotates the right child right, then rotates the unbalanced node left.",
  },
];

function RebalancingInfo() {
  const translations = useTranslations("treeVisualizer");
  return (
    <div className="mt-3 pt-3 border-t border-card-border/30 space-y-2">
      <h4 className="text-[11px] font-semibold text-foreground/90">{translations("rebalancingTitle")}</h4>
      <p className="text-[9px] text-muted leading-relaxed">
        Each node has a <span className="text-foreground/80 font-semibold">balance factor</span> = height(left subtree) &minus; height(right subtree).
        A balanced AVL node has a factor of &minus;1, 0, or +1.
        After every insert or delete, the tree checks each ancestor of the changed node.
        If any node&apos;s balance factor reaches <span className="text-red-400 font-semibold">+2</span> (left-heavy)
        or <span className="text-red-400 font-semibold">&minus;2</span> (right-heavy),
        one of four rotations is applied to restore balance.
        This guarantees the tree height stays at O(log n), keeping all operations fast.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ROTATION_TYPES.map(({ name, trigger, description }) => (
          <div key={name} className="bg-card-border/15 rounded-md px-2.5 py-1.5">
            <span className="text-[10px] font-semibold text-accent">{name}</span>
            <p className="text-[8px] text-muted/70 mt-0.5">{translations("rebalancingWhen")} {trigger}</p>
            <p className="text-[8px] text-muted leading-relaxed mt-0.5">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TreeAlgorithmDetails({ selectedAlgorithm }: TreeAlgorithmDetailsProps) {
  const translations = useTranslations("treeVisualizer");
  const { name, description, timeComplexity, spaceComplexity, goodFor, badFor } =
    TREE_ALGORITHMS[selectedAlgorithm];

  return (
    <div className="mt-4 pt-4 border-t border-card-border/50 space-y-3">
      <div>
        <h4 className="text-[11px] font-semibold text-foreground/90 mb-1">{name}</h4>
        <p className="text-[9px] text-muted leading-relaxed">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 bg-card-border/20 rounded-lg px-3 py-2">
        <ComplexityBadge label={translations("complexityTime")} value={timeComplexity} />
        <div className="w-px h-3 bg-card-border/50 hidden sm:block" />
        <ComplexityBadge label={translations("complexitySpace")} value={spaceComplexity} />
      </div>

      <div className="flex flex-wrap gap-4">
        <UseCaseList title={translations("useCaseGoodFor")} items={goodFor} variant="good" />
        <UseCaseList title={translations("useCaseBadFor")} items={badFor} variant="bad" />
      </div>

      <RebalancingInfo />
    </div>
  );
}
