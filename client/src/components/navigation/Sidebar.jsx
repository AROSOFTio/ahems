import { X } from "lucide-react";
import { NavLink } from "react-router-dom";
import logoMark from "../../assets/logo-mark.svg";
import { adminNavigation, appNavigation } from "../../constants/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useUI } from "../../hooks/useUI";
import { cn } from "../../utils/cn";

function SidebarBody({ role, scope, onNavigate }) {
  const navigation = (scope === "admin" ? adminNavigation : appNavigation).filter(
    (item) => !item.roles || item.roles.includes(role),
  );
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <img src={logoMark} alt="AHEMS" className="h-11 w-11 rounded-2xl shadow-soft" />
        <div>
          <p className="font-display text-lg font-bold text-slate-950">AHEMS</p>
          <p className="text-xs uppercase tracking-[0.22em] text-brand-muted">Automation Suite</p>
        </div>
      </div>

      <div className="mx-4 rounded-[1.75rem] border border-slate-200/70 bg-slate-950 p-5 text-white shadow-ambient">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Active workspace</p>
        <p className="mt-3 font-display text-xl font-bold">
          {role === "admin" ? "Control Center" : role === "operator" ? "Operator Station" : "Resident Console"}
        </p>
        <p className="mt-2 text-sm text-slate-300">
          Signed in as {user?.name || "Simulation user"} with {user?.role || role} permissions.
        </p>
      </div>

      <nav className="mt-6 flex-1 space-y-2 overflow-y-auto px-4 pb-6">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) => cn("sidebar-link", isActive ? "sidebar-link-active" : "")}
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
                <Icon className="h-4 w-4" />
              </span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mx-4 mb-4 rounded-[1.75rem] border border-brand-primary/10 bg-brand-primary/5 p-5">
        <p className="text-sm font-semibold text-slate-900">
          {scope === "admin" ? "Defense-ready focus" : "Simulation engine"}
        </p>
        <p className="mt-2 text-sm text-brand-muted">
          {scope === "admin"
            ? "The workspace is intentionally trimmed to the core story: access, rooms, appliances, automation, reports, and governance."
            : "Temperature, lighting, occupancy, command flows, automation, and reporting are ready for interactive testing."}
        </p>
      </div>
    </div>
  );
}

export function Sidebar({ role, scope }) {
  const { sidebarOpen, closeSidebar } = useUI();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/70 bg-white/75 backdrop-blur xl:block">
        <SidebarBody role={role} scope={scope} />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition xl:hidden",
          sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeSidebar}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 max-w-[88vw] border-r border-white/70 bg-white/95 shadow-ambient backdrop-blur transition-transform duration-300 xl:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex justify-end px-4 pt-4">
          <button
            type="button"
            onClick={closeSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarBody role={role} scope={scope} onNavigate={closeSidebar} />
      </aside>
    </>
  );
}
