import { Bell, ChevronDown, Menu, Search, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getRouteTitle } from "../../constants/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useUI } from "../../hooks/useUI";
import { notificationService } from "../../services/notificationService";
import { formatDateTime } from "../../utils/format";

export function Topbar({ role, scope }) {
  const location = useLocation();
  const { token, user, logout } = useAuth();
  const { openSidebar } = useUI();
  const [notifications, setNotifications] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    let ignore = false;

    async function loadNotifications() {
      if (!token) {
        return;
      }

      try {
        const items = await notificationService.list(token);

        if (!ignore) {
          setNotifications(items);
        }
      } catch {
        if (!ignore) {
          setNotifications([]);
        }
      }
    }

    void loadNotifications();

    return () => {
      ignore = true;
    };
  }, [location.pathname, token]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }

      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

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
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-muted">
              {scope === "admin" ? "Admin portal" : role === "operator" ? "Operator workspace" : "Resident workspace"}
            </p>
            <h1 className="font-display text-xl font-bold text-slate-950">{getRouteTitle(location.pathname)}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm lg:flex">
            <Search className="h-4 w-4 text-brand-muted" />
            <span className="text-sm text-brand-muted">Search modules, rooms, appliances, reports...</span>
          </div>
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((current) => !current);
                setMenuOpen(false);
              }}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 shadow-sm"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute right-2 top-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 mt-3 w-[22rem] rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-ambient">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Notifications</p>
                    <p className="text-xs text-brand-muted">Latest alerts and simulation activity.</p>
                  </div>
                  <Link to={scope === "admin" ? "/admin/notifications" : "/app/notifications"} className="text-sm font-semibold text-brand-primary">
                    View all
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {notifications.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-xs leading-5 text-brand-muted">{item.message}</p>
                        </div>
                        {!item.isRead ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-primary" /> : null}
                      </div>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-brand-muted">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                  ))}
                  {notifications.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-brand-muted">
                      No notifications yet.
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setMenuOpen((current) => !current);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-2 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                {scope === "admin" ? <ShieldCheck className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-950">{user?.name || "Simulation User"}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">{user?.role || role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-brand-muted" />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 mt-3 w-56 rounded-[1.75rem] border border-slate-200/80 bg-white p-3 shadow-ambient">
                <Link
                  to={scope === "admin" ? "/admin/dashboard" : "/app/profile"}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserRound className="h-4 w-4" />
                  {scope === "admin" ? "Admin dashboard" : "Profile settings"}
                </Link>
                <Link
                  to={scope === "admin" ? "/admin/notifications" : "/app/notifications"}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="mt-1 flex w-full items-center gap-3 rounded-2xl bg-slate-950 px-3 py-3 text-left text-sm font-semibold text-white"
                >
                  Sign Out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
