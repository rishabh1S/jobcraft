import { ApplicationStatus, APPLICATION_STATUS_CONFIG } from "@/lib/types";

const AUTO_STATUSES = new Set(["ready_to_apply", "ghosted"]);

export function AppStatusDropdown({
  jobId,
  current,
  onChange,
}: {
  jobId: string;
  current: ApplicationStatus;
  onChange: (jobId: string, status: ApplicationStatus) => void;
}) {
  const cfg = APPLICATION_STATUS_CONFIG[current];
  const statuses = Object.keys(APPLICATION_STATUS_CONFIG) as ApplicationStatus[];

  return (
    <div className="relative inline-flex items-center">
      <span
        className="absolute left-2 w-1.5 h-1.5 rounded-full pointer-events-none z-10"
        style={{ backgroundColor: cfg.dot }}
      />
      <select
        value={current}
        onChange={(e) => onChange(jobId, e.target.value as ApplicationStatus)}
        className="appearance-none text-xs font-medium pl-5 pr-2 py-1 rounded-full cursor-pointer outline-none"
        style={{
          color: cfg.color,
          backgroundColor: cfg.bg,
          border: `1px solid ${cfg.dot}44`,
        }}
      >
        {statuses.map((s) => (
          <option
            key={s}
            value={s}
            disabled={AUTO_STATUSES.has(s)}
            style={{ backgroundColor: "var(--surface)", color: APPLICATION_STATUS_CONFIG[s].color }}
          >
            {APPLICATION_STATUS_CONFIG[s].label}
          </option>
        ))}
      </select>
    </div>
  );
}
