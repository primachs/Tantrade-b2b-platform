type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token?: string;
  body?: unknown;
};

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  firstFieldError(): string | null {
    for (const messages of Object.values(this.fieldErrors)) {
      if (messages.length > 0) return messages[0];
    }
    return null;
  }
}

const normalizeBase = (value: string) => value.replace(/\/$/, "");

const rawBase = (import.meta.env.VITE_API_BASE ?? "/api").toString().trim() || "/api";
const normalizedBase = normalizeBase(rawBase);
const apiBase = normalizedBase.endsWith("/api") ? normalizedBase : `${normalizedBase}/api`;

function parseFieldErrors(payload: unknown): Record<string, string[]> {
  if (typeof payload !== "object" || !payload || !("errors" in payload)) return {};
  const errors = (payload as { errors?: Record<string, string | string[]> }).errors;
  if (!errors || typeof errors !== "object") return {};

  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.map(String) : [String(value)],
    ])
  );
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${apiBase}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
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
    body,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const fieldErrors = parseFieldErrors(payload);
    const message =
      (typeof payload === "object" && payload && "message" in payload
        ? String((payload as { message?: string }).message)
        : typeof payload === "object" && payload && "error" in payload
        ? String((payload as { error?: string }).error)
        : `Request failed (${response.status})`) ||
      fieldErrors[Object.keys(fieldErrors)[0]]?.[0] ||
      `Request failed (${response.status})`;

    throw new ApiError(message, response.status, fieldErrors);
  }

  return payload as T;
}
