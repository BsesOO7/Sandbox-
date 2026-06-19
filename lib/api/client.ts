// lib/api/client.ts
// export const BASE_URL = "http://202.51.3.46/api/v1";

export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001/api/v1";

/**
 * Base request function with Auth handling
 */
export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // Automatically get token from storage if it exists (Industry Standard)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("nifn_token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }), // Attach JWT if available
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.message ||
        data.error ||
        data.detail?.[0]?.msg ||
        `API Error (${res.status})`,
    );
  }
  return data;
}

/**
 * Exported API Client object with shorthand methods
 */
export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),

  post: <T>(path: string, body: any) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T>(path: string, body: any) =>
    request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
