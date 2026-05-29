import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api/client";
import { Layers, Menu, Radar } from "lucide-react";

type BusinessViewProps = {
  token: string;
  user: { name: string; email: string };
  isBuyer: boolean;
  isSeller: boolean;
  setNotice: (type: "success" | "error", msg: string) => void;
};

type Rfs = {
  id: string;
  title: string;
  status: string;
  buyer_id: string;
  service_type_id: string;
  description?: string;
  project_size?: string;
  expertise_level?: string;
  preference?: {
    cost_weight?: number | null;
    quality_weight?: number | null;
    speed_weight?: number | null;
    experience_weight?: number | null;
    location_weight?: number | null;
  } | null;
  attributes?: Array<{ id?: string; attribute_id: string; value: string }>;
  constraint?: {
    min_budget?: number | null;
    max_budget?: number | null;
    start_date?: string | null;
    deadline?: string | null;
    region?: string | null;
    district?: string | null;
  } | null;
};

type BusinessVerification = {
  tin_number: string;
  brela_number: string;
  business_size: string;
  is_owner: boolean;
  owner_gender: string;
  employee_count: number;
  revenue_range: string;
  region: string;
  district: string;
  address: string;
  verification_status: string;
};

type BusinessCapabilityAttribute = {
  attribute_id: string;
  value: string;
};

type BusinessCapability = {
  id?: string;
  service_type_id: string;
  attributes: BusinessCapabilityAttribute[];
};

type Business = {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email: string;
  verification?: BusinessVerification | null;
  capabilities?: BusinessCapability[];
};

type ServiceType = {
  id: string;
  name: string;
  category_id: string;
  is_active: boolean;
};

type TaxonomyResponse = {
  categories?: unknown[];
  service_types?: unknown[];
  attributes?: unknown[];
};

type ServiceAttribute = {
  id: string;
  service_type_id: string;
  name: string;
};

type MatchCandidate = {
  id?: string | null;
  seller_id: string;
  score: number;
  rank: number;
};

type MatchShortlist = {
  id: string;
  rfs_id: string;
  created_at: string;
  candidates: MatchCandidate[];
};

type EngagementSession = {
  id: string;
  rfs_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  created_at: string;
};

export const BusinessView = ({ token, user, isBuyer, isSeller, setNotice }: BusinessViewProps) => {
  const [loading, setLoading] = useState(false);
  const [rfsList, setRfsList] = useState<Rfs[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [taxonomy, setTaxonomy] = useState<TaxonomyResponse | null>(null);
  const [myBusiness, setMyBusiness] = useState<Business | null>(null);
  const [openAfterCreate, setOpenAfterCreate] = useState(true);
  const [selectedRfs, setSelectedRfs] = useState<Rfs | null>(null);
  const [shortlist, setShortlist] = useState<MatchShortlist | null>(null);
  const [sellerEngagements, setSellerEngagements] = useState<EngagementSession[]>([]);
  const [buyerEngagements, setBuyerEngagements] = useState<EngagementSession[]>([]);
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
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
    verification_status: "UNVERIFIED"
  });
  const [verificationForm, setVerificationForm] = useState({
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
    verification_status: "UNVERIFIED"
  });
  const [capabilitiesDraft, setCapabilitiesDraft] = useState<BusinessCapability[]>([]);
  const [capabilityForm, setCapabilityForm] = useState({
    service_type_id: "",
    attributes: [] as BusinessCapabilityAttribute[]
  });
  const [capabilityAttributeDraft, setCapabilityAttributeDraft] = useState({
    attribute_id: "",
    value: ""
  });
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    project_size: "MEDIUM",
    expertise_level: "INTERMEDIATE",
    min_budget: "",
    max_budget: "",
    start_date: "",
    deadline: "",
    region: "",
    district: ""
  });
  const [activePane, setActivePane] = useState("rfs");
  const [isPaneMenuOpen, setIsPaneMenuOpen] = useState(false);

  const [rfsForm, setRfsForm] = useState({
    buyer_id: "",
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [biz, rfs, tax] = await Promise.all([
        apiRequest<Business[]>("/businesses", { token }),
        apiRequest<Rfs[]>("/rfs", { token }),
        apiRequest<TaxonomyResponse>("/taxonomy", { token })
      ]);
      setBusinesses(Array.isArray(biz) ? biz : []);
      setRfsList(Array.isArray(rfs) ? rfs : []);
      setTaxonomy(tax && typeof tax === "object" ? tax : null);

      const found = biz.find((business) => business.email === user.email || business.name === user.name);
      if (found) {
        setMyBusiness(found);
        setRfsForm(prev => ({ ...prev, buyer_id: found.id }));
      }
    } catch (err) {
      setNotice("error", "Failed to load Business Workspace");
    } finally {
      setLoading(false);
    }
  };

  const loadEngagementsForSeller = async (sellerId: string) => {
    try {
      const sessions = await apiRequest<EngagementSession[]>(
        `/engagement-sessions?seller_id=${sellerId}`,
        { token }
      );
      setSellerEngagements(Array.isArray(sessions) ? sessions : []);
    } catch (err) {
      setNotice("error", "Failed to load engagement sessions.");
    }
  };

  const loadEngagementsForBuyer = async (buyerId: string) => {
    try {
      const sessions = await apiRequest<EngagementSession[]>(
        `/engagement-sessions?buyer_id=${buyerId}`,
        { token }
      );
      setBuyerEngagements(Array.isArray(sessions) ? sessions : []);
    } catch (err) {
      setNotice("error", "Failed to load engagement sessions.");
    }
  };


  useEffect(() => { loadData(); }, [token]);

  useEffect(() => {
    if (!myBusiness?.id) return;
    loadEngagementsForSeller(myBusiness.id);
    loadEngagementsForBuyer(myBusiness.id);
  }, [myBusiness?.id]);


  const serviceTypes = Array.isArray(taxonomy?.service_types)
    ? (taxonomy?.service_types as ServiceType[])
    : [];
  const serviceAttributes = Array.isArray(taxonomy?.attributes)
    ? (taxonomy?.attributes as ServiceAttribute[])
    : [];
  const serviceTypeMap = useMemo(
    () => new Map(serviceTypes.map((type) => [type.id, type.name])),
    [serviceTypes]
  );
  const attributeMap = useMemo(
    () => new Map(serviceAttributes.map((attribute) => [attribute.id, attribute.name])),
    [serviceAttributes]
  );
  const paneItems = [
    { id: "rfs", label: "RFS workflow" },
    { id: "shortlist", label: "Shortlist" },
    { id: "engagements", label: "Engagements" },
    { id: "profile", label: "Business profile" },
    { id: "verification", label: "Verification" },
    { id: "capabilities", label: "Capabilities" },
  ];

  const businessMap = useMemo(
    () => new Map(businesses.map((business) => [business.id, business.name])),
    [businesses]
  );

  const businessSizes = ["SMALL", "MEDIUM", "LARGE"];
  const ownerGenders = ["MALE", "FEMALE"];
  const revenueRanges = ["BELOW_50M", "BETWEEN_50M_500M", "BETWEEN_500M_5B", "ABOVE_5B"];
  const verificationStatuses = ["UNVERIFIED", "PARTIALLY_VERIFIED", "VERIFIED"];

  useEffect(() => {
    if (!rfsForm.service_type_id && serviceTypes.length > 0) {
      setRfsForm((prev) => ({ ...prev, service_type_id: serviceTypes[0].id }));
    }
    if (!capabilityForm.service_type_id && serviceTypes.length > 0) {
      setCapabilityForm((prev) => ({ ...prev, service_type_id: serviceTypes[0].id }));
    }
  }, [rfsForm.service_type_id, capabilityForm.service_type_id, serviceTypes]);

  useEffect(() => {
    if (!myBusiness) return;

    setRegistrationForm((prev) => ({
      ...prev,
      name: myBusiness.name ?? prev.name,
      contact_person: myBusiness.contact_person ?? prev.contact_person,
      phone: myBusiness.phone ?? prev.phone,
      email: myBusiness.email ?? prev.email
    }));

    if (myBusiness.verification) {
      setVerificationForm({
        tin_number: myBusiness.verification.tin_number,
        brela_number: myBusiness.verification.brela_number,
        business_size: myBusiness.verification.business_size,
        is_owner: myBusiness.verification.is_owner,
        owner_gender: myBusiness.verification.owner_gender,
        employee_count: String(myBusiness.verification.employee_count),
        revenue_range: myBusiness.verification.revenue_range,
        region: myBusiness.verification.region,
        district: myBusiness.verification.district,
        address: myBusiness.verification.address,
        verification_status: myBusiness.verification.verification_status
      });
    }
  }, [myBusiness]);

  const toNumberOrNull = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const toIntOrNull = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  };


  const handleRegisterBusiness = async () => {
    setLoading(true);
    try {
      const payload = {
        ...registrationForm,
        employee_count: toIntOrNull(registrationForm.employee_count) ?? 0,
        capabilities: capabilitiesDraft,
      };
      await apiRequest("/businesses", { method: "POST", token, body: payload });
      setNotice("success", "Business registered successfully.");
      loadData();
    } catch (err) {
      setNotice("error", "Failed to register business.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!myBusiness?.id) {
      setNotice("error", "Business profile not found.");
      return;
    }

    setLoading(true);
    try {
      await apiRequest(`/businesses/${myBusiness.id}`, {
        method: "PATCH",
        token,
        body: {
          name: registrationForm.name,
          contact_person: registrationForm.contact_person,
          phone: registrationForm.phone,
          email: registrationForm.email,
        },
      });
      setNotice("success", "Business profile updated.");
      loadData();
    } catch (err) {
      setNotice("error", "Failed to update business profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVerification = async () => {
    if (!myBusiness?.id) {
      setNotice("error", "Business profile not found.");
      return;
    }

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
      loadData();
    } catch (err) {
      setNotice("error", "Failed to update verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCapabilityAttribute = () => {
    if (!capabilityAttributeDraft.attribute_id || !capabilityAttributeDraft.value.trim()) {
      return;
    }

    setCapabilityForm((prev) => ({
      ...prev,
      attributes: [...prev.attributes, capabilityAttributeDraft],
    }));
    setCapabilityAttributeDraft({ attribute_id: "", value: "" });
  };

  const handleAddCapability = () => {
    if (!capabilityForm.service_type_id) return;
    setCapabilitiesDraft((prev) => [...prev, capabilityForm]);
    setCapabilityForm({ service_type_id: capabilityForm.service_type_id, attributes: [] });
  };

  const handleSaveCapabilities = async () => {
    if (!myBusiness?.id) {
      setNotice("error", "Business profile not found.");
      return;
    }
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
      loadData();
    } catch (err) {
      setNotice("error", "Failed to update capabilities.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRfs = async () => {
    if (!rfsForm.buyer_id || !rfsForm.service_type_id) {
      setNotice("error", "Select a buyer and service type before creating the RFS.");
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
        buyer_id: rfsForm.buyer_id,
        title: rfsForm.title,
        description: rfsForm.description,
        service_type_id: rfsForm.service_type_id,
        project_size: rfsForm.project_size,
        expertise_level: rfsForm.expertise_level,
        ...(hasConstraints ? { constraints } : {})
      };

      const created = await apiRequest<Rfs>("/rfs", { method: "POST", token, body: payload });

      if (openAfterCreate) {
        if (!hasConstraints) {
          setNotice("error", "Add at least one constraint to open the RFS immediately.");
        } else {
          await apiRequest(`/rfs/${created.id}/open`, { method: "POST", token });
        }
      }

      setNotice("success", "RFS created successfully.");
      loadData();
    } catch (err) {
      setNotice("error", "Failed to create RFS.");
    } finally {
      setLoading(false);
    }
  };

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
      loadData();
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
      setEditForm({
        title: details.title ?? "",
        description: details.description ?? "",
        project_size: details.project_size ?? "MEDIUM",
        expertise_level: details.expertise_level ?? "INTERMEDIATE",
        min_budget: details.constraint?.min_budget?.toString() ?? "",
        max_budget: details.constraint?.max_budget?.toString() ?? "",
        start_date: details.constraint?.start_date ?? "",
        deadline: details.constraint?.deadline ?? "",
        region: details.constraint?.region ?? "",
        district: details.constraint?.district ?? ""
      });
    } catch (err) {
      setNotice("error", "Failed to load RFS details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRfs = async () => {
    if (!selectedRfs) return;

    const constraints = {
      min_budget: toNumberOrNull(editForm.min_budget),
      max_budget: toNumberOrNull(editForm.max_budget),
      start_date: editForm.start_date || null,
      deadline: editForm.deadline || null,
      region: editForm.region.trim() || null,
      district: editForm.district.trim() || null
    };

    const hasConstraints = Object.values(constraints).some((value) => value !== null && value !== "");

    const payload = {
      title: editForm.title,
      description: editForm.description,
      project_size: editForm.project_size,
      expertise_level: editForm.expertise_level,
      ...(hasConstraints ? { constraints } : {})
    };

    setLoading(true);
    try {
      await apiRequest(`/rfs/${selectedRfs.id}`, { method: "PATCH", token, body: payload });
      setNotice("success", "RFS updated successfully.");
      setSelectedRfs(null);
      loadData();
    } catch (err) {
      setNotice("error", "Failed to update RFS.");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateEngagement = async (sellerId: string) => {
    if (!shortlist?.rfs_id || !myBusiness?.id) {
      setNotice("error", "Select a buyer business before initiating engagement.");
      return;
    }

    const rfs = rfsList.find((item) => item.id === shortlist.rfs_id);
    if (!rfs || rfs.buyer_id !== myBusiness.id) {
      setNotice("error", "Only the RFS owner can initiate engagement sessions.");
      return;
    }

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
      loadData();
      if (myBusiness?.id) {
        loadEngagementsForSeller(myBusiness.id);
        loadEngagementsForBuyer(myBusiness.id);
      }
    } catch (err) {
      setNotice("error", "Failed to create engagement session.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptEngagement = async (sessionId: string) => {
    setLoading(true);
    try {
      await apiRequest(`/engagement-sessions/${sessionId}/accept`, { method: "POST", token });
      setNotice("success", "Engagement accepted.");
      if (myBusiness?.id) {
        loadEngagementsForSeller(myBusiness.id);
        loadEngagementsForBuyer(myBusiness.id);
      }
    } catch (err) {
      setNotice("error", "Failed to accept engagement.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectEngagement = async (sessionId: string) => {
    setLoading(true);
    try {
      await apiRequest(`/engagement-sessions/${sessionId}/reject`, { method: "POST", token });
      setNotice("success", "Engagement rejected.");
      if (myBusiness?.id) {
        loadEngagementsForSeller(myBusiness.id);
        loadEngagementsForBuyer(myBusiness.id);
      }
    } catch (err) {
      setNotice("error", "Failed to reject engagement.");
    } finally {
      setLoading(false);
    }
  };

  const getEngagementSummary = (rfsId: string) => {
    const matches = buyerEngagements.filter((session) => session.rfs_id === rfsId);
    const accepted = matches.filter((session) => session.status === "ACCEPTED").length;
    const rejected = matches.filter((session) => session.status === "REJECTED").length;
    const initiated = matches.filter((session) => session.status === "INITIATED").length;
    const pending = matches.length - accepted - rejected - initiated;
    return { total: matches.length, accepted, rejected, initiated, pending };
  };

  return (
    <section className="page-section">
      <div className="section-head">
        <div className="section-title">
          <Radar className="icon" />
          <div>
            <h2>Matching workspace</h2>
            <p>Publish RFS requests, review shortlists, and manage engagements.</p>
          </div>
        </div>
        <div className="section-actions">
          {loading && <span className="pill">Syncing...</span>}
          <button
            className="menu-trigger"
            type="button"
            onClick={() => setIsPaneMenuOpen((open) => !open)}
            aria-label="Toggle sections"
          >
            <Menu className="icon" />
          </button>
        </div>
      </div>
      <div className="workspace-layout">
        <button
          className={`drawer-overlay workspace-overlay ${isPaneMenuOpen ? "is-active" : ""}`}
          type="button"
          aria-label="Close sections"
          onClick={() => setIsPaneMenuOpen(false)}
        />
        <aside className={`workspace-sidebar ${isPaneMenuOpen ? "is-open" : ""}`}>
          <div className="sidebar-header">
            <span className="sidebar-header__label">Workspace menu</span>
            <span className="sidebar-header__hint">Navigate business operations</span>
          </div>
          <div className="sidebar-links">
            {paneItems.map((pane) => (
              <button
                key={pane.id}
                className={`workspace-link ${activePane === pane.id ? "active" : ""}`}
                type="button"
                onClick={() => {
                  setActivePane(pane.id);
                  setIsPaneMenuOpen(false);
                }}
              >
                {pane.label}
              </button>
            ))}
          </div>
        </aside>
        <div className="workspace-main">
          {activePane === "profile" && (
            <div className="surface">
              <h3>Business profile</h3>
              <div className="form-grid">
                <label className="field">
                  <span>Business name</span>
                  <input
                    className="input"
                    value={registrationForm.name}
                    onChange={(event) => setRegistrationForm({ ...registrationForm, name: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Contact person</span>
                  <input
                    className="input"
                    value={registrationForm.contact_person}
                    onChange={(event) => setRegistrationForm({ ...registrationForm, contact_person: event.target.value })}
                  />
                </label>
                <div className="grid-2">
                  <label className="field">
                    <span>Phone number</span>
                    <input
                      className="input"
                      value={registrationForm.phone}
                      onChange={(event) => setRegistrationForm({ ...registrationForm, phone: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Email</span>
                    <input
                      className="input"
                      type="email"
                      value={registrationForm.email}
                      onChange={(event) => setRegistrationForm({ ...registrationForm, email: event.target.value })}
                    />
                  </label>
                </div>
                <button
                  className="button"
                  type="button"
                  onClick={handleUpdateProfile}
                  disabled={loading || !myBusiness}
                >
                  Update profile
                </button>
              </div>
            </div>
          )}

          {activePane === "verification" && (
            <div className="surface">
              <h3>Verification details</h3>
              <div className="form-grid">
                <label className="field">
                  <span>TIN number</span>
                  <input
                    className="input"
                    value={verificationForm.tin_number}
                    onChange={(event) => setVerificationForm({ ...verificationForm, tin_number: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>BRELA number</span>
                  <input
                    className="input"
                    value={verificationForm.brela_number}
                    onChange={(event) => setVerificationForm({ ...verificationForm, brela_number: event.target.value })}
                  />
                </label>
                <div className="grid-2">
                  <label className="field">
                    <span>Business size</span>
                    <select
                      className="input"
                      value={verificationForm.business_size}
                      onChange={(event) => setVerificationForm({ ...verificationForm, business_size: event.target.value })}
                    >
                      {businessSizes.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Owner gender</span>
                    <select
                      className="input"
                      value={verificationForm.owner_gender}
                      onChange={(event) => setVerificationForm({ ...verificationForm, owner_gender: event.target.value })}
                    >
                      {ownerGenders.map((gender) => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid-2">
                  <label className="field">
                    <span>Revenue range</span>
                    <select
                      className="input"
                      value={verificationForm.revenue_range}
                      onChange={(event) => setVerificationForm({ ...verificationForm, revenue_range: event.target.value })}
                    >
                      {revenueRanges.map((range) => (
                        <option key={range} value={range}>{range.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Verification status</span>
                    <select
                      className="input"
                      value={verificationForm.verification_status}
                      onChange={(event) => setVerificationForm({ ...verificationForm, verification_status: event.target.value })}
                    >
                      {verificationStatuses.map((status) => (
                        <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid-2">
                  <label className="field">
                    <span>Employee count</span>
                    <input
                      className="input"
                      value={verificationForm.employee_count}
                      onChange={(event) => setVerificationForm({ ...verificationForm, employee_count: event.target.value })}
                    />
                  </label>
                  <label className="field-inline">
                    <input
                      type="checkbox"
                      checked={verificationForm.is_owner}
                      onChange={(event) => setVerificationForm({ ...verificationForm, is_owner: event.target.checked })}
                    />
                    Owner registered
                  </label>
                </div>
                <div className="grid-2">
                  <label className="field">
                    <span>Region</span>
                    <input
                      className="input"
                      value={verificationForm.region}
                      onChange={(event) => setVerificationForm({ ...verificationForm, region: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>District</span>
                    <input
                      className="input"
                      value={verificationForm.district}
                      onChange={(event) => setVerificationForm({ ...verificationForm, district: event.target.value })}
                    />
                  </label>
                </div>
                <label className="field">
                  <span>Address</span>
                  <input
                    className="input"
                    value={verificationForm.address}
                    onChange={(event) => setVerificationForm({ ...verificationForm, address: event.target.value })}
                  />
                </label>
                <button
                  className="button"
                  type="button"
                  onClick={handleUpdateVerification}
                  disabled={loading || !myBusiness}
                >
                  Update verification
                </button>
              </div>
            </div>
          )}

          {activePane === "capabilities" && (
            <div className="surface surface--alt">
              <h3>Capability declaration</h3>
              <div className="form-grid">
                <label className="field">
                  <span>Service type</span>
                  <select
                    className="input"
                    value={capabilityForm.service_type_id}
                    onChange={(event) => setCapabilityForm({ ...capabilityForm, service_type_id: event.target.value })}
                  >
                    <option value="">Select service type</option>
                    {serviceTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </label>
                <div className="grid-2">
                  <label className="field">
                    <span>Capability attribute</span>
                    <select
                      className="input"
                      value={capabilityAttributeDraft.attribute_id}
                      onChange={(event) => setCapabilityAttributeDraft({ ...capabilityAttributeDraft, attribute_id: event.target.value })}
                    >
                      <option value="">Select attribute</option>
                      {serviceAttributes
                        .filter((attribute) => attribute.service_type_id === capabilityForm.service_type_id)
                        .map((attribute) => (
                          <option key={attribute.id} value={attribute.id}>{attribute.name}</option>
                        ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Attribute value</span>
                    <input
                      className="input"
                      value={capabilityAttributeDraft.value}
                      onChange={(event) => setCapabilityAttributeDraft({ ...capabilityAttributeDraft, value: event.target.value })}
                    />
                  </label>
                </div>
                <div className="grid-2">
                  <button className="button button--ghost" type="button" onClick={handleAddCapabilityAttribute}>
                    Add attribute
                  </button>
                  <button className="button" type="button" onClick={handleAddCapability}>
                    Add capability
                  </button>
                </div>
                {capabilityForm.attributes.length > 0 && (
                  <div className="surface">
                    <h4>Draft attributes</h4>
                    <ul>
                      {capabilityForm.attributes.map((attribute, index) => (
                        <li key={`${attribute.attribute_id}-${index}`}>
                          {attributeMap.get(attribute.attribute_id) ?? attribute.attribute_id}: {attribute.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {capabilitiesDraft.length > 0 && (
                  <div className="surface">
                    <h4>Capabilities to save</h4>
                    <ul>
                      {capabilitiesDraft.map((capability, index) => (
                        <li key={`${capability.service_type_id}-${index}`}>
                          {serviceTypeMap.get(capability.service_type_id) ?? capability.service_type_id}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button className="button" type="button" onClick={handleSaveCapabilities} disabled={loading || !myBusiness}>
                  Save capabilities
                </button>
              </div>
            </div>
          )}

          {activePane === "rfs" && (
            <>
              <div className="grid-2">
                <div className="surface">
                  <h3>Create RFS (Initiator: {myBusiness?.name || "Self"})</h3>
                  <p className="muted">Define the project size and expertise the vendor must have.</p>
                  <div className="form-grid">
                    <label className="field">
                      <span>Service type</span>
                      <select
                        className="input"
                        value={rfsForm.service_type_id}
                        onChange={(e) => setRfsForm({ ...rfsForm, service_type_id: e.target.value })}
                      >
                        <option value="">Select service type</option>
                        {serviceTypes.map((type: any) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>RFS title</span>
                      <input
                        className="input"
                        value={rfsForm.title}
                        onChange={(e) => setRfsForm({ ...rfsForm, title: e.target.value })}
                      />
                    </label>
                    <label className="field">
                      <span>Description</span>
                      <input
                        className="input"
                        value={rfsForm.description}
                        onChange={(e) => setRfsForm({ ...rfsForm, description: e.target.value })}
                      />
                    </label>
                    <div className="grid-2">
                      <label className="field">
                        <span>Project size</span>
                        <select
                          className="input"
                          value={rfsForm.project_size}
                          onChange={(e) => setRfsForm({ ...rfsForm, project_size: e.target.value })}
                        >
                          <option value="SMALL">Small</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="LARGE">Large</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>Expertise level</span>
                        <select
                          className="input"
                          value={rfsForm.expertise_level}
                          onChange={(e) => setRfsForm({ ...rfsForm, expertise_level: e.target.value })}
                        >
                          <option value="BASIC">Basic</option>
                          <option value="INTERMEDIATE">Intermediate</option>
                          <option value="ADVANCED">Advanced</option>
                        </select>
                      </label>
                    </div>
                    <div className="grid-2">
                      <label className="field">
                        <span>Start date</span>
                        <input
                          className="input"
                          type="date"
                          value={rfsForm.start_date}
                          onChange={(e) => setRfsForm({ ...rfsForm, start_date: e.target.value })}
                        />
                      </label>
                      <label className="field">
                        <span>Deadline</span>
                        <input
                          className="input"
                          type="date"
                          value={rfsForm.deadline}
                          onChange={(e) => setRfsForm({ ...rfsForm, deadline: e.target.value })}
                        />
                      </label>
                    </div>
                    <div className="grid-2">
                      <label className="field">
                        <span>Minimum budget</span>
                        <input
                          className="input"
                          value={rfsForm.min_budget}
                          onChange={(e) => setRfsForm({ ...rfsForm, min_budget: e.target.value })}
                        />
                      </label>
                      <label className="field">
                        <span>Maximum budget</span>
                        <input
                          className="input"
                          value={rfsForm.max_budget}
                          onChange={(e) => setRfsForm({ ...rfsForm, max_budget: e.target.value })}
                        />
                      </label>
                    </div>
                    <div className="grid-2">
                      <label className="field">
                        <span>Region</span>
                        <input
                          className="input"
                          value={rfsForm.region}
                          onChange={(e) => setRfsForm({ ...rfsForm, region: e.target.value })}
                        />
                      </label>
                      <label className="field">
                        <span>District</span>
                        <input
                          className="input"
                          value={rfsForm.district}
                          onChange={(e) => setRfsForm({ ...rfsForm, district: e.target.value })}
                        />
                      </label>
                    </div>
                    <label className="field-inline">
                      <input
                        type="checkbox"
                        checked={openAfterCreate}
                        onChange={(event) => setOpenAfterCreate(event.target.checked)}
                      />
                      Open the RFS immediately after creation
                    </label>
                    <button
                      className="button"
                      onClick={handleCreateRfs}
                      disabled={loading || !rfsForm.service_type_id}
                    >
                      Create RFS
                    </button>
                  </div>
                </div>

                <div className="surface">
                  <h3>My Active RFS</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Type</th>
                        <th>Engagements</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfsList
                        .filter((rfs) => rfs.buyer_id === myBusiness?.id)
                        .map((rfs) => {
                          const summary = getEngagementSummary(rfs.id);
                          return (
                            <tr key={rfs.id}>
                              <td>{rfs.title}</td>
                              <td><span className="tag">{rfs.status}</span></td>
                              <td>{serviceTypeMap.get(rfs.service_type_id) || "N/A"}</td>
                              <td>
                                {summary.total === 0
                                  ? "No engagements"
                                  : `Accepted ${summary.accepted} · Rejected ${summary.rejected} · Pending ${summary.initiated + summary.pending}`}
                              </td>
                              <td>
                                <button
                                  className="button button--ghost"
                                  type="button"
                                  onClick={() => handleInspectRfs(rfs.id)}
                                  disabled={loading}
                                >
                                  View details
                                </button>
                                <button
                                  className="button button--ghost"
                                  type="button"
                                  onClick={() => handleOpenMatch(rfs.id, rfs.status)}
                                  disabled={loading}
                                >
                                  Open &amp; Match
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedRfs && (
                <div className="surface surface--alt">
                  <h3>RFS details</h3>
                  <div className="form-grid">
                    <label className="field">
                      <span>RFS title</span>
                      <input
                        className="input"
                        value={editForm.title}
                        onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
                      />
                    </label>
                    <label className="field">
                      <span>Description</span>
                      <input
                        className="input"
                        value={editForm.description}
                        onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                      />
                    </label>
                    <div className="grid-2">
                      <label className="field">
                        <span>Project size</span>
                        <select
                          className="input"
                          value={editForm.project_size}
                          onChange={(event) => setEditForm({ ...editForm, project_size: event.target.value })}
                        >
                          <option value="SMALL">Small</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="LARGE">Large</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>Expertise level</span>
                        <select
                          className="input"
                          value={editForm.expertise_level}
                          onChange={(event) => setEditForm({ ...editForm, expertise_level: event.target.value })}
                        >
                          <option value="BASIC">Basic</option>
                          <option value="INTERMEDIATE">Intermediate</option>
                          <option value="ADVANCED">Advanced</option>
                        </select>
                      </label>
                    </div>
                    <div className="grid-2">
                      <label className="field">
                        <span>Start date</span>
                        <input
                          className="input"
                          type="date"
                          value={editForm.start_date}
                          onChange={(event) => setEditForm({ ...editForm, start_date: event.target.value })}
                        />
                      </label>
                      <label className="field">
                        <span>Deadline</span>
                        <input
                          className="input"
                          type="date"
                          value={editForm.deadline}
                          onChange={(event) => setEditForm({ ...editForm, deadline: event.target.value })}
                        />
                      </label>
                    </div>
                    <div className="grid-2">
                      <label className="field">
                        <span>Minimum budget</span>
                        <input
                          className="input"
                          value={editForm.min_budget}
                          onChange={(event) => setEditForm({ ...editForm, min_budget: event.target.value })}
                        />
                      </label>
                      <label className="field">
                        <span>Maximum budget</span>
                        <input
                          className="input"
                          value={editForm.max_budget}
                          onChange={(event) => setEditForm({ ...editForm, max_budget: event.target.value })}
                        />
                      </label>
                    </div>
                    <div className="grid-2">
                      <label className="field">
                        <span>Region</span>
                        <input
                          className="input"
                          value={editForm.region}
                          onChange={(event) => setEditForm({ ...editForm, region: event.target.value })}
                        />
                      </label>
                      <label className="field">
                        <span>District</span>
                        <input
                          className="input"
                          value={editForm.district}
                          onChange={(event) => setEditForm({ ...editForm, district: event.target.value })}
                        />
                      </label>
                    </div>
                    <div className="grid-2">
                      <button className="button" type="button" onClick={handleUpdateRfs} disabled={loading}>
                        Save updates
                      </button>
                      <button className="button button--ghost" type="button" onClick={() => setSelectedRfs(null)}>
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activePane === "shortlist" && (
            shortlist ? (
              <div className="surface surface--alt">
                <h3>Shortlisted candidates</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Seller</th>
                      <th>Score</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortlist.candidates.map((candidate) => (
                      <tr key={`${shortlist.id}-${candidate.seller_id}`}>
                        <td>{candidate.rank}</td>
                        <td>{businessMap.get(candidate.seller_id) ?? candidate.seller_id}</td>
                        <td>{candidate.score.toFixed(2)}</td>
                        <td>
                          <button
                            className="button button--ghost"
                            type="button"
                            onClick={() => handleInitiateEngagement(candidate.seller_id)}
                            disabled={loading}
                          >
                            Initiate engagement
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="surface surface--alt">
                <h3>Shortlisted candidates</h3>
                <p className="muted">No shortlist generated yet.</p>
              </div>
            )
          )}

          {activePane === "engagements" && (
            myBusiness ? (
              <div className="surface surface--alt">
                <h3>Engagement requests</h3>
                {sellerEngagements.length === 0 ? (
                  <p className="muted">No engagement sessions yet.</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>RFS</th>
                        <th>Buyer</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellerEngagements.map((session) => (
                        <tr key={session.id}>
                          <td>{rfsList.find((rfs) => rfs.id === session.rfs_id)?.title ?? session.rfs_id}</td>
                          <td>{businessMap.get(session.buyer_id) ?? session.buyer_id}</td>
                          <td><span className="tag">{session.status}</span></td>
                          <td>
                            {session.status === "INITIATED" ? (
                              <div className="button-row">
                                <button
                                  className="button button--ghost"
                                  type="button"
                                  onClick={() => handleAcceptEngagement(session.id)}
                                  disabled={loading}
                                >
                                  Accept
                                </button>
                                <button
                                  className="button button--ghost"
                                  type="button"
                                  onClick={() => handleRejectEngagement(session.id)}
                                  disabled={loading}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="muted">No action</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="surface surface--alt">
                <h3>Engagement requests</h3>
                <p className="muted">No business profile available yet.</p>
              </div>
            )
          )}

          {activePane === "engagements" && isBuyer && myBusiness && (
            <div className="surface surface--alt" style={{ marginTop: "16px" }}>
              <h3>Buyer engagement tracking</h3>
              {buyerEngagements.length === 0 ? (
                <p className="muted">No engagement sessions yet.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>RFS</th>
                      <th>Seller</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyerEngagements.map((session) => (
                      <tr key={session.id}>
                        <td>{rfsList.find((rfs) => rfs.id === session.rfs_id)?.title ?? session.rfs_id}</td>
                        <td>{businessMap.get(session.seller_id) ?? session.seller_id}</td>
                        <td><span className="tag">{session.status}</span></td>
                        <td>{new Date(session.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  );
};