import {
  Radar,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Users,
  Zap,
  ShieldCheck,
  TrendingUp,
  Briefcase,
  AlertTriangle,
} from "lucide-react";

type ServiceSelectionPageProps = {
  onSelectService: (service: "matching" | "governance") => void;
  onSignIn?: () => void;
  onBack?: () => void;
  setupMode?: boolean;
  loading?: boolean;
  error?: string | null;
  onClearError?: () => void;
};

const matchingFeatures = [
  { icon: <Building2 className="w-4 h-4" />, text: "Register & verify your business" },
  { icon: <Zap className="w-4 h-4" />, text: "Publish Requests for Service (RFS)" },
  { icon: <Radar className="w-4 h-4" />, text: "AI-ranked seller shortlists" },
  { icon: <Users className="w-4 h-4" />, text: "Manage buyer-seller engagements" },
  { icon: <TrendingUp className="w-4 h-4" />, text: "Trust scoring & outcome signals" },
];

const governanceFeatures = [
  { icon: <MapPin className="w-4 h-4" />, text: "Register and manage local markets" },
  { icon: <Users className="w-4 h-4" />, text: "Register person identity profiles" },
  { icon: <Briefcase className="w-4 h-4" />, text: "Enrol brokers across all types" },
  { icon: <ShieldCheck className="w-4 h-4" />, text: "Assign chairperson office terms" },
  { icon: <CheckCircle2 className="w-4 h-4" />, text: "Enforce governance exclusivity rules" },
];

export const ServiceSelectionPage = ({
  onSelectService,
  onSignIn,
  onBack,
  setupMode = false,
  loading = false,
  error,
  onClearError,
}: ServiceSelectionPageProps) => {
  return (
    <main className="service-selection-page">
      {onBack && (
        <div className="service-selection-back">
          <button type="button" className="service-back-btn" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>
        </div>
      )}

      <div className="service-selection-header">
        <span className="service-selection-kicker">TanTrade B2B Platform</span>
        <h1 className="service-selection-headline">
          {setupMode ? "Complete your account setup" : "Choose your service"}
        </h1>
        <p className="service-selection-sub">
          {setupMode
            ? "Your account is signed in but has no service role yet. Select the platform you need — your permissions will be assigned automatically."
            : "Select the platform context that matches your role. Your account will be configured with the right permissions automatically."}
        </p>
      </div>

      {error && (
        <div className="notice notice--error" role="alert">
          <AlertTriangle className="icon" />
          {error}
          {onClearError && (
            <button type="button" className="service-link-btn" onClick={onClearError} style={{ marginLeft: 8 }}>
              Dismiss
            </button>
          )}
        </div>
      )}

      <div className="service-cards-grid">
        <div className="service-card service-card--matching">
          <div className="service-card__glow service-card__glow--blue" />
          <div className="service-card__inner">
            <div className="service-card__icon-wrap service-card__icon-wrap--blue">
              <Radar className="w-7 h-7" />
            </div>
            <div className="service-card__label">B2B Matchmaking Platform</div>
            <h2 className="service-card__title">Find the right business partner, faster</h2>
            <p className="service-card__desc">
              For businesses seeking or offering services. Publish structured requests,
              receive intelligent matches, and manage engagements end-to-end.
            </p>
            <ul className="service-card__features">
              {matchingFeatures.map((f) => (
                <li key={f.text} className="service-feature">
                  <span className="service-feature__icon service-feature__icon--blue">{f.icon}</span>
                  {f.text}
                </li>
              ))}
            </ul>
            <div className="service-card__role-badge">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Assigned role: <strong>Buyer</strong>
            </div>
            <button
              type="button"
              className="button button--primary service-card__cta"
              disabled={loading}
              onClick={() => onSelectService("matching")}
            >
              {loading ? "Assigning…" : setupMode ? "Select Matchmaking" : "Get started with Matchmaking"}
            </button>
          </div>
        </div>

        <div className="service-card service-card--governance">
          <div className="service-card__glow service-card__glow--green" />
          <div className="service-card__inner">
            <div className="service-card__icon-wrap service-card__icon-wrap--green">
              <MapPin className="w-7 h-7" />
            </div>
            <div className="service-card__label">Broker Management System</div>
            <h2 className="service-card__title">Govern markets with full oversight</h2>
            <p className="service-card__desc">
              For governance officers managing local markets, broker registrations, and
              chairperson office terms under TanTrade authority.
            </p>
            <ul className="service-card__features">
              {governanceFeatures.map((f) => (
                <li key={f.text} className="service-feature">
                  <span className="service-feature__icon service-feature__icon--green">{f.icon}</span>
                  {f.text}
                </li>
              ))}
            </ul>
            <div className="service-card__role-badge service-card__role-badge--green">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Assigned role: <strong>Governance Officer</strong>
            </div>
            <button
              type="button"
              className="button service-card__cta service-card__cta--green"
              disabled={loading}
              onClick={() => onSelectService("governance")}
            >
              {loading ? "Assigning…" : setupMode ? "Select Governance" : "Get started with Governance"}
            </button>
          </div>
        </div>
      </div>

      {!setupMode && onSignIn && (
        <p className="service-selection-footer">
          Already have an account?{" "}
          <button type="button" className="service-link-btn" onClick={onSignIn}>
            Sign in instead
          </button>
        </p>
      )}
    </main>
  );
};
