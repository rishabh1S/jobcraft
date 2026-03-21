"use client";

import { useState, useRef, useCallback } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Profile } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { Avatar } from "@/components/Avatar";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const user = session?.user;

  // Resume upload state
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    fileName?: string;
    preview?: string;
    updatedAt?: string;
    error?: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Name editing state
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name ?? "");
  const [nameSaving, setNameSaving] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const { data, mutate } = useSWR<{ profile: Profile | null }>("/api/profile", fetcher);
  const { data: meData } = useSWR<{ hasPassword: boolean }>("/api/user/me", fetcher);
  const profile = data?.profile ?? null;
  const hasPassword = meData?.hasPassword ?? false;

  const handleFile = useCallback(
    async (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !["pdf", "doc", "docx"].includes(ext)) {
        setUploadResult({ success: false, error: "Please upload a PDF or DOCX file." });
        return;
      }
      setUploading(true);
      setUploadResult(null);
      const formData = new FormData();
      formData.append("resumeFile", file);
      try {
        const res = await fetch("/api/profile/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          setUploadResult({ success: false, error: data.error || "Upload failed" });
          return;
        }
        setUploadResult({
          success: true,
          fileName: data.fileName,
          preview: data.preview,
          updatedAt: data.updatedAt,
        });
        toast.success("Resume uploaded successfully");
        await mutate();
      } catch {
        setUploadResult({ success: false, error: "Something went wrong. Please try again." });
      } finally {
        setUploading(false);
      }
    },
    [mutate]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  async function handleSaveName() {
    if (!nameValue.trim() || nameValue.trim() === user?.name) {
      setEditingName(false);
      return;
    }
    setNameSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update name.");
      } else {
        await updateSession({ name: data.user.name });
        toast.success("Name updated.");
        setEditingName(false);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setNameSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Failed to update password.");
      } else {
        toast.success("Password updated.");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch {
      setPasswordError("Something went wrong.");
    } finally {
      setPasswordSaving(false);
    }
  }

  const displayProfile = uploadResult?.success ? uploadResult : profile ? {
    success: true,
    fileName: profile.fileName,
    preview: profile.resumeText.slice(0, 200),
    updatedAt: profile.updatedAt,
  } : null;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    background: "#0d0d0d",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#f0ede8",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div className="min-h-screen" style={{ background: "#080808" }}>
      {/* Minimal nav */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6"
        style={{
          background: "rgba(8,8,8,0.92)",
          borderBottom: "1px solid #1f1f1f",
          backdropFilter: "blur(12px)",
        }}
      >
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className="w-2 h-2 rounded-full bg-amber-500"
            style={{ boxShadow: "0 0 8px #f59e0b88" }}
          />
          <span className="font-mono text-sm font-semibold tracking-tight" style={{ color: "#f0ede8" }}>
            JobCraft
          </span>
        </Link>
      </div>

      <main className="pt-14 flex items-start justify-center px-4">
        <div className="w-full max-w-lg pt-12 pb-16">
          {/* Back link */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs mb-8 transition-colors w-fit"
            style={{ color: "#6b6b6b" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#f0ede8"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#6b6b6b"; }}
          >
            <ArrowLeft size={12} />
            Back to dashboard
          </Link>

          {/* ── Account section ── */}
          <div className="mb-10">
            <h1 className="text-xl font-semibold tracking-tight mb-1" style={{ color: "#f0ede8" }}>
              Account
            </h1>
            <p className="text-sm mb-6" style={{ color: "#6b6b6b" }}>
              Your profile and settings.
            </p>

            <div
              className="p-5 rounded-xl space-y-5"
              style={{ background: "#111111", border: "1px solid #1f1f1f" }}
            >
              {/* Avatar + name + email */}
              <div className="flex items-center gap-4">
                <Avatar name={user?.name} image={user?.image} size={52} />
                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        style={{ ...inputStyle, padding: "6px 10px", fontSize: 13 }}
                        onFocus={(e) => { e.target.style.borderColor = "#f59e0b66"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; }}
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={nameSaving}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          background: "#1DB954",
                          color: "#000",
                          fontSize: 12,
                          fontWeight: 600,
                          border: "none",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          opacity: nameSaving ? 0.7 : 1,
                        }}
                      >
                        {nameSaving ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={() => { setEditingName(false); setNameValue(user?.name ?? ""); }}
                        style={{ fontSize: 12, color: "#6b6b6b", background: "none", border: "none", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: "#f0ede8" }}>
                        {user?.name ?? "—"}
                      </p>
                      <button
                        onClick={() => { setEditingName(true); setNameValue(user?.name ?? ""); }}
                        style={{ fontSize: 11, color: "#6b6b6b", background: "none", border: "none", cursor: "pointer" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f0ede8"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b6b6b"; }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  <p className="text-xs mt-0.5 truncate" style={{ color: "#6b6b6b" }}>
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Password change — credentials users only */}
              {hasPassword && (
                <div style={{ borderTop: "1px solid #1f1f1f", paddingTop: 16 }}>
                  <p className="text-xs font-medium mb-3" style={{ color: "#6b6b6b" }}>
                    Change password
                  </p>
                  <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input
                      type="password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      style={{ ...inputStyle, fontSize: 13 }}
                      onFocus={(e) => { e.target.style.borderColor = "#f59e0b66"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; }}
                    />
                    <input
                      type="password"
                      placeholder="New password (min 8 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{ ...inputStyle, fontSize: 13 }}
                      onFocus={(e) => { e.target.style.borderColor = "#f59e0b66"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; }}
                    />
                    {passwordError && (
                      <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{passwordError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="flex items-center justify-center gap-2"
                      style={{
                        padding: "8px 0",
                        borderRadius: 8,
                        background: "#1a1a1a",
                        border: "1px solid #2a2a2a",
                        color: "#f0ede8",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: passwordSaving ? "not-allowed" : "pointer",
                        opacity: passwordSaving ? 0.7 : 1,
                      }}
                    >
                      {passwordSaving && <Loader2 size={12} className="spinner" />}
                      Update password
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* ── Master Resume section ── */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold tracking-tight mb-1" style={{ color: "#f0ede8" }}>
              Master Resume
            </h2>
            <p className="text-sm" style={{ color: "#6b6b6b" }}>
              Your base resume. Every application tailors from this.
            </p>
          </div>

          {/* Current profile info */}
          {profile && !uploadResult && (
            <div
              className="flex items-center gap-3 p-3 rounded-lg mb-6"
              style={{ background: "#111111", border: "1px solid #1f1f1f" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "#1a1a1a" }}
              >
                <FileText size={14} style={{ color: "#22c55e" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#f0ede8" }}>
                  {profile.fileName}
                </p>
                <p className="text-xs" style={{ color: "#6b6b6b" }}>
                  Last updated{" "}
                  {formatDistanceToNow(new Date(profile.updatedAt), { addSuffix: true })}
                </p>
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors shrink-0"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#6b6b6b" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f0ede8"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b6b6b"; }}
              >
                <RefreshCw size={11} />
                Replace
              </button>
            </div>
          )}

          {/* Upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => !uploading && fileRef.current?.click()}
            className="relative rounded-xl flex flex-col items-center justify-center gap-4 p-10 cursor-pointer transition-all"
            style={{
              border: `2px dashed ${dragOver ? "#f59e0b" : uploading ? "#2a2a2a" : "#1f1f1f"}`,
              background: dragOver ? "#1a120008" : "#0d0d0d",
              minHeight: "200px",
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleInputChange}
            />

            {uploading ? (
              <>
                <Loader2 size={28} className="spinner" style={{ color: "#f59e0b" }} />
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: "#f0ede8" }}>Processing resume...</p>
                  <p className="text-xs mt-1" style={{ color: "#6b6b6b" }}>Extracting text</p>
                </div>
              </>
            ) : (
              <>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                  style={{
                    background: dragOver ? "#1a120020" : "#141414",
                    border: `1px solid ${dragOver ? "#f59e0b44" : "#1f1f1f"}`,
                  }}
                >
                  <Upload size={20} style={{ color: dragOver ? "#f59e0b" : "#6b6b6b" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: "#f0ede8" }}>Drop your resume here</p>
                  <p className="text-xs mt-1" style={{ color: "#6b6b6b" }}>or click to browse</p>
                </div>
                <div className="flex gap-2">
                  {["PDF", "DOCX"].map((fmt) => (
                    <span
                      key={fmt}
                      className="text-xs px-2.5 py-1 rounded-full font-mono"
                      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#6b6b6b" }}
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Upload error */}
          {uploadResult && !uploadResult.success && (
            <div
              className="mt-4 flex items-start gap-3 p-3 rounded-lg"
              style={{ background: "#1a050520", border: "1px solid #ef444433" }}
            >
              <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: "#ef4444" }} />
              <p className="text-xs" style={{ color: "#ef4444" }}>{uploadResult.error}</p>
            </div>
          )}

          {/* Success state */}
          {displayProfile && displayProfile.success && (
            <div
              className="mt-4 p-4 rounded-lg space-y-3"
              style={{ background: "#111111", border: "1px solid #1f1f1f" }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} style={{ color: "#22c55e" }} />
                <span className="text-sm font-medium" style={{ color: "#f0ede8" }}>
                  {displayProfile.fileName}
                </span>
              </div>
              {displayProfile.updatedAt && (
                <p className="text-xs" style={{ color: "#6b6b6b" }}>
                  Updated{" "}
                  {formatDistanceToNow(new Date(displayProfile.updatedAt), { addSuffix: true })}
                </p>
              )}
              {displayProfile.preview && (
                <div
                  className="p-3 rounded-lg"
                  style={{ background: "#0d0d0d", border: "1px solid #161616" }}
                >
                  <p className="text-xs font-mono leading-relaxed line-clamp-4" style={{ color: "#6b6b6b" }}>
                    {displayProfile.preview}{displayProfile.preview.length >= 200 ? "..." : ""}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
