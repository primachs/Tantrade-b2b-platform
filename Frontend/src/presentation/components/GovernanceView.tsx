import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";
import { MapPin, Menu } from "lucide-react";

type GovernanceViewProps = {
  token: string;
  setNotice: (type: "success" | "error", msg: string) => void;
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

type GovernanceUser = {
  id: number;
  name: string;
  email: string;
};

type Broker = {
  id: string;
  person_id: string;
  market_id: string;
  broker_type: string;
  status: string;
};

type PersonForm = {
  user_id: string;
  nida_number: string;
  first_name: string;
  middle_name: string;
  surname: string;
  gender: string;
  mobile: string;
  email: string;
  address: string;
};

export const GovernanceView = ({ token, setNotice }: GovernanceViewProps) => {
  const [loading, setLoading] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [governanceUsers, setGovernanceUsers] = useState<GovernanceUser[]>([]);
  const [activePane, setActivePane] = useState("create");
  const [isPaneMenuOpen, setIsPaneMenuOpen] = useState(false);

  const [marketForm, setMarketForm] = useState({
    market_name: "",
    region: "",
    district: "",
    ward: "",
    address: ""
  });

  const [brokerPersonForm, setBrokerPersonForm] = useState<PersonForm>({
    user_id: "",
    nida_number: "",
    first_name: "",
    middle_name: "",
    surname: "",
    gender: "FEMALE",
    mobile: "",
    email: "",
    address: ""
  });

  const [chairPersonForm, setChairPersonForm] = useState<PersonForm>({
    user_id: "",
    nida_number: "",
    first_name: "",
    middle_name: "",
    surname: "",
    gender: "FEMALE",
    mobile: "",
    email: "",
    address: ""
  });

  const [brokerForm, setBrokerForm] = useState({
    market_id: "",
    broker_type: "FREIGHT_BROKER"
  });

  const [chairForm, setChairForm] = useState({
    market_id: "",
    start_date: "",
    end_date: ""
  });

  const loadGovernanceData = async () => {
    setLoading(true);
    try {
      const [m, b, p, u] = await Promise.all([
        apiRequest<Market[]>("/market-governance/markets", { token }),
        apiRequest<Broker[]>("/market-governance/brokers", { token }),
        apiRequest<Person[]>("/market-governance/persons", { token }),
        apiRequest<GovernanceUser[]>("/market-governance/users", { token })
      ]);
      setMarkets(Array.isArray(m) ? m : []);
      setBrokers(Array.isArray(b) ? b : []);
      setPersons(Array.isArray(p) ? p : []);
      setGovernanceUsers(Array.isArray(u) ? u : []);
    } catch (err) {
      setNotice("error", "Failed to load Governance Registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGovernanceData();
  }, [token]);

  const adminEmail = "admin@tantrade.go.tz";
  const filteredPersons = persons.filter((person) => person.email !== adminEmail);
  const filteredUsers = governanceUsers.filter((user) => user.email !== adminEmail);

  useEffect(() => {
    if (!brokerForm.market_id && markets[0]) {
      setBrokerForm((prev) => ({ ...prev, market_id: markets[0].id }));
    }
    if (!brokerPersonForm.user_id && filteredUsers[0]) {
      setBrokerPersonForm((prev) => ({
        ...prev,
        user_id: String(filteredUsers[0].id),
        email: filteredUsers[0].email
      }));
    }
    if (!chairPersonForm.user_id && filteredUsers[0]) {
      setChairPersonForm((prev) => ({
        ...prev,
        user_id: String(filteredUsers[0].id),
        email: filteredUsers[0].email
      }));
    }
    if (!chairForm.market_id && markets[0]) {
      setChairForm((prev) => ({ ...prev, market_id: markets[0].id }));
    }
  }, [
    brokerForm.market_id,
    brokerPersonForm.user_id,
    chairPersonForm.user_id,
    chairForm.market_id,
    filteredUsers,
    markets
  ]);

  const handleSubmit = async (path: string, body: unknown) => {
    setLoading(true);
    try {
      await apiRequest(path, { method: "POST", token, body });
      setNotice("success", "Action completed successfully.");
      loadGovernanceData();
    } catch (err) {
      setNotice("error", "Action failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBrokerUser = (userId: string) => {
    const selected = filteredUsers.find((user) => String(user.id) === userId);
    setBrokerPersonForm((prev) => ({
      ...prev,
      user_id: userId,
      email: selected?.email ?? prev.email
    }));
  };

  const handleSelectChairUser = (userId: string) => {
    const selected = filteredUsers.find((user) => String(user.id) === userId);
    setChairPersonForm((prev) => ({
      ...prev,
      user_id: userId,
      email: selected?.email ?? prev.email
    }));
  };

  const handleRegisterBroker = async () => {
    if (!brokerPersonForm.user_id || !brokerForm.market_id) {
      setNotice("error", "Select a user account and market before registering a broker.");
      return;
    }

    setLoading(true);
    try {
      const person = await apiRequest<Person>("/market-governance/persons", {
        method: "POST",
        token,
        body: {
          ...brokerPersonForm,
          user_id: Number(brokerPersonForm.user_id)
        }
      });

      await apiRequest("/market-governance/brokers", {
        method: "POST",
        token,
        body: {
          person_id: person.id,
          market_id: brokerForm.market_id,
          broker_type: brokerForm.broker_type
        }
      });

      setNotice("success", "Broker registered successfully.");
      loadGovernanceData();
      setBrokerPersonForm({
        user_id: "",
        nida_number: "",
        first_name: "",
        middle_name: "",
        surname: "",
        gender: "FEMALE",
        mobile: "",
        email: "",
        address: ""
      });
      setBrokerForm((prev) => ({ ...prev, broker_type: "FREIGHT_BROKER" }));
    } catch (err) {
      setNotice("error", "Broker registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChairperson = async () => {
    if (!chairPersonForm.user_id || !chairForm.market_id || !chairForm.start_date) {
      setNotice("error", "Select a user, market, and start date for the chairperson term.");
      return;
    }

    setLoading(true);
    try {
      const person = await apiRequest<Person>("/market-governance/persons", {
        method: "POST",
        token,
        body: {
          ...chairPersonForm,
          user_id: Number(chairPersonForm.user_id)
        }
      });

      const office = await apiRequest<{ id: string }>(
        `/market-governance/markets/${chairForm.market_id}/offices`,
        { method: "POST", token, body: { office_type: "CHAIRPERSON" } }
      );

      await apiRequest(`/market-governance/offices/${office.id}/terms`, {
        method: "POST",
        token,
        body: {
          person_id: person.id,
          start_date: chairForm.start_date,
          end_date: chairForm.end_date || null
        }
      });

      setNotice("success", "Chairperson registered successfully.");
      loadGovernanceData();
      setChairPersonForm({
        user_id: "",
        nida_number: "",
        first_name: "",
        middle_name: "",
        surname: "",
        gender: "FEMALE",
        mobile: "",
        email: "",
        address: ""
      });
      setChairForm({ market_id: chairForm.market_id, start_date: "", end_date: "" });
    } catch (err) {
      setNotice("error", "Chairperson registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateBroker = async (id: string) => {
    try {
      await apiRequest(`/market-governance/brokers/${id}/deactivate`, { method: "PATCH", token });
      setNotice("success", "Broker suspended.");
      loadGovernanceData();
    } catch (err) {
      setNotice("error", "Action failed.");
    }
  };

  const paneItems = [
    { id: "create", label: "Create records" },
    { id: "registry", label: "Registry tables" },
    { id: "overview", label: "Overview" }
  ];

  return (
    <section className="page-section">
      <div className="section-head">
        <div className="section-title">
          <MapPin className="icon" />
          <div>
            <h2>Governance registry</h2>
            <p>Register markets, brokers, and chairperson terms with full person profiles.</p>
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
            <span className="sidebar-header__label">Governance menu</span>
            <span className="sidebar-header__hint">Registry and oversight flows</span>
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
            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-label">Markets</span>
                <span className="stat-value">{markets.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">People</span>
                <span className="stat-value">{filteredPersons.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Brokers</span>
                <span className="stat-value">{brokers.length}</span>
              </div>
            </div>
          )}

          {activePane === "create" && (
            <div className="grid-2">
              <div className="surface">
                <h3>Create market</h3>
                <div className="form-grid">
                  <label className="field">
                    <span>Market name</span>
                    <input
                      className="input"
                      value={marketForm.market_name}
                      onChange={(event) =>
                        setMarketForm({ ...marketForm, market_name: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Region</span>
                    <input
                      className="input"
                      value={marketForm.region}
                      onChange={(event) => setMarketForm({ ...marketForm, region: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>District</span>
                    <input
                      className="input"
                      value={marketForm.district}
                      onChange={(event) =>
                        setMarketForm({ ...marketForm, district: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Ward</span>
                    <input
                      className="input"
                      value={marketForm.ward}
                      onChange={(event) => setMarketForm({ ...marketForm, ward: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Address</span>
                    <input
                      className="input"
                      value={marketForm.address}
                      onChange={(event) =>
                        setMarketForm({ ...marketForm, address: event.target.value })
                      }
                    />
                  </label>
                  <button
                    className="button"
                    type="button"
                    onClick={() => handleSubmit("/market-governance/markets", marketForm)}
                    disabled={loading}
                  >
                    Create market
                  </button>
                </div>
              </div>

              <div className="surface">
                <h3>Register broker (person + broker)</h3>
                <div className="form-grid">
                  <label className="field">
                    <span>User account</span>
                    <select
                      className="input"
                      value={brokerPersonForm.user_id}
                      onChange={(event) => handleSelectBrokerUser(event.target.value)}
                    >
                      <option value="">Select user account</option>
                      {filteredUsers.map((userItem) => (
                        <option key={userItem.id} value={userItem.id}>
                          {userItem.name} ({userItem.email})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>NIDA number</span>
                    <input
                      className="input"
                      value={brokerPersonForm.nida_number}
                      onChange={(event) =>
                        setBrokerPersonForm({ ...brokerPersonForm, nida_number: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>First name</span>
                    <input
                      className="input"
                      value={brokerPersonForm.first_name}
                      onChange={(event) =>
                        setBrokerPersonForm({ ...brokerPersonForm, first_name: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Middle name</span>
                    <input
                      className="input"
                      value={brokerPersonForm.middle_name}
                      onChange={(event) =>
                        setBrokerPersonForm({ ...brokerPersonForm, middle_name: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Surname</span>
                    <input
                      className="input"
                      value={brokerPersonForm.surname}
                      onChange={(event) =>
                        setBrokerPersonForm({ ...brokerPersonForm, surname: event.target.value })
                      }
                    />
                  </label>
                  <div className="grid-2">
                    <label className="field">
                      <span>Gender</span>
                      <select
                        className="input"
                        value={brokerPersonForm.gender}
                        onChange={(event) =>
                          setBrokerPersonForm({ ...brokerPersonForm, gender: event.target.value })
                        }
                      >
                        <option value="FEMALE">Female</option>
                        <option value="MALE">Male</option>
                      </select>
                    </label>
                    <label className="field">
                      <span>Mobile</span>
                      <input
                        className="input"
                        value={brokerPersonForm.mobile}
                        onChange={(event) =>
                          setBrokerPersonForm({ ...brokerPersonForm, mobile: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <label className="field">
                    <span>Email</span>
                    <input
                      className="input"
                      value={brokerPersonForm.email}
                      onChange={(event) =>
                        setBrokerPersonForm({ ...brokerPersonForm, email: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Address</span>
                    <input
                      className="input"
                      value={brokerPersonForm.address}
                      onChange={(event) =>
                        setBrokerPersonForm({ ...brokerPersonForm, address: event.target.value })
                      }
                    />
                  </label>
                  <div className="grid-2">
                    <label className="field">
                      <span>Market</span>
                      <select
                        className="input"
                        value={brokerForm.market_id}
                        onChange={(event) =>
                          setBrokerForm({ ...brokerForm, market_id: event.target.value })
                        }
                      >
                        <option value="">Select market</option>
                        {markets.map((market) => (
                          <option key={market.id} value={market.id}>
                            {market.market_name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>Broker type</span>
                      <select
                        className="input"
                        value={brokerForm.broker_type}
                        onChange={(event) =>
                          setBrokerForm({ ...brokerForm, broker_type: event.target.value })
                        }
                      >
                        <option value="PRODUCE_BROKER">Produce broker</option>
                        <option value="LIVESTOCK_BROKER">Livestock broker</option>
                        <option value="FREIGHT_BROKER">Freight broker</option>
                        <option value="EXPORT_BROKER">Export broker</option>
                        <option value="IMPORT_BROKER">Import broker</option>
                        <option value="COMMISSION_AGENT">Commission agent</option>
                      </select>
                    </label>
                  </div>
                  <button
                    className="button"
                    type="button"
                    onClick={handleRegisterBroker}
                    disabled={loading}
                  >
                    Register broker
                  </button>
                </div>
              </div>

              <div className="surface">
                <h3>Register chairperson (person + term)</h3>
                <div className="form-grid">
                  <label className="field">
                    <span>User account</span>
                    <select
                      className="input"
                      value={chairPersonForm.user_id}
                      onChange={(event) => handleSelectChairUser(event.target.value)}
                    >
                      <option value="">Select user account</option>
                      {filteredUsers.map((userItem) => (
                        <option key={userItem.id} value={userItem.id}>
                          {userItem.name} ({userItem.email})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>NIDA number</span>
                    <input
                      className="input"
                      value={chairPersonForm.nida_number}
                      onChange={(event) =>
                        setChairPersonForm({ ...chairPersonForm, nida_number: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>First name</span>
                    <input
                      className="input"
                      value={chairPersonForm.first_name}
                      onChange={(event) =>
                        setChairPersonForm({ ...chairPersonForm, first_name: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Middle name</span>
                    <input
                      className="input"
                      value={chairPersonForm.middle_name}
                      onChange={(event) =>
                        setChairPersonForm({ ...chairPersonForm, middle_name: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Surname</span>
                    <input
                      className="input"
                      value={chairPersonForm.surname}
                      onChange={(event) =>
                        setChairPersonForm({ ...chairPersonForm, surname: event.target.value })
                      }
                    />
                  </label>
                  <div className="grid-2">
                    <label className="field">
                      <span>Gender</span>
                      <select
                        className="input"
                        value={chairPersonForm.gender}
                        onChange={(event) =>
                          setChairPersonForm({ ...chairPersonForm, gender: event.target.value })
                        }
                      >
                        <option value="FEMALE">Female</option>
                        <option value="MALE">Male</option>
                      </select>
                    </label>
                    <label className="field">
                      <span>Mobile</span>
                      <input
                        className="input"
                        value={chairPersonForm.mobile}
                        onChange={(event) =>
                          setChairPersonForm({ ...chairPersonForm, mobile: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <label className="field">
                    <span>Email</span>
                    <input
                      className="input"
                      value={chairPersonForm.email}
                      onChange={(event) =>
                        setChairPersonForm({ ...chairPersonForm, email: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Address</span>
                    <input
                      className="input"
                      value={chairPersonForm.address}
                      onChange={(event) =>
                        setChairPersonForm({ ...chairPersonForm, address: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Market</span>
                    <select
                      className="input"
                      value={chairForm.market_id}
                      onChange={(event) => setChairForm({ ...chairForm, market_id: event.target.value })}
                    >
                      <option value="">Select market</option>
                      {markets.map((market) => (
                        <option key={market.id} value={market.id}>
                          {market.market_name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid-2">
                    <label className="field">
                      <span>Start date</span>
                      <input
                        className="input"
                        type="date"
                        value={chairForm.start_date}
                        onChange={(event) =>
                          setChairForm({ ...chairForm, start_date: event.target.value })
                        }
                      />
                    </label>
                    <label className="field">
                      <span>End date</span>
                      <input
                        className="input"
                        type="date"
                        value={chairForm.end_date}
                        onChange={(event) => setChairForm({ ...chairForm, end_date: event.target.value })}
                      />
                    </label>
                  </div>
                  <button
                    className="button"
                    type="button"
                    onClick={handleRegisterChairperson}
                    disabled={loading}
                  >
                    Register chairperson
                  </button>
                </div>
              </div>
            </div>
          )}

          {activePane === "registry" && (
            <div className="grid-2">
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
              <div className="surface">
                <h3>People</h3>
                {filteredPersons.length === 0 ? (
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
                      {filteredPersons.map((person) => (
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
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brokers.map((broker) => (
                        <tr key={broker.id}>
                          <td>{broker.person_id}</td>
                          <td>{broker.broker_type}</td>
                          <td><span className="tag">{broker.status}</span></td>
                          <td>
                            <button
                              className="button button--ghost"
                              type="button"
                              onClick={() => handleDeactivateBroker(broker.id)}
                              disabled={loading || broker.status === "SUSPENDED"}
                            >
                              Deactivate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
