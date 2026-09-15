import { useEffect, useState } from "react";
import { apiRequest } from "../../../api/client";
import { Rfs, MatchShortlist, Business, EngagementSession } from "./types";
import { Users } from "lucide-react";
import { BusinessProfileModal } from "./BusinessProfileModal";

type MatchesPaneProps = {
  token: string;
  rfsList: Rfs[];
  myBusiness: Business;
  setNotice: (type: "success" | "error", msg: string) => void;
  onNavigate?: (pane: string) => void;
};

type MatchRow = {
  rfsId: string;
  rfsTitle: string;
  buyerId: string;
  buyerName: string;
  score: number | null;
};

const getInitial = (name: string) => (name?.trim()?.[0] ?? "?").toUpperCase();

export const MatchesPane = ({ token, rfsList, myBusiness, setNotice, onNavigate }: MatchesPaneProps) => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [engagedRfsIds, setEngagedRfsIds] = useState<Set<string>>(new Set());
  const [engaging, setEngaging] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // RFS created by OTHER businesses where this business is a genuine
  // shortlisted seller candidate (the backend already restricts rfsList to
  // this exact set for non-owned records).
  const matchedToRfs = rfsList.filter((rfs) => rfs.buyer_id !== myBusiness.id);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [shortlists, sellerEngagements] = await Promise.all([
          Promise.all(
            matchedToRfs.map(async (rfs) => {
              try {
                const shortlist = await apiRequest<MatchShortlist>(`/rfs/${rfs.id}/shortlist`, { token });
                const mine = shortlist.candidates?.find((c) => c.seller_id === myBusiness.id);
                return {
                  rfsId: rfs.id,
                  rfsTitle: rfs.title,
                  buyerId: rfs.buyer_id,
                  buyerName: rfs.buyer_name || "Unknown business",
                  score: mine ? mine.score : null,
                } as MatchRow;
              } catch {
                return {
                  rfsId: rfs.id,
                  rfsTitle: rfs.title,
                  buyerId: rfs.buyer_id,
                  buyerName: rfs.buyer_name || "Unknown business",
                  score: null,
                } as MatchRow;
              }
            })
          ),
          apiRequest<EngagementSession[]>(`/engagement-sessions?seller_id=${myBusiness.id}`, { token }),
        ]);

        if (cancelled) return;
        setMatches(shortlists);
        setEngagedRfsIds(new Set(Array.isArray(sellerEngagements) ? sellerEngagements.map((s) => s.rfs_id) : []));
      } catch (err) {
        if (!cancelled) setNotice("error", "Failed to load matches.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rfsList, myBusiness.id]);

  const handleEngage = async (row: MatchRow) => {
    setEngaging(row.rfsId);
    try {
      await apiRequest("/engagement-sessions", {
        method: "POST",
        token,
        body: { rfs_id: row.rfsId, buyer_id: row.buyerId, seller_id: myBusiness.id },
      });
      setNotice("success", "Engagement session created.");
      setEngagedRfsIds((prev) => new Set(prev).add(row.rfsId));
      if (onNavigate) onNavigate("engagements");
    } catch (err) {
      setNotice("error", "Failed to create engagement session.");
    } finally {
      setEngaging(null);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.9rem", fontWeight: 700, color: "#1d1d1f", margin: "0 0 0.35rem", letterSpacing: "-0.025em" }}>Matches</h1>
      <p style={{ color: "#86868b", fontSize: "0.95rem", margin: "0 0 1.5rem" }}>Businesses you've been matched with across the marketplace.</p>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3.5rem 1.5rem", color: "#86868b", background: "#fff", borderRadius: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>Loading matches...</p>
        </div>
      ) : matches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3.5rem 1.5rem", color: "#86868b", background: "#fff", borderRadius: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
          <Users style={{ width: "28px", height: "28px", color: "#d2d2d7", margin: "0 auto 0.75rem" }} />
          <p style={{ margin: 0, fontSize: "0.9rem" }}>No matches yet. Register the right capabilities to start appearing on buyers' shortlists.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          {matches.map((row, index) => {
            const isEngaged = engagedRfsIds.has(row.rfsId);
            return (
              <div
                key={row.rfsId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "1.15rem 1.5rem",
                  gap: "1rem",
                  borderBottom: index === matches.length - 1 ? "none" : "1px solid #f2f2f2",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3c5eab, #00835e)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>{getInitial(row.buyerName)}</span>
                </div>

                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  <button
                    onClick={() => setSelectedProfileId(row.buyerId)}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "block", fontWeight: 600, color: "#1d1d1f", fontSize: "0.98rem", marginBottom: "0.15rem", textAlign: "left" }}
                  >
                    {row.buyerName}
                  </button>
                  <span style={{ color: "#86868b", fontSize: "0.82rem" }}>
                    Matched via <span style={{ color: "#3c5eab", fontWeight: 500 }}>{row.rfsTitle}</span>
                  </span>
                </div>

                {row.score !== null && (
                  <span style={{ background: "#fef3c7", color: "#92400e", padding: "0.3rem 0.7rem", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 600 }}>
                    {Math.round(row.score * 100)}% match
                  </span>
                )}

                {isEngaged ? (
                  <span style={{ background: "#e8f5ee", color: "#00835e", padding: "0.3rem 0.7rem", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 600 }}>Engaged ✓</span>
                ) : (
                  <button
                    onClick={() => handleEngage(row)}
                    disabled={engaging === row.rfsId}
                    style={{ padding: "0.5rem 1.1rem", borderRadius: "20px", border: "none", background: "#3c5eab", color: "#fff", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}
                  >
                    {engaging === row.rfsId ? "..." : "Engage"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <BusinessProfileModal
        businessId={selectedProfileId || ""}
        token={token}
        isOpen={!!selectedProfileId}
        onClose={() => setSelectedProfileId(null)}
        canViewContact={false}
        taxonomy={null}
      />
    </div>
  );
};