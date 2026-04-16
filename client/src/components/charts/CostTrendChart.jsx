import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SurfaceCard } from "../ui/SurfaceCard";

export function CostTrendChart({ data, title, description }) {
  return (
    <SurfaceCard className="p-6">
      <div className="mb-6 space-y-1">
        <h3 className="font-display text-lg font-bold text-slate-950">{title}</h3>
        <p className="text-sm text-brand-muted">{description}</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
            <Line
              type="monotone"
              dataKey="cost"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ fill: "#06b6d4", r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SurfaceCard>
  );
}

