import { apiBaseUrl } from "./auth-constants";
import { getSessionToken } from "./session";
import type {
  SpotPlayerAccessResponse,
  SpotPlayerConfig,
} from "./spotplayer-shared";

export type {
  PublicSpotLicense,
  SpotPlayerAccessResponse,
  SpotPlayerConfig,
  SpotPlayerLicenseStatus,
} from "./spotplayer-shared";
export { licenseStatusLabel, platformLabel } from "./spotplayer-shared";

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
