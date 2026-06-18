import { Layers, Radar } from "lucide-react";
import { useState } from "react";
import { apiRequest, ApiError } from "../../../api/client";
import { RegionDistrictSelect } from "../RegionDistrictSelect";
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
};

export const LandingHub = ({ token, user, setNotice, onRegistered }: LandingHubProps) => {
  const [landingMode, setLandingMode] = useState<"menu" | "register" | "browse">("menu");
  const [registrationStep, setRegistrationStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rfsList, setRfsList] = useState<any[]>([]);
  const [taxonomy, setTaxonomy] = useState<any>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    contact_person: user.name,
    phone: "",
    email: user.email,
    tin_number: "",
    brela_number: "",
    business_size: "MEDIUM",
    is_owner: true,
    owner_gender: "FEMALE",
    employee_count: "",
    revenue_range: "BETWEEN_500M_5B",
    region: "",
    district: "",
    address: "",
    verification_status: "UNVERIFIED",
  });

  const loadBrowseData = async () => {
    try {
      const [rfs, tax] = await Promise.all([
        apiRequest<any[]>("/rfs", { token }),
        apiRequest<any>("/taxonomy", { token })
      ]);
      setRfsList(Array.isArray(rfs) ? rfs : []);
      setTaxonomy(tax);
    } catch (e) {
      setNotice("error", "Failed to load opportunities");
    }
  };

  const handleModeChange = (mode: "menu" | "register" | "browse") => {
    setLandingMode(mode);
    if (mode === "browse") {
      loadBrowseData();
    }
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
        employee_count: toIntOrNull(registrationForm.employee_count) ?? 0,
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

  const serviceTypeMap = new Map(
    Array.isArray(taxonomy?.service_types) ? taxonomy.service_types.map((t: any) => [t.id, t.name]) : []
  );

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

  if (landingMode === "browse") {
    return (
      <section className="page-section" style={{ background: "#f8fafc", minHeight: "calc(100vh - 80px)", padding: "2rem" }}>
         <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
             <Radar style={{ color: "#2563eb", width: "32px", height: "32px" }} />
             <div>
               <h2 style={{ fontSize: "1.5rem", color: "#0f172a", margin: 0 }}>Market Demand</h2>
               <p style={{ color: "#64748b", margin: 0, marginTop: "0.25rem" }}>Browse active requests for services (RFS) from verified buyers.</p>
             </div>
           </div>
           <button style={{ padding: '0.625rem 1.25rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }} onClick={() => setLandingMode("menu")}>Back to Menu</button>
         </div>
         <div style={{ maxWidth: "1200px", margin: "0 auto", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
           {rfsList.length === 0 ? (
             <div style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>
               No active requests found at this time.
             </div>
           ) : (
             <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
               <thead>
                 <tr>
                   <th style={{ padding: "1rem 1.5rem", background: "#f8fafc", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>Title</th>
                   <th style={{ padding: "1rem 1.5rem", background: "#f8fafc", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>Service Category</th>
                   <th style={{ padding: "1rem 1.5rem", background: "#f8fafc", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>Status</th>
                   <th style={{ padding: "1rem 1.5rem", background: "#f8fafc", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>Budget Range</th>
                 </tr>
               </thead>
               <tbody>
                 {rfsList.map((rfs) => (
                   <tr key={rfs.id}>
                     <td style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", fontWeight: 500, color: "#334155" }}>{rfs.title}</td>
                     <td style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", color: "#334155", fontSize: "0.875rem" }}>{serviceTypeMap.get(rfs.service_type_id) ?? rfs.service_type_id}</td>
                     <td style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0" }}>
                       <span style={{ display: "inline-flex", padding: "0.25rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500, background: "#eff6ff", color: "#2563eb" }}>{rfs.status}</span>
                     </td>
                     <td style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.875rem" }}>
                       {rfs.constraint?.min_budget || rfs.constraint?.max_budget ? (
                         <span>
                           {rfs.constraint?.min_budget ? `${rfs.constraint.min_budget.toLocaleString()}` : "0"} - 
                           {rfs.constraint?.max_budget ? ` ${rfs.constraint.max_budget.toLocaleString()} TZS` : " No Limit"}
                         </span>
                       ) : (
                         <span>Not specified</span>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
         </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "0", background: "#f8fafc", minHeight: "calc(100vh - 80px)", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #10b981 100%)",
        color: "white",
        padding: "6rem 2rem 8rem",
        textAlign: "center",
      }}>
        <Radar style={{ width: "64px", height: "64px", margin: "0 auto 1.5rem", opacity: 0.9 }} />
        <h1 style={{ fontSize: "3rem", fontWeight: "700", margin: "0 0 1.5rem 0", letterSpacing: "-0.02em" }}>B2B Matchmaking Hub</h1>
        <p style={{ fontSize: "1.25rem", opacity: 0.9, maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          Connect with verified buyers and sellers, discover new opportunities, and grow your business network through our secure matchmaking platform.
        </p>
      </div>

      <div style={{
        maxWidth: "1100px",
        margin: "-4rem auto 4rem",
        padding: "0 2rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "2rem",
        position: "relative",
        zIndex: 10,
        width: "100%"
      }}>
        <div style={{ background: "#ffffff", padding: "2.5rem", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", cursor: "pointer", border: "1px solid #e2e8f0" }} onClick={() => { setLandingMode("register"); setRegistrationStep(1); }}>
          <div style={{ background: "rgba(37, 99, 235, 0.1)", width: "64px", height: "64px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
            <Layers style={{ color: "#2563eb", width: "32px", height: "32px" }} />
          </div>
          <h3 style={{ fontSize: "1.5rem", margin: "0 0 1rem 0", color: "#0f172a" }}>Register Business Profile</h3>
          <p style={{ color: "#64748b", margin: "0 0 2rem 0", lineHeight: "1.6" }}>Create your verified profile to participate in the marketplace and unlock matchmaking features.</p>
          <div style={{ color: "#2563eb", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>Start Registration &rarr;</div>
        </div>

        <div style={{ background: "#ffffff", padding: "2.5rem", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", cursor: "pointer", border: "1px solid #e2e8f0" }} onClick={() => handleModeChange("browse")}>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", width: "64px", height: "64px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
            <Radar style={{ color: "#10b981", width: "32px", height: "32px" }} />
          </div>
          <h3 style={{ fontSize: "1.5rem", margin: "0 0 1rem 0", color: "#0f172a" }}>Browse Active RFSs</h3>
          <p style={{ color: "#64748b", margin: "0 0 2rem 0", lineHeight: "1.6" }}>Explore current market demand and requests for services from verified buyers in read-only mode.</p>
          <div style={{ color: "#10b981", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>View Opportunities &rarr;</div>
        </div>

        <div style={{ background: "#ffffff", padding: "2.5rem", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <div style={{ background: "rgba(245, 158, 11, 0.1)", width: "64px", height: "64px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
          </div>
          <h3 style={{ fontSize: "1.5rem", margin: "0 0 1rem 0", color: "#0f172a" }}>Matchmaking Guide</h3>
          <p style={{ color: "#64748b", margin: "0 0 2rem 0", lineHeight: "1.6" }}>Learn how our platform works, how to optimize your profile, and best practices for securing deals.</p>
          <button style={{ padding: "0.625rem", width: "100%", background: "transparent", border: "1px solid #f59e0b", color: "#f59e0b", borderRadius: "6px", fontWeight: 500, cursor: "pointer" }}>Read Guide</button>
        </div>
      </div>
    </section>
  );
};
