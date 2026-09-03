import { useState, useEffect } from "react";
import { apiRequest } from "../../../api/client";
import { EngagementSession, Business, TaxonomyResponse } from "./types";
import { MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { ChatModal } from "./ChatModal";

type EngagementsPaneProps = {
  token: string;
  myBusiness: Business;
  setNotice: (type: "success" | "error", msg: string) => void;
  taxonomy: TaxonomyResponse | null;
};

import { BusinessProfileModal } from "./BusinessProfileModal";
import { RfsInspectModal } from "./RfsInspectModal";

export const EngagementsPane = ({ token, myBusiness, setNotice, taxonomy }: EngagementsPaneProps) => {
  const [loading, setLoading] = useState(false);
  const [buyerEngagements, setBuyerEngagements] = useState<EngagementSession[]>([]);
  const [sellerEngagements, setSellerEngagements] = useState<EngagementSession[]>([]);
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [reportData, setReportData] = useState({
    outcome: "DEAL_CONFIRMED",
    reason: "",
    notes: ""
  });
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedProfileStatus, setSelectedProfileStatus] = useState<string>("");
  const [selectedRfsId, setSelectedRfsId] = useState<string | null>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [chatOtherPartyName, setChatOtherPartyName] = useState<string>("");
  const [chatDisabled, setChatDisabled] = useState(false);

  const openChat = (sessionId: string, otherPartyName: string, status: string) => {
    setChatSessionId(sessionId);
    setChatOtherPartyName(otherPartyName || "Conversation");
    setChatDisabled(status === "REJECTED");
  };

  const loadEngagements = async () => {
    setLoading(true);
    try {
      const [buyer, seller] = await Promise.all([
        apiRequest<EngagementSession[]>(`/engagement-sessions?buyer_id=${myBusiness.id}`, { token }),
        apiRequest<EngagementSession[]>(`/engagement-sessions?seller_id=${myBusiness.id}`, { token })
      ]);
      setBuyerEngagements(Array.isArray(buyer) ? buyer : []);
      setSellerEngagements(Array.isArray(seller) ? seller : []);
    } catch (err) {
      setNotice("error", "Failed to load engagements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEngagements();
  }, [myBusiness.id]);

  const handleAccept = async (sessionId: string) => {
    setLoading(true);
    try {
      await apiRequest(`/engagement-sessions/${sessionId}/accept`, { method: "POST", token });
      setSellerEngagements(prev => prev.map(s => s.id === sessionId ? { ...s, status: "ACCEPTED" } : s));
      setNotice("success", "Engagement accepted.");
    } catch (err) {
      setNotice("error", "Failed to accept engagement.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (sessionId: string) => {
    setLoading(true);
    try {
      await apiRequest(`/engagement-sessions/${sessionId}/reject`, { method: "POST", token });
      setSellerEngagements(prev => prev.map(s => s.id === sessionId ? { ...s, status: "REJECTED" } : s));
      setNotice("success", "Engagement rejected.");
    } catch (err) {
      setNotice("error", "Failed to reject engagement.");
    } finally {
      setLoading(false);
    }
  };

  const openReportModal = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setReportData({ outcome: "DEAL_CONFIRMED", reason: "", notes: "" });
    setReportModalOpen(true);
  };

  const submitReport = async () => {
    if (!selectedSessionId) return;
    
    setLoading(true);
    try {
      await apiRequest(`/engagement-sessions/${selectedSessionId}/outcomes`, { 
        method: "POST", 
        token, 
        body: { 
          reported_by: activeTab === "buyer" ? "BUYER" : "SELLER",
          outcome: reportData.outcome,
          reason: reportData.reason || null,
          notes: reportData.notes || null
        } 
      });
      await apiRequest(`/engagement-sessions/${selectedSessionId}/close`, { method: "POST", token });
      
      if (activeTab === "buyer") {
        setBuyerEngagements(prev => prev.map(s => s.id === selectedSessionId ? { ...s, status: "CLOSED" } : s));
      } else {
        setSellerEngagements(prev => prev.map(s => s.id === selectedSessionId ? { ...s, status: "CLOSED" } : s));
      }
      setNotice("success", "Deal reported and engagement closed.");
      setReportModalOpen(false);
    } catch (err) {
      setNotice("error", "Failed to report deal.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "#00835e";
      case "REJECTED": return "#dc2626";
      case "CLOSED": return "#94a3b8";
      case "INITIATED": return "#3c5eab";
      default: return "#94a3b8";
    }
  };

  const getInitial = (name: string) => (name?.trim()?.[0] ?? "?").toUpperCase();

  const renderList = (engagements: EngagementSession[], isBuyer: boolean) => {
    if (engagements.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "3.5rem 1.5rem", color: "#86868b" }}>
          <MessageSquare style={{ width: "28px", height: "28px", color: "#d2d2d7", margin: "0 auto 0.75rem" }} />
          <p style={{ margin: 0, fontSize: "0.9rem" }}>No engagements found in this category.</p>
        </div>
      );
    }

    return (
      <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {engagements.map((session, index) => {
          const otherPartyName = isBuyer ? (session.seller_name || "Unknown Seller") : (session.buyer_name || "Unknown Buyer");
          return (
            <div
              key={session.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "1.1rem 1.5rem",
                gap: "1rem",
                borderBottom: index === engagements.length - 1 ? "none" : "1px solid #f2f2f2",
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
                <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>{getInitial(otherPartyName)}</span>
              </div>

              <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                <button
                  onClick={() => {
                    setSelectedProfileId(isBuyer ? session.seller_id : session.buyer_id);
                    setSelectedProfileStatus(session.status);
                  }}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "block", fontWeight: 600, color: "#1d1d1f", fontSize: "0.98rem", marginBottom: "0.1rem", textAlign: "left" }}
                >
                  {otherPartyName}
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setSelectedRfsId(session.rfs_id)}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#3c5eab", fontSize: "0.82rem", fontWeight: 500 }}
                  >
                    {session.rfs_short_id || "RFS-Unknown"}
                  </button>
                  <span style={{ color: "#d2d2d7" }}>·</span>
                  <span style={{ color: "#86868b", fontSize: "0.82rem" }}>{new Date(session.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.75rem", background: "#f0f0f2", borderRadius: "999px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: getStatusDotColor(session.status) }}></span>
                <span style={{ fontSize: "0.8rem", color: "#6e6e73", fontWeight: 500 }}>{session.status.charAt(0) + session.status.slice(1).toLowerCase()}</span>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => openChat(session.id, otherPartyName, session.status)}
                  style={{ padding: "0.55rem 1.2rem", borderRadius: "20px", border: "none", background: "#3c5eab", color: "#fff", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <MessageSquare style={{ width: "14px", height: "14px" }} /> Message
                </button>
                {!isBuyer && session.status === "INITIATED" && (
                  <>
                    <button
                      onClick={() => handleAccept(session.id)}
                      title="Accept Engagement"
                      style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #d2d2d7", background: "#fff", color: "#00835e", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <CheckCircle style={{ width: "16px", height: "16px" }} />
                    </button>
                    <button
                      onClick={() => handleReject(session.id)}
                      title="Reject Engagement"
                      style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #d2d2d7", background: "#fff", color: "#dc2626", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <XCircle style={{ width: "16px", height: "16px" }} />
                    </button>
                  </>
                )}
                {session.status === "ACCEPTED" && (
                  <button
                    onClick={() => openReportModal(session.id)}
                    style={{ padding: "0.55rem 1.1rem", borderRadius: "20px", border: "1px solid #3c5eab", background: "#fff", color: "#3c5eab", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                  >
                    Report Deal
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ position: "relative" }}>
      <h1 style={{ fontSize: "1.9rem", fontWeight: 700, color: "#1d1d1f", margin: "0 0 0.35rem", letterSpacing: "-0.025em" }}>Engagements</h1>
      <p style={{ color: "#86868b", fontSize: "0.95rem", margin: "0 0 2rem" }}>Track requests you've received and sent.</p>

      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.75rem", background: "#f0f0f2", borderRadius: "12px", padding: "0.3rem", width: "fit-content" }}>
        <button
          onClick={() => setActiveTab("buyer")}
          style={{
            padding: "0.5rem 1.1rem",
            borderRadius: "9px",
            border: "none",
            background: activeTab === "buyer" ? "#fff" : "transparent",
            color: activeTab === "buyer" ? "#1d1d1f" : "#6e6e73",
            fontWeight: activeTab === "buyer" ? 600 : 500,
            fontSize: "0.88rem",
            cursor: "pointer",
            boxShadow: activeTab === "buyer" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          }}
        >
          Requests I Initiated {buyerEngagements.length > 0 && <span style={{ color: "#3c5eab" }}>{buyerEngagements.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab("seller")}
          style={{
            padding: "0.5rem 1.1rem",
            borderRadius: "9px",
            border: "none",
            background: activeTab === "seller" ? "#fff" : "transparent",
            color: activeTab === "seller" ? "#1d1d1f" : "#6e6e73",
            fontWeight: activeTab === "seller" ? 600 : 500,
            fontSize: "0.88rem",
            cursor: "pointer",
            boxShadow: activeTab === "seller" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          }}
        >
          Requests From Buyers {sellerEngagements.length > 0 && <span style={{ color: "#3c5eab" }}>{sellerEngagements.length}</span>}
        </button>
      </div>

      {activeTab === "buyer" ? renderList(buyerEngagements, true) : renderList(sellerEngagements, false)}

      {reportModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "500px", padding: "2rem" }}>
            <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem" }}>Report Deal Outcome</h3>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Outcome</label>
              <select 
                value={reportData.outcome}
                onChange={(e) => setReportData({ ...reportData, outcome: e.target.value, reason: "" })}
                className="input-field"
              >
                <option value="DEAL_CONFIRMED">Deal Confirmed (Successful)</option>
                <option value="NO_AGREEMENT">No Agreement (Failed)</option>
                <option value="OUT_OF_SCOPE">Out of Scope</option>
                <option value="NO_RESPONSE">No Response (Unresponsive)</option>
                <option value="MOVED_OFF_PLATFORM">Went with Competitor / Moved off Platform</option>
                <option value="DISPUTED">Disputed</option>
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Specific Reason (Optional)</label>
              <input 
                type="text"
                value={reportData.reason}
                onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                className="input-field"
                placeholder="e.g. Budget too low, great match"
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Optional Notes</label>
              <textarea 
                value={reportData.notes}
                onChange={(e) => setReportData({ ...reportData, notes: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Any additional feedback?"
              ></textarea>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setReportModalOpen(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={submitReport}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BusinessProfileModal 
        businessId={selectedProfileId || ""}
        token={token}
        isOpen={!!selectedProfileId}
        onClose={() => setSelectedProfileId(null)}
        canViewContact={selectedProfileStatus === "ACCEPTED" || selectedProfileStatus === "CLOSED"}
        taxonomy={taxonomy}
      />

      <RfsInspectModal 
        rfsId={selectedRfsId || ""}
        token={token}
        isOpen={!!selectedRfsId}
        onClose={() => setSelectedRfsId(null)}
        taxonomy={taxonomy}
      />

      <ChatModal
        token={token}
        sessionId={chatSessionId || ""}
        myBusinessId={myBusiness.id}
        otherPartyName={chatOtherPartyName}
        isOpen={!!chatSessionId}
        onClose={() => setChatSessionId(null)}
        disabled={chatDisabled}
      />
    </div>
  );
};