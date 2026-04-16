import { AlertCircle, LockKeyhole, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { useAuth } from "../../hooks/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "admin@ahems.io", password: "Admin@12345" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
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
  };

  return (
    <div className="grid min-h-[calc(100vh-9rem)] gap-6 lg:grid-cols-[0.85fr,1.15fr]">
      <SurfaceCard className="hero-card p-8">
        <span className="inline-flex rounded-full bg-brand-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
          Sign in
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-950">Enter the AHEMS simulation workspace.</h1>
        <p className="mt-4 text-base leading-8 text-brand-muted">
          Use one of the demo credentials below to switch between Admin, Resident, and Operator experiences during Phase 1.
        </p>
        <div className="mt-8 space-y-4">
          {[
            "Admin: admin@ahems.io / Admin@12345",
            "Resident: resident@ahems.io / Resident@12345",
            "Operator: operator@ahems.io / Operator@12345",
          ].map((credential) => (
            <div key={credential} className="rounded-[1.5rem] border border-slate-200/70 bg-white/75 p-4 text-sm text-slate-700">
              {credential}
            </div>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-950">Welcome back</h2>
            <p className="mt-2 text-sm text-brand-muted">Secure sign-in with role-aware routing and JWT-backed session setup.</p>
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
                placeholder="admin@ahems.io"
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
              />
            </div>
          </label>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in to AHEMS"}
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-brand-muted">
            <Link to="/forgot-password" className="font-semibold text-brand-primary">
              Forgot password?
            </Link>
            <span>
              Need access?{" "}
              <Link to="/register" className="font-semibold text-brand-primary">
                Create an account
              </Link>
            </span>
          </div>
        </form>
      </SurfaceCard>
    </div>
  );
}

