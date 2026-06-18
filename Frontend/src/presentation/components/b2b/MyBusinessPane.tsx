import { useState, useEffect } from "react";
import { apiRequest } from "../../../api/client";
import { Business, ServiceType, TaxonomyResponse } from "./types";
import { Edit2, Shield, Settings } from "lucide-react";

type MyBusinessPaneProps = {
  token: string;
  myBusiness: Business;
  taxonomy: TaxonomyResponse | null;
  onUpdate: () => void;
  setNotice: (type: "success" | "error", msg: string) => void;
};

export const MyBusinessPane = ({ token, myBusiness, taxonomy, onUpdate, setNotice }: MyBusinessPaneProps) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "verification" | "capabilities">("profile");

  const [profileForm, setProfileForm] = useState({
    name: myBusiness.name,
    contact_person: myBusiness.contact_person || "",
    phone: myBusiness.phone || "",
    email: myBusiness.email
  });

  const [verificationForm, setVerificationForm] = useState({
    tin_number: myBusiness.verification?.tin_number || "",
    brela_number: myBusiness.verification?.brela_number || "",
    business_size: myBusiness.verification?.business_size || "MEDIUM",
    is_owner: myBusiness.verification?.is_owner ?? true,
    owner_gender: myBusiness.verification?.owner_gender || "FEMALE",
    employee_count: String(myBusiness.verification?.employee_count || ""),
    revenue_range: myBusiness.verification?.revenue_range || "BETWEEN_500M_5B",
    region: myBusiness.verification?.region || "",
    district: myBusiness.verification?.district || "",
    address: myBusiness.verification?.address || "",
    verification_status: myBusiness.verification?.verification_status || "UNVERIFIED"
  });

  const [capabilitiesDraft, setCapabilitiesDraft] = useState(myBusiness.capabilities || []);
  const [capabilityForm, setCapabilityForm] = useState({
    service_type_id: "",
    attributes: [] as { attribute_id: string; value: string }[]
  });
  const [attributeDraft, setAttributeDraft] = useState({ attribute_id: "", value: "" });

  const serviceTypes = Array.isArray(taxonomy?.service_types) ? taxonomy.service_types : [];
  const serviceAttributes = Array.isArray(taxonomy?.attributes) ? taxonomy.attributes : [];

  useEffect(() => {
    if (!capabilityForm.service_type_id && serviceTypes.length > 0) {
      setCapabilityForm((prev) => ({ ...prev, service_type_id: serviceTypes[0].id }));
    }
  }, [serviceTypes, capabilityForm.service_type_id]);

  const toIntOrNull = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await apiRequest(`/businesses/${myBusiness.id}`, {
        method: "PATCH",
        token,
        body: profileForm,
      });
      setNotice("success", "Business profile updated.");
      onUpdate();
    } catch (err) {
      setNotice("error", "Failed to update business profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVerification = async () => {
    setLoading(true);
    try {
      const payload = {
        ...verificationForm,
        employee_count: toIntOrNull(verificationForm.employee_count) ?? 0,
      };
      await apiRequest(`/businesses/${myBusiness.id}/verification`, {
        method: "PUT",
        token,
        body: payload,
      });
      setNotice("success", "Verification updated successfully.");
      onUpdate();
    } catch (err) {
      setNotice("error", "Failed to update verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttribute = () => {
    if (!attributeDraft.attribute_id || !attributeDraft.value.trim()) return;
    setCapabilityForm(prev => ({
      ...prev,
      attributes: [...prev.attributes, attributeDraft]
    }));
    setAttributeDraft({ attribute_id: "", value: "" });
  };

  const handleAddCapability = () => {
    if (!capabilityForm.service_type_id) return;
    setCapabilitiesDraft(prev => [...prev, capabilityForm]);
    setCapabilityForm({ service_type_id: serviceTypes[0]?.id || "", attributes: [] });
  };

  const handleSaveCapabilities = async () => {
    if (capabilitiesDraft.length === 0) {
      setNotice("error", "Add at least one capability before saving.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest(`/businesses/${myBusiness.id}/capabilities`, {
        method: "PUT",
        token,
        body: { capabilities: capabilitiesDraft },
      });
      setNotice("success", "Capabilities updated successfully.");
      onUpdate();
    } catch (err) {
      setNotice("error", "Failed to update capabilities.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem" }}>
        <button 
          onClick={() => setActiveTab("profile")}
          style={{ 
            background: "transparent", border: "none", cursor: "pointer", fontSize: "1rem", fontWeight: 500,
            color: activeTab === "profile" ? "#2563eb" : "#64748b",
            borderBottom: activeTab === "profile" ? "2px solid #2563eb" : "none",
            paddingBottom: "0.5rem"
          }}>
          <Edit2 style={{ width: "16px", height: "16px", display: "inline", marginRight: "0.5rem" }} /> Profile
        </button>
        <button 
          onClick={() => setActiveTab("verification")}
          style={{ 
            background: "transparent", border: "none", cursor: "pointer", fontSize: "1rem", fontWeight: 500,
            color: activeTab === "verification" ? "#2563eb" : "#64748b",
            borderBottom: activeTab === "verification" ? "2px solid #2563eb" : "none",
            paddingBottom: "0.5rem"
          }}>
          <Shield style={{ width: "16px", height: "16px", display: "inline", marginRight: "0.5rem" }} /> Verification
        </button>
        <button 
          onClick={() => setActiveTab("capabilities")}
          style={{ 
            background: "transparent", border: "none", cursor: "pointer", fontSize: "1rem", fontWeight: 500,
            color: activeTab === "capabilities" ? "#2563eb" : "#64748b",
            borderBottom: activeTab === "capabilities" ? "2px solid #2563eb" : "none",
            paddingBottom: "0.5rem"
          }}>
          <Settings style={{ width: "16px", height: "16px", display: "inline", marginRight: "0.5rem" }} /> Capabilities
        </button>
      </div>

      {activeTab === "profile" && (
        <div style={{ display: "grid", gap: "1.5rem", maxWidth: "600px" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a" }}>Basic Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Business name</label>
            <input className="form-control" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Contact person</label>
            <input className="form-control" value={profileForm.contact_person} onChange={e => setProfileForm({...profileForm, contact_person: e.target.value})} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Phone</label>
              <input className="form-control" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Email</label>
              <input className="form-control" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} disabled />
            </div>
          </div>
          <button className="button" style={{ background: "#2563eb", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "6px", cursor: "pointer", alignSelf: "flex-start", marginTop: "1rem" }} onClick={handleUpdateProfile} disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      )}

      {activeTab === "verification" && (
        <div style={{ display: "grid", gap: "1.5rem", maxWidth: "800px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a" }}>Verification Details</h2>
            <span style={{ padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, background: verificationForm.verification_status === "VERIFIED" ? "#dcfce7" : "#f1f5f9", color: verificationForm.verification_status === "VERIFIED" ? "#166534" : "#475569" }}>
              {verificationForm.verification_status}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>TIN Number</label>
              <input className="form-control" value={verificationForm.tin_number} onChange={e => setVerificationForm({...verificationForm, tin_number: e.target.value})} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>BRELA Number</label>
              <input className="form-control" value={verificationForm.brela_number} onChange={e => setVerificationForm({...verificationForm, brela_number: e.target.value})} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Business Size</label>
              <select className="form-control" value={verificationForm.business_size} onChange={e => setVerificationForm({...verificationForm, business_size: e.target.value})}>
                <option value="SMALL">Small</option>
                <option value="MEDIUM">Medium</option>
                <option value="LARGE">Large</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Revenue Range</label>
              <select className="form-control" value={verificationForm.revenue_range} onChange={e => setVerificationForm({...verificationForm, revenue_range: e.target.value})}>
                <option value="BELOW_50M">Below 50M</option>
                <option value="BETWEEN_50M_500M">50M - 500M</option>
                <option value="BETWEEN_500M_5B">500M - 5B</option>
                <option value="ABOVE_5B">Above 5B</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Employee Count</label>
              <input className="form-control" type="number" value={verificationForm.employee_count} onChange={e => setVerificationForm({...verificationForm, employee_count: e.target.value})} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Region</label>
              <input className="form-control" value={verificationForm.region} onChange={e => setVerificationForm({...verificationForm, region: e.target.value})} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>District</label>
              <input className="form-control" value={verificationForm.district} onChange={e => setVerificationForm({...verificationForm, district: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Address</label>
            <textarea className="form-control" value={verificationForm.address} onChange={e => setVerificationForm({...verificationForm, address: e.target.value})} rows={3} />
          </div>
          <button className="button" style={{ background: "#2563eb", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "6px", cursor: "pointer", alignSelf: "flex-start", marginTop: "1rem" }} onClick={handleUpdateVerification} disabled={loading}>
            {loading ? "Saving..." : "Save Verification"}
          </button>
        </div>
      )}

      {activeTab === "capabilities" && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a" }}>Business Capabilities</h2>
          
          <div style={{ padding: "1.5rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "1rem", margin: "0 0 1rem 0" }}>Add New Capability</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1rem" }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Service Type</label>
                <select className="form-control" value={capabilityForm.service_type_id} onChange={e => setCapabilityForm({...capabilityForm, service_type_id: e.target.value})}>
                  <option value="">Select Service Type...</option>
                  {serviceTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <h4 style={{ fontSize: "0.875rem", color: "#64748b", margin: "1rem 0 0.5rem" }}>Attributes (Optional)</h4>
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Attribute</label>
                <select className="form-control" value={attributeDraft.attribute_id} onChange={e => setAttributeDraft({...attributeDraft, attribute_id: e.target.value})}>
                  <option value="">Select Attribute...</option>
                  {serviceAttributes.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Value</label>
                <input className="form-control" value={attributeDraft.value} onChange={e => setAttributeDraft({...attributeDraft, value: e.target.value})} placeholder="e.g. 5 Years" />
              </div>
              <button onClick={handleAddAttribute} style={{ padding: "0.5rem 1rem", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", height: "42px" }}>
                Add Attribute
              </button>
            </div>
            {capabilityForm.attributes.length > 0 && (
              <ul style={{ marginTop: "1rem", paddingLeft: "1.5rem" }}>
                {capabilityForm.attributes.map((a, i) => (
                  <li key={i} style={{ fontSize: "0.875rem", color: "#475569", marginBottom: "0.25rem" }}>
                    {serviceAttributes.find(sa => sa.id === a.attribute_id)?.name}: {a.value}
                  </li>
                ))}
              </ul>
            )}
            
            <button onClick={handleAddCapability} style={{ marginTop: "1.5rem", padding: "0.5rem 1rem", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer" }}>
              Queue Capability
            </button>
          </div>

          <div>
            <h3 style={{ fontSize: "1rem", margin: "1.5rem 0 1rem 0" }}>Current Capabilities</h3>
            {capabilitiesDraft.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>No capabilities added yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {capabilitiesDraft.map((cap, i) => (
                  <div key={i} style={{ padding: "1rem", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fff" }}>
                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem" }}>
                      {serviceTypes.find(t => t.id === cap.service_type_id)?.name || cap.service_type_id}
                    </h4>
                    {cap.attributes.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: "1.5rem", fontSize: "0.75rem", color: "#64748b" }}>
                        {cap.attributes.map((a, j) => (
                          <li key={j}>{serviceAttributes.find(sa => sa.id === a.attribute_id)?.name}: {a.value}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="button" style={{ background: "#2563eb", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "6px", cursor: "pointer", alignSelf: "flex-start", marginTop: "1rem" }} onClick={handleSaveCapabilities} disabled={loading}>
            {loading ? "Saving..." : "Save All Capabilities"}
          </button>
        </div>
      )}
    </div>
  );
};
