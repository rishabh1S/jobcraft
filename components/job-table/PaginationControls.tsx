export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1 text-xs font-mono rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: "var(--foreground)", border: "1px solid var(--border)" }}
          onMouseEnter={(e) => { if (currentPage > 1) e.currentTarget.style.borderColor = "var(--border-strong)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
        >
          ← Prev
        </button>

        {pages.map((item, idx) =>
          item === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-xs font-mono" style={{ color: "var(--muted)" }}>
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item as number)}
              className="px-3 py-1 text-xs font-mono rounded transition-colors"
              style={{
                color: item === currentPage ? "var(--foreground)" : "var(--muted)",
                background: item === currentPage ? "var(--surface-elevated, var(--surface))" : "transparent",
                border: `1px solid ${item === currentPage ? "var(--border-strong)" : "var(--border)"}`,
                fontWeight: item === currentPage ? 600 : 400,
              }}
            >
              {item}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 text-xs font-mono rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: "var(--foreground)", border: "1px solid var(--border)" }}
          onMouseEnter={(e) => { if (currentPage < totalPages) e.currentTarget.style.borderColor = "var(--border-strong)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
