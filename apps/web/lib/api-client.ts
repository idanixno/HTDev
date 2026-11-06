"use client";

export type PublicUser = {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  displayName: string;
  role: "STUDENT" | "OWNER";
  emailVerified: boolean;
  phoneVerified: boolean;
};

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as {
      message?: string | string[];
    };
    if (Array.isArray(data.message)) return data.message.join("، ");
    if (typeof data.message === "string") return data.message;
  } catch {
    /* ignore */
  }
  return "خطایی رخ داد. دوباره تلاش کنید.";
}

export async function authFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return (await res.json()) as T;
}
