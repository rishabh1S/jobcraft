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
  Lock,
} from "lucide-react";
import { Profile } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { Avatar } from "@/components/Avatar";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";

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

  // Password modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

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

  const displayProfile = uploadResult?.success ? uploadResult : profile ? {
    success: true,
    fileName: profile.fileName,
    preview: profile.resumeText.slice(0, 200),
    updatedAt: profile.updatedAt,
  } : null;

  const nameInputStyle: React.CSSProperties = {
    padding: "6px 10px",
    background: "var(--surface-sunken)",
    border: "1px solid var(--border-strong)",
    borderRadius: 8,
    color: "var(--foreground)",
    fontSize: 13,
    outline: "none",
    flex: 1,
    minWidth: 0,
  };

  return (
    <div className="min-h-screen">
      {/* Minimal nav */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6"
        style={{
          background: "var(--navbar-bg)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-mono text-sm font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
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
            style={{ color: "var(--muted)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--foreground)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--muted)"; }}
          >
            <ArrowLeft size={12} />
            Back to dashboard
          </Link>

          <h1 className="text-xl font-semibold tracking-tight mb-6" style={{ color: "var(--foreground)" }}>
            Profile
          </h1>

          {/* ── Unified card ── */}
          <div
            className="rounded-xl overflow-hidden mb-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            {/* Avatar + name + email */}
            <div className="flex items-center gap-4 p-5">
              <Avatar name={user?.name} image={user?.image} size={52} />
              <div className="flex-1 min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      style={nameInputStyle}
                      onFocus={(e) => { e.target.style.borderColor = "color-mix(in srgb, var(--accent) 40%, transparent)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "var(--border-strong)"; }}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") { setEditingName(false); setNameValue(user?.name ?? ""); }
                      }}
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
                        flexShrink: 0,
                      }}
                    >
                      {nameSaving ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => { setEditingName(false); setNameValue(user?.name ?? ""); }}
                      style={{ fontSize: 12, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                      {user?.name ?? "—"}
                    </p>
                    <button
                      onClick={() => { setEditingName(true); setNameValue(user?.name ?? ""); }}
                      style={{ fontSize: 11, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
                    >
                      Edit
                    </button>
                  </div>
                )}
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Resume row */}
            {profile && !uploadResult && (
              <>
                <div style={{ height: 1, background: "var(--border)" }} />
                <div className="flex items-center gap-3 px-5 py-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--surface-elevated)" }}
                  >
                    <FileText size={14} style={{ color: "var(--success)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                      {profile.fileName}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Last updated{" "}
                      {formatDistanceToNow(new Date(profile.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors shrink-0"
                    style={{ background: "var(--surface-elevated)", border: "1px solid var(--border-strong)", color: "var(--muted)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
                  >
                    <RefreshCw size={11} />
                    Replace
                  </button>
                </div>
              </>
            )}

            {/* Change password row — credentials users only */}
            {hasPassword && (
              <>
                <div style={{ height: 1, background: "var(--border)" }} />
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Lock size={13} style={{ color: "var(--muted)" }} />
                    <span className="text-xs" style={{ color: "var(--muted)" }}>Password</span>
                  </div>
                  <button
                    onClick={() => setPasswordModalOpen(true)}
                    className="text-xs transition-colors"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
                  >
                    Change password →
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => !uploading && fileRef.current?.click()}
            className="relative rounded-xl flex flex-col items-center justify-center gap-4 p-10 cursor-pointer transition-all"
            style={{
              border: `2px dashed ${dragOver ? "var(--accent)" : uploading ? "var(--border-strong)" : "var(--border)"}`,
              background: dragOver ? "color-mix(in srgb, var(--accent) 5%, transparent)" : "var(--surface-sunken)",
              minHeight: "180px",
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
                <Loader2 size={28} className="spinner" style={{ color: "var(--accent)" }} />
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Processing resume...</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Extracting text</p>
                </div>
              </>
            ) : (
              <>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                  style={{
                    background: dragOver ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "var(--surface-sunken)",
                    border: `1px solid ${dragOver ? "color-mix(in srgb, var(--accent) 27%, transparent)" : "var(--border)"}`,
                  }}
                >
                  <Upload size={20} style={{ color: dragOver ? "var(--accent)" : "var(--muted)" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {profile ? "Replace resume" : "Upload your resume"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>PDF or DOCX — drop here or click to browse</p>
                </div>
                <div className="flex gap-2">
                  {["PDF", "DOCX"].map((fmt) => (
                    <span
                      key={fmt}
                      className="text-xs px-2.5 py-1 rounded-full font-mono"
                      style={{ background: "var(--surface-elevated)", border: "1px solid var(--border-strong)", color: "var(--muted)" }}
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
              <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: "var(--error)" }} />
              <p className="text-xs" style={{ color: "var(--error)" }}>{uploadResult.error}</p>
            </div>
          )}

          {/* Success state */}
          {displayProfile && displayProfile.success && (
            <div
              className="mt-4 p-4 rounded-lg space-y-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  {displayProfile.fileName}
                </span>
              </div>
              {displayProfile.updatedAt && (
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  Updated{" "}
                  {formatDistanceToNow(new Date(displayProfile.updatedAt), { addSuffix: true })}
                </p>
              )}
              {displayProfile.preview && (
                <div
                  className="p-3 rounded-lg"
                  style={{ background: "var(--surface-sunken)", border: "1px solid var(--border)" }}
                >
                  <p className="text-xs font-mono leading-relaxed line-clamp-4" style={{ color: "var(--muted)" }}>
                    {displayProfile.preview}{displayProfile.preview.length >= 200 ? "..." : ""}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
}
