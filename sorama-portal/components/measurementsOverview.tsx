"use client";

import { useState, useMemo } from "react";
import { MeasurementCard } from "./measurementCard";
import { SearchBar } from "./searchBar";
import { matchesSearch } from "../utils/measurementsFilters";
import type { FolderEntry } from "../types/measurements";
import { RecordingOverview } from "./recordingOverview";

type Props = {
  folders: FolderEntry[];
  thumbnailUrls: Record<string, string>;
  requestFile: (folder: string, file: string) => boolean;
  recordingMetadata: Record<string, any>;
  requestMetadata: (folder: string) => boolean;
  fileUrls: Record<string, string>;
  requestDownloadFile: (folder: string, file: string) => boolean;
  requestFileBlob: (folder: string, file: string) => Promise<Blob | null>;
};

export function MeasurementsOverview({
  folders,
  thumbnailUrls,
  requestFile,
  recordingMetadata,
  requestMetadata,
  fileUrls,
  requestDownloadFile,
  requestFileBlob,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<FolderEntry | null>(null);

  const filteredFolders = useMemo(
    () => folders.filter((folder) => matchesSearch(folder, search)),
    [folders, search]
  );

  if (selectedFolder) {
    return (
      <RecordingOverview
        folder={selectedFolder}
        search={search}
        onSearchChange={setSearch}
        thumbnailUrls={thumbnailUrls}
        requestFile={requestFile}
        fileUrls={fileUrls}
        requestDownloadFile={requestDownloadFile}
        requestFileBlob={requestFileBlob}
        onBack={() => setSelectedFolder(null)}
        requestMetadata={requestMetadata}
        recordingMetadata={recordingMetadata}
      />
    );
  }

  return (
    <main className="measurements-page">
      <SearchBar value={search} onChange={setSearch} placeholder="Search measurements..." />

      <section className="measurements-grid">
        {folders.length === 0 ? (
          <p className="measurements-empty">Waiting for device data...</p>
        ) : filteredFolders.length === 0 ? (
          <p className="measurements-empty">No measurements found.</p>
        ) : (
          filteredFolders.map((folder) => (
            <MeasurementCard
              key={folder.name}
              folder={folder}
              onClick={() => setSelectedFolder(folder)}
            />
          ))
        )}
      </section>
    </main>
  );
}
