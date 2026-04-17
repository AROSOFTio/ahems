import { Flame, Home, Lightbulb, ThermometerSun, Users, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CostTrendChart } from "../../components/charts/CostTrendChart";
import { EnergyUsageChart } from "../../components/charts/EnergyUsageChart";
import { LoadingState } from "../../components/ui/LoadingState";
import { StatCard } from "../../components/ui/StatCard";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { useAuth } from "../../hooks/useAuth";
import { analyticsService } from "../../services/analyticsService";
import { formatCurrency, formatNumber, formatPercent, formatTemperature } from "../../utils/format";

export function UserDashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [dashboard, energy] = await Promise.all([
          analyticsService.getDashboard(token),
          analyticsService.getEnergy(token),
        ]);
        if (!ignore) {
          setData({ dashboard, energy });
        }
      } catch {
        // Fallback for demo/empty state as requested
        if (!ignore) setData({ dashboard: {}, energy: {} });
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
    if (!data?.dashboard) return [];
    const { dashboard } = data;
    return [
      {
        icon: ThermometerSun,
        label: "Temperature",
        value: formatTemperature(dashboard.averageTemperature || 0),
        tone: "warning",
      },
      {
        icon: SparklesIcon,
        label: "Light Level",
        value: formatPercent(dashboard.averageLightLevel || 0),
        tone: "info",
      },
      {
        icon: Users,
        label: "Occupancy",
        value: formatNumber(dashboard.occupancySummary?.occupied || 0),
        tone: "success",
      },
      {
        icon: Lightbulb,
        label: "Active Appliances",
        value: formatNumber(dashboard.activeDevices || 0),
        tone: "warning",
      },
      {
        icon: Zap,
        label: "Energy Usage",
        value: `${formatNumber(dashboard.estimatedEnergyUsage || 0, 2)} kWh`,
        tone: "info",
      },
      {
        icon: Flame,
        label: "Estimated Cost",
        value: formatCurrency(dashboard.estimatedCost || 0),
        tone: "danger",
      },
    ];
  }, [data]);

  const energyChartData = useMemo(() => {
    return (data?.energy?.usageByRoom || []).map((item) => ({
      period: item.name,
      usage: Number(item.usageKwh || 0),
      cost: Number(item.costEstimate || 0),
    }));
  }, [data]);

  if (loading) return <LoadingState />;

  return (
    <div className="page-shell">
      <div className="col-span-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-2">
        <SurfaceCard className="p-6">
          <EnergyUsageChart data={energyChartData} />
        </SurfaceCard>
        <SurfaceCard className="p-6">
          <CostTrendChart data={energyChartData} />
        </SurfaceCard>
      </div>
    </div>
  );
}

function SparklesIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
