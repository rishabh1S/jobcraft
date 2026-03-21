"use client";

import { useState } from "react";
import { X, Copy, Check, Loader2, FileText } from "lucide-react";
import { Job } from "@/lib/types";

interface CoverLetterModalProps {
  job: Job | null;
  onClose: () => void;
  onGenerated: (jobId: string, text: string) => void;
}

export function CoverLetterModal({ job, onClose, onGenerated }: CoverLetterModalProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (!job) return null;

  const coverLetter = job.coverLetter;

  async function handleGenerate() {
    if (!job) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/jobs/${job.id}/cover-letter`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate cover letter.");
        return;
      }
      onGenerated(job.id, data.coverLetter);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!coverLetter) return;
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-lg flex flex-col rounded-xl pointer-events-auto animate-fade-in"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            maxHeight: "80vh",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div>
              <h2 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                Cover Letter
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {job.companyName} — {job.roleTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {coverLetter ? (
              <pre
                className="text-sm leading-relaxed whitespace-pre-wrap font-sans"
                style={{ color: "var(--foreground-subtle)" }}
              >
                {coverLetter}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)" }}
                >
                  <FileText size={22} style={{ color: "var(--muted)" }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    No cover letter yet
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    Generate one based on your resume and this job description.
                  </p>
                </div>
                {error && (
                  <p className="text-xs" style={{ color: "var(--error)" }}>{error}</p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
            {coverLetter ? (
              <button
                onClick={handleCopy}
                className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                style={{
                  background: copied ? "var(--surface-elevated)" : "var(--surface-elevated)",
                  border: `1px solid ${copied ? "var(--success)" : "var(--border-strong)"}`,
                  color: copied ? "var(--success)" : "var(--foreground)",
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "#1DB954", color: "#ffffff" }}
              >
                {generating && <Loader2 size={14} className="spinner" />}
                {generating ? "Generating…" : "Generate Cover Letter"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
