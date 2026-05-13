import { FilterChip } from "./filterchips";

export type TypeFilter =
  | ""
  | "leakDetection"
  | "partialDischarge"
  | "severityIndex"
  | "image"
  | "video";
export type DateFilter = "" | "24h" | "7d" | "30d";
export type SeverityFilter = "" | "low" | "medium" | "high";

type Props = {
  typeFilter: TypeFilter;
  dateFilter: DateFilter;
  severityFilter: SeverityFilter;
  onTypeChange: (value: TypeFilter) => void;
  onDateChange: (value: DateFilter) => void;
  onSeverityChange: (value: SeverityFilter) => void;
  onClear: () => void;
};

export function MeasurementsFilters({
  typeFilter,
  dateFilter,
  severityFilter,
  onTypeChange,
  onDateChange,
  onSeverityChange,
  onClear,
}: Props) {
  const hasFilters = typeFilter || dateFilter || severityFilter;

  return (
    <div className="filter-chips">
      <FilterChip<TypeFilter>
        value={typeFilter}
        onChange={onTypeChange}
        options={[
          { label: "All Types", value: "" },
          { label: "Leak Detection", value: "leakDetection" },
          { label: "Partial Discharge", value: "partialDischarge" },
          { label: "Severity Index", value: "severityIndex" },
          { label: "Image", value: "image" },
          { label: "Video", value: "video" },
        ]}
      />

      <FilterChip<DateFilter>
        value={dateFilter}
        onChange={onDateChange}
        options={[
          { label: "Any Date", value: "" },
          { label: "Last 24 Hours", value: "24h" },
          { label: "Last 7 Days", value: "7d" },
          { label: "Last 30 Days", value: "30d" },
        ]}
      />

      <FilterChip<SeverityFilter>
        value={severityFilter}
        onChange={onSeverityChange}
        options={[
          { label: "All Severities", value: "" },
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" },
        ]}
      />

      {hasFilters && (
        <button
          type="button"
          className="filter-chip filter-chip--button"
          onClick={onClear}
        >
          Clear
        </button>
      )}
    </div>
  );
}