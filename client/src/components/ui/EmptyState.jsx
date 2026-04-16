import { Sparkles } from "lucide-react";
import { SurfaceCard } from "./SurfaceCard";

export function EmptyState({ title, description }) {
  return (
    <SurfaceCard className="flex flex-col items-center justify-center gap-4 p-10 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-xl font-bold text-slate-950">{title}</h3>
        <p className="max-w-md text-sm text-brand-muted">{description}</p>
      </div>
    </SurfaceCard>
  );
}

