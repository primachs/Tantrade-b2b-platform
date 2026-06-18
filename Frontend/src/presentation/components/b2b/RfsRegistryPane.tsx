import { useState } from "react";
import { apiRequest } from "../../../api/client";
import { Rfs, MatchShortlist, TaxonomyResponse, Business } from "./types";
import { Search, Eye, PlayCircle, Briefcase } from "lucide-react";

type RfsRegistryPaneProps = {
  token: string;
  rfsList: Rfs[];
  myBusiness: Business;
  taxonomy: TaxonomyResponse | null;
  onRefresh: () => void;
  setNotice: (type: "success" | "error", msg: string) => void;
};

export const RfsRegistryPane = ({ token, rfsList, myBusiness, taxonomy, onRefresh, setNotice }: RfsRegistryPaneProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedRfs, setSelectedRfs] = useState<Rfs | null>(null);
  const [shortlist, setShortlist] = useState<MatchShortlist | null>(null);

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
      const latest = await apiRequest<MatchShortlist>(`/rfs/${rfsId}/shortlist`, { token });
      setShortlist(latest);
      setNotice("success", "Matching shortlist generated.");
      onRefresh();
    } catch (err) {
      setNotice("error", "Matching failed.");
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
      onRefresh();
    } catch (err) {
      setNotice("error", "Failed to create engagement session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="card" style={{ padding: "1.5rem" }}>
        <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem", color: "#0f172a" }}>RFS Registry</h2>
        
        {rfsList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
            <Briefcase style={{ width: "32px", height: "32px", color: "#94a3b8", margin: "0 auto 1rem" }} />
            <p style={{ margin: 0, color: "#64748b" }}>No requests found in the registry.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr>
                  <th style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>Title</th>
                  <th style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>Category</th>
                  <th style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase" }}>Role</th>
                  <th style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rfsList.map((rfs) => {
                  const isMine = isMyRfs(rfs);
                  return (
                    <tr key={rfs.id} style={{ background: selectedRfs?.id === rfs.id ? "#f1f5f9" : "transparent" }}>
                      <td style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", fontWeight: 500 }}>{rfs.title}</td>
                      <td style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", fontSize: "0.875rem", color: "#475569" }}>{serviceTypeMap.get(rfs.service_type_id) ?? rfs.service_type_id}</td>
                      <td style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ 
                          padding: "0.25rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500,
                          background: rfs.status === "OPEN" ? "#dcfce7" : rfs.status === "MATCHED" ? "#fef3c7" : "#f1f5f9",
                          color: rfs.status === "OPEN" ? "#166534" : rfs.status === "MATCHED" ? "#92400e" : "#475569"
                        }}>
                          {rfs.status}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0" }}>
                        {isMine ? (
                          <span style={{ color: "#2563eb", fontSize: "0.875rem", fontWeight: 500 }}>Buyer</span>
                        ) : (
                          <span style={{ color: "#10b981", fontSize: "0.875rem", fontWeight: 500 }}>Seller Candidate</span>
                        )}
                      </td>
                      <td style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button 
                            onClick={() => handleInspectRfs(rfs.id)}
                            style={{ padding: "0.375rem 0.75rem", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.875rem" }}
                          >
                            <Eye style={{ width: "14px", height: "14px" }} /> Inspect
                          </button>
                          
                          {isMine && (rfs.status === "DRAFT" || rfs.status === "OPEN") && (
                            <button 
                              onClick={() => handleOpenMatch(rfs.id, rfs.status)}
                              disabled={loading}
                              style={{ padding: "0.375rem 0.75rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.875rem" }}
                            >
                              <PlayCircle style={{ width: "14px", height: "14px" }} /> {loading ? "..." : "Run Match"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRfs && (
        <div className="card" style={{ padding: "1.5rem", borderTop: "4px solid #2563eb" }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem" }}>Details: {selectedRfs.title}</h3>
          <p style={{ color: "#475569", lineHeight: 1.6, margin: "0 0 1.5rem 0" }}>{selectedRfs.description}</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", background: "#f8fafc", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
            <div><span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Project Size</span><span style={{ fontWeight: 500 }}>{selectedRfs.project_size}</span></div>
            <div><span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Expertise</span><span style={{ fontWeight: 500 }}>{selectedRfs.expertise_level}</span></div>
            <div><span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Budget</span><span style={{ fontWeight: 500 }}>{selectedRfs.constraint?.min_budget} - {selectedRfs.constraint?.max_budget}</span></div>
            <div><span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Location</span><span style={{ fontWeight: 500 }}>{selectedRfs.constraint?.region}, {selectedRfs.constraint?.district}</span></div>
          </div>

          {isMyRfs(selectedRfs) && shortlist && (
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem" }}>
              <h4 style={{ margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}><Search style={{ width: "18px", height: "18px", color: "#10b981" }} /> Matching Shortlist</h4>
              
              {shortlist.candidates.length === 0 ? (
                <p style={{ color: "#64748b", background: "#f8fafc", padding: "1rem", borderRadius: "6px" }}>No matching sellers found for these criteria.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "0.5rem", borderBottom: "1px solid #e2e8f0" }}>Rank</th>
                      <th style={{ padding: "0.5rem", borderBottom: "1px solid #e2e8f0" }}>Seller ID</th>
                      <th style={{ padding: "0.5rem", borderBottom: "1px solid #e2e8f0" }}>Score</th>
                      <th style={{ padding: "0.5rem", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortlist.candidates.map(candidate => (
                      <tr key={candidate.seller_id}>
                        <td style={{ padding: "0.75rem 0.5rem", borderBottom: "1px solid #e2e8f0", fontWeight: 600, color: "#0f172a" }}>#{candidate.rank}</td>
                        <td style={{ padding: "0.75rem 0.5rem", borderBottom: "1px solid #e2e8f0", fontFamily: "monospace", color: "#475569" }}>{candidate.seller_id}</td>
                        <td style={{ padding: "0.75rem 0.5rem", borderBottom: "1px solid #e2e8f0" }}>
                          <span style={{ background: "#dcfce7", color: "#166534", padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.875rem", fontWeight: 600 }}>{Math.round(candidate.score * 100)}%</span>
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>
                          <button 
                            onClick={() => handleInitiateEngagement(candidate.seller_id)}
                            style={{ padding: "0.375rem 0.75rem", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}
                          >
                            Engage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
