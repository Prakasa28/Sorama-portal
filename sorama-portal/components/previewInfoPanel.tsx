import { PreviewSection } from "./previewSection";
import { formatDate, formatValue, getReadableType } from "../utils/recordingPreviewUtils";

type Props = {
  recordingName: string;
  metadata: any;
};

export function PreviewInfoPanel({ recordingName, metadata }: Props) {
  return (
    <aside className="recording-preview__info">
      <h1>{recordingName}</h1>

      <p className="recording-preview__type">{getReadableType(metadata.type)}</p>

      <p>{formatDate(metadata.dateTime)}</p>

      <PreviewSection
        title="Asset Information"
        rows={[
          ["ID", metadata.tags?.assetID || "-"],
          ["Name", metadata.tags?.assetName || "-"],
          ["Status", metadata.tags?.assetStatus || "Undetermined"],
          ["Type", metadata.tags?.assetType || "-"],
        ]}
      />

      <PreviewSection
        title="General Information"
        rows={[
          [
            "Estimated distance",
            formatValue(metadata.estimatedDistance, metadata.estimatedDistanceUnit),
          ],
          [
            "Frequency range",
            `${Math.round(metadata.frequencySelectionFrom)} - ${Math.round(
              metadata.frequencySelectionTo
            )} ${metadata.frequencySelectionFromUnit}`,
          ],
          ["SPL at source", formatValue(metadata.splAtSource, metadata.splAtSourceUnit)],
        ]}
      />

      {metadata.type === "leakDetection" && (
        <PreviewSection
          title="Leak Inspection Information"
          rows={[
            [
              "Leak cost",
              formatValue(
                metadata.ldMetadata?.results?.cost,
                metadata.ldMetadata?.results?.costUnit
              ),
            ],
            [
              "Leak rate",
              formatValue(
                metadata.ldMetadata?.results?.rate,
                metadata.ldMetadata?.results?.rateUnit
              ),
            ],
            [
              "Line pressure",
              formatValue(
                metadata.ldMetadata?.settings?.linePressureValue,
                metadata.ldMetadata?.settings?.linePressureUnit
              ),
            ],
            ["Type of gas", metadata.ldMetadata?.settings?.gasType || "-"],
            [
              "Electricity cost",
              formatValue(
                metadata.ldMetadata?.settings?.electricityCost,
                metadata.ldMetadata?.settings?.electricityCostUnit
              ),
            ],
            [
              "Operating hours",
              `${metadata.ldMetadata?.settings?.operatingHoursPerYear ?? "-"} hours/year`,
            ],
          ]}
        />
      )}

      {metadata.type === "partialDischarge" && (
        <PreviewSection
          title="Partial Discharge Inspection Information"
          rows={[
            ["Operating frequency", metadata.pdMetadata?.settings?.operatingConditions || "-"],
            ["External", `${metadata.pdMetadata?.results?.externalPercentage ?? "-"}%`],
            ["Internal", `${metadata.pdMetadata?.results?.internalPercentage ?? "-"}%`],
            ["Tracking", `${metadata.pdMetadata?.results?.trackingPercentage ?? "-"}%`],
            ["None", `${metadata.pdMetadata?.results?.nonePercentage ?? "-"}%`],
          ]}
        />
      )}

      {metadata.type === "severityIndex" && (
        <PreviewSection
          title="Severity Index Information"
          rows={[["Severity Index", metadata.lsMetadata?.results?.severityIndex ?? "-"]]}
        />
      )}

      {metadata.notes && <PreviewSection title="Notes" rows={[["Notes", metadata.notes]]} />}
    </aside>
  );
}
