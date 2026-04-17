import { Blocks, Home, Palette, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { FormField, TextInput } from "../../components/ui/FormField";
import { LoadingState } from "../../components/ui/LoadingState";
import { ModalPanel } from "../../components/ui/ModalPanel";
import { PageHero } from "../../components/ui/PageHero";
import { StatCard } from "../../components/ui/StatCard";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { useAuth } from "../../hooks/useAuth";
import { catalogService } from "../../services/catalogService";
import { formatNumber } from "../../utils/format";

export function CatalogAdminWorkspace() {
  const { token } = useAuth();
  const [catalog, setCatalog] = useState({ roomTypes: [], applianceCategories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ type: "", record: null });
  const [form, setForm] = useState({ name: "", description: "", icon: "", colorCode: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const payload = await catalogService.getCatalog(token);
        if (!ignore) {
          setCatalog(payload);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "Failed to load lookups.");
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

  const metrics = useMemo(
    () => [
      {
        icon: Home,
        label: "Room types",
        value: formatNumber(catalog.roomTypes.length),
        trend: "Reusable",
        tone: "info",
        helper: "Types keep room creation consistent without adding too much data noise.",
      },
      {
        icon: Blocks,
        label: "Appliance categories",
        value: formatNumber(catalog.applianceCategories.length),
        trend: "Reusable",
        tone: "success",
        helper: "Categories keep device grouping and forms consistent.",
      },
    ],
    [catalog.applianceCategories.length, catalog.roomTypes.length],
  );

  function openModal(type, record = null) {
    setModal({ type, record });
    setForm({
      name: record?.name || "",
      description: record?.description || "",
      icon: record?.icon || "",
      colorCode: record?.colorCode || "",
    });
  }

  function closeModal() {
    setModal({ type: "", record: null });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (modal.type === "roomType") {
        const saved = modal.record
          ? await catalogService.updateRoomType(modal.record.id, form, token)
          : await catalogService.createRoomType(form, token);

        setCatalog((current) => ({
          ...current,
          roomTypes: modal.record
            ? current.roomTypes.map((item) => (item.id === saved.id ? saved : item))
            : [...current.roomTypes, saved],
        }));
      }

      if (modal.type === "category") {
        const saved = modal.record
          ? await catalogService.updateApplianceCategory(modal.record.id, form, token)
          : await catalogService.createApplianceCategory(form, token);

        setCatalog((current) => ({
          ...current,
          applianceCategories: modal.record
            ? current.applianceCategories.map((item) => (item.id === saved.id ? saved : item))
            : [...current.applianceCategories, saved],
        }));
      }

      closeModal();
    } catch (submissionError) {
      setError(submissionError.message || "Failed to save lookup.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(type, id) {
    const confirmed = window.confirm("Delete this lookup item?");
    if (!confirmed) return;

    try {
      if (type === "roomType") {
        await catalogService.deleteRoomType(id, token);
        setCatalog((current) => ({
          ...current,
          roomTypes: current.roomTypes.filter((item) => item.id !== id),
        }));
      } else {
        await catalogService.deleteApplianceCategory(id, token);
        setCatalog((current) => ({
          ...current,
          applianceCategories: current.applianceCategories.filter((item) => item.id !== id),
        }));
      }
    } catch (requestError) {
      setError(requestError.message || "Failed to delete lookup.");
    }
  }

  if (loading) return <LoadingState label="Loading lookup administration..." />;
  if (error && !catalog.roomTypes.length && !catalog.applianceCategories.length) {
    return <EmptyState title="Lookup workspace unavailable" description={error} />;
  }

  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Lookup administration"
        title="Manage the reusable room and appliance vocabularies."
        description="This page keeps the catalog layer intentionally small: just enough to support room and appliance forms cleanly."
        stats={[
          {
            label: "Room types",
            value: formatNumber(catalog.roomTypes.length),
            caption: "Reusable room types keep room setup fast and consistent.",
          },
          {
            label: "Categories",
            value: formatNumber(catalog.applianceCategories.length),
            caption: "Device categories organize appliance groups across forms, tables, and analytics.",
          },
        ]}
      />

      <div className="col-span-12 grid gap-5 md:grid-cols-2">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-2">
        <SurfaceCard className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">Room types</h2>
              <p className="mt-1 text-sm text-brand-muted">Reusable room classifications for the management flow.</p>
            </div>
            <Button onClick={() => openModal("roomType")}>
              <Plus className="h-4 w-4" />
              Add type
            </Button>
          </div>
          <div className="mt-6 space-y-3">
            {catalog.roomTypes.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4">
                <div>
                  <p className="font-semibold text-slate-950">{item.name}</p>
                  <p className="text-sm text-brand-muted">{item.description || "No description provided."}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="px-3 py-2" onClick={() => openModal("roomType", item)}>Edit</Button>
                  <Button variant="danger" className="px-3 py-2" onClick={() => void handleDelete("roomType", item.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">Appliance categories</h2>
              <p className="mt-1 text-sm text-brand-muted">Reusable device categories for room and appliance workflows.</p>
            </div>
            <Button onClick={() => openModal("category")}>
              <Plus className="h-4 w-4" />
              Add category
            </Button>
          </div>
          <div className="mt-6 space-y-3">
            {catalog.applianceCategories.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl" style={{ backgroundColor: item.colorCode || "#3543bb" }} />
                  <div>
                    <p className="font-semibold text-slate-950">{item.name}</p>
                    <p className="text-sm text-brand-muted">{item.description || "No description provided."}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="px-3 py-2" onClick={() => openModal("category", item)}>Edit</Button>
                  <Button variant="danger" className="px-3 py-2" onClick={() => void handleDelete("category", item.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <ModalPanel
        open={Boolean(modal.type)}
        onClose={closeModal}
        title={modal.record ? `Edit ${modal.record.name}` : `Create ${modal.type === "roomType" ? "room type" : "appliance category"}`}
        description="Keep the catalog small and purposeful so the forms stay easy to explain."
        size="md"
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <FormField label="Name">
            <TextInput value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
          </FormField>
          <FormField label="Description">
            <TextInput value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </FormField>
          {modal.type === "category" ? (
            <>
              <FormField label="Icon">
                <TextInput value={form.icon} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))} placeholder="Lightbulb" />
              </FormField>
              <FormField label="Color code">
                <TextInput value={form.colorCode} onChange={(event) => setForm((current) => ({ ...current, colorCode: event.target.value }))} placeholder="#3543bb" />
              </FormField>
            </>
          ) : null}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </ModalPanel>
    </div>
  );
}
