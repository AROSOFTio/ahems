import { BellRing, CheckCheck, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { FormField, SelectInput, TextInput } from "../../components/ui/FormField";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHero } from "../../components/ui/PageHero";
import { StatCard } from "../../components/ui/StatCard";
import { StatusPill } from "../../components/ui/StatusPill";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { useAuth } from "../../hooks/useAuth";
import { notificationService } from "../../services/notificationService";
import { formatDateTime, formatNumber, getStatusTone } from "../../utils/format";

export function NotificationsWorkspace({ mode = "app" }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    severity: "",
    isRead: "",
    query: "",
  });

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const payload = await notificationService.list(token, filters);
        if (!ignore) {
          setNotifications(payload);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "Failed to load notifications.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
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
        icon: BellRing,
        label: "Notifications",
        value: formatNumber(notifications.length),
        trend: `${formatNumber(notifications.filter((item) => !item.isRead).length)} unread`,
        tone: "warning",
        helper: "Alerts stay visible without becoming a noisy, oversized module.",
      },
      {
        icon: CheckCheck,
        label: "Read state",
        value: formatNumber(notifications.filter((item) => item.isRead).length),
        trend: "Acknowledged",
        tone: "success",
        helper: "Use this page to mark alerts as addressed and keep the queue current.",
      },
    ],
    [notifications],
  );

  async function handleMarkRead(id) {
    try {
      const updated = await notificationService.markRead(id, token);
      setNotifications((current) => {
        if (filters.isRead === "false") {
          return current.filter((item) => item.id !== updated.id);
        }

        return current.map((item) => (item.id === updated.id ? updated : item));
      });
    } catch (requestError) {
      setError(requestError.message || "Failed to update notification.");
    }
  }

  if (loading) return <LoadingState label="Loading notifications..." />;
  if (error && notifications.length === 0) return <EmptyState title="Notifications unavailable" description={error} />;

  return (
    <div className="page-shell">
      <PageHero
        eyebrow={mode === "admin" ? "Admin notifications" : "Notifications"}
        title="Keep alerts visible and easy to clear."
        description="Review rule triggers, threshold breaches, idle-room events, and other system notifications."
        stats={[
          {
            label: "Unread alerts",
            value: formatNumber(notifications.filter((item) => !item.isRead).length),
            caption: "Unread alerts are surfaced in the topbar and here in the full workspace.",
          },
          {
            label: "Danger severity",
            value: formatNumber(notifications.filter((item) => item.severity === "DANGER").length),
            caption: "High-severity signals are easy to isolate and review.",
          },
        ]}
      />

      <div className="col-span-12 grid gap-5 md:grid-cols-2">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="col-span-12">
        <SurfaceCard className="p-6">
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <FormField label="Search">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                <TextInput
                  value={filters.query}
                  onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
                  className="pl-11"
                  placeholder="Search notifications..."
                />
              </div>
            </FormField>
            <FormField label="Severity">
              <SelectInput value={filters.severity} onChange={(event) => setFilters((current) => ({ ...current, severity: event.target.value }))}>
                <option value="">All severities</option>
                <option value="INFO">Info</option>
                <option value="SUCCESS">Success</option>
                <option value="WARNING">Warning</option>
                <option value="DANGER">Danger</option>
              </SelectInput>
            </FormField>
            <FormField label="Read state">
              <SelectInput value={filters.isRead} onChange={(event) => setFilters((current) => ({ ...current, isRead: event.target.value }))}>
                <option value="">All notifications</option>
                <option value="false">Unread only</option>
                <option value="true">Read only</option>
              </SelectInput>
            </FormField>
          </div>

          <div className="space-y-4">
            {notifications.map((item) => (
              <div key={item.id} className="rounded-[1.75rem] border border-slate-200/70 bg-slate-50/80 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-xl font-bold text-slate-950">{item.title}</h3>
                      <StatusPill tone={getStatusTone(item.severity)}>{item.severity}</StatusPill>
                      {!item.isRead ? <StatusPill tone="warning">Unread</StatusPill> : null}
                    </div>
                    <p className="max-w-3xl text-sm leading-6 text-brand-muted">{item.message}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">{formatDateTime(item.createdAt)}</p>
                  </div>
                  {!item.isRead ? (
                    <Button variant="ghost" onClick={() => void handleMarkRead(item.id)}>
                      Mark as read
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
            {notifications.length === 0 ? (
              <EmptyState
                title="No notifications yet"
                description="Generate activity from rooms, appliances, or the simulation lab to populate this stream."
              />
            ) : null}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
