import { useState } from "react";
import { BadgeCheck, Building2, KeyRound, ShieldCheck, Users } from "lucide-react";
import coatOfArms from "../../assets/tanzania-coat-of-arms.png";
import tantradeLogo from "../../assets/tantrade-brand.png";
import { apiRequest } from "../../api/client";

type LandingPageProps = {
  onLogin: (email: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
};

type Notice = { type: "success" | "error"; message: string };

export const LandingPage = ({ onLogin, loading, error, onClearError }: LandingPageProps) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [accountNotice, setAccountNotice] = useState<Notice | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: ""
  });
  const [businessNotice, setBusinessNotice] = useState<Notice | null>(null);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessForm, setBusinessForm] = useState({
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

  const businessSizes = ["SMALL", "MEDIUM", "LARGE"];
  const ownerGenders = ["MALE", "FEMALE"];
  const revenueRanges = ["BELOW_50M", "BETWEEN_50M_500M", "BETWEEN_500M_5B", "ABOVE_5B"];
  const verificationStatuses = ["UNVERIFIED", "PARTIALLY_VERIFIED", "VERIFIED"];

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    onClearError();
    await onLogin(loginEmail, loginPassword);
  };

  const handleAccountRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setAccountNotice(null);
    if (accountForm.password !== accountForm.confirm) {
      setAccountNotice({ type: "error", message: "Passwords do not match." });
      return;
    }
    setAccountLoading(true);
    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: {
          name: accountForm.name,
          email: accountForm.email,
          password: accountForm.password,
          password_confirmation: accountForm.confirm
        }
      });
      setAccountNotice({ type: "success", message: "Account created. Sign in to continue." });
      setAccountForm({ name: "", email: "", password: "", confirm: "" });
    } catch (err) {
      setAccountNotice({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to register account."
      });
    } finally {
      setAccountLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusinessLoading(true);
    setBusinessNotice(null);
    try {
      await apiRequest("/businesses", {
        method: "POST",
        body: {
          ...businessForm,
          employee_count: Number.parseInt(businessForm.employee_count || "0", 10)
        },
      });
      setBusinessNotice({ type: "success", message: "Business registration submitted successfully." });
      setBusinessForm({
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
    } catch (err) {
      setBusinessNotice({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to register business."
      });
    } finally {
      setBusinessLoading(false);
    }
  };


  return (
    <main className="page auth-home">
      <section className="auth-hero">
        <div className="auth-hero__grid">
          <div className="auth-hero__copy">
            <div className="brand-bar">
              <img className="brand-coat" src={coatOfArms} alt="Tanzania coat of arms" />
              <div className="brand-meta">
                <img className="brand-logo" src={tantradeLogo} alt="TanTrade" />
                <span className="brand-caption">Tanzania Trade Development Authority</span>
              </div>
            </div>
            <span className="hero-eyebrow">Unified access for matching operations</span>
            <h1>Authenticate once. Match buyers and sellers with confidence.</h1>
            <p>
              The authentication context secures identities. The matching context onboards buyers and
              sellers to create RFS, generate shortlists, and track engagements.
            </p>
            <div className="auth-pill-row">
              <span className="pill">
                <ShieldCheck className="icon" /> Authentication context
              </span>
              <span className="pill">
                <Building2 className="icon" /> Matching context
              </span>
            </div>
          </div>
          <div className="auth-hero__panel">
            <h3>Matching workflow</h3>
            <ul className="auth-steps">
              <li>
                <span className="auth-step__index">01</span>
                <div>
                  <strong>Create your account</strong>
                  <span>Secure authentication for every role.</span>
                </div>
              </li>
              <li>
                <span className="auth-step__index">02</span>
                <div>
                  <strong>Register your business</strong>
                  <span>Buyer or seller onboarding with verification.</span>
                </div>
              </li>
              <li>
                <span className="auth-step__index">03</span>
                <div>
                  <strong>Publish and match</strong>
                  <span>Create RFS, generate shortlists, and manage engagements.</span>
                </div>
              </li>
            </ul>
            <div className="auth-highlight">
              <div>
                <span className="trust-label">Matching ready</span>
                <span className="trust-value">Built for verified buyer-seller discovery.</span>
              </div>
              <div>
                <span className="trust-label">Secure</span>
                <span className="trust-value">Sanctum-backed authentication</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-panels">
        <article className="auth-card auth-card--signin">
          <div className="form-header">
            <KeyRound className="icon" />
            <div>
              <h2>Sign in</h2>
              <p>Authenticate with your TanTrade account.</p>
            </div>
          </div>
          {error && <div className="notice notice--error">{error}</div>}
          <form className="form-grid" onSubmit={handleLogin}>
            <label className="field">
              <span>Email address</span>
              <input
                className="input"
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                required
                placeholder="name@tantrade.go.tz"
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                className="input"
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                required
                placeholder="Enter your password"
              />
            </label>
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </article>

        <article className="auth-card auth-card--register">
          <div className="form-header">
            <BadgeCheck className="icon" />
            <div>
              <h2>Create an account</h2>
              <p>Start with authentication before role registration.</p>
            </div>
          </div>
          {accountNotice && (
            <div className={`notice notice--${accountNotice.type}`}>
              {accountNotice.message}
            </div>
          )}
          <form className="form-grid" onSubmit={handleAccountRegister}>
            <label className="field">
              <span>Full name</span>
              <input
                className="input"
                value={accountForm.name}
                onChange={(event) => setAccountForm({ ...accountForm, name: event.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Email address</span>
              <input
                className="input"
                type="email"
                value={accountForm.email}
                onChange={(event) => setAccountForm({ ...accountForm, email: event.target.value })}
                required
              />
            </label>
            <div className="grid-2">
              <label className="field">
                <span>Password</span>
                <input
                  className="input"
                  type="password"
                  value={accountForm.password}
                  onChange={(event) => setAccountForm({ ...accountForm, password: event.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Confirm password</span>
                <input
                  className="input"
                  type="password"
                  value={accountForm.confirm}
                  onChange={(event) => setAccountForm({ ...accountForm, confirm: event.target.value })}
                  required
                />
              </label>
            </div>
            <button className="button" type="submit" disabled={accountLoading}>
              {accountLoading ? "Creating account..." : "Register account"}
            </button>
          </form>
        </article>
      </section>

      <section className="auth-contexts">
        <article className="context-card">
          <div className="context-card__header">
            <Users className="icon" />
            <div>
              <h3>Matching context registration</h3>
              <p>Register a business to access matching, shortlist, and engagement workflows.</p>
            </div>
          </div>
          {businessNotice && (
            <div className={`notice notice--${businessNotice.type}`}>
              {businessNotice.message}
            </div>
          )}
          <form className="form-grid" onSubmit={handleRegister}>
            <label className="field">
              <span>Business name</span>
              <input
                className="input"
                value={businessForm.name}
                onChange={(event) => setBusinessForm({ ...businessForm, name: event.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Contact person</span>
              <input
                className="input"
                value={businessForm.contact_person}
                onChange={(event) =>
                  setBusinessForm({ ...businessForm, contact_person: event.target.value })
                }
                required
              />
            </label>
            <div className="grid-2">
              <label className="field">
                <span>Phone number</span>
                <input
                  className="input"
                  value={businessForm.phone}
                  onChange={(event) => setBusinessForm({ ...businessForm, phone: event.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  className="input"
                  type="email"
                  value={businessForm.email}
                  onChange={(event) => setBusinessForm({ ...businessForm, email: event.target.value })}
                  required
                />
              </label>
            </div>
            <div className="grid-2">
              <label className="field">
                <span>TIN number</span>
                <input
                  className="input"
                  value={businessForm.tin_number}
                  onChange={(event) =>
                    setBusinessForm({ ...businessForm, tin_number: event.target.value })
                  }
                  required
                />
              </label>
              <label className="field">
                <span>BRELA number</span>
                <input
                  className="input"
                  value={businessForm.brela_number}
                  onChange={(event) =>
                    setBusinessForm({ ...businessForm, brela_number: event.target.value })
                  }
                  required
                />
              </label>
            </div>
            <div className="grid-2">
              <label className="field">
                <span>Business size</span>
                <select
                  className="input"
                  value={businessForm.business_size}
                  onChange={(event) =>
                    setBusinessForm({ ...businessForm, business_size: event.target.value })
                  }
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
                  value={businessForm.owner_gender}
                  onChange={(event) =>
                    setBusinessForm({ ...businessForm, owner_gender: event.target.value })
                  }
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
                  value={businessForm.revenue_range}
                  onChange={(event) =>
                    setBusinessForm({ ...businessForm, revenue_range: event.target.value })
                  }
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
                  value={businessForm.verification_status}
                  onChange={(event) =>
                    setBusinessForm({ ...businessForm, verification_status: event.target.value })
                  }
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
                  value={businessForm.employee_count}
                  onChange={(event) =>
                    setBusinessForm({ ...businessForm, employee_count: event.target.value })
                  }
                  required
                />
              </label>
              <label className="field-inline">
                <input
                  type="checkbox"
                  checked={businessForm.is_owner}
                  onChange={(event) =>
                    setBusinessForm({ ...businessForm, is_owner: event.target.checked })
                  }
                />
                Owner registered
              </label>
            </div>
            <div className="grid-2">
              <label className="field">
                <span>Region</span>
                <input
                  className="input"
                  value={businessForm.region}
                  onChange={(event) => setBusinessForm({ ...businessForm, region: event.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>District</span>
                <input
                  className="input"
                  value={businessForm.district}
                  onChange={(event) =>
                    setBusinessForm({ ...businessForm, district: event.target.value })
                  }
                  required
                />
              </label>
            </div>
            <label className="field">
              <span>Address</span>
              <input
                className="input"
                value={businessForm.address}
                onChange={(event) => setBusinessForm({ ...businessForm, address: event.target.value })}
                required
              />
            </label>
            <button className="button" type="submit" disabled={businessLoading}>
              {businessLoading ? "Submitting..." : "Submit registration"}
            </button>
          </form>
        </article>

      </section>
    </main>
  );
};
