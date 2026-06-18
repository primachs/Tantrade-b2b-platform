export type AuthUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

export type Business = {
  id: string;
  name: string;
  email: string;
  contact_person?: string;
  phone?: string;
  tin_number?: string;
  brela_number?: string;
  business_size?: string;
  is_owner?: boolean;
  owner_gender?: string;
  employee_count?: number;
  revenue_range?: string;
  region?: string;
  district?: string;
  address?: string;
  verification_status?: string;
  capabilities?: { service_type_id: string; attributes: { attribute_id: string; value: string }[] }[];
};

export type Rfs = {
  id: string;
  title: string;
  status: string;
  buyer_id: string;
  service_type_id: string;
};

export type ServiceType = {
  id: string;
  name: string;
  category_id: string;
  is_active: boolean;
};

export type TaxonomyResponse = {
  categories?: unknown[];
  service_types?: ServiceType[];
  attributes?: unknown[];
};

export type Market = {
  id: string;
  market_name: string;
  region: string;
  district: string;
  status: string;
};

export type Person = {
  id: string;
  user_id: number;
  first_name: string;
  surname: string;
  gender: string;
  email: string;
};

export type Broker = {
  id: string;
  market_id: string;
  broker_type: string;
  first_name: string;
  surname: string;
  status: string;
};
