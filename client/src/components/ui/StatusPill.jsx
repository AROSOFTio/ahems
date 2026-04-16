import { cn } from "../../utils/cn";

const toneClasses = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  warning: "bg-amber-50 text-amber-700 ring-amber-100",
  danger: "bg-rose-50 text-rose-700 ring-rose-100",
  info: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function StatusPill({ children, tone = "neutral", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
        toneClasses[tone] || toneClasses.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}

