"use client";

import { useState, useMemo } from "react";
import { useWebRTC } from "../hooks/useWebRTC";
import { MeasurementCard } from "./measurementCard";
import { SearchBar } from "./searchBar";
import { MeasurementsFilters, type DateFilter, type SeverityFilter, type TypeFilter } from "./measurementsFilters";
import {
  matchesDate,
  matchesSearch,
  matchesSeverity,
  matchesType,
} from "../utils/measurementsFilters";


export function MeasurementsOverview() {
  const { folders } = useWebRTC();  
   const [search, setSearch] = useState("");
   const [typeFilter, setTypeFilter] = useState<TypeFilter>("");
   const [dateFilter, setDateFilter] = useState<DateFilter>("");
   const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("");  

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