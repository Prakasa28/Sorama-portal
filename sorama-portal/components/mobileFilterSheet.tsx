import { SlidersHorizontal } from "lucide-react";
import {
  MeasurementsFilters,
  type DateFilter,
  type SeverityFilter,
  type TypeFilter,
} from "./measurementsFilters";

type Props = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;

  typeFilter: TypeFilter;
  dateFilter: DateFilter;
  severityFilter: SeverityFilter;

  onTypeChange: (value: TypeFilter) => void;
  onDateChange: (value: DateFilter) => void;
  onSeverityChange: (value: SeverityFilter) => void;
  onClear: () => void;
};

export function MobileFilterSheet({
  isOpen,
  onOpen,
  onClose,
  typeFilter,
  dateFilter,
  severityFilter,
  onTypeChange,
  onDateChange,
  onSeverityChange,
  onClear,
}: Props) {
  return (
    <>
      <button type="button" className="mobile-filter-button" onClick={onOpen}>
        <SlidersHorizontal size={18} />
        Filters
      </button>

      {isOpen && (
        <div className="filter-sheet">
          <button
            type="button"
            className="filter-sheet__overlay"
            onClick={onClose}
            aria-label="Close filters"
          />

          <div className="filter-sheet__panel">
            <div className="filter-sheet__header">
              <h2>Filters</h2>

              <button type="button" onClick={onClose}>
                ✕
              </button>
            </div>

            <MeasurementsFilters
              typeFilter={typeFilter}
              dateFilter={dateFilter}
              severityFilter={severityFilter}
              onTypeChange={onTypeChange}
              onDateChange={onDateChange}
              onSeverityChange={onSeverityChange}
              onClear={onClear}
            />

            <button
              type="button"
              className="filter-sheet__apply"
              onClick={onClose}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}