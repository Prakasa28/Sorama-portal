import Image from "next/image";

type Props = {
  recordingName: string;
  type?: string;
  imageUrl?: string;
  videoUrl?: string;
  downloadLabel?: string;
  onDownload?: () => void;
};

export function PreviewMedia({
  recordingName,
  type,
  imageUrl,
  videoUrl,
  downloadLabel,
  onDownload,
}: Props) {
  return (
    <div className="recording-preview__media-wrapper">
      <div className="recording-preview__media">
        {type === "video" && videoUrl ? (
          <video src={videoUrl} controls className="recording-preview__video" />
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={recordingName}
            width={520}
            height={600}
            className="recording-preview__image"
            unoptimized
          />
        ) : (
          <p>Loading preview...</p>
        )}
      </div>

      <div className="recording-preview__actions">
        <button
          type="button"
          className="recording-preview__download"
          onClick={onDownload}
          disabled={!onDownload}
        >
          {downloadLabel || "Download"}
        </button>
      </div>
    </div>
  );
}
