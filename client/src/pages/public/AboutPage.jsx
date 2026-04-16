import { CheckCircle2, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { SurfaceCard } from "../../components/ui/SurfaceCard";

const values = [
  {
    icon: Sparkles,
    title: "Simulation over hardware",
    description: "AHEMS stays faithful to home-energy automation while replacing embedded devices with pure software simulation.",
  },
  {
    icon: Layers3,
    title: "Full-stack product thinking",
    description: "The platform is structured as a real production web application with frontend, backend, database, and deployment layers.",
  },
  {
    icon: ShieldCheck,
    title: "Security and governance",
    description: "JWT auth, role-based access, protected routes, audit logging, and environment-driven configuration are part of the base design.",
  },
];

export function AboutPage() {
  return (
    <div className="space-y-8">
      <SurfaceCard className="hero-card p-8 sm:p-10">
        <span className="inline-flex rounded-full bg-brand-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
          About AHEMS
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-950">A premium simulation platform for energy-aware automation design.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-brand-muted">
          AHEMS helps teams design, monitor, and demonstrate smart energy behaviors entirely in the browser. It brings together
          simulated sensing, rule-driven automation, device control, analytics, and operational oversight in one polished interface.
        </p>
      </SurfaceCard>

      <div className="grid gap-6 lg:grid-cols-3">
        {values.map((value) => {
          const Icon = value.icon;

          return (
            <SurfaceCard key={value.title} className="p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold text-slate-950">{value.title}</h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">{value.description}</p>
            </SurfaceCard>
          );
        })}
      </div>

      <SurfaceCard className="p-8">
        <h2 className="font-display text-3xl font-bold text-slate-950">What this foundation already establishes</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            "Responsive public, auth, app, and admin route structure",
            "Premium visual language with design tokens and dashboard shells",
            "REST API layout with controllers, services, validators, and middleware",
            "MySQL schema for core operational entities",
            "Docker and Nginx deployment layout targeting port 3002",
            "Git-ready monorepo structure for clean team workflows",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-[1.5rem] border border-slate-200/70 bg-slate-50/70 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand-success" />
              <p className="text-sm leading-7 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}

