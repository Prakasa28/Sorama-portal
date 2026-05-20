"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { FolderEntry } from "../types/measurements";
import { SearchBar } from "./searchBar";
import { matchesDate, getMetadataSeverity, } from "../utils/measurementsFilters";
import {
  MeasurementsFilters,
  type DateFilter,
  type SeverityFilter,
  type TypeFilter,
} from "./measurementsFilters";
import { MobileFilterSheet } from "./mobileFilterSheet";
import { RecordingPreview } from "./recordingPreview";
import { getRecordingDownload } from "@/utils/getRecordingDownload";
import JSZip from "jszip";
import { getReadableType } from "@/utils/recordingPreviewUtils";
import { PDFDocument } from "pdf-lib";


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
} | null>(null);
const [selectedRecordings, setSelectedRecordings] = useState<string[]>([]);
const [isZipNameOpen, setIsZipNameOpen] = useState(false);
const [zipName, setZipName] = useState(`${folder.name}-selected-recordings`);
const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
const [downloadMode, setDownloadMode] = useState<"zip" | "mergedPdf">("zip");


  
  
const filteredRecordings = folder.files.filter((recordingName) => {
  const recordingPath = `${folder.name}/${recordingName}`;
  const metadataKey = `${recordingPath}/metadata.json`;
  const metadata = recordingMetadata[metadataKey];
  // const thumbnailKey = `${recordingPath}/thumbnail.jpeg`;
  // const thumbnailUrl = thumbnailUrls[thumbnailKey];

  console.log("Recording filter debug:", {
  recordingName,
  metadataKey,
  metadata,
});

  const matchesSearchValue = recordingName
    .toLowerCase()
    .includes(search.toLowerCase().trim());

  const matchesTypeValue =
  !typeFilter || metadata?.type === typeFilter;

  const matchesDateValue =
    !dateFilter || (metadata?.dateTime && matchesDate(metadata.dateTime, dateFilter));

  const matchesSeverityValue =
    !severityFilter || getMetadataSeverity(metadata) === severityFilter;

  return (
    matchesSearchValue &&
    matchesTypeValue &&
    matchesDateValue &&
    matchesSeverityValue
  );
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

function getRecordingEntry(recordingName: string) {
  return folder.recordings?.find(
    (recording) => recording.name === recordingName
  );
}

function getFilesForRecording(recordingName: string, metadata: any) {
  const recording = getRecordingEntry(recordingName);

  const files = ["metadata.json"];

  if (recording?.thumbnail) {
    files.push(recording.thumbnail);
  }

  if (metadata?.type === "video" && recording?.video) {
    files.push(recording.video);
  }

  if (metadata?.type !== "video" && recording?.image) {
    files.push(recording.image);
  }

  if (recording?.report) {
    files.push(recording.report);
  }

  return files;
}

async function downloadSelectedAsZip() {
  const zip = new JSZip();

  for (const recordingName of selectedRecordings) {
    const recordingPath = `${folder.name}/${recordingName}`;
    const metadata = recordingMetadata[`${recordingPath}/metadata.json`];

    const files = getFilesForRecording(recordingName, metadata);

    for (const file of files) {
      const blob = await requestBlobWithRetry(recordingPath, file);

      if (blob) {
        zip.file(`${recordingName}/${file}`, blob);
      } else {
        console.warn("Could not add file to ZIP:", recordingPath, file);
      }
    }
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });

  const safeZipName = zipName.trim() || `${folder.name}-selected-recordings`;

  downloadBlob(zipBlob, `${safeZipName}.zip`);
  setIsZipNameOpen(false);
}

function isReportType(type?: string) {
  return (
    type === "leakDetection" ||
    type === "partialDischarge" ||
    type === "severityIndex"
  );
}

async function downloadSelectedReportsAsMergedPdf() {
  const mergedPdf = await PDFDocument.create();

  for (const recordingName of selectedRecordings) {
    const recordingPath = `${folder.name}/${recordingName}`;
    const metadata = recordingMetadata[`${recordingPath}/metadata.json`];

    if (!isReportType(metadata?.type)) continue;

    const recording = getRecordingEntry(recordingName);
    const reportFile = recording?.report;

    if (!reportFile) continue;

    const blob = await requestBlobWithRetry(recordingPath, reportFile);
    if (!blob) continue;

    const bytes = await blob.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

    pages.forEach((page) => mergedPdf.addPage(page));
  }

  if (mergedPdf.getPageCount() === 0) {
    alert("No report PDFs found in the selected recordings.");
    return;
  }

  const mergedBytes = await mergedPdf.save();
  const mergedBlob = new Blob([mergedBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });

  const safeName = zipName.trim() || `${folder.name}-merged-reports`;

  downloadBlob(mergedBlob, `${safeName}.pdf`);
  setIsZipNameOpen(false);
}


function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

async function requestBlobWithRetry(folder: string, file: string) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const blob = await requestFileBlob(folder, file);

    if (blob) return blob;

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return null;
}


  return (
    <main className="measurements-page">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Search recordings..."
      />

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

      <div className="recording-selection-bar">
        <label>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
          />
          Select all
        </label>

        <div className="recording-download-menu">
  <button
    type="button"
    disabled={selectedRecordings.length === 0}
    onClick={() => setIsDownloadMenuOpen((current) => !current)}
  >
    Download selected
    {selectedRecordings.length > 0 && ` (${selectedRecordings.length})`}
  </button>

  {isDownloadMenuOpen && selectedRecordings.length > 0 && (
    <div className="recording-download-dropdown">
        <button
          type="button"
          className="recording-download-dropdown__item"
          onClick={() => {
            setDownloadMode("zip");
            setZipName(`${folder.name}-selected-recordings`);
            setIsZipNameOpen(true);
            setIsDownloadMenuOpen(false);
          }}
        >
          Download as ZIP
        </button>

        <button
          type="button"
          className="recording-download-dropdown__item"
          onClick={() => {
            setDownloadMode("mergedPdf");
            setZipName(`${folder.name}-merged-reports`);
            setIsZipNameOpen(true);
            setIsDownloadMenuOpen(false);
          }}
        >
          Merge reports into PDF
        </button>
     </div>
        )}
      </div>
      </div>

      {isZipNameOpen && (
        <div className="zip-modal">
          <div className="zip-modal__panel">
            <h2>
              {downloadMode === "zip"
                ? "Name your ZIP file"
                : "Name your merged PDF"}
            </h2>

            <input
              type="text"
              value={zipName}
              onChange={(event) => setZipName(event.target.value)}
              placeholder="Enter ZIP file name"
            />

            <div className="zip-modal__actions">
              <button type="button" onClick={() => setIsZipNameOpen(false)}>
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  downloadMode === "zip"
                    ? downloadSelectedAsZip
                    : downloadSelectedReportsAsMergedPdf
                }
              >
                {downloadMode === "zip" ? "Download ZIP" : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="measurements-grid">
        {filteredRecordings.map((recordingName) => {
          const recordingPath = `${folder.name}/${recordingName}`;
          const thumbnailKey = `${recordingPath}/thumbnail.jpeg`;
          const metadataKey = `${recordingPath}/metadata.json`;

          const thumbnailUrl = thumbnailUrls[thumbnailKey];
          const metadata = recordingMetadata[metadataKey];
          const recording = getRecordingEntry(recordingName);

          const recordingDate = metadata?.dateTime
            ? new Date(metadata.dateTime).toLocaleString()
            : "Loading date...";

           const downloadConfig = getRecordingDownload(
              metadata?.type,
              recordingName,
              recording?.report,
              recording?.image,
              recording?.video
            );

          return (
            <article key={recordingName}  className={`recording-card ${
                selectedRecordings.includes(recordingName)
                  ? "recording-card--selected"
                  : ""}`}>

               <label className="recording-card__checkbox">
                  <input
                    type="checkbox"
                    checked={selectedRecordings.includes(recordingName)}
                    onChange={() => toggleRecording(recordingName)}
                  />
                </label>

              <h2 className="recording-card__title">{recordingName}</h2>

              <div className="recording-card__type">
                {getReadableType(metadata?.type)}
              </div>

              <div className="recording-card__meta">
                <span className="recording-card__date">
                  {recordingDate}
                </span>
              </div>
              
              <div className="recording-card__preview">
                {thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt={recordingName}
                    width={260}
                    height={220}
                    className="recording-card__thumbnail"
                    unoptimized
                  />
                ) : (
                  <p className="recording-card__loading">Loading...</p>
                )}
              </div>

              <button type="button" className="recording-card__open" 
                    onClick={() =>
                    setSelectedRecording({
                      name: recordingName,
                      path: recordingPath,
                    })
              }>
                <Image src="/images/icons/preview.svg" alt="" width={18} height={18} />
                Open
              </button>
               
               <button
                    type="button"
                    className="recording-card__download"
                    onClick={() =>
                      requestDownloadFile(recordingPath, downloadConfig.file)
                    }
                >
                    <Image
                      src="/images/icons/download.svg"
                      alt=""
                      width={18}
                      height={18}
                    />
                    {downloadConfig.label}
               </button>
            </article>
          );
        })}
      </section>
    </main>
  );
}