import { apiBaseUrl } from "./auth-constants";
import { getSessionToken } from "./session";

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

async function authHeaders(): Promise<HeadersInit> {
  const token = await getSessionToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    "x-session-token": token,
  };
}

export async function fetchMySpotAccess(): Promise<SpotPlayerAccessResponse | null> {
  try {
    const res = await fetch(`${apiBaseUrl()}/spotplayer/access`, {
      headers: await authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as SpotPlayerAccessResponse;
  } catch {
    return null;
  }
}

export async function fetchSpotAdminConfig(): Promise<SpotPlayerConfig | null> {
  try {
    const res = await fetch(`${apiBaseUrl()}/spotplayer/admin/config`, {
      headers: await authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as SpotPlayerConfig;
  } catch {
    return null;
  }
}

export async function fetchSpotDiagnostics(): Promise<{
  config: SpotPlayerConfig;
  counts: Record<string, number>;
  notes: string[];
} | null> {
  try {
    const res = await fetch(`${apiBaseUrl()}/spotplayer/admin/diagnostics`, {
      headers: await authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as {
      config: SpotPlayerConfig;
      counts: Record<string, number>;
      notes: string[];
    };
  } catch {
    return null;
  }
}

export async function fetchSpotMappings(): Promise<
  {
    id: string;
    courseId: string;
    spotPlayerCourseId: string;
    enabled: boolean;
    course: { id: string; slug: string; title: string; offerKind: string };
  }[]
> {
  try {
    const res = await fetch(`${apiBaseUrl()}/spotplayer/admin/mappings`, {
      headers: await authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { items: never[] };
    return data.items ?? [];
  } catch {
    return [];
  }
}

export async function fetchAdminLicenses(): Promise<unknown[]> {
  try {
    const res = await fetch(`${apiBaseUrl()}/spotplayer/admin/licenses`, {
      headers: await authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { items: unknown[] };
    return data.items ?? [];
  } catch {
    return [];
  }
}

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
