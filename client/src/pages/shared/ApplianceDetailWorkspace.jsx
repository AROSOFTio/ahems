import { ArrowLeft, Gauge, Lightbulb, Pencil, Settings2, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { FormField, SelectInput, TextArea, TextInput } from "../../components/ui/FormField";
import { LoadingState } from "../../components/ui/LoadingState";
import { ModalPanel } from "../../components/ui/ModalPanel";
import { PageHero } from "../../components/ui/PageHero";
import { StatCard } from "../../components/ui/StatCard";
import { StatusPill } from "../../components/ui/StatusPill";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { applianceModeOptions, applianceStatusOptions } from "../../constants/options";
import { useAuth } from "../../hooks/useAuth";
import { applianceService } from "../../services/applianceService";
import { catalogService } from "../../services/catalogService";
import { roomService } from "../../services/roomService";
import { formatCurrency, formatDate, formatDateTime, formatNumber, formatPercent, getStatusTone } from "../../utils/format";

export function ApplianceDetailWorkspace() {
  const { id } = useParams();
  const { token } = useAuth();
  const [appliance, setAppliance] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [appliancePayload, roomPayload, catalogPayload] = await Promise.all([
          applianceService.getById(id, token),
          roomService.list(token),
          catalogService.getCatalog(token),
        ]);

        if (ignore) return;

        setAppliance(appliancePayload);
        setRooms(roomPayload);
        setCategories(catalogPayload.applianceCategories || []);
        setForm({
          roomId: String(appliancePayload.roomId || ""),
          categoryId: String(appliancePayload.categoryId || ""),
          name: appliancePayload.name || "",
          powerRatingWatts: Number(appliancePayload.powerRatingWatts || 0),
          status: appliancePayload.status || "OFF",
          mode: appliancePayload.mode || "MANUAL",
          brightnessLevel: Number(appliancePayload.brightnessLevel || 0),
          runtimeMinutesToday: Number(appliancePayload.runtimeMinutesToday || 0),
          estimatedEnergyKwh: Number(appliancePayload.estimatedEnergyKwh || 0),
          estimatedCost: Number(appliancePayload.estimatedCost || 0),
          notes: appliancePayload.notes || "",
        });
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "Failed to load appliance.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [id, token]);

  const metrics = useMemo(() => {
    if (!appliance) return [];

    return [
      {
        icon: Lightbulb,
        label: "Status",
        value: appliance.status,
        trend: appliance.mode,
        tone: getStatusTone(appliance.status),
        helper: "Device state and control mode stay visible for command simulation demos.",
      },
      {
        icon: Gauge,
        label: "Brightness",
        value: formatPercent(appliance.brightnessLevel || 0),
        trend: `${formatNumber(appliance.powerRatingWatts || 0, 0)}W`,
        tone: "warning",
        helper: "Brightness is tracked separately so dimming commands have a visible impact.",
      },
      {
        icon: Settings2,
        label: "Runtime today",
        value: `${formatNumber(appliance.runtimeMinutesToday || 0)} min`,
        trend: `${formatNumber(appliance.estimatedEnergyKwh || 0, 2)} kWh`,
        tone: "info",
        helper: "Runtime, usage, and cost stay on one line of sight for easy explanation.",
      },
      {
        icon: Zap,
        label: "Estimated cost",
        value: formatCurrency(appliance.estimatedCost || 0),
        trend: appliance.roomName || "Room not assigned",
        tone: "success",
        helper: "Every appliance contributes directly to the room and dashboard cost narrative.",
      },
    ];
  }, [appliance]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await applianceService.update(
        id,
        {
          ...form,
          roomId: Number(form.roomId),
          categoryId: Number(form.categoryId),
          powerRatingWatts: Number(form.powerRatingWatts),
          brightnessLevel: Number(form.brightnessLevel),
          runtimeMinutesToday: Number(form.runtimeMinutesToday),
          estimatedEnergyKwh: Number(form.estimatedEnergyKwh),
          estimatedCost: Number(form.estimatedCost),
        },
        token,
      );

      const detail = await applianceService.getById(id, token);
      setAppliance(detail);
      setEditing(false);
    } catch (submissionError) {
      setError(submissionError.message || "Failed to update appliance.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState label="Loading appliance detail..." />;
  if (error && !appliance) return <EmptyState title="Appliance detail unavailable" description={error} />;

  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Appliance detail"
        title={appliance.name}
        description={appliance.notes || "This appliance is part of the core control story and can be updated, simulated, and commanded from the platform."}
        primaryAction={
          <Button onClick={() => setEditing(true)}>
            Edit appliance
            <Pencil className="h-4 w-4" />
          </Button>
        }
        secondaryAction={
          <Link to="/app/appliances">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4" />
              Back to appliances
            </Button>
          </Link>
        }
        stats={[
          {
            label: "Room assignment",
            value: appliance.roomName,
            caption: `${appliance.categoryName} - ${appliance.mode}`,
          },
          {
            label: "Latest state change",
            value: appliance.lastStateChangedAt ? formatDateTime(appliance.lastStateChangedAt) : "Not recorded",
            caption: "Recent command and update activity is logged below.",
          },
        ]}
      />

      <div className="col-span-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
        <SurfaceCard className="p-6">
          <h2 className="font-display text-xl font-bold text-slate-950">Recent command history</h2>
          <div className="mt-6 space-y-4">
            {(appliance.recentCommands || []).map((command) => (
              <div key={command.id} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{command.commandText}</p>
                    <p className="text-sm text-brand-muted">{command.commandSource}</p>
                  </div>
                  <StatusPill tone={getStatusTone(command.status)}>{command.status}</StatusPill>
                </div>
                <p className="mt-2 text-sm text-brand-muted">{formatDateTime(command.executedAt)}</p>
              </div>
            ))}
            {(appliance.recentCommands || []).length === 0 ? (
              <EmptyState
                title="No command history yet"
                description="Open the simulation lab and run a quick command to populate this activity stream."
              />
            ) : null}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <h2 className="font-display text-xl font-bold text-slate-950">Energy log snapshots</h2>
          <div className="mt-6 space-y-4">
            {(appliance.recentEnergyLogs || []).map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">{formatDate(item.usageDate)}</p>
                  <StatusPill tone="info">{item.source}</StatusPill>
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-950">{formatNumber(item.usageKwh || 0, 2)} kWh</p>
                <p className="mt-2 text-sm text-brand-muted">{formatCurrency(item.costEstimate || 0)}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <ModalPanel open={editing} onClose={() => setEditing(false)} title={`Edit ${appliance.name}`} description="Adjust the assignment, state, mode, brightness, and energy values used throughout the system." size="lg">
        {form ? (
          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <FormField label="Appliance name">
              <TextInput value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </FormField>
            <FormField label="Room">
              <SelectInput value={form.roomId} onChange={(event) => setForm((current) => ({ ...current, roomId: event.target.value }))}>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Category">
              <SelectInput value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Power rating (W)">
              <TextInput type="number" step="0.1" value={form.powerRatingWatts} onChange={(event) => setForm((current) => ({ ...current, powerRatingWatts: event.target.value }))} />
            </FormField>
            <FormField label="Status">
              <SelectInput value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                {applianceStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Mode">
              <SelectInput value={form.mode} onChange={(event) => setForm((current) => ({ ...current, mode: event.target.value }))}>
                {applianceModeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Brightness (%)">
              <TextInput type="number" value={form.brightnessLevel} onChange={(event) => setForm((current) => ({ ...current, brightnessLevel: event.target.value }))} />
            </FormField>
            <FormField label="Runtime today (minutes)">
              <TextInput type="number" value={form.runtimeMinutesToday} onChange={(event) => setForm((current) => ({ ...current, runtimeMinutesToday: event.target.value }))} />
            </FormField>
            <FormField label="Estimated usage (kWh)">
              <TextInput type="number" step="0.01" value={form.estimatedEnergyKwh} onChange={(event) => setForm((current) => ({ ...current, estimatedEnergyKwh: event.target.value }))} />
            </FormField>
            <FormField label="Estimated cost">
              <TextInput type="number" step="0.01" value={form.estimatedCost} onChange={(event) => setForm((current) => ({ ...current, estimatedCost: event.target.value }))} />
            </FormField>
            <FormField label="Notes" className="md:col-span-2">
              <TextArea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
            </FormField>
            <div className="md:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save appliance"}</Button>
            </div>
          </form>
        ) : null}
      </ModalPanel>
    </div>
  );
}
