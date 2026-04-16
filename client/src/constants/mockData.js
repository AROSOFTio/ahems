export const energyTrend = [
  { period: "Mon", usage: 14.2, cost: 6.3, automation: 82 },
  { period: "Tue", usage: 13.7, cost: 6.1, automation: 86 },
  { period: "Wed", usage: 15.4, cost: 7.2, automation: 79 },
  { period: "Thu", usage: 12.8, cost: 5.8, automation: 90 },
  { period: "Fri", usage: 16.1, cost: 7.4, automation: 88 },
  { period: "Sat", usage: 17.3, cost: 8.1, automation: 84 },
  { period: "Sun", usage: 13.2, cost: 6.0, automation: 92 },
];

export const occupancyTrend = [
  { name: "Living Room", occupied: 78, vacant: 22 },
  { name: "Kitchen", occupied: 54, vacant: 46 },
  { name: "Bedroom", occupied: 62, vacant: 38 },
  { name: "Office", occupied: 69, vacant: 31 },
];

export const roomClimate = [
  { room: "Living Room", temperature: 24, light: 82 },
  { room: "Kitchen", temperature: 22, light: 74 },
  { room: "Bedroom", temperature: 23, light: 48 },
  { room: "Office", temperature: 21, light: 68 },
];

export const alertsFeed = [
  {
    title: "Idle room with active lighting",
    description: "Kitchen occupancy dropped to zero while ceiling panel remained dimmed at 45%.",
    severity: "warning",
    time: "4 minutes ago",
  },
  {
    title: "Automation rule restored brightness",
    description: "Evening ambience rule raised the lounge strip from 30% to 58%.",
    severity: "success",
    time: "12 minutes ago",
  },
  {
    title: "Projected monthly target crossed",
    description: "Home office plug cluster is trending 8% above the configured budget baseline.",
    severity: "danger",
    time: "26 minutes ago",
  },
];

export const activityFeed = [
  {
    action: "Voice simulation",
    summary: 'Command "Set office lights to focus mode" executed successfully.',
    timestamp: "09:42",
  },
  {
    action: "Automation engine",
    summary: "Temperature safeguard toggled bedroom fan to standby after threshold recovery.",
    timestamp: "09:18",
  },
  {
    action: "Operator review",
    summary: "Occupancy override applied to living room for visitor simulation testing.",
    timestamp: "08:53",
  },
];

export const roomRows = [
  {
    name: "Living Room",
    type: "Shared Space",
    occupancy: "Occupied",
    temperature: "24°C",
    light: "82%",
    appliances: "6",
    status: "Stable",
  },
  {
    name: "Kitchen",
    type: "Utility",
    occupancy: "Vacant",
    temperature: "22°C",
    light: "74%",
    appliances: "4",
    status: "Watch",
  },
  {
    name: "Home Office",
    type: "Work",
    occupancy: "Occupied",
    temperature: "21°C",
    light: "68%",
    appliances: "8",
    status: "Optimized",
  },
];

export const applianceRows = [
  {
    name: "Ceiling Panel",
    room: "Living Room",
    category: "Lighting",
    mode: "AUTO",
    state: "DIMMED",
    runtime: "5.8h",
    usage: "1.84 kWh",
  },
  {
    name: "Smart Fan",
    room: "Bedroom",
    category: "Climate",
    mode: "AUTO",
    state: "STANDBY",
    runtime: "4.2h",
    usage: "0.96 kWh",
  },
  {
    name: "Desk Strip",
    room: "Home Office",
    category: "Lighting",
    mode: "MANUAL",
    state: "ON",
    runtime: "7.1h",
    usage: "2.14 kWh",
  },
];

export const notificationRows = [
  {
    title: "High temperature threshold",
    channel: "In-app",
    audience: "Residents",
    severity: "Warning",
    state: "Unread",
  },
  {
    title: "Rule execution summary",
    channel: "Email",
    audience: "Admin",
    severity: "Info",
    state: "Read",
  },
  {
    title: "Projected cost exceeded",
    channel: "Push",
    audience: "Operators",
    severity: "Critical",
    state: "Unread",
  },
];

export const userRows = [
  {
    name: "Amina Kato",
    role: "Admin",
    email: "admin@ahems.io",
    rooms: "All",
    status: "Active",
  },
  {
    name: "Jonah Okello",
    role: "Resident",
    email: "resident@ahems.io",
    rooms: "3",
    status: "Active",
  },
  {
    name: "Grace Namutebi",
    role: "Operator",
    email: "operator@ahems.io",
    rooms: "2",
    status: "Pending Review",
  },
];

export const logRows = [
  {
    actor: "admin@ahems.io",
    module: "Automation",
    action: "Updated high-temp fallback rule",
    timestamp: "2026-04-16 09:10",
  },
  {
    actor: "resident@ahems.io",
    module: "Rooms",
    action: "Adjusted office lighting threshold",
    timestamp: "2026-04-16 08:34",
  },
  {
    actor: "operator@ahems.io",
    module: "Sensors",
    action: "Applied occupancy simulation override",
    timestamp: "2026-04-16 08:11",
  },
];

