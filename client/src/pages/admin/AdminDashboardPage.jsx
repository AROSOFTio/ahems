import { Blocks, Shield, Users, Zap } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { PageHero } from "../../components/ui/PageHero";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { StatCard } from "../../components/ui/StatCard";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { StatusPill } from "../../components/ui/StatusPill";
import { CostTrendChart } from "../../components/charts/CostTrendChart";
import { EnergyUsageChart } from "../../components/charts/EnergyUsageChart";
import { energyTrend, logRows, userRows } from "../../constants/mockData";
import { logColumns, userColumns } from "../../constants/pageContent";

const metrics = [
  { icon: Users, label: "Active users", value: "18", trend: "3 operators online", tone: "info", helper: "Account coverage spans admins, residents, and operational staff." },
  { icon: Blocks, label: "Automation rules", value: "21", trend: "96% success", tone: "success", helper: "System-wide automation remains healthy across room and device scopes." },
  { icon: Zap, label: "Projected platform cost", value: "$1,984", trend: "-8% month-on-month", tone: "success", helper: "Simulated optimization is reducing expected spend across managed spaces." },
  { icon: Shield, label: "Audit integrity", value: "98%", trend: "Healthy", tone: "success", helper: "Logs, settings, and identity operations are flowing into the audit design." },
];

export function AdminDashboardPage() {
  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Admin control center"
        title="System-wide operational intelligence for the entire AHEMS simulation estate."
        description="The admin dashboard gives leadership and operators a premium overview of users, rules, costs, reports, alerts, and platform governance."
        primaryAction="Create admin report"
        secondaryAction="Review logs"
        stats={[
          { label: "Managed rooms", value: "24", caption: "Visible across all users and assignments." },
          { label: "Export jobs", value: "35", caption: "Recent CSV and PDF activity in the reporting system." },
        ]}
      />

      <div className="col-span-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
        <EnergyUsageChart
          data={energyTrend}
          title="System energy trend"
          description="Platform-wide usage and efficiency posture as seen from the admin command center."
        />
        <CostTrendChart
          data={energyTrend}
          title="Projected cost trajectory"
          description="Estimated spend trend shaped by tariff settings, automation, and occupancy simulation."
        />
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
        <DataTable
          title="User overview"
          subtitle="Current system users, roles, and assignment scope."
          columns={userColumns}
          rows={userRows}
        />
        <SurfaceCard className="p-6">
          <SectionHeader
            title="Governance checklist"
            description="High-signal operational checkpoints for the platform today."
            action={<Button variant="ghost">Open settings</Button>}
          />
          <div className="mt-6 space-y-4">
            {[
              { title: "Tariff version review", badge: "Due today", tone: "warning", text: "Confirm the next billing-cycle tariff before enabling updated cost projections." },
              { title: "Operator room scopes", badge: "Healthy", tone: "success", text: "All operator assignments remain within approved room boundaries." },
              { title: "Report export backlog", badge: "2 pending", tone: "info", text: "Two scheduled exports are waiting for administrator confirmation." },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-950">{item.title}</h3>
                  <StatusPill tone={item.tone}>{item.badge}</StatusPill>
                </div>
                <p className="mt-2 text-sm leading-6 text-brand-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="col-span-12">
        <DataTable
          title="Recent audit activity"
          subtitle="High-value actions across automation, rooms, and system settings."
          columns={logColumns}
          rows={logRows}
        />
      </div>
    </div>
  );
}
