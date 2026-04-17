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

  async function handleSubmit(event) {
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
  }

  return (
    <div className="grid min-h-screen gap-6 lg:grid-cols-[0.88fr,1.12fr]">
      <SurfaceCard className="hero-card p-8 sm:p-10">
        <span className="inline-flex rounded-full bg-brand-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-accent">
          Account registration
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-950">Create a new workspace account.</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-brand-muted">
          Register a resident or operator account with immediate access to the AHEMS application shell and protected modules.
        </p>
      </SurfaceCard>

      <SurfaceCard className="p-8 sm:p-10">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-950">Create account</h2>
            <p className="mt-2 text-sm text-brand-muted">Fill in the user details and choose the appropriate role.</p>
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
                autoComplete="name"
                required
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
                placeholder="user@ahems.io"
                autoComplete="email"
                required
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
              autoComplete="new-password"
              minLength={8}
              required
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

          <Button type="submit" className="w-full" disabled={loading || !form.name || !form.email || !form.password}>
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
