import { Fan, Lightbulb, Timer, Tv } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";
import { APPLIANCES } from "../../simulation/constants";
import { cn } from "../../utils/cn";

const APPLIANCE_DEFS = [
  {
    key: "BULB",
    icon: Lightbulb,
    label: APPLIANCES.BULB.label,
    watts: APPLIANCES.BULB.watts,
    pin: "Pin 10",
    controls: [
      { label: "BULB ON",  action: (c) => c.bulbOn(),  style: "primary", voice: "Voice: BULB" },
      { label: "DIM 50%",  action: (c) => c.bulbDim(), style: "secondary", voice: "Voice: DIM" },
      { label: "BULB OFF", action: (c) => c.bulbOff(), style: "danger",  voice: "Voice: B-OFF" },
    ],
  },
  {
    key: "TV",
    icon: Tv,
    label: APPLIANCES.TV.label,
    watts: APPLIANCES.TV.watts,
    pin: "Pin 6",
    controls: [
      { label: "TV ON",    action: (c) => c.tvOn(),    style: "primary",   voice: "Voice: TV" },
      { label: "TV OFF",   action: (c) => c.tvOff(),   style: "danger",    voice: "Voice: T-OFF" },
      { label: "30s TIMER",action: (c) => c.tvTimer(), style: "secondary", voice: "Voice: T-T" },
    ],
  },
  {
    key: "FAN",
    icon: Fan,
    label: APPLIANCES.FAN.label,
    watts: APPLIANCES.FAN.watts,
    pin: "Pin 13",
    controls: [],  // Fan is auto-only — no manual override in Arduino code
    autoOnly: true,
  },
];

const BTN_STYLE = {
  primary:   "bg-brand-primary text-white hover:bg-brand-secondary",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  danger:    "bg-rose-50 text-rose-700 hover:bg-rose-100 ring-1 ring-rose-200",
};

const STATE_COLOR = {
  ON:     "bg-brand-primary text-white shadow-lg shadow-brand-primary/30",
  DIMMED: "bg-yellow-400 text-white shadow-md",
  OFF:    "bg-slate-100 text-slate-400",
};

export function AppliancesPage() {
  const { state, controls } = useSimulation();

  return (
    <div className="page-shell">
      <div className="col-span-12 grid gap-6 md:grid-cols-3">
        {APPLIANCE_DEFS.map(({ key, icon: Icon, label, watts, pin, controls: appControls, autoOnly }) => {
          const app = state.appliances[key];
          const isActive = app.state === "ON" || app.state === "DIMMED";
          const effectiveW = app.state === "DIMMED" ? watts * 0.5 : isActive ? watts : 0;
          const tvTimer = key === "TV" ? state.tvTimer : null;

          return (
            <div key={key} className={cn(
              "rounded-[2rem] p-6 ring-1 shadow-sm flex flex-col gap-5 transition-all",
              isActive
                ? "bg-white/95 ring-brand-primary/30 shadow-md"
                : "bg-white/70 ring-slate-200/50"
            )}>
              {/* Icon + state badge */}
              <div className="flex items-center justify-between">
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl transition-all",
                  STATE_COLOR[app.state] || STATE_COLOR.OFF
                )}>
                  <Icon className="h-7 w-7" />
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full",
                  isActive ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-100 text-slate-500"
                )}>
                  {app.state}
                </span>
              </div>

              {/* Name + info */}
              <div>
                <p className="font-display text-xl font-bold text-slate-900">{label}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-mono text-slate-400">{pin}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className={cn(
                    "text-sm font-bold tabular-nums",
                    isActive ? "text-brand-primary" : "text-slate-400"
                  )}>
                    {effectiveW}W
                  </span>
                </div>
              </div>

              {/* TV Timer indicator */}
              {key === "TV" && tvTimer?.active && (
                <div className="flex items-center gap-2 rounded-xl bg-yellow-50 ring-1 ring-yellow-200 px-4 py-2.5">
                  <Timer className="h-4 w-4 text-yellow-600 animate-pulse" />
                  <span className="text-xs font-bold text-yellow-700">
                    {tvTimer.phase === "ON_PHASE"
                      ? `ON for ${Math.ceil(tvTimer.remainingSec)}s more`
                      : `Checking occupancy: ${Math.ceil(tvTimer.remainingSec)}s`}
                  </span>
                </div>
              )}

              {/* Auto-only notice */}
              {autoOnly && (
                <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-4 py-3 text-center">
                  <p className="text-xs text-slate-500 font-semibold">Auto-controlled only</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Triggers automatically when temp &gt; 30°C</p>
                </div>
              )}

              {/* Control buttons */}
              {appControls.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  {appControls.map(({ label: btnLabel, action, style, voice }) => (
                    <button
                      key={btnLabel}
                      onClick={() => action(controls)}
                      className={cn(
                        "w-full rounded-xl py-2.5 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-between px-4",
                        BTN_STYLE[style]
                      )}
                    >
                      <span>{btnLabel}</span>
                      <span className="font-mono opacity-50 text-[10px]">{voice}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Event log */}
      <div className="col-span-12 rounded-[2rem] bg-white/80 ring-1 ring-slate-200/50 shadow-sm p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Command Log</p>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {state.log.filter(e => e.message.startsWith("Manual")).slice(0, 10).map((entry, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5">
              <span className="font-mono text-[10px] text-slate-400 shrink-0">{entry.time}</span>
              <span className="text-sm text-slate-700">{entry.message}</span>
            </div>
          ))}
          {state.log.filter(e => e.message.startsWith("Manual")).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No commands issued yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
