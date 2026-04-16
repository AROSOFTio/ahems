import { Bell, ChartBar, Home, Shield, SlidersHorizontal, Zap } from "lucide-react";
import { SurfaceCard } from "../../components/ui/SurfaceCard";

const features = [
  { icon: Home, title: "Room orchestration", description: "Manage rooms, occupancy state, room type, thresholds, and assigned appliances." },
  { icon: SlidersHorizontal, title: "Sensor simulation", description: "Model temperature, light, occupancy, time-of-day, and randomized scenarios." },
  { icon: Zap, title: "Device control", description: "Switch appliances on or off, manage auto mode, dim lighting, and run bulk actions." },
  { icon: Shield, title: "Automation rules", description: "Create prioritized conditions and actions with execution history and trigger logs." },
  { icon: Bell, title: "Alerts and notifications", description: "Surface threshold breaches, abnormal usage, idle-room events, and monthly target overruns." },
  { icon: ChartBar, title: "Analytics and reporting", description: "Track usage, cost, trends, exports, and executive-ready dashboards." },
];

export function FeaturesPage() {
  return (
    <div className="space-y-8">
      <SurfaceCard className="hero-card p-8 sm:p-10">
        <span className="inline-flex rounded-full bg-brand-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-accent">
          Feature overview
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-950">Every core AHEMS module is already represented in the Phase 1 foundation.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-brand-muted">
          The interface and route system are prepared for authentication, room management, device simulation, automation, monitoring,
          reporting, notifications, settings, and full administrative control.
        </p>
      </SurfaceCard>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <SurfaceCard key={feature.title} className="p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold text-slate-950">{feature.title}</h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">{feature.description}</p>
            </SurfaceCard>
          );
        })}
      </div>
    </div>
  );
}

