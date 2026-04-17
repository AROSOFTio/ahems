import { KeyRound, Save, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { FormField, TextInput } from "../../components/ui/FormField";
import { PageHero } from "../../components/ui/PageHero";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { useAuth } from "../../hooks/useAuth";

export function ProfileWorkspace() {
  const { user, updateProfile, changePassword } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    avatarUrl: user?.avatarUrl || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateProfile(profileForm);
      setMessage("Profile updated successfully.");
    } catch (submissionError) {
      setError(submissionError.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setChangingPassword(true);
    setMessage("");
    setError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirmation must match.");
      setChangingPassword(false);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage("Password changed successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (submissionError) {
      setError(submissionError.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  }

  if (!user) {
    return <EmptyState title="Profile unavailable" description="You need an active session to manage profile settings." />;
  }

  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Profile"
        title="Manage your identity, then get back to the simulation."
        description="This page stays intentionally focused on the essentials: personal details and password security."
        stats={[
          {
            label: "Role",
            value: user.role,
            caption: "Navigation and data access are filtered by this role.",
          },
          {
            label: "Email",
            value: user.email,
            caption: "Your sign-in identity remains fixed and visible throughout the workspace.",
          },
        ]}
      />

      {(message || error) ? (
        <div className="col-span-12">
          <SurfaceCard className={`p-4 ${error ? "border-rose-200 bg-rose-50/70" : "border-emerald-200 bg-emerald-50/70"}`}>
            <p className={`text-sm font-medium ${error ? "text-rose-700" : "text-emerald-700"}`}>{error || message}</p>
          </SurfaceCard>
        </div>
      ) : null}

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1fr,1fr]">
        <SurfaceCard className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">Profile details</h2>
              <p className="text-sm text-brand-muted">Keep your visible workspace identity up to date.</p>
            </div>
          </div>
          <form className="space-y-5" onSubmit={handleProfileSubmit}>
            <FormField label="Full name">
              <TextInput value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} />
            </FormField>
            <FormField label="Phone number">
              <TextInput value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} />
            </FormField>
            <FormField label="Avatar URL" hint="Optional">
              <TextInput value={profileForm.avatarUrl} onChange={(event) => setProfileForm((current) => ({ ...current, avatarUrl: event.target.value }))} />
            </FormField>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">Security</h2>
              <p className="text-sm text-brand-muted">Change your password without leaving the app shell.</p>
            </div>
          </div>
          <form className="space-y-5" onSubmit={handlePasswordSubmit}>
            <FormField label="Current password">
              <TextInput type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} />
            </FormField>
            <FormField label="New password">
              <TextInput type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} />
            </FormField>
            <FormField label="Confirm new password">
              <TextInput type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} />
            </FormField>
            <Button type="submit" disabled={changingPassword}>
              <KeyRound className="h-4 w-4" />
              {changingPassword ? "Updating..." : "Change password"}
            </Button>
          </form>
        </SurfaceCard>
      </div>
    </div>
  );
}
