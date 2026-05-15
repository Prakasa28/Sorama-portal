export function getRecordingDownload(
  metadataType?: string,
  recordingName?: string
) {
  switch (metadataType) {
    case "image":
      return {
        label: "Download Image",
        file: "image.jpeg",
      };

    case "video":
      return {
        label: "Download Video",
        file: "video.mp4",
      };

    case "leakDetection":
    case "partialDischarge":
    case "severityIndex":
      return {
        label: "Download Report",
        file: `Report-${recordingName}.pdf`,
      };

    default:
      return {
        label: "Download",
        file: "",
      };
  }
}