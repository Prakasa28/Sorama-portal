import Image from "next/image";
import { getReadableType } from "@/utils/recordingPreviewUtils";

type Props = {
  recordingName: string;
  metadata: any;
  thumbnailUrl?: string;
  isSelected: boolean;
  downloadLabel: string;
  onToggleSelect: () => void;
  onOpen: () => void;
  onDownload: () => void;
};

export function RecordingCard({
  recordingName,
  metadata,
  thumbnailUrl,
  isSelected,
  downloadLabel,
  onToggleSelect,
  onOpen,
  onDownload,
}: Props) {
  const recordingDate = metadata?.dateTime
    ? new Date(metadata.dateTime).toLocaleString()
    : "Loading date...";

  return (
    <article className={`recording-card ${isSelected ? "recording-card--selected" : ""}`}>
      <label className="recording-card__checkbox">
        <input type="checkbox" checked={isSelected} onChange={onToggleSelect} />
      </label>

      <h2 className="recording-card__title">{recordingName}</h2>

      <div className="recording-card__type">{getReadableType(metadata?.type)}</div>

      <div className="recording-card__meta">
        <span className="recording-card__date">{recordingDate}</span>
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

      <button type="button" className="recording-card__open" onClick={onOpen}>
        <Image src="/images/icons/preview.svg" alt="" width={18} height={18} />
        Open
      </button>

      <button type="button" className="recording-card__download" onClick={onDownload}>
        <Image src="/images/icons/download.svg" alt="" width={18} height={18} />
        {downloadLabel}
      </button>
    </article>
  );
}
