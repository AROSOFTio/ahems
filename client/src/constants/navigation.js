import {
  Activity,
  Bell,
  Blocks,
  FileText,
  Gauge,
  Home,
  LayoutDashboard,
  Lightbulb,
  Settings,
  ShieldCheck,
  UserRoundCog,
  Users,
  Zap,
} from "lucide-react";

export const appNavigation = [
  { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard, roles: ["resident", "operator"] },
  { label: "Rooms", path: "/app/rooms", icon: Home, roles: ["resident", "operator"] },
  { label: "Appliances", path: "/app/appliances", icon: Lightbulb, roles: ["resident", "operator"] },
  { label: "Simulation Lab", path: "/app/sensors", icon: Activity, roles: ["resident", "operator"] },
  { label: "Automation", path: "/app/automation-rules", icon: ShieldCheck, roles: ["resident"] },
  { label: "Energy", path: "/app/energy-monitoring", icon: Zap, roles: ["resident", "operator"] },
  { label: "Notifications", path: "/app/notifications", icon: Bell, roles: ["resident", "operator"] },
  { label: "Reports", path: "/app/reports", icon: FileText, roles: ["resident", "operator"] },
  { label: "Settings", path: "/app/settings", icon: Settings, roles: ["resident", "operator"] },
  { label: "Profile", path: "/app/profile", icon: UserRoundCog, roles: ["resident", "operator"] },
];

export const adminNavigation = [
  { label: "Dashboard", path: "/admin/dashboard", icon: Gauge, roles: ["admin"] },
  { label: "Users", path: "/admin/users", icon: Users, roles: ["admin"] },
  { label: "Rooms", path: "/admin/rooms", icon: Home, roles: ["admin"] },
  { label: "Appliances", path: "/admin/appliances", icon: Lightbulb, roles: ["admin"] },
  { label: "Lookups", path: "/admin/categories", icon: Blocks, roles: ["admin"] },
  { label: "Automation", path: "/admin/automation-rules", icon: ShieldCheck, roles: ["admin"] },
  { label: "Notifications", path: "/admin/notifications", icon: Bell, roles: ["admin"] },
  { label: "Reports", path: "/admin/reports", icon: FileText, roles: ["admin"] },
  { label: "Logs", path: "/admin/logs", icon: Activity, roles: ["admin"] },
  { label: "Settings", path: "/admin/settings", icon: Settings, roles: ["admin"] },
];

export const routeTitles = [
  ...appNavigation,
  ...adminNavigation,
  { label: "Home", path: "/" },
  { label: "Sensors", path: "/admin/sensors" },
  { label: "Login", path: "/login" },
  { label: "Register", path: "/register" },
  { label: "Forgot Password", path: "/forgot-password" },
  { label: "Reset Password", path: "/reset-password" },
];

export function getRouteTitle(pathname) {
  const exactMatch = routeTitles.find((item) => item.path === pathname);

  if (exactMatch) {
    return exactMatch.label;
  }

  if (pathname.startsWith("/app/rooms/")) return "Room Details";
  if (pathname.startsWith("/app/appliances/")) return "Appliance Details";
  if (pathname.startsWith("/admin/rooms/")) return "Room Details";
  if (pathname.startsWith("/admin/appliances/")) return "Appliance Details";

  return "AHEMS";
}
