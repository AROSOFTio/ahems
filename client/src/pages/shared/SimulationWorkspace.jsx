import { Mic, Shuffle, SlidersHorizontal, Sparkles, Terminal, Waves } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CostTrendChart } from "../../components/charts/CostTrendChart";
import { EnergyUsageChart } from "../../components/charts/EnergyUsageChart";
import { OccupancyChart } from "../../components/charts/OccupancyChart";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { FormField, SelectInput, TextInput } from "../../components/ui/FormField";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHero } from "../../components/ui/PageHero";
import { StatCard } from "../../components/ui/StatCard";
import { StatusPill } from "../../components/ui/StatusPill";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import {
  commandActionPresets,
  commandSourceOptions,
  roomOccupancyOptions,
  timeOfDayOptions,
} from "../../constants/options";
import { useAuth } from "../../hooks/useAuth";
import { simulationService } from "../../services/simulationService";
import { formatDateTime, formatNumber, formatPercent, formatTemperature, getStatusTone } from "../../utils/format";

export function SimulationWorkspace({ mode = "app" }) {
  const { token } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedApplianceId, setSelectedApplianceId] = useState("");
  const [conditionForm, setConditionForm] = useState({
    targetTemperature: 22,
    targetLightIntensity: 50,
    targetOccupancy: "VACANT",
    timeOfDay: "MORNING",
    randomizationEnabled: false,
  });
  const [commandForm, setCommandForm] = useState({
    action: "TURN_ON",
    commandText: "",
    commandSource: "BUTTON",
    brightnessLevel: 45,
  });

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const payload = await simulationService.getOverview(token);

        if (ignore) return;

        setOverview(payload);

        const firstRoomId = payload.rooms?.[0]?.id ? String(payload.rooms[0].id) : "";
        setSelectedRoomId(firstRoomId);
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "Failed to load simulation overview.");
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

  const rooms = overview?.rooms || [];
  const appliances = overview?.appliances || [];
  const selectedCondition = useMemo(
    () => overview?.conditions?.find((item) => String(item.roomId) === String(selectedRoomId)),
    [overview?.conditions, selectedRoomId],
  );
  const selectedRoom = useMemo(
    () => rooms.find((item) => String(item.id) === String(selectedRoomId)),
    [rooms, selectedRoomId],
  );
  const roomAppliances = useMemo(
    () => appliances.filter((item) => String(item.roomId) === String(selectedRoomId)),
    [appliances, selectedRoomId],
  );

  useEffect(() => {
    if (!selectedRoomId || !selectedRoom) return;

    setConditionForm({
      targetTemperature: Number(selectedCondition?.targetTemperature ?? selectedRoom.currentTemperature ?? 22),
      targetLightIntensity: Number(selectedCondition?.targetLightIntensity ?? selectedRoom.currentLightLevel ?? 50),
      targetOccupancy: selectedCondition?.targetOccupancy || selectedRoom.occupancyState || "VACANT",
      timeOfDay: selectedCondition?.timeOfDay || "MORNING",
      randomizationEnabled: Boolean(selectedCondition?.randomizationEnabled),
    });
    setSelectedApplianceId((current) => current || String(roomAppliances[0]?.id || ""));
  }, [roomAppliances, selectedCondition, selectedRoom, selectedRoomId]);

  const metrics = useMemo(
    () => [
      {
        icon: SlidersHorizontal,
        label: "Rooms in lab",
        value: formatNumber(overview?.summary?.totalRooms || 0),
        trend: `${formatNumber(overview?.summary?.occupiedRooms || 0)} occupied`,
        tone: "info",
        helper: "The simulation lab always reflects the same rooms visible in the management module.",
      },
      {
        icon: Waves,
        label: "Active appliances",
        value: formatNumber(overview?.summary?.activeAppliances || 0),
        trend: `${formatNumber(overview?.recentCommands?.length || 0)} recent commands`,
        tone: "success",
        helper: "Command activity updates virtual appliance state immediately after execution.",
      },
      {
        icon: Sparkles,
        label: "Sensor readings",
        value: formatNumber(overview?.recentReadings?.length || 0),
        trend: "Manual + random",
        tone: "warning",
        helper: "Temperature, light, and occupancy readings are logged for the recent history panel.",
      },
    ],
    [overview],
  );

  const temperatureChart = rooms.map((room) => ({
    period: room.name,
    usage: Number(room.currentTemperature || 0),
  }));

  const lightChart = rooms.map((room) => ({
    period: room.name,
    cost: Number(room.currentLightLevel || 0),
  }));

  const occupancyChart = rooms.map((room) => ({
    name: room.name,
    occupied: room.occupancyState === "OCCUPIED" ? 1 : 0,
    vacant: room.occupancyState === "OCCUPIED" ? 0 : 1,
  }));

  async function handleConditionsSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = await simulationService.updateConditions(
        {
          roomId: Number(selectedRoomId),
          ...conditionForm,
        },
        token,
      );
      setOverview(payload);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to update conditions.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRandomize() {
    setSubmitting(true);
    try {
      const payload = await simulationService.randomize({ roomId: Number(selectedRoomId) }, token);
      setOverview(payload);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to randomize room.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCommand(action = commandForm.action, source = commandForm.commandSource, commandText = commandForm.commandText) {
    setSubmitting(true);

    try {
      const payload = await simulationService.executeCommand(
        {
          roomId: Number(selectedRoomId),
          applianceId: selectedApplianceId ? Number(selectedApplianceId) : undefined,
          action,
          commandSource: source,
          commandText: commandText || action.replaceAll("_", " "),
          brightnessLevel: Number(commandForm.brightnessLevel),
        },
        token,
      );
      setOverview(payload.overview);
      setError("");
      setCommandForm((current) => ({ ...current, commandText: "" }));
    } catch (requestError) {
      setError(requestError.message || "Failed to execute command.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState label="Loading simulation lab..." />;
  if (error && !overview) return <EmptyState title="Simulation lab unavailable" description={error} />;

  return (
    <div className="page-shell">
      <PageHero
        eyebrow={mode === "admin" ? "Simulation lab" : "Simulation lab"}
        title="Run virtual sensing and command scenarios in a polished, defense-ready workspace."
        description="This lab combines room conditions, randomized sensing, quick commands, preset actions, typed commands, and recent history in one clean interface."
        stats={[
          {
            label: "Selected room",
            value: selectedRoom?.name || "Choose a room",
            caption: "Everything in this workspace centers on the room currently selected below.",
          },
          {
            label: "Recent commands",
            value: formatNumber(overview?.recentCommands?.length || 0),
            caption: "Each successful action is written back into the command history stream.",
          },
        ]}
      />

      <div className="col-span-12 grid gap-5 md:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      {error ? (
        <div className="col-span-12">
          <SurfaceCard className="border-rose-200 bg-rose-50/70 p-4">
            <p className="text-sm font-medium text-rose-700">{error}</p>
          </SurfaceCard>
        </div>
      ) : null}

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
        <SurfaceCard className="p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">Room conditions</h2>
              <p className="mt-1 text-sm text-brand-muted">Update temperature, light, occupancy, and time-of-day effects.</p>
            </div>
            <SelectInput value={selectedRoomId} onChange={(event) => setSelectedRoomId(event.target.value)} className="w-full max-w-xs">
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </SelectInput>
          </div>

          <form className="space-y-5" onSubmit={handleConditionsSubmit}>
            <FormField label={`Target temperature: ${formatTemperature(conditionForm.targetTemperature)}`}>
              <input
                type="range"
                min="16"
                max="30"
                step="0.5"
                value={conditionForm.targetTemperature}
                onChange={(event) => setConditionForm((current) => ({ ...current, targetTemperature: Number(event.target.value) }))}
                className="w-full accent-brand-primary"
              />
            </FormField>

            <FormField label={`Target light intensity: ${formatPercent(conditionForm.targetLightIntensity)}`}>
              <input
                type="range"
                min="0"
                max="100"
                value={conditionForm.targetLightIntensity}
                onChange={(event) => setConditionForm((current) => ({ ...current, targetLightIntensity: Number(event.target.value) }))}
                className="w-full accent-brand-accent"
              />
            </FormField>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Occupancy state">
                <SelectInput value={conditionForm.targetOccupancy} onChange={(event) => setConditionForm((current) => ({ ...current, targetOccupancy: event.target.value }))}>
                  {roomOccupancyOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </SelectInput>
              </FormField>

              <FormField label="Time of day">
                <SelectInput value={conditionForm.timeOfDay} onChange={(event) => setConditionForm((current) => ({ ...current, timeOfDay: event.target.value }))}>
                  {timeOfDayOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </SelectInput>
              </FormField>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
              <input
                type="checkbox"
                checked={conditionForm.randomizationEnabled}
                onChange={(event) => setConditionForm((current) => ({ ...current, randomizationEnabled: event.target.checked }))}
                className="h-4 w-4 rounded accent-brand-primary"
              />
              <span className="text-sm font-medium text-slate-800">Enable randomized simulation influence for this room</span>
            </label>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={submitting}>
                <SlidersHorizontal className="h-4 w-4" />
                {submitting ? "Applying..." : "Apply conditions"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => void handleRandomize()} disabled={submitting}>
                <Shuffle className="h-4 w-4" />
                Randomize room
              </Button>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">Command console</h2>
              <p className="mt-1 text-sm text-brand-muted">Trigger quick, preset, or typed commands against the selected room.</p>
            </div>
            <SelectInput value={selectedApplianceId} onChange={(event) => setSelectedApplianceId(event.target.value)} className="w-full max-w-xs">
              <option value="">All appliances in room</option>
              {roomAppliances.map((appliance) => (
                <option key={appliance.id} value={appliance.id}>{appliance.name}</option>
              ))}
            </SelectInput>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {commandActionPresets.slice(0, 6).map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => void handleCommand(preset.value, "BUTTON", preset.label)}
                className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 px-4 py-4 text-left text-sm font-semibold text-slate-800 transition hover:bg-white"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormField label="Command action">
              <SelectInput value={commandForm.action} onChange={(event) => setCommandForm((current) => ({ ...current, action: event.target.value }))}>
                {commandActionPresets.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Command source">
              <SelectInput value={commandForm.commandSource} onChange={(event) => setCommandForm((current) => ({ ...current, commandSource: event.target.value }))}>
                {commandSourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label={`Brightness override: ${formatPercent(commandForm.brightnessLevel)}`}>
              <input
                type="range"
                min="0"
                max="100"
                value={commandForm.brightnessLevel}
                onChange={(event) => setCommandForm((current) => ({ ...current, brightnessLevel: Number(event.target.value) }))}
                className="w-full accent-brand-primary"
              />
            </FormField>
          </div>

          <FormField label="Typed command" className="mt-5">
            <TextInput
              value={commandForm.commandText}
              onChange={(event) => setCommandForm((current) => ({ ...current, commandText: event.target.value }))}
              placeholder="Dim the office lights to 40 percent"
            />
          </FormField>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => void handleCommand(commandForm.action, "VOICE", "Voice preset command")} disabled={submitting}>
              <Mic className="h-4 w-4" />
              Run preset
            </Button>
            <Button variant="ghost" onClick={() => void handleCommand(commandForm.action, "TYPED", commandForm.commandText)} disabled={submitting}>
              <Terminal className="h-4 w-4" />
              Execute typed command
            </Button>
          </div>
        </SurfaceCard>
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1fr,1fr,1fr]">
        <EnergyUsageChart data={temperatureChart} title="Temperature by room" description="Current room temperature values from the live simulation state." />
        <CostTrendChart data={lightChart} title="Light intensity by room" description="Current light intensity values used in the simulation model." />
        <OccupancyChart data={occupancyChart} title="Occupancy posture" description="Occupied versus vacant state for the visible room portfolio." />
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1fr,1fr]">
        <SurfaceCard className="p-6">
          <h2 className="font-display text-xl font-bold text-slate-950">Recent sensor readings</h2>
          <div className="mt-6 space-y-4">
            {(overview?.recentReadings || []).map((reading) => (
              <div key={reading.id} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">{reading.roomName} - {reading.readingType}</p>
                  <StatusPill tone="info">{reading.source}</StatusPill>
                </div>
                <p className="mt-3 text-xl font-bold text-slate-950">
                  {reading.readingType === "TEMPERATURE"
                    ? formatTemperature(reading.readingValue)
                    : reading.readingType === "LIGHT"
                      ? formatPercent(reading.readingValue)
                      : reading.readingValue}
                </p>
                <p className="mt-2 text-sm text-brand-muted">{formatDateTime(reading.recordedAt)}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <h2 className="font-display text-xl font-bold text-slate-950">Recent command stream</h2>
          <div className="mt-6 space-y-4">
            {(overview?.recentCommands || []).map((command) => (
              <div key={command.id} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{command.commandText}</p>
                    <p className="text-sm text-brand-muted">
                      {command.roomName || "Room"} {command.applianceName ? ` - ${command.applianceName}` : ""}
                    </p>
                  </div>
                  <StatusPill tone={getStatusTone(command.status)}>{command.commandSource}</StatusPill>
                </div>
                <p className="mt-2 text-sm text-brand-muted">{formatDateTime(command.executedAt)}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
