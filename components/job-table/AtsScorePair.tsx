import { ArrowRight } from "lucide-react";

export function AtsScorePair({ before, after }: { before: number | null; after: number | null }) {
  if (before === null) {
    return <span className="font-mono text-xs" style={{ color: "var(--border-strong)" }}>—</span>;
  }
  const colorFor = (n: number) => n >= 80 ? "#22c55e" : n >= 60 ? "#f59e0b" : "#ef4444";
  const bgFor    = (n: number) => n >= 80 ? "#052e1620" : n >= 60 ? "#431a0120" : "#2a050520";

  return (
    <div className="flex items-center gap-1">
      <span
        className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded"
        style={{ color: colorFor(before), background: bgFor(before), border: `1px solid ${colorFor(before)}33` }}
      >
        {before}
      </span>
      {after !== null && (
        <>
          <ArrowRight size={10} style={{ color: "var(--border-strong)" }} />
          <span
            className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded"
            style={{ color: colorFor(after), background: bgFor(after), border: `1px solid ${colorFor(after)}33` }}
          >
            {after}
          </span>
        </>
      )}
    </div>
  );
}
