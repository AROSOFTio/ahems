import { ArrowUpRight } from "lucide-react";
import { SurfaceCard } from "./SurfaceCard";
import { StatusPill } from "./StatusPill";

export function StatCard({ icon: Icon, label, value, trend, tone = "info", helper }) {
  return (
    <SurfaceCard className="metric-glow p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/10">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-muted">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
          </div>
        </div>
        {trend ? <StatusPill tone={tone}>{trend}</StatusPill> : null}
      </div>
      {helper ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
          <ArrowUpRight className="h-4 w-4 text-brand-primary" />
          <span>{helper}</span>
        </div>
      ) : null}
    </SurfaceCard>
  );
}

