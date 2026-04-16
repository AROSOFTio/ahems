import { ArrowRight, Bell, Bot, Gauge, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { KpiStrip } from "../../components/ui/KpiStrip";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { alertsFeed, energyTrend } from "../../constants/mockData";

const pillars = [
  {
    icon: Bot,
    title: "Software-only simulation",
    description: "Model temperature, light, occupancy, voice-command behavior, and automation without physical hardware.",
  },
  {
    icon: Gauge,
    title: "Premium analytics cockpit",
    description: "Track energy usage, cost, automation actions, alerts, and room performance through executive-grade dashboards.",
  },
  {
    icon: Bell,
    title: "Rules and alerts at the core",
    description: "Build proactive automations and surface actionable alerts before usage, comfort, or cost thresholds drift.",
  },
];

export function HomePage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <SurfaceCard className="hero-card overflow-hidden p-8 sm:p-10">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex rounded-full bg-brand-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
              Automatic Home Energy Management System
            </span>
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                Premium energy automation simulation for modern homes and smart spaces.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-brand-muted">
                AHEMS delivers a fully web-based smart-home experience with simulated sensing, device control, automation rules,
                energy analytics, cost monitoring, and role-based management.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10"
              >
                Launch the Platform
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/features"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-muted">Live snapshot</p>
                <h2 className="font-display text-2xl font-bold text-slate-950">Simulation outlook</h2>
              </div>
            </div>
            <div className="space-y-3">
              {alertsFeed.map((alert) => (
                <div key={alert.title} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-950">{alert.title}</h3>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">{alert.time}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{alert.description}</p>
                </div>
              ))}
            </div>
          </div>
        </SurfaceCard>
      </section>

      <KpiStrip
        items={[
          { label: "Managed rooms", value: "24", caption: "Simulation-ready room portfolio" },
          { label: "Automation rules", value: "21", caption: "Prioritized and role-aware" },
          { label: "Energy trend", value: `${energyTrend[energyTrend.length - 1].usage} kWh`, caption: "Latest modeled daily usage" },
          { label: "Projected savings", value: "8.4%", caption: "Compared to unmanaged operation" },
        ]}
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;

          return (
            <SurfaceCard key={pillar.title} className="p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold text-slate-950">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">{pillar.description}</p>
            </SurfaceCard>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr,1.15fr]">
        <SurfaceCard className="p-6">
          <span className="inline-flex rounded-full bg-brand-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-accent">
            Premium UX baseline
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold text-slate-950">Built to look like a commercial SaaS product from day one.</h2>
          <p className="mt-4 text-sm leading-7 text-brand-muted">
            The foundation includes polished cards, roomy spacing, premium typography, sticky topbars, side navigation, KPI tiles,
            responsive tables, and dashboard-ready layout scaffolding across mobile and desktop.
          </p>
        </SurfaceCard>
        <div className="grid gap-6 sm:grid-cols-2">
          <SurfaceCard className="p-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold text-slate-950">Energy intelligence</h3>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              View usage by room and appliance, estimate cost, and prepare reporting workflows for CSV and PDF exports.
            </p>
          </SurfaceCard>
          <SurfaceCard className="p-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold text-slate-950">Automation-first workflows</h3>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              Define conditions, actions, priorities, and room scope with a future-proof rules engine and execution history model.
            </p>
          </SurfaceCard>
        </div>
      </section>
    </div>
  );
}

