import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import type { FolderEntry } from "../types/measurements";
import { downloadBlob } from "../utils/downloadBlob";

type Props = {
  folder: FolderEntry;
  selectedRecordings: string[];
  recordingMetadata: Record<string, any>;
  requestFileBlob: (folder: string, file: string) => Promise<Blob | null>;
};

export function useRecordingExports({
  folder,
  selectedRecordings,
  recordingMetadata,
  requestFileBlob,
}: Props) {
  function getRecordingEntry(recordingName: string) {
    return folder.recordings?.find(
      (recording) => recording.name === recordingName
    );
  }

  function getFilesForRecording(recordingName: string, metadata: any) {
    const recording = getRecordingEntry(recordingName);
    const files = ["metadata.json"];

    if (recording?.thumbnail) files.push(recording.thumbnail);

    if (metadata?.type === "video" && recording?.video) {
      files.push(recording.video);
    }

    if (metadata?.type !== "video" && recording?.image) {
      files.push(recording.image);
    }

    if (recording?.report) files.push(recording.report);

    return files;
  }

  async function requestBlobWithRetry(folderPath: string, file: string) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const blob = await requestFileBlob(folderPath, file);
      if (blob) return blob;

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return null;
  }

  async function downloadSelectedAsZip(fileName: string) {
    const zip = new JSZip();

    for (const recordingName of selectedRecordings) {
      const recordingPath = `${folder.name}/${recordingName}`;
      const metadata = recordingMetadata[`${recordingPath}/metadata.json`];
      const files = getFilesForRecording(recordingName, metadata);

      for (const file of files) {
        const blob = await requestBlobWithRetry(recordingPath, file);

        if (blob) {
          zip.file(`${recordingName}/${file}`, blob);
        }
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, `${fileName}.zip`);
  }

  async function downloadSelectedReportsAsMergedPdf(fileName: string) {
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

    downloadBlob(mergedBlob, `${fileName}.pdf`);
  }

  return {
    getRecordingEntry,
    downloadSelectedAsZip,
    downloadSelectedReportsAsMergedPdf,
  };
}

function isReportType(type?: string) {
  return (
    type === "leakDetection" ||
    type === "partialDischarge" ||
    type === "severityIndex"
  );
}