"use client";

import { JobStats } from "@/lib/types";

interface StatsRowProps {
  stats: JobStats | null;
}

export function StatsRow({ stats }: StatsRowProps) {
  const total        = stats?.total ?? 0;
  const readyToApply = stats?.readyToApply ?? 0;
  const interviewing = stats?.interviewing ?? 0;
  const selected     = stats?.selected ?? 0;
  const avgAtsBefore = stats?.avgAtsBefore ?? null;
  const avgAtsAfter  = stats?.avgAtsAfter ?? null;
  const responded    = stats?.responded ?? 0;
  const applied      = stats?.applied ?? 0;
  const responseRate = applied > 0 ? Math.round((responded / applied) * 100) : null;

  const highlightColors: Record<string, string> = {
    green:  "#22c55e",
    amber:  "#f59e0b",
    red:    "#ef4444",
    purple: "#a78bfa",
    cyan:   "#22d3ee",
  };

  const atsHighlight = (n: number | null) =>
    n === null ? null : n >= 80 ? "green" : n >= 60 ? "amber" : "red";

  const statsItems = [
    { label: "Total",          value: total.toString(),         highlight: null as string | null },
    { label: "Ready to Apply", value: readyToApply.toString(),  highlight: readyToApply > 0 ? "cyan"   : null },
    { label: "Interviewing",   value: interviewing.toString(),  highlight: interviewing > 0 ? "purple" : null },
    { label: "Selected",       value: selected.toString(),      highlight: selected > 0     ? "green"  : null },
  ];

  return (
    <div className="mb-8 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statsItems.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div
              className="font-mono text-2xl font-bold mb-1"
              style={{ color: stat.highlight ? highlightColors[stat.highlight] : "var(--foreground)" }}
            >
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div
          className="px-4 py-3 rounded-lg flex flex-wrap items-center gap-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {avgAtsBefore !== null && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs" style={{ color: "var(--muted)" }}>Avg ATS</span>
              <span
                className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded"
                style={{ color: highlightColors[atsHighlight(avgAtsBefore) ?? ""] ?? "var(--foreground)" }}
              >
                {avgAtsBefore}
              </span>
              {avgAtsAfter !== null && (
                <>
                  <span className="text-xs" style={{ color: "var(--border-strong)" }}>→</span>
                  <span
                    className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded"
                    style={{ color: highlightColors[atsHighlight(avgAtsAfter) ?? ""] ?? "var(--foreground)" }}
                  >
                    {avgAtsAfter}
                  </span>
                  <span className="text-xs" style={{ color: "var(--success)" }}>
                    +{avgAtsAfter - avgAtsBefore} projected
                  </span>
                </>
              )}
            </div>
          )}

          {avgAtsBefore !== null && responseRate !== null && (
            <div className="w-px h-4 shrink-0" style={{ background: "var(--border)" }} />
          )}

          {responseRate !== null && (
            <>
              <span className="text-xs shrink-0" style={{ color: "var(--muted)" }}>Response rate</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden min-w-16" style={{ background: "var(--border)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${responseRate}%`,
                    backgroundColor: responseRate >= 30 ? "#22c55e" : responseRate >= 15 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
              <span className="font-mono text-xs shrink-0" style={{ color: "var(--foreground)" }}>
                {responseRate}%
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
