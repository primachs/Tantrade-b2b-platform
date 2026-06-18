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
    <div style={{ display: "flex", minHeight: "calc(100vh - 80px)", background: "#f1f5f9", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 24px 0 rgb(0 0 0 / 0.10)" }}>
      <style>{`
        .adm-sidebar { width: 252px; min-width: 252px; background: #0f172a; display: flex; flex-direction: column; }
        .adm-brand { display: flex; align-items: center; gap: 0.75rem; padding: 1.625rem 1.25rem 1.375rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .adm-brand__icon { width: 34px; height: 34px; background: #4f46e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .adm-brand__name { font-size: 0.9375rem; font-weight: 700; color: #f8fafc; letter-spacing: -0.015em; line-height: 1.2; }
        .adm-brand__sub { font-size: 0.6875rem; color: #475569; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 500; margin-top: 1px; }
        .adm-nav { flex: 1; padding: 1rem 0.625rem; display: flex; flex-direction: column; gap: 2px; }
        .adm-nav-section { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #334155; padding: 0.5rem 0.75rem 0.375rem; margin-top: 0.25rem; }
        .adm-nav-btn { display: flex; align-items: center; gap: 0.625rem; width: 100%; padding: 0.5625rem 0.75rem; background: transparent; border: none; border-radius: 7px; text-align: left; font-size: 0.8125rem; font-weight: 500; color: #64748b; cursor: pointer; transition: all 0.13s; }
        .adm-nav-btn:hover { background: rgba(255,255,255,0.05); color: #cbd5e1; }
        .adm-nav-btn.is-active { background: rgba(99,102,241,0.16); color: #a5b4fc; }
        .adm-nav-btn svg { width: 15px; height: 15px; flex-shrink: 0; }
        .adm-nav-badge { margin-left: auto; background: #dc2626; color: white; font-size: 0.625rem; font-weight: 700; border-radius: 9999px; padding: 0.1rem 0.4rem; line-height: 1.5; }
        .adm-footer { padding: 1rem; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
        .adm-user { display: flex; flex-direction: column; gap: 1px; overflow: hidden; }
        .adm-user__name { font-size: 0.8125rem; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .adm-user__role { font-size: 0.625rem; color: #475569; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 600; }
        .adm-logout { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 6px; color: #64748b; cursor: pointer; padding: 0.375rem; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
        .adm-logout:hover { background: rgba(239,68,68,0.12); color: #f87171; border-color: rgba(239,68,68,0.25); }
        .adm-logout svg { width: 14px; height: 14px; }
        .adm-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .adm-topbar { background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; }
        .adm-topbar h1 { font-size: 1.0625rem; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
        .adm-topbar__meta { font-size: 0.6875rem; color: #94a3b8; margin: 0; margin-top: 2px; }
        .adm-live-pill { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; font-weight: 600; border-radius: 9999px; padding: 0.3rem 0.75rem; }
        .adm-live-dot { width: 6px; height: 6px; border-radius: 50%; }
        @keyframes adm-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
        .adm-content { flex: 1; overflow-y: auto; padding: 1.75rem 2rem; }

        /* KPI Strip */
        .adm-kpi-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #e2e8f0; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 1.75rem; }
        .adm-kpi-cell { background: #fff; padding: 1.25rem 1.375rem; display: flex; flex-direction: column; gap: 0.2rem; }
        .adm-kpi-cell__eyebrow { font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: #94a3b8; }
        .adm-kpi-cell__value { font-size: 2rem; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; line-height: 1.1; }
        .adm-kpi-cell__meta { font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; }
        .adm-kpi-cell--highlight .adm-kpi-cell__value { color: #4f46e5; }

        /* Domain cards */
        .adm-domain-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 0; }
        .adm-domain-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: box-shadow 0.15s, border-color 0.15s; text-align: left; display: flex; flex-direction: column; }
        .adm-domain-card:hover { box-shadow: 0 4px 16px 0 rgb(0 0 0 / 0.07); border-color: #c7d2fe; }
        .adm-domain-card.is-active { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .adm-domain-card__head { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.375rem; }
        .adm-domain-card__icon { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .adm-domain-card__icon svg { width: 18px; height: 18px; }
        .adm-domain-card__label { font-size: 0.8125rem; font-weight: 700; color: #0f172a; }
        .adm-domain-card__hint { font-size: 0.75rem; color: #94a3b8; margin-top: 1px; }
        .adm-domain-card__value { font-size: 1.75rem; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; margin-left: auto; }
        .adm-domain-card__cta { padding: 0.625rem 1.375rem; font-size: 0.75rem; font-weight: 600; color: #6366f1; background: #f8fafc; border-top: 1px solid #f1f5f9; }
        .adm-domain-card.is-active .adm-domain-card__cta { color: #4338ca; background: #eef2ff; }

        /* Detail panel */
        .adm-detail-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-top: 1.25rem; }
        .adm-detail-panel__head { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; background: #fafafa; }
        .adm-detail-panel__title { font-size: 0.9375rem; font-weight: 700; color: #0f172a; margin: 0; }
        .adm-detail-close { background: transparent; border: none; cursor: pointer; color: #94a3b8; font-size: 0.8125rem; font-weight: 500; padding: 0.25rem 0.625rem; border-radius: 5px; transition: all 0.13s; }
        .adm-detail-close:hover { color: #475569; background: #f1f5f9; }

        /* Tables */
        .adm-table { width: 100%; border-collapse: collapse; }
        .adm-table th { padding: 0.625rem 1.25rem; background: #f8fafc; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #64748b; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .adm-table td { padding: 0.875rem 1.25rem; border-bottom: 1px solid #f1f5f9; font-size: 0.8125rem; color: #334155; vertical-align: middle; }
        .adm-table tr:last-child td { border-bottom: none; }
        .adm-table tr:hover td { background: #fafafe; }

        /* Tags */
        .adm-tag { display: inline-flex; align-items: center; font-size: 0.6875rem; font-weight: 600; border-radius: 9999px; padding: 0.2rem 0.6rem; white-space: nowrap; background: #f1f5f9; color: #475569; }
        .adm-tag--success { background: #dcfce7; color: #15803d; }
        .adm-tag--danger  { background: #fee2e2; color: #dc2626; }
        .adm-tag--warning { background: #fef3c7; color: #b45309; }
        .adm-tag--blue    { background: #dbeafe; color: #1d4ed8; }

        /* User management */
        .adm-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
        .adm-section-head { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; background: #fafafa; }
        .adm-section-title-wrap { display: flex; align-items: center; gap: 0.75rem; }
        .adm-section-icon { width: 34px; height: 34px; background: #eef2ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #4f46e5; }
        .adm-section-icon svg { width: 16px; height: 16px; }
        .adm-section-head h2 { font-size: 0.9375rem; font-weight: 700; color: #0f172a; margin: 0; }
        .adm-section-head p { font-size: 0.75rem; color: #94a3b8; margin: 0; margin-top: 1px; }
        .adm-btn-sm { font-size: 0.75rem; font-weight: 600; border-radius: 6px; padding: 0.3rem 0.7rem; cursor: pointer; transition: all 0.13s; display: inline-flex; align-items: center; gap: 0.3rem; border: 1px solid transparent; }
        .adm-btn-outline { background: #fff; border-color: #cbd5e1; color: #334155; }
        .adm-btn-outline:hover { border-color: #94a3b8; }
        .adm-btn-primary { background: #4f46e5; color: #fff; border-color: #4f46e5; }
        .adm-btn-primary:hover { background: #4338ca; }
        .adm-btn-ghost { background: #f1f5f9; color: #475569; border-color: #f1f5f9; }
        .adm-btn-ghost:hover { background: #e2e8f0; }
        .adm-updating-pill { font-size: 0.75rem; font-weight: 600; background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; border-radius: 9999px; padding: 0.25rem 0.75rem; }

        /* Verification */
        .adm-review-card { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-top: 1.25rem; }
        .adm-review-card__head { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.25rem 1.5rem; background: #fafafa; border-bottom: 1px solid #f1f5f9; }
        .adm-review-card__head h3 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
        .adm-review-card__head p { font-size: 0.8125rem; color: #94a3b8; margin: 0.2rem 0 0; }
        .adm-review-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .adm-review-grid > div { padding: 0.875rem 1.25rem; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
        .adm-review-grid > div:nth-child(3n) { border-right: none; }
        .adm-review-grid strong { display: block; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; margin-bottom: 0.25rem; }
        .adm-review-grid p { margin: 0; font-size: 0.875rem; color: #1e293b; font-weight: 500; }
        .adm-review-grid__full { grid-column: 1 / -1; border-right: none !important; }
        .adm-review-actions { padding: 1.25rem 1.5rem; display: flex; align-items: flex-start; gap: 1.5rem; background: #fafafa; }
        .adm-approve-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; background: #16a34a; color: white; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: background 0.15s; flex-shrink: 0; }
        .adm-approve-btn:hover { background: #15803d; }
        .adm-approve-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .adm-reject-block { display: flex; flex-direction: column; gap: 0.625rem; flex: 1; }
        .adm-reject-textarea { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.8125rem; resize: vertical; font-family: inherit; color: #334155; box-sizing: border-box; }
        .adm-reject-textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .adm-reject-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #fff; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all 0.15s; align-self: flex-start; }
        .adm-reject-btn:hover { background: #fee2e2; }
        .adm-reject-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .adm-back-link { background: none; border: none; color: #6366f1; font-size: 0.8125rem; font-weight: 600; cursor: pointer; padding: 0; display: inline-flex; align-items: center; gap: 0.3rem; }
        .adm-back-link:hover { color: #4f46e5; text-decoration: underline; }
        .adm-notice-error { display: flex; align-items: center; gap: 0.625rem; padding: 0.875rem 1.25rem; background: #fef2f2; color: #991b1b; border-left: 3px solid #dc2626; font-size: 0.875rem; margin: 1rem 1.5rem; border-radius: 0 6px 6px 0; }
        .adm-empty { text-align: center; padding: 3rem 2rem; color: #94a3b8; font-size: 0.875rem; }
        .adm-panel-row-btn { background: none; border: none; color: #6366f1; font-size: 0.8125rem; font-weight: 600; cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 5px; }
        .adm-panel-row-btn:hover { background: #eef2ff; }
      `}</style>

      <aside className="adm-sidebar">
        <div className="adm-brand">
          <div className="adm-brand__icon">
            <Shield style={{ width: 17, height: 17, color: "#fff" }} />
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
              <Icon />
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
            <LogOut />
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
            <div className="adm-live-pill" style={{ background: "#eef2ff", border: "1px solid #c7d2fe", color: "#4f46e5" }}>
              <span className="adm-live-dot" style={{ background: "#4f46e5", animation: "adm-blink 1.5s infinite" }} />
              Syncing
            </div>
          ) : (
            <div className="adm-live-pill" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a" }}>
              <Activity style={{ width: 12, height: 12 }} />
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