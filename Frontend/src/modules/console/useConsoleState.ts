import { useEffect, useMemo, useState } from "react";
import type { Endpoint, ResponseState } from "../../domain/types";
import {
  buildRequestUrl,
  createParamMap,
  createPayloadMap,
  getDefaultApiBase,
  normalizeApiBase
} from "../../api/utils";

type ConsoleState = {
  apiBaseInput: string;
  apiBase: string;
  token: string;
  authEmail: string;
  authName: string;
  payloads: Record<string, string>;
  pathValues: Record<string, Record<string, string>>;
  queryValues: Record<string, Record<string, string>>;
  response: ResponseState | null;
  authProfile: Record<string, unknown> | null;
  busyId: string | null;
  setApiBaseInput: (value: string) => void;
  setToken: (value: string) => void;
  updatePayload: (id: string, value: string) => void;
  updatePathValue: (id: string, key: string, value: string) => void;
  updateQueryValue: (id: string, key: string, value: string) => void;
  runEndpoint: (endpoint: Endpoint) => Promise<void>;
};

export const useConsoleState = (endpoints: Endpoint[]): ConsoleState => {
  const [apiBaseInput, setApiBaseInput] = useState(getDefaultApiBase);
  const [token, setToken] = useState(() => localStorage.getItem("tantrade_token") ?? "");
  const [payloads, setPayloads] = useState(() => createPayloadMap(endpoints));
  const [pathValues, setPathValues] = useState(() => createParamMap(endpoints, "pathParams"));
  const [queryValues, setQueryValues] = useState(() => createParamMap(endpoints, "queryParams"));
  const [response, setResponse] = useState<ResponseState | null>(null);
  const [authProfile, setAuthProfile] = useState<Record<string, unknown> | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const apiBase = useMemo(() => normalizeApiBase(apiBaseInput), [apiBaseInput]);
  const authEmail = typeof authProfile?.email === "string" ? authProfile.email : "";
  const authName = typeof authProfile?.name === "string" ? authProfile.name : "";

  useEffect(() => {
    if (token) {
      localStorage.setItem("tantrade_token", token);
    } else {
      localStorage.removeItem("tantrade_token");
    }
  }, [token]);

  const updatePayload = (id: string, value: string) => {
    setPayloads((prev) => ({ ...prev, [id]: value }));
  };

  const updatePathValue = (id: string, key: string, value: string) => {
    setPathValues((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {}),
        [key]: value
      }
    }));
  };

  const updateQueryValue = (id: string, key: string, value: string) => {
    setQueryValues((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {}),
        [key]: value
      }
    }));
  };

  const runEndpoint = async (endpoint: Endpoint) => {
    const start = performance.now();
    setBusyId(endpoint.id);

    try {
      const { url } = buildRequestUrl(
        endpoint,
        apiBase,
        pathValues[endpoint.id] ?? {},
        queryValues[endpoint.id] ?? {}
      );

      const headers: Record<string, string> = {
        Accept: "application/json"
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      let body: string | undefined;
      if (endpoint.method !== "GET") {
        const rawBody = payloads[endpoint.id]?.trim();
        if (rawBody) {
          const parsed = JSON.parse(rawBody) as unknown;
          body = JSON.stringify(parsed);
          headers["Content-Type"] = "application/json";
        }
      }

      const result = await fetch(url, {
        method: endpoint.method,
        headers,
        body
      });

      const contentType = result.headers.get("content-type") ?? "";
      let payload: unknown;

      if (contentType.includes("application/json")) {
        payload = await result.json();
      } else {
        payload = await result.text();
      }

      const durationMs = Math.round(performance.now() - start);
      const nextResponse: ResponseState = {
        ok: result.ok,
        status: result.status,
        url,
        method: endpoint.method,
        durationMs,
        body: payload
      };

      setResponse(nextResponse);

      if (endpoint.id === "auth-logout" && result.ok) {
        setToken("");
        setAuthProfile(null);
      }

      if (payload && typeof payload === "object") {
        const payloadRecord = payload as Record<string, unknown>;
        const tokenValue = typeof payloadRecord.token === "string" ? payloadRecord.token : null;
        const userValue = payloadRecord.user;

        if (tokenValue) {
          setToken(tokenValue);
        }
        if (userValue && typeof userValue === "object") {
          setAuthProfile(userValue as Record<string, unknown>);
        }
        if (endpoint.id === "auth-me") {
          setAuthProfile(payloadRecord);
        }
      }
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      const message = error instanceof Error ? error.message : "Unknown error";
      setResponse({
        ok: false,
        status: 0,
        url: `${apiBase}${endpoint.path}`,
        method: endpoint.method,
        durationMs,
        body: null,
        error: message
      });
    } finally {
      setBusyId(null);
    }
  };

  return {
    apiBaseInput,
    apiBase,
    token,
    authEmail,
    authName,
    payloads,
    pathValues,
    queryValues,
    response,
    authProfile,
    busyId,
    setApiBaseInput,
    setToken,
    updatePayload,
    updatePathValue,
    updateQueryValue,
    runEndpoint
  };
};
