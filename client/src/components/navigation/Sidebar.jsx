import { X, Zap } from "lucide-react";
import { NavLink } from "react-router-dom";
import { navigation } from "../../constants/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useUI } from "../../hooks/useUI";
import { cn } from "../../utils/cn";

function SidebarBody({ onNavigate }) {
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-center px-5 py-6">
        <img src="/logo.png" alt="AHEMS Logo" className="w-48 h-auto object-contain drop-shadow-sm" />
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
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, closeSidebar } = useUI();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/70 bg-white/75 backdrop-blur xl:block">
        <SidebarBody />
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
        <SidebarBody onNavigate={closeSidebar} />
      </aside>
    </>
  );
}
