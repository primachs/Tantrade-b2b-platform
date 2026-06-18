import { useState, useEffect } from "react";
import { apiRequest } from "../../../api/client";
import { EngagementSession, Business } from "./types";
import { MessageSquare, CheckCircle, XCircle } from "lucide-react";

type EngagementsPaneProps = {
  token: string;
  myBusiness: Business;
  setNotice: (type: "success" | "error", msg: string) => void;
};

export const EngagementsPane = ({ token, myBusiness, setNotice }: EngagementsPaneProps) => {
  const [loading, setLoading] = useState(false);
  const [buyerEngagements, setBuyerEngagements] = useState<EngagementSession[]>([]);
  const [sellerEngagements, setSellerEngagements] = useState<EngagementSession[]>([]);
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");

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
      setNotice("success", "Engagement accepted.");
      loadEngagements();
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
      setNotice("success", "Engagement rejected.");
      loadEngagements();
    } catch (err) {
      setNotice("error", "Failed to reject engagement.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED": return { bg: "#dcfce7", text: "#166534" };
      case "REJECTED": return { bg: "#fee2e2", text: "#991b1b" };
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
            <th style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>RFS ID</th>
            <th style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>{isBuyer ? "Seller" : "Buyer"} ID</th>
            <th style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>Started On</th>
            <th style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>Status</th>
            {!isBuyer && <th style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "right" }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {engagements.map((session) => {
            const colors = getStatusColor(session.status);
            return (
              <tr key={session.id}>
                <td style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", fontFamily: "monospace", fontSize: "0.875rem" }}>{session.rfs_id}</td>
                <td style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", fontFamily: "monospace", fontSize: "0.875rem" }}>{isBuyer ? session.seller_id : session.buyer_id}</td>
                <td style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", fontSize: "0.875rem", color: "#475569" }}>{new Date(session.created_at).toLocaleDateString()}</td>
                <td style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0" }}>
                  <span style={{ padding: "0.25rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, background: colors.bg, color: colors.text }}>
                    {session.status}
                  </span>
                </td>
                {!isBuyer && (
                  <td style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>
                    {session.status === "INITIATED" && (
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
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
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="card" style={{ padding: "2rem" }}>
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
    </div>
  );
};
