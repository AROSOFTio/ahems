import { SurfaceCard } from "./SurfaceCard";

export function DataTable({ title, subtitle, columns, rows }) {
  return (
    <SurfaceCard className="overflow-hidden">
      <div className="border-b border-slate-200/70 px-6 py-5">
        <h3 className="font-display text-lg font-bold text-slate-950">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-brand-muted">{subtitle}</p> : null}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/70">
          <thead className="bg-slate-50/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white/60">
            {rows.map((row, index) => (
              <tr key={`${row[columns[0].key]}-${index}`} className="hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-slate-700">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}

