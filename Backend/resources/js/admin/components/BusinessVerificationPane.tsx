import { useState } from "react";
import { Business, BusinessVerification } from "./types";
import { apiRequest, ApiError } from "../client";
import { Briefcase, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

type BusinessVerificationPaneProps = {
  token: string;
  businesses: Business[];
  onRefresh: () => void;
  setNotice: (type: "success" | "error", msg: string) => void;
};

function getVerification(biz: Business): BusinessVerification | null {
  if (biz.verification) return biz.verification;
  if (biz.verification_status || biz.tin_number) {
    return {
      tin_number: biz.tin_number ?? "",
      brela_number: biz.brela_number ?? "",
      business_size: biz.business_size ?? "",
      is_owner: biz.is_owner ?? true,
      owner_gender: biz.owner_gender ?? "",
      employee_count: biz.employee_count ?? 0,
      revenue_range: biz.revenue_range ?? "",
      region: biz.region ?? "",
      district: biz.district ?? "",
      address: biz.address ?? "",
      verification_status: biz.verification_status ?? "UNVERIFIED",
    };
  }
  return null;
}

function statusTagClass(status: string): string {
  if (status === "VERIFIED") return "adm-tag adm-tag--success";
  if (status === "REJECTED") return "adm-tag adm-tag--danger";
  return "adm-tag adm-tag--warning";
}

export const BusinessVerificationPane = ({ token, businesses, onRefresh, setNotice }: BusinessVerificationPaneProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const reviewVerification = async (business: Business, status: "VERIFIED" | "REJECTED") => {
    setLoading(true);
    try {
      await apiRequest(`/businesses/${business.id}/verification/review`, {
        method: "PATCH",
        token,
        body: {
          verification_status: status,
          ...(status === "REJECTED" && rejectNotes ? { notes: rejectNotes } : {}),
        },
      });
      setNotice("success", `Business ${status === "VERIFIED" ? "approved" : "rejected"} successfully.`);
      setSelectedBiz(null);
      setRejectNotes("");
      onRefresh();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.firstFieldError() ?? err.message
          : err instanceof Error ? err.message : "Failed to update business verification.";
      setNotice("error", message);
    } finally {
      setLoading(false);
    }
  };

  const pendingBusinesses  = businesses.filter((biz) => ["UNVERIFIED", "PARTIALLY_VERIFIED"].includes(getVerification(biz)?.verification_status ?? "UNVERIFIED"));
  const reviewedBusinesses = businesses.filter((biz) => ["VERIFIED", "REJECTED"].includes(getVerification(biz)?.verification_status ?? "UNVERIFIED"));

  /* ── Detail view ── */
  if (selectedBiz) {
    const v      = getVerification(selectedBiz);
    const status = v?.verification_status ?? "UNVERIFIED";
    const canReview = ["UNVERIFIED", "PARTIALLY_VERIFIED"].includes(status);

    return (
      <div>
        <button type="button" className="adm-back-link" onClick={() => setSelectedBiz(null)}>
          ← Back to queue
        </button>

        <div className="adm-review-card">
          <div className="adm-review-card__head">
            <div>
              <h3>{selectedBiz.name}</h3>
              <p>{selectedBiz.email}</p>
            </div>
            <span className={statusTagClass(status)}>{status}</span>
          </div>

          {!v ? (
            <div className="adm-notice adm-notice--error">
              <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span>No verification details have been submitted for this business.</span>
            </div>
          ) : (
            <div className="adm-review-grid">
              <div><strong>TIN</strong><p>{v.tin_number || "—"}</p></div>
              <div><strong>BRELA</strong><p>{v.brela_number || "—"}</p></div>
              <div><strong>Business size</strong><p>{v.business_size || "—"}</p></div>
              <div><strong>Employees</strong><p>{v.employee_count ?? "—"}</p></div>
              <div><strong>Revenue range</strong><p>{v.revenue_range || "—"}</p></div>
              <div><strong>Owner</strong><p>{v.is_owner ? "Yes" : "No"} · {v.owner_gender || "—"}</p></div>
              <div><strong>Region</strong><p>{v.region || "—"}</p></div>
              <div><strong>District</strong><p>{v.district || "—"}</p></div>
              <div className="adm-review-grid__full"><strong>Address</strong><p>{v.address || "—"}</p></div>
            </div>
          )}

          {canReview && v && (
            <div className="adm-review-actions">
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                disabled={loading}
                onClick={() => reviewVerification(selectedBiz, "VERIFIED")}
                style={{ background: "var(--adm-success)", borderColor: "var(--adm-success)" }}
              >
                <CheckCircle style={{ width: 16, height: 16 }} />
                Approve &amp; Verify
              </button>
              <div className="adm-reject-block">
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--adm-text-muted)" }}>
                  Rejection reason (optional)
                  <textarea
                    className="adm-reject-textarea"
                    rows={2}
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Brief reason shown internally…"
                    style={{ display: "block", marginTop: "0.375rem" }}
                  />
                </label>
                <button
                  type="button"
                  className="adm-btn adm-btn-outline"
                  disabled={loading}
                  onClick={() => reviewVerification(selectedBiz, "REJECTED")}
                  style={{ color: "var(--adm-danger)", borderColor: "#fecaca" }}
                >
                  <XCircle style={{ width: 15, height: 15 }} />
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="adm-section">
        <div className="adm-section-head">
          <div className="adm-section-title-wrap">
            <div className="adm-section-icon">
              <Briefcase style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h2>Business Verification</h2>
              <p>Review pending registrations and approve or reject requests.</p>
            </div>
          </div>
          {loading && <span className="adm-updating-pill">Processing…</span>}
        </div>

        {/* Pending */}
        <div style={{ padding: "16px 24px 8px", borderBottom: "1px solid var(--adm-border)" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--adm-text-muted)" }}>
            Pending Review ({pendingBusinesses.length})
          </span>
        </div>

        {pendingBusinesses.length === 0 ? (
          <p className="adm-empty">No businesses awaiting verification.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Contact</th>
                <th>Region</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {pendingBusinesses.map((biz) => {
                const v = getVerification(biz);
                return (
                  <tr key={biz.id}>
                    <td style={{ fontWeight: 600, color: "var(--adm-text-main)" }}>{biz.name}</td>
                    <td style={{ color: "var(--adm-text-muted)" }}>{biz.email}</td>
                    <td>{v?.region ?? "—"}</td>
                    <td><span className={statusTagClass(v?.verification_status ?? "UNVERIFIED")}>{v?.verification_status ?? "UNVERIFIED"}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className="adm-btn adm-btn-sm adm-btn-outline" onClick={() => setSelectedBiz(biz)}>
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {reviewedBusinesses.length > 0 && (
        <div className="adm-section">
          <div style={{ padding: "16px 24px 8px", borderBottom: "1px solid var(--adm-border)" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--adm-text-muted)" }}>
              Recently Reviewed ({reviewedBusinesses.length})
            </span>
          </div>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {reviewedBusinesses.map((biz) => {
                const v = getVerification(biz);
                return (
                  <tr key={biz.id}>
                    <td style={{ fontWeight: 600 }}>{biz.name}</td>
                    <td><span className={statusTagClass(v?.verification_status ?? "UNVERIFIED")}>{v?.verification_status ?? "UNVERIFIED"}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className="adm-btn adm-btn-sm adm-btn-ghost" onClick={() => setSelectedBiz(biz)}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};