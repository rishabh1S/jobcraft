"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { Job, ApplicationStatus, Profile } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { StatsRow } from "@/components/StatsRow";
import { JobTable } from "@/components/JobTable";
import { NewApplicationSheet } from "@/components/NewApplicationSheet";
import { SuggestionsModal } from "@/components/SuggestionsModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { CoverLetterModal } from "@/components/CoverLetterModal";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [suggestionsJob, setSuggestionsJob] = useState<Job | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [coverLetterJob, setCoverLetterJob] = useState<Job | null>(null);

  const { data: profileData } = useSWR<{ profile: Profile | null }>("/api/profile", fetcher);
  const profile = profileData?.profile ?? null;

  const { data: jobsData, mutate: mutateJobs } = useSWR<{ jobs: Job[] }>(
    "/api/jobs",
    fetcher,
    {
      refreshInterval: (data) => {
        const jobs = data?.jobs ?? [];
        return jobs.some((j) => j.status === "processing") ? 3000 : 0;
      },
    }
  );
  const jobs = jobsData?.jobs ?? [];

  const handleJobCreated = useCallback(
    async (jobId: string) => {
      const stub: Job = {
        id: jobId,
        jobLink: null,
        jobDescription: "",
        companyName: "Processing...",
        roleTitle: "Processing...",
        status: "processing",
        applicationStatus: "ready_to_apply",
        appliedAt: null,
        atsScore: null,
        atsScoreAfter: null,
        keywordsFound: null,
        keywordsMissing: null,
        easyAdditions: null,
        riskAdditions: null,
        phrasesToUpdate: null,
        coverLetter: null,
        errorMessage: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await mutateJobs(
        (prev) => ({ jobs: [stub, ...(prev?.jobs ?? [])] }),
        { revalidate: true }
      );
    },
    [mutateJobs]
  );

  const handleRetry = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/retry`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Retry failed");
        return;
      }
      await mutateJobs();
      toast.success("Retrying — analysis in progress");
    } catch {
      toast.error("Failed to retry");
    }
  };

  const handleStatusChange = async (jobId: string, status: ApplicationStatus) => {
    await mutateJobs(
      (prev) => ({
        jobs: (prev?.jobs ?? []).map((j) =>
          j.id === jobId ? { ...j, applicationStatus: status } : j
        ),
      }),
      { revalidate: false }
    );
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationStatus: status }),
      });
      if (!res.ok) {
        toast.error("Failed to update status");
        await mutateJobs();
      }
    } catch {
      toast.error("Failed to update status");
      await mutateJobs();
    }
  };

  const handleDelete = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId) ?? null;
    setDeleteTarget(job);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const jobId = deleteTarget.id;
    setDeleteTarget(null);
    await mutateJobs(
      (prev) => ({ jobs: (prev?.jobs ?? []).filter((j) => j.id !== jobId) }),
      { revalidate: false }
    );
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete application");
        await mutateJobs();
      } else {
        toast.success("Application deleted");
      }
    } catch {
      toast.error("Failed to delete");
      await mutateJobs();
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar jobs={jobs} />

      <main className="pt-14 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="pt-8 pb-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
                Applications
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                Track and tailor your job applications with AI
              </p>
            </div>
            <button
              onClick={() => setSheetOpen(true)}
              className="text-sm font-medium px-4 py-2 rounded-full transition-all active:scale-95 shrink-0"
              style={{ background: "#1DB954", color: "#ffffff" }}
            >
              + New Application
            </button>
          </div>

          <StatsRow jobs={jobs} />

          <JobTable
            jobs={jobs}
            onViewSuggestions={setSuggestionsJob}
            onRetry={handleRetry}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onCoverLetter={setCoverLetterJob}
          />
        </div>
      </main>

      <NewApplicationSheet
        open={sheetOpen}
        profile={profile}
        onClose={() => setSheetOpen(false)}
        onJobCreated={handleJobCreated}
      />

      <SuggestionsModal job={suggestionsJob} onClose={() => setSuggestionsJob(null)} />

      <CoverLetterModal
        job={coverLetterJob}
        onClose={() => setCoverLetterJob(null)}
        onGenerated={(jobId, text) => {
          mutateJobs(
            (prev) => ({
              jobs: (prev?.jobs ?? []).map((j) =>
                j.id === jobId ? { ...j, coverLetter: text } : j
              ),
            }),
            { revalidate: false }
          );
          setCoverLetterJob((prev) => prev ? { ...prev, coverLetter: text } : prev);
        }}
      />

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        companyName={deleteTarget?.companyName ?? ""}
        roleTitle={deleteTarget?.roleTitle ?? ""}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
