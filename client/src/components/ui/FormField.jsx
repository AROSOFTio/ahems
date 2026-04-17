import { cn } from "../../utils/cn";

export function FormField({ label, hint, error, children, className }) {
  return (
    <label className={cn("block space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        {hint ? <span className="text-xs text-brand-muted">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
    </label>
  );
}

export function TextInput({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10",
        className,
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-[112px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10",
        className,
      )}
      {...props}
    />
  );
}

export function SelectInput({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
