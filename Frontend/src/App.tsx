import { EndpointCard } from "./presentation/components/EndpointCard";
import { Hero } from "./presentation/components/Hero";
import { ResponseTrace } from "./presentation/components/ResponseTrace";
import { endpoints, groups } from "./modules/console/consoleConfig";
import { useConsoleState } from "./modules/console/useConsoleState";

export default function App() {
  const {
    apiBaseInput,
    apiBase,
    token,
    authEmail,
    authName,
    payloads,
    pathValues,
    queryValues,
    response,
    busyId,
    setApiBaseInput,
    setToken,
    updatePayload,
    updatePathValue,
    updateQueryValue,
    runEndpoint
  } = useConsoleState(endpoints);

  return (
    <div className="app-shell">
      <Hero
        apiBaseInput={apiBaseInput}
        apiBase={apiBase}
        token={token}
        authEmail={authEmail}
        authName={authName}
        onApiBaseChange={setApiBaseInput}
        onTokenChange={setToken}
        onClearToken={() => setToken("")}
      />

      <main className="content">
        {groups.map((group) => {
          const Icon = group.icon;
          const groupEndpoints = endpoints.filter((endpoint) => endpoint.group === group.id);

          return (
            <section key={group.id} className="section">
              <div className="section-head">
                <div className="section-title">
                  <Icon className="icon" />
                  <div>
                    <h2>{group.title}</h2>
                    <p>{group.description}</p>
                  </div>
                </div>
                <span className="pill">{groupEndpoints.length} endpoints</span>
              </div>
              <div className="card-grid">
                {groupEndpoints.map((endpoint, index) => (
                  <EndpointCard
                    key={endpoint.id}
                    endpoint={endpoint}
                    index={index}
                    payload={payloads[endpoint.id] ?? ""}
                    pathValues={pathValues[endpoint.id] ?? {}}
                    queryValues={queryValues[endpoint.id] ?? {}}
                    busy={busyId === endpoint.id}
                    token={token}
                    apiBase={apiBase}
                    onPayloadChange={updatePayload}
                    onPathChange={updatePathValue}
                    onQueryChange={updateQueryValue}
                    onRun={runEndpoint}
                  />
                ))}
              </div>
            </section>
          );
        })}

        <ResponseTrace response={response} />
      </main>
    </div>
  );
}
