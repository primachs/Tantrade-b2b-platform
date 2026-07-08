import { useState, useEffect } from "react";
import { apiRequest } from "../../../api/client";
import { Rfs, TaxonomyResponse } from "./types";
import { FileText, MapPin, DollarSign, Target, Briefcase, X } from "lucide-react";

type RfsInspectModalProps = {
  rfsId: string;
  token: string;
  isOpen: boolean;
  onClose: () => void;
  taxonomy: TaxonomyResponse | null;
};

export const RfsInspectModal = ({ rfsId, token, isOpen, onClose, taxonomy }: RfsInspectModalProps) => {
  const [rfs, setRfs] = useState<Rfs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const serviceTypes = Array.isArray(taxonomy?.service_types) ? taxonomy.service_types : [];
  const serviceTypeMap = new Map(serviceTypes.map(t => [t.id, t.name]));

  useEffect(() => {
    if (isOpen && rfsId) {
      loadRfs();
    }
  }, [isOpen, rfsId]);

  const loadRfs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<Rfs>(`/rfs/${rfsId}`, { token });
      setRfs(data);
    } catch (err) {
      setError("Failed to load RFS details.");
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
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Loading RFS...</div>
        ) : error ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#ef4444" }}>{error}</div>
        ) : rfs ? (
          <div>
            <div style={{ padding: "2rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "12px", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
                  <FileText style={{ width: "32px", height: "32px" }} />
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 600, marginBottom: "0.25rem" }}>{rfs.short_id || "RFS-Unknown"}</div>
                  <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "1.25rem", color: "#0f172a" }}>{rfs.title}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ 
                      padding: "0.25rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, 
                      background: rfs.status === "OPEN" ? "#dcfce7" : rfs.status === "MATCHED" ? "#fef3c7" : "#f1f5f9", 
                      color: rfs.status === "OPEN" ? "#166534" : rfs.status === "MATCHED" ? "#92400e" : "#475569" 
                    }}>
                      {rfs.status}
                    </span>
                    <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
                      • {serviceTypeMap.get(rfs.service_type_id) ?? rfs.service_type_id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "2rem" }}>
              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem", color: "#0f172a" }}>Description</h3>
                <p style={{ margin: 0, color: "#475569", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {rfs.description}
                </p>
              </div>

              <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", color: "#0f172a" }}>Project Requirements</h3>
              <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Project Size</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 500, marginTop: "0.25rem" }}>
                      <Briefcase style={{ width: "14px", height: "14px", color: "#94a3b8" }} /> {rfs.project_size}
                    </div>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Required Expertise</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 500, marginTop: "0.25rem" }}>
                      <Target style={{ width: "14px", height: "14px", color: "#94a3b8" }} /> {rfs.expertise_level}
                    </div>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Budget Range</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 500, marginTop: "0.25rem" }}>
                      <DollarSign style={{ width: "14px", height: "14px", color: "#94a3b8" }} /> 
                      {rfs.constraint?.min_budget && rfs.constraint?.max_budget 
                        ? `${rfs.constraint.min_budget} - ${rfs.constraint.max_budget}` 
                        : "Not specified"}
                    </div>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Location Preference</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 500, marginTop: "0.25rem" }}>
                      <MapPin style={{ width: "14px", height: "14px", color: "#94a3b8" }} /> 
                      {rfs.constraint?.region && rfs.constraint?.district
                        ? `${rfs.constraint.district}, ${rfs.constraint.region}`
                        : "No specific location"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
