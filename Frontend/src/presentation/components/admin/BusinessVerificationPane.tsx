import { useState } from "react";
import { Business } from "./types";
import { apiRequest } from "../../../api/client";
import { Briefcase, CheckCircle, XCircle } from "lucide-react";

type BusinessVerificationPaneProps = {
  token: string;
  businesses: Business[];
  onRefresh: () => void;
  setNotice: (type: "success" | "error", msg: string) => void;
};

export const BusinessVerificationPane = ({ token, businesses, onRefresh, setNotice }: BusinessVerificationPaneProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);

  const updateVerification = async (business: Business, status: "VERIFIED" | "REJECTED") => {
    setLoading(true);
    try {
      const payload = {
        tin_number: business.tin_number || "000000000",
        brela_number: business.brela_number || "000000",
        business_size: business.business_size || "MEDIUM",
        is_owner: business.is_owner ?? true,
        owner_gender: business.owner_gender || "PREFER_NOT_TO_SAY",
        employee_count: business.employee_count || 0,
        revenue_range: business.revenue_range || "UNKNOWN",
        region: business.region || "Unknown",
        district: business.district || "Unknown",
        address: business.address || "Unknown",
        verification_status: status
      };

      await apiRequest(`/businesses/${business.id}/verification`, { method: "PUT", token, body: payload });
      setNotice("success", `Business ${status.toLowerCase()} successfully.`);
      setSelectedBiz(null);
      onRefresh();
    } catch (err) {
      setNotice("error", "Failed to update business verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="section-head">
        <div className="section-title">
          <Briefcase className="icon" />
          <div>
            <h2>Business Verification</h2>
            <p>Review and verify business registrations.</p>
          </div>
        </div>
        {loading && <span className="pill">Updating...</span>}
      </div>

      {selectedBiz ? (
        <div className="surface" style={{ marginTop: "1rem" }}>
          <button className="btn-sm btn-ghost mb-4" onClick={() => setSelectedBiz(null)}>
            &larr; Back to list
          </button>
          <div className="card">
            <h3>{selectedBiz.name}</h3>
            <p className="muted">{selectedBiz.email}</p>
            <hr style={{ margin: "1rem 0" }} />
            
            <div className="grid-2">
              <div>
                <strong>TIN Number:</strong> {selectedBiz.tin_number || "N/A"}
              </div>
              <div>
                <strong>BRELA Number:</strong> {selectedBiz.brela_number || "N/A"}
              </div>
              <div>
                <strong>Size:</strong> {selectedBiz.business_size || "N/A"}
              </div>
              <div>
                <strong>Region:</strong> {selectedBiz.region || "N/A"}
              </div>
            </div>

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
              <button className="btn btn-primary" onClick={() => updateVerification(selectedBiz, "VERIFIED")} disabled={loading}>
                <CheckCircle className="w-4 h-4 mr-2" /> Approve & Verify
              </button>
              <button className="btn btn-outline" style={{ color: "#ef4444", borderColor: "#ef4444" }} onClick={() => updateVerification(selectedBiz, "REJECTED")} disabled={loading}>
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="surface">
          {businesses.length === 0 ? (
            <p className="muted">No businesses registered.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((biz) => (
                  <tr key={biz.id}>
                    <td>{biz.name}</td>
                    <td>{biz.email}</td>
                    <td>
                      <span className={`tag ${biz.verification_status === 'VERIFIED' ? 'tag--success' : biz.verification_status === 'REJECTED' ? 'tag--danger' : 'tag--warning'}`}>
                        {biz.verification_status || "UNVERIFIED"}
                      </span>
                    </td>
                    <td>
                      <button className="btn-sm btn-outline" onClick={() => setSelectedBiz(biz)}>
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  );
};
