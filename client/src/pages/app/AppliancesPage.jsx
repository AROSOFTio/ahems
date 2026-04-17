import { Fan, Lightbulb, Power, Tv } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingState } from "../../components/ui/LoadingState";
import { useAuth } from "../../hooks/useAuth";
import { applianceService } from "../../services/applianceService";
import { cn } from "../../utils/cn";

export function AppliancesPage() {
  const { token } = useAuth();
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await applianceService.list(token);
        if (!ignore) setAppliances(data);
      } catch {
        if (!ignore) setAppliances([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, [token]);

  async function toggleAppliance(id, currentStatus) {
    const newStatus = currentStatus === "ON" ? "OFF" : "ON";
    
    // Optimistic UI update
    setAppliances(current => 
      current.map(app => app.id === id ? { ...app, status: newStatus } : app)
    );

    try {
      await applianceService.update(id, { status: newStatus }, token);
    } catch {
      // Revert on failure
      setAppliances(current => 
        current.map(app => app.id === id ? { ...app, status: currentStatus } : app)
      );
    }
  }

  function getIcon(name, categoryName) {
    const search = `${name} ${categoryName}`.toLowerCase();
    if (search.includes("tv") || search.includes("television")) return Tv;
    if (search.includes("ac") || search.includes("fan") || search.includes("conditioner")) return Fan;
    return Lightbulb;
  }

  if (loading) return <LoadingState />;

  return (
    <div className="page-shell">
      <div className="col-span-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {appliances.map((appliance) => {
          const Icon = getIcon(appliance.name, appliance.categoryName);
          const isOn = appliance.status === "ON" || appliance.status === "DIMMED";

          return (
            <div key={appliance.id} className="relative overflow-hidden rounded-[2rem] bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-md transition-all hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                  isOn ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30" : "bg-slate-100 text-slate-400"
                )}>
                  <Icon className="h-7 w-7" />
                </div>
                
                <button
                  onClick={() => toggleAppliance(appliance.id, appliance.status)}
                  className={cn(
                    "flex h-10 w-16 items-center rounded-full p-1 transition-colors",
                    isOn ? "bg-brand-success" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-full bg-white shadow-sm transition-transform",
                    isOn ? "translate-x-6" : "translate-x-0"
                  )}>
                    <Power className={cn(
                      "h-full w-full p-2",
                      isOn ? "text-brand-success" : "text-slate-400"
                    )} />
                  </div>
                </button>
              </div>

              <div className="mt-6">
                <h3 className="font-display text-xl font-bold text-slate-900">{appliance.name}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    isOn ? "bg-brand-success" : "bg-slate-300"
                  )} />
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    {isOn ? "Active" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {appliances.length === 0 && (
           <div className="col-span-12 p-8 text-center text-slate-500 bg-white/70 rounded-3xl">No appliances available.</div>
        )}
      </div>
    </div>
  );
}
