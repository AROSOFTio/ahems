import { AlertTriangle, Home, Lightbulb, Sparkles, Users, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CostTrendChart } from "../../components/charts/CostTrendChart";
import { EnergyUsageChart } from "../../components/charts/EnergyUsageChart";
import { OccupancyChart } from "../../components/charts/OccupancyChart";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHero } from "../../components/ui/PageHero";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { StatCard } from "../../components/ui/StatCard";
import { StatusPill } from "../../components/ui/StatusPill";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { useAuth } from "../../hooks/useAuth";
import { analyticsService } from "../../services/analyticsService";
import { formatCurrency, formatNumber, formatPercent, formatTemperature, getStatusTone } from "../../utils/format";

function QuickLinks({ mode }) {
  const actions =
    mode === "admin"
      ? [
          { label: "Review users", to: "/admin/users" },
          { label: "Manage rooms", to: "/admin/rooms" },
          { label: "Open lookups", to: "/admin/categories" },
        ]
      : [
          { label: "Manage rooms", to: "/app/rooms" },
          { label: "Manage appliances", to: "/app/appliances" },
          { label: "Open simulation lab", to: "/app/sensors" },
        ];

  return (
    <SurfaceCard className="p-6">
      <SectionHeader
        title="Quick actions"
        description="Open the main operational modules."
      />
      <div className="mt-6 grid gap-3">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:bg-white"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </SurfaceCard>
  );
}

export function DashboardWorkspace({ mode = "app" }) {
  const { token } = useAuth();
  const [state, setState] = useState({
    dashboard: null,
    energy: null,
    occupancy: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const payload =
          mode === "admin"
            ? await Promise.all([
                analyticsService.getAdminDashboard(token),
                analyticsService.getOccupancy(token),
              ])
            : await Promise.all([
                analyticsService.getDashboard(token),
                analyticsService.getEnergy(token),
                analyticsService.getOccupancy(token),
              ]);

        if (ignore) {
          return;
        }

        if (mode === "admin") {
          setState({
            dashboard: payload[0],
            energy: payload[0].energy,
            occupancy: payload[1],
            loading: false,
            error: "",
          });
          return;
        }

        setState({
          dashboard: payload[0],
          energy: payload[1],
          occupancy: payload[2],
          loading: false,
          error: "",
        });
      } catch (error) {
        if (!ignore) {
          setState((current) => ({
            ...current,
            loading: false,
            error: error.message || "Failed to load dashboard.",
          }));
        }
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [mode, token]);

  const metrics = useMemo(() => {
    const dashboard = state.dashboard;

    if (!dashboard) {
      return [];
    }

    return [
      {
        icon: Home,
        label: "Rooms in scope",
        value: formatNumber(dashboard.totalRooms),
        trend: `${formatNumber(dashboard.occupancySummary?.occupied || 0)} occupied`,
        tone: "info",
        helper: "These are the rooms currently visible to your role and workspace scope.",
      },
      {
        icon: Lightbulb,
        label: "Active devices",
        value: formatNumber(dashboard.activeDevices),
        trend: `${formatNumber(dashboard.autoModeDevices || 0)} auto mode`,
        tone: "success",
        helper: "Device posture blends manual overrides with simulation-driven automation.",
      },
      {
        icon: Zap,
        label: "Estimated cost",
        value: formatCurrency(dashboard.estimatedCost || 0),
        trend: `${formatNumber(dashboard.estimatedEnergyUsage || 0, 2)} kWh`,
        tone: "warning",
        helper: "Projected energy spend is derived from the simulated runtime and tariff baseline.",
      },
      {
        icon: mode === "admin" ? Users : Sparkles,
        label: mode === "admin" ? "Managed users" : "Average temperature",
        value: mode === "admin" ? formatNumber(dashboard.totalUsers || 0) : formatTemperature(dashboard.averageTemperature || 0),
        trend:
          mode === "admin"
            ? `${formatNumber(dashboard.totalLogs || 0)} audit events`
            : `${formatPercent(dashboard.averageLightLevel || 0)} light level`,
        tone: "info",
        helper:
          mode === "admin"
            ? "The command center keeps the main governance metrics in one view."
            : "Comfort conditions are updated from live room values and simulation adjustments.",
      },
    ];
  }, [mode, state.dashboard]);

  const energyChartData = useMemo(
    () =>
      (state.energy?.usageByRoom || []).map((item) => ({
        period: item.name,
        usage: Number(item.usageKwh || 0),
        cost: Number(item.costEstimate || 0),
      })),
    [state.energy],
  );

  const occupancyChartData = useMemo(
    () =>
      state.occupancy.slice(0, 6).map((room) => ({
        name: room.name,
        occupied: room.occupancyState === "OCCUPIED" ? 1 : 0,
        vacant: room.occupancyState === "OCCUPIED" ? 0 : 1,
      })),
    [state.occupancy],
  );

  if (state.loading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (state.error) {
    return <EmptyState title="Dashboard unavailable" description={state.error} />;
  }

  const dashboard = state.dashboard;

  return (
    <div className="page-shell">
      <PageHero
        eyebrow={mode === "admin" ? "Admin control center" : "Simulation overview"}
        title={
          mode === "admin"
            ? "System operations dashboard"
            : "Workspace operations dashboard"
        }
        description={
          mode === "admin"
            ? "Track users, rooms, appliances, alerts, automation activity, and energy performance from one admin view."
            : "Track room health, appliance state, automation activity, alerts, and current energy performance."
        }
        primaryAction={
          <Link to={mode === "admin" ? "/admin/users" : "/app/rooms"}>
            <Button>{mode === "admin" ? "Review users" : "Manage rooms"}</Button>
          </Link>
        }
        secondaryAction={
          <Link to={mode === "admin" ? "/admin/categories" : "/app/sensors"}>
            <Button variant="ghost">{mode === "admin" ? "Open lookups" : "Open simulation lab"}</Button>
          </Link>
        }
        stats={[
          {
            label: "Unread notifications",
            value: formatNumber(dashboard.recentAlerts?.filter((item) => !item.isRead).length || 0),
            caption: "Alerts that still need acknowledgement in the current workspace.",
          },
          {
            label: "Automation signal",
            value: `${formatNumber(dashboard.recentAutomationActions?.length || 0)} recent`,
            caption: "Recent rule and command activity across the current workspace.",
          },
        ]}
      />

      <div className="col-span-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
        <EnergyUsageChart
          data={energyChartData}
          title="Usage by room"
          description="Current room-level usage totals."
        />
        <QuickLinks mode={mode} />
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1fr,1fr]">
        <CostTrendChart
          data={energyChartData}
          title="Cost by room"
          description="Estimated room-level cost totals."
        />
        <OccupancyChart
          data={occupancyChartData}
          title="Occupancy posture"
          description="Occupied and vacant room state distribution."
        />
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
        <SurfaceCard className="p-6">
          <SectionHeader
            title="Recent alerts"
            description="Latest unresolved alerts and rule events."
            action={
              <Link to={mode === "admin" ? "/admin/notifications" : "/app/notifications"}>
                <Button variant="ghost">Open notifications</Button>
              </Link>
            }
          />
          <div className="mt-6 space-y-4">
            {(dashboard.recentAlerts || []).slice(0, 5).map((alert) => (
              <div key={alert.id} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">{alert.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-brand-muted">{alert.message}</p>
                    </div>
                  </div>
                  <StatusPill tone={getStatusTone(alert.severity)}>{alert.severity}</StatusPill>
                </div>
              </div>
            ))}
            {(dashboard.recentAlerts || []).length === 0 ? (
              <EmptyState
                title="No alerts right now"
                description="The current simulation is healthy and there are no unresolved notifications."
              />
            ) : null}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <SectionHeader
            title="Automation activity"
            description="Latest rule and command activity."
          />
          <div className="mt-6 space-y-4">
            {(dashboard.recentAutomationActions || []).slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.action}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-muted">{item.moduleName}</p>
                  </div>
                  <StatusPill tone="info">{item.actorRole || "system"}</StatusPill>
                </div>
              </div>
            ))}
            {(dashboard.recentAutomationActions || []).length === 0 ? (
              <EmptyState
                title="No recent automation actions"
                description="Run a simulation command to populate this panel with live activity."
              />
            ) : null}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
