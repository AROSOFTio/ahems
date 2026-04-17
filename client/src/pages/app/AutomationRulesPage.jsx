import { Moon, ThermometerSun, Users } from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";
import { cn } from "../../utils/cn";

const RULE_DEFS = [
  {
    key: "DARK_LIGHTS_ON",
    title: "If dark → Bulb ON",
    subtitle: "Mirrors: if(digitalRead(A5)==LOW) { digitalWrite(10, HIGH); }",
    icon: Moon,
    hasThreshold: true,
    thresholdLabel: "Light below (%)",
    thresholdKey: "threshold",
    outcome: "Turns Bulb ON at full brightness when LDR reads DARK",
  },
  {
    key: "HIGH_TEMP_FAN",
    title: "If warm → Fan ON",
    subtitle: "Mirrors: if(tempC>30) { digitalWrite(13, HIGH); }",
    icon: ThermometerSun,
    hasThreshold: true,
    thresholdLabel: "Temp above (°C)",
    thresholdKey: "threshold",
    outcome: "Turns Fan ON automatically when temperature exceeds threshold",
  },
  {
    key: "NO_OCCUPANCY_OFF",
    title: "If vacant → Devices OFF",
    subtitle: "Mirrors: Occupancy check in T-T timer loop",
    icon: Users,
    hasThreshold: false,
    outcome: "Turns TV and Bulb OFF when room occupancy sensor reads VACANT",
  },
];

export function AutomationRulesPage() {
  const { state, controls } = useSimulation();

  function handleThresholdChange(ruleKey, rawValue) {
    const value = parseFloat(rawValue);
    if (!isNaN(value)) {
      controls.setRuleThreshold(ruleKey, value);
    }
  }

  return (
    <div className="page-shell">
      {/* Rule cards */}
      <div className="col-span-12 grid gap-6 md:grid-cols-3">
        {RULE_DEFS.map(({ key, title, subtitle, icon: Icon, hasThreshold, thresholdLabel, outcome }) => {
          const rule = state.rules[key];
          const { enabled, firing } = rule;

          return (
            <div key={key} className={cn(
              "relative overflow-hidden rounded-[2rem] p-6 ring-1 shadow-sm flex flex-col gap-5 transition-all",
              enabled
                ? firing
                  ? "bg-brand-primary/5 ring-brand-primary/40 shadow-md"
                  : "bg-white/95 ring-slate-300/50"
                : "bg-white/60 ring-slate-200/40"
            )}>
              {/* Firing indicator */}
              {firing && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-brand-success px-2.5 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Firing</span>
                </div>
              )}

              {/* Icon + title */}
              <div className="flex items-start gap-4">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl shrink-0",
                  enabled && firing ? "bg-brand-primary text-white"
                    : enabled ? "bg-brand-primary/10 text-brand-primary"
                    : "bg-slate-100 text-slate-400"
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display font-bold text-slate-900 leading-tight">{title}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1 leading-relaxed">{subtitle}</p>
                </div>
              </div>

              {/* Threshold input */}
              {hasThreshold && (
                <div className="flex items-center justify-between gap-4 bg-slate-50 rounded-2xl px-4 py-3">
                  <span className="text-sm font-semibold text-slate-600">{thresholdLabel}</span>
                  <input
                    type="number"
                    className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold shadow-sm"
                    defaultValue={rule.threshold}
                    onChange={(e) => handleThresholdChange(key, e.target.value)}
                  />
                </div>
              )}

              {/* Outcome */}
              <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-xl px-4 py-3">
                {outcome}
              </p>

              {/* Toggle button */}
              <button
                onClick={() => controls.setRuleEnabled(key, !enabled)}
                className={cn(
                  "w-full rounded-xl py-3 text-sm font-bold uppercase tracking-widest transition-all mt-auto",
                  enabled
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-brand-primary text-white hover:bg-brand-secondary shadow-md"
                )}
              >
                {enabled ? "Disable Rule" : "Enable Rule"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Automation event log */}
      <div className="col-span-12 rounded-[2rem] bg-white/80 ring-1 ring-slate-200/50 shadow-sm p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Automation Event Log</p>
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {state.log.filter(e => e.message.startsWith("Auto")).slice(0, 15).map((entry, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-2.5">
              <span className="font-mono text-[10px] text-brand-primary shrink-0 mt-0.5">{entry.time}</span>
              <span className="text-sm text-slate-700">{entry.message}</span>
            </div>
          ))}
          {state.log.filter(e => e.message.startsWith("Auto")).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No automation events yet — rules are running…</p>
          )}
        </div>
      </div>
    </div>
  );
}
