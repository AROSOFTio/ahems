export function formatCurrency(value, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value < 10 ? 2 : 0,
  }).format(Number(value || 0));
}

export function formatNumber(value, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(Number(value || 0));
}

export function formatTemperature(value) {
  return `${formatNumber(value, 1)} C`;
}

export function formatPercent(value) {
  return `${formatNumber(value, 0)}%`;
}

export function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function getStatusTone(status) {
  const normalized = String(status || "").toUpperCase();

  if (["ON", "ACTIVE", "SUCCESS", "READY", "AUTO", "OCCUPIED", "TRIGGERED"].includes(normalized)) {
    return "success";
  }

  if (["DIMMED", "WARNING", "PENDING", "TRANSITIONAL"].includes(normalized)) {
    return "warning";
  }

  if (["OFF", "STANDBY", "INACTIVE", "VACANT"].includes(normalized)) {
    return "info";
  }

  if (["FAILED", "DANGER", "SUSPENDED"].includes(normalized)) {
    return "danger";
  }

  return "info";
}
