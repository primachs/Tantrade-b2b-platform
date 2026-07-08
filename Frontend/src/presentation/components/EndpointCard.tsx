import { AlertTriangle, ArrowUpRight } from "lucide-react";
import type { Endpoint } from "../../domain/types";
import { resolvePathPreview } from "../../api/utils";

type EndpointCardProps = {
  endpoint: Endpoint;
  index: number;
  payload: string;
  pathValues: Record<string, string>;
  queryValues: Record<string, string>;
  busy: boolean;
  token: string;
  apiBase: string;
  onPayloadChange: (id: string, value: string) => void;
  onPathChange: (id: string, key: string, value: string) => void;
  onQueryChange: (id: string, key: string, value: string) => void;
  onRun: (endpoint: Endpoint) => void;
};

export const EndpointCard = ({
  endpoint,
  index,
  payload,
  pathValues,
  queryValues,
  busy,
  token,
  apiBase,
  onPayloadChange,
  onPathChange,
  onQueryChange,
  onRun
}: EndpointCardProps) => {
  const previewPath = resolvePathPreview(endpoint, pathValues);
  const needsAuth = endpoint.requiresAuth && !token;
  const showBody = endpoint.method !== "GET";

  return (
    <article className="api-card" style={{ animationDelay: `${index * 0.04}s` }}>
      <div className="api-card__header">
        <span className="method-chip" data-method={endpoint.method}>
          {endpoint.method}
        </span>
        <h3>{endpoint.title}</h3>
        {endpoint.requiresAuth && <span className="pill">Auth</span>}
      </div>
      <p className="api-card__summary">{endpoint.summary}</p>
      <div className="api-card__path">
        <span>
          {apiBase}
          {previewPath}
        </span>
      </div>
      {endpoint.pathParams && endpoint.pathParams.length > 0 && (
        <div className="api-card__grid">
          {endpoint.pathParams.map((param) => (
            <label key={param.key} className="field">
              <span>{param.label}</span>
              <input
                className="input"
                type="text"
                value={pathValues[param.key] || ""}
                placeholder={param.placeholder}
                onChange={(event) =>
                  onPathChange(endpoint.id, param.key, event.target.value)
                }
              />
            </label>
          ))}
        </div>
      )}
      {endpoint.queryParams && endpoint.queryParams.length > 0 && (
        <div className="api-card__grid">
          {endpoint.queryParams.map((param) => (
            <label key={param.key} className="field">
              <span>{param.label}</span>
              <input
                className="input"
                type="text"
                value={queryValues[param.key] || ""}
                placeholder={param.placeholder}
                onChange={(event) =>
                  onQueryChange(endpoint.id, param.key, event.target.value)
                }
              />
            </label>
          ))}
        </div>
      )}
      {showBody && (
        <label className="field">
          <span>JSON body</span>
          <textarea
            className="textarea"
            rows={7}
            value={payload}
            onChange={(event) => onPayloadChange(endpoint.id, event.target.value)}
          />
        </label>
      )}
      {needsAuth && (
        <div className="api-card__notice">
          <AlertTriangle className="icon" /> Token required for this request.
        </div>
      )}
      <button
        className="button"
        type="button"
        onClick={() => onRun(endpoint)}
        disabled={busy || needsAuth}
      >
        {busy ? "Running..." : "Send request"}
        <ArrowUpRight className="icon" />
      </button>
    </article>
  );
};
