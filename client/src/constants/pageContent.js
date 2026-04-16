import { applianceRows, logRows, notificationRows, roomRows, userRows } from "./mockData";

const roomColumns = [
  { key: "name", label: "Room" },
  { key: "type", label: "Type" },
  { key: "occupancy", label: "Occupancy" },
  { key: "temperature", label: "Temperature" },
  { key: "light", label: "Light Level" },
  { key: "appliances", label: "Appliances" },
  { key: "status", label: "Status" },
];

const applianceColumns = [
  { key: "name", label: "Appliance" },
  { key: "room", label: "Room" },
  { key: "category", label: "Category" },
  { key: "mode", label: "Mode" },
  { key: "state", label: "State" },
  { key: "runtime", label: "Runtime" },
  { key: "usage", label: "Usage" },
];

const notificationColumns = [
  { key: "title", label: "Notification" },
  { key: "channel", label: "Channel" },
  { key: "audience", label: "Audience" },
  { key: "severity", label: "Severity" },
  { key: "state", label: "State" },
];

const userColumns = [
  { key: "name", label: "User" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email" },
  { key: "rooms", label: "Assigned Rooms" },
  { key: "status", label: "Status" },
];

const logColumns = [
  { key: "actor", label: "Actor" },
  { key: "module", label: "Module" },
  { key: "action", label: "Action" },
  { key: "timestamp", label: "Timestamp" },
];

function contentFactory(overrides) {
  return {
    eyebrow: "AHEMS workspace",
    title: "AHEMS Module",
    description:
      "This Phase 1 workspace anchors the premium user experience, shared dashboard structure, and deployment-ready information architecture.",
    primaryAction: "Create new",
    secondaryAction: "Export view",
    heroStats: [
      { label: "Automation health", value: "92%", caption: "Simulation baseline remains within configured policy limits." },
      { label: "Response time", value: "480ms", caption: "Average action propagation across controls, dashboards, and notifications." },
    ],
    metrics: [],
    chartTitle: "Operational trend",
    chartDescription: "Monitor how this area contributes to overall energy efficiency and automation responsiveness.",
    highlightDescription: "Surface the most important policies, exceptions, and workflow checkpoints for this module.",
    highlights: [],
    tableTitle: "Operational records",
    tableSubtitle: "Recent data points aligned to the current module context.",
    columns: roomColumns,
    rows: roomRows,
    ...overrides,
  };
}

export const pageContent = {
  rooms: contentFactory({
    eyebrow: "Room orchestration",
    title: "Room Management",
    description:
      "Model every room with occupancy states, environmental thresholds, room types, and appliance assignments in a single operational view.",
    metrics: [
      { label: "Tracked rooms", value: "12", trend: "+2 this week", tone: "success", helper: "New spaces are inheriting the latest default thresholds.", icon: "Home" },
      { label: "Occupied now", value: "7", trend: "58% occupancy", tone: "info", helper: "Live simulation state is synchronized across room cards and controls.", icon: "Users" },
      { label: "Threshold watch", value: "3", trend: "Needs review", tone: "warning", helper: "Kitchen, lounge, and studio have pending low-light warnings.", icon: "Activity" },
      { label: "Auto-ready", value: "10", trend: "Optimized", tone: "success", helper: "Rooms with valid automation thresholds and active assignments.", icon: "Zap" },
    ],
    highlights: [
      { title: "Structured room types", badge: "Model-ready", tone: "success", description: "Use room taxonomies to group lighting, climate, and occupancy strategies for faster automation design." },
      { title: "Threshold governance", badge: "Protected", tone: "info", description: "Room-specific temperature and light thresholds are visible before users push new simulation values." },
      { title: "Assigned-device context", badge: "Cross-linked", tone: "warning", description: "Each room surfaces related appliances, energy impact, and the next automation action likely to fire." },
    ],
    tableTitle: "Room portfolio",
    tableSubtitle: "Snapshot of currently modeled spaces across the resident environment.",
    columns: roomColumns,
    rows: roomRows,
  }),
  appliances: contentFactory({
    eyebrow: "Device control",
    title: "Appliance Management",
    description:
      "Coordinate device status, power ratings, dimming behavior, runtime estimates, and room assignments with manual and automatic control context.",
    metrics: [
      { label: "Registered devices", value: "28", trend: "4 pending sync", tone: "info", helper: "Lighting, HVAC, standby, and entertainment categories are all represented.", icon: "Lightbulb" },
      { label: "Auto mode", value: "19", trend: "68% coverage", tone: "success", helper: "Most appliances are eligible for rules-based actuation during simulation windows.", icon: "Zap" },
      { label: "Standby devices", value: "5", trend: "Energy save", tone: "info", helper: "Standby awareness improves cost estimation and idle-room alerting.", icon: "Shield" },
      { label: "Manual overrides", value: "3", trend: "Operator review", tone: "warning", helper: "A small subset is pinned for testing manual control scenarios.", icon: "Activity" },
    ],
    highlights: [
      { title: "Status-aware control", badge: "Granular", tone: "success", description: "Track ON, OFF, DIMMED, and STANDBY states with a premium control plane built for automation feedback loops." },
      { title: "Runtime intelligence", badge: "Estimated", tone: "info", description: "Projected runtime and kWh contribution stay attached to each appliance for future analytics flows." },
      { title: "Operational notes", badge: "Auditable", tone: "warning", description: "Preserve control intent, testing context, and review comments for every appliance card and detail view." },
    ],
    tableTitle: "Device inventory",
    tableSubtitle: "Priority appliances across the current simulation portfolio.",
    columns: applianceColumns,
    rows: applianceRows,
  }),
  sensors: contentFactory({
    eyebrow: "Simulation telemetry",
    title: "Sensor Simulation",
    description:
      "Drive temperature, light intensity, occupancy, and time-of-day inputs entirely in software while keeping readings room-aware and history-ready.",
    metrics: [
      { label: "Live reading streams", value: "36", trend: "Per room", tone: "info", helper: "Temperature, light, and occupancy are modeled independently for richer automation triggers.", icon: "Activity" },
      { label: "Manual overrides", value: "8", trend: "Recent tests", tone: "warning", helper: "Operators can stage special conditions without touching physical devices.", icon: "SlidersHorizontal" },
      { label: "Randomized sessions", value: "5", trend: "Adaptive", tone: "success", helper: "Randomization adds more realistic variance into the simulation engine.", icon: "Zap" },
      { label: "Rule-linked sensors", value: "14", trend: "Automation scope", tone: "info", helper: "Sensor streams currently referenced by one or more rule conditions.", icon: "Shield" },
    ],
    highlights: [
      { title: "Time-of-day modulation", badge: "Contextual", tone: "success", description: "Sensor behavior is framed around morning, afternoon, evening, and night to enrich simulated occupancy patterns." },
      { title: "Manual + random blend", badge: "Flexible", tone: "info", description: "Users can directly set room conditions or allow randomized simulation for QA and analytics testing." },
      { title: "History-first model", badge: "Traceable", tone: "warning", description: "Every reading pathway is designed to attach history and audit records once persistent flows are expanded." },
    ],
    tableTitle: "Simulation notifications",
    tableSubtitle: "Example sensor-driven messages and actions already supported in the UI foundation.",
    columns: notificationColumns,
    rows: notificationRows,
  }),
  automationRules: contentFactory({
    eyebrow: "Automation core",
    title: "Automation Rules Engine",
    description:
      "Build prioritized conditions and actions across rooms, devices, occupancy, lighting, and energy states with clear execution intent.",
    metrics: [
      { label: "Active rules", value: "11", trend: "4 high priority", tone: "info", helper: "Rules are grouped by scope and sequenced to avoid ambiguous behavior.", icon: "Zap" },
      { label: "Triggered today", value: "42", trend: "Stable", tone: "success", helper: "Most triggers came from evening occupancy and adaptive lighting strategies.", icon: "Activity" },
      { label: "Disabled rules", value: "2", trend: "Maintenance", tone: "warning", helper: "These rules remain visible for versioning and audit comparison.", icon: "Shield" },
      { label: "Action chains", value: "18", trend: "Multi-step", tone: "info", helper: "Rules can stage dimming, switching, and notification sequences.", icon: "Blocks" },
    ],
    highlights: [
      { title: "Priority-based execution", badge: "Sequenced", tone: "success", description: "High-value safety and efficiency rules surface ahead of convenience automations in both UI and API structures." },
      { title: "Room and device scope", badge: "Targeted", tone: "info", description: "Rules can act system-wide, per room, or down to individual appliances for simulation fidelity." },
      { title: "Execution visibility", badge: "Audited", tone: "warning", description: "Trigger logs, action history, and notification side effects are all represented in the Phase 1 structure." },
    ],
    tableTitle: "Rule-related notifications",
    tableSubtitle: "A quick look at how automation messages present across user groups.",
    columns: notificationColumns,
    rows: notificationRows,
  }),
  energyMonitoring: contentFactory({
    eyebrow: "Energy intelligence",
    title: "Energy Monitoring",
    description:
      "Review usage per appliance and room, compare daily versus monthly projections, and expose cost trends before thresholds are exceeded.",
    metrics: [
      { label: "Daily usage", value: "14.8 kWh", trend: "-6% vs target", tone: "success", helper: "The current simulation is tracking below the configured energy budget.", icon: "Zap" },
      { label: "Projected cost", value: "$112", trend: "Month-to-date", tone: "info", helper: "Cost estimates use tariff rates and appliance runtime contribution.", icon: "Activity" },
      { label: "Peak period load", value: "4.2 kWh", trend: "Observed", tone: "warning", helper: "Peak demand remains concentrated in office and lounge scenarios.", icon: "Lightbulb" },
      { label: "Top saving zone", value: "Kitchen", trend: "Optimized", tone: "success", helper: "The current rule mix is producing the best kWh reduction in this room.", icon: "Home" },
    ],
    highlights: [
      { title: "Room-to-room comparison", badge: "Benchmark", tone: "success", description: "Residents and admins can quickly compare high-consumption spaces and redirect automation strategy." },
      { title: "Tariff-ready costing", badge: "Finance aware", tone: "info", description: "Usage and cost views are already aligned to tariff settings and future export workflows." },
      { title: "Budget thresholding", badge: "Preventive", tone: "warning", description: "Projected overrun alerts are designed into the dashboard and notification systems from day one." },
    ],
    tableTitle: "Appliance usage detail",
    tableSubtitle: "Energy-facing overview of device runtime and estimated contribution.",
    columns: applianceColumns,
    rows: applianceRows,
  }),
  notifications: contentFactory({
    eyebrow: "Alert management",
    title: "Alerts and Notifications",
    description:
      "Deliver threshold breaches, rule events, abnormal usage, and operator messages through a structured notification command center.",
    metrics: [
      { label: "Unread alerts", value: "9", trend: "Needs triage", tone: "warning", helper: "Unread notifications are surfaced prominently to avoid missed actions.", icon: "Activity" },
      { label: "Critical issues", value: "2", trend: "High priority", tone: "danger", helper: "Critical alerts currently relate to projected spend and device idle behavior.", icon: "Shield" },
      { label: "Read rate", value: "71%", trend: "This week", tone: "success", helper: "Teams are responding well to in-app and email-triggered summaries.", icon: "Users" },
      { label: "Rule-linked notices", value: "14", trend: "Automation aware", tone: "info", helper: "Most notifications are tied directly to automation, occupancy, or energy events.", icon: "Zap" },
    ],
    highlights: [
      { title: "Severity routing", badge: "Tiered", tone: "success", description: "Message urgency is clearly distinguished through visual hierarchy, tone, and audience targeting." },
      { title: "Action-oriented copy", badge: "Clear", tone: "info", description: "Alerts explain what happened, where it happened, and which action should be taken next." },
      { title: "Threshold coverage", badge: "Comprehensive", tone: "warning", description: "High temperature, low light, idle devices, and monthly target exceedance are already modeled." },
    ],
    tableTitle: "Notification center",
    tableSubtitle: "Representative event mix across alert channels and audiences.",
    columns: notificationColumns,
    rows: notificationRows,
  }),
  reports: contentFactory({
    eyebrow: "Reporting studio",
    title: "Reports and Analytics",
    description:
      "Package usage reports, automation history, threshold violations, summaries, and export workflows into a commercial-grade analytics surface.",
    metrics: [
      { label: "Saved report views", value: "16", trend: "Reusable", tone: "info", helper: "Preset report filters streamline recurring operational reviews.", icon: "Blocks" },
      { label: "CSV exports", value: "24", trend: "Last 30 days", tone: "success", helper: "CSV remains ideal for downstream analysis and finance workflows.", icon: "Activity" },
      { label: "PDF exports", value: "11", trend: "Presentation-ready", tone: "info", helper: "PDF summaries support stakeholder sharing and approvals.", icon: "Shield" },
      { label: "Trend anomalies", value: "3", trend: "Flagged", tone: "warning", helper: "Outlier detection highlights unusual consumption before month-end closes.", icon: "Zap" },
    ],
    highlights: [
      { title: "Multiple summary lenses", badge: "Flexible", tone: "success", description: "The reporting shell supports room, appliance, automation, cost, and compliance-oriented summaries." },
      { title: "Export-ready design", badge: "Operational", tone: "info", description: "CSV and PDF pathways are represented in the UI, API, and database model for future runtime work." },
      { title: "Analytics-first framing", badge: "Insightful", tone: "warning", description: "KPI tiles and charts lead the experience before users drill into tabular details." },
    ],
    tableTitle: "Recent report activity",
    tableSubtitle: "Representative export and reporting events for the current account scope.",
    columns: logColumns,
    rows: logRows,
  }),
  profile: contentFactory({
    eyebrow: "Account workspace",
    title: "Profile",
    description:
      "Manage personal account details, role visibility, assigned spaces, and the user-facing footprint within the simulation platform.",
    metrics: [
      { label: "Profile completeness", value: "92%", trend: "Strong", tone: "success", helper: "Users have enough detail for alerts, logs, and assignment workflows.", icon: "Users" },
      { label: "Assigned rooms", value: "3", trend: "Resident scope", tone: "info", helper: "Room-specific actions stay visible in the user dashboard and notification center.", icon: "Home" },
      { label: "Recent updates", value: "4", trend: "Audited", tone: "info", helper: "Changes to preferences and profile data are logged for accountability.", icon: "Shield" },
      { label: "Security posture", value: "Healthy", trend: "JWT active", tone: "success", helper: "Session, password, and role-based protections are already scaffolded.", icon: "Activity" },
    ],
    highlights: [
      { title: "Role-aware visibility", badge: "Scoped", tone: "success", description: "Different personas see only the workspaces and controls aligned to their responsibilities." },
      { title: "Notification preferences", badge: "User-specific", tone: "info", description: "Account settings will govern how alerts, summaries, and warnings are delivered." },
      { title: "Audit alignment", badge: "Traceable", tone: "warning", description: "Profile changes are designed to remain visible in system logs and admin oversight views." },
    ],
    tableTitle: "Recent account activity",
    tableSubtitle: "Audit-friendly view of profile and account-related platform events.",
    columns: logColumns,
    rows: logRows,
  }),
  settings: contentFactory({
    eyebrow: "Configuration",
    title: "Settings",
    description:
      "Tune tariffs, defaults, alerts, room baselines, and report preferences through a settings foundation built for clarity and governance.",
    metrics: [
      { label: "Active tariff", value: "$0.42/kWh", trend: "Current", tone: "info", helper: "Tariff values flow directly into cost projection modules.", icon: "Zap" },
      { label: "Default temp threshold", value: "25°C", trend: "System baseline", tone: "success", helper: "Room defaults reduce repetitive setup for newly created spaces.", icon: "Activity" },
      { label: "Notification profiles", value: "3", trend: "Configured", tone: "info", helper: "Different alert policies can be attached to admin, users, and operators.", icon: "Users" },
      { label: "Settings changes", value: "5", trend: "Tracked", tone: "warning", helper: "Recent edits are designed to appear in the audit trail and reports.", icon: "Shield" },
    ],
    highlights: [
      { title: "Tariff-centric costing", badge: "Financial", tone: "success", description: "Energy cost projection remains anchored to configurable tariff inputs and effective dates." },
      { title: "Room defaults", badge: "Scalable", tone: "info", description: "New rooms inherit sensible thresholds and notification behaviors to speed up onboarding." },
      { title: "Policy visibility", badge: "Governed", tone: "warning", description: "Admin-level settings changes are modeled as auditable system events from the start." },
    ],
    tableTitle: "Configuration activity",
    tableSubtitle: "Representative settings and configuration changes already visible in the foundation.",
    columns: logColumns,
    rows: logRows,
  }),
  adminUsers: contentFactory({
    eyebrow: "Identity administration",
    title: "User Management",
    description:
      "Give administrators a high-clarity workspace for onboarding, assigning roles, monitoring access, and reviewing operational coverage.",
    metrics: [
      { label: "Total users", value: "18", trend: "Across roles", tone: "info", helper: "Admins, residents, and operators all share the same secure account system.", icon: "Users" },
      { label: "Pending invites", value: "2", trend: "Awaiting action", tone: "warning", helper: "Pending users remain visible until activation is completed.", icon: "Shield" },
      { label: "Active operators", value: "4", trend: "Scoped", tone: "success", helper: "Operator accounts can be constrained to assigned spaces and tasks.", icon: "Activity" },
      { label: "Role changes", value: "3", trend: "Recent", tone: "info", helper: "Administrative role changes are prepared for audit logging and review.", icon: "Blocks" },
    ],
    highlights: [
      { title: "Role-based governance", badge: "Secure", tone: "success", description: "Role assignment is central to route protection, navigation shaping, and API authorization." },
      { title: "Assignment visibility", badge: "Operational", tone: "info", description: "See who owns which rooms and how that impacts dashboards, alerts, and controls." },
      { title: "Audit-ready lifecycle", badge: "Tracked", tone: "warning", description: "Identity operations are structured to feed logs, reports, and system analytics." },
    ],
    tableTitle: "Platform users",
    tableSubtitle: "Current users grouped by role, assignment scope, and operational status.",
    columns: userColumns,
    rows: userRows,
  }),
  adminRooms: contentFactory({
    eyebrow: "Global room oversight",
    title: "Admin Room Control",
    description:
      "Manage all rooms across the platform, standardize defaults, and review occupancy and threshold posture from a system-wide perspective.",
    metrics: [
      { label: "Managed rooms", value: "24", trend: "Global", tone: "info", helper: "Admin sees system-wide room inventory beyond individual user ownership.", icon: "Home" },
      { label: "Template coverage", value: "83%", trend: "Standardized", tone: "success", helper: "Most rooms already inherit approved defaults and policy baselines.", icon: "Blocks" },
      { label: "Rooms on watch", value: "4", trend: "Escalate", tone: "warning", helper: "Threshold drift and inconsistent conditions are flagged for admin review.", icon: "Activity" },
      { label: "Cross-room rules", value: "9", trend: "Linked", tone: "info", helper: "System-wide automations often depend on room metadata consistency.", icon: "Zap" },
    ],
    highlights: [
      { title: "Standardization layer", badge: "Consistent", tone: "success", description: "Admins can align room defaults and threshold policies before local users customize them." },
      { title: "Occupancy governance", badge: "Visible", tone: "info", description: "Room occupancy states become easier to trust when admins can review drift from the center." },
      { title: "Assignment awareness", badge: "Context-rich", tone: "warning", description: "Administrative room views expose owners, devices, alerts, and rule influence at a glance." },
    ],
    tableTitle: "Global room registry",
    tableSubtitle: "System-wide room sample with status, occupancy, and device counts.",
    columns: roomColumns,
    rows: roomRows,
  }),
  adminAppliances: contentFactory({
    eyebrow: "Global device oversight",
    title: "Admin Appliance Control",
    description:
      "Supervise device fleets across the platform, enforce category standards, and identify appliances affecting energy and automation posture.",
    metrics: [
      { label: "Monitored devices", value: "84", trend: "Platform-wide", tone: "info", helper: "Admins can compare appliance estates beyond any single household or office zone.", icon: "Lightbulb" },
      { label: "Category aligned", value: "91%", trend: "Healthy", tone: "success", helper: "Consistent categorization keeps analytics and automation filters reliable.", icon: "Blocks" },
      { label: "Outlier usage", value: "6", trend: "Needs action", tone: "warning", helper: "These devices are contributing most to abnormal spend or runtime patterns.", icon: "Activity" },
      { label: "Rule-linked devices", value: "33", trend: "Automation scope", tone: "info", helper: "A significant portion of the fleet is already covered by automatic control logic.", icon: "Zap" },
    ],
    highlights: [
      { title: "Fleet health view", badge: "Strategic", tone: "success", description: "Administrative appliance insights are designed for both operational triage and policy improvement." },
      { title: "Category discipline", badge: "Normalized", tone: "info", description: "Device categories are modeled as first-class entities to improve navigation and reporting quality." },
      { title: "Usage anomaly watch", badge: "Preventive", tone: "warning", description: "The admin surface highlights abnormal runtime and cost contributors before they become systemic." },
    ],
    tableTitle: "Global device inventory",
    tableSubtitle: "Sample of cross-platform appliance oversight records.",
    columns: applianceColumns,
    rows: applianceRows,
  }),
  categories: contentFactory({
    eyebrow: "Taxonomy management",
    title: "Appliance Categories",
    description:
      "Keep device classifications clean, reusable, and visually coherent so energy analytics and automation scopes remain dependable.",
    metrics: [
      { label: "Categories", value: "9", trend: "Structured", tone: "info", helper: "Lighting, climate, entertainment, and safety categories are ready for expansion.", icon: "Blocks" },
      { label: "Mapped devices", value: "84", trend: "Covered", tone: "success", helper: "Every device should flow through a category to improve reporting and UX clarity.", icon: "Lightbulb" },
      { label: "Unused categories", value: "1", trend: "Review", tone: "warning", helper: "Unused categories are visible for cleanup or future provisioning.", icon: "Shield" },
      { label: "Analytics tags", value: "14", trend: "Ready", tone: "info", helper: "Category-driven metadata supports chart filtering and report segmentation.", icon: "Activity" },
    ],
    highlights: [
      { title: "Cleaner reporting", badge: "Consistent", tone: "success", description: "Well-managed categories make every analytic tile and export easier to understand." },
      { title: "Reusable styling", badge: "Design-led", tone: "info", description: "Category colors and icons help the interface feel coherent across dashboards and management views." },
      { title: "Operational hygiene", badge: "Maintained", tone: "warning", description: "Admins can quickly spot redundant or outdated labels before they ripple across the product." },
    ],
    tableTitle: "Category-linked devices",
    tableSubtitle: "Illustrative device mapping associated with current category strategy.",
    columns: applianceColumns,
    rows: applianceRows,
  }),
  adminSensors: contentFactory({
    eyebrow: "Simulation governance",
    title: "Admin Sensor Oversight",
    description:
      "Review sensor simulation quality across rooms and users while keeping overrides, history, and anomaly review visible from the center.",
    metrics: [
      { label: "Reading channels", value: "72", trend: "Across all rooms", tone: "info", helper: "Platform-wide sensor streams remain easy to inspect and compare.", icon: "Activity" },
      { label: "Override events", value: "10", trend: "Recent", tone: "warning", helper: "Admin visibility helps validate operator and resident simulation changes.", icon: "SlidersHorizontal" },
      { label: "History integrity", value: "98%", trend: "Expected", tone: "success", helper: "The data model is prepared for durable sensor history and audit trails.", icon: "Shield" },
      { label: "Triggered alerts", value: "7", trend: "Investigate", tone: "warning", helper: "Sensor anomalies can be reviewed against notification and rule activity.", icon: "Zap" },
    ],
    highlights: [
      { title: "Cross-tenant simulation review", badge: "Admin view", tone: "success", description: "System administrators can spot poor threshold tuning and inconsistent testing behavior early." },
      { title: "Override accountability", badge: "Visible", tone: "info", description: "Who changed what and why becomes easier to trust once simulation events are centrally reviewed." },
      { title: "Signal-to-action mapping", badge: "Connected", tone: "warning", description: "Sensor streams remain linked to rules, notifications, dashboards, and reports in the Phase 1 model." },
    ],
    tableTitle: "Sensor-triggered notices",
    tableSubtitle: "Example notifications driven by simulated environment changes.",
    columns: notificationColumns,
    rows: notificationRows,
  }),
  adminAutomationRules: contentFactory({
    eyebrow: "Automation governance",
    title: "Admin Automation Control",
    description:
      "Monitor rule quality, prioritization, and scope across the whole system while keeping trigger volume and execution trust front and center.",
    metrics: [
      { label: "System rules", value: "21", trend: "Global view", tone: "info", helper: "Admins can compare all room, device, and shared automation definitions in one space.", icon: "Zap" },
      { label: "Priority conflicts", value: "1", trend: "Review", tone: "warning", helper: "Low conflict counts indicate healthy sequencing and scope discipline.", icon: "Shield" },
      { label: "Success rate", value: "96%", trend: "Healthy", tone: "success", helper: "Rule execution history is shaping a reliable automation posture.", icon: "Activity" },
      { label: "Rule owners", value: "6", trend: "Distributed", tone: "info", helper: "Ownership metadata supports accountability across teams and spaces.", icon: "Users" },
    ],
    highlights: [
      { title: "Central rule governance", badge: "Strategic", tone: "success", description: "Admins can manage shared automation guardrails without losing visibility into local rule behavior." },
      { title: "Execution trust", badge: "Measured", tone: "info", description: "Trigger history and action outcomes make automation tuning more precise over time." },
      { title: "Conflict prevention", badge: "Monitored", tone: "warning", description: "Priority and scope views help prevent competing rules from producing noisy experiences." },
    ],
    tableTitle: "Automation event sample",
    tableSubtitle: "Operational activity representing rule changes and trigger history.",
    columns: logColumns,
    rows: logRows,
  }),
  adminNotifications: contentFactory({
    eyebrow: "Alert governance",
    title: "Admin Notification Center",
    description:
      "Manage notification templates, severity mix, channel strategy, and audience targeting for the entire simulation platform.",
    metrics: [
      { label: "Templates", value: "18", trend: "Reusable", tone: "info", helper: "A consistent message library keeps communication clear across modules.", icon: "Blocks" },
      { label: "Critical volume", value: "4", trend: "Today", tone: "danger", helper: "Critical events are isolated for fast escalation and accountability.", icon: "Shield" },
      { label: "Delivery mix", value: "3", trend: "In-app, email, push", tone: "info", helper: "Multiple channels help match urgency with appropriate attention levels.", icon: "Users" },
      { label: "Read compliance", value: "74%", trend: "Improving", tone: "success", helper: "Admin review can identify teams or roles missing important messages.", icon: "Activity" },
    ],
    highlights: [
      { title: "Channel strategy", badge: "Deliberate", tone: "success", description: "Different event types can be routed through different channels to reduce alert fatigue." },
      { title: "Audience segmentation", badge: "Scoped", tone: "info", description: "Admins can shape who should receive which class of event before rollout scales further." },
      { title: "Severity normalization", badge: "Reliable", tone: "warning", description: "The platform distinguishes informational, warning, and critical states in a consistent way." },
    ],
    tableTitle: "Notification portfolio",
    tableSubtitle: "Current alert patterns across audiences and delivery channels.",
    columns: notificationColumns,
    rows: notificationRows,
  }),
  adminReports: contentFactory({
    eyebrow: "Executive analytics",
    title: "Admin Reporting Suite",
    description:
      "Bring system-wide insights, exports, and operational summaries into one presentation-ready reporting workspace.",
    metrics: [
      { label: "Executive packs", value: "6", trend: "Prepared", tone: "success", helper: "Curated summaries support stakeholder updates and governance reviews.", icon: "Shield" },
      { label: "Export jobs", value: "35", trend: "Recent", tone: "info", helper: "The reporting engine is structured for recurring CSV and PDF delivery.", icon: "Activity" },
      { label: "Anomaly flags", value: "5", trend: "Observed", tone: "warning", helper: "Admin reports surface unusual usage patterns before they spread broadly.", icon: "Zap" },
      { label: "Cost deltas", value: "-8%", trend: "Month-on-month", tone: "success", helper: "Simulated controls are already moving the system toward more efficient behavior.", icon: "Lightbulb" },
    ],
    highlights: [
      { title: "Stakeholder-ready views", badge: "Premium", tone: "success", description: "The admin reporting screen is designed to feel polished enough for executive review sessions." },
      { title: "Multi-angle analysis", badge: "Broad", tone: "info", description: "Room, appliance, notification, and automation data can converge into one analytics story." },
      { title: "Export discipline", badge: "Audited", tone: "warning", description: "Export events remain visible for accountability and compliance monitoring." },
    ],
    tableTitle: "Report and export activity",
    tableSubtitle: "Representative analytics and export events across the system.",
    columns: logColumns,
    rows: logRows,
  }),
  logs: contentFactory({
    eyebrow: "Audit trail",
    title: "Logs and Activity",
    description:
      "Review login activity, rule changes, profile updates, command execution, and administrative actions from a clean audit console.",
    metrics: [
      { label: "Log entries", value: "1,284", trend: "Indexed", tone: "info", helper: "The schema already supports granular audit trails across the platform.", icon: "Shield" },
      { label: "Security-relevant", value: "18", trend: "Today", tone: "warning", helper: "Sensitive actions can be filtered and reviewed separately.", icon: "Users" },
      { label: "Automation events", value: "267", trend: "Tracked", tone: "success", helper: "Rule-driven actions stay tied to timestamps and actors when applicable.", icon: "Zap" },
      { label: "Export actions", value: "9", trend: "Monitored", tone: "info", helper: "Administrative report generation remains visible for compliance review.", icon: "Activity" },
    ],
    highlights: [
      { title: "Cross-module history", badge: "Unified", tone: "success", description: "Instead of siloed logs, the system is structured around one coherent activity model." },
      { title: "Security traceability", badge: "Strong", tone: "info", description: "Authentication, profile, rule, and settings changes all have a place in the audit trail." },
      { title: "Operational forensics", badge: "Practical", tone: "warning", description: "Admins can diagnose what happened before, during, and after a threshold event or rule trigger." },
    ],
    tableTitle: "Activity ledger",
    tableSubtitle: "Representative log events spanning multiple modules and users.",
    columns: logColumns,
    rows: logRows,
  }),
  adminSettings: contentFactory({
    eyebrow: "System governance",
    title: "Admin Settings",
    description:
      "Manage system-wide defaults, tariff settings, report preferences, security posture, and notification policies from a governance-ready configuration center.",
    metrics: [
      { label: "Policy sets", value: "7", trend: "Active", tone: "info", helper: "Admins can group defaults into practical operating bundles as the platform expands.", icon: "Blocks" },
      { label: "Tariff versions", value: "3", trend: "Tracked", tone: "success", helper: "Version-aware tariff settings improve cost history accuracy over time.", icon: "Zap" },
      { label: "Security controls", value: "5", trend: "Healthy", tone: "success", helper: "JWT auth, protected routes, and role checks are already baked into the foundation.", icon: "Shield" },
      { label: "Pending reviews", value: "2", trend: "Needs sign-off", tone: "warning", helper: "Some global settings changes are ready for operational confirmation.", icon: "Activity" },
    ],
    highlights: [
      { title: "Global defaults", badge: "Controlled", tone: "success", description: "Centralized defaults keep onboarding and room creation faster without sacrificing consistency." },
      { title: "Tariff intelligence", badge: "Structured", tone: "info", description: "Cost estimation becomes more trustworthy when tariffs are versioned and explicitly managed." },
      { title: "Governance clarity", badge: "Executive-ready", tone: "warning", description: "The settings experience is shaped to feel premium and trustworthy for serious operational use." },
    ],
    tableTitle: "System configuration activity",
    tableSubtitle: "Representative administrative configuration events across the platform.",
    columns: logColumns,
    rows: logRows,
  }),
};

export { applianceColumns, logColumns, notificationColumns, roomColumns, userColumns };
