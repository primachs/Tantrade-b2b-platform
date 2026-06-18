import { useState } from "react";
import {
  Users, Briefcase, FileText, MapPin, UserCheck,
  Clock, CheckCircle2, AlertCircle, Layers, ChevronRight, XCircle,
} from "lucide-react";
import { AuthUser, Business, Rfs, ServiceType, Market, Broker } from "./types";

type OverviewPaneProps = {
  user: { name: string };
  authUsers: AuthUser[];
  businesses: Business[];
  rfsList: Rfs[];
  serviceTypes: ServiceType[];
  markets: Market[];
  brokers: Broker[];
};

type DomainCard = "markets" | "brokers" | "rfs" | "users" | "verification" | null;

function getVerificationStatus(biz: Business): string {
  return biz.verification?.verification_status ?? biz.verification_status ?? "UNVERIFIED";
}

export const OverviewPane = ({ user, authUsers, businesses, rfsList, serviceTypes, markets, brokers }: OverviewPaneProps) => {
  const [activeCard, setActiveCard] = useState<DomainCard>(null);

  const verifiedCount   = businesses.filter((b) => getVerificationStatus(b) === "VERIFIED").length;
  const pendingCount    = businesses.filter((b) => ["UNVERIFIED", "PARTIALLY_VERIFIED"].includes(getVerificationStatus(b))).length;
  const rejectedCount   = businesses.filter((b) => getVerificationStatus(b) === "REJECTED").length;
  const publishedRfs    = rfsList.filter((r) => r.status === "PUBLISHED").length;
  const activeBrokers   = brokers.filter((b) => b.status === "ACTIVE").length;
  const activeMarkets   = markets.filter((m) => m.status === "ACTIVE").length;
  const usersNoRoles    = authUsers.filter((u) => u.roles.length === 0).length;

  const serviceTypeMap  = new Map(serviceTypes.map((t) => [t.id, t.name]));
  const marketMap       = new Map(markets.map((m) => [m.id, m.market_name]));

  const kpis = [
    { label: "Pending Verifications", value: pendingCount, meta: "Awaiting admin review", icon: Clock, highlight: true },
    { label: "Verified Businesses",   value: verifiedCount,    meta: "Approved profiles",      icon: CheckCircle2 },
    { label: "Published RFS",         value: publishedRfs,     meta: "Active marketplace demand", icon: FileText },
    { label: "Users Without Roles",   value: usersNoRoles,     meta: "Need assignment",        icon: AlertCircle },
  ];

  type DomainDef = { id: DomainCard; label: string; hint: string; value: number; icon: typeof Users; iconBg: string; iconColor: string };
  const domains: DomainDef[] = [
    { id: "markets",      label: "Markets",              hint: `${activeMarkets} active`,        value: markets.length,    icon: MapPin,    iconBg: "#ecfdf5", iconColor: "#059669" },
    { id: "brokers",      label: "Brokers",              hint: `${activeBrokers} active`,        value: brokers.length,    icon: UserCheck, iconBg: "#f0fdfa", iconColor: "#0d9488" },
    { id: "rfs",          label: "Requests for Service", hint: `${publishedRfs} published`,      value: rfsList.length,    icon: FileText,  iconBg: "#eef2ff", iconColor: "#4f46e5" },
    { id: "users",        label: "Platform Users",       hint: `${usersNoRoles} without roles`,  value: authUsers.length,  icon: Users,     iconBg: "#eff6ff", iconColor: "#2563eb" },
    { id: "verification", label: "Verification Queue",   hint: `${verifiedCount} verified · ${rejectedCount} rejected`, value: pendingCount, icon: Briefcase, iconBg: "#fffbeb", iconColor: "#d97706" },
    { id: null,           label: "Service Types",        hint: "Taxonomy catalogue",             value: serviceTypes.length, icon: Layers, iconBg: "#f8fafc", iconColor: "#64748b" },
  ];

  const statusTag = (status: string) => {
    const cls = status === "VERIFIED" || status === "ACTIVE" ? "adm-tag adm-tag--success"
      : status === "REJECTED" ? "adm-tag adm-tag--danger"
      : status === "PUBLISHED" ? "adm-tag adm-tag--blue"
      : "adm-tag adm-tag--warning";
    return <span className={cls}>{status}</span>;
  };

  const renderDetail = () => {
    switch (activeCard) {
      case "markets":
        return markets.length === 0 ? <p className="adm-empty">No markets registered yet.</p> : (
          <table className="adm-table">
            <thead><tr><th>Market</th><th>Region</th><th>District</th><th>Status</th></tr></thead>
            <tbody>
              {markets.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600 }}>{m.market_name}</td>
                  <td>{m.region}</td>
                  <td>{m.district}</td>
                  <td>{statusTag(m.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "brokers":
        return brokers.length === 0 ? <p className="adm-empty">No brokers registered yet.</p> : (
          <table className="adm-table">
            <thead><tr><th>Name</th><th>Type</th><th>Market</th><th>Status</th></tr></thead>
            <tbody>
              {brokers.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.first_name} {b.surname}</td>
                  <td><span className="adm-tag">{b.broker_type}</span></td>
                  <td>{marketMap.get(b.market_id) ?? "—"}</td>
                  <td>{statusTag(b.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "rfs":
        return rfsList.length === 0 ? <p className="adm-empty">No RFS requests on record.</p> : (
          <table className="adm-table">
            <thead><tr><th>Title</th><th>Service Type</th><th>Buyer</th><th>Status</th></tr></thead>
            <tbody>
              {rfsList.map((rfs) => (
                <tr key={rfs.id}>
                  <td style={{ fontWeight: 600 }}>{rfs.title}</td>
                  <td>{serviceTypeMap.get(rfs.service_type_id) ?? "Unknown"}</td>
                  <td style={{ fontFamily: "monospace", color: "#64748b" }}>{rfs.buyer_id.slice(0, 8)}…</td>
                  <td>{statusTag(rfs.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "users":
        return authUsers.length === 0 ? <p className="adm-empty">No users registered.</p> : (
          <table className="adm-table">
            <thead><tr><th>Name</th><th>Email</th><th>Roles</th></tr></thead>
            <tbody>
              {authUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: "#64748b" }}>{u.email}</td>
                  <td>
                    {u.roles.length === 0
                      ? <span className="adm-tag adm-tag--warning">No roles</span>
                      : u.roles.map((r) => <span key={r} className="adm-tag" style={{ marginRight: "0.25rem" }}>{r}</span>)
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "verification":
        return businesses.length === 0 ? <p className="adm-empty">No businesses registered.</p> : (
          <table className="adm-table">
            <thead><tr><th>Business</th><th>Region</th><th>Status</th></tr></thead>
            <tbody>
              {businesses.map((biz) => {
                const status = getVerificationStatus(biz);
                return (
                  <tr key={biz.id}>
                    <td style={{ fontWeight: 600 }}>{biz.name}</td>
                    <td>{biz.verification?.region ?? biz.region ?? "—"}</td>
                    <td>{statusTag(status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  const activeDetail = domains.find((d) => d.id === activeCard);
  const detailLabel = activeDetail ? activeDetail.label : "";

  return (
    <div>
      {/* KPI Strip */}
      <div className="adm-kpi-strip">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`adm-kpi-cell${kpi.highlight ? " adm-kpi-cell--highlight" : ""}`}>
              <span className="adm-kpi-cell__eyebrow">{kpi.label}</span>
              <span className="adm-kpi-cell__value">{kpi.value}</span>
              <span className="adm-kpi-cell__meta">
                <Icon style={{ width: 12, height: 12, display: "inline", marginRight: "0.25rem", verticalAlign: "middle" }} />
                {kpi.meta}
              </span>
            </div>
          );
        })}
      </div>

      {/* Domain Cards */}
      <div className="adm-domain-grid">
        {domains.map((d) => {
          const Icon = d.icon;
          const isStatic = d.id === null;
          const isActive = activeCard === d.id;
          return (
            <button
              key={d.label}
              type="button"
              className={`adm-domain-card${isActive ? " is-active" : ""}${isStatic ? " adm-domain-card--static" : ""}`}
              style={{ cursor: isStatic ? "default" : "pointer" }}
              disabled={isStatic}
              onClick={() => !isStatic && setActiveCard(isActive ? null : d.id)}
            >
              <div className="adm-domain-card__head">
                <div className="adm-domain-card__icon" style={{ background: d.iconBg }}>
                  <Icon style={{ width: 18, height: 18, color: d.iconColor }} />
                </div>
                <div>
                  <div className="adm-domain-card__label">{d.label}</div>
                  <div className="adm-domain-card__hint">{d.hint}</div>
                </div>
                <div className="adm-domain-card__value">{d.value}</div>
              </div>
              {!isStatic && (
                <div className="adm-domain-card__cta">
                  {isActive ? "Hide details" : "View details"}
                  <ChevronRight style={{ width: 12, height: 12, display: "inline", marginLeft: "0.25rem", transform: isActive ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded Detail */}
      {activeCard && (
        <div className="adm-detail-panel">
          <div className="adm-detail-panel__head">
            <h3 className="adm-detail-panel__title">{detailLabel}</h3>
            <button className="adm-detail-close" type="button" onClick={() => setActiveCard(null)}>
              <XCircle style={{ width: 13, height: 13, display: "inline", marginRight: "0.25rem" }} />
              Close
            </button>
          </div>
          <div>{renderDetail()}</div>
        </div>
      )}
    </div>
  );
};