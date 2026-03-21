"use client";

import { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "At least 8 characters";
  if (pw.length > 12) return "At most 12 characters";
  if (!/[a-zA-Z]/.test(pw)) return "Must contain a letter";
  if (!/[0-9]/.test(pw)) return "Must contain a digit";
  return null;
}

interface Requirement {
  label: string;
  met: boolean;
}

function getRequirements(pw: string): Requirement[] {
  return [
    { label: "8–12 chars", met: pw.length >= 8 && pw.length <= 12 },
    { label: "Letter", met: /[a-zA-Z]/.test(pw) },
    { label: "Digit", met: /[0-9]/.test(pw) },
  ];
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 36px 9px 12px",
    background: "var(--surface-sunken)",
    border: "1px solid var(--border-strong)",
    borderRadius: 8,
    color: "var(--foreground)",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={inputStyle}
        onFocus={(e) => { e.target.style.borderColor = "color-mix(in srgb, var(--accent) 40%, transparent)"; }}
        onBlur={(e) => { e.target.style.borderColor = "var(--border-strong)"; }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          color: "var(--muted)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setCurrent("");
      setNext("");
      setConfirm("");
      setError("");
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  const requirements = getRequirements(next);
  const allMet = requirements.every((r) => r.met);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validatePassword(next);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (next !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update password.");
      } else {
        toast.success("Password updated.");
        onClose();
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        className="fixed z-50"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: 380,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 24,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Change password
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Current password */}
          <div>
            <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 5 }}>
              Current password
            </label>
            <PasswordInput
              value={current}
              onChange={setCurrent}
              placeholder="Current password"
              required
            />
          </div>

          {/* New password */}
          <div>
            <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 5 }}>
              New password
            </label>
            <PasswordInput
              value={next}
              onChange={setNext}
              placeholder="New password"
              required
            />
            {/* Requirement pills */}
            {next.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {requirements.map((req) => (
                  <span
                    key={req.label}
                    style={{
                      fontSize: 10,
                      padding: "2px 8px",
                      borderRadius: 99,
                      background: req.met ? "#0a2010" : "var(--surface-elevated)",
                      border: `1px solid ${req.met ? "#22c55e44" : "var(--border-strong)"}`,
                      color: req.met ? "var(--success)" : "var(--muted)",
                    }}
                  >
                    {req.met ? "✓ " : ""}{req.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 5 }}>
              Confirm new password
            </label>
            <PasswordInput
              value={confirm}
              onChange={setConfirm}
              placeholder="Confirm password"
              required
            />
            {confirm.length > 0 && next !== confirm && (
              <p style={{ fontSize: 11, color: "var(--error)", marginTop: 4 }}>Passwords do not match.</p>
            )}
          </div>

          {error && (
            <p style={{ fontSize: 12, color: "var(--error)", margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={saving || !allMet || !current || next !== confirm}
            className="flex items-center justify-center gap-2 mt-1"
            style={{
              padding: "10px 0",
              borderRadius: 8,
              background: "#1DB954",
              color: "#000",
              fontWeight: 600,
              fontSize: 13,
              border: "none",
              cursor: saving || !allMet || !current || next !== confirm ? "not-allowed" : "pointer",
              opacity: saving || !allMet || !current || next !== confirm ? 0.5 : 1,
            }}
          >
            {saving ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </>
  );
}
