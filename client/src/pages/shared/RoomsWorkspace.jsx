import { Home, Layers3, Plus, Search, SlidersHorizontal, ThermometerSun } from "lucide-react";
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
import { roomOccupancyOptions } from "../../constants/options";
import { useAuth } from "../../hooks/useAuth";
import { analyticsService } from "../../services/analyticsService";
import { catalogService } from "../../services/catalogService";
import { roomService } from "../../services/roomService";
import { formatCurrency, formatNumber, formatPercent, formatTemperature, getStatusTone } from "../../utils/format";

const emptyRoomForm = {
  userId: "",
  name: "",
  roomType: "",
  description: "",
  floorLevel: "",
  occupancyState: "VACANT",
  temperature: 22,
  lightLevel: 65,
  thresholds: {
    maxTemp: 25,
    minLight: 45,
  },
};

export function RoomsWorkspace({ mode = "app" }) {
  const { token, user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [owners, setOwners] = useState([]);
  const [search, setSearch] = useState("");
  const [occupancyFilter, setOccupancyFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState(emptyRoomForm);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const requests = [
          roomService.list(token),
          catalogService.getCatalog(token),
        ];

        if (mode === "admin") {
          requests.push(analyticsService.getAdminUsers(token));
        }

        const payload = await Promise.all(requests);

        if (ignore) {
          return;
        }

        setRooms(payload[0]);
        setRoomTypes(payload[1].roomTypes || []);
        setOwners(mode === "admin" ? payload[2]?.users || [] : []);
        setError("");
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "Failed to load rooms.");
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
  }, [mode, token]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch =
        !search ||
        [room.name, room.roomTypeName, room.ownerName, room.floorLevel]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search.toLowerCase()));

      const matchesOccupancy = occupancyFilter === "ALL" || room.occupancyState === occupancyFilter;
      const matchesType = typeFilter === "ALL" || room.roomTypeName === typeFilter;

      return matchesSearch && matchesOccupancy && matchesType;
    });
  }, [occupancyFilter, rooms, search, typeFilter]);

  const roomMetrics = useMemo(() => {
    const occupied = rooms.filter((room) => room.occupancyState === "OCCUPIED").length;
    const appliances = rooms.reduce((sum, room) => sum + Number(room.applianceCount || 0), 0);
    const totalCost = rooms.reduce((sum, room) => sum + Number(room.estimatedCostTotal || 0), 0);

    return [
      {
        icon: Home,
        label: "Rooms",
        value: formatNumber(rooms.length),
        trend: `${formatNumber(occupied)} occupied`,
        tone: "success",
        helper: "The room inventory is intentionally compact and presentation-ready.",
      },
      {
        icon: Layers3,
        label: "Attached appliances",
        value: formatNumber(appliances),
        trend: `${formatNumber(filteredRooms.length)} visible`,
        tone: "info",
        helper: "Each room carries linked appliance counts for a tighter management story.",
      },
      {
        icon: ThermometerSun,
        label: "Average temperature",
        value:
          rooms.length > 0
            ? formatTemperature(rooms.reduce((sum, room) => sum + Number(room.currentTemperature || 0), 0) / rooms.length)
            : formatTemperature(0),
        trend: "Live room values",
        tone: "warning",
        helper: "Temperature reflects the current simulated state of each space.",
      },
      {
        icon: SlidersHorizontal,
        label: "Estimated cost",
        value: formatCurrency(totalCost || 0),
        trend: `${formatNumber(
          rooms.reduce((sum, room) => sum + Number(room.estimatedEnergyKwhTotal || 0), 0),
          2,
        )} kWh`,
        tone: "info",
        helper: "Cost and usage are rolled up from room-linked appliance and energy logs.",
      },
    ];
  }, [filteredRooms.length, rooms]);

  const tableColumns = useMemo(
    () => [
      {
        key: "name",
        label: "Room",
        render: (_value, row) => (
          <div>
            <Link
              to={mode === "admin" ? `/admin/rooms` : `/app/rooms/${row.id}`}
              className="font-semibold text-slate-900 hover:text-brand-primary"
            >
              {row.name}
            </Link>
            <p className="mt-1 text-xs text-brand-muted">{row.roomTypeName}</p>
          </div>
        ),
      },
      {
        key: "occupancyState",
        label: "Occupancy",
        render: (value) => <StatusPill tone={getStatusTone(value)}>{value}</StatusPill>,
      },
      {
        key: "currentTemperature",
        label: "Temp",
        render: (value) => formatTemperature(value),
      },
      {
        key: "currentLightLevel",
        label: "Light",
        render: (value) => formatPercent(value),
      },
      {
        key: "applianceCount",
        label: "Devices",
        render: (value) => formatNumber(value),
      },
      {
        key: "estimatedCostTotal",
        label: "Cost",
        render: (value) => formatCurrency(value || 0),
      },
      {
        key: "id",
        label: "Actions",
        render: (_value, row) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="px-3 py-2"
              onClick={() => openEditModal(row)}
            >
              Edit
            </Button>
            {(mode === "admin" || user?.role === "resident") ? (
              <Button
                variant="danger"
                className="px-3 py-2"
                onClick={() => void handleDelete(row.id)}
              >
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
    setEditingRoom(null);
    setForm({
      ...emptyRoomForm,
      userId: "",
      roomType: roomTypes[0]?.name || "",
    });
    setShowForm(true);
  }

  function openEditModal(room) {
    setEditingRoom(room);
    setForm({
      userId: room.ownerUserId ? String(room.ownerUserId) : "",
      name: room.name || "",
      roomType: room.roomTypeName || "",
      description: room.description || "",
      floorLevel: room.floorLevel || "",
      occupancyState: room.occupancyState || "VACANT",
      temperature: Number(room.currentTemperature || 22),
      lightLevel: Number(room.currentLightLevel || 65),
      thresholds: {
        maxTemp: Number(room.maxTemperatureThreshold || 25),
        minLight: Number(room.minLightThreshold || 45),
      },
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingRoom(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        userId: mode === "admin" ? Number(form.userId || user?.id) : undefined,
        temperature: Number(form.temperature),
        lightLevel: Number(form.lightLevel),
        thresholds: {
          maxTemp: Number(form.thresholds.maxTemp),
          minLight: Number(form.thresholds.minLight),
        },
      };

      const saved = editingRoom
        ? await roomService.update(editingRoom.id, payload, token)
        : await roomService.create(payload, token);

      setRooms((current) =>
        editingRoom ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current],
      );
      closeForm();
    } catch (submissionError) {
      setError(submissionError.message || "Failed to save room.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this room?");

    if (!confirmed) {
      return;
    }

    try {
      await roomService.remove(id, token);
      setRooms((current) => current.filter((item) => item.id !== id));
    } catch (submissionError) {
      setError(submissionError.message || "Failed to delete room.");
    }
  }

  if (loading) {
    return <LoadingState label="Loading room management workspace..." />;
  }

  if (error && rooms.length === 0) {
    return <EmptyState title="Room workspace unavailable" description={error} />;
  }

  return (
    <div className="page-shell">
      <PageHero
        eyebrow={mode === "admin" ? "Room administration" : "Room management"}
        title={
          mode === "admin"
            ? "Manage the spaces that drive the simulation story."
            : "Control room posture, thresholds, and linked appliance coverage."
        }
        description={
          mode === "admin"
            ? "Administrators can create rooms for demo users, assign room types, and keep the project-defense scope clean."
            : "Residents can define spaces, tune thresholds, and keep each room ready for the simulation and command flows."
        }
        primaryAction={
          <Button onClick={openCreateModal}>
            Create room
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
            label: "Visible rooms",
            value: formatNumber(filteredRooms.length),
            caption: "Filtered result count updates instantly as you search and refine the list.",
          },
          {
            label: "Occupied share",
            value: rooms.length ? formatPercent((rooms.filter((room) => room.occupancyState === "OCCUPIED").length / rooms.length) * 100) : "0%",
            caption: "A compact view of how many rooms are currently marked as occupied.",
          },
        ]}
      />

      <div className="col-span-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {roomMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1.2fr,0.8fr]">
        <SurfaceCard className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">Browse rooms</h2>
              <p className="mt-1 text-sm text-brand-muted">Search, filter, and jump into room details or editing.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative sm:col-span-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                <TextInput
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search rooms, owners, or types..."
                  className="pl-11"
                />
              </div>
              <SelectInput value={occupancyFilter} onChange={(event) => setOccupancyFilter(event.target.value)}>
                <option value="ALL">All occupancy</option>
                {roomOccupancyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <SelectInput
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="w-full sm:w-64"
            >
              <option value="ALL">All room types</option>
              {roomTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </SelectInput>
          </div>

          <div className="mt-6 grid gap-4 xl:hidden">
            {filteredRooms.map((room) => (
              <Link
                key={room.id}
                to={mode === "admin" ? "/admin/rooms" : `/app/rooms/${room.id}`}
                className="rounded-[1.75rem] border border-slate-200/70 bg-slate-50/80 p-5 transition hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-950">{room.name}</h3>
                    <p className="mt-1 text-sm text-brand-muted">
                      {room.roomTypeName} {room.floorLevel ? ` - ${room.floorLevel}` : ""}
                    </p>
                  </div>
                  <StatusPill tone={getStatusTone(room.occupancyState)}>{room.occupancyState}</StatusPill>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Temp</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{formatTemperature(room.currentTemperature)}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Devices</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{formatNumber(room.applianceCount)}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Cost</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(room.estimatedCostTotal || 0)}</p>
                  </div>
                </div>
              </Link>
            ))}
            {filteredRooms.length === 0 ? (
              <EmptyState
                title="No rooms match the current filters"
                description="Try clearing the search or create a new room to start the simulation story."
              />
            ) : null}
          </div>

          <div className="mt-6 hidden xl:block">
            <DataTable
              title="Room inventory"
              subtitle="Each row links directly into room details for quick inspection."
              columns={tableColumns}
              rows={filteredRooms}
            />
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <h2 className="font-display text-xl font-bold text-slate-950">Room insights</h2>
          <div className="mt-6 space-y-4">
            {filteredRooms.slice(0, 3).map((room) => (
              <div key={room.id} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{room.name}</p>
                    <p className="text-sm text-brand-muted">{room.ownerName || "Workspace owner"}</p>
                  </div>
                  <StatusPill tone={getStatusTone(room.occupancyState)}>{room.occupancyState}</StatusPill>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
                  <div className="rounded-2xl bg-white px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Temp</p>
                    <p className="mt-2 font-semibold">{formatTemperature(room.currentTemperature)}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Light</p>
                    <p className="mt-2 font-semibold">{formatPercent(room.currentLightLevel)}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Appliances</p>
                    <p className="mt-2 font-semibold">{formatNumber(room.applianceCount)}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Energy</p>
                    <p className="mt-2 font-semibold">{formatNumber(room.estimatedEnergyKwhTotal || 0, 2)} kWh</p>
                  </div>
                </div>
              </div>
            ))}
            {filteredRooms.length === 0 ? (
              <EmptyState
                title="No room insights yet"
                description="Create a room and start the simulation to populate this panel."
              />
            ) : null}
          </div>
        </SurfaceCard>
      </div>

      <ModalPanel
        open={showForm}
        onClose={closeForm}
        title={editingRoom ? `Edit ${editingRoom.name}` : "Create room"}
        description="Capture only the details you need for a strong defense demo: the room identity, thresholds, and current simulated posture."
        size="lg"
      >
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          {mode === "admin" ? (
            <FormField label="Owner">
              <SelectInput
                value={form.userId}
                onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
                required
              >
                <option value="">Select user</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.role})
                  </option>
                ))}
              </SelectInput>
            </FormField>
          ) : null}

          <FormField label="Room name">
            <TextInput
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Living Room"
              required
            />
          </FormField>

          <FormField label="Room type">
            <SelectInput
              value={form.roomType}
              onChange={(event) => setForm((current) => ({ ...current, roomType: event.target.value }))}
              required
            >
              <option value="">Select room type</option>
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
              placeholder="Ground"
            />
          </FormField>

          <FormField label="Occupancy state">
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

          <FormField label="Temperature (C)">
            <TextInput
              type="number"
              min="0"
              max="50"
              step="0.1"
              value={form.temperature}
              onChange={(event) => setForm((current) => ({ ...current, temperature: event.target.value }))}
            />
          </FormField>

          <FormField label="Light level (%)">
            <TextInput
              type="number"
              min="0"
              max="100"
              value={form.lightLevel}
              onChange={(event) => setForm((current) => ({ ...current, lightLevel: event.target.value }))}
            />
          </FormField>

          <FormField label="Max temperature threshold">
            <TextInput
              type="number"
              min="0"
              max="50"
              step="0.1"
              value={form.thresholds.maxTemp}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  thresholds: {
                    ...current.thresholds,
                    maxTemp: event.target.value,
                  },
                }))
              }
            />
          </FormField>

          <FormField label="Minimum light threshold">
            <TextInput
              type="number"
              min="0"
              max="100"
              value={form.thresholds.minLight}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  thresholds: {
                    ...current.thresholds,
                    minLight: event.target.value,
                  },
                }))
              }
            />
          </FormField>

          <FormField label="Description" className="md:col-span-2">
            <TextArea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Describe how this room participates in the energy simulation."
            />
          </FormField>

          <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : editingRoom ? "Save changes" : "Create room"}
            </Button>
          </div>
        </form>
      </ModalPanel>
    </div>
  );
}
