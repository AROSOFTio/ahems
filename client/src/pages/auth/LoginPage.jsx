import { AlertCircle, LockKeyhole, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { useAuth } from "../../hooks/useAuth";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50/50 p-4">
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary shadow-sm mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950">AHEMS Portal</h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.1em] text-brand-muted">Energy Savings Simulator</p>
      </div>

      <SurfaceCard className="w-full max-w-md p-8 sm:p-10 shadow-lg">
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
