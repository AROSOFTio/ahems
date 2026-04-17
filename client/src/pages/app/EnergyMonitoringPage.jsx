import { Fan, Lightbulb, Tv, Zap } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";
import { APPLIANCES, TARIFF } from "../../simulation/constants";
import { cn } from "../../utils/cn";

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const APPLIANCE_ROW = [
  { key: "BULB", icon: Lightbulb, label: APPLIANCES.BULB.label, watts: APPLIANCES.BULB.watts },
  { key: "TV",   icon: Tv,        label: APPLIANCES.TV.label,   watts: APPLIANCES.TV.watts },
  { key: "FAN",  icon: Fan,       label: APPLIANCES.FAN.label,  watts: APPLIANCES.FAN.watts },
];

export function EnergyMonitoringPage() {
  const { state } = useSimulation();
  const sessionDuration = Date.now() - state.energy.sessionStartTime;

  const totalLoad = APPLIANCE_ROW.reduce((sum, { key, watts }) => {
    const app = state.appliances[key];
    const isOn = app.state === "ON" || app.state === "DIMMED";
    const w = app.state === "DIMMED" ? watts * 0.5 : isOn ? watts : 0;
    return sum + w;
  }, 0);

  return (
    <div className="page-shell">
      {/* Big metric cards row */}
      <div className="col-span-12 grid gap-6 lg:grid-cols-3">
        {/* Total kWh */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-primary to-brand-secondary p-8 text-white shadow-lg flex flex-col justify-end min-h-[220px]">
          <div className="absolute top-6 right-6 opacity-10">
            <Zap className="h-36 w-36" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Total Usage</p>
          <h2 className="font-display text-5xl font-extrabold tracking-tight mt-2 tabular-nums">
            {state.energy.totalKwh.toFixed(4)}
            <span className="text-2xl text-white/60 ml-2">kWh</span>
          </h2>
          <p className="text-xs text-white/50 mt-2 font-mono">Session: {formatDuration(sessionDuration)}</p>
        </div>

        {/* Est. Cost */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-slate-200/50 p-8 shadow-sm flex flex-col justify-end min-h-[220px]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Estimated Cost</p>
          <h2 className="font-display text-5xl font-extrabold tracking-tight mt-2 text-slate-900 tabular-nums">
            {TARIFF.currency} {Math.round(state.energy.costEstimate).toLocaleString()}
          </h2>
          <p className="text-xs text-slate-400 mt-2">@ {TARIFF.ratePerKwh} {TARIFF.currency}/kWh</p>
        </div>

        {/* Active load */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-slate-200/50 p-8 shadow-sm flex flex-col justify-end min-h-[220px]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Active Load</p>
          <h2 className="font-display text-5xl font-extrabold tracking-tight mt-2 text-slate-900 tabular-nums">
            {totalLoad}
            <span className="text-2xl text-slate-400 ml-2">W</span>
          </h2>
          <p className="text-xs text-slate-400 mt-2">Across all active appliances</p>
        </div>
      </div>

      {/* Per-appliance breakdown */}
      <div className="col-span-12 rounded-[2rem] bg-white/80 ring-1 ring-slate-200/50 shadow-sm p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5">Per-Appliance Consumption</p>
        <div className="space-y-4">
          {APPLIANCE_ROW.map(({ key, icon: Icon, label, watts }) => {
            const app = state.appliances[key];
            const isActive = app.state === "ON" || app.state === "DIMMED";
            const effectiveW = app.state === "DIMMED" ? watts * 0.5 : isActive ? watts : 0;
            const kwh = state.energy.perAppliance[key] || 0;
            const cost = kwh * TARIFF.ratePerKwh;
            const pct = state.energy.totalKwh > 0
              ? Math.round((kwh / state.energy.totalKwh) * 100)
              : 0;

            return (
              <div key={key} className="flex items-center gap-4">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
                  isActive ? "bg-brand-primary text-white" : "bg-slate-100 text-slate-400"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-800">{label}</span>
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      {kwh.toFixed(4)} kWh · {TARIFF.currency} {Math.round(cost)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        isActive ? "bg-brand-primary" : "bg-slate-200"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className={cn(
                  "text-xs font-bold tabular-nums w-10 text-right",
                  isActive ? "text-brand-primary" : "text-slate-400"
                )}>
                  {effectiveW}W
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live tick indicator */}
      <div className="col-span-12 flex items-center justify-center gap-2 py-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-success" />
        </span>
        <p className="text-xs text-slate-400 font-mono">Live — updating every 2s · Tick #{state.tick}</p>
      </div>
    </div>
  );
}
