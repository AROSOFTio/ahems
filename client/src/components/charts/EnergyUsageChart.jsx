import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SurfaceCard } from "../ui/SurfaceCard";

export function EnergyUsageChart({ data, title, description }) {
  return (
    <SurfaceCard className="p-6">
      <div className="mb-6 space-y-1">
        <h3 className="font-display text-lg font-bold text-slate-950">{title}</h3>
        <p className="text-sm text-brand-muted">{description}</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3543bb" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3543bb" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="period" stroke="#64748b" tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 18,
                border: "1px solid #e2e8f0",
                boxShadow: "0 20px 40px rgba(15, 23, 42, 0.10)",
              }}
            />
            <Area
              type="monotone"
              dataKey="usage"
              stroke="#3543bb"
              fillOpacity={1}
              fill="url(#usageGradient)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SurfaceCard>
  );
}

