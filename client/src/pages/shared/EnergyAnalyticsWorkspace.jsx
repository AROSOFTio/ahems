import { BarChart3, Bolt, Gauge, Sparkles, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CostTrendChart } from "../../components/charts/CostTrendChart";
import { EnergyUsageChart } from "../../components/charts/EnergyUsageChart";
import { OccupancyChart } from "../../components/charts/OccupancyChart";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHero } from "../../components/ui/PageHero";
import { StatCard } from "../../components/ui/StatCard";
import { StatusPill } from "../../components/ui/StatusPill";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { useAuth } from "../../hooks/useAuth";
import { analyticsService } from "../../services/analyticsService";
import { formatCurrency, formatNumber } from "../../utils/format";

export function EnergyAnalyticsWorkspace({ mode = "app" }) {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const payload = await analyticsService.getEnergy(token);
        if (!ignore) setAnalytics(payload);
      } catch (requestError) {
        if (!ignore) setError(requestError.message || "Failed to load energy analytics.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [token]);

  const metrics = useMemo(() => {
    if (!analytics) return [];

    return [
      {
        icon: Bolt,
        label: "Total usage",
        value: `${formatNumber(analytics.summary?.totalUsageKwh || 0, 2)} kWh`,
        trend: analytics.summary?.topRoom?.name || "No room leader",
        tone: "success",
        helper: "The usage tile keeps room and appliance consumption visible at a glance.",
      },
      {
        icon: Wallet,
        label: "Estimated cost",
        value: formatCurrency(analytics.summary?.totalCost || 0, analytics.tariff?.currency || "USD"),
        trend: analytics.tariff?.name || "Active tariff",
        tone: "warning",
        helper: "Tariff-based cost estimation is derived directly from the simulated energy logs.",
      },
      {
        icon: Gauge,
        label: "Projected bill",
        value: formatCurrency(analytics.projectedBill || 0, analytics.tariff?.currency || "USD"),
        trend: analytics.summary?.topAppliance?.name || "Top appliance",
        tone: "info",
        helper: "The projected bill extrapolates the current pace into a monthly outlook.",
      },
      {
        icon: BarChart3,
        label: "Tracked periods",
        value: formatNumber(analytics.dailyTrends?.length || 0),
        trend: `${formatNumber(analytics.monthlyTrends?.length || 0)} monthly`,
        tone: "info",
        helper: "Daily, weekly, and monthly views stay responsive across device sizes.",
      },
    ];
  }, [analytics]);

  if (loading) return <LoadingState label="Loading energy analytics..." />;
  if (error && !analytics) return <EmptyState title="Energy analytics unavailable" description={error} />;

  const roomBreakdown = (analytics?.usageByRoom || []).map((item) => ({
    period: item.name,
    usage: Number(item.usageKwh || 0),
    cost: Number(item.costEstimate || 0),
  }));

  const applianceBreakdown = (analytics?.usageByAppliance || []).slice(0, 6).map((item) => ({
    period: item.name,
    usage: Number(item.usageKwh || 0),
    cost: Number(item.costEstimate || 0),
  }));

  const monthlyComparison = (analytics?.monthlyTrends || []).map((item) => ({
    name: item.period,
    usage: Number(item.usageKwh || 0),
    cost: Number(item.costEstimate || 0),
  }));

  return (
    <div className="page-shell">
      <PageHero
        eyebrow={mode === "admin" ? "Executive analytics" : "Energy monitoring"}
        title="Track usage, cost, and projected bills in one analytics workspace."
        description="Review room-level and appliance-level energy insight with tariff-based cost estimation and trend views."
        stats={[
          {
            label: "Top room",
            value: analytics?.summary?.topRoom?.name || "Not available",
            caption: "The room breakdown shows where the largest load is concentrated.",
          },
          {
            label: "Top appliance",
            value: analytics?.summary?.topAppliance?.name || "Not available",
            caption: "Appliance leaders show where the highest cost contribution is coming from.",
          },
        ]}
      />

      <div className="col-span-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1fr,1fr]">
        <EnergyUsageChart
          data={(analytics?.dailyTrends || []).map((item) => ({ period: item.period, usage: Number(item.usageKwh || 0) }))}
          title="Daily usage trend"
          description="Recent energy usage over the last several days."
        />
        <CostTrendChart
          data={(analytics?.weeklyTrends || []).map((item) => ({ period: item.period, cost: Number(item.costEstimate || 0) }))}
          title="Weekly cost trend"
          description="Weekly cost progression using the active tariff configuration."
        />
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1fr,1fr]">
        <EnergyUsageChart data={roomBreakdown} title="Room breakdown" description="Compare how each room contributes to the overall energy posture." />
        <CostTrendChart data={applianceBreakdown} title="Appliance breakdown" description="Compare the top-consuming appliances in the current simulation portfolio." />
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1fr,1fr]">
        <OccupancyChart
          data={monthlyComparison}
          title="Monthly comparison"
          description="A paired bar view comparing monthly usage and cost across recorded history."
          leftKey="usage"
          rightKey="cost"
          leftLabel="Usage"
          rightLabel="Cost"
        />
        <SurfaceCard className="p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">Insights and highlights</h2>
              <p className="text-sm text-brand-muted">Operational highlights generated from live analytics.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {(analytics?.insights || []).map((insight) => (
              <div key={insight} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4">
                <p className="text-sm leading-7 text-slate-700">{insight}</p>
              </div>
            ))}
            <div className="rounded-[1.5rem] border border-slate-200/70 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-950">Active tariff</p>
                <StatusPill tone="success">{analytics?.tariff?.currency || "USD"}</StatusPill>
              </div>
              <p className="mt-2 text-sm text-brand-muted">
                {analytics?.tariff?.name || "No active tariff"} at {formatNumber(analytics?.tariff?.ratePerKwh || 0, 4)} per kWh.
              </p>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
