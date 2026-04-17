import { Activity, Flame, Lightbulb, ThermometerSun, Users, Zap } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";
import { TARIFF } from "../../simulation/constants";
import { cn } from "../../utils/cn";

const METRIC_CARDS = [
  {
    key: "temperature",
    label: "Temperature",
    icon: ThermometerSun,
    color: "text-orange-600",
    bg: "bg-orange-50",
    format: (s) => `${s.sensors.temperature.toFixed(1)} °C`,
    sub: (s) => s.sensors.temperature > 30 ? "⚠ Above threshold" : "Normal range",
    alert: (s) => s.sensors.temperature > 30,
  },
  {
    key: "light",
    label: "Light Level",
    icon: Activity,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    format: (s) => `${s.sensors.light.toFixed(1)} %`,
    sub: (s) => s.sensors.light < 40 ? "Dark — bulb eligible" : "Sufficient light",
    alert: (s) => s.sensors.light < 40,
  },
  {
    key: "occupancy",
    label: "Occupancy",
    icon: Users,
    color: "text-brand-primary",
    bg: "bg-brand-primary/10",
    format: (s) => s.sensors.occupancy ? "Occupied" : "Vacant",
    sub: () => "PIR sensor",
    alert: () => false,
  },
  {
    key: "bulb",
    label: "Smart Bulb",
    icon: Lightbulb,
    color: "text-purple-600",
    bg: "bg-purple-50",
    format: (s) => s.appliances.BULB.state,
    sub: (s) => `${s.appliances.BULB.state === "DIMMED" ? "30" : s.appliances.BULB.state === "ON" ? "60" : "0"} W active`,
    alert: () => false,
  },
  {
    key: "energy",
    label: "Session Energy",
    icon: Zap,
    color: "text-brand-primary",
    bg: "bg-brand-primary/10",
    format: (s) => `${s.energy.totalKwh.toFixed(3)} kWh`,
    sub: () => "This session",
    alert: () => false,
  },
  {
    key: "cost",
    label: "Est. Cost",
    icon: Flame,
    color: "text-rose-600",
    bg: "bg-rose-50",
    format: (s) => `${TARIFF.currency} ${s.energy.costEstimate.toFixed(0)}`,
    sub: (s) => `@ ${TARIFF.ratePerKwh}/kWh`,
    alert: () => false,
  },
];

export function UserDashboardPage() {
  const { state } = useSimulation();

  return (
    <div className="page-shell">
      {/* Live indicator */}
      <div className="col-span-12 flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-success opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-success" />
        </span>
        <p className="text-sm font-bold uppercase tracking-widest text-slate-600">
          Live Simulation — Tick #{state.tick}
        </p>
      </div>

      {/* Metric tiles */}
      <div className="col-span-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {METRIC_CARDS.map(({ key, label, icon: Icon, color, bg, format, sub, alert }) => {
          const isAlert = alert(state);
          return (
            <div
              key={key}
              className={cn(
                "relative overflow-hidden rounded-[2rem] p-6 ring-1 transition-all",
                isAlert
                  ? "bg-rose-50 ring-rose-300 shadow-md"
                  : "bg-white/80 ring-slate-200/50 shadow-sm"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", bg)}>
                  <Icon className={cn("h-6 w-6", color)} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
                  <p className="text-2xl font-extrabold tracking-tight text-slate-900">{format(state)}</p>
                  <p className={cn("text-xs font-semibold mt-0.5", isAlert ? "text-rose-600" : "text-slate-400")}>
                    {sub(state)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Appliance power strip */}
      <div className="col-span-12 rounded-[2rem] bg-white/80 ring-1 ring-slate-200/50 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Active Load</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: "BULB", label: "Bulb", watts: 60 },
            { key: "TV",   label: "TV",   watts: 120 },
            { key: "FAN",  label: "Fan",  watts: 75 },
          ].map(({ key, label, watts }) => {
            const app = state.appliances[key];
            const isOn = app.state === "ON" || app.state === "DIMMED";
            const effectiveW = app.state === "DIMMED" ? watts * 0.5 : isOn ? watts : 0;
            return (
              <div key={key} className={cn(
                "flex flex-col items-center justify-center rounded-2xl py-5 gap-2 transition-all",
                isOn ? "bg-brand-primary text-white shadow-lg" : "bg-slate-100 text-slate-400"
              )}>
                <p className="text-xs font-bold uppercase tracking-widest">{label}</p>
                <p className="text-xl font-extrabold">{effectiveW}W</p>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                  isOn ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                )}>{app.state}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
