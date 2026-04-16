import { Activity, Blocks, Home, Lightbulb, Shield, SlidersHorizontal, Users, Zap } from "lucide-react";
import { energyTrend, occupancyTrend } from "../../constants/mockData";
import { CostTrendChart } from "../charts/CostTrendChart";
import { EnergyUsageChart } from "../charts/EnergyUsageChart";
import { OccupancyChart } from "../charts/OccupancyChart";
import { Button } from "./Button";
import { DataTable } from "./DataTable";
import { PageHero } from "./PageHero";
import { SectionHeader } from "./SectionHeader";
import { StatCard } from "./StatCard";
import { SurfaceCard } from "./SurfaceCard";
import { StatusPill } from "./StatusPill";

const iconMap = {
  Home,
  Lightbulb,
  Users,
  Activity,
  Zap,
  Shield,
  Blocks,
  SlidersHorizontal,
};

export function ModuleWorkspace({ content }) {
  return (
    <div className="page-shell">
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        primaryAction={content.primaryAction}
        secondaryAction={content.secondaryAction}
        stats={content.heroStats}
      />

      <div className="col-span-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {content.metrics.map((metric) => {
          const Icon = iconMap[metric.icon] || Activity;
          return (
            <StatCard
              key={metric.label}
              icon={Icon}
              label={metric.label}
              value={metric.value}
              trend={metric.trend}
              tone={metric.tone}
              helper={metric.helper}
            />
          );
        })}
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
        <EnergyUsageChart
          data={energyTrend}
          title={content.chartTitle}
          description={content.chartDescription}
        />
        <SurfaceCard className="p-6">
          <SectionHeader
            title="Operational highlights"
            description={content.highlightDescription}
            action={<Button variant="ghost">Configure</Button>}
          />
          <div className="mt-6 space-y-4">
            {content.highlights.map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-slate-950">{item.title}</h3>
                  <StatusPill tone={item.tone}>{item.badge}</StatusPill>
                </div>
                <p className="mt-2 text-sm leading-6 text-brand-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-2">
        <OccupancyChart
          data={occupancyTrend}
          title="Occupancy and coverage"
          description="Read the balance between occupied and vacant periods across monitored spaces."
        />
        <CostTrendChart
          data={energyTrend}
          title="Estimated cost trajectory"
          description="Track how appliance behavior and rule tuning influence projected spend."
        />
      </div>

      <div className="col-span-12">
        <DataTable
          title={content.tableTitle}
          subtitle={content.tableSubtitle}
          columns={content.columns}
          rows={content.rows}
        />
      </div>
    </div>
  );
}

