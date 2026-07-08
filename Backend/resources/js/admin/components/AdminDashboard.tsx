import { useState } from "react";
import { AuthUser, Business, Rfs, TaxonomyResponse, Market, Broker } from "./types";
import { OverviewPane } from "./OverviewPane";
import { UserManagementPane } from "./UserManagementPane";
import { BusinessVerificationPane } from "./BusinessVerificationPane";
import { Shield, Radar, Briefcase, Users, LogOut, Activity } from "lucide-react";

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
  onLogout: () => void;
};

type PaneType = "overview" | "users" | "verification";

export const AdminDashboard = ({
  token, user, authUsers, businesses, rfsList,
  taxonomy, markets, brokers, loading, onRefresh, setNotice, onLogout,
}: AdminDashboardProps) => {
  const [activePane, setActivePane] = useState<PaneType>("overview");

  const serviceTypes = Array.isArray(taxonomy?.service_types) ? taxonomy.service_types : [];
  const pendingVerifications = businesses.filter((b) => {
    const status = b.verification?.verification_status ?? b.verification_status ?? "UNVERIFIED";
    return ["UNVERIFIED", "PARTIALLY_VERIFIED"].includes(status);
  }).length;

  const navItems: { id: PaneType; label: string; icon: typeof Radar; badge?: number }[] = [
    { id: "overview", label: "Operations Overview", icon: Radar },
    { id: "users", label: "User Management", icon: Users },
    { id: "verification", label: "Business Verification", icon: Briefcase, badge: pendingVerifications || undefined },
  ];

  const paneTitles: Record<PaneType, string> = {
    overview: "Operations Overview",
    users: "User Management",
    verification: "Business Verification",
  };

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <div className="adm-brand__icon">
            <Shield style={{ width: 20, height: 20, color: "#fff" }} />
          </div>
          <div>
            <div className="adm-brand__name">TanTrade</div>
            <div className="adm-brand__sub">Admin Console</div>
          </div>
        </div>
        
        <nav className="adm-nav">
          <div className="adm-nav-section">Platform</div>
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} type="button" className={`adm-nav-btn${activePane === id ? " is-active" : ""}`} onClick={() => setActivePane(id)}>
              <Icon style={{ width: 18, height: 18 }} />
              {label}
              {badge ? <span className="adm-nav-badge">{badge}</span> : null}
            </button>
          ))}
        </nav>
        
        <div className="adm-footer">
          <div className="adm-user">
            <span className="adm-user__name">{user.name}</span>
            <span className="adm-user__role">Administrator</span>
          </div>
          <button className="adm-logout" title="Sign out" type="button" onClick={onLogout}>
            <LogOut style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </aside>

      <main className="adm-main">
        <header className="adm-topbar">
          <div>
            <h1>{paneTitles[activePane]}</h1>
            <p className="adm-topbar__meta">TanTrade B2B Platform · Admin Console</p>
          </div>
          {loading ? (
            <div className="adm-live-pill" style={{ background: "var(--adm-primary-bg)", border: "1px solid #c7d2fe", color: "var(--adm-primary)" }}>
              <Activity style={{ width: 14, height: 14 }} className="adm-spinner-icon" />
              Syncing
            </div>
          ) : (
            <div className="adm-live-pill" style={{ background: "var(--adm-success-bg)", border: "1px solid #a7f3d0", color: "#065f46" }}>
              <Activity style={{ width: 14, height: 14 }} />
              Live
            </div>
          )}
        </header>
        
        <div className="adm-content">
          {activePane === "overview" && (
            <OverviewPane user={user} authUsers={authUsers} businesses={businesses} rfsList={rfsList} serviceTypes={serviceTypes} markets={markets} brokers={brokers} />
          )}
          {activePane === "users" && (
            <UserManagementPane token={token} authUsers={authUsers} onRefresh={onRefresh} setNotice={setNotice} />
          )}
          {activePane === "verification" && (
            <BusinessVerificationPane token={token} businesses={businesses} onRefresh={onRefresh} setNotice={setNotice} />
          )}
        </div>
      </main>
    </div>
  );
};