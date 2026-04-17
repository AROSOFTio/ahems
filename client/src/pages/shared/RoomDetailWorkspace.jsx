import { Activity, ArrowLeft, Lightbulb, Pencil, Thermometer, Zap } from "lucide-react";
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
import { roomOccupancyOptions } from "../../constants/options";
import { useAuth } from "../../hooks/useAuth";
import { catalogService } from "../../services/catalogService";
import { roomService } from "../../services/roomService";
import { formatCurrency, formatDateTime, formatNumber, formatPercent, formatTemperature, getStatusTone } from "../../utils/format";

export function RoomDetailWorkspace() {
  const { id } = useParams();
  const { token } = useAuth();
  const [room, setRoom] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [roomPayload, catalogPayload] = await Promise.all([
          roomService.getById(id, token),
          catalogService.getCatalog(token),
        ]);

        if (ignore) {
          return;
        }

        setRoom(roomPayload);
        setRoomTypes(catalogPayload.roomTypes || []);
        setForm({
          name: roomPayload.name || "",
          roomType: roomPayload.roomTypeName || "",
          description: roomPayload.description || "",
          floorLevel: roomPayload.floorLevel || "",
          occupancyState: roomPayload.occupancyState || "VACANT",
          temperature: Number(roomPayload.currentTemperature || 22),
          lightLevel: Number(roomPayload.currentLightLevel || 65),
          thresholds: {
            maxTemp: Number(roomPayload.maxTemperatureThreshold || 25),
            minLight: Number(roomPayload.minLightThreshold || 45),
          },
        });
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "Failed to load room.");
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
    if (!room) {
      return [];
    }

    return [
      {
        icon: Lightbulb,
        label: "Linked appliances",
        value: formatNumber(room.appliances?.length || 0),
        trend: `${formatNumber(
          room.appliances?.filter((item) => ["ON", "DIMMED"].includes(item.status)).length || 0,
        )} active`,
        tone: "info",
        helper: "Every room detail view surfaces attached devices and current room conditions.",
      },
      {
        icon: Thermometer,
        label: "Current temperature",
        value: formatTemperature(room.currentTemperature || 0),
        trend: `Threshold ${formatTemperature(room.maxTemperatureThreshold || 0)}`,
        tone: "warning",
        helper: "Current room temperature and threshold values are shown side by side.",
      },
      {
        icon: Activity,
        label: "Light intensity",
        value: formatPercent(room.currentLightLevel || 0),
        trend: `Floor ${formatPercent(room.minLightThreshold || 0)}`,
        tone: "success",
        helper: "Lighting thresholds stay visible and easy to review.",
      },
      {
        icon: Zap,
        label: "Energy contribution",
        value: formatCurrency(room.energySummary?.totalCost || 0),
        trend: `${formatNumber(room.energySummary?.totalUsageKwh || 0, 2)} kWh`,
        tone: "info",
        helper: "Energy rollup is calculated from the room-linked usage history.",
      },
    ];
  }, [room]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const updated = await roomService.update(
        id,
        {
          ...form,
          temperature: Number(form.temperature),
          lightLevel: Number(form.lightLevel),
          thresholds: {
            maxTemp: Number(form.thresholds.maxTemp),
            minLight: Number(form.thresholds.minLight),
          },
        },
        token,
      );

      setRoom((current) => ({
        ...current,
        ...updated,
      }));
      setEditing(false);
    } catch (submissionError) {
      setError(submissionError.message || "Failed to update room.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState label="Loading room detail..." />;
  }

  if (error && !room) {
    return <EmptyState title="Room detail unavailable" description={error} />;
  }

  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Room detail"
        title={room.name}
        description={room.description || "This room is part of the simulation-ready environment and can be tuned directly from the management workflow."}
        primaryAction={
          <Button onClick={() => setEditing(true)}>
            Edit room
            <Pencil className="h-4 w-4" />
          </Button>
        }
        secondaryAction={
          <Link to="/app/rooms">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4" />
              Back to rooms
            </Button>
          </Link>
        }
        stats={[
          {
            label: "Room type",
            value: room.roomTypeName,
            caption: `${room.floorLevel || "Floor not set"} - ${room.ownerName || "Owner not set"}`,
          },
          {
            label: "Occupancy",
            value: room.occupancyState,
            caption: "The live occupancy state can also be adjusted from the simulation lab.",
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
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">Attached appliances</h2>
              <p className="mt-1 text-sm text-brand-muted">Linked device summary for this room.</p>
            </div>
            <Link to="/app/appliances">
              <Button variant="ghost">Open appliance list</Button>
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {(room.appliances || []).map((appliance) => (
              <Link
                key={appliance.id}
                to={`/app/appliances/${appliance.id}`}
                className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4 transition hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{appliance.name}</p>
                    <p className="text-sm text-brand-muted">{appliance.categoryName}</p>
                  </div>
                  <StatusPill tone={getStatusTone(appliance.status)}>{appliance.status}</StatusPill>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
                  <div className="rounded-2xl bg-white px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Mode</p>
                    <p className="mt-2 font-semibold">{appliance.mode}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Brightness</p>
                    <p className="mt-2 font-semibold">{formatPercent(appliance.brightnessLevel || 0)}</p>
                  </div>
                </div>
              </Link>
            ))}
            {(room.appliances || []).length === 0 ? (
              <EmptyState
                title="No appliances linked yet"
                description="Create an appliance from the appliance module and assign it to this room."
              />
            ) : null}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <h2 className="font-display text-xl font-bold text-slate-950">Recent sensor readings</h2>
          <div className="mt-6 space-y-4">
            {(room.recentReadings || []).map((reading) => (
              <div key={reading.id} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">{reading.readingType}</p>
                  <StatusPill tone="info">{reading.source}</StatusPill>
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-950">
                  {reading.readingType === "TEMPERATURE"
                    ? formatTemperature(reading.readingValue)
                    : reading.readingType === "LIGHT"
                      ? formatPercent(reading.readingValue)
                      : reading.readingValue}
                </p>
                <p className="mt-2 text-sm text-brand-muted">{formatDateTime(reading.recordedAt)}</p>
              </div>
            ))}
            {(room.recentReadings || []).length === 0 ? (
              <EmptyState
                title="No sensor history yet"
                description="Randomize or update simulation values to build a recent-reading trail."
              />
            ) : null}
          </div>
        </SurfaceCard>
      </div>

      <ModalPanel
        open={editing}
        onClose={() => setEditing(false)}
        title={`Edit ${room.name}`}
        description="Fine-tune the room identity, thresholds, and current simulated state."
        size="lg"
      >
        {form ? (
          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <FormField label="Room name">
              <TextInput value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </FormField>

            <FormField label="Room type">
              <SelectInput value={form.roomType} onChange={(event) => setForm((current) => ({ ...current, roomType: event.target.value }))}>
                {roomTypes.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Floor level">
              <TextInput
                value={form.floorLevel}
                onChange={(event) => setForm((current) => ({ ...current, floorLevel: event.target.value }))}
              />
            </FormField>

            <FormField label="Occupancy">
              <SelectInput
                value={form.occupancyState}
                onChange={(event) => setForm((current) => ({ ...current, occupancyState: event.target.value }))}
              >
                {roomOccupancyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Temperature (°C)">
              <TextInput
                type="number"
                step="0.1"
                value={form.temperature}
                onChange={(event) => setForm((current) => ({ ...current, temperature: event.target.value }))}
              />
            </FormField>

            <FormField label="Light level (%)">
              <TextInput
                type="number"
                value={form.lightLevel}
                onChange={(event) => setForm((current) => ({ ...current, lightLevel: event.target.value }))}
              />
            </FormField>

            <FormField label="Max temperature threshold">
              <TextInput
                type="number"
                step="0.1"
                value={form.thresholds.maxTemp}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    thresholds: { ...current.thresholds, maxTemp: event.target.value },
                  }))
                }
              />
            </FormField>

            <FormField label="Minimum light threshold">
              <TextInput
                type="number"
                value={form.thresholds.minLight}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    thresholds: { ...current.thresholds, minLight: event.target.value },
                  }))
                }
              />
            </FormField>

            <FormField label="Description" className="md:col-span-2">
              <TextArea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </FormField>

            <div className="md:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save room"}
              </Button>
            </div>
          </form>
        ) : null}
      </ModalPanel>
    </div>
  );
}
