"use client";

import { Trash2, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  open: boolean;
  companyName: string;
  roleTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  open,
  companyName,
  roleTitle,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={onCancel}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-sm pointer-events-auto rounded-xl animate-fade-in"
          style={{ background: "var(--surface)", border: "1px solid var(--border-strong)" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "#2a050520", border: "1px solid #ef444420" }}
              >
                <Trash2 size={13} style={{ color: "var(--error)" }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Delete application
              </span>
            </div>
            <button
              onClick={onCancel}
              className="p-1 rounded transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            <p className="text-sm" style={{ color: "var(--foreground-subtle)" }}>
              Are you sure you want to delete{" "}
              <span style={{ color: "var(--foreground)" }} className="font-medium">
                {companyName}
              </span>
              {roleTitle && roleTitle !== "Processing..." && (
                <>
                  {" — "}
                  <span style={{ color: "var(--foreground)" }} className="font-medium">
                    {roleTitle}
                  </span>
                </>
              )}
              ?
            </p>
            <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>
              This cannot be undone.
            </p>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-2 px-5 py-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={{ color: "var(--muted)", background: "var(--surface-elevated)", border: "1px solid var(--border-strong)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95"
              style={{ background: "#2a0505", color: "#f87171", border: "1px solid #ef444430" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3a0707"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2a0505"; }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
