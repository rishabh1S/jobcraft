import { ExternalLink, Mail, RefreshCw, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Job, ApplicationStatus } from "@/lib/types";
import { AppStatusDropdown } from "./AppStatusDropdown";
import { AtsScorePair } from "./AtsScorePair";
import { ProcessingBadge } from "./ProcessingBadge";

interface JobRowProps {
  job: Job;
  isLast: boolean;
  onViewSuggestions: (job: Job) => void;
  onRetry: (jobId: string) => void;
  onStatusChange: (jobId: string, status: ApplicationStatus) => void;
  onDelete: (jobId: string) => void;
  onCoverLetter: (job: Job) => void;
}

export function JobRow({ job, isLast, onViewSuggestions, onRetry, onStatusChange, onDelete, onCoverLetter }: JobRowProps) {
  const handleJobLinkClick = () => {
    window.open(job.jobLink!, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="grid px-4 py-4 transition-colors"
      style={{
        gridTemplateColumns: "2fr 1.4fr 1fr 0.8fr 0.8fr",
        borderBottom: !isLast ? "1px solid var(--surface-sunken)" : "none",
        background: "transparent",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--surface-sunken)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    >
      {/* Company & Role */}
      <div className="flex flex-col justify-center min-w-0 pr-2 gap-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-sm truncate" style={{ color: "var(--foreground)" }}>
            {job.companyName}
          </span>
          {job.jobLink && (
            <button
              onClick={handleJobLinkClick}
              title="Open job link"
              className="shrink-0 transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#60a5fa"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
            >
              <ExternalLink size={11} />
            </button>
          )}
        </div>
        <span className="text-xs truncate" style={{ color: "var(--muted)" }}>
          {job.roleTitle}
        </span>
        {job.appliedAt ? (
          <span className="text-xs font-mono" style={{ color: "var(--border-strong)" }}>
            applied {formatDistanceToNow(new Date(job.appliedAt), { addSuffix: true })}
          </span>
        ) : (
          <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
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
        {job.status === "done" ? (
          <button
            onClick={() => onViewSuggestions(job)}
            className="flex items-center gap-1 text-xs font-mono transition-colors"
            style={{ color: "#60a5fa" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foreground)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#60a5fa"; }}
          >
            View Analysis →
          </button>
        ) : (
          <ProcessingBadge status={job.status} />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => onCoverLetter(job)}
          disabled={job.status !== "done"}
          title={job.coverLetter ? "View cover letter" : "Generate cover letter"}
          className="p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: job.coverLetter ? "var(--accent)" : "var(--muted)" }}
          onMouseEnter={(e) => { if (job.status === "done") (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = job.coverLetter ? "var(--accent)" : "var(--muted)"; }}
        >
          <Mail size={14} />
        </button>

        {job.status === "error" && (
          <button
            onClick={() => onRetry(job.id)}
            title="Retry analysis"
            className="p-1.5 rounded transition-colors"
            style={{ color: "var(--error)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--error)"; }}
          >
            <RefreshCw size={14} />
          </button>
        )}

        <button
          onClick={() => onDelete(job.id)}
          title="Delete application"
          className="p-1.5 rounded transition-colors"
          style={{ color: "var(--muted)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--error)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
