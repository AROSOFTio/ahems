import { LoaderCircle } from "lucide-react";
import { SurfaceCard } from "./SurfaceCard";

export function LoadingState({ label = "Loading data..." }) {
  return (
    <SurfaceCard className="flex min-h-[240px] flex-col items-center justify-center gap-4 p-10 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
        <LoaderCircle className="h-6 w-6 animate-spin" />
      </div>
      <p className="text-sm font-medium text-brand-muted">{label}</p>
    </SurfaceCard>
  );
}
