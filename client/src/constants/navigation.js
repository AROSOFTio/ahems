import {
  Activity,
  Bell,
  Blocks,
  Bot,
  ChartBar,
  Gauge,
  Home,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Shield,
  SlidersHorizontal,
  UserRoundCog,
  Users,
  Zap,
} from "lucide-react";

export const publicNavigation = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Features", path: "/features" },
  { label: "Contact", path: "/contact" },
];

export const appNavigation = [
  { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
  { label: "Rooms", path: "/app/rooms", icon: Home },
  { label: "Appliances", path: "/app/appliances", icon: Lightbulb },
  { label: "Sensors", path: "/app/sensors", icon: Activity },
  { label: "Automation Rules", path: "/app/automation-rules", icon: Bot },
  { label: "Energy Monitoring", path: "/app/energy-monitoring", icon: Zap },
  { label: "Notifications", path: "/app/notifications", icon: Bell },
  { label: "Reports", path: "/app/reports", icon: ChartBar },
  { label: "Profile", path: "/app/profile", icon: UserRoundCog },
  { label: "Settings", path: "/app/settings", icon: Settings },
];

export const adminNavigation = [
  { label: "Dashboard", path: "/admin/dashboard", icon: Gauge },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Rooms", path: "/admin/rooms", icon: Home },
  { label: "Appliances", path: "/admin/appliances", icon: Lightbulb },
  { label: "Categories", path: "/admin/categories", icon: Blocks },
  { label: "Sensors", path: "/admin/sensors", icon: Activity },
  { label: "Automation Rules", path: "/admin/automation-rules", icon: Bot },
  { label: "Notifications", path: "/admin/notifications", icon: Bell },
  { label: "Reports", path: "/admin/reports", icon: ChartBar },
  { label: "Logs", path: "/admin/logs", icon: Shield },
  { label: "Settings", path: "/admin/settings", icon: SlidersHorizontal },
];

export const routeTitles = [
  ...publicNavigation,
  ...appNavigation,
  ...adminNavigation,
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

  return "AHEMS";
}

