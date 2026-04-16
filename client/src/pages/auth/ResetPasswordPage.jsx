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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
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
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-3xl gap-6">
      <SurfaceCard className="hero-card p-8">
        <span className="inline-flex rounded-full bg-brand-success/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-success">
          Reset password
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-950">Complete the reset flow with the generated simulation token.</h1>
        <p className="mt-4 text-base leading-8 text-brand-muted">
          This screen demonstrates the full recovery path using the token returned from the API in the forgot-password flow.
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
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
          ) : null}

          {[
            { key: "token", label: "Reset token", type: "text" },
            { key: "password", label: "New password", type: "password" },
            { key: "confirmPassword", label: "Confirm password", type: "password" },
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
                />
              </div>
            </label>
          ))}

          <Button type="submit">Reset password</Button>

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

