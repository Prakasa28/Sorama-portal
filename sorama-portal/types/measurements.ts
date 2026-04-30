
export type MeasurementType = "leakDetection" | "partialDischarge";

export type FolderEntry = {
  name: string;
  files: string[];
  thumbnail?: string;
  image?: string;
  report?: string;
  metadata: MeasurementMetadata;
};

export type MeasurementMetadata = {
  dateTime: string;
  type: MeasurementType;

  estimatedDistance: number;
  estimatedDistanceUnit: string;

  splAtSource: number;
  splAtSourceUnit: string;

  ldMetadata?: LeakDetectionMetadata;
  pdMetadata?: PartialDischargeMetadata;
};

export type LeakDetectionMetadata = {
  results: {
    rate: number;
    rateUnit: string;
    cost: number;
    costUnit: string;
    electricityUsage: number;
    electricityUsageUnit: string;
    isLeakRateAccurate: boolean;
  };
};

export type PartialDischargeMetadata = {
  results: {
    externalPercentage: number;
    internalPercentage: number;
    trackingPercentage: number;
    nonePercentage: number;
  };
};