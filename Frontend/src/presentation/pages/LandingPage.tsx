import { ShieldCheck, Building2, Zap, Phone, Mail, FileText, Users } from "lucide-react";
import coatOfArms from "../../assets/tanzania-coat-of-arms.png";
import tantradeLogo from "../../assets/tantrade-brand.png";

type LandingPageProps = {
  onGetStarted: () => void;
};

export const LandingPage = (_props: LandingPageProps) => {
  const services = [
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Primary Entity Management",
      desc: "Create and maintain business profiles across the lifecycle.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Secondary Entity Tracking",
      desc: "Register and update subsidiaries, branches, and related identities.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Asset & Property Protection",
      desc: "Manage sensitive assets and safeguard ownership records.",
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Information Retrieval",
      desc: "Look up official records and exchange validated data safely.",
    },
  ];

  return (
    <main className="page landing-home">
      <section className="landing-hero">
        <div className="hero-wrapper">
          <h1 className="hero-headline">TanTrade B2B Platform</h1>
          <p className="hero-subheader">
            A secure, comprehensive digital hub for verified trade operations, business records, and trusted public access.
          </p>
          <div className="hero-cta">
            <button type="button" className="button button--primary" onClick={_props.onGetStarted}>
              Get Started
            </button>
            <a className="button button--secondary" href="#support-footer">Learn More</a>
          </div>
          <div className="hero-pills">
            <span className="pill"><ShieldCheck className="icon" /> Transaction Security</span>
            <span className="pill"><Zap className="icon" /> Continuous Availability</span>
            <span className="pill"><Phone className="icon" /> Dedicated Support</span>
            <span className="pill"><Mail className="icon" /> Infrastructure Stability</span>
          </div>
        </div>
      </section>

      <section className="service-matrix" id="service-matrix">
        <h2>Platform Capabilities</h2>
        <div className="service-grid">
          {services.map((service) => (
            <div key={service.title} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="support-footer" id="support-footer">
        <div className="support-grid">
          <div className="support-block">
            <h3>Technical Support</h3>
            <a href="tel:+255123456789" className="support-link">
              <Phone className="icon" /> +255 (0) 123 456 789
            </a>
            <a href="mailto:support@tantrade.go.tz" className="support-link">
              <Mail className="icon" /> support@tantrade.go.tz
            </a>
          </div>
          <div className="support-block">
            <h3>Utility Links</h3>
            <ul className="utility-links">
              <li><a href="#archives">Document Archives</a></li>
              <li><a href="#e-services">E-Services</a></li>
              <li><a href="#legal">Legal Declarations</a></li>
              <li><a href="#copyright">Copyright Notice</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-meta">
          <p>&copy; 2026 Tanzania Trade Development Authority. All rights reserved.</p>
        </div>
      </section>
    </main>
  );
};
