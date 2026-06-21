import { useState, useEffect } from "react";
import { apiRequest } from "../../../api/client";
import { EngagementSession, Business, TaxonomyResponse } from "./types";
import { MessageSquare, CheckCircle, XCircle } from "lucide-react";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED": return { bg: "#dcfce7", text: "#166534" };
      case "REJECTED": return { bg: "#fee2e2", text: "#991b1b" };
      case "CLOSED": return { bg: "#f3e8ff", text: "#6b21a8" };
      case "INITIATED": return { bg: "#eff6ff", text: "#1e40af" };
      default: return { bg: "#f1f5f9", text: "#475569" };
    }
  };

  const renderTable = (engagements: EngagementSession[], isBuyer: boolean) => {
    if (engagements.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "3rem", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
          <MessageSquare style={{ width: "32px", height: "32px", color: "#94a3b8", margin: "0 auto 1rem" }} />
          <p style={{ margin: 0, color: "#64748b" }}>No engagements found in this category.</p>
        </div>
      );
    }

    return (
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr>
            <th style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>RFS</th>
            <th style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>{isBuyer ? "Seller" : "Buyer"}</th>
            <th style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>Started On</th>
            <th style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>Status</th>
            <th style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {engagements.map((session) => {
            const colors = getStatusColor(session.status);
            return (
              <tr key={session.id}>
                <td style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", fontSize: "0.875rem", fontWeight: 500 }}>
                  <button 
                    onClick={() => setSelectedRfsId(session.rfs_id)}
                    style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", textDecoration: "underline", padding: 0, textAlign: "left", fontWeight: 500 }}
                  >
                    {session.rfs_short_id || "RFS-Unknown"}
                  </button>
                </td>
                <td style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", fontSize: "0.875rem" }}>
                  <button 
                    onClick={() => {
                      setSelectedProfileId(isBuyer ? session.seller_id : session.buyer_id);
                      setSelectedProfileStatus(session.status);
                    }}
                    style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", textDecoration: "underline", padding: 0, textAlign: "left" }}
                  >
                    {isBuyer ? (session.seller_name || "Unknown Seller") : (session.buyer_name || "Unknown Buyer")}
                  </button>
                </td>
                <td style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", fontSize: "0.875rem", color: "#475569" }}>
                  {new Date(session.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0" }}>
                  <span style={{ padding: "0.25rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, background: colors.bg, color: colors.text }}>
                    {session.status}
                  </span>
                </td>
                <td style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    {!isBuyer && session.status === "INITIATED" && (
                      <>
                        <button 
                          onClick={() => handleAccept(session.id)}
                          style={{ padding: "0.375rem", background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                          title="Accept Engagement"
                        >
                          <CheckCircle style={{ width: "16px", height: "16px" }} />
                        </button>
                        <button 
                          onClick={() => handleReject(session.id)}
                          style={{ padding: "0.375rem", background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                          title="Reject Engagement"
                        >
                          <XCircle style={{ width: "16px", height: "16px" }} />
                        </button>
                      </>
                    )}
                    {session.status === "ACCEPTED" && (
                      <button 
                        onClick={() => openReportModal(session.id)}
                        style={{ padding: "0.375rem 0.75rem", background: "#f3e8ff", color: "#6b21a8", border: "1px solid #e9d5ff", borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center", fontSize: "0.875rem", fontWeight: 500 }}
                        title="Report Deal Outcome"
                      >
                        <CheckCircle style={{ width: "14px", height: "14px", marginRight: "4px" }} /> Report Deal
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="card" style={{ padding: "2rem", position: "relative" }}>
      <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <MessageSquare style={{ color: "#2563eb" }} /> Active Engagements
      </h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0" }}>
        <button 
          onClick={() => setActiveTab("buyer")}
          style={{ 
            background: "transparent", border: "none", cursor: "pointer", fontSize: "1rem", fontWeight: 500,
            color: activeTab === "buyer" ? "#2563eb" : "#64748b",
            borderBottom: activeTab === "buyer" ? "2px solid #2563eb" : "2px solid transparent",
            paddingBottom: "0.75rem"
          }}>
          Requests I Initiated ({buyerEngagements.length})
        </button>
        <button 
          onClick={() => setActiveTab("seller")}
          style={{ 
            background: "transparent", border: "none", cursor: "pointer", fontSize: "1rem", fontWeight: 500,
            color: activeTab === "seller" ? "#2563eb" : "#64748b",
            borderBottom: activeTab === "seller" ? "2px solid #2563eb" : "2px solid transparent",
            paddingBottom: "0.75rem"
          }}>
          Requests From Buyers ({sellerEngagements.length})
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        {activeTab === "buyer" ? renderTable(buyerEngagements, true) : renderTable(sellerEngagements, false)}
      </div>

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
    </div>
  );
};
