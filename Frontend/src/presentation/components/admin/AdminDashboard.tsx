import { useState } from "react";
import { AuthUser, Business, Rfs, TaxonomyResponse, Market, Broker } from "./types";
import { OverviewPane } from "./OverviewPane";
import { UserManagementPane } from "./UserManagementPane";
import { BusinessVerificationPane } from "./BusinessVerificationPane";
import { MarketOversightPane } from "./MarketOversightPane";
import { Menu } from "lucide-react";

type AdminDashboardProps = {
  token: string;
  user: { name: string };
  authUsers: AuthUser[];
  businesses: Business[];
  rfsList: Rfs[];
  taxonomy: TaxonomyResponse | null;
  markets: Market[];
  brokers: Broker[];
  loading: boolean;
  onRefresh: () => void;
  setNotice: (type: "success" | "error", msg: string) => void;
};

type PaneType = "overview" | "users" | "verification" | "oversight";

export const AdminDashboard = ({
  token,
  user,
  authUsers,
  businesses,
  rfsList,
  taxonomy,
  markets,
  brokers,
  loading,
  onRefresh,
  setNotice,
}: AdminDashboardProps) => {
  const [activePane, setActivePane] = useState<PaneType>("overview");
  const [isPaneMenuOpen, setIsPaneMenuOpen] = useState(false);

  const serviceTypes = Array.isArray(taxonomy?.service_types) ? taxonomy.service_types : [];

  const paneItems: { id: PaneType; label: string }[] = [
    { id: "overview", label: "Operations Overview" },
    { id: "users", label: "User Management" },
    { id: "verification", label: "Business Verification" },
    { id: "oversight", label: "Market Oversight" },
  ];

  return (
    <div className="governance-container">
      <button
        className={`drawer-overlay ${isPaneMenuOpen ? "is-active" : ""}`}
        type="button"
        aria-label="Close menu"
        onClick={() => setIsPaneMenuOpen(false)}
      />

      <aside className={`sidebar ${isPaneMenuOpen ? "is-open" : ""}`}>
        <div className="sidebar-header">
          <h3>Admin Dashboard</h3>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>System Operations</span>
        </div>
        <div className="sidebar-nav">
          {paneItems.map((pane) => (
            <button
              key={pane.id}
              className={`nav-item ${activePane === pane.id ? "active" : ""}`}
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

      <div className="main-content">
        <header className="mobile-header">
          <h2>
            {paneItems.find((p) => p.id === activePane)?.label}
          </h2>
          <button
            className="menu-trigger"
            onClick={() => setIsPaneMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {loading && <div className="loading-indicator">Syncing data...</div>}

        {activePane === "overview" && (
          <OverviewPane
            user={user}
            authUsers={authUsers}
            businesses={businesses}
            rfsList={rfsList}
            serviceTypes={serviceTypes}
          />
        )}

        {activePane === "users" && (
          <UserManagementPane
            token={token}
            authUsers={authUsers}
            onRefresh={onRefresh}
            setNotice={setNotice}
          />
        )}

        {activePane === "verification" && (
          <BusinessVerificationPane
            token={token}
            businesses={businesses}
            onRefresh={onRefresh}
            setNotice={setNotice}
          />
        )}

        {activePane === "oversight" && (
          <MarketOversightPane
            markets={markets}
            brokers={brokers}
            rfsList={rfsList}
            serviceTypes={serviceTypes}
          />
        )}
      </div>
    </div>
  );
};
