import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { SurfaceCard } from "../../components/ui/SurfaceCard";

export function ContactPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
      <SurfaceCard className="hero-card p-8">
        <span className="inline-flex rounded-full bg-brand-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
          Contact
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-950">Start planning your AHEMS deployment or product demo.</h1>
        <p className="mt-4 text-base leading-8 text-brand-muted">
          Use this page for product inquiries, implementation scoping, partner conversations, or internal rollout planning.
        </p>
        <div className="mt-8 space-y-4">
          {[
            { icon: Mail, label: "Email", value: "hello@ahems.io" },
            { icon: Phone, label: "Phone", value: "+256 700 000000" },
            { icon: MapPin, label: "Address", value: "Kampala, Uganda" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-4 rounded-[1.5rem] border border-slate-200/70 bg-white/75 p-4">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                  <p className="text-sm text-brand-muted">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-8">
        <h2 className="font-display text-2xl font-bold text-slate-950">Request a product conversation</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Full name</span>
            <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Your name" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Email</span>
            <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="you@example.com" />
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-800">Subject</span>
            <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Project inquiry" />
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-800">Message</span>
            <textarea
              rows="6"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              placeholder="Tell us about your smart energy simulation needs."
            />
          </label>
        </div>
        <div className="mt-6">
          <Button>Send inquiry</Button>
        </div>
      </SurfaceCard>
    </div>
  );
}

