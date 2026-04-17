import { AlertCircle, LockKeyhole, UserCircle2, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      await login(form);
      navigate("/app/dashboard");
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-primary via-brand-secondary to-slate-950 p-4">
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 border border-white/20 text-white shadow-soft mb-6 backdrop-blur-md">
          <Zap className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">AHEMS</h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-accent">Energy Module</p>
      </div>

      <SurfaceCard className="w-full max-w-md p-8 sm:p-10 shadow-ambient border-white/10 bg-white/95 backdrop-blur-xl">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error ? (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800">Email</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <UserCircle2 className="h-5 w-5 text-brand-muted" />
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full bg-transparent text-sm"
                placeholder="name@domain.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800">Password</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <LockKeyhole className="h-5 w-5 text-brand-muted" />
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="w-full bg-transparent text-sm"
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          <Button type="submit" className="w-full" disabled={loading || !form.email || !form.password}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </SurfaceCard>
    </div>
  );
}
