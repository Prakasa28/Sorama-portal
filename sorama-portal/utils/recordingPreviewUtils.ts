export function getReadableType(type?: string) {
  if (type === "leakDetection") return "Leak Inspection";
  if (type === "partialDischarge") return "Partial Discharge Inspection";
  if (type === "severityIndex") return "Severity Index Report";
  if (type === "image") return "Image";
  if (type === "video") return "Video";

  return "Recording";
}

export function shouldShowMetadataPanel(type?: string) {
  return type === "leakDetection" || type === "partialDischarge" || type === "severityIndex";
}

export function formatDate(dateTime?: string) {
  if (!dateTime) return "-";
  return new Date(dateTime).toLocaleString();
}

export function formatValue(value?: number, unit?: string) {
  if (value === undefined || value === null) return "-";

  const rounded = Math.round(value * 100) / 100;
  return unit ? `${rounded} ${unit}` : `${rounded}`;
}
