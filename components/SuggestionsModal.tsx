"use client";

import { X, TrendingUp, ShieldCheck, ShieldAlert, ArrowRight, MoveRight } from "lucide-react";
import { Job, PhraseEdit, APPLICATION_STATUS_CONFIG } from "@/lib/types";

interface SuggestionsModalProps {
  job: Job | null;
  onClose: () => void;
}

function parseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export function SuggestionsModal({ job, onClose }: SuggestionsModalProps) {
  if (!job) return null;

  const keywordsFound   = parseJSON<string[]>(job.keywordsFound, []);
  const keywordsMissing = parseJSON<string[]>(job.keywordsMissing, []);
  const easyAdditions   = parseJSON<string[]>(job.easyAdditions, []);
  const riskAdditions   = parseJSON<string[]>(job.riskAdditions, []);
  const phrasesToUpdate = parseJSON<PhraseEdit[]>(job.phrasesToUpdate, []);

  const appCfg = APPLICATION_STATUS_CONFIG[job.applicationStatus];

  const atsColorFor = (n: number) =>
    n >= 80 ? "#22c55e" : n >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl pointer-events-auto animate-fade-in"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {/* Header */}
          <div
            className="flex items-start justify-between px-6 py-4 shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div>
              <h2 className="font-semibold text-base" style={{ color: "var(--foreground)" }}>
                {job.companyName}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {job.roleTitle}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* App status badge */}
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5"
                style={{ color: appCfg.color, background: appCfg.bg, border: `1px solid ${appCfg.dot}33` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: appCfg.dot }} />
                {appCfg.label}
              </span>

              {/* ATS scores: before → after */}
              {job.atsScore !== null && (
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={10} style={{ color: "var(--muted)" }} />
                  <span
                    className="font-mono text-xs font-semibold px-2 py-0.5 rounded"
                    style={{
                      color: atsColorFor(job.atsScore),
                      border: `1px solid ${atsColorFor(job.atsScore)}44`,
                      backgroundColor: `${atsColorFor(job.atsScore)}15`,
                    }}
                  >
                    {job.atsScore}
                  </span>
                  {job.atsScoreAfter !== null && (
                    <>
                      <MoveRight size={10} style={{ color: "#4b5563" }} />
                      <span
                        className="font-mono text-xs font-semibold px-2 py-0.5 rounded"
                        style={{
                          color: atsColorFor(job.atsScoreAfter),
                          border: `1px solid ${atsColorFor(job.atsScoreAfter)}44`,
                          backgroundColor: `${atsColorFor(job.atsScoreAfter)}15`,
                        }}
                      >
                        {job.atsScoreAfter}
                      </span>
                    </>
                  )}
                </div>
              )}

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
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* Keywords Found */}
            {keywordsFound.length > 0 && (
              <section>
                <h3 className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                  Keywords Matched
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {keywordsFound.map((kw) => (
                    <span
                      key={kw}
                      className="text-xs px-2 py-0.5 rounded-full font-mono"
                      style={{ color: "#22c55e", background: "#052e1620", border: "1px solid #22c55e33" }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Keywords Missing */}
            {keywordsMissing.length > 0 && (
              <section>
                <h3 className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                  Keywords Missing
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {keywordsMissing.map((kw) => (
                    <span
                      key={kw}
                      className="text-xs px-2 py-0.5 rounded-full font-mono"
                      style={{ color: "#f59e0b", background: "#1a140020", border: "1px solid #f59e0b33" }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Easy Additions */}
            {easyAdditions.length > 0 && (
              <section>
                <h3 className="text-xs font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                  <ShieldCheck size={12} style={{ color: "var(--success)" }} />
                  Easy Additions
                </h3>
                <div className="space-y-2">
                  {easyAdditions.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-lg"
                      style={{ background: "#052e1620", border: "1px solid #22c55e22" }}
                    >
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--success)" }} />
                      <p className="text-sm" style={{ color: "var(--foreground-subtle)" }}>{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Risk Additions */}
            {riskAdditions.length > 0 && (
              <section>
                <h3 className="text-xs font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                  <ShieldAlert size={12} style={{ color: "var(--accent)" }} />
                  Risk Additions
                </h3>
                <div className="space-y-2">
                  {riskAdditions.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-lg"
                      style={{ background: "#1a140020", border: "1px solid #f59e0b22" }}
                    >
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
                      <p className="text-sm" style={{ color: "var(--foreground-subtle)" }}>{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Phrases to Update */}
            {phrasesToUpdate.length > 0 && (
              <section>
                <h3 className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                  Phrases to Update
                </h3>
                <div className="space-y-3">
                  {phrasesToUpdate.map((edit, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg space-y-3"
                      style={{ background: "var(--surface-sunken)", border: "1px solid var(--border)" }}
                    >
                      <span
                        className="inline-block text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{ color: "var(--muted)", background: "var(--surface-elevated)" }}
                      >
                        {edit.section}
                      </span>
                      <div
                        className="p-2.5 rounded text-xs leading-relaxed line-through"
                        style={{ color: "var(--muted)", background: "#2a050510", border: "1px solid #ef444420" }}
                      >
                        {edit.original}
                      </div>
                      <div className="flex justify-center">
                        <ArrowRight size={12} style={{ color: "#4b5563" }} />
                      </div>
                      <div
                        className="p-2.5 rounded text-xs leading-relaxed"
                        style={{ color: "var(--foreground-subtle)", background: "#052e1610", border: "1px solid #22c55e20" }}
                      >
                        {edit.suggested}
                      </div>
                      <p className="text-xs italic" style={{ color: "#4b5563" }}>
                        {edit.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {keywordsFound.length === 0 && keywordsMissing.length === 0 && easyAdditions.length === 0 && riskAdditions.length === 0 && phrasesToUpdate.length === 0 && (
              <p className="text-sm text-center py-12" style={{ color: "var(--muted)" }}>
                No suggestions available yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
