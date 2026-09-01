import { useState, useEffect } from "react";
import { apiRequest } from "../../../api/client";
import { RegionDistrictSelect } from "../RegionDistrictSelect";
import { TaxonomyResponse, Business, Rfs } from "./types";

type CreateRfsPaneProps = {
  token: string;
  myBusiness: Business;
  taxonomy: TaxonomyResponse | null;
  onCreated: () => void;
  setNotice: (type: "success" | "error", msg: string) => void;
  editingRfs?: Rfs | null;
};

export const CreateRfsPane = ({ token, myBusiness, taxonomy, onCreated, setNotice, editingRfs }: CreateRfsPaneProps) => {
  const [loading, setLoading] = useState(false);
  const [openAfterCreate, setOpenAfterCreate] = useState(true);

  const serviceTypes = Array.isArray(taxonomy?.service_types) ? taxonomy.service_types : [];
  const categories = Array.isArray(taxonomy?.categories) ? taxonomy.categories : [];

  // Categories that count as "technology" for the purposes of RFS filtering.
  // A business registered under the TECHNOLOGY industry only sees these when
  // creating an RFS, instead of every category on the platform.
  const TECH_CATEGORY_NAMES = ["Technology & IT", "Software Development", "Software Products"];
  const techCategoryIds = new Set(
    categories.filter((c) => TECH_CATEGORY_NAMES.includes(c.name)).map((c) => c.id)
  );
  const isTechBusiness = myBusiness.verification?.industry_type === "TECHNOLOGY";
  const visibleServiceTypes =
    isTechBusiness && techCategoryIds.size > 0
      ? serviceTypes.filter((t) => techCategoryIds.has(t.category_id))
      : serviceTypes;

  const [rfsForm, setRfsForm] = useState({
    title: "",
    description: "",
    service_type_id: "",
    project_size: "MEDIUM",
    expertise_level: "INTERMEDIATE",
    min_budget: "",
    max_budget: "",
    start_date: "",
    deadline: "",
    region: "",
    district: ""
  });

  useEffect(() => {
    if (editingRfs) {
      setRfsForm({
        title: editingRfs.title,
        description: editingRfs.description,
        service_type_id: editingRfs.service_type_id,
        project_size: editingRfs.project_size,
        expertise_level: editingRfs.expertise_level,
        min_budget: String(editingRfs.constraint?.min_budget || ""),
        max_budget: String(editingRfs.constraint?.max_budget || ""),
        start_date: editingRfs.constraint?.start_date || "",
        deadline: editingRfs.constraint?.deadline || "",
        region: editingRfs.constraint?.region || "",
        district: editingRfs.constraint?.district || ""
      });
      setOpenAfterCreate(false);
    } else {
      setRfsForm(prev => ({ ...prev, service_type_id: visibleServiceTypes[0]?.id || "" }));
    }
  }, [editingRfs, visibleServiceTypes.length]);

  const toNumberOrNull = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleCreateRfs = async () => {
    if (!rfsForm.service_type_id) {
      setNotice("error", "Select a service type before creating the RFS.");
      return;
    }

    setLoading(true);
    try {
      const constraints = {
        min_budget: toNumberOrNull(rfsForm.min_budget),
        max_budget: toNumberOrNull(rfsForm.max_budget),
        start_date: rfsForm.start_date || null,
        deadline: rfsForm.deadline || null,
        region: rfsForm.region.trim() || null,
        district: rfsForm.district.trim() || null
      };

      const hasConstraints = Object.values(constraints).some((value) => value !== null && value !== "");

      const payload = {
        buyer_id: myBusiness.id,
        title: rfsForm.title,
        description: rfsForm.description,
        service_type_id: rfsForm.service_type_id,
        project_size: rfsForm.project_size,
        expertise_level: rfsForm.expertise_level,
        ...(hasConstraints ? { constraints } : {})
      };

      const endpoint = editingRfs ? `/rfs/${editingRfs.id}` : "/rfs";
      const method = editingRfs ? "PATCH" : "POST";
      const result = await apiRequest<{ id: string }>(endpoint, { method, token, body: payload });
      const rfsId = editingRfs ? editingRfs.id : result.id;

      if (openAfterCreate && rfsId) {
        if (!hasConstraints) {
          setNotice("error", "Add at least one constraint to open the RFS immediately.");
        } else {
          await apiRequest(`/rfs/${rfsId}/open`, { method: "POST", token });
        }
      }

      setNotice("success", editingRfs ? "RFS updated successfully." : "RFS created successfully.");
      onCreated();
    } catch (err) {
      setNotice("error", "Failed to create RFS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: "2rem", maxWidth: "800px" }}>
      <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem", color: "#0f172a" }}>
        {editingRfs ? "Edit Request (RFS)" : "Request a Service (RFS)"}
      </h2>
      
      <div style={{ display: "grid", gap: "1.5rem" }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Project Title</label>
          <input className="form-control" value={rfsForm.title} onChange={e => setRfsForm({...rfsForm, title: e.target.value})} placeholder="e.g. Needs software development" />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Description</label>
          <textarea className="form-control" rows={3} value={rfsForm.description} onChange={e => setRfsForm({...rfsForm, description: e.target.value})} placeholder="Provide details about your requirements..." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>
              Service Category
              {isTechBusiness && (
                <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 400, color: '#2563eb' }}>
                  (showing Technology categories only)
                </span>
              )}
            </label>
            <select className="form-control" value={rfsForm.service_type_id} onChange={e => setRfsForm({...rfsForm, service_type_id: e.target.value})}>
              <option value="">Select Category...</option>
              {visibleServiceTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Project Size</label>
            <select className="form-control" value={rfsForm.project_size} onChange={e => setRfsForm({...rfsForm, project_size: e.target.value})}>
              <option value="SMALL">Small</option>
              <option value="MEDIUM">Medium</option>
              <option value="LARGE">Large</option>
            </select>
          </div>
        </div>

        <h3 style={{ fontSize: "1rem", color: "#334155", margin: "1rem 0 0.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>Constraints (Used for Matching)</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Min Budget (TZS)</label>
            <input className="form-control" type="number" value={rfsForm.min_budget} onChange={e => setRfsForm({...rfsForm, min_budget: e.target.value})} placeholder="e.g. 1000000" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Max Budget (TZS)</label>
            <input className="form-control" type="number" value={rfsForm.max_budget} onChange={e => setRfsForm({...rfsForm, max_budget: e.target.value})} placeholder="e.g. 5000000" />
          </div>
        </div>

        <RegionDistrictSelect
          region={rfsForm.region}
          district={rfsForm.district}
          onRegionChange={(region) => setRfsForm({ ...rfsForm, region, district: "" })}
          onDistrictChange={(district) => setRfsForm({ ...rfsForm, district })}
          required={false}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Start Date</label>
            <input className="form-control" type="date" value={rfsForm.start_date} onChange={e => setRfsForm({...rfsForm, start_date: e.target.value})} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Deadline</label>
            <input className="form-control" type="date" value={rfsForm.deadline} onChange={e => setRfsForm({...rfsForm, deadline: e.target.value})} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}>
          <input 
            type="checkbox" 
            id="openAfterCreate" 
            checked={openAfterCreate} 
            onChange={(e) => setOpenAfterCreate(e.target.checked)} 
            style={{ width: "16px", height: "16px", accentColor: "#2563eb" }}
          />
          <label htmlFor="openAfterCreate" style={{ fontSize: "0.875rem", color: "#334155", cursor: "pointer" }}>
            Open to market immediately (Requires constraints)
          </label>
        </div>

        <button 
          className="button" 
          style={{ background: "#2563eb", color: "white", padding: "0.75rem 1.5rem", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "1rem", fontWeight: 500, marginTop: "1rem" }}
          onClick={handleCreateRfs} 
          disabled={loading}
        >
          {loading ? "Saving..." : (editingRfs ? "Save Changes" : "Publish RFS")}
        </button>
      </div>
    </div>
  );
};