import { AlertCircle, KeyRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { authService } from "../../services/authService";

export function ResetPasswordPage() {
  const [form, setForm] = useState({ token: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const result = await authService.resetPassword({
        token: form.token,
        password: form.password,
      });
      setMessage(result.message);
      setForm({ token: "", password: "", confirmPassword: "" });
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-4xl gap-6">
      <SurfaceCard className="hero-card p-8 sm:p-10">
        <span className="inline-flex rounded-full bg-brand-success/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-success">
          Reset password
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-950">Set a new account password.</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-brand-muted">
          Submit a valid recovery token with the new password to restore access to the platform.
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
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
          ) : null}

          {[
            { key: "token", label: "Reset token", type: "text", autoComplete: "off" },
            { key: "password", label: "New password", type: "password", autoComplete: "new-password" },
            { key: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password" },
          ].map((field) => (
            <label key={field.key} className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">{field.label}</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <KeyRound className="h-5 w-5 text-brand-muted" />
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                  className="w-full bg-transparent text-sm"
                  placeholder={field.label}
                  autoComplete={field.autoComplete}
                  required
                />
              </div>
            </label>
          ))}

          <Button type="submit" disabled={loading || !form.token || !form.password || !form.confirmPassword}>
            {loading ? "Resetting..." : "Reset password"}
          </Button>

          <p className="text-sm text-brand-muted">
            Back to{" "}
            <Link to="/login" className="font-semibold text-brand-primary">
              sign in
            </Link>
          </p>
        </form>
      </SurfaceCard>
    </div>
  );
}
