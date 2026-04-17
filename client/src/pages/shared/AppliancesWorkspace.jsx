import { Gauge, Lightbulb, Plus, Search, Settings2, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
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
import { formatCurrency, formatNumber, formatPercent, getStatusTone } from "../../utils/format";

const emptyForm = {
  roomId: "",
  categoryId: "",
  name: "",
  powerRatingWatts: 0,
  status: "OFF",
  mode: "MANUAL",
  brightnessLevel: 0,
  runtimeMinutesToday: 0,
  estimatedEnergyKwh: 0,
  estimatedCost: 0,
  notes: "",
};

export function AppliancesWorkspace({ mode = "app" }) {
  const { token, user } = useAuth();
  const [appliances, setAppliances] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [roomFilter, setRoomFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [appliancePayload, roomPayload, catalogPayload] = await Promise.all([
          applianceService.list(token),
          roomService.list(token),
          catalogService.getCatalog(token),
        ]);

        if (ignore) return;

        setAppliances(appliancePayload);
        setRooms(roomPayload);
        setCategories(catalogPayload.applianceCategories || []);
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "Failed to load appliances.");
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
  }, [token]);

  const filteredAppliances = useMemo(
    () =>
      appliances.filter((appliance) => {
        const matchesSearch =
          !search ||
          [appliance.name, appliance.roomName, appliance.categoryName]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search.toLowerCase()));

        return (
          matchesSearch &&
          (statusFilter === "ALL" || appliance.status === statusFilter) &&
          (modeFilter === "ALL" || appliance.mode === modeFilter) &&
          (roomFilter === "ALL" || String(appliance.roomId) === roomFilter)
        );
      }),
    [appliances, modeFilter, roomFilter, search, statusFilter],
  );

  const metrics = useMemo(() => {
    const activeCount = appliances.filter((item) => ["ON", "DIMMED"].includes(item.status)).length;
    const autoCount = appliances.filter((item) => item.mode === "AUTO").length;
    const totalCost = appliances.reduce((sum, item) => sum + Number(item.estimatedCost || 0), 0);

    return [
      {
        icon: Lightbulb,
        label: "Appliances",
        value: formatNumber(appliances.length),
        trend: `${formatNumber(filteredAppliances.length)} visible`,
        tone: "info",
        helper: "The device inventory stays focused on the fields that matter in daily operation.",
      },
      {
        icon: Zap,
        label: "Active state",
        value: formatNumber(activeCount),
        trend: `${formatNumber(autoCount)} auto mode`,
        tone: "success",
        helper: "Status and mode stay visible so manual and automated control are easy to explain.",
      },
      {
        icon: Gauge,
        label: "Average brightness",
        value: appliances.length
          ? formatPercent(appliances.reduce((sum, item) => sum + Number(item.brightnessLevel || 0), 0) / appliances.length)
          : "0%",
        trend: "Live control posture",
        tone: "warning",
        helper: "Brightness is included so dimming commands produce clear, visual state changes.",
      },
      {
        icon: Settings2,
        label: "Estimated cost",
        value: formatCurrency(totalCost || 0),
        trend: `${formatNumber(
          appliances.reduce((sum, item) => sum + Number(item.estimatedEnergyKwh || 0), 0),
          2,
        )} kWh`,
        tone: "info",
        helper: "Cost contribution is shown per device, not hidden in later-phase reports.",
      },
    ];
  }, [appliances, filteredAppliances.length]);

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Appliance",
        render: (_value, row) => (
          <div>
            <Link
              to={mode === "admin" ? "/admin/appliances" : `/app/appliances/${row.id}`}
              className="font-semibold text-slate-900 hover:text-brand-primary"
            >
              {row.name}
            </Link>
            <p className="mt-1 text-xs text-brand-muted">{row.categoryName}</p>
          </div>
        ),
      },
      { key: "roomName", label: "Room" },
      {
        key: "status",
        label: "Status",
        render: (value) => <StatusPill tone={getStatusTone(value)}>{value}</StatusPill>,
      },
      {
        key: "mode",
        label: "Mode",
        render: (value) => <StatusPill tone={getStatusTone(value)}>{value}</StatusPill>,
      },
      { key: "brightnessLevel", label: "Brightness", render: (value) => formatPercent(value || 0) },
      { key: "estimatedCost", label: "Cost", render: (value) => formatCurrency(value || 0) },
      {
        key: "id",
        label: "Actions",
        render: (_value, row) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="px-3 py-2" onClick={() => openEditModal(row)}>
              Edit
            </Button>
            {(mode === "admin" || user?.role === "resident") ? (
              <Button variant="danger" className="px-3 py-2" onClick={() => void handleDelete(row.id)}>
                Delete
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [mode, user?.role],
  );

  function openCreateModal() {
    setEditingAppliance(null);
    setForm({
      ...emptyForm,
      roomId: rooms[0]?.id ? String(rooms[0].id) : "",
      categoryId: categories[0]?.id ? String(categories[0].id) : "",
    });
    setShowForm(true);
  }

  function openEditModal(appliance) {
    setEditingAppliance(appliance);
    setForm({
      roomId: appliance.roomId ? String(appliance.roomId) : "",
      categoryId: appliance.categoryId ? String(appliance.categoryId) : "",
      name: appliance.name || "",
      powerRatingWatts: Number(appliance.powerRatingWatts || 0),
      status: appliance.status || "OFF",
      mode: appliance.mode || "MANUAL",
      brightnessLevel: Number(appliance.brightnessLevel || 0),
      runtimeMinutesToday: Number(appliance.runtimeMinutesToday || 0),
      estimatedEnergyKwh: Number(appliance.estimatedEnergyKwh || 0),
      estimatedCost: Number(appliance.estimatedCost || 0),
      notes: appliance.notes || "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingAppliance(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        roomId: Number(form.roomId),
        categoryId: Number(form.categoryId),
        powerRatingWatts: Number(form.powerRatingWatts),
        brightnessLevel: Number(form.brightnessLevel),
        runtimeMinutesToday: Number(form.runtimeMinutesToday),
        estimatedEnergyKwh: Number(form.estimatedEnergyKwh),
        estimatedCost: Number(form.estimatedCost),
      };

      const saved = editingAppliance
        ? await applianceService.update(editingAppliance.id, payload, token)
        : await applianceService.create(payload, token);

      setAppliances((current) =>
        editingAppliance ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current],
      );
      closeForm();
    } catch (submissionError) {
      setError(submissionError.message || "Failed to save appliance.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this appliance?");
    if (!confirmed) return;

    try {
      await applianceService.remove(id, token);
      setAppliances((current) => current.filter((item) => item.id !== id));
    } catch (submissionError) {
      setError(submissionError.message || "Failed to delete appliance.");
    }
  }

  if (loading) return <LoadingState label="Loading appliance management workspace..." />;
  if (error && appliances.length === 0) {
    return <EmptyState title="Appliance workspace unavailable" description={error} />;
  }

  return (
    <div className="page-shell">
      <PageHero
        eyebrow={mode === "admin" ? "Appliance administration" : "Appliance management"}
        title="Track device state, mode, brightness, and cost from one control view."
        description="Manage room assignment, control mode, dimming, runtime tracking, energy usage, and cost contribution."
        primaryAction={
          <Button onClick={openCreateModal}>
            Create appliance
            <Plus className="h-4 w-4" />
          </Button>
        }
        secondaryAction={
          <Link to={mode === "admin" ? "/admin/dashboard" : "/app/dashboard"}>
            <Button variant="ghost">Back to dashboard</Button>
          </Link>
        }
        stats={[
          {
            label: "Filtered results",
            value: formatNumber(filteredAppliances.length),
            caption: "Search and filters keep the device layer concise and easy to navigate.",
          },
          {
            label: "Rooms covered",
            value: formatNumber(new Set(appliances.map((item) => item.roomId)).size),
            caption: "Appliance coverage is spread across the visible room portfolio.",
          },
        ]}
      />

      <div className="col-span-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1.2fr,0.8fr]">
        <SurfaceCard className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">Browse appliances</h2>
              <p className="mt-1 text-sm text-brand-muted">Search by name, room, category, state, or mode.</p>
            </div>
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <TextInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search appliances, rooms, or categories..."
                className="pl-11"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <SelectInput value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="ALL">All states</option>
              {applianceStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
            <SelectInput value={modeFilter} onChange={(event) => setModeFilter(event.target.value)}>
              <option value="ALL">All modes</option>
              {applianceModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
            <SelectInput value={roomFilter} onChange={(event) => setRoomFilter(event.target.value)}>
              <option value="ALL">All rooms</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </SelectInput>
          </div>

          <div className="mt-6 grid gap-4 xl:hidden">
            {filteredAppliances.map((appliance) => (
              <Link
                key={appliance.id}
                to={mode === "admin" ? "/admin/appliances" : `/app/appliances/${appliance.id}`}
                className="rounded-[1.75rem] border border-slate-200/70 bg-slate-50/80 p-5 transition hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-950">{appliance.name}</h3>
                    <p className="mt-1 text-sm text-brand-muted">
                      {appliance.roomName} - {appliance.categoryName}
                    </p>
                  </div>
                  <StatusPill tone={getStatusTone(appliance.status)}>{appliance.status}</StatusPill>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Mode</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{appliance.mode}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Brightness</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{formatPercent(appliance.brightnessLevel || 0)}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Cost</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(appliance.estimatedCost || 0)}</p>
                  </div>
                </div>
              </Link>
            ))}
            {filteredAppliances.length === 0 ? (
              <EmptyState
                title="No appliances match the current filters"
                description="Try another room or state filter, or create a new appliance."
              />
            ) : null}
          </div>

          <div className="mt-6 hidden xl:block">
            <DataTable
              title="Appliance inventory"
              subtitle="The device layer is focused on operational state, usage, and control."
              columns={columns}
              rows={filteredAppliances}
            />
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <h2 className="font-display text-xl font-bold text-slate-950">Control posture</h2>
          <div className="mt-6 space-y-4">
            {filteredAppliances.slice(0, 4).map((appliance) => (
              <div key={appliance.id} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{appliance.name}</p>
                    <p className="text-sm text-brand-muted">{appliance.roomName}</p>
                  </div>
                  <StatusPill tone={getStatusTone(appliance.mode)}>{appliance.mode}</StatusPill>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Power</p>
                    <p className="mt-2 font-semibold text-slate-950">{formatNumber(appliance.powerRatingWatts, 0)}W</p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Brightness</p>
                    <p className="mt-2 font-semibold text-slate-950">{formatPercent(appliance.brightnessLevel || 0)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <ModalPanel
        open={showForm}
        onClose={closeForm}
        title={editingAppliance ? `Edit ${editingAppliance.name}` : "Create appliance"}
        description="Capture the device identity, room assignment, state, and control posture."
        size="lg"
      >
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <FormField label="Appliance name">
            <TextInput value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
          </FormField>
          <FormField label="Room">
            <SelectInput value={form.roomId} onChange={(event) => setForm((current) => ({ ...current, roomId: event.target.value }))} required>
              <option value="">Select room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Category">
            <SelectInput value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))} required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Power rating (W)">
            <TextInput type="number" min="0" step="0.1" value={form.powerRatingWatts} onChange={(event) => setForm((current) => ({ ...current, powerRatingWatts: event.target.value }))} required />
          </FormField>
          <FormField label="State">
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
            <TextInput type="number" min="0" max="100" value={form.brightnessLevel} onChange={(event) => setForm((current) => ({ ...current, brightnessLevel: event.target.value }))} />
          </FormField>
          <FormField label="Runtime today (minutes)">
            <TextInput type="number" min="0" value={form.runtimeMinutesToday} onChange={(event) => setForm((current) => ({ ...current, runtimeMinutesToday: event.target.value }))} />
          </FormField>
          <FormField label="Estimated usage (kWh)">
            <TextInput type="number" min="0" step="0.01" value={form.estimatedEnergyKwh} onChange={(event) => setForm((current) => ({ ...current, estimatedEnergyKwh: event.target.value }))} />
          </FormField>
          <FormField label="Estimated cost">
            <TextInput type="number" min="0" step="0.01" value={form.estimatedCost} onChange={(event) => setForm((current) => ({ ...current, estimatedCost: event.target.value }))} />
          </FormField>
          <FormField label="Notes" className="md:col-span-2">
            <TextArea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          </FormField>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : editingAppliance ? "Save changes" : "Create appliance"}</Button>
          </div>
        </form>
      </ModalPanel>
    </div>
  );
}
