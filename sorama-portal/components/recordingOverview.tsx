"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { FolderEntry } from "../types/measurements";
import { SearchBar } from "./searchBar";

type Props = {
  folder: FolderEntry;
  search: string;
  onSearchChange: (value: string) => void;
  thumbnailUrls: Record<string, string>;
  recordingMetadata: Record<string, any>;
  requestFile: (folder: string, file: string) => boolean;
  requestMetadata: (folder: string) => boolean;
  onBack: () => void;
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
}: Props) {
  const filteredRecordings = folder.files.filter((recordingName) =>
    recordingName.toLowerCase().includes(search.toLowerCase().trim())
  );

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

  return (
    <main className="measurements-page">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Search recordings..."
      />

      <button type="button" className="recording-back" onClick={onBack}>
        ← Back to folders
      </button>

      <section className="measurements-grid">
        {filteredRecordings.map((recordingName) => {
          const recordingPath = `${folder.name}/${recordingName}`;
          const thumbnailKey = `${recordingPath}/thumbnail.jpeg`;
          const metadataKey = `${recordingPath}/metadata.json`;

          const thumbnailUrl = thumbnailUrls[thumbnailKey];
          const metadata = recordingMetadata[metadataKey];

          const recordingDate = metadata?.dateTime
            ? new Date(metadata.dateTime).toLocaleString()
            : "Loading date...";

          return (
            <article key={recordingName} className="recording-card">
              <h2 className="recording-card__title">{recordingName}</h2>

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

              <button type="button" className="recording-card__open">
                <Image src="/images/icons/preview.svg" alt="" width={18} height={18} />
                Open
              </button>
            </article>
          );
        })}
      </section>
    </main>
  );
}