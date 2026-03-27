import { Loader2 } from "lucide-react";

export function ProcessingBadge({ status }: { status: string }) {
  if (status === "processing") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-mono" style={{ color: "var(--accent)" }}>
        <Loader2 size={12} className="spinner" />
        processing
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-mono" style={{ color: "var(--error)" }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--error)" }} />
        error
      </span>
    );
  }
  return null;
}
