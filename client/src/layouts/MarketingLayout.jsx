import { Link, NavLink, Outlet } from "react-router-dom";
import logoMark from "../assets/logo-mark.svg";
import { publicNavigation } from "../constants/navigation";

function MarketingNavigationLink({ item }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-medium ${
          isActive ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-white/80"
        }`
      }
    >
      {item.label}
    </NavLink>
  );
}

export function MarketingLayout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoMark} alt="AHEMS" className="h-11 w-11 rounded-2xl shadow-soft" />
            <div>
              <p className="font-display text-lg font-bold text-slate-950">AHEMS</p>
              <p className="text-xs uppercase tracking-[0.22em] text-brand-muted">Smart Simulation</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-2 lg:flex">
            {publicNavigation.map((item) => (
              <MarketingNavigationLink key={item.path} item={item} />
            ))}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white/80">
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10"
            >
              Launch Platform
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/70 bg-white/75">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-brand-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>Automatic Home Energy Management System. Premium simulation workflows for modern buildings.</p>
          <p>React, Express, MySQL, Docker, and Nginx foundation ready for deployment on port 3002.</p>
        </div>
      </footer>
    </div>
  );
}

