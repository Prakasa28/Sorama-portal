"use client";

import { useEffect, useState } from "react";
import { ImageIcon, FileText } from "lucide-react";
import { PreviewInfoPanel } from "./previewInfoPanel";
import { PreviewMedia } from "./previewMedia";
import { shouldShowMetadataPanel } from "../utils/recordingPreviewUtils";
import { getRecordingDownload } from "@/utils/getRecordingDownload";

type Props = {
  recordingName: string;
  recordingPath: string;
  downloadFile: string;
  fileUrls: Record<string, string>;
  recordingMetadata: Record<string, any>;
  requestFile: (folder: string, file: string) => boolean;
  requestMetadata: (folder: string) => boolean;
  requestDownloadFile: (folder: string, file: string) => boolean;
  onBack: () => void;
};

export function RecordingPreview({
  recordingName,
  recordingPath,
  downloadFile,
  fileUrls,
  recordingMetadata,
  requestFile,
  requestMetadata,
  requestDownloadFile,
  onBack,
}: Props) {
  const [mobileView, setMobileView] = useState<"media" | "details">("media");
  const metadataKey = `${recordingPath}/metadata.json`;
  const metadata = recordingMetadata[metadataKey];

  const imageUrl = fileUrls[`${recordingPath}/image.jpeg`];
  const videoUrl = fileUrls[`${recordingPath}/video.mp4`];
  const downloadLabel = getRecordingDownload(metadata?.type, recordingName).label;

  useEffect(() => {
    if (!metadata) {
      requestMetadata(recordingPath);
      return;
    }

    if (metadata.type === "video") {
      if (!videoUrl) requestFile(recordingPath, "video.mp4");
      return;
    }

    if (!imageUrl) {
      requestFile(recordingPath, "image.jpeg");
    }
  }, [metadata, imageUrl, videoUrl, recordingPath, requestFile, requestMetadata]);

  const showMetadataPanel = shouldShowMetadataPanel(metadata?.type);
  const hideToggle = metadata?.type === "video" || metadata?.type === "image";

  return (
    <main className="recording-preview-page">
      <button type="button" className="recording-back" onClick={onBack}>
        Back to recordings
      </button>

      {!hideToggle && <div className="recording-preview-toggle">
        <button
          type="button"
          className={mobileView === "media" ? "active" : ""}
          onClick={() => setMobileView("media")}
          aria-label="Image view"
        >
          <ImageIcon size={18} />
        </button>

        <button
          type="button"
          className={mobileView === "details" ? "active" : ""}
          onClick={() => setMobileView("details")}
          aria-label="Details view"
        >
          <FileText size={18} />
        </button>
      </div>}

      <section
        className={`${
          showMetadataPanel
            ? "recording-preview recording-preview--with-info"
            : "recording-preview recording-preview--media-only"
        } recording-preview--mobile-${mobileView}`}
      >
        {showMetadataPanel && metadata && (
          <PreviewInfoPanel recordingName={recordingName} metadata={metadata} />
        )}

        <PreviewMedia
          recordingName={recordingName}
          type={metadata?.type}
          imageUrl={imageUrl}
          videoUrl={videoUrl}
          downloadLabel={downloadLabel}
          onDownload={downloadFile ? () => requestDownloadFile(recordingPath, downloadFile) : undefined}
        />
      </section>
    </main>
  );
}
