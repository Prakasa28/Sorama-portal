"use client";

import { useState, useMemo } from "react";
import { MeasurementCard } from "./measurementCard";
import { SearchBar } from "./searchBar";
import { MeasurementsFilters, type DateFilter, type SeverityFilter, type TypeFilter } from "./measurementsFilters";
import {
  matchesDate,
  matchesSearch,
  matchesSeverity,
  matchesType,
} from "../utils/measurementsFilters";
import{ MobileFilterSheet } from "./mobileFilterSheet";
import type { FolderEntry } from "../types/measurements";

type Props = {
  folders: FolderEntry[];
};

export function MeasurementsOverview({folders}:Props) {
   
   const [search, setSearch] = useState("");
   const [typeFilter, setTypeFilter] = useState<TypeFilter>("");
   const [dateFilter, setDateFilter] = useState<DateFilter>("");
   const [severityFilter, setSeverityFilter] = useState<SeverityFilter>(""); 
   const [isFilterOpen, setIsFilterOpen] = useState(false); 

    const clearFilters = () => {
    setTypeFilter("");
    setDateFilter("");
    setSeverityFilter("");
  };

  const filteredFolders = useMemo(() => {
    return folders.filter((folder) => {
      return (
        matchesSearch(folder, search) &&
        matchesType(folder, typeFilter) &&
        matchesDate(folder.metadata.dateTime, dateFilter) &&
        matchesSeverity(folder, severityFilter)
      );
    });
  }, [folders, search, typeFilter, dateFilter, severityFilter]);

  return (
    <main className="measurements-page">
        <SearchBar value={search} onChange={setSearch} placeholder="Search measurements..." />

        <MobileFilterSheet
          isOpen={isFilterOpen}
          onOpen={() => setIsFilterOpen(true)}
          onClose={() => setIsFilterOpen(false)}
          typeFilter={typeFilter}
          dateFilter={dateFilter}
          severityFilter={severityFilter}
          onApply={({ typeFilter, dateFilter, severityFilter }) => {
            setTypeFilter(typeFilter);
            setDateFilter(dateFilter);
            setSeverityFilter(severityFilter);
          }}
          onClear={clearFilters}
        />

        <div className="desktop-filters">
        <MeasurementsFilters
          typeFilter={typeFilter}
          dateFilter={dateFilter}
          severityFilter={severityFilter}
          onTypeChange={setTypeFilter}
          onDateChange={setDateFilter}
          onSeverityChange={setSeverityFilter}
          onClear={() => {
            setSearch("");
            setTypeFilter("");
            setDateFilter("");
            setSeverityFilter("");
          }}
        />
        </div>   
        
        <section className="measurements-grid">
            {folders.length === 0 ? (
                <p className="measurements-empty"> waiting for device data...</p>
            ) :  filteredFolders.length === 0 ? (
              <p className="measurements-empty">No measurements found.</p>
            ) :(
                filteredFolders.map((folder) => (
                    <MeasurementCard key={folder.name} folder={folder} />
                ))
            )}
        </section>
    </main>
  );
}