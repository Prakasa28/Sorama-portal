"use client";

import { useState, useMemo } from "react";
import { useWebRTC } from "../hooks/useWebRTC";
import { MeasurementCard } from "./measurementCard";
import { SearchBar } from "./searchBar";


export function MeasurementsOverview() {
  const { folders } = useWebRTC();  
   const [search, setSearch] = useState("");

  const filteredFolders = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) return folders;

    return folders.filter((folder) =>
      folder.name.toLowerCase().includes(searchValue)
    );
  }, [folders, search]);

  return (
    <main className="measurements-page">
        <SearchBar value={search} onChange={setSearch} placeholder="Search measurements..." />
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