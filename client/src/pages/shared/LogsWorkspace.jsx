import { Activity, Filter, Search, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../../components/ui/DataTable";
import { EmptyState } from "../../components/ui/EmptyState";
import { FormField, SelectInput, TextInput } from "../../components/ui/FormField";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHero } from "../../components/ui/PageHero";
import { StatCard } from "../../components/ui/StatCard";
import { StatusPill } from "../../components/ui/StatusPill";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { useAuth } from "../../hooks/useAuth";
import { analyticsService } from "../../services/analyticsService";
import { formatDateTime, formatNumber, getStatusTone } from "../../utils/format";

export function LogsWorkspace() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    moduleName: "",
    actorRole: "",
    entityType: "",
    query: "",
  });

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const payload = await analyticsService.getAdminLogs(token, filters);
        if (!ignore) setLogs(payload);
      } catch (requestError) {
        if (!ignore) setError(requestError.message || "Failed to load activity logs.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [filters, token]);

  const metrics = useMemo(
    () => [
      {
        icon: Activity,
        label: "Audit events",
        value: formatNumber(logs.length),
        trend: "Recent activity",
        tone: "info",
        helper: "This viewer keeps the audit trail concise and easy to scan.",
      },
      {
        icon: Shield,
        label: "Admin events",
        value: formatNumber(logs.filter((log) => log.actorRole === "admin").length),
        trend: "Governance",
        tone: "warning",
        helper: "Admin actions are separated clearly for governance review.",
      },
      {
        icon: Filter,
        label: "Modules touched",
        value: formatNumber(new Set(logs.map((log) => log.moduleName)).size),
        trend: "Cross-module",
        tone: "success",
        helper: "The module count helps show how events span auth, automation, rooms, and reports.",
      },
    ],
    [logs],
  );

  if (loading) return <LoadingState label="Loading admin activity logs..." />;
  if (error && !logs.length) return <EmptyState title="Activity logs unavailable" description={error} />;

  const columns = [
    {
      key: "action",
      label: "Action",
      render: (_value, row) => (
        <div>
          <p className="font-semibold text-slate-950">{row.action}</p>
          <p className="mt-1 text-xs text-brand-muted">{row.description || "No extra description provided."}</p>
        </div>
      ),
    },
    {
      key: "moduleName",
      label: "Module",
      render: (value) => <StatusPill tone="info">{value}</StatusPill>,
    },
    {
      key: "actorRole",
      label: "Actor role",
      render: (value) => <StatusPill tone={getStatusTone(value)}>{value || "system"}</StatusPill>,
    },
    {
      key: "actorName",
      label: "Actor",
      render: (value, row) => value || row.actorEmail || "System",
    },
    {
      key: "createdAt",
      label: "When",
      render: (value) => formatDateTime(value),
    },
  ];

  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Admin logs"
        title="Scan the activity trail with clean filters and an audit grid."
        description="Review login events, profile changes, rule changes, simulation updates, appliance actions, report activity, and admin actions."
        stats={[
          {
            label: "Latest module",
            value: logs[0]?.moduleName || "Not available",
            caption: "The latest event shows which part of the platform changed most recently.",
          },
          {
            label: "Latest actor",
            value: logs[0]?.actorName || logs[0]?.actorEmail || "System",
            caption: "The current audit stream always shows who initiated the latest change.",
          },
        ]}
      />

      <div className="col-span-12 grid gap-5 md:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="col-span-12">
        <SurfaceCard className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <FormField label="Search">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                <TextInput
                  value={filters.query}
                  onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
                  className="pl-11"
                  placeholder="Search actions or actors..."
                />
              </div>
            </FormField>
            <FormField label="Module">
              <SelectInput value={filters.moduleName} onChange={(event) => setFilters((current) => ({ ...current, moduleName: event.target.value }))}>
                <option value="">All modules</option>
                {["Auth", "Automation", "Commands", "Rooms", "Sensors", "Reports", "Settings", "Notifications"].map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Actor role">
              <SelectInput value={filters.actorRole} onChange={(event) => setFilters((current) => ({ ...current, actorRole: event.target.value }))}>
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="resident">Resident</option>
                <option value="operator">Operator</option>
              </SelectInput>
            </FormField>
            <FormField label="Entity type">
              <SelectInput value={filters.entityType} onChange={(event) => setFilters((current) => ({ ...current, entityType: event.target.value }))}>
                <option value="">All entities</option>
                <option value="user">User</option>
                <option value="room">Room</option>
                <option value="automation_rule">Automation rule</option>
                <option value="automation_rule_run">Automation run</option>
                <option value="device_command">Device command</option>
                <option value="report">Report</option>
              </SelectInput>
            </FormField>
          </div>

          <div className="mt-6">
            <DataTable
              title="Activity log stream"
              subtitle="The newest events always appear at the top for quick review."
              columns={columns}
              rows={logs}
            />
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
