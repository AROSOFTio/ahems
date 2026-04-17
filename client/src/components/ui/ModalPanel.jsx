import { X } from "lucide-react";
import { cn } from "../../utils/cn";

export function ModalPanel({ open, title, description, onClose, children, size = "xl" }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div
        className={cn(
          "relative max-h-[92vh] w-full overflow-y-auto rounded-[2rem] border border-white/80 bg-white p-6 shadow-ambient sm:p-8",
          size === "lg" ? "max-w-3xl" : size === "md" ? "max-w-2xl" : "max-w-5xl",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm"
          aria-label="Close panel"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mb-6 pr-12">
          <h3 className="font-display text-2xl font-bold text-slate-950">{title}</h3>
          {description ? <p className="mt-2 text-sm leading-6 text-brand-muted">{description}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
