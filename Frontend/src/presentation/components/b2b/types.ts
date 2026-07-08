export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type BusinessVerification = {
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

export type BusinessCapabilityAttribute = {
  attribute_id: string;
  value: string;
};

export type BusinessCapability = {
  id?: string;
  service_type_id: string;
  attributes: BusinessCapabilityAttribute[];
};

export type Business = {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email: string;
  verification?: BusinessVerification | null;
  capabilities?: BusinessCapability[];
};

export type ServiceType = {
  id: string;
  name: string;
  category_id: string;
  is_active: boolean;
};

export type ServiceAttribute = {
  id: string;
  service_type_id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  parent_id?: string | null;
  level: number;
};

export type TaxonomyResponse = {
  categories?: Category[];
  service_types?: ServiceType[];
  attributes?: ServiceAttribute[];
};

export type Rfs = {
  id: string;
  short_id?: string;
  title: string;
  status: string;
  buyer_id: string;
  buyer_name?: string;
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
  constraint?: {
    min_budget?: number | null;
    max_budget?: number | null;
    start_date?: string | null;
    deadline?: string | null;
    region?: string | null;
    district?: string | null;
  } | null;
};

export type MatchCandidate = {
  id?: string | null;
  seller_id: string;
  seller_name?: string;
  score: number;
  rank: number;
};

export type MatchShortlist = {
  id: string;
  rfs_id: string;
  created_at: string;
  candidates: MatchCandidate[];
};

export type SessionReport = {
  id?: string;
  session_id: string;
  reported_by: string;
  outcome: string;
  reason?: string | null;
  notes?: string | null;
  created_at: string;
};

export type EngagementSession = {
  id: string;
  rfs_id: string;
  rfs_short_id?: string;
  buyer_id: string;
  buyer_name?: string;
  seller_id: string;
  seller_name?: string;
  status: string;
  created_at: string;
  reports?: SessionReport[];
};
