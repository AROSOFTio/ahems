import { AlertCircle, Mail, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { authService } from "../../services/authService";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await authService.forgotPassword({ email });
      setMessage(result.message);
      setResetToken(result.resetToken);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-4xl gap-6">
      <SurfaceCard className="hero-card p-8 sm:p-10">
        <span className="inline-flex rounded-full bg-brand-warning/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-warning">
          Password recovery
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-950">Request a reset token.</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-brand-muted">
          Enter the account email address to generate a recovery token. In this deployment the token is returned in-app for direct reset handling.
        </p>
      </SurfaceCard>

      <SurfaceCard className="p-8 sm:p-10">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error ? (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ) : null}

          {message ? (
            <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-4 w-4" />
                <span>{message}</span>
              </div>
              {resetToken ? <p className="break-all rounded-xl bg-white/80 px-3 py-3 font-mono text-xs text-emerald-800">{resetToken}</p> : null}
            </div>
          ) : null}

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Account email</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Mail className="h-5 w-5 text-brand-muted" />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-transparent text-sm"
                placeholder="user@ahems.io"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <div className="flex flex-wrap justify-between gap-3">
            <Button type="submit" disabled={loading || !email}>
              {loading ? "Requesting..." : "Request reset token"}
            </Button>
            <Link to="/reset-password" className="inline-flex items-center rounded-2xl px-2 py-3 text-sm font-semibold text-brand-primary">
              Open reset form
            </Link>
          </div>
        </form>
      </SurfaceCard>
    </div>
  );
}
