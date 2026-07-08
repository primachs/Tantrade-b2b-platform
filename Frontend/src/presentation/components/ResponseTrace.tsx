import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import type { ResponseState } from "../../domain/types";

type ResponseTraceProps = {
  response: ResponseState | null;
};

export const ResponseTrace = ({ response }: ResponseTraceProps) => (
  <section className="section response">
    <div className="section-head">
      <div className="section-title">
        <RefreshCw className="icon" />
        <div>
          <h2>Response trace</h2>
          <p>Inspect the last request, status, and response payload.</p>
        </div>
      </div>
      {response && (
        <span className={`status-pill ${response.ok ? "ok" : "error"}`}>
          {response.ok ? <CheckCircle2 className="icon" /> : <AlertTriangle className="icon" />}
          {response.status || "ERR"}
        </span>
      )}
    </div>

    <div className="response-card">
      {response ? (
        <>
          <div className="response-meta">
            <span>
              {response.method} {response.url}
            </span>
            <span>{response.durationMs}ms</span>
          </div>
          <pre>
            {response.error
              ? response.error
              : typeof response.body === "string"
              ? response.body
              : JSON.stringify(response.body, null, 2)}
          </pre>
        </>
      ) : (
        <div className="response-empty">
          <p>Run any endpoint to see the response here.</p>
        </div>
      )}
    </div>
  </section>
);
