"use client";

import { useEffect, useState } from "react";
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

  onApply: (filters: {
    typeFilter: TypeFilter;
    dateFilter: DateFilter;
    severityFilter: SeverityFilter;
  }) => void;
};

export function MobileFilterSheet({
  isOpen,
  onOpen,
  onClose,
  typeFilter,
  dateFilter,
  severityFilter,
  onApply,
}: Props) {
  const [draftType, setDraftType] = useState<TypeFilter>(typeFilter);
  const [draftDate, setDraftDate] = useState<DateFilter>(dateFilter);
  const [draftSeverity, setDraftSeverity] =
    useState<SeverityFilter>(severityFilter);

  useEffect(() => {
    if (!isOpen) return;

    setDraftType(typeFilter);
    setDraftDate(dateFilter);
    setDraftSeverity(severityFilter);
  }, [isOpen, typeFilter, dateFilter, severityFilter]);

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
              typeFilter={draftType}
              dateFilter={draftDate}
              severityFilter={draftSeverity}
              onTypeChange={setDraftType}
              onDateChange={setDraftDate}
              onSeverityChange={setDraftSeverity}
              onClear={() => {
                setDraftType("");
                setDraftDate("");
                setDraftSeverity("");
              }}
            />

            <button
              type="button"
              className="filter-sheet__apply"
              onClick={() => {
                onApply({
                  typeFilter: draftType,
                  dateFilter: draftDate,
                  severityFilter: draftSeverity,
                });

                onClose();
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}