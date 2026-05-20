export function getRecordingDownload(
  metadataType?: string,
  recordingName?: string,
  reportFile?: string,
  imageFile?: string,
  videoFile?: string
) {
  switch (metadataType) {
    case "image":
      return {
        label: "Download Image",
        file: imageFile ?? "",
      };

    case "video":
      return {
        label: "Download Video",
        file: videoFile ?? "",
      };

    case "leakDetection":
    case "partialDischarge":
    case "severityIndex":
      return {
        label: "Download Report",
        file: reportFile ?? "",
      };

    default:
      return {
        label: "Download",
        file: "",
      };
  }
}