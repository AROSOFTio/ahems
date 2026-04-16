export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1">
        <h2 className="font-display text-xl font-bold text-slate-950">{title}</h2>
        {description ? <p className="max-w-2xl text-sm text-brand-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

