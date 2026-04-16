import { AlertCircle, Mail, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { useAuth } from "../../hooks/useAuth";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "resident",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await register(form);
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
        <span className="inline-flex rounded-full bg-brand-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-accent">
          Create account
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-950">Provision a new AHEMS user workspace.</h1>
        <p className="mt-4 text-base leading-8 text-brand-muted">
          New Resident and Operator accounts can be created here, with role-aware navigation and secure session handling from the start.
        </p>
      </SurfaceCard>

      <SurfaceCard className="p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-950">Get started</h2>
            <p className="mt-2 text-sm text-brand-muted">Set up an account that can immediately access the Phase 1 platform shell.</p>
          </div>

          {error ? (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ) : null}

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Full name</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <User className="h-5 w-5 text-brand-muted" />
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full bg-transparent text-sm"
                placeholder="Amina Kato"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Email</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Mail className="h-5 w-5 text-brand-muted" />
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full bg-transparent text-sm"
                placeholder="you@example.com"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              placeholder="Create a strong password"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Role</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-brand-muted" />
              <select
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                className="w-full bg-transparent text-sm"
              >
                <option value="resident">Resident</option>
                <option value="operator">Operator</option>
              </select>
            </div>
          </label>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>

          <p className="text-sm text-brand-muted">
            Already have access?{" "}
            <Link to="/login" className="font-semibold text-brand-primary">
              Sign in
            </Link>
          </p>
        </form>
      </SurfaceCard>
    </div>
  );
}

