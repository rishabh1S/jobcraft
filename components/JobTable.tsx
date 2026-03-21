"use client";

import { Job, ApplicationStatus, APPLICATION_STATUS_CONFIG } from "@/lib/types";
import {
  Eye,
  RefreshCw,
  FileText,
  Loader2,
  Trash2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobTableProps {
  jobs: Job[];
  onViewSuggestions: (job: Job) => void;
  onRetry: (jobId: string) => void;
  onStatusChange: (jobId: string, status: ApplicationStatus) => void;
  onDelete: (jobId: string) => void;
}

function AtsScorePair({ before, after }: { before: number | null; after: number | null }) {
  if (before === null) {
    return <span className="font-mono text-xs" style={{ color: "#3a3a3a" }}>—</span>;
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
          <ArrowRight size={10} style={{ color: "#3a3a3a" }} />
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

function ProcessingBadge({ status }: { status: string }) {
  if (status === "processing") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-mono" style={{ color: "#f59e0b" }}>
        <Loader2 size={12} className="spinner" />
        processing
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-mono" style={{ color: "#ef4444" }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#ef4444" }} />
        error
      </span>
    );
  }
  return null;
}

const AUTO_STATUSES = new Set(["ready_to_apply", "ghosted"]);

function AppStatusDropdown({
  jobId,
  current,
  onChange,
}: {
  jobId: string;
  current: ApplicationStatus;
  onChange: (jobId: string, status: ApplicationStatus) => void;
}) {
  const cfg = APPLICATION_STATUS_CONFIG[current];
  const statuses = Object.keys(APPLICATION_STATUS_CONFIG) as ApplicationStatus[];

  return (
    <div className="relative inline-flex items-center">
      <span
        className="absolute left-2 w-1.5 h-1.5 rounded-full pointer-events-none z-10"
        style={{ backgroundColor: cfg.dot }}
      />
      <select
        value={current}
        onChange={(e) => onChange(jobId, e.target.value as ApplicationStatus)}
        className="appearance-none text-xs font-medium pl-5 pr-2 py-1 rounded-full cursor-pointer outline-none"
        style={{
          color: cfg.color,
          backgroundColor: cfg.bg,
          border: `1px solid ${cfg.dot}44`,
        }}
      >
        {statuses.map((s) => (
          <option
            key={s}
            value={s}
            disabled={AUTO_STATUSES.has(s)}
            style={{ backgroundColor: "#111111", color: APPLICATION_STATUS_CONFIG[s].color }}
          >
            {APPLICATION_STATUS_CONFIG[s].label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function JobTable({ jobs, onViewSuggestions, onRetry, onStatusChange, onDelete }: JobTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "#111111", border: "1px solid #1f1f1f" }}
        >
          <FileText size={28} style={{ color: "#2a2a2a" }} />
        </div>
        <p className="text-sm" style={{ color: "#6b6b6b" }}>
          No applications yet. Add your first job.
        </p>
      </div>
    );
  }

  const handleJobLinkClick = (job: Job) => {
    if (job.applicationStatus === "ready_to_apply") onStatusChange(job.id, "applied");
    window.open(job.jobLink!, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #1f1f1f" }}>
      {/* Table header */}
      <div
        className="grid text-xs font-mono uppercase tracking-wider px-4 py-3"
        style={{
          color: "#6b6b6b",
          borderBottom: "1px solid #1f1f1f",
          background: "#0d0d0d",
          gridTemplateColumns: "2fr 1.4fr 1fr 0.8fr 0.8fr",
        }}
      >
        <span>Company & Role</span>
        <span>Application Status</span>
        <span>ATS Score</span>
        <span>Analysis</span>
        <span className="text-right">Actions</span>
      </div>

      {/* Rows */}
      {jobs.map((job, i) => (
        <div
          key={job.id}
          className="grid px-4 py-4 transition-colors"
          style={{
            gridTemplateColumns: "2fr 1.4fr 1fr 0.8fr 0.8fr",
            borderBottom: i < jobs.length - 1 ? "1px solid #161616" : "none",
            background: "transparent",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#0d0d0d"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
        >
          {/* Company & Role */}
          <div className="flex flex-col justify-center min-w-0 pr-2 gap-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-sm truncate" style={{ color: "#f0ede8" }}>
                {job.companyName}
              </span>
              {job.jobLink && (
                <button
                  onClick={() => handleJobLinkClick(job)}
                  title={job.applicationStatus === "ready_to_apply" ? "Open & mark as Applied" : "Open job link"}
                  className="shrink-0 transition-colors"
                  style={{ color: "#3a3a3a" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#60a5fa"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#3a3a3a"; }}
                >
                  <ExternalLink size={11} />
                </button>
              )}
            </div>
            <span className="text-xs truncate" style={{ color: "#6b6b6b" }}>
              {job.roleTitle}
            </span>
            {job.appliedAt ? (
              <span className="text-xs font-mono" style={{ color: "#3a3a3a" }}>
                applied {formatDistanceToNow(new Date(job.appliedAt), { addSuffix: true })}
              </span>
            ) : (
              <span className="text-xs font-mono" style={{ color: "#2a2a2a" }}>
                not applied yet
              </span>
            )}
          </div>

          {/* Application Status */}
          <div className="flex items-center">
            <AppStatusDropdown jobId={job.id} current={job.applicationStatus} onChange={onStatusChange} />
          </div>

          {/* ATS Score */}
          <div className="flex items-center">
            <AtsScorePair before={job.atsScore} after={job.atsScoreAfter} />
          </div>

          {/* Analysis */}
          <div className="flex items-center">
            {job.status !== "done" ? (
              <ProcessingBadge status={job.status} />
            ) : (
              <span className="flex items-center gap-1 text-xs font-mono" style={{ color: "#22c55e" }}>
                <span
                  className="w-1.5 h-1.5 rounded-full pulse-dot"
                  style={{ backgroundColor: "#22c55e", boxShadow: "0 0 4px #22c55e" }}
                />
                done
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => onViewSuggestions(job)}
              disabled={job.status !== "done"}
              title="View AI suggestions"
              className="p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: "#6b6b6b" }}
              onMouseEnter={(e) => {
                if (job.status === "done")
                  (e.currentTarget as HTMLButtonElement).style.color = "#f0ede8";
              }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b6b6b"; }}
            >
              <Eye size={14} />
            </button>

            {job.status === "error" && (
              <button
                onClick={() => onRetry(job.id)}
                title="Retry analysis"
                className="p-1.5 rounded transition-colors"
                style={{ color: "#ef4444" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
              >
                <RefreshCw size={14} />
              </button>
            )}

            <button
              onClick={() => onDelete(job.id)}
              title="Delete application"
              className="p-1.5 rounded transition-colors"
              style={{ color: "#3a3a3a" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#3a3a3a"; }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
