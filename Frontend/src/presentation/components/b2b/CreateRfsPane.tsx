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
  const [loading, setLoading] = useState<"draft" | "publish" | null>(null);

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
    } else {
      setRfsForm(prev => ({ ...prev, service_type_id: visibleServiceTypes[0]?.id || "" }));
    }
  }, [editingRfs, visibleServiceTypes.length]);

  const toNumberOrNull = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleSubmit = async (publishNow: boolean) => {
    if (!rfsForm.service_type_id) {
      setNotice("error", "Select a service type before creating the RFS.");
      return;
    }

    setLoading(publishNow ? "publish" : "draft");
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

      if (publishNow && rfsId) {
        if (!hasConstraints) {
          setNotice("error", "Add at least one constraint (budget, dates, or location) to publish immediately.");
          return;
        }
        await apiRequest(`/rfs/${rfsId}/open`, { method: "POST", token });
      }

      setNotice(
        "success",
        editingRfs ? "RFS updated successfully." : publishNow ? "RFS published and matching started." : "RFS saved as a draft."
      );
      onCreated();
    } catch (err) {
      setNotice("error", "Failed to save RFS.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: "640px" }}>
      <h1 style={{ fontSize: "1.9rem", fontWeight: 700, color: "#1d1d1f", margin: "0 0 0.35rem", letterSpacing: "-0.025em" }}>
        {editingRfs ? "Edit RFS" : "Create RFS"}
      </h1>
      <p style={{ color: "#86868b", fontSize: "0.95rem", margin: "0 0 2rem" }}>
        Describe what you need and we'll match you with sellers.
      </p>

      <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)", padding: "2rem" }}>

        <p className="rfs-section-label">Project Details</p>

        <div style={{ marginBottom: "1.25rem" }}>
          <label className="rfs-field-label">Project Title</label>
          <input
            className="rfs-input"
            value={rfsForm.title}
            onChange={e => setRfsForm({ ...rfsForm, title: e.target.value })}
            placeholder="e.g. Needs software development"
          />
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label className="rfs-field-label">Description</label>
          <textarea
            className="rfs-input"
            rows={3}
            style={{ resize: "none" }}
            value={rfsForm.description}
            onChange={e => setRfsForm({ ...rfsForm, description: e.target.value })}
            placeholder="Provide details about your requirements..."
          />
        </div>

        <div className="rfs-two-col" style={{ marginBottom: "2rem" }}>
          <div>
            <label className="rfs-field-label">Service Category</label>
            <select className="rfs-input" value={rfsForm.service_type_id} onChange={e => setRfsForm({ ...rfsForm, service_type_id: e.target.value })}>
              <option value="">Select Category...</option>
              {visibleServiceTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="rfs-field-label">Project Size</label>
            <select className="rfs-input" value={rfsForm.project_size} onChange={e => setRfsForm({ ...rfsForm, project_size: e.target.value })}>
              <option value="SMALL">Small</option>
              <option value="MEDIUM">Medium</option>
              <option value="LARGE">Large</option>
            </select>
          </div>
        </div>

        <p className="rfs-section-label">Budget &amp; Location</p>

        <div className="rfs-two-col" style={{ marginBottom: "1.25rem" }}>
          <div>
            <label className="rfs-field-label">Min Budget (TZS)</label>
            <input className="rfs-input" type="number" value={rfsForm.min_budget} onChange={e => setRfsForm({ ...rfsForm, min_budget: e.target.value })} placeholder="e.g. 1000000" />
          </div>
          <div>
            <label className="rfs-field-label">Max Budget (TZS)</label>
            <input className="rfs-input" type="number" value={rfsForm.max_budget} onChange={e => setRfsForm({ ...rfsForm, max_budget: e.target.value })} placeholder="e.g. 5000000" />
          </div>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <RegionDistrictSelect
            region={rfsForm.region}
            district={rfsForm.district}
            onRegionChange={(region) => setRfsForm({ ...rfsForm, region, district: "" })}
            onDistrictChange={(district) => setRfsForm({ ...rfsForm, district })}
            required={false}
            className="rfs-two-col"
            selectClassName="rfs-input"
          />
        </div>

        <p className="rfs-section-label">Timeline</p>

        <div className="rfs-two-col" style={{ marginBottom: "2rem" }}>
          <div>
            <label className="rfs-field-label">Start Date</label>
            <input className="rfs-input" type="date" value={rfsForm.start_date} onChange={e => setRfsForm({ ...rfsForm, start_date: e.target.value })} />
          </div>
          <div>
            <label className="rfs-field-label">Deadline</label>
            <input className="rfs-input" type="date" value={rfsForm.deadline} onChange={e => setRfsForm({ ...rfsForm, deadline: e.target.value })} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading !== null}
            style={{ flex: 1, padding: "0.85rem", borderRadius: "12px", border: "1px solid #d2d2d7", background: "#fff", color: "#1d1d1f", fontWeight: 600, fontSize: "0.9rem", cursor: loading !== null ? "default" : "pointer" }}
          >
            {loading === "draft" ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading !== null}
            style={{ flex: 1.4, padding: "0.85rem", borderRadius: "12px", border: "none", background: "#3c5eab", color: "#fff", fontWeight: 600, fontSize: "0.9rem", cursor: loading !== null ? "default" : "pointer" }}
          >
            {loading === "publish" ? "Publishing..." : "Publish Now"}
          </button>
        </div>
      </div>
    </div>
  );
};