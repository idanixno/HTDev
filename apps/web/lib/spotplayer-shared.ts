/** Client-safe SpotPlayer types + labels (no next/headers). */

export type SpotPlayerLicenseStatus =
  | "PENDING"
  | "QUEUED"
  | "IN_PROGRESS"
  | "SUCCEEDED"
  | "FAILED";

export type PublicSpotLicense = {
  id: string;
  courseId: string;
  course?: {
    id: string;
    slug: string;
    title: string;
    coverAsset: string | null;
    offerKind: string;
  };
  orderId: string | null;
  accessSource: "PAID_ORDER" | "FREE_COURSE";
  status: SpotPlayerLicenseStatus;
  licenseKey: string | null;
  licenseUrl: string | null;
  attemptCount: number;
  lastError: string | null;
  provisionedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SpotPlayerAccessResponse = {
  items: PublicSpotLicense[];
  instructions: {
    playerDownloadHint: string;
    confirmedPlatforms: {
      id: string;
      available: true;
      version?: string;
      source: string;
    }[];
    notYetAvailable: {
      id: string;
      available: false;
      note: string;
      source: string;
    }[];
    steps: string[];
    docsUrl: string;
    siteUrl: string;
  };
  integrationStatus: string;
};

export type SpotPlayerConfig = {
  technicalEnabled: boolean;
  testMode: boolean;
  integrationStatus: string;
  credentialsStatus: string;
  apiKeyMasked: string | null;
  licenseEndpoint: string;
  source: "env" | "database" | "missing";
  platformSupport: SpotPlayerAccessResponse["instructions"];
};

export function licenseStatusLabel(status: SpotPlayerLicenseStatus): string {
  switch (status) {
    case "PENDING":
      return "در انتظار";
    case "QUEUED":
      return "در صف";
    case "IN_PROGRESS":
      return "در حال صدور";
    case "SUCCEEDED":
      return "صادر شده";
    case "FAILED":
      return "ناموفق";
    default:
      return status;
  }
}

export function platformLabel(id: string): string {
  switch (id) {
    case "windows":
      return "ویندوز";
    case "macos":
      return "مک";
    case "android":
      return "اندروید";
    case "ios":
      return "iOS";
    case "ubuntu":
      return "اوبونتو";
    case "web":
      return "وب";
    default:
      return id;
  }
}
