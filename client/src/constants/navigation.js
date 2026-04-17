import { Activity, LayoutDashboard, Lightbulb, ShieldCheck, Zap } from "lucide-react";

export const navigation = [
  { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
  { label: "Sensors", path: "/app/sensors", icon: Activity },
  { label: "Appliances", path: "/app/appliances", icon: Lightbulb },
  { label: "Automation", path: "/app/automation-rules", icon: ShieldCheck },
  { label: "Energy", path: "/app/energy-monitoring", icon: Zap },
];

export const routeTitles = [
  ...navigation,
  { label: "Login", path: "/login" },
];

export function getRouteTitle(pathname) {
  const exactMatch = routeTitles.find((item) => item.path === pathname);
  if (exactMatch) {
    return exactMatch.label;
  }
  return "AHEMS";
}
