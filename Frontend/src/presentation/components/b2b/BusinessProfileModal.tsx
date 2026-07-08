import { useState, useEffect } from "react";
import { apiRequest } from "../../../api/client";
import { Business, TaxonomyResponse } from "./types";
import { Briefcase, Building, CheckCircle, Mail, MapPin, Phone, User, X } from "lucide-react";

type BusinessProfileModalProps = {
  businessId: string;
  token: string;
  isOpen: boolean;
  onClose: () => void;
  canViewContact: boolean;
  taxonomy: TaxonomyResponse | null;
};

export const BusinessProfileModal = ({ businessId, token, isOpen, onClose, canViewContact, taxonomy }: BusinessProfileModalProps) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const serviceTypes = Array.isArray(taxonomy?.service_types) ? taxonomy.service_types : [];
  const serviceTypeMap = new Map(serviceTypes.map(t => [t.id, t.name]));

  useEffect(() => {
    if (isOpen && businessId) {
      loadBusiness();
    }
  }, [isOpen, businessId]);

  const loadBusiness = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<Business>(`/businesses/${businessId}`, { token });
      setBusiness(data);
    } catch (err) {
      setError("Failed to load business profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
    }}>
      <div className="card" style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
        <button 
          onClick={onClose}
          style={{ position: "absolute", top: "1rem", right: "1rem", background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
        >
          <X style={{ width: "24px", height: "24px" }} />
        </button>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Loading profile...</div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>{error}</div>
        ) : business ? (
          <div>
            <div style={{ padding: "2rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "12px", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
                  <Building style={{ width: "32px", height: "32px" }} />
                </div>
                <div>
                  <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "1.5rem", color: "#0f172a" }}>{business.name}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ 
                      display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", 
                      borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, 
                      background: business.verification?.verification_status === "VERIFIED" ? "#dcfce7" : "#f1f5f9", 
                      color: business.verification?.verification_status === "VERIFIED" ? "#166534" : "#475569" 
                    }}>
                      {business.verification?.verification_status === "VERIFIED" && <CheckCircle style={{ width: "12px", height: "12px" }} />}
                      {business.verification?.verification_status || "UNVERIFIED"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "2rem" }}>
              {canViewContact ? (
                <div style={{ marginBottom: "2rem" }}>
                  <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <User style={{ width: "18px", height: "18px", color: "#64748b" }} /> Contact Information
                  </h3>
                  <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Contact Person</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 500, marginTop: "0.25rem" }}>
                          <User style={{ width: "14px", height: "14px", color: "#94a3b8" }} /> {business.contact_person || "N/A"}
                        </div>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Email Address</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 500, marginTop: "0.25rem" }}>
                          <Mail style={{ width: "14px", height: "14px", color: "#94a3b8" }} /> {business.email}
                        </div>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Phone Number</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 500, marginTop: "0.25rem" }}>
                          <Phone style={{ width: "14px", height: "14px", color: "#94a3b8" }} /> {business.phone || "N/A"}
                        </div>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Location</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 500, marginTop: "0.25rem" }}>
                          <MapPin style={{ width: "14px", height: "14px", color: "#94a3b8" }} /> 
                          {business.verification ? `${business.verification.district}, ${business.verification.region}` : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: "2rem", padding: "1.25rem", background: "#f1f5f9", borderRadius: "8px", border: "1px dashed #cbd5e1", textAlign: "center" }}>
                  <Mail style={{ width: "24px", height: "24px", color: "#94a3b8", margin: "0 auto 0.5rem" }} />
                  <p style={{ margin: 0, color: "#475569", fontSize: "0.875rem" }}>Contact information is hidden until the engagement is accepted.</p>
                </div>
              )}

              <div>
                <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Briefcase style={{ width: "18px", height: "18px", color: "#64748b" }} /> Capabilities (Services & Products)
                </h3>
                {(!business.capabilities || business.capabilities.length === 0) ? (
                  <p style={{ color: "#64748b", fontSize: "0.875rem" }}>No capabilities listed.</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {business.capabilities.map((cap, i) => (
                      <span key={i} style={{ padding: "0.375rem 0.75rem", background: "#eff6ff", color: "#1e40af", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: 500, border: "1px solid #bfdbfe" }}>
                        {serviceTypeMap.get(cap.service_type_id) ?? cap.service_type_id}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
