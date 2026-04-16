import { Bell, Menu, Search, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getRouteTitle } from "../../constants/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useUI } from "../../hooks/useUI";

export function Topbar({ role }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { openSidebar } = useUI();

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:pl-80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 shadow-sm xl:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-muted">{role} portal</p>
            <h1 className="font-display text-xl font-bold text-slate-950">{getRouteTitle(location.pathname)}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm lg:flex">
            <Search className="h-4 w-4 text-brand-muted" />
            <span className="text-sm text-brand-muted">Search modules, rooms, appliances...</span>
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 shadow-sm"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-2 shadow-sm sm:flex">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">{user?.name || "Simulation User"}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">{user?.role || role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}

