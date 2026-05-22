import { Database, KeyRound, Radar, ShieldCheck } from "lucide-react";
import type { Endpoint, GroupMeta } from "../../domain/types";

const pretty = (value: unknown) => JSON.stringify(value, null, 2);

export const endpoints: Endpoint[] = [
  {
    id: "auth-register",
    group: "auth",
    title: "Register user",
    summary: "Create an auth user with strong password rules.",
    method: "POST",
    path: "/auth/register",
    bodyTemplate: pretty({
      name: "Asha Mwakalobo",
      email: "asha@example.com",
      password: "ChangeMe!Pass123",
      password_confirmation: "ChangeMe!Pass123"
    })
  },
  {
    id: "auth-login",
    group: "auth",
    title: "Login",
    summary: "Issue a Sanctum token and load the auth profile.",
    method: "POST",
    path: "/auth/login",
    bodyTemplate: pretty({
      email: "asha@example.com",
      password: "ChangeMe!Pass123",
      device_name: "web"
    })
  },
  {
    id: "auth-me",
    group: "auth",
    title: "Who am I",
    summary: "Verify the active token and return the user profile.",
    method: "GET",
    path: "/auth/me",
    requiresAuth: true
  },
  {
    id: "auth-logout",
    group: "auth",
    title: "Logout",
    summary: "Revoke the current token.",
    method: "POST",
    path: "/auth/logout",
    requiresAuth: true
  },
  {
    id: "auth-change-password",
    group: "auth",
    title: "Change password",
    summary: "Rotate credentials for the authenticated user.",
    method: "POST",
    path: "/auth/password/change",
    requiresAuth: true,
    bodyTemplate: pretty({
      current_password: "ChangeMe!Pass123",
      new_password: "ChangeMe!Pass456",
      new_password_confirmation: "ChangeMe!Pass456"
    })
  },
  {
    id: "auth-roles",
    group: "auth",
    title: "List roles",
    summary: "List roles for the token holder or a provided user_id.",
    method: "GET",
    path: "/auth/roles",
    requiresAuth: true,
    queryParams: [
      {
        key: "user_id",
        label: "User ID (optional)",
        placeholder: "uuid"
      }
    ]
  },
  {
    id: "auth-assign-role",
    group: "auth",
    title: "Assign role",
    summary: "Assign a role to the token holder or a specific user.",
    method: "POST",
    path: "/auth/roles/:roleId",
    requiresAuth: true,
    pathParams: [
      {
        key: "roleId",
        label: "Role ID",
        placeholder: "uuid"
      }
    ],
    bodyTemplate: pretty({
      user_id: ""
    })
  },
  {
    id: "auth-revoke-role",
    group: "auth",
    title: "Revoke role",
    summary: "Remove a role assignment.",
    method: "DELETE",
    path: "/auth/roles/:roleId",
    requiresAuth: true,
    pathParams: [
      {
        key: "roleId",
        label: "Role ID",
        placeholder: "uuid"
      }
    ],
    bodyTemplate: pretty({
      user_id: ""
    })
  },
  {
    id: "market-create",
    group: "governance",
    title: "Create market",
    summary: "Register a physical market and create its chairperson office.",
    method: "POST",
    path: "/market-governance/markets",
    bodyTemplate: pretty({
      market_name: "Kariakoo Central Market",
      region: "Dar es Salaam",
      district: "Ilala",
      ward: "Kisutu",
      address: "Msimbazi Street",
      status: "ACTIVE"
    })
  },
  {
    id: "market-show",
    group: "governance",
    title: "Show market",
    summary: "Fetch a market by ID.",
    method: "GET",
    path: "/market-governance/markets/:marketId",
    pathParams: [
      {
        key: "marketId",
        label: "Market ID",
        placeholder: "uuid"
      }
    ]
  },
  {
    id: "market-update",
    group: "governance",
    title: "Update market",
    summary: "Patch market details and status.",
    method: "PATCH",
    path: "/market-governance/markets/:marketId",
    pathParams: [
      {
        key: "marketId",
        label: "Market ID",
        placeholder: "uuid"
      }
    ],
    bodyTemplate: pretty({
      market_name: "Kariakoo Central Market",
      status: "ACTIVE"
    })
  },
  {
    id: "person-create",
    group: "governance",
    title: "Create person",
    summary: "Register a person tied to a users table record.",
    method: "POST",
    path: "/market-governance/persons",
    bodyTemplate: pretty({
      user_id: 1,
      nida_number: "1990234567890001",
      first_name: "Neema",
      middle_name: "K",
      surname: "Shayo",
      gender: "FEMALE",
      mobile: "+255700000001",
      email: "neema@example.com",
      address: "Mwembechai, Dar es Salaam"
    })
  },
  {
    id: "person-show",
    group: "governance",
    title: "Show person",
    summary: "Fetch a person by ID.",
    method: "GET",
    path: "/market-governance/persons/:personId",
    pathParams: [
      {
        key: "personId",
        label: "Person ID",
        placeholder: "uuid"
      }
    ]
  },
  {
    id: "person-update",
    group: "governance",
    title: "Update person",
    summary: "Patch core demographic and contact fields.",
    method: "PATCH",
    path: "/market-governance/persons/:personId",
    pathParams: [
      {
        key: "personId",
        label: "Person ID",
        placeholder: "uuid"
      }
    ],
    bodyTemplate: pretty({
      mobile: "+255700000002",
      address: "Mikocheni, Dar es Salaam"
    })
  },
  {
    id: "broker-register",
    group: "governance",
    title: "Register broker",
    summary: "Bind a person to a market with a broker type.",
    method: "POST",
    path: "/market-governance/brokers",
    bodyTemplate: pretty({
      person_id: "",
      market_id: "",
      broker_type: "FREIGHT_BROKER"
    })
  },
  {
    id: "broker-show",
    group: "governance",
    title: "Show broker",
    summary: "Fetch broker registration details.",
    method: "GET",
    path: "/market-governance/brokers/:brokerId",
    pathParams: [
      {
        key: "brokerId",
        label: "Broker ID",
        placeholder: "uuid"
      }
    ]
  },
  {
    id: "broker-deactivate",
    group: "governance",
    title: "Deactivate broker",
    summary: "Suspend a broker registration.",
    method: "PATCH",
    path: "/market-governance/brokers/:brokerId/deactivate",
    pathParams: [
      {
        key: "brokerId",
        label: "Broker ID",
        placeholder: "uuid"
      }
    ]
  },
  {
    id: "office-create",
    group: "governance",
    title: "Create office",
    summary: "Create a governance office for a market.",
    method: "POST",
    path: "/market-governance/markets/:marketId/offices",
    pathParams: [
      {
        key: "marketId",
        label: "Market ID",
        placeholder: "uuid"
      }
    ],
    bodyTemplate: pretty({
      office_type: "CHAIRPERSON"
    })
  },
  {
    id: "term-assign",
    group: "governance",
    title: "Assign chairperson",
    summary: "Start a chairperson term for an office.",
    method: "POST",
    path: "/market-governance/offices/:officeId/terms",
    pathParams: [
      {
        key: "officeId",
        label: "Office ID",
        placeholder: "uuid"
      }
    ],
    bodyTemplate: pretty({
      person_id: "",
      start_date: "2024-01-01",
      end_date: "2025-01-01"
    })
  },
  {
    id: "term-end",
    group: "governance",
    title: "End term",
    summary: "Close an office term early or on schedule.",
    method: "PATCH",
    path: "/market-governance/terms/:termId/end",
    pathParams: [
      {
        key: "termId",
        label: "Term ID",
        placeholder: "uuid"
      }
    ],
    bodyTemplate: pretty({
      end_date: "2024-10-01"
    })
  },
  {
    id: "taxonomy-index",
    group: "taxonomy",
    title: "List taxonomy",
    summary: "Fetch categories, service types, and attributes.",
    method: "GET",
    path: "/taxonomy"
  },
  {
    id: "taxonomy-category",
    group: "taxonomy",
    title: "Create category",
    summary: "Add a taxonomy category node.",
    method: "POST",
    path: "/taxonomy/categories",
    bodyTemplate: pretty({
      name: "Logistics & Transport",
      parent_id: null,
      level: 1,
      is_active: true
    })
  },
  {
    id: "taxonomy-type",
    group: "taxonomy",
    title: "Create service type",
    summary: "Attach a service type to a category.",
    method: "POST",
    path: "/taxonomy/service-types",
    bodyTemplate: pretty({
      name: "Cold Chain Freight",
      category_id: "",
      is_active: true
    })
  },
  {
    id: "taxonomy-attribute",
    group: "taxonomy",
    title: "Create attribute",
    summary: "Add an attribute to a service type.",
    method: "POST",
    path: "/taxonomy/attributes",
    bodyTemplate: pretty({
      service_type_id: "",
      name: "Reefer Temperature"
    })
  },
  {
    id: "taxonomy-attribute-value",
    group: "taxonomy",
    title: "Create attribute value",
    summary: "Add a value to an attribute.",
    method: "POST",
    path: "/taxonomy/attribute-values",
    bodyTemplate: pretty({
      attribute_id: "",
      value: "-18C"
    })
  },
  {
    id: "business-create",
    group: "matching",
    title: "Create business",
    summary: "Register a seller or buyer profile with capabilities.",
    method: "POST",
    path: "/businesses",
    bodyTemplate: pretty({
      name: "Masoko Logistics Ltd",
      contact_person: "Asha Mwinyi",
      phone: "+255700000100",
      email: "ops@masoko.co.tz",
      tin_number: "TIN-2024-001",
      brela_number: "BRELA-98441",
      business_size: "MEDIUM",
      is_owner: true,
      owner_gender: "FEMALE",
      employee_count: 48,
      revenue_range: "BETWEEN_50M_500M",
      region: "Dar es Salaam",
      district: "Ilala",
      address: "Nyerere Road, Plot 21",
      verification_status: "PARTIALLY_VERIFIED",
      capabilities: [
        {
          service_type_id: "",
          attributes: [
            {
              attribute_id: "",
              value: "10 tons"
            }
          ]
        }
      ]
    })
  },
  {
    id: "business-show",
    group: "matching",
    title: "Show business",
    summary: "Fetch business by ID.",
    method: "GET",
    path: "/businesses/:businessId",
    pathParams: [
      {
        key: "businessId",
        label: "Business ID",
        placeholder: "uuid"
      }
    ]
  },
  {
    id: "business-update",
    group: "matching",
    title: "Update business",
    summary: "Patch core contact details.",
    method: "PATCH",
    path: "/businesses/:businessId",
    pathParams: [
      {
        key: "businessId",
        label: "Business ID",
        placeholder: "uuid"
      }
    ],
    bodyTemplate: pretty({
      name: "Masoko Logistics Limited",
      contact_person: "Asha Mwinyi",
      phone: "+255700000101",
      email: "ops@masoko.co.tz"
    })
  },
  {
    id: "business-verify",
    group: "matching",
    title: "Upsert verification",
    summary: "Store compliance verification details.",
    method: "PUT",
    path: "/businesses/:businessId/verification",
    pathParams: [
      {
        key: "businessId",
        label: "Business ID",
        placeholder: "uuid"
      }
    ],
    bodyTemplate: pretty({
      tin_number: "TIN-2024-001",
      brela_number: "BRELA-98441",
      business_size: "MEDIUM",
      is_owner: true,
      owner_gender: "FEMALE",
      employee_count: 50,
      revenue_range: "BETWEEN_50M_500M",
      region: "Dar es Salaam",
      district: "Ilala",
      address: "Nyerere Road, Plot 21",
      verification_status: "VERIFIED"
    })
  },
  {
    id: "business-capabilities",
    group: "matching",
    title: "Sync capabilities",
    summary: "Replace the business capability matrix.",
    method: "PUT",
    path: "/businesses/:businessId/capabilities",
    pathParams: [
      {
        key: "businessId",
        label: "Business ID",
        placeholder: "uuid"
      }
    ],
    bodyTemplate: pretty({
      capabilities: [
        {
          service_type_id: "",
          attributes: [
            {
              attribute_id: "",
              value: "12 tons"
            }
          ]
        }
      ]
    })
  },
  {
    id: "business-trust",
    group: "matching",
    title: "Trust metrics",
    summary: "Return computed trust metrics for a business.",
    method: "GET",
    path: "/businesses/:businessId/trust-metrics",
    pathParams: [
      {
        key: "businessId",
        label: "Business ID",
        placeholder: "uuid"
      }
    ]
  },
  {
    id: "rfs-create",
    group: "matching",
    title: "Create RFS",
    summary: "Declare demand with constraints and preferences.",
    method: "POST",
    path: "/rfs",
    bodyTemplate: pretty({
      buyer_id: "",
      title: "Reefer transport to Port",
      description: "Cold chain shipment for export-grade avocados.",
      service_type_id: "",
      project_size: "MEDIUM",
      expertise_level: "INTERMEDIATE",
      constraints: {
        min_budget: 12000000,
        max_budget: 24000000,
        start_date: "2024-10-01",
        deadline: "2024-11-15",
        region: "Dar es Salaam",
        district: "Ilala"
      },
      preferences: {
        cost_weight: 0.3,
        quality_weight: 0.3,
        speed_weight: 0.2,
        experience_weight: 0.1,
        location_weight: 0.1
      },
      attributes: [
        {
          attribute_id: "",
          value: "-18C"
        }
      ]
    })
  },
  {
    id: "rfs-show",
    group: "matching",
    title: "Show RFS",
    summary: "Fetch an RFS by ID.",
    method: "GET",
    path: "/rfs/:rfsId",
    pathParams: [
      {
        key: "rfsId",
        label: "RFS ID",
        placeholder: "uuid"
      }
    ]
  },
  {
    id: "rfs-update",
    group: "matching",
    title: "Update RFS",
    summary: "Patch RFS metadata and constraints.",
    method: "PATCH",
    path: "/rfs/:rfsId",
    pathParams: [
      {
        key: "rfsId",
        label: "RFS ID",
        placeholder: "uuid"
      }
    ],
    bodyTemplate: pretty({
      title: "Reefer transport to Port",
      description: "Updated delivery window for cold chain.",
      project_size: "LARGE",
      expertise_level: "ADVANCED"
    })
  },
  {
    id: "rfs-open",
    group: "matching",
    title: "Open RFS",
    summary: "Move an RFS to OPEN state.",
    method: "POST",
    path: "/rfs/:rfsId/open",
    pathParams: [
      {
        key: "rfsId",
        label: "RFS ID",
        placeholder: "uuid"
      }
    ]
  },
  {
    id: "rfs-match",
    group: "matching",
    title: "Generate shortlist",
    summary: "Run the matching engine for an RFS.",
    method: "POST",
    path: "/rfs/:rfsId/match",
    pathParams: [
      {
        key: "rfsId",
        label: "RFS ID",
        placeholder: "uuid"
      }
    ]
  },
  {
    id: "rfs-shortlist",
    group: "matching",
    title: "Latest shortlist",
    summary: "Fetch the most recent shortlist for an RFS.",
    method: "GET",
    path: "/rfs/:rfsId/shortlist",
    pathParams: [
      {
        key: "rfsId",
        label: "RFS ID",
        placeholder: "uuid"
      }
    ]
  },
  {
    id: "engagement-create",
    group: "matching",
    title: "Create engagement",
    summary: "Start a buyer-seller engagement session.",
    method: "POST",
    path: "/engagement-sessions",
    bodyTemplate: pretty({
      rfs_id: "",
      buyer_id: "",
      seller_id: ""
    })
  },
  {
    id: "engagement-show",
    group: "matching",
    title: "Show engagement",
    summary: "Fetch an engagement session.",
    method: "GET",
    path: "/engagement-sessions/:sessionId",
    pathParams: [
      {
        key: "sessionId",
        label: "Session ID",
        placeholder: "uuid"
      }
    ]
  },
  {
    id: "engagement-accept",
    group: "matching",
    title: "Accept engagement",
    summary: "Move session to ACCEPTED.",
    method: "POST",
    path: "/engagement-sessions/:sessionId/accept",
    pathParams: [
      {
        key: "sessionId",
        label: "Session ID",
        placeholder: "uuid"
      }
    ]
  },
  {
    id: "engagement-activate",
    group: "matching",
    title: "Activate engagement",
    summary: "Move session to ACTIVE.",
    method: "POST",
    path: "/engagement-sessions/:sessionId/activate",
    pathParams: [
      {
        key: "sessionId",
        label: "Session ID",
        placeholder: "uuid"
      }
    ]
  },
  {
    id: "engagement-stall",
    group: "matching",
    title: "Stall engagement",
    summary: "Move session to STALLED.",
    method: "POST",
    path: "/engagement-sessions/:sessionId/stall",
    pathParams: [
      {
        key: "sessionId",
        label: "Session ID",
        placeholder: "uuid"
      }
    ]
  },
  {
    id: "engagement-report",
    group: "matching",
    title: "Report outcome",
    summary: "Submit a reported outcome from a buyer or seller.",
    method: "POST",
    path: "/engagement-sessions/:sessionId/outcomes",
    pathParams: [
      {
        key: "sessionId",
        label: "Session ID",
        placeholder: "uuid"
      }
    ],
    bodyTemplate: pretty({
      reported_by: "BUYER",
      outcome: "DEAL_CONFIRMED"
    })
  },
  {
    id: "engagement-close",
    group: "matching",
    title: "Close engagement",
    summary: "Close a session after reporting completes.",
    method: "POST",
    path: "/engagement-sessions/:sessionId/close",
    pathParams: [
      {
        key: "sessionId",
        label: "Session ID",
        placeholder: "uuid"
      }
    ]
  }
];

export const groups: GroupMeta[] = [
  {
    id: "auth",
    title: "Authentication",
    description: "Sanctum tokens, user identity, and role operations.",
    icon: KeyRound
  },
  {
    id: "governance",
    title: "Market Governance",
    description: "Markets, people, brokers, and office terms.",
    icon: ShieldCheck
  },
  {
    id: "taxonomy",
    title: "Taxonomy",
    description: "Categories, service types, and structured attributes.",
    icon: Database
  },
  {
    id: "matching",
    title: "Matching Engine",
    description: "Business onboarding, RFS, matching, and engagements.",
    icon: Radar
  }
];
