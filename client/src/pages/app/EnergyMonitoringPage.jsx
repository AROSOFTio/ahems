import { Bolt, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingState } from "../../components/ui/LoadingState";
import { useAuth } from "../../hooks/useAuth";
import { analyticsService } from "../../services/analyticsService";
import { formatCurrency, formatNumber } from "../../utils/format";

export function EnergyMonitoringPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const payload = await analyticsService.getEnergy(token);
        if (!ignore) setData(payload);
      } catch {
        if (!ignore) {
          setData({
            summary: { totalUsageKwh: 0, totalCost: 0 },
            tariff: { currency: "USD" }
          });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, [token]);

  if (loading) return <LoadingState />;

  const usage = data?.summary?.totalUsageKwh || 0;
  const cost = data?.summary?.totalCost || 0;
  const currency = data?.tariff?.currency || "USD";

  return (
    <div className="page-shell">
      <div className="flex h-full w-full flex-col gap-6 lg:flex-row lg:items-stretch justify-center pt-8">
        
        {/* Total Usage Card */}
        <div className="flex-1 rounded-[2.5rem] bg-gradient-to-br from-brand-primary to-brand-secondary p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-center items-center min-h-[300px]">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Bolt className="h-48 w-48" />
          </div>
          <div className="relative z-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md mb-6">
              <Bolt className="h-10 w-10 text-white" />
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-accent">Total Usage</p>
            <h2 className="mt-4 font-display text-6xl md:text-7xl font-extrabold tracking-tight">
              {formatNumber(usage, 1)} <span className="text-3xl md:text-4xl text-white/70">kWh</span>
            </h2>
          </div>
        </div>

        {/* Total Cost Card */}
        <div className="flex-1 rounded-[2.5rem] bg-white ring-1 ring-slate-200/50 p-8 shadow-sm relative overflow-hidden flex flex-col justify-center items-center min-h-[300px]">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <Wallet className="h-48 w-48 text-brand-primary" />
          </div>
          <div className="relative z-10 text-center">
             <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-primary/10 mb-6">
              <Wallet className="h-10 w-10 text-brand-primary" />
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Estimated Cost</p>
            <h2 className="mt-4 font-display text-6xl md:text-7xl font-extrabold tracking-tight text-slate-950">
              {formatCurrency(cost, currency)}
            </h2>
          </div>
        </div>

      </div>
    </div>
  );
}
