export type JobStatus = "processing" | "done" | "error";

export type ApplicationStatus =
  | "ready_to_apply"
  | "applied"
  | "received_revert"
  | "interviewing"
  | "selected"
  | "rejected"
  | "ghosted";

export interface PhraseEdit {
  section: string;
  original: string;
  suggested: string;
  reason: string;
}

export interface Job {
  id: string;
  jobLink: string | null;
  jobDescription: string;
  companyName: string;
  roleTitle: string;
  status: JobStatus;
  applicationStatus: ApplicationStatus;
  appliedAt: string | null;
  atsScore: number | null;
  atsScoreAfter: number | null;
  keywordsFound: string | null;
  keywordsMissing: string | null;
  easyAdditions: string | null;
  riskAdditions: string | null;
  phrasesToUpdate: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  resumeText: string;
  fileName: string;
  updatedAt: string;
  createdAt: string;
}

export const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  ready_to_apply:  { label: "Ready to Apply",   color: "#22d3ee", bg: "#031a1f", dot: "#06b6d4" },
  applied:         { label: "Applied",           color: "#60a5fa", bg: "#0d1f3c", dot: "#3b82f6" },
  received_revert: { label: "Received Revert",   color: "#c084fc", bg: "#160d2e", dot: "#a855f7" },
  interviewing:    { label: "Interviewing",      color: "#a78bfa", bg: "#140d2e", dot: "#8b5cf6" },
  selected:        { label: "Selected",          color: "#34d399", bg: "#032010", dot: "#10b981" },
  rejected:        { label: "Rejected",          color: "#f87171", bg: "#2a0505", dot: "#ef4444" },
  ghosted:         { label: "Ghosted",           color: "#6b7280", bg: "#111111", dot: "#4b5563" },
};
