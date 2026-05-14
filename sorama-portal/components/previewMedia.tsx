import Image from "next/image";

type Props = {
  recordingName: string;
  type?: string;
  imageUrl?: string;
  videoUrl?: string;
};

export function PreviewMedia({
  recordingName,
  type,
  imageUrl,
  videoUrl,
}: Props) {
  return (
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
  );
}