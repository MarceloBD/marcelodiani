interface SimulatorBadge {
  label: string;
  value: string;
}

interface SimulatorList {
  title: string;
  items: string[];
  variant: "good" | "info";
}

export interface SimulatorDetailsData {
  name: string;
  description: string;
  badges: SimulatorBadge[];
  lists: SimulatorList[];
}

function InfoBadge({ label, value }: SimulatorBadge) {
  return (
    <div className="flex items-center gap-1.5">
      {label && <span className="text-[9px] text-muted/70">{label}</span>}
      <span className="text-[10px] font-mono text-accent font-semibold">{value}</span>
    </div>
  );
}

function DetailList({ title, items, variant }: SimulatorList) {
  const iconColor = variant === "good" ? "text-emerald-400" : "text-blue-400";
  const icon = variant === "good" ? "✓" : "•";

  return (
    <div className="flex-1 min-w-[200px]">
      <span className="text-[10px] font-semibold text-foreground/70 block mb-1.5">
        {title}
      </span>
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

export function SimulatorDetails({ data }: { data: SimulatorDetailsData }) {
  const { name, description, badges, lists } = data;

  return (
    <div className="mt-4 pt-4 border-t border-card-border/50 space-y-3">
      <div>
        <h4 className="text-[11px] font-semibold text-foreground/90 mb-1">{name}</h4>
        <p className="text-[9px] text-muted leading-relaxed">{description}</p>
      </div>

      {badges.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 bg-card-border/20 rounded-lg px-3 py-2">
          {badges.map((badge, index) => (
            <InfoBadge key={index} {...badge} />
          ))}
        </div>
      )}

      {lists.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {lists.map((list) => (
            <DetailList key={list.title} {...list} />
          ))}
        </div>
      )}
    </div>
  );
}
