import { ShieldCheck, Building2, Zap, Phone, Mail, FileText, Users, MessageSquare, Search } from "lucide-react";
import { motion } from "motion/react";

type LandingPageProps = {
  onGetStarted: () => void;
};

export const LandingPage = (_props: LandingPageProps) => {
  const services = [
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Register your business",
      desc: "Get verified and listed as a trusted buyer or seller in your industry.",
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Post a request for supply",
      desc: "Describe what you need and get matched with qualified sellers automatically.",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Engage and close deals",
      desc: "Message trade partners directly and confirm outcomes on the platform.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Market governance",
      desc: "Register brokers and manage market offices under official oversight.",
    },
  ];

  return (
    <main className="page landing-home">
      <motion.section 
        className="landing-hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="hero-wrapper">
          <span className="hero-kicker">Tanzania Trade Development Authority</span>
          <h1 className="hero-headline">Find verified buyers and sellers, faster.</h1>
          <p className="hero-subheader">
            TanTrade matches your business with the right trade partners across Tanzania, backed by verification, smart matching, and secure deal-making.
          </p>
          <div className="hero-cta">
            <button type="button" className="button button--primary" onClick={_props.onGetStarted}>
              Get started free
            </button>
            <a className="button button--secondary" href="#service-matrix">See how it works</a>
          </div>
          <div className="hero-pills">
            <span className="pill"><ShieldCheck className="icon" /> Verified business profiles</span>
            <span className="pill"><Zap className="icon" /> Smart RFS matching</span>
            <span className="pill"><MessageSquare className="icon" /> Secure deal chat</span>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="stats-row"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="stat-item">
          <p className="landing-stat-value landing-stat-value--blue">Verified</p>
          <p className="landing-stat-label">business profiles</p>
        </div>
        <div className="stat-item">
          <p className="landing-stat-value landing-stat-value--green">Smart</p>
          <p className="landing-stat-label">RFS matching engine</p>
        </div>
        <div className="stat-item">
          <p className="landing-stat-value landing-stat-value--blue">Secure</p>
          <p className="landing-stat-label">in-app deal chat</p>
        </div>
      </motion.section>

      <motion.section 
        className="service-matrix" 
        id="service-matrix"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2>What you can do on TanTrade</h2>
        <div className="service-grid">
          {services.map((service) => (
            <div key={service.title} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="closing-cta"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="closing-cta__title">Ready to grow your trade network?</p>
        <button type="button" className="button button--primary" onClick={_props.onGetStarted}>
          Create your free account
        </button>
      </motion.section>

      <motion.section 
        className="support-footer" 
        id="support-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
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
      </motion.section>
    </main>
  );
};