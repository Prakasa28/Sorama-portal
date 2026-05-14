"use client";

import { useEffect } from "react";
import { PreviewInfoPanel } from "./previewInfoPanel";
import { PreviewMedia } from "./previewMedia";
import { shouldShowMetadataPanel } from "../utils/recordingPreviewUtils";

type Props = {
  recordingName: string;
  recordingPath: string;
  fileUrls: Record<string, string>;
  recordingMetadata: Record<string, any>;
  requestFile: (folder: string, file: string) => boolean;
  requestMetadata: (folder: string) => boolean;
  onBack: () => void;
};

export function RecordingPreview({
  recordingName,
  recordingPath,
  fileUrls,
  recordingMetadata,
  requestFile,
  requestMetadata,
  onBack,
}: Props) {
  const metadataKey = `${recordingPath}/metadata.json`;
  const metadata = recordingMetadata[metadataKey];

  const imageUrl = fileUrls[`${recordingPath}/image.jpeg`];
  const videoUrl = fileUrls[`${recordingPath}/video.mp4`];

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

  return (
    <main className="recording-preview-page">
      <button type="button" className="recording-back" onClick={onBack}>
        Back to recordings
      </button>

      <section
        className={
          showMetadataPanel
            ? "recording-preview recording-preview--with-info"
            : "recording-preview recording-preview--media-only"
        }
      >
        {showMetadataPanel && metadata && (
          <PreviewInfoPanel recordingName={recordingName} metadata={metadata} />
        )}

        <PreviewMedia
          recordingName={recordingName}
          type={metadata?.type}
          imageUrl={imageUrl}
          videoUrl={videoUrl}
        />
      </section>
    </main>
  );
}