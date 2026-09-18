import { Layers } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, ApiError } from "../../../api/client";
import { RegionDistrictSelect } from "../RegionDistrictSelect";
import { deriveBusinessSizeFromRevenue } from "../../../shared/deriveBusinessSize";
import {
  validateBrela,
  validateMobile,
  validateRegionDistrict,
  validateTin,
} from "../../../shared/validation/tanzania";

type LandingHubProps = {
  token: string;
  user: { name: string; email: string };
  setNotice: (type: "success" | "error", msg: string) => void;
  onRegistered: () => void;
  hasBusiness?: boolean;
  onGoToDashboard?: () => void;
};

export const LandingHub = ({ token, user, setNotice, onRegistered, hasBusiness, onGoToDashboard }: LandingHubProps) => {
  const navigate = useNavigate();
  const [landingMode, setLandingMode] = useState<"menu" | "register">("menu");
  const [registrationStep, setRegistrationStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    contact_person: user.name,
    phone: "",
    email: user.email,
    tin_number: "",
    brela_number: "",
    business_size: deriveBusinessSizeFromRevenue("BETWEEN_50M_500M"),
    is_owner: true,
    owner_gender: "FEMALE",
    employee_count: "",
    revenue_range: "BETWEEN_50M_500M",
    region: "",
    district: "",
    address: "",
    verification_status: "UNVERIFIED",
    industry_type: "",
  });

  const handleModeChange = (mode: "menu" | "register") => {
    setLandingMode(mode);
  };

  const toIntOrNull = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!registrationForm.name.trim()) errors.name = "Business name is required.";
    if (!registrationForm.contact_person.trim()) errors.contact_person = "Contact person is required.";
    const phoneErr = validateMobile(registrationForm.phone, true);
    if (phoneErr) errors.phone = phoneErr;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    const tinErr = validateTin(registrationForm.tin_number);
    if (tinErr) errors.tin_number = tinErr;
    const brelaErr = validateBrela(registrationForm.brela_number);
    if (brelaErr) errors.brela_number = brelaErr;
    if (!registrationForm.industry_type) errors.industry_type = "Please select an industry.";
    Object.assign(errors, validateRegionDistrict(registrationForm.region, registrationForm.district));
    if (!registrationForm.address.trim()) errors.address = "Physical address is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterBusiness = async () => {
    if (!validateStep2()) {
      setNotice("error", "Please fix the highlighted fields before submitting.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...registrationForm,
        employee_count: toIntOrNull(registrationForm.employee_count) ?? 1,
        capabilities: [],
      };
      await apiRequest("/businesses", { method: "POST", token, body: payload });
      setNotice("success", "Business registered successfully.");
      onRegistered();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.firstFieldError() ?? err.message
          : err instanceof Error
          ? err.message
          : "Failed to register business.";
      setNotice("error", message);
    } finally {
      setLoading(false);
    }
  };

  if (landingMode === "register") {
    return (
      <section className="page-section" style={{ background: "#f8fafc", minHeight: "calc(100vh - 80px)" }}>
        <div className="card" style={{ maxWidth: "800px", margin: "4rem auto", padding: "3rem", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", background: "#fff" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
             <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", background: "rgba(37, 99, 235, 0.1)", borderRadius: "50%", marginBottom: "1.5rem" }}>
               <Layers style={{ color: "#2563eb", width: "32px", height: "32px" }} />
             </div>
             <h2 style={{ fontSize: "2rem", color: "#0f172a", marginBottom: "0.5rem" }}>Register Your Business</h2>
             <p style={{ color: "#64748b", fontSize: "1.1rem" }}>Step {registrationStep} of 2: {registrationStep === 1 ? "Basic Information" : "Verification Details"}</p>
          </div>
          
          <div className="form-grid" style={{ display: "grid", gap: "1.5rem" }}>
          {registrationStep === 1 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Business name</label>
                <input style={{ padding: '0.625rem 0.875rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} value={registrationForm.name} onChange={(event) => setRegistrationForm({ ...registrationForm, name: event.target.value })} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Contact person</label>
                <input style={{ padding: '0.625rem 0.875rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} value={registrationForm.contact_person} onChange={(event) => setRegistrationForm({ ...registrationForm, contact_person: event.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Phone number</label>
                  <input style={{ padding: '0.625rem 0.875rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} value={registrationForm.phone} onChange={(event) => setRegistrationForm({ ...registrationForm, phone: event.target.value })} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Email</label>
                  <input style={{ padding: '0.625rem 0.875rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f1f5f9' }} type="email" value={registrationForm.email} disabled />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid #e2e8f0" }}>
                <button style={{ padding: '0.625rem 1.25rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }} onClick={() => setLandingMode("menu")}>Cancel</button>
                <button style={{ padding: '0.625rem 1.25rem', border: 'none', borderRadius: '6px', background: '#2563eb', color: 'white', fontWeight: 500, cursor: 'pointer' }} onClick={() => { if (validateStep1()) setRegistrationStep(2); else setNotice("error", "Please complete all required fields."); }}>Next Step &rarr;</button>
              </div>
            </>
          ) : (
            <>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>TIN Number</label>
                   <input style={{ padding: '0.625rem 0.875rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} value={registrationForm.tin_number} onChange={e => setRegistrationForm({...registrationForm, tin_number: e.target.value.replace(/\D/g, "").slice(0, 9)})} placeholder="9 digits, e.g. 123456789" maxLength={9} />
                   {fieldErrors.tin_number && <small style={{ color: '#9b1c1c' }}>{fieldErrors.tin_number}</small>}
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>BRELA Number</label>
                   <input style={{ padding: '0.625rem 0.875rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} value={registrationForm.brela_number} onChange={e => setRegistrationForm({...registrationForm, brela_number: e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 12)})} placeholder="6–12 alphanumeric characters" maxLength={12} />
                   {fieldErrors.brela_number && <small style={{ color: '#9b1c1c' }}>{fieldErrors.brela_number}</small>}
                 </div>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Industry</label>
                 <select
                   style={{ padding: '0.625rem 0.875rem', border: fieldErrors.industry_type ? '1px solid #ef4444' : '1px solid #cbd5e1', borderRadius: '6px' }}
                   value={registrationForm.industry_type}
                   onChange={(e) => setRegistrationForm({ ...registrationForm, industry_type: e.target.value })}
                 >
                   <option value="" disabled>Select industry...</option>
                   <option value="TECHNOLOGY">Technology / Software</option>
                   <option value="OTHER">Other industries</option>
                 </select>
                 {fieldErrors.industry_type && <small style={{ color: '#9b1c1c' }}>{fieldErrors.industry_type}</small>}
                 <small style={{ color: '#64748b' }}>
                   This determines which service categories appear when you create a Request for Supply.
                 </small>
               </div>
               <RegionDistrictSelect
                 region={registrationForm.region}
                 district={registrationForm.district}
                 regionError={fieldErrors.region}
                 districtError={fieldErrors.district}
                 onRegionChange={(region) => setRegistrationForm({ ...registrationForm, region })}
                 onDistrictChange={(district) => setRegistrationForm({ ...registrationForm, district })}
               />
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Physical Address</label>
                 <textarea style={{ padding: '0.625rem 0.875rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} value={registrationForm.address} onChange={e => setRegistrationForm({...registrationForm, address: e.target.value})} rows={3} placeholder="Street address, building, floor" />
                 {fieldErrors.address && <small style={{ color: '#9b1c1c' }}>{fieldErrors.address}</small>}
               </div>
               <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid #e2e8f0" }}>
                 <button style={{ padding: '0.625rem 1.25rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }} onClick={() => setRegistrationStep(1)}>&larr; Back</button>
                 <button style={{ padding: '0.625rem 1.25rem', border: 'none', borderRadius: '6px', background: '#22c55e', color: 'white', fontWeight: 500, cursor: 'pointer' }} onClick={handleRegisterBusiness} disabled={loading}>
                   {loading ? "Registering..." : "Complete Registration"}
                 </button>
               </div>
            </>
          )}
          </div>
        </div>
      </section>
    );
  }



  return (
    <section style={{ position: "relative", minHeight: "calc(100vh - 80px)", overflow: "hidden", padding: "2.5rem 2rem", background: "#f2f3f7", borderRadius: "28px" }}>
      <div style={{ position: "absolute", top: "-80px", left: "-60px", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(60,94,171,0.35), transparent 70%)", filter: "blur(10px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-100px", right: "-80px", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,131,94,0.3), transparent 70%)", filter: "blur(10px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "120px", right: "10%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(242,194,75,0.25), transparent 70%)", filter: "blur(8px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.9rem", fontWeight: 700, color: "#1d1d1f", margin: "0 0 0.35rem", letterSpacing: "-0.025em" }}>
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p style={{ color: "#55565c", fontSize: "0.95rem", margin: "0 0 2rem" }}>
          Here's what you can do on the B2B Matchmaking Hub.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {hasBusiness ? (
            <div
              onClick={onGoToDashboard}
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(20px) saturate(150%)",
                WebkitBackdropFilter: "blur(20px) saturate(150%)",
                border: "1px solid rgba(255,255,255,0.6)",
                borderRadius: "20px",
                padding: "1.75rem",
                boxShadow: "0 8px 32px rgba(31,38,135,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
                cursor: "pointer",
              }}
            >
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(60,94,171,0.18)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Layers style={{ color: "#3c5eab", width: "19px", height: "19px" }} />
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.5rem", color: "#1d1d1f" }}>Access My Dashboard</h3>
              <p style={{ color: "#4a4b50", fontSize: "0.85rem", margin: "0 0 1.25rem", lineHeight: 1.5 }}>Manage your business profile, respond to RFSs, and view matchmaking analytics.</p>
              <div style={{ color: "#2c4a8f", fontWeight: 600, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>Go to Dashboard &rarr;</div>
            </div>
          ) : (
            <div
              onClick={() => { setLandingMode("register"); setRegistrationStep(1); }}
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(20px) saturate(150%)",
                WebkitBackdropFilter: "blur(20px) saturate(150%)",
                border: "1px solid rgba(255,255,255,0.6)",
                borderRadius: "20px",
                padding: "1.75rem",
                boxShadow: "0 8px 32px rgba(31,38,135,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
                cursor: "pointer",
              }}
            >
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(60,94,171,0.18)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Layers style={{ color: "#3c5eab", width: "19px", height: "19px" }} />
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.5rem", color: "#1d1d1f" }}>Register Business Profile</h3>
              <p style={{ color: "#4a4b50", fontSize: "0.85rem", margin: "0 0 1.25rem", lineHeight: 1.5 }}>Create your verified profile to participate in the marketplace and unlock matchmaking features.</p>
              <div style={{ color: "#2c4a8f", fontWeight: 600, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>Start Registration &rarr;</div>
            </div>
          )}

          <div
            style={{
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(20px) saturate(150%)",
              WebkitBackdropFilter: "blur(20px) saturate(150%)",
              border: "1px solid rgba(255,255,255,0.6)",
              borderRadius: "20px",
              padding: "1.75rem",
              boxShadow: "0 8px 32px rgba(31,38,135,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
            }}
          >
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(194,118,12,0.18)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#c2760c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.5rem", color: "#1d1d1f" }}>Matchmaking Guide</h3>
            <p style={{ color: "#4a4b50", fontSize: "0.85rem", margin: "0 0 1.25rem", lineHeight: 1.5 }}>Learn how our platform works and best practices for securing deals.</p>
            <button
              onClick={() => navigate("/matchmaking-guide")}
              style={{
                padding: "0.55rem 1.1rem",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.7)",
                background: "rgba(255,255,255,0.4)",
                backdropFilter: "blur(8px)",
                color: "#1d1d1f",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Read Guide
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};