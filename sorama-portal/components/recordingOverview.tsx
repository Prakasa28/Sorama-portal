"use client";

import { useEffect, useState } from "react";
import type { FolderEntry } from "../types/measurements";

import { SearchBar } from "./searchBar";
import {
  MeasurementsFilters,
  type DateFilter,
  type SeverityFilter,
  type TypeFilter,
} from "./measurementsFilters";
import { MobileFilterSheet } from "./mobileFilterSheet";
import { RecordingPreview } from "./recordingPreview";
import { RecordingCard } from "./recordingCard";
import { RecordingSelectionBar } from "./recordingSelectionBar";
import { DownloadNameModal } from "./downloadNameModal";

import { matchesDate, getMetadataSeverity } from "../utils/measurementsFilters";
import { getRecordingDownload } from "@/utils/getRecordingDownload";
import { useRecordingExports } from "../hooks/useRecordingExports";

type Props = {
  folder: FolderEntry;
  search: string;
  onSearchChange: (value: string) => void;
  thumbnailUrls: Record<string, string>;
  recordingMetadata: Record<string, any>;
  requestFile: (folder: string, file: string) => boolean;
  requestMetadata: (folder: string) => boolean;
  onBack: () => void;
  fileUrls: Record<string, string>;
  requestDownloadFile: (folder: string, file: string) => boolean;
  requestFileBlob: (folder: string, file: string) => Promise<Blob | null>;
};

export function RecordingOverview({
  folder,
  search,
  onSearchChange,
  thumbnailUrls,
  recordingMetadata,
  requestFile,
  requestMetadata,
  onBack,
  fileUrls,
  requestDownloadFile,
  requestFileBlob,
}: Props) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [selectedRecording, setSelectedRecording] = useState<{
    name: string;
    path: string;
    downloadFile: string;
  } | null>(null);

  const [selectedRecordings, setSelectedRecordings] = useState<string[]>([]);
  const [isDownloadNameOpen, setIsDownloadNameOpen] = useState(false);
  const [downloadName, setDownloadName] = useState(`${folder.name}-selected-recordings`);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [downloadMode, setDownloadMode] = useState<"zip" | "mergedPdf">("zip");

  const { getRecordingEntry, downloadSelectedAsZip, downloadSelectedReportsAsMergedPdf } =
    useRecordingExports({
      folder,
      selectedRecordings,
      recordingMetadata,
      requestFileBlob,
    });

  const filteredRecordings = folder.files.filter((recordingName) => {
    const recordingPath = `${folder.name}/${recordingName}`;
    const metadata = recordingMetadata[`${recordingPath}/metadata.json`];

    const matchesSearchValue = recordingName.toLowerCase().includes(search.toLowerCase().trim());

    const matchesTypeValue = !typeFilter || metadata?.type === typeFilter;

    const matchesDateValue =
      !dateFilter || (metadata?.dateTime && matchesDate(metadata.dateTime, dateFilter));

    const matchesSeverityValue =
      !severityFilter || getMetadataSeverity(metadata) === severityFilter;

    return matchesSearchValue && matchesTypeValue && matchesDateValue && matchesSeverityValue;
  });

  useEffect(() => {
    for (const recordingName of filteredRecordings) {
      const recordingPath = `${folder.name}/${recordingName}`;
      const thumbnailKey = `${recordingPath}/thumbnail.jpeg`;
      const metadataKey = `${recordingPath}/metadata.json`;

      if (!thumbnailUrls[thumbnailKey]) {
        const started = requestFile(recordingPath, "thumbnail.jpeg");
        if (started) return;
      }

      if (!recordingMetadata[metadataKey]) {
        const started = requestMetadata(recordingPath);
        if (started) return;
      }
    }
  }, [
    folder.name,
    filteredRecordings,
    thumbnailUrls,
    recordingMetadata,
    requestFile,
    requestMetadata,
  ]);

  if (selectedRecording) {
    return (
      <RecordingPreview
        recordingName={selectedRecording.name}
        recordingPath={selectedRecording.path}
        downloadFile={selectedRecording.downloadFile}
        fileUrls={fileUrls}
        recordingMetadata={recordingMetadata}
        requestDownloadFile={requestDownloadFile}
        requestFile={requestFile}
        requestMetadata={requestMetadata}
        onBack={() => setSelectedRecording(null)}
      />
    );
  }

  const allSelected =
    filteredRecordings.length > 0 &&
    filteredRecordings.every((name) => selectedRecordings.includes(name));

  function toggleRecording(recordingName: string) {
    setSelectedRecordings((current) =>
      current.includes(recordingName)
        ? current.filter((name) => name !== recordingName)
        : [...current, recordingName]
    );
  }

  function toggleSelectAll() {
    setSelectedRecordings(allSelected ? [] : filteredRecordings);
  }

  async function handleNamedDownload() {
    const safeName =
      downloadName.trim() ||
      (downloadMode === "zip"
        ? `${folder.name}-selected-recordings`
        : `${folder.name}-merged-reports`);

    if (downloadMode === "zip") {
      await downloadSelectedAsZip(safeName);
    } else {
      await downloadSelectedReportsAsMergedPdf(safeName);
    }

    setIsDownloadNameOpen(false);
  }

  return (
    <main className="measurements-page">
      <SearchBar value={search} onChange={onSearchChange} placeholder="Search recordings..." />

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
            setTypeFilter("");
            setDateFilter("");
            setSeverityFilter("");
          }}
        />
      </div>

      <button type="button" className="recording-back" onClick={onBack}>
        Back to folders
      </button>

      <RecordingSelectionBar
        allSelected={allSelected}
        selectedCount={selectedRecordings.length}
        isDownloadMenuOpen={isDownloadMenuOpen}
        onToggleSelectAll={toggleSelectAll}
        onToggleDownloadMenu={() => setIsDownloadMenuOpen((current) => !current)}
        onDownloadZip={() => {
          setDownloadMode("zip");
          setDownloadName(`${folder.name}-selected-recordings`);
          setIsDownloadNameOpen(true);
          setIsDownloadMenuOpen(false);
        }}
        onMergePdf={() => {
          setDownloadMode("mergedPdf");
          setDownloadName(`${folder.name}-merged-reports`);
          setIsDownloadNameOpen(true);
          setIsDownloadMenuOpen(false);
        }}
      />

      {isDownloadNameOpen && (
        <DownloadNameModal
          mode={downloadMode}
          value={downloadName}
          onChange={setDownloadName}
          onCancel={() => setIsDownloadNameOpen(false)}
          onDownload={handleNamedDownload}
        />
      )}

      <section className="measurements-grid">
        {filteredRecordings.map((recordingName) => {
          const recordingPath = `${folder.name}/${recordingName}`;
          const metadataKey = `${recordingPath}/metadata.json`;
          const thumbnailKey = `${recordingPath}/thumbnail.jpeg`;

          const metadata = recordingMetadata[metadataKey];
          const thumbnailUrl = thumbnailUrls[thumbnailKey];
          const recording = getRecordingEntry(recordingName);

          const downloadConfig = getRecordingDownload(
            metadata?.type,
            recordingName,
            recording?.report,
            recording?.image,
            recording?.video
          );

          return (
            <RecordingCard
              key={recordingName}
              recordingName={recordingName}
              metadata={metadata}
              thumbnailUrl={thumbnailUrl}
              isSelected={selectedRecordings.includes(recordingName)}
              downloadLabel={downloadConfig.label}
              onToggleSelect={() => toggleRecording(recordingName)}
              onOpen={() =>
                setSelectedRecording({
                  name: recordingName,
                  path: recordingPath,
                  downloadFile: downloadConfig.file,
                })
              }
              onDownload={() => requestDownloadFile(recordingPath, downloadConfig.file)}
            />
          );
        })}
      </section>
    </main>
  );
}
