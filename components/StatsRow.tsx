"use client";

import { Job } from "@/lib/types";

interface StatsRowProps {
  jobs: Job[];
}

export function StatsRow({ jobs }: StatsRowProps) {
  const total        = jobs.length;
  const readyToApply = jobs.filter((j) => j.applicationStatus === "ready_to_apply").length;
  const interviewing = jobs.filter((j) => j.applicationStatus === "interviewing").length;
  const selected     = jobs.filter((j) => j.applicationStatus === "selected").length;

  const beforeScores = jobs.filter((j) => j.atsScore !== null).map((j) => j.atsScore!);
  const afterScores  = jobs.filter((j) => j.atsScoreAfter !== null).map((j) => j.atsScoreAfter!);
  const avgAtsBefore =
    beforeScores.length > 0
      ? Math.round(beforeScores.reduce((a, b) => a + b, 0) / beforeScores.length)
      : null;
  const avgAtsAfter =
    afterScores.length > 0
      ? Math.round(afterScores.reduce((a, b) => a + b, 0) / afterScores.length)
      : null;

  const responded = jobs.filter((j) =>
    ["received_revert", "interviewing", "selected"].includes(j.applicationStatus)
  ).length;
  const applied = jobs.filter((j) =>
    ["applied", "received_revert", "interviewing", "selected", "rejected", "ghosted"].includes(j.applicationStatus)
  ).length;
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

  const stats = [
    { label: "Total",          value: total.toString(),         highlight: null as string | null },
    { label: "Ready to Apply", value: readyToApply.toString(),  highlight: readyToApply > 0 ? "cyan"   : null },
    { label: "Interviewing",   value: interviewing.toString(),  highlight: interviewing > 0 ? "purple" : null },
    { label: "Selected",       value: selected.toString(),      highlight: selected > 0     ? "green"  : null },
  ];

  return (
    <div className="mb-8 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg"
            style={{ background: "#111111", border: "1px solid #1f1f1f" }}
          >
            <div
              className="font-mono text-2xl font-bold mb-1"
              style={{ color: stat.highlight ? highlightColors[stat.highlight] : "#f0ede8" }}
            >
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: "#6b6b6b" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div
          className="px-4 py-3 rounded-lg flex flex-wrap items-center gap-4"
          style={{ background: "#111111", border: "1px solid #1f1f1f" }}
        >
          {avgAtsBefore !== null && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs" style={{ color: "#6b6b6b" }}>Avg ATS</span>
              <span
                className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded"
                style={{ color: highlightColors[atsHighlight(avgAtsBefore) ?? ""] ?? "#f0ede8" }}
              >
                {avgAtsBefore}
              </span>
              {avgAtsAfter !== null && (
                <>
                  <span className="text-xs" style={{ color: "#3a3a3a" }}>→</span>
                  <span
                    className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded"
                    style={{ color: highlightColors[atsHighlight(avgAtsAfter) ?? ""] ?? "#f0ede8" }}
                  >
                    {avgAtsAfter}
                  </span>
                  <span className="text-xs" style={{ color: "#22c55e" }}>
                    +{avgAtsAfter - avgAtsBefore} projected
                  </span>
                </>
              )}
            </div>
          )}

          {avgAtsBefore !== null && responseRate !== null && (
            <div className="w-px h-4 shrink-0" style={{ background: "#1f1f1f" }} />
          )}

          {responseRate !== null && (
            <>
              <span className="text-xs shrink-0" style={{ color: "#6b6b6b" }}>Response rate</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden min-w-16" style={{ background: "#1f1f1f" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${responseRate}%`,
                    backgroundColor: responseRate >= 30 ? "#22c55e" : responseRate >= 15 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
              <span className="font-mono text-xs shrink-0" style={{ color: "#f0ede8" }}>
                {responseRate}%
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
