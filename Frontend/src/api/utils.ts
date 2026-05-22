import type { Endpoint } from "../domain/types";

export const createPayloadMap = (items: Endpoint[]) =>
  items.reduce<Record<string, string>>((acc, endpoint) => {
    acc[endpoint.id] = endpoint.bodyTemplate ?? "";
    return acc;
  }, {});

export const createParamMap = (items: Endpoint[], key: "pathParams" | "queryParams") =>
  items.reduce<Record<string, Record<string, string>>>((acc, endpoint) => {
    const params = endpoint[key];
    if (params && params.length > 0) {
      acc[endpoint.id] = params.reduce<Record<string, string>>((inner, param) => {
        inner[param.key] = "";
        return inner;
      }, {});
    }
    return acc;
  }, {});

export const getDefaultApiBase = () => {
  const raw = (import.meta.env.VITE_API_BASE ?? "").toString().trim();
  if (!raw) {
    return "/api";
  }
  return raw.replace(/\/$/, "");
};

export const normalizeApiBase = (value: string) => {
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) {
    return "/api";
  }
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

export const resolvePathPreview = (endpoint: Endpoint, pathValues: Record<string, string>) => {
  if (!endpoint.pathParams) {
    return endpoint.path;
  }
  return endpoint.pathParams.reduce((path, param) => {
    const value = pathValues[param.key];
    return path.replace(`:${param.key}`, value || `:${param.key}`);
  }, endpoint.path);
};

export const buildRequestUrl = (
  endpoint: Endpoint,
  apiBase: string,
  pathValues: Record<string, string>,
  queryValues: Record<string, string>
) => {
  let resolvedPath = endpoint.path;

  if (endpoint.pathParams) {
    for (const param of endpoint.pathParams) {
      const rawValue = pathValues[param.key]?.trim();
      if (!rawValue) {
        throw new Error(`Missing ${param.label}.`);
      }
      resolvedPath = resolvedPath.replace(`:${param.key}`, encodeURIComponent(rawValue));
    }
  }

  const query = new URLSearchParams();
  if (endpoint.queryParams) {
    for (const param of endpoint.queryParams) {
      const value = queryValues[param.key]?.trim();
      if (value) {
        query.set(param.key, value);
      }
    }
  }

  const queryString = query.toString();
  const url = `${apiBase}${resolvedPath}${queryString ? `?${queryString}` : ""}`;

  return { url, resolvedPath };
};
