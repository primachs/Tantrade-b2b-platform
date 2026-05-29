import { useEffect, useMemo, useState } from "react";
import { Layers, Menu, Radar } from "lucide-react";
import { apiRequest } from "../../api/client";

type AdminViewProps = {
  token: string;
  user: { name: string };
  setNotice: (type: "success" | "error", msg: string) => void;
};

type Rfs = {
  id: string;
  title: string;
  status: string;
  buyer_id: string;
  service_type_id: string;
};

type Business = {
  id: string;
  name: string;
  email: string;
};

type ServiceType = {
  id: string;
  name: string;
  category_id: string;
  is_active: boolean;
};

type TaxonomyResponse = {
  categories?: unknown[];
  service_types?: unknown[];
  attributes?: unknown[];
};

type AuthUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

type Market = {
  id: string;
  market_name: string;
  region: string;
  district: string;
  status: string;
};

type Person = {
  id: string;
  user_id: number;
  first_name: string;
  surname: string;
  gender: string;
  email: string;
};

type Broker = {
  id: string;
  person_id: string;
  market_id: string;
  broker_type: string;
  status: string;
};

export const AdminView = ({ token, user, setNotice }: AdminViewProps) => {
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [rfsList, setRfsList] = useState<Rfs[]>([]);
  const [taxonomy, setTaxonomy] = useState<TaxonomyResponse | null>(null);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [activePane, setActivePane] = useState("overview");
  const [isPaneMenuOpen, setIsPaneMenuOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [biz, rfs, tax, users, mkt, prs, brk] = await Promise.all([
        apiRequest<Business[]>("/businesses", { token }),
        apiRequest<Rfs[]>("/rfs", { token }),
        apiRequest<TaxonomyResponse>("/taxonomy", { token }),
        apiRequest<AuthUser[]>("/auth/users", { token }),
        apiRequest<Market[]>("/market-governance/markets", { token }),
        apiRequest<Person[]>("/market-governance/persons", { token }),
        apiRequest<Broker[]>("/market-governance/brokers", { token })
      ]);
      setBusinesses(Array.isArray(biz) ? biz : []);
      setRfsList(Array.isArray(rfs) ? rfs : []);
      setTaxonomy(tax && typeof tax === "object" ? tax : null);
      setAuthUsers(Array.isArray(users) ? users : []);
      setMarkets(Array.isArray(mkt) ? mkt : []);
      setPersons(Array.isArray(prs) ? prs : []);
      setBrokers(Array.isArray(brk) ? brk : []);
    } catch (err) {
      setNotice("error", err instanceof Error ? err.message : "Failed to load admin overview.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  const serviceTypes = Array.isArray(taxonomy?.service_types)
    ? (taxonomy?.service_types as ServiceType[])
    : [];

  const serviceTypeMap = useMemo(() => {
    return new Map(serviceTypes.map((type) => [type.id, type.name]));
  }, [serviceTypes]);

  const marketMap = useMemo(() => new Map(markets.map((market) => [market.id, market.market_name])), [markets]);
  const personMap = useMemo(
    () => new Map(persons.map((person) => [person.id, `${person.first_name} ${person.surname}`])),
    [persons]
  );

  const paneItems = [
    { id: "overview", label: "Operations overview" },
    { id: "registry", label: "Oversight registry" },
  ];

  return (
    <section className="page-section">
      <div className="section-head">
        <div className="section-title">
          <Radar className="icon" />
          <div>
            <h2>Admin oversight</h2>
            <p>Monitor platform health, users, and governance activity.</p>
          </div>
        </div>
        <div className="section-actions">
          {loading && <span className="pill">Syncing...</span>}
          <button
            className="menu-trigger"
            type="button"
            onClick={() => setIsPaneMenuOpen((open) => !open)}
            aria-label="Toggle sections"
          >
            <Menu className="icon" />
          </button>
        </div>
      </div>
      <div className="workspace-layout">
        <button
          className={`drawer-overlay workspace-overlay ${isPaneMenuOpen ? "is-active" : ""}`}
          type="button"
          aria-label="Close sections"
          onClick={() => setIsPaneMenuOpen(false)}
        />
        <aside className={`workspace-sidebar ${isPaneMenuOpen ? "is-open" : ""}`}>
          <div className="sidebar-header">
            <span className="sidebar-header__label">Admin menu</span>
            <span className="sidebar-header__hint">Oversight dashboards</span>
          </div>
          <div className="sidebar-links">
            {paneItems.map((pane) => (
              <button
                key={pane.id}
                className={`workspace-link ${activePane === pane.id ? "active" : ""}`}
                type="button"
                onClick={() => {
                  setActivePane(pane.id);
                  setIsPaneMenuOpen(false);
                }}
              >
                {pane.label}
              </button>
            ))}
          </div>
        </aside>
        <div className="workspace-main">
          {activePane === "overview" && (
            <section>
              <div className="section-head">
                <div className="section-title">
                  <Radar className="icon" />
                  <div>
                    <h2>Operations overview</h2>
                    <p>Welcome back, {user.name}. Current system health at a glance.</p>
                  </div>
                </div>
                {loading && <span className="pill">Syncing...</span>}
              </div>
              <div className="stat-grid">
                <div className="stat-card">
                  <span className="stat-label">Registered businesses</span>
                  <span className="stat-value">{businesses.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Active RFS</span>
                  <span className="stat-value">{rfsList.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Service types</span>
                  <span className="stat-value">{serviceTypes.length}</span>
                </div>
              </div>
            </section>
          )}

          {activePane === "registry" && (
            <section>
              <div className="section-head">
                <div className="section-title">
                  <Layers className="icon" />
                  <div>
                    <h2>Oversight registry</h2>
                    <p>Monitor user access, business activity, and governance records.</p>
                  </div>
                </div>
                {loading && <span className="pill">Syncing...</span>}
              </div>
              <div className="grid-2">
                <div className="surface">
                  <h3>Authentication users</h3>
                  {authUsers.length === 0 ? (
                    <p className="muted">No users registered yet.</p>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Roles</th>
                        </tr>
                      </thead>
                      <tbody>
                        {authUsers.map((authUser) => (
                          <tr key={authUser.id}>
                            <td>{authUser.name}</td>
                            <td>{authUser.email}</td>
                            <td>{authUser.roles.join(", ") || "Unassigned"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="surface">
                  <h3>Registered businesses</h3>
                  {businesses.length === 0 ? (
                    <p className="muted">No businesses registered yet.</p>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {businesses.map((business) => (
                          <tr key={business.id}>
                            <td>{business.name}</td>
                            <td>{business.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              <div className="grid-2">
                <div className="surface">
                  <h3>RFS registry</h3>
                  {rfsList.length === 0 ? (
                    <p className="muted">No RFS records yet.</p>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Buyer</th>
                          <th>Service type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rfsList.map((rfs) => (
                          <tr key={rfs.id}>
                            <td>{rfs.title}</td>
                            <td><span className="tag">{rfs.status}</span></td>
                            <td>{rfs.buyer_id}</td>
                            <td>{serviceTypeMap.get(rfs.service_type_id) ?? rfs.service_type_id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="surface">
                  <h3>Markets</h3>
                  {markets.length === 0 ? (
                    <p className="muted">No markets registered yet.</p>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Region</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {markets.map((market) => (
                          <tr key={market.id}>
                            <td>{market.market_name}</td>
                            <td>{market.region}</td>
                            <td><span className="tag">{market.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              <div className="grid-2">
                <div className="surface">
                  <h3>People</h3>
                  {persons.length === 0 ? (
                    <p className="muted">No people registered yet.</p>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Gender</th>
                          <th>Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {persons.map((person) => (
                          <tr key={person.id}>
                            <td>{person.first_name} {person.surname}</td>
                            <td>{person.gender}</td>
                            <td>{person.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="surface">
                  <h3>Brokers</h3>
                  {brokers.length === 0 ? (
                    <p className="muted">No brokers registered yet.</p>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Broker</th>
                          <th>Market</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brokers.map((broker) => (
                          <tr key={broker.id}>
                            <td>{personMap.get(broker.person_id) ?? broker.person_id}</td>
                            <td>{marketMap.get(broker.market_id) ?? broker.market_id}</td>
                            <td><span className="tag">{broker.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  );
};
