import { AlertCircle, LockKeyhole, ShieldCheck, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { useAuth } from "../../hooks/useAuth";

const initialAccounts = [
  { role: "Admin", email: "admin@ahems.io", password: "Admin@12345" },
  { role: "Resident", email: "resident@ahems.io", password: "Resident@12345" },
  { role: "Operator", email: "operator@ahems.io", password: "Operator@12345" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login(form);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/app/dashboard");
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen gap-6 lg:grid-cols-[0.9fr,1.1fr]">
      <SurfaceCard className="hero-card p-8 sm:p-10">
        <span className="inline-flex rounded-full bg-brand-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
          Platform access
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-950">Sign in to AHEMS.</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-brand-muted">
          Access room operations, automation rules, analytics, alerts, reports, and system administration from one controlled workspace.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/80 p-5">
            <ShieldCheck className="h-5 w-5 text-brand-primary" />
            <p className="mt-4 text-sm font-semibold text-slate-950">Role-aware access</p>
            <p className="mt-2 text-sm leading-6 text-brand-muted">Admin, resident, and operator views stay separated by protected routing.</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/80 p-5">
            <ShieldCheck className="h-5 w-5 text-brand-accent" />
            <p className="mt-4 text-sm font-semibold text-slate-950">Operational modules</p>
            <p className="mt-2 text-sm leading-6 text-brand-muted">Rooms, appliances, simulation, automation, reporting, and logs are available after sign-in.</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/80 p-5">
            <ShieldCheck className="h-5 w-5 text-brand-success" />
            <p className="mt-4 text-sm font-semibold text-slate-950">JWT sessions</p>
            <p className="mt-2 text-sm leading-6 text-brand-muted">Authentication is backed by the API and restored automatically on reload.</p>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-slate-200/70 bg-white/80 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Initial accounts</p>
              <p className="mt-1 text-sm text-brand-muted">Use these seeded accounts after first deployment.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {initialAccounts.map((account) => (
              <div key={account.role} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold text-slate-950">{account.role}</p>
                <p className="mt-2 text-sm text-brand-muted">{account.email}</p>
                <p className="mt-1 font-mono text-xs text-slate-700">{account.password}</p>
              </div>
            ))}
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-8 sm:p-10">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-950">Welcome back</h2>
            <p className="mt-2 text-sm text-brand-muted">Enter your account credentials to open the workspace.</p>
          </div>

          {error ? (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ) : null}

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Email</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <UserCircle2 className="h-5 w-5 text-brand-muted" />
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full bg-transparent text-sm"
                placeholder="name@company.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Password</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <LockKeyhole className="h-5 w-5 text-brand-muted" />
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="w-full bg-transparent text-sm"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          <Button type="submit" className="w-full" disabled={loading || !form.email || !form.password}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-brand-muted">
            <Link to="/forgot-password" className="font-semibold text-brand-primary">
              Forgot password?
            </Link>
            <span>
              Need an account?{" "}
              <Link to="/register" className="font-semibold text-brand-primary">
                Register
              </Link>
            </span>
          </div>
        </form>
      </SurfaceCard>
    </div>
  );
}
