import { ShieldCheck, UserCog, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../../components/ui/DataTable";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHero } from "../../components/ui/PageHero";
import { StatCard } from "../../components/ui/StatCard";
import { StatusPill } from "../../components/ui/StatusPill";
import { useAuth } from "../../hooks/useAuth";
import { analyticsService } from "../../services/analyticsService";
import { formatDateTime, formatNumber, getStatusTone } from "../../utils/format";

export function UsersAdminWorkspace() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [roleCounts, setRoleCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const payload = await analyticsService.getAdminUsers(token);
        if (!ignore) {
          setUsers(payload.users || []);
          setRoleCounts(payload.countsByRole || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "Failed to load users.");
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
  }, [token]);

  const metrics = useMemo(() => {
    const admins = roleCounts.find((item) => item.roleName === "admin")?.totalUsers || users.filter((user) => user.role === "admin").length;
    const residents = roleCounts.find((item) => item.roleName === "resident")?.totalUsers || users.filter((user) => user.role === "resident").length;
    const operators = roleCounts.find((item) => item.roleName === "operator")?.totalUsers || users.filter((user) => user.role === "operator").length;

    return [
      {
        icon: Users,
        label: "Total users",
        value: formatNumber(users.length),
        trend: `${formatNumber(residents)} residents`,
        tone: "info",
        helper: "User administration stays focused on identity, role, and account state.",
      },
      {
        icon: ShieldCheck,
        label: "Admins",
        value: formatNumber(admins),
        trend: `${formatNumber(operators)} operators`,
        tone: "success",
        helper: "Role segmentation drives route access and module visibility.",
      },
      {
        icon: UserCog,
        label: "Active accounts",
        value: formatNumber(users.filter((user) => user.status === "ACTIVE").length),
        trend: `${formatNumber(users.filter((user) => user.lastLoginAt).length)} signed in`,
        tone: "warning",
        helper: "This panel shows which identities are actually participating in the simulation.",
      },
    ];
  }, [roleCounts, users]);

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (value) => <StatusPill tone={getStatusTone(value)}>{value}</StatusPill>,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusPill tone={getStatusTone(value)}>{value}</StatusPill>,
    },
    {
      key: "lastLoginAt",
      label: "Last login",
      render: (value) => formatDateTime(value),
    },
  ];

  if (loading) return <LoadingState label="Loading user workspace..." />;
  if (error && users.length === 0) return <EmptyState title="User workspace unavailable" description={error} />;

  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Identity administration"
        title="Manage platform users and roles from one clear admin view."
        description="Review identity records, role distribution, account status, and recent sign-in activity."
        stats={[
          {
            label: "Roles in play",
            value: formatNumber(new Set(users.map((user) => user.role)).size),
            caption: "Admin, resident, and operator roles control access to application modules.",
          },
          {
            label: "Active accounts",
            value: formatNumber(users.filter((user) => user.status === "ACTIVE").length),
            caption: "Only active accounts can access protected application routes.",
          },
        ]}
      />

      <div className="col-span-12 grid gap-5 md:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="col-span-12">
        <DataTable
          title="Platform users"
          subtitle="Administrative user list with role, status, and last-login state."
          columns={columns}
          rows={users}
        />
      </div>
    </div>
  );
}
