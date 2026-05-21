import type { FolderEntry, MeasurementMetadata } from "../types/measurements";
import type { DateFilter, SeverityFilter, TypeFilter } from "../components/measurementsFilters";

export function matchesSearch(folder: FolderEntry, search: string) {
  return folder.name.toLowerCase().includes(search.toLowerCase().trim());
}

export function matchesType(folder: FolderEntry, filter: TypeFilter) {
  if (!filter) return true;
  if (!folder.metadata) return false;

  return folder.metadata.type === filter;
}

export function matchesDate(dateTime: string, filter: DateFilter) {
  if (!filter) return true;

  const measurementDate = new Date(dateTime).getTime();
  const now = Date.now();

  const ranges = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };

  return now - measurementDate <= ranges[filter];
}

export function matchesSeverity(folder: FolderEntry, filter: SeverityFilter) {
  if (!filter) return true;
  if (!folder.metadata) return false;

  return getMetadataSeverity(folder.metadata) === filter;
}

export function getMetadataSeverity(metadata?: MeasurementMetadata | null): SeverityFilter {
  if (!metadata) return "";

  if (metadata.type === "leakDetection") {
    const rate = metadata.ldMetadata?.results.rate ?? 0;

    if (rate > 15) return "high";
    if (rate > 10) return "medium";
    return "low";
  }

  const external = metadata.pdMetadata?.results.externalPercentage ?? 0;

  if (external >= 80) return "high";
  if (external >= 40) return "medium";
  return "low";
}
