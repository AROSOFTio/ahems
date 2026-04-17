import { Activity, RefreshCcw, Thermometer, Sun, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/ui/LoadingState";
import { useAuth } from "../../hooks/useAuth";
import { simulationService } from "../../services/simulationService";
import { formatPercent, formatTemperature } from "../../utils/format";

export function SensorsPage() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await simulationService.getOverview(token);
      setRooms(data?.rooms || []);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  if (loading) return <LoadingState />;

  return (
    <div className="page-shell">
      <div className="col-span-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-success opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-success"></span>
          </span>
          <p className="text-sm font-bold tracking-wider text-slate-800 uppercase">Real-time Sensor Feed</p>
        </div>
        <Button onClick={() => load(true)} disabled={refreshing} className="gap-2">
          <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="col-span-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div key={room.id} className="col-span-12 grid gap-5 lg:col-span-1 border border-slate-200/60 rounded-[2rem] p-5 bg-white/70 backdrop-blur-sm">
            <h3 className="font-display font-bold text-lg text-slate-900 border-b border-slate-200/60 pb-3">{room.name}</h3>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <Thermometer className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Temperature</p>
                  <p className="text-xl font-bold text-slate-900">{formatTemperature(room.currentTemperature || 0)}</p>
                </div>
              </div>
              <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full bg-brand-success/10 text-brand-success">Active</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                  <Sun className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Light Intensity</p>
                  <p className="text-xl font-bold text-slate-900">{formatPercent(room.currentLightLevel || 0)}</p>
                </div>
              </div>
              <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full bg-brand-success/10 text-brand-success">Active</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Occupancy</p>
                  <p className="text-xl font-bold text-slate-900">{room.occupancyState === 'OCCUPIED' ? 'Occupied' : 'Vacant'}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full ${room.occupancyState === 'OCCUPIED' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-200 text-slate-600'}`}>
                {room.occupancyState === 'OCCUPIED' ? 'Active' : 'Standby'}
              </span>
            </div>
          </div>
        ))}
        {rooms.length === 0 && (
           <div className="col-span-12 p-8 text-center text-slate-500 bg-white/70 rounded-3xl">No sensor data available.</div>
        )}
      </div>
    </div>
  );
}
