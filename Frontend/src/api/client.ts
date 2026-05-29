type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token?: string;
  body?: unknown;
};

const normalizeBase = (value: string) => value.replace(/\/$/, "");

const rawBase = (import.meta.env.VITE_API_BASE ?? "/api").toString().trim() || "/api";
const normalizedBase = normalizeBase(rawBase);
const apiBase = normalizedBase.endsWith("/api") ? normalizedBase : `${normalizedBase}/api`;

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${apiBase}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json"
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let body: string | undefined;
  if (options.body !== undefined) {
    body = JSON.stringify(options.body);
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String((payload as { message?: string }).message)
        : typeof payload === "object" && payload && "error" in payload
        ? String((payload as { error?: string }).error)
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload as T;
}
