import { Bot, Plus, Power, Search, ShieldAlert, SlidersHorizontal, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import {
  automationActionOptions,
  automationMetricOptions,
  automationOperatorOptions,
  automationScopeOptions,
} from "../../constants/options";
import { useAuth } from "../../hooks/useAuth";
import { applianceService } from "../../services/applianceService";
import { automationService } from "../../services/automationService";
import { roomService } from "../../services/roomService";
import { formatDateTime, formatNumber, getStatusTone } from "../../utils/format";

const emptyRuleForm = {
  name: "",
  description: "",
  scope: "ROOM",
  priority: 1,
  roomId: "",
  applianceId: "",
  logicalOperator: "ALL",
  isEnabled: true,
  conditions: [{ metric: "TEMPERATURE", operator: "GT", comparisonValue: "25", comparisonUnit: "C" }],
  actions: [{ actionType: "TURN_ON", actionValue: "", delaySeconds: 0 }],
};

export function AutomationWorkspace({ mode = "app" }) {
  const { token, user } = useAuth();
  const [rules, setRules] = useState([]);
  const [history, setHistory] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form, setForm] = useState(emptyRuleForm);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [rulesPayload, historyPayload, roomsPayload, appliancesPayload] = await Promise.all([
          automationService.list(token),
          automationService.history(token),
          roomService.list(token),
          applianceService.list(token),
        ]);

        if (ignore) return;

        setRules(rulesPayload);
        setHistory(historyPayload);
        setRooms(roomsPayload);
        setAppliances(appliancesPayload);
      } catch (requestError) {
        if (!ignore) setError(requestError.message || "Failed to load automation rules.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [token]);

  const filteredRules = useMemo(
    () =>
      rules.filter((rule) => {
        const matchesSearch =
          !search ||
          [rule.name, rule.description, rule.roomName, rule.applianceName]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search.toLowerCase()));

        return matchesSearch && (scopeFilter === "ALL" || rule.scope === scopeFilter);
      }),
    [rules, scopeFilter, search],
  );

  const metrics = useMemo(
    () => [
      {
        icon: Bot,
        label: "Active rules",
        value: formatNumber(rules.filter((rule) => rule.isEnabled).length),
        trend: `${formatNumber(rules.length)} total`,
        tone: "success",
        helper: "Only active and relevant rules stay visible in this manager.",
      },
      {
        icon: ShieldAlert,
        label: "Triggered runs",
        value: formatNumber(history.filter((item) => item.status === "TRIGGERED").length),
        trend: `${formatNumber(history.length)} logged`,
        tone: "warning",
        helper: "Each execution writes a rule-run record for traceability and review.",
      },
      {
        icon: SlidersHorizontal,
        label: "Room-scoped rules",
        value: formatNumber(rules.filter((rule) => rule.scope === "ROOM").length),
        trend: `${formatNumber(rules.filter((rule) => rule.scope === "DEVICE").length)} device`,
        tone: "info",
        helper: "Room and appliance scope keep the engine understandable and easy to defend.",
      },
    ],
    [history, rules],
  );

  const columns = [
    {
      key: "name",
      label: "Rule",
      render: (_value, row) => (
        <div>
          <p className="font-semibold text-slate-950">{row.name}</p>
          <p className="mt-1 text-xs text-brand-muted">{row.description || "No description provided."}</p>
        </div>
      ),
    },
    { key: "scope", label: "Scope", render: (value) => <StatusPill tone="info">{value}</StatusPill> },
    { key: "priority", label: "Priority", render: (value) => formatNumber(value) },
    {
      key: "isEnabled",
      label: "State",
      render: (value) => <StatusPill tone={value ? "success" : "neutral"}>{value ? "Enabled" : "Disabled"}</StatusPill>,
    },
    {
      key: "id",
      label: "Actions",
      render: (_value, row) => (
        user?.role === "operator" ? (
          <StatusPill tone="neutral">Read only</StatusPill>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="px-3 py-2" onClick={() => openEditModal(row)}>Edit</Button>
            <Button variant={row.isEnabled ? "secondary" : "primary"} className="px-3 py-2" onClick={() => void handleToggle(row)}>
              <Power className="h-4 w-4" />
              {row.isEnabled ? "Disable" : "Enable"}
            </Button>
            <Button variant="danger" className="px-3 py-2" onClick={() => void handleDelete(row.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      ),
    },
  ];

  function openCreateModal() {
    setEditingRule(null);
    setForm({
      ...emptyRuleForm,
      roomId: rooms[0]?.id ? String(rooms[0].id) : "",
    });
    setShowForm(true);
  }

  function openEditModal(rule) {
    setEditingRule(rule);
    setForm({
      name: rule.name || "",
      description: rule.description || "",
      scope: rule.scope || "ROOM",
      priority: Number(rule.priority || 1),
      roomId: rule.roomId ? String(rule.roomId) : "",
      applianceId: rule.applianceId ? String(rule.applianceId) : "",
      logicalOperator: rule.logicalOperator || "ALL",
      isEnabled: Boolean(rule.isEnabled),
      conditions: (rule.conditions || []).map((condition) => ({
        metric: condition.metric,
        operator: condition.operator,
        comparisonValue: condition.comparisonValue,
        comparisonUnit: condition.comparisonUnit || "",
      })),
      actions: (rule.actions || []).map((action) => ({
        actionType: action.actionType,
        actionValue: action.actionValue || "",
        delaySeconds: Number(action.delaySeconds || 0),
      })),
    });
    setShowForm(true);
  }

  function updateCollection(type, index, key, value) {
    setForm((current) => ({
      ...current,
      [type]: current[type].map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        priority: Number(form.priority),
        roomId: form.roomId ? Number(form.roomId) : null,
        applianceId: form.applianceId ? Number(form.applianceId) : null,
        conditions: form.conditions.map((condition, index) => ({ ...condition, sortOrder: index + 1 })),
        actions: form.actions.map((action, index) => ({
          ...action,
          delaySeconds: Number(action.delaySeconds || 0),
          sortOrder: index + 1,
        })),
      };

      const saved = editingRule
        ? await automationService.update(editingRule.id, payload, token)
        : await automationService.create(payload, token);

      setRules((current) => (editingRule ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current]));
      setShowForm(false);
      setError("");
    } catch (submissionError) {
      setError(submissionError.message || "Failed to save automation rule.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(rule) {
    try {
      const updated = rule.isEnabled ? await automationService.disable(rule.id, token) : await automationService.enable(rule.id, token);
      setRules((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (requestError) {
      setError(requestError.message || "Failed to update rule state.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this automation rule?")) return;

    try {
      await automationService.remove(id, token);
      setRules((current) => current.filter((item) => item.id !== id));
    } catch (requestError) {
      setError(requestError.message || "Failed to delete automation rule.");
    }
  }

  if (loading) return <LoadingState label="Loading automation rules manager..." />;
  if (error && !rules.length) return <EmptyState title="Automation manager unavailable" description={error} />;

  return (
    <div className="page-shell">
      <PageHero
        eyebrow={mode === "admin" ? "Automation control" : "Automation rules"}
        title="Build and explain rule-based control flows with a clean, production-style manager."
        description="Create room or appliance-scoped rules, define conditions and actions, set priority, and review recent trigger history."
        primaryAction={
          user?.role === "operator" ? (
            <Button variant="ghost">Read-only access</Button>
          ) : (
            <Button onClick={openCreateModal}><Plus className="h-4 w-4" />Create rule</Button>
          )
        }
        secondaryAction={<Button variant="ghost">Rule engine live</Button>}
        stats={[
          {
            label: "Recent trigger runs",
            value: formatNumber(history.length),
            caption: "Runs are recorded whenever a rule matches and executes against the current simulation context.",
          },
          {
            label: "Highest priority",
            value: formatNumber(Math.min(...rules.map((rule) => Number(rule.priority || 1)), 1)),
            caption: "Priority ordering helps explain which rule wins first when conditions overlap.",
          },
        ]}
      />

      <div className="col-span-12 grid gap-5 md:grid-cols-3">
        {metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}
      </div>

      {error ? (
        <div className="col-span-12">
          <SurfaceCard className="border-rose-200 bg-rose-50/70 p-4"><p className="text-sm font-medium text-rose-700">{error}</p></SurfaceCard>
        </div>
      ) : null}

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
        <SurfaceCard className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">Rules library</h2>
              <p className="mt-1 text-sm text-brand-muted">Search, review, and adjust the active rule set.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative sm:col-span-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                <TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search rules, rooms, appliances..." className="pl-11" />
              </div>
              <SelectInput value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value)}>
                <option value="ALL">All scopes</option>
                {automationScopeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </SelectInput>
            </div>
          </div>
          <div className="mt-6 hidden xl:block">
            <DataTable title="Automation rules" subtitle="Rule list with scope, priority, state, and management actions." columns={columns} rows={filteredRules} />
          </div>
          <div className="mt-6 grid gap-4 xl:hidden">
            {filteredRules.map((rule) => (
              <SurfaceCard key={rule.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-950">{rule.name}</h3>
                    <p className="mt-1 text-sm text-brand-muted">{rule.description || "No description provided."}</p>
                  </div>
                  <StatusPill tone={rule.isEnabled ? "success" : "neutral"}>{rule.isEnabled ? "Enabled" : "Disabled"}</StatusPill>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusPill tone="info">{rule.scope}</StatusPill>
                  <StatusPill tone="warning">Priority {rule.priority}</StatusPill>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {user?.role === "operator" ? <StatusPill tone="neutral">Read only</StatusPill> : <Button variant="ghost" onClick={() => openEditModal(rule)}>Edit</Button>}
                  {user?.role === "operator" ? null : <Button variant={rule.isEnabled ? "secondary" : "primary"} onClick={() => void handleToggle(rule)}>{rule.isEnabled ? "Disable" : "Enable"}</Button>}
                </div>
              </SurfaceCard>
            ))}
            {!filteredRules.length ? <EmptyState title="No rules match the current filters" description="Try clearing the filters or create a new room or appliance-scoped rule." /> : null}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">Recent triggers</h2>
              <p className="mt-1 text-sm text-brand-muted">A concise stream of the latest rule executions and outcomes.</p>
            </div>
            <StatusPill tone="success">{formatNumber(history.length)} runs</StatusPill>
          </div>
          <div className="mt-6 space-y-4">
            {history.slice(0, 6).map((run) => (
              <div key={run.id} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{run.ruleName}</p>
                    <p className="mt-1 text-sm text-brand-muted">{run.roomName || "System scope"} {run.applianceName ? `- ${run.applianceName}` : ""}</p>
                  </div>
                  <StatusPill tone={getStatusTone(run.status)}>{run.status}</StatusPill>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusPill tone="info">{run.triggerSource}</StatusPill>
                  <StatusPill tone="neutral">{formatDateTime(run.triggeredAt)}</StatusPill>
                </div>
              </div>
            ))}
            {!history.length ? <EmptyState title="No trigger history yet" description="Use the simulation lab or scheduler to cause a rule match and populate this stream." /> : null}
          </div>
        </SurfaceCard>
      </div>

      <ModalPanel open={showForm} onClose={() => setShowForm(false)} title={editingRule ? `Edit ${editingRule.name}` : "Create automation rule"} description="Define the rule scope, conditions, and actions." size="xl">
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <FormField label="Rule name"><TextInput value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required /></FormField>
          <FormField label="Priority"><TextInput type="number" min="1" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))} required /></FormField>
          <FormField label="Scope">
            <SelectInput value={form.scope} onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value }))}>
              {automationScopeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </SelectInput>
          </FormField>
          <FormField label="Logical operator">
            <SelectInput value={form.logicalOperator} onChange={(event) => setForm((current) => ({ ...current, logicalOperator: event.target.value }))}>
              <option value="ALL">All conditions must match</option>
              <option value="ANY">Any condition can match</option>
            </SelectInput>
          </FormField>
          <FormField label="Room">
            <SelectInput value={form.roomId} onChange={(event) => setForm((current) => ({ ...current, roomId: event.target.value }))}>
              <option value="">No room selected</option>
              {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
            </SelectInput>
          </FormField>
          <FormField label="Appliance">
            <SelectInput value={form.applianceId} onChange={(event) => setForm((current) => ({ ...current, applianceId: event.target.value }))}>
              <option value="">No appliance selected</option>
              {appliances.filter((appliance) => !form.roomId || String(appliance.roomId) === String(form.roomId)).map((appliance) => <option key={appliance.id} value={appliance.id}>{appliance.name}</option>)}
            </SelectInput>
          </FormField>
          <FormField label="Description" className="md:col-span-2"><TextArea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="If temperature rises above threshold then turn on the AC." /></FormField>
          <div className="md:col-span-2 rounded-[1.75rem] border border-slate-200/70 bg-slate-50/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <div><h3 className="font-display text-lg font-bold text-slate-950">Conditions</h3><p className="mt-1 text-sm text-brand-muted">Each rule can evaluate one or more simulation conditions.</p></div>
              <Button type="button" variant="ghost" onClick={() => setForm((current) => ({ ...current, conditions: [...current.conditions, { metric: "LIGHT", operator: "LT", comparisonValue: "40", comparisonUnit: "%" }] }))}><Plus className="h-4 w-4" />Add condition</Button>
            </div>
            <div className="mt-4 space-y-4">
              {form.conditions.map((condition, index) => (
                <div key={`${condition.metric}-${index}`} className="grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-4">
                  <SelectInput value={condition.metric} onChange={(event) => updateCollection("conditions", index, "metric", event.target.value)}>{automationMetricOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</SelectInput>
                  <SelectInput value={condition.operator} onChange={(event) => updateCollection("conditions", index, "operator", event.target.value)}>{automationOperatorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</SelectInput>
                  <TextInput value={condition.comparisonValue} onChange={(event) => updateCollection("conditions", index, "comparisonValue", event.target.value)} placeholder="25" />
                  <div className="flex gap-2">
                    <TextInput value={condition.comparisonUnit} onChange={(event) => updateCollection("conditions", index, "comparisonUnit", event.target.value)} placeholder="C" />
                    {form.conditions.length > 1 ? <Button type="button" variant="danger" className="px-3" onClick={() => setForm((current) => ({ ...current, conditions: current.conditions.filter((_, conditionIndex) => conditionIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 rounded-[1.75rem] border border-slate-200/70 bg-slate-50/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <div><h3 className="font-display text-lg font-bold text-slate-950">Actions</h3><p className="mt-1 text-sm text-brand-muted">Define what should happen when the rule matches.</p></div>
              <Button type="button" variant="ghost" onClick={() => setForm((current) => ({ ...current, actions: [...current.actions, { actionType: "SEND_NOTIFICATION", actionValue: "", delaySeconds: 0 }] }))}><Plus className="h-4 w-4" />Add action</Button>
            </div>
            <div className="mt-4 space-y-4">
              {form.actions.map((action, index) => (
                <div key={`${action.actionType}-${index}`} className="grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-4">
                  <SelectInput value={action.actionType} onChange={(event) => updateCollection("actions", index, "actionType", event.target.value)}>{automationActionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</SelectInput>
                  <TextInput value={action.actionValue} onChange={(event) => updateCollection("actions", index, "actionValue", event.target.value)} placeholder="58 or custom notification message" />
                  <TextInput type="number" min="0" value={action.delaySeconds} onChange={(event) => updateCollection("actions", index, "delaySeconds", event.target.value)} placeholder="0" />
                  <div className="flex items-center justify-end">{form.actions.length > 1 ? <Button type="button" variant="danger" className="px-3" onClick={() => setForm((current) => ({ ...current, actions: current.actions.filter((_, actionIndex) => actionIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button> : null}</div>
                </div>
              ))}
            </div>
          </div>
          <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <input type="checkbox" checked={form.isEnabled} onChange={(event) => setForm((current) => ({ ...current, isEnabled: event.target.checked }))} className="h-4 w-4 rounded accent-brand-primary" />
            <span className="text-sm font-medium text-slate-800">Enable this rule immediately after saving</span>
          </label>
          <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : editingRule ? "Save rule" : "Create rule"}</Button>
          </div>
        </form>
      </ModalPanel>
    </div>
  );
}
