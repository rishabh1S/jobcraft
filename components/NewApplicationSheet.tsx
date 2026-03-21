"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Profile } from "@/lib/types";
import toast from "react-hot-toast";

interface NewApplicationSheetProps {
  open: boolean;
  profile: Profile | null;
  onClose: () => void;
  onJobCreated: (jobId: string) => void;
}

export function NewApplicationSheet({
  open,
  profile,
  onClose,
  onJobCreated,
}: NewApplicationSheetProps) {
  const [jobLink, setJobLink] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setJobLink("");
      setJobDescription("");
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      toast.error("Job description is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobLink, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create job");
        return;
      }
      const jobId = data.job.id;
      onJobCreated(jobId);
      onClose();
      toast.success("Job added — tailoring in progress");
      fetch(`/api/jobs/${jobId}/generate`, { method: "POST" }).catch(console.error);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const charCount = jobDescription.length;
  const charColor =
    charCount >= 4000 ? "#ef4444" : charCount > 3800 ? "#f59e0b" : "#3a3a3a";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col animate-slide-in-right"
        style={{
          background: "#111111",
          borderLeft: "1px solid #1f1f1f",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #1f1f1f" }}
        >
          <div>
            <h2 className="font-semibold text-sm" style={{ color: "#f0ede8" }}>
              New Application
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#6b6b6b" }}>
              Paste the job details to tailor your resume
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded transition-colors"
            style={{ color: "#6b6b6b" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f0ede8"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b6b6b"; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* No profile warning */}
          {!profile && (
            <div
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ background: "#1a1500", border: "1px solid #3a2a00" }}
            >
              <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: "#f59e0b" }} />
              <p className="text-xs" style={{ color: "#d4a800" }}>
                No master resume found.{" "}
                <Link href="/profile" className="underline font-medium">
                  Upload your resume
                </Link>{" "}
                before tailoring.
              </p>
            </div>
          )}

          {/* Job URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "#6b6b6b" }}>
              Job URL{" "}
              <span style={{ color: "#3a3a3a" }}>— optional</span>
            </label>
            <input
              type="url"
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              placeholder="https://linkedin.com/jobs/..."
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
              style={{
                background: "#0d0d0d",
                border: "1px solid #1f1f1f",
                color: "#f0ede8",
              }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#f59e0b44"; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#1f1f1f"; }}
            />
          </div>

          {/* Job Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium" style={{ color: "#6b6b6b" }}>
                Job Description <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <span className="font-mono text-xs" style={{ color: charColor }}>
                {charCount} / 4000
              </span>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value.slice(0, 4000))}
              placeholder="Paste the full job description here..."
              rows={8}
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors resize-none"
              style={{
                background: "#0d0d0d",
                border: "1px solid #1f1f1f",
                color: "#f0ede8",
              }}
              onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "#f59e0b44"; }}
              onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "#1f1f1f"; }}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4" style={{ borderTop: "1px solid #1f1f1f" }}>
          <button
            onClick={handleSubmit}
            disabled={!profile || submitting || !jobDescription.trim()}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#f59e0b", color: "#080808" }}
          >
            {submitting ? "Adding..." : "Tailor & Track →"}
          </button>
        </div>
      </div>
    </>
  );
}
