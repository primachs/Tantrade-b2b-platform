import { useState } from "react";
import { Radar, Briefcase, FilePlus, MessageSquare, Menu, Settings, Building2 } from "lucide-react";
import { Business, TaxonomyResponse, Rfs } from "./types";
import { MyBusinessPane } from "./MyBusinessPane";
import { CreateRfsPane } from "./CreateRfsPane";
import { RfsRegistryPane } from "./RfsRegistryPane";
import { EngagementsPane } from "./EngagementsPane";

type BusinessDashboardProps = {
  token: string;
  myBusiness: Business;
  taxonomy: TaxonomyResponse | null;
  rfsList: Rfs[];
  loading: boolean;
  onRefresh: () => void;
  setNotice: (type: "success" | "error", msg: string) => void;
};

export const BusinessDashboard = ({
  token,
  myBusiness,
  taxonomy,
  rfsList,
  loading,
  onRefresh,
  setNotice
}: BusinessDashboardProps) => {
  const [activePane, setActivePane] = useState("registry");
  const [isPaneMenuOpen, setIsPaneMenuOpen] = useState(false);
  const [editingRfs, setEditingRfs] = useState<Rfs | null>(null);

  const paneItems = [
    { id: "registry", label: "RFS Registry", icon: Briefcase },
    { id: "create-rfs", label: "Create RFS", icon: FilePlus },
    { id: "engagements", label: "Engagements", icon: MessageSquare },
    { id: "my-business", label: "My Profile", icon: Settings },
  ];

  const getPaneTitle = () => {
    switch (activePane) {
      case "registry": return "RFS Registry";
      case "create-rfs": return editingRfs ? "Edit RFS" : "Create RFS";
      case "engagements": return "Engagements";
      case "my-business": return "My Business Profile";
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
          border-radius: 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04);
          margin: 1rem 0 1rem 1rem;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0.5rem 0.5rem 1.25rem;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid #f2f2f2;
        }

        .sidebar-header__icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #eef1f8;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-header h3 {
          font-size: 0.88rem;
          color: #1d1d1f;
          font-weight: 700;
          margin: 0;
        }

        .nav-group {
          margin-bottom: 1.25rem;
        }

        .nav-group-title {
          padding: 0 0.7rem 0.5rem;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #86868b;
          font-weight: 600;
        }

        .nav-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 0.6rem 0.7rem;
          margin-bottom: 0.15rem;
          border-radius: 10px;
          color: #3c3c3c;
          background: transparent;
          border: none;
          text-align: left;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }

        .nav-item:hover {
          background: #fafbfc;
        }

        .nav-item.active {
          background: rgba(60,94,171,0.08);
          color: #3c5eab;
          font-weight: 600;
        }

        .nav-item svg {
          margin-right: 0.7rem;
          width: 1.05rem;
          height: 1.05rem;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
          position: relative;
        }

        .content-header {
          padding: 1.5rem 2rem;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .content-header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .content-body {
          padding: 2rem;
          flex: 1;
          overflow-y: auto;
        }

        .card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          overflow: hidden;
        }

        .form-control {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .form-control:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }

        @media (max-width: 768px) {
          .sidebar {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.3s;
          }
          .sidebar.is-open {
            transform: translateX(0);
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }

        .mobile-menu-btn {
          display: none;
          background: transparent;
          border: none;
          color: #475569;
          cursor: pointer;
        }
      `}</style>

      <aside className={`sidebar ${isPaneMenuOpen ? "is-open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-header__icon">
            <Building2 style={{ color: "#3c5eab", width: "18px", height: "18px" }} />
          </div>
          <h3>{myBusiness.name}</h3>
        </div>

        <div className="nav-group">
          <div className="nav-group-title">Marketplace</div>
          <button className={`nav-item ${activePane === "registry" ? "active" : ""}`} onClick={() => { setActivePane("registry"); setIsPaneMenuOpen(false); }}>
            <Briefcase /> Registry
          </button>
          <button className={`nav-item ${activePane === "create-rfs" ? "active" : ""}`} onClick={() => { setEditingRfs(null); setActivePane("create-rfs"); setIsPaneMenuOpen(false); }}>
            <FilePlus /> Create RFS
          </button>
          <button className={`nav-item ${activePane === "engagements" ? "active" : ""}`} onClick={() => { setActivePane("engagements"); setIsPaneMenuOpen(false); }}>
            <MessageSquare /> Engagements
          </button>
        </div>

        <div className="nav-group">
          <div className="nav-group-title">Management</div>
          <button className={`nav-item ${activePane === "my-business" ? "active" : ""}`} onClick={() => { setActivePane("my-business"); setIsPaneMenuOpen(false); }}>
            <Settings /> My Profile
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <h1>
            <button className="mobile-menu-btn" onClick={() => setIsPaneMenuOpen(!isPaneMenuOpen)}>
              <Menu />
            </button>
            {getPaneTitle()}
          </h1>
          {loading && <span style={{ fontSize: "0.875rem", color: "#64748b", background: "#f1f5f9", padding: "0.25rem 0.75rem", borderRadius: "9999px" }}>Syncing...</span>}
        </header>

        <div className="content-body">
          {activePane === "registry" && (
            <RfsRegistryPane token={token} rfsList={rfsList} myBusiness={myBusiness} taxonomy={taxonomy} onRefresh={onRefresh} setNotice={setNotice} onEdit={(rfs) => { setEditingRfs(rfs); setActivePane("create-rfs"); }} onNavigate={setActivePane} />
          )}
          {activePane === "create-rfs" && (
            <CreateRfsPane token={token} myBusiness={myBusiness} taxonomy={taxonomy} onCreated={() => { onRefresh(); setEditingRfs(null); setActivePane("registry"); }} setNotice={setNotice} editingRfs={editingRfs} />
          )}
          {activePane === "engagements" && (
            <EngagementsPane token={token} myBusiness={myBusiness} setNotice={setNotice} taxonomy={taxonomy} />
          )}
          {activePane === "my-business" && (
            <MyBusinessPane token={token} myBusiness={myBusiness} taxonomy={taxonomy} onUpdate={onRefresh} setNotice={setNotice} />
          )}
        </div>
      </main>
    </div>
  );
};