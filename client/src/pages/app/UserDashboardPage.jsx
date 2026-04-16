import { Activity, Bell, Home, Lightbulb, Thermometer, Zap } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { PageHero } from "../../components/ui/PageHero";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { StatCard } from "../../components/ui/StatCard";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { StatusPill } from "../../components/ui/StatusPill";
import { EnergyUsageChart } from "../../components/charts/EnergyUsageChart";
import { OccupancyChart } from "../../components/charts/OccupancyChart";
import { activityFeed, alertsFeed, energyTrend, occupancyTrend, roomRows } from "../../constants/mockData";
import { roomColumns } from "../../constants/pageContent";

const metrics = [
  { icon: Home, label: "Total rooms", value: "12", trend: "2 added this week", tone: "success", helper: "New spaces are already inheriting default automation thresholds." },
  { icon: Lightbulb, label: "Active devices", value: "19", trend: "68% in auto mode", tone: "info", helper: "Most appliances are currently managed by simulation-aware automation rules." },
  { icon: Thermometer, label: "Avg. temperature", value: "22.5°C", trend: "Comfort range", tone: "success", helper: "Environmental simulation remains within configured target bands." },
  { icon: Zap, label: "Estimated cost", value: "$112", trend: "-8% vs target", tone: "success", helper: "Current room and appliance behavior is tracking below the monthly budget." },
];

const quickActions = [
  "Simulate occupied evening mode",
  "Switch all lighting to AUTO",
  "Review active appliance costs",
  "Export room usage summary",
];

export function UserDashboardPage() {
  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Resident workspace"
        title="Command your simulated smart environment with clarity and confidence."
        description="The resident dashboard blends room intelligence, automation activity, device posture, and cost trends into a clean premium control surface."
        primaryAction="Create automation rule"
        secondaryAction="Run voice command"
        stats={[
          { label: "Automation actions", value: "42", caption: "Executed successfully during the last 24 hours." },
          { label: "Occupancy summary", value: "7 active", caption: "Rooms currently marked as occupied across the household." },
        ]}
      />

      <div className="col-span-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
        <EnergyUsageChart
          data={energyTrend}
          title="Energy and automation trend"
          description="Daily consumption trend aligned with the current resident simulation profile."
        />
        <SurfaceCard className="p-6">
          <SectionHeader
            title="Quick actions"
            description="Common resident workflows surfaced for fast control and testing."
            action={<Button variant="ghost">Manage shortcuts</Button>}
          />
          <div className="mt-6 grid gap-3">
            {quickActions.map((action) => (
              <button
                key={action}
                type="button"
                className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/70 px-4 py-4 text-left text-sm font-semibold text-slate-800 transition hover:bg-white"
              >
                {action}
              </button>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1fr,1fr]">
        <OccupancyChart
          data={occupancyTrend}
          title="Occupancy distribution"
          description="Track occupancy versus vacancy balance across the rooms currently in the resident scope."
        />
        <SurfaceCard className="p-6">
          <SectionHeader
            title="Recent alerts"
            description="Important issues and actions needing attention right now."
            action={<Button variant="ghost">Open notifications</Button>}
          />
          <div className="mt-6 space-y-4">
            {alertsFeed.map((alert) => (
              <div key={alert.title} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">{alert.title}</h3>
                      <p className="text-sm text-brand-muted">{alert.description}</p>
                    </div>
                  </div>
                  <StatusPill tone={alert.severity}>{alert.time}</StatusPill>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
        <DataTable
          title="Room summary"
          subtitle="Current environmental and occupancy posture across resident-managed spaces."
          columns={roomColumns}
          rows={roomRows}
        />
        <SurfaceCard className="p-6">
          <SectionHeader
            title="Automation activity"
            description="Latest rule and command events affecting the current resident environment."
            action={<Button variant="ghost">View logs</Button>}
          />
          <div className="mt-6 space-y-4">
            {activityFeed.map((item) => (
              <div key={`${item.action}-${item.timestamp}`} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">{item.action}</h3>
                      <p className="text-sm leading-6 text-brand-muted">{item.summary}</p>
                    </div>
                  </div>
                  <StatusPill tone="info">{item.timestamp}</StatusPill>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}

