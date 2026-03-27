"use client";

import { FileText } from "lucide-react";
import { Job, ApplicationStatus } from "@/lib/types";
import { JobTableHeader } from "./job-table/JobTableHeader";
import { JobRow } from "./job-table/JobRow";
import { PaginationControls } from "./job-table/PaginationControls";

interface JobTableProps {
  jobs: Job[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  searchInput: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  onViewSuggestions: (job: Job) => void;
  onRetry: (jobId: string) => void;
  onStatusChange: (jobId: string, status: ApplicationStatus) => void;
  onDelete: (jobId: string) => void;
  onCoverLetter: (job: Job) => void;
}

export function JobTable({
  jobs, currentPage, totalPages, onPageChange,
  searchInput, onSearchChange, statusFilter, onStatusFilterChange,
  onViewSuggestions, onRetry, onStatusChange, onDelete, onCoverLetter,
}: JobTableProps) {
  const isFiltered = !!searchInput || !!statusFilter;

  if (jobs.length === 0) {
    return (
      <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <JobTableHeader
          searchInput={searchInput}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
        />
        <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <FileText size={28} style={{ color: "var(--border-strong)" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {isFiltered ? "No applications match your search." : "No applications yet. Add your first job."}
          </p>
          {isFiltered && (
            <button
              onClick={() => { onSearchChange(""); onStatusFilterChange(""); }}
              className="text-xs font-mono transition-colors"
              style={{ color: "var(--accent)" }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <JobTableHeader
        searchInput={searchInput}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
      />
      {jobs.map((job, i) => (
        <JobRow
          key={job.id}
          job={job}
          isLast={i === jobs.length - 1}
          onViewSuggestions={onViewSuggestions}
          onRetry={onRetry}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onCoverLetter={onCoverLetter}
        />
      ))}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
