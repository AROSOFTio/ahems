import { Sun, Thermometer, Users } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";
import { cn } from "../../utils/cn";

const SENSOR_DEFS = [
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    pin: "A2",
    icon: Thermometer,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    getValue: (s) => s.sensors.temperature.toFixed(1),
    getStatus: (s) => s.sensors.temperature > 30 ? { label: "HIGH", tone: "danger" } : { label: "Normal", tone: "ok" },
    getBar: (s) => Math.min(100, ((s.sensors.temperature - 18) / (42 - 18)) * 100),
    barColor: (s) => s.sensors.temperature > 30 ? "bg-rose-500" : "bg-orange-400",
    description: "Analog pin A2. Triggers Fan (pin 13) when > 30°C.",
  },
  {
    key: "light",
    label: "Light (LDR)",
    unit: "%",
    pin: "A5 / D9",
    icon: Sun,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    getValue: (s) => s.sensors.light.toFixed(1),
    getStatus: (s) => s.sensors.light < 40 ? { label: "DARK", tone: "warning" } : { label: "Bright", tone: "ok" },
    getBar: (s) => s.sensors.light,
    barColor: (s) => s.sensors.light < 40 ? "bg-yellow-500" : "bg-green-400",
    description: "LDR on A5. LOW = dark. Triggers Bulb (pin 10) automation.",
  },
  {
    key: "occupancy",
    label: "Occupancy (PIR)",
    unit: "",
    pin: "D9",
    icon: Users,
    iconBg: "bg-brand-primary/10",
    iconColor: "text-brand-primary",
    getValue: (s) => s.sensors.occupancy ? "OCCUPIED" : "VACANT",
    getStatus: (s) => s.sensors.occupancy
      ? { label: "Occupied", tone: "ok" }
      : { label: "Vacant", tone: "idle" },
    getBar: (s) => s.sensors.occupancy ? 100 : 0,
    barColor: () => "bg-brand-primary",
    description: "PIR sensor on D9. Controls TV auto-off via T-T timer logic.",
  },
];

const TONE = {
  danger:  "bg-rose-100 text-rose-700",
  warning: "bg-yellow-100 text-yellow-700",
  ok:      "bg-green-100 text-green-700",
  idle:    "bg-slate-100 text-slate-500",
};

export function SensorsPage() {
  const { state } = useSimulation();

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="col-span-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-success opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-success" />
          </span>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-700">
            Live Sensor Feed — updates every 2s
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">Tick #{state.tick}</span>
      </div>

      {/* Sensor cards */}
      <div className="col-span-12 grid gap-6 md:grid-cols-3">
        {SENSOR_DEFS.map(({ key, label, unit, pin, icon: Icon, iconBg, iconColor, getValue, getStatus, getBar, barColor, description }) => {
          const value = getValue(state);
          const status = getStatus(state);
          const barPct = getBar(state);
          const bColor = barColor(state);

          return (
            <div key={key} className="rounded-[2rem] bg-white/90 ring-1 ring-slate-200/50 shadow-sm p-6 flex flex-col gap-4">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", iconBg)}>
                    <Icon className={cn("h-5 w-5", iconColor)} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{label}</p>
                    <p className="text-[10px] font-mono text-slate-400">Pin: {pin}</p>
                  </div>
                </div>
                <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full", TONE[status.tone])}>
                  {status.label}
                </span>
              </div>

              {/* Value */}
              <div className="text-center py-2">
                <p className="font-display text-5xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  {value}
                  {unit && <span className="text-2xl text-slate-400 ml-1">{unit}</span>}
                </p>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", bColor)}
                  style={{ width: `${clamp(barPct, 0, 100)}%` }}
                />
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
            </div>
          );
        })}
      </div>

      {/* Recent event log */}
      <div className="col-span-12 rounded-[2rem] bg-white/80 ring-1 ring-slate-200/50 shadow-sm p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Sensor Event Log</p>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {state.log.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No events yet — simulation started</p>
          )}
          {state.log.map((entry, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5">
              <span className="font-mono text-[10px] text-slate-400 shrink-0">{entry.time}</span>
              <span className="text-sm text-slate-700">{entry.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
