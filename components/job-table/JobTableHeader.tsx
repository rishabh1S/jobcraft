"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Filter } from "lucide-react";
import { APPLICATION_STATUS_CONFIG } from "@/lib/types";

interface JobTableHeaderProps {
  searchInput: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
}

export function JobTableHeader({
  searchInput,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: JobTableHeaderProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  return (
    <div
      className="grid text-xs font-mono uppercase tracking-wider px-4 py-3"
      style={{
        color: "var(--muted)",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-sunken)",
        gridTemplateColumns: "2fr 1.4fr 1fr 0.8fr 0.8fr",
      }}
    >
      {/* Company & Role merged with search */}
      <div className="flex items-center gap-1.5 min-w-0">
        <Search size={11} style={{ color: searchInput ? "var(--foreground)" : "var(--muted)", flexShrink: 0 }} />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Company & Role"
          className="bg-transparent font-mono text-xs normal-case tracking-normal outline-none flex-1 min-w-0 placeholder:text-[color:var(--muted)] placeholder:uppercase placeholder:tracking-wider"
          style={{ color: "var(--foreground)" }}
        />
        {searchInput && (
          <button onClick={() => onSearchChange("")} className="flex-shrink-0">
            <X size={9} style={{ color: "var(--muted)" }} />
          </button>
        )}
      </div>

      {/* Application Status with filter icon + dropdown */}
      <div className="flex items-center gap-1.5 relative" ref={filterRef}>
        <span>Application Status</span>
        <button
          onClick={() => setFilterOpen((o) => !o)}
          className="flex items-center transition-colors"
          title="Filter by status"
        >
          <Filter size={11} style={{ color: statusFilter ? "var(--foreground)" : "var(--muted)" }} />
        </button>
        {filterOpen && (
          <div
            className="absolute top-full left-0 z-20 mt-1 rounded-md overflow-hidden"
            style={{
              background: "var(--surface-elevated, var(--surface))",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}
          >
            {[{ key: "", label: "All statuses" }, ...Object.entries(APPLICATION_STATUS_CONFIG).map(([key, cfg]) => ({ key, label: cfg.label }))].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { onStatusFilterChange(key); setFilterOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-mono normal-case tracking-normal transition-colors hover:bg-white/5"
                style={{ color: statusFilter === key ? "var(--foreground)" : "var(--muted)" }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <span>ATS Score</span>
      <span>Analysis</span>
      <span className="text-right">Actions</span>
    </div>
  );
}
