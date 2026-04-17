import { BellRing, Cog, Save, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { FormField, TextArea, TextInput } from "../../components/ui/FormField";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHero } from "../../components/ui/PageHero";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { useAuth } from "../../hooks/useAuth";
import { settingsService } from "../../services/settingsService";
import { formatDate, formatNumber } from "../../utils/format";

export function SettingsWorkspace({ mode = "app" }) {
  const { token } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    tariff: {
      name: "",
      ratePerKwh: "",
      peakRatePerKwh: "",
      offPeakRatePerKwh: "",
      currency: "USD",
      effectiveFrom: "",
    },
    defaults: {
      defaultThresholds: "",
      notificationPreferences: "",
      reportDefaults: "",
    },
  });

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const payload = await settingsService.get(token);
        if (ignore) return;

        setSettings(payload);
        setForm({
          tariff: {
            name: payload.activeTariff?.name || "",
            ratePerKwh: payload.activeTariff?.ratePerKwh || "",
            peakRatePerKwh: payload.activeTariff?.peakRatePerKwh || "",
            offPeakRatePerKwh: payload.activeTariff?.offPeakRatePerKwh || "",
            currency: payload.activeTariff?.currency || "USD",
            effectiveFrom: payload.activeTariff?.effectiveFrom ? String(payload.activeTariff.effectiveFrom).slice(0, 10) : "",
          },
          defaults: {
            defaultThresholds: JSON.stringify(payload.defaults?.default_thresholds || {}, null, 2),
            notificationPreferences: JSON.stringify(payload.defaults?.notification_preferences || {}, null, 2),
            reportDefaults: JSON.stringify(payload.defaults?.report_defaults || {}, null, 2),
          },
        });
      } catch (requestError) {
        if (!ignore) setError(requestError.message || "Failed to load settings.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        tariff: {
          name: form.tariff.name,
          ratePerKwh: Number(form.tariff.ratePerKwh),
          peakRatePerKwh: Number(form.tariff.peakRatePerKwh || 0),
          offPeakRatePerKwh: Number(form.tariff.offPeakRatePerKwh || 0),
          currency: form.tariff.currency,
          effectiveFrom: form.tariff.effectiveFrom,
        },
        defaults: {
          default_thresholds: JSON.parse(form.defaults.defaultThresholds || "{}"),
          notification_preferences: JSON.parse(form.defaults.notificationPreferences || "{}"),
          report_defaults: JSON.parse(form.defaults.reportDefaults || "{}"),
        },
      };

      const updated = await settingsService.update(payload, token);
      setSettings(updated);
      setMessage("Settings updated successfully.");
    } catch (requestError) {
      setError(requestError.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Loading settings..." />;
  if (error && !settings) return <EmptyState title="Settings unavailable" description={error} />;

  return (
    <div className="page-shell">
      <PageHero
        eyebrow={mode === "admin" ? "System settings" : "Workspace settings"}
        title={
          mode === "admin"
            ? "Control tariff and platform defaults from one focused settings page."
            : "Review the tariff and policy defaults that shape your workspace."
        }
        description="The settings module is intentionally compact so it supports the defense story without pulling attention away from the live simulation and analytics."
        stats={[
          {
            label: "Tariffs",
            value: formatNumber(settings?.tariffs?.length || 0),
            caption: "Only a small number of tariff plans are needed for the current simulation scope.",
          },
          {
            label: "Active from",
            value: settings?.activeTariff?.effectiveFrom ? formatDate(settings.activeTariff.effectiveFrom) : "Not set",
            caption: "The active tariff date anchors the cost-estimation story.",
          },
        ]}
      />

      {(error || message) ? (
        <div className="col-span-12">
          <SurfaceCard className={`p-4 ${error ? "border-rose-200 bg-rose-50/70" : "border-emerald-200 bg-emerald-50/70"}`}>
            <p className={`text-sm font-medium ${error ? "text-rose-700" : "text-emerald-700"}`}>{error || message}</p>
          </SurfaceCard>
        </div>
      ) : null}

      {mode !== "admin" ? (
        <div className="col-span-12 grid gap-5 xl:grid-cols-3">
          <SurfaceCard className="p-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Wallet className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-slate-950">Active tariff</h2>
            <p className="mt-2 text-sm text-brand-muted">{settings?.activeTariff?.name || "No tariff set"}</p>
            <p className="mt-4 text-3xl font-bold text-slate-950">{settings?.activeTariff?.ratePerKwh || 0}</p>
          </SurfaceCard>
          <SurfaceCard className="p-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <BellRing className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-slate-950">Notification defaults</h2>
            <pre className="mt-4 overflow-auto rounded-2xl bg-slate-50 p-4 text-xs text-slate-700">
              {JSON.stringify(settings?.defaults?.notification_preferences || {}, null, 2)}
            </pre>
          </SurfaceCard>
          <SurfaceCard className="p-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Cog className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-slate-950">Threshold defaults</h2>
            <pre className="mt-4 overflow-auto rounded-2xl bg-slate-50 p-4 text-xs text-slate-700">
              {JSON.stringify(settings?.defaults?.default_thresholds || {}, null, 2)}
            </pre>
          </SurfaceCard>
        </div>
      ) : (
        <div className="col-span-12">
          <SurfaceCard className="p-6">
            <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
              <FormField label="Tariff name">
                <TextInput value={form.tariff.name} onChange={(event) => setForm((current) => ({ ...current, tariff: { ...current.tariff, name: event.target.value } }))} />
              </FormField>
              <FormField label="Currency">
                <TextInput value={form.tariff.currency} onChange={(event) => setForm((current) => ({ ...current, tariff: { ...current.tariff, currency: event.target.value } }))} />
              </FormField>
              <FormField label="Rate per kWh">
                <TextInput type="number" step="0.0001" value={form.tariff.ratePerKwh} onChange={(event) => setForm((current) => ({ ...current, tariff: { ...current.tariff, ratePerKwh: event.target.value } }))} />
              </FormField>
              <FormField label="Peak rate per kWh">
                <TextInput type="number" step="0.0001" value={form.tariff.peakRatePerKwh} onChange={(event) => setForm((current) => ({ ...current, tariff: { ...current.tariff, peakRatePerKwh: event.target.value } }))} />
              </FormField>
              <FormField label="Off-peak rate per kWh">
                <TextInput type="number" step="0.0001" value={form.tariff.offPeakRatePerKwh} onChange={(event) => setForm((current) => ({ ...current, tariff: { ...current.tariff, offPeakRatePerKwh: event.target.value } }))} />
              </FormField>
              <FormField label="Effective from">
                <TextInput type="date" value={form.tariff.effectiveFrom} onChange={(event) => setForm((current) => ({ ...current, tariff: { ...current.tariff, effectiveFrom: event.target.value } }))} />
              </FormField>
              <FormField label="Default thresholds" className="md:col-span-2">
                <TextArea value={form.defaults.defaultThresholds} onChange={(event) => setForm((current) => ({ ...current, defaults: { ...current.defaults, defaultThresholds: event.target.value } }))} />
              </FormField>
              <FormField label="Notification preferences" className="md:col-span-2">
                <TextArea value={form.defaults.notificationPreferences} onChange={(event) => setForm((current) => ({ ...current, defaults: { ...current.defaults, notificationPreferences: event.target.value } }))} />
              </FormField>
              <FormField label="Report defaults" className="md:col-span-2">
                <TextArea value={form.defaults.reportDefaults} onChange={(event) => setForm((current) => ({ ...current, defaults: { ...current.defaults, reportDefaults: event.target.value } }))} />
              </FormField>
              <div className="md:col-span-2 flex justify-end gap-3">
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save settings"}
                </Button>
              </div>
            </form>
          </SurfaceCard>
        </div>
      )}
    </div>
  );
}
