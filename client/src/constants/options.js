export const roomOccupancyOptions = [
  { value: "OCCUPIED", label: "Occupied" },
  { value: "VACANT", label: "Vacant" },
  { value: "TRANSITIONAL", label: "Transitional" },
];

export const applianceStatusOptions = [
  { value: "ON", label: "On" },
  { value: "OFF", label: "Off" },
  { value: "DIMMED", label: "Dimmed" },
  { value: "STANDBY", label: "Standby" },
];

export const applianceModeOptions = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTO", label: "Auto" },
];

export const timeOfDayOptions = [
  { value: "MORNING", label: "Morning" },
  { value: "AFTERNOON", label: "Afternoon" },
  { value: "EVENING", label: "Evening" },
  { value: "NIGHT", label: "Night" },
];

export const commandSourceOptions = [
  { value: "BUTTON", label: "Quick action" },
  { value: "VOICE", label: "Preset voice" },
  { value: "TYPED", label: "Typed command" },
];

export const commandActionPresets = [
  { value: "TURN_ON", label: "Turn on" },
  { value: "TURN_OFF", label: "Turn off" },
  { value: "DIM", label: "Dim" },
  { value: "RESTORE_BRIGHTNESS", label: "Restore brightness" },
  { value: "SET_MODE_AUTO", label: "Set auto mode" },
  { value: "SET_MODE_MANUAL", label: "Set manual mode" },
  { value: "SET_STANDBY", label: "Standby" },
];

export const automationScopeOptions = [
  { value: "ROOM", label: "Room scope" },
  { value: "DEVICE", label: "Appliance scope" },
  { value: "SYSTEM", label: "System scope" },
];

export const automationMetricOptions = [
  { value: "TEMPERATURE", label: "Temperature" },
  { value: "LIGHT", label: "Light level" },
  { value: "OCCUPANCY", label: "Occupancy" },
  { value: "TIME_OF_DAY", label: "Time of day" },
  { value: "ENERGY_USAGE", label: "Energy usage" },
  { value: "DEVICE_STATUS", label: "Device status" },
];

export const automationOperatorOptions = [
  { value: "GT", label: "Greater than" },
  { value: "LT", label: "Less than" },
  { value: "EQ", label: "Equals" },
  { value: "GTE", label: "Greater or equal" },
  { value: "LTE", label: "Less or equal" },
  { value: "NEQ", label: "Not equal" },
  { value: "IN", label: "In list" },
];

export const automationActionOptions = [
  { value: "TURN_ON", label: "Turn on" },
  { value: "TURN_OFF", label: "Turn off" },
  { value: "DIM", label: "Dim" },
  { value: "RESTORE_BRIGHTNESS", label: "Restore brightness" },
  { value: "SET_MODE_AUTO", label: "Set auto mode" },
  { value: "SET_MODE_MANUAL", label: "Set manual mode" },
  { value: "SEND_NOTIFICATION", label: "Send notification" },
];

export const notificationSeverityOptions = [
  { value: "INFO", label: "Info" },
  { value: "SUCCESS", label: "Success" },
  { value: "WARNING", label: "Warning" },
  { value: "DANGER", label: "Danger" },
];

export const reportTypeOptions = [
  { value: "ROOM_USAGE", label: "Room usage" },
  { value: "APPLIANCE_USAGE", label: "Appliance usage" },
  { value: "AUTOMATION_HISTORY", label: "Automation history" },
  { value: "ENERGY_SUMMARY", label: "Energy summary" },
  { value: "COST_SUMMARY", label: "Cost summary" },
  { value: "THRESHOLD_VIOLATIONS", label: "Threshold violations" },
  { value: "ACTIVE_VS_INACTIVE", label: "Active vs inactive" },
  { value: "TREND", label: "Trend report" },
];

export const reportFormatOptions = [
  { value: "CSV", label: "CSV export" },
  { value: "PDF", label: "PDF export" },
];
