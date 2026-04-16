import { AlertCircle, Mail, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { authService } from "../../services/authService";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("resident@ahems.io");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const result = await authService.forgotPassword({ email });
      setMessage(result.message);
      setResetToken(result.resetToken);
    } catch (submissionError) {
      setError(submissionError.message);
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-3xl gap-6">
      <SurfaceCard className="hero-card p-8">
        <span className="inline-flex rounded-full bg-brand-warning/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-warning">
          Password recovery
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-950">Generate a secure reset token for the AHEMS simulation API.</h1>
        <p className="mt-4 text-base leading-8 text-brand-muted">
          In Phase 1, password recovery returns a simulation token so the reset flow can be demonstrated end to end.
        </p>
      </SurfaceCard>

      <SurfaceCard className="p-8">
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
              {resetToken ? <p className="font-mono text-xs text-emerald-800">{resetToken}</p> : null}
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
                placeholder="resident@ahems.io"
              />
            </div>
          </label>

          <Button type="submit">Request reset token</Button>

          <p className="text-sm text-brand-muted">
            Ready to continue?{" "}
            <Link to="/reset-password" className="font-semibold text-brand-primary">
              Go to reset form
            </Link>
          </p>
        </form>
      </SurfaceCard>
    </div>
  );
}

