import { ChevronDown } from "lucide-react";

type Option<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

export function FilterChip<T extends string>({ value, options, onChange }: Props<T>) {
  return (
    <div className="filter-chip-wrapper">
      <select
        className="filter-chip"
        name="type-filter"
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value || "all"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown className="filter-chip__icon" />
    </div>
  );
}
