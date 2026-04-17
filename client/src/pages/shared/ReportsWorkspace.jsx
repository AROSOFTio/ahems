import { Download, FileSpreadsheet, FileText, Filter, Plus, TableProperties } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { EmptyState } from "../../components/ui/EmptyState";
import { FormField, SelectInput, TextInput } from "../../components/ui/FormField";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHero } from "../../components/ui/PageHero";
import { StatCard } from "../../components/ui/StatCard";
import { StatusPill } from "../../components/ui/StatusPill";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { reportFormatOptions, reportTypeOptions } from "../../constants/options";
import { useAuth } from "../../hooks/useAuth";
import { applianceService } from "../../services/applianceService";
import { reportService } from "../../services/reportService";
import { roomService } from "../../services/roomService";
import { formatDateTime, formatNumber, getStatusTone } from "../../utils/format";

const defaultForm = {
  title: "",
  reportType: "ENERGY_SUMMARY",
  format: "CSV",
  startDate: "",
  endDate: "",
  roomId: "",
  applianceId: "",
  userId: "",
};

function downloadBase64({ content, fileName, mimeType }) {
  const binary = window.atob(content);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportsWorkspace({ mode = "app" }) {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [exportsList, setExportsList] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [appliances, setAppliances] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [reportsPayload, exportsPayload, roomsPayload, appliancesPayload] = await Promise.all([
          reportService.list(token),
          reportService.listExports(token),
          roomService.list(token),
          applianceService.list(token),
        ]);

        if (ignore) return;

        setReports(reportsPayload);
        setExportsList(exportsPayload);
        setRooms(roomsPayload);
        setAppliances(appliancesPayload);
      } catch (requestError) {
        if (!ignore) setError(requestError.message || "Failed to load reports workspace.");
      } finally {
        if (!ignore) setLoading(false);
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
        icon: FileText,
        label: "Reports",
        value: formatNumber(reports.length),
        trend: `${formatNumber(exportsList.length)} exports`,
        tone: "info",
        helper: "Reports can be generated and exported without leaving the product shell.",
      },
      {
        icon: FileSpreadsheet,
        label: "CSV exports",
        value: formatNumber(exportsList.filter((item) => item.exportFormat === "CSV").length),
        trend: "Spreadsheet-ready",
        tone: "success",
        helper: "CSV output is useful for tabular analysis and operational exports.",
      },
      {
        icon: TableProperties,
        label: "PDF exports",
        value: formatNumber(exportsList.filter((item) => item.exportFormat === "PDF").length),
        trend: "Presentation-ready",
        tone: "warning",
        helper: "PDF output is useful for shareable operational summaries.",
      },
    ],
    [exportsList, reports],
  );

  async function handleGenerate(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        title: form.title || undefined,
        reportType: form.reportType,
        format: form.format,
        filters: {
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          roomId: form.roomId ? Number(form.roomId) : undefined,
          applianceId: form.applianceId ? Number(form.applianceId) : undefined,
          userId: form.userId ? Number(form.userId) : undefined,
        },
      };

      const generated = await reportService.generate(payload, token);
      setReports((current) => [generated.report, ...current]);
      setExportsList((current) => [generated.export, ...current]);
      setPreview(generated.preview);
      downloadBase64(generated.download);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Failed to generate report.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState label="Loading reports workspace..." />;
  if (error && !reports.length) return <EmptyState title="Reports workspace unavailable" description={error} />;

  const reportColumns = [
    { key: "title", label: "Title" },
    { key: "reportType", label: "Type" },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusPill tone={getStatusTone(value)}>{value}</StatusPill>,
    },
    {
      key: "generatedAt",
      label: "Generated",
      render: (value) => formatDateTime(value),
    },
  ];

  const exportColumns = [
    { key: "reportTitle", label: "Report" },
    { key: "exportFormat", label: "Format" },
    { key: "fileName", label: "File name" },
    {
      key: "exportedAt",
      label: "Exported",
      render: (value) => formatDateTime(value),
    },
  ];

  const previewColumns =
    preview?.columns?.map((column) => ({
      key: column.key,
      label: column.label,
    })) || [];

  return (
    <div className="page-shell">
      <PageHero
        eyebrow={mode === "admin" ? "Reporting center" : "Reports"}
        title="Generate room, appliance, automation, and threshold reports with export-ready output."
        description="This workspace keeps reporting tight: choose a report type, add optional filters, preview the output, and export immediately to CSV or PDF."
        stats={[
          {
            label: "Last export",
            value: exportsList[0]?.fileName || "Not available",
            caption: "The newest export appears here for quick verification.",
          },
          {
            label: "Preview rows",
            value: formatNumber(preview?.rows?.length || 0),
            caption: "A live preview helps explain the report before downloading it.",
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

      <div className="col-span-12 grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
        <SurfaceCard className="p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">Generate report</h2>
              <p className="text-sm text-brand-muted">Use focused filters to produce a clean export.</p>
            </div>
          </div>

          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleGenerate}>
            <FormField label="Report title">
              <TextInput value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Weekly energy summary" />
            </FormField>
            <FormField label="Report type">
              <SelectInput value={form.reportType} onChange={(event) => setForm((current) => ({ ...current, reportType: event.target.value }))}>
                {reportTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Export format">
              <SelectInput value={form.format} onChange={(event) => setForm((current) => ({ ...current, format: event.target.value }))}>
                {reportFormatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Room filter">
              <SelectInput value={form.roomId} onChange={(event) => setForm((current) => ({ ...current, roomId: event.target.value }))}>
                <option value="">All rooms</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Appliance filter">
              <SelectInput value={form.applianceId} onChange={(event) => setForm((current) => ({ ...current, applianceId: event.target.value }))}>
                <option value="">All appliances</option>
                {appliances.map((appliance) => (
                  <option key={appliance.id} value={appliance.id}>
                    {appliance.name}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Start date">
              <TextInput type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} />
            </FormField>
            <FormField label="End date">
              <TextInput type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} />
            </FormField>
            {mode === "admin" ? (
              <FormField label="User filter">
                <TextInput value={form.userId} onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))} placeholder="User ID" />
              </FormField>
            ) : null}
            <div className="md:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setForm(defaultForm)}>
                Reset
              </Button>
              <Button type="submit" disabled={submitting}>
                <Plus className="h-4 w-4" />
                {submitting ? "Generating..." : "Generate and download"}
              </Button>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">Preview and exports</h2>
              <p className="text-sm text-brand-muted">See the latest preview and the export history side by side.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {preview ? (
              <DataTable title="Latest preview" subtitle="The preview is generated directly from the chosen report filters." columns={previewColumns} rows={preview.rows || []} />
            ) : (
              <EmptyState title="No report preview yet" description="Generate a report to preview the rows before walking through the export history." />
            )}
          </div>
        </SurfaceCard>
      </div>

      <div className="col-span-12 grid gap-5 xl:grid-cols-[1fr,1fr]">
        <DataTable title="Generated reports" subtitle="A concise history of report generation inside the application." columns={reportColumns} rows={reports} />
        <DataTable title="Report exports" subtitle="CSV and PDF export records for the current workspace." columns={exportColumns} rows={exportsList} />
      </div>
    </div>
  );
}
