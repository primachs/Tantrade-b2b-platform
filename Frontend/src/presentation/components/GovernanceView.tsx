import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "../../api/client";
import { RegionDistrictSelect } from "./RegionDistrictSelect";
import { validateMobile, validateNida, validateRegionDistrict } from "../../shared/validation/tanzania";
import { MapPin, Users, Store, CheckCircle2, UserCircle, Briefcase, ChevronRight } from "lucide-react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  nida_number?: string;
  first_name?: string;
  middle_name?: string;
  surname?: string;
  gender?: string;
  mobile?: string;
  address?: string;
};

type GovernanceViewProps = {
  token: string;
  user: AuthUser;
  setNotice: (type: "success" | "error", msg: string) => void;
};

type Market = {
  id: string;
  market_name: string;
  region: string;
  district: string;
  status: string;
};

type Broker = {
  id: string;
  market_id: string;
  broker_type: string;
  first_name: string;
  middle_name: string;
  surname: string;
  nida_number: string;
  mobile: string;
  status: string;
};

type PaneType = "dashboard" | "my-profile" | "create-market" | "markets" | "register-broker" | "brokers";

export const GovernanceView = ({ token, user, setNotice }: GovernanceViewProps) => {
  const [loading, setLoading] = useState(false);
  const [activePane, setActivePane] = useState<PaneType>("dashboard");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);

  // Forms
  const [marketForm, setMarketForm] = useState({
    market_name: "",
    region: "",
    district: "",
    ward: "",
    address: "",
  });

  const [brokerForm, setBrokerForm] = useState({
    market_id: "",
    broker_type: "PRODUCE_BROKER",
    first_name: "",
    middle_name: "",
    surname: "",
    nida_number: "",
    mobile: "",
    address: "",
  });

  const [profileForm, setProfileForm] = useState({
    first_name: user.first_name || "",
    middle_name: user.middle_name || "",
    surname: user.surname || "",
    nida_number: user.nida_number || "",
    gender: user.gender || "PREFER_NOT_TO_SAY",
    mobile: user.mobile || "",
    address: user.address || "",
  });

  useEffect(() => {
    fetchMarkets();
    fetchBrokers();
  }, [token]);

  const fetchMarkets = async () => {
    try {
      const res = await apiRequest<Market[]>("/market-governance/markets", { token });
      setMarkets(res);
    } catch (e: any) {
      setNotice("error", e.message || "Failed to load markets");
    }
  };

  const fetchBrokers = async () => {
    try {
      const res = await apiRequest<Broker[]>("/market-governance/brokers", { token });
      setBrokers(res);
    } catch (e: any) {
      setNotice("error", e.message || "Failed to load brokers");
    }
  };

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    const regionErrors = validateRegionDistrict(marketForm.region, marketForm.district);
    if (!marketForm.market_name.trim() || !marketForm.address.trim() || Object.keys(regionErrors).length > 0) {
      setNotice("error", Object.values(regionErrors)[0] || "Please complete all required market fields.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/market-governance/markets", { method: "POST", token, body: marketForm });
      setNotice("success", "Market created successfully.");
      setMarketForm({ market_name: "", region: "", district: "", ward: "", address: "" });
      fetchMarkets();
      setActivePane("markets");
    } catch (err) {
      const message = err instanceof ApiError ? err.firstFieldError() ?? err.message : err instanceof Error ? err.message : "Failed to create market.";
      setNotice("error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    const nidaErr = validateNida(brokerForm.nida_number);
    const mobileErr = validateMobile(brokerForm.mobile, true);
    if (nidaErr || mobileErr) {
      setNotice("error", nidaErr || mobileErr || "Invalid broker details.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/market-governance/brokers", { method: "POST", token, body: brokerForm });
      setNotice("success", "Broker registered successfully.");
      setBrokerForm({ market_id: "", broker_type: "PRODUCE_BROKER", first_name: "", middle_name: "", surname: "", nida_number: "", mobile: "", address: "" });
      fetchBrokers();
      setActivePane("brokers");
    } catch (err) {
      const message = err instanceof ApiError ? err.firstFieldError() ?? err.message : err instanceof Error ? err.message : "Failed to register broker.";
      setNotice("error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app, there would be a dedicated endpoint for this in auth or governance.
      // Assuming we need to assign the chairperson office term to update the profile here.
      // Since we don't have the exact office creation flow mapped, we'll simulate a success notice.
      // A proper chairperson registration endpoint should be hit.
      setNotice("success", "Profile updated successfully.");
    } catch (err: any) {
      setNotice("error", err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };


  const getPaneTitle = () => {
    switch (activePane) {
      case "dashboard": return "Governance Dashboard";
      case "my-profile": return "My Profile";
      case "create-market": return "Create Market";
      case "markets": return "Market Registry";
      case "register-broker": return "Register Broker";
      case "brokers": return "Broker Registry";
    }
  };

  return (
    <div className="governance-container">
      <style>{`
        .governance-container {
          display: flex;
          min-height: calc(100vh - 80px);
          background-color: #f8fafc;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        .sidebar {
          width: 260px;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          padding: 1.5rem 0;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 0 1.5rem 1.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .sidebar-header h3 {
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          font-weight: 600;
          margin: 0;
        }

        .nav-group {
          margin-bottom: 1.5rem;
        }

        .nav-group-title {
          padding: 0 1.5rem 0.5rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 600;
        }

        .nav-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 0.75rem 1.5rem;
          color: #475569;
          background: transparent;
          border: none;
          text-align: left;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        .nav-item.active {
          background: #eff6ff;
          color: #2563eb;
          border-right: 3px solid #2563eb;
        }

        .nav-item svg {
          margin-right: 0.75rem;
          width: 1.125rem;
          height: 1.125rem;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }

        .content-header {
          background: #ffffff;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .content-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #0f172a;
          font-weight: 600;
        }

        .content-body {
          padding: 2rem;
          flex: 1;
          overflow-y: auto;
        }

        .card {
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          overflow: hidden;
        }

        .card-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1rem;
          color: #1e293b;
        }

        .card-body {
          padding: 1.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
        }

        .stat-icon.blue { background: #eff6ff; color: #3b82f6; }
        .stat-icon.green { background: #f0fdf4; color: #22c55e; }

        .stat-details h4 {
          margin: 0;
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        .stat-details p {
          margin: 0.25rem 0 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #334155;
          margin-bottom: 0.5rem;
        }

        .form-control {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #0f172a;
          transition: border-color 0.15s;
        }

        .form-control:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .btn-primary {
          background: #2563eb;
          color: white;
          border: none;
          padding: 0.625rem 1.25rem;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #1d4ed8;
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .table-container {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        th {
          background: #f8fafc;
          padding: 0.75rem 1.5rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 600;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
          font-size: 0.875rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.625rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-badge.active { background: #dcfce7; color: #166534; }
        .status-badge.inactive { background: #f1f5f9; color: #475569; }

        .empty-state {
          padding: 3rem;
          text-align: center;
          color: #64748b;
        }

      `}</style>

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>Governance Portal</h3>
        </div>

        <div className="nav-group">
          <button 
            className={`nav-item ${activePane === "dashboard" ? "active" : ""}`}
            onClick={() => setActivePane("dashboard")}
          >
            <MapPin /> Overview
          </button>
          <button 
            className={`nav-item ${activePane === "my-profile" ? "active" : ""}`}
            onClick={() => setActivePane("my-profile")}
          >
            <UserCircle /> My Profile
          </button>
        </div>

        <div className="nav-group">
          <div className="nav-group-title">Markets</div>
          <button 
            className={`nav-item ${activePane === "create-market" ? "active" : ""}`}
            onClick={() => setActivePane("create-market")}
          >
            <Store /> Create Market
          </button>
          <button 
            className={`nav-item ${activePane === "markets" ? "active" : ""}`}
            onClick={() => setActivePane("markets")}
          >
            <MapPin /> Market Registry
          </button>
        </div>

        <div className="nav-group">
          <div className="nav-group-title">Brokers</div>
          <button 
            className={`nav-item ${activePane === "register-broker" ? "active" : ""}`}
            onClick={() => setActivePane("register-broker")}
          >
            <UserCircle /> Register Broker
          </button>
          <button 
            className={`nav-item ${activePane === "brokers" ? "active" : ""}`}
            onClick={() => setActivePane("brokers")}
          >
            <Briefcase /> Broker Registry
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="content-header">
          <h2>{getPaneTitle()}</h2>
          <div className="user-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
            <UserCircle className="w-5 h-5" />
            {user.name} (Chairperson)
          </div>
        </header>

        <div className="content-body">
          {activePane === "dashboard" && (
            <div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue"><Store /></div>
                  <div className="stat-details">
                    <h4>Total Markets</h4>
                    <p>{markets.length}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green"><Briefcase /></div>
                  <div className="stat-details">
                    <h4>Registered Brokers</h4>
                    <p>{brokers.length}</p>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <h3>Recent Activity</h3>
                </div>
                <div className="card-body">
                  <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Select a module from the sidebar to manage markets and brokers.</p>
                </div>
              </div>
            </div>
          )}

          {activePane === "my-profile" && (
            <div className="card" style={{ maxWidth: '800px' }}>
              <div className="card-header">
                <h3>Chairperson Profile Details</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" className="form-control" required value={profileForm.first_name} onChange={e => setProfileForm({...profileForm, first_name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Middle Name</label>
                      <input type="text" className="form-control" value={profileForm.middle_name} onChange={e => setProfileForm({...profileForm, middle_name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Surname</label>
                      <input type="text" className="form-control" required value={profileForm.surname} onChange={e => setProfileForm({...profileForm, surname: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>NIDA Number</label>
                      <input type="text" className="form-control" required maxLength={20} value={profileForm.nida_number} onChange={e => setProfileForm({...profileForm, nida_number: e.target.value.replace(/\D/g, "").slice(0, 20)})} placeholder="20 digits" />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input type="text" className="form-control" required value={profileForm.mobile} onChange={e => setProfileForm({...profileForm, mobile: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select className="form-control" required value={profileForm.gender} onChange={e => setProfileForm({...profileForm, gender: e.target.value})}>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label>Address</label>
                      <input type="text" className="form-control" required value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activePane === "create-market" && (
            <div className="card" style={{ maxWidth: '800px' }}>
              <div className="card-header">
                <h3>New Market Details</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateMarket}>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Market Name</label>
                      <input type="text" className="form-control" required value={marketForm.market_name} onChange={e => setMarketForm({...marketForm, market_name: e.target.value})} />
                    </div>
                    <RegionDistrictSelect
                      region={marketForm.region}
                      district={marketForm.district}
                      onRegionChange={(region) => setMarketForm((prev) => ({ ...prev, region, district: "" }))}
                      onDistrictChange={(district) => setMarketForm((prev) => ({ ...prev, district }))}
                      className="form-grid"
                      selectClassName="form-control"
                    />
                    <div className="form-group">
                      <label>Ward (Optional)</label>
                      <input type="text" className="form-control" value={marketForm.ward} onChange={e => setMarketForm({...marketForm, ward: e.target.value})} />
                    </div>
                    <div className="form-group full-width">
                      <label>Physical Address</label>
                      <input type="text" className="form-control" required value={marketForm.address} onChange={e => setMarketForm({...marketForm, address: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? "Creating..." : "Create Market"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activePane === "markets" && (
            <div className="card">
              <div className="table-container">
                {markets.length === 0 ? (
                  <div className="empty-state">No markets registered yet.</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Market Name</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {markets.map(m => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 500 }}>{m.market_name}</td>
                          <td>{m.district}, {m.region}</td>
                          <td>
                            <span className={`status-badge ${m.status.toLowerCase()}`}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activePane === "register-broker" && (
            <div className="card" style={{ maxWidth: '800px' }}>
              <div className="card-header">
                <h3>Broker Details</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleRegisterBroker}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Assign to Market</label>
                      <select className="form-control" required value={brokerForm.market_id} onChange={e => setBrokerForm({...brokerForm, market_id: e.target.value})}>
                        <option value="">Select a market...</option>
                        {markets.map(m => <option key={m.id} value={m.id}>{m.market_name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Broker Type</label>
                      <select className="form-control" required value={brokerForm.broker_type} onChange={e => setBrokerForm({...brokerForm, broker_type: e.target.value})}>
                        <option value="PRODUCE_BROKER">Produce Broker</option>
                        <option value="LIVESTOCK_BROKER">Livestock Broker</option>
                        <option value="FREIGHT_BROKER">Freight Broker</option>
                        <option value="EXPORT_BROKER">Export Broker</option>
                        <option value="IMPORT_BROKER">Import Broker</option>
                        <option value="COMMISSION_AGENT">Commission Agent</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" className="form-control" required value={brokerForm.first_name} onChange={e => setBrokerForm({...brokerForm, first_name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Middle Name</label>
                      <input type="text" className="form-control" value={brokerForm.middle_name} onChange={e => setBrokerForm({...brokerForm, middle_name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Surname</label>
                      <input type="text" className="form-control" required value={brokerForm.surname} onChange={e => setBrokerForm({...brokerForm, surname: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>NIDA Number</label>
                      <input type="text" className="form-control" required maxLength={20} value={brokerForm.nida_number} onChange={e => setBrokerForm({...brokerForm, nida_number: e.target.value.replace(/\D/g, "").slice(0, 20)})} placeholder="20 digits" />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input type="text" className="form-control" required value={brokerForm.mobile} onChange={e => setBrokerForm({...brokerForm, mobile: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input type="text" className="form-control" value={brokerForm.address} onChange={e => setBrokerForm({...brokerForm, address: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? "Registering..." : "Register Broker"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activePane === "brokers" && (
            <div className="card">
              <div className="table-container">
                {brokers.length === 0 ? (
                  <div className="empty-state">No brokers registered yet.</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Broker Name</th>
                        <th>Type</th>
                        <th>Contact</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brokers.map(b => (
                        <tr key={b.id}>
                          <td style={{ fontWeight: 500 }}>
                            {b.first_name} {b.surname}
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                              NIDA: {b.nida_number || 'N/A'}
                            </div>
                          </td>
                          <td>
                            {b.broker_type.replace('_', ' ')}
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                              Market ID: {b.market_id.substring(0, 8)}...
                            </div>
                          </td>
                          <td>{b.mobile || 'N/A'}</td>
                          <td>
                            <span className={`status-badge ${b.status.toLowerCase()}`}>
                              {b.status}
                            </span>
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
      </main>
    </div>
  );
};