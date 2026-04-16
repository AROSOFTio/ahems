import { cn } from "../../utils/cn";

const variants = {
  primary:
    "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:bg-[#2e3aa2]",
  secondary:
    "bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800",
  ghost: "bg-white/70 text-slate-700 ring-1 ring-slate-200 hover:bg-white",
  subtle: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  danger: "bg-brand-danger text-white hover:bg-red-500",
};

export function Button({
  children,
  className,
  type = "button",
  variant = "primary",
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

