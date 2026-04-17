import { isValidElement } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "./Button";
import { SurfaceCard } from "./SurfaceCard";

export function PageHero({ eyebrow, title, description, primaryAction, secondaryAction, stats }) {
  return (
    <SurfaceCard className="hero-card col-span-12 overflow-hidden p-6 sm:p-8 lg:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.5fr,0.9fr]">
        <div className="space-y-5">
          <span className="inline-flex rounded-full bg-brand-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
            {eyebrow}
          </span>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.8rem]">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-brand-muted sm:text-lg">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {primaryAction && isValidElement(primaryAction) ? primaryAction : null}
            {primaryAction && !isValidElement(primaryAction) ? (
              <Button className="px-5 py-3">
                {primaryAction}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
            {secondaryAction && isValidElement(secondaryAction) ? secondaryAction : null}
            {secondaryAction && !isValidElement(secondaryAction) ? (
              <Button variant="ghost" className="px-5 py-3">
                {secondaryAction}
              </Button>
            ) : null}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {stats?.map((stat) => (
            <div key={stat.label} className="rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-soft">
              <p className="text-sm font-medium text-brand-muted">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-600">{stat.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}
