export function KpiStrip({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-3xl border border-slate-200/80 bg-white/75 p-4 surface-ring">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">{item.label}</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">{item.value}</p>
          <p className="mt-1 text-sm text-slate-600">{item.caption}</p>
        </div>
      ))}
    </div>
  );
}

