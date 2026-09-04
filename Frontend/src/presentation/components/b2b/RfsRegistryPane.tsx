import { useState } from "react";
import { apiRequest, ApiError } from "../../../api/client";
import { Rfs, MatchShortlist, TaxonomyResponse, Business } from "./types";
import { Search, Briefcase, ChevronRight, Calendar, CheckCircle2, Clock } from "lucide-react";
import { BusinessProfileModal } from "./BusinessProfileModal";

type RfsRegistryPaneProps = {
  token: string;
  rfsList: Rfs[];
  myBusiness: Business;
  taxonomy: TaxonomyResponse | null;
  onRefresh: () => void;
  setNotice: (type: "success" | "error", msg: string) => void;
  onEdit: (rfs: Rfs) => void;
  onNavigate?: (pane: string) => void;
};

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return null;
  return `TSH${value.toLocaleString("en-US")}/=`;
};

const formatBudgetRange = (min: number | null | undefined, max: number | null | undefined) => {
  const minStr = formatCurrency(min);
  const maxStr = formatCurrency(max);
  if (minStr && maxStr) return `${minStr} to ${maxStr}`;
  if (minStr) return `From ${minStr}`;
  if (maxStr) return `Up to ${maxStr}`;
  return "Not specified";
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatDurationWeeks = (start: string | null | undefined, end: string | null | undefined) => {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;
  const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return null;
  const weeks = Math.round(days / 7);
  return weeks <= 0 ? "less than a week" : `${weeks} week${weeks === 1 ? "" : "s"}`;
};

const toTitleCase = (value: string | null | undefined) => {
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

export const RfsRegistryPane = ({ token, rfsList, myBusiness, taxonomy, onRefresh, setNotice, onEdit, onNavigate }: RfsRegistryPaneProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedRfs, setSelectedRfs] = useState<Rfs | null>(null);
  const [shortlist, setShortlist] = useState<MatchShortlist | null>(null);
  const [engagedSellers, setEngagedSellers] = useState<Set<string>>(new Set());
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const serviceTypes = Array.isArray(taxonomy?.service_types) ? taxonomy.service_types : [];
  const serviceTypeMap = new Map(serviceTypes.map(t => [t.id, t.name]));

  // Is the current user the buyer for this RFS?
  const isMyRfs = (rfs: Rfs) => rfs.buyer_id === myBusiness.id;

  const handleOpenMatch = async (rfsId: string, status: string) => {
    setLoading(true);
    try {
      if (status === "DRAFT") {
        await apiRequest(`/rfs/${rfsId}/open`, { method: "POST", token });
      }
      await apiRequest(`/rfs/${rfsId}/match`, { method: "POST", token });
      setNotice("success", "Matching shortlist generated.");
      onRefresh();
      await handleInspectRfs(rfsId);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.firstFieldError() ?? err.message : err instanceof Error ? err.message : "Matching failed.";
      setNotice("error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectRfs = async (rfsId: string) => {
    setLoading(true);
    try {
      const details = await apiRequest<Rfs>(`/rfs/${rfsId}`, { token });
      setSelectedRfs(details);
      try {
        const latestShortlist = await apiRequest<MatchShortlist>(`/rfs/${rfsId}/shortlist`, { token });
        setShortlist(latestShortlist);
        setEngagedSellers(new Set()); // Reset on new RFS
      } catch (e) {
        setShortlist(null); // No shortlist exists yet
      }
    } catch (err) {
      setNotice("error", "Failed to load RFS details.");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateEngagement = async (sellerId: string) => {
    if (!shortlist?.rfs_id) return;
    setLoading(true);
    try {
      await apiRequest("/engagement-sessions", {
        method: "POST",
        token,
        body: {
          rfs_id: shortlist.rfs_id,
          buyer_id: myBusiness.id,
          seller_id: sellerId,
        },
      });
      setNotice("success", "Engagement session created.");
      setEngagedSellers(prev => new Set(prev).add(sellerId));
      onRefresh();
      if (onNavigate) {
        onNavigate("engagements");
      }
    } catch (err) {
      setNotice("error", "Failed to create engagement session.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusMeta = (status: string) => {
    switch (status) {
      case "OPEN": return { label: "Open", color: "#00835e", bg: "#e8f5ee", icon: "check" as const };
      case "MATCHED": return { label: "Matched", color: "#92400e", bg: "#fef3c7", icon: "check" as const };
      case "DRAFT": return { label: "Draft", color: "#6e6e73", bg: "#f0f0f2", icon: "clock" as const };
      case "CLOSED": return { label: "Closed", color: "#6e6e73", bg: "#f0f0f2", icon: "check" as const };
      default: return { label: toTitleCase(status), color: "#6e6e73", bg: "#f0f0f2", icon: "clock" as const };
    }
  };

  const StatusIcon = ({ status, size = 13 }: { status: string; size?: number }) => {
    const meta = getStatusMeta(status);
    if (meta.icon === "check") {
      return <CheckCircle2 style={{ width: size, height: size, color: meta.color, flexShrink: 0 }} />;
    }
    return <Clock style={{ width: size, height: size, color: meta.color, flexShrink: 0 }} />;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.9rem", fontWeight: 700, color: "#1d1d1f", margin: "0 0 0.35rem", letterSpacing: "-0.025em" }}>RFS Registry</h1>
        <p style={{ color: "#86868b", fontSize: "0.95rem", margin: "0 0 1.5rem" }}>Browse requests you've created and ones you're matched to.</p>

        {rfsList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3.5rem 1.5rem", color: "#86868b", background: "#fff", borderRadius: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
            <Briefcase style={{ width: "28px", height: "28px", color: "#d2d2d7", margin: "0 auto 0.75rem" }} />
            <p style={{ margin: 0, fontSize: "0.9rem" }}>No requests found in the registry.</p>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            {rfsList.map((rfs, index) => {
              const isMine = isMyRfs(rfs);
              const statusMeta = getStatusMeta(rfs.status);
              const isSelected = selectedRfs?.id === rfs.id;
              const canRunMatch = isMine && (rfs.status === "DRAFT" || rfs.status === "OPEN" || rfs.status === "MATCHED");
              const matchLabel = rfs.status === "DRAFT" ? "Publish" : rfs.status === "MATCHED" ? "Re-match" : "Run Match";

              return (
                <div
                  key={rfs.id}
                  onClick={() => handleInspectRfs(rfs.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "1.15rem 1.5rem",
                    gap: "1rem",
                    borderBottom: index === rfsList.length - 1 ? "none" : "1px solid #f2f2f2",
                    background: isSelected ? "#fafbfc" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "#1d1d1f", fontSize: "0.98rem", marginBottom: "0.2rem" }}>{rfs.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <StatusIcon status={rfs.status} />
                      <span style={{ color: "#86868b", fontSize: "0.82rem" }}>
                        {statusMeta.label} · {serviceTypeMap.get(rfs.service_type_id) ?? rfs.service_type_id}
                      </span>
                    </div>
                  </div>

                  {canRunMatch ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenMatch(rfs.id, rfs.status); }}
                      disabled={loading}
                      style={{ padding: "0.5rem 1.1rem", borderRadius: "20px", border: "none", background: "#3c5eab", color: "#fff", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", flexShrink: 0 }}
                      title={rfs.status === "DRAFT" ? "Open this RFS to the market and run matching" : rfs.status === "MATCHED" ? "Re-run matching to pick up newly added sellers" : "Run matching engine"}
                    >
                      {loading ? "..." : matchLabel}
                    </button>
                  ) : (
                    <ChevronRight style={{ width: "16px", height: "16px", color: "#c7c7cc", flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedRfs && (
        <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)", padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <span style={{ display: "block", fontSize: "0.72rem", color: "#86868b", marginBottom: "0.2rem" }}>Title</span>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.01em" }}>{selectedRfs.title}</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.7rem", background: getStatusMeta(selectedRfs.status).bg, borderRadius: "999px" }}>
                <StatusIcon status={selectedRfs.status} size={12} />
                <span style={{ fontSize: "0.78rem", color: getStatusMeta(selectedRfs.status).color, fontWeight: 600 }}>{getStatusMeta(selectedRfs.status).label}</span>
              </div>
              {isMyRfs(selectedRfs) && selectedRfs.status === "DRAFT" && (
                <button
                  onClick={() => onEdit(selectedRfs)}
                  style={{ padding: "0.4rem 1rem", borderRadius: "20px", border: "1px solid #d2d2d7", background: "#fff", color: "#1d1d1f", fontWeight: 500, fontSize: "0.8rem", cursor: "pointer" }}
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <span style={{ display: "block", fontSize: "0.72rem", color: "#86868b", marginBottom: "0.2rem" }}>Description</span>
            <p style={{ color: "#1d1d1f", lineHeight: 1.6, margin: 0, fontSize: "0.92rem" }}>{selectedRfs.description || "No description provided."}</p>
          </div>

          <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.75rem" }}>Project</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
            <div>
              <span style={{ display: "block", fontSize: "0.72rem", color: "#86868b", marginBottom: "0.2rem" }}>Size</span>
              <span style={{ fontWeight: 600, color: "#1d1d1f", fontSize: "0.9rem" }}>{toTitleCase(selectedRfs.project_size)}</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.72rem", color: "#86868b", marginBottom: "0.2rem" }}>Expertise Level</span>
              <span style={{ fontWeight: 600, color: "#1d1d1f", fontSize: "0.9rem" }}>{toTitleCase(selectedRfs.expertise_level)}</span>
            </div>
          </div>

          <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.75rem" }}>Budget &amp; Location</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
            <div>
              <span style={{ display: "block", fontSize: "0.72rem", color: "#86868b", marginBottom: "0.2rem" }}>Budget</span>
              <span style={{ fontWeight: 600, color: "#1d1d1f", fontSize: "0.9rem" }}>{formatBudgetRange(selectedRfs.constraint?.min_budget, selectedRfs.constraint?.max_budget)}</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.72rem", color: "#86868b", marginBottom: "0.2rem" }}>Location</span>
              <span style={{ fontWeight: 600, color: "#1d1d1f", fontSize: "0.9rem" }}>
                {selectedRfs.constraint?.region || selectedRfs.constraint?.district
                  ? [selectedRfs.constraint?.region, selectedRfs.constraint?.district].filter(Boolean).join(", ")
                  : "Not specified"}
              </span>
            </div>
          </div>

          {(selectedRfs.constraint?.start_date || selectedRfs.constraint?.deadline) && (
            <>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.75rem" }}>Timeline</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#fafbfc", padding: "0.9rem 1.1rem", borderRadius: "10px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                <Calendar style={{ width: "16px", height: "16px", color: "#3c5eab", flexShrink: 0 }} />
                <span style={{ fontSize: "0.88rem", color: "#1d1d1f", fontWeight: 500 }}>
                  {formatDate(selectedRfs.constraint?.start_date) || "No start date"}
                </span>
                <ChevronRight style={{ width: "14px", height: "14px", color: "#c7c7cc" }} />
                <span style={{ fontSize: "0.88rem", color: "#1d1d1f", fontWeight: 500 }}>
                  {formatDate(selectedRfs.constraint?.deadline) || "No deadline"}
                </span>
                {formatDurationWeeks(selectedRfs.constraint?.start_date, selectedRfs.constraint?.deadline) && (
                  <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "#86868b" }}>
                    {formatDurationWeeks(selectedRfs.constraint?.start_date, selectedRfs.constraint?.deadline)}
                  </span>
                )}
              </div>
            </>
          )}

          {isMyRfs(selectedRfs) && shortlist && (
            <div style={{ borderTop: "1px solid #f2f2f2", paddingTop: "1.5rem" }}>
              <h4 style={{ margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem", fontWeight: 700, color: "#1d1d1f" }}><Search style={{ width: "16px", height: "16px", color: "#00835e" }} /> Matching Shortlist</h4>
              
              {(!shortlist.candidates || shortlist.candidates.length === 0) ? (
                <p style={{ color: "#86868b", background: "#fafbfc", padding: "1rem", borderRadius: "10px", fontSize: "0.88rem", margin: 0 }}>No matching sellers found for these criteria.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {shortlist.candidates.map(candidate => (
                    <div key={candidate.seller_id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 1rem", background: "#fafbfc", borderRadius: "10px" }}>
                      <span style={{ fontWeight: 700, color: "#1d1d1f", fontSize: "0.85rem", width: "28px" }}>#{candidate.rank}</span>
                      <button
                        onClick={() => setSelectedProfileId(candidate.seller_id)}
                        style={{ background: "none", border: "none", color: "#3c5eab", cursor: "pointer", padding: 0, textAlign: "left", fontSize: "0.88rem", fontWeight: 500, flex: 1 }}
                      >
                        {candidate.seller_name || <span style={{ fontFamily: "monospace" }}>{candidate.seller_id}</span>}
                      </button>
                      <span style={{ background: "#e8f5ee", color: "#00835e", padding: "0.25rem 0.6rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 700 }}>{Math.round(candidate.score * 100)}%</span>
                      <button
                        onClick={() => handleInitiateEngagement(candidate.seller_id)}
                        disabled={engagedSellers.has(candidate.seller_id) || loading}
                        style={{
                          padding: "0.45rem 1rem",
                          borderRadius: "20px",
                          background: engagedSellers.has(candidate.seller_id) ? "#f0f0f2" : "#00835e",
                          color: engagedSellers.has(candidate.seller_id) ? "#6e6e73" : "#fff",
                          border: "none",
                          cursor: engagedSellers.has(candidate.seller_id) ? "default" : "pointer",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                        }}
                      >
                        {engagedSellers.has(candidate.seller_id) ? "Engaged ✓" : "Engage"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <BusinessProfileModal 
        businessId={selectedProfileId || ""}
        token={token}
        isOpen={!!selectedProfileId}
        onClose={() => setSelectedProfileId(null)}
        canViewContact={false}
        taxonomy={taxonomy}
      />
    </div>
  );
};