import { ShieldCheck, Zap, MessageSquare, Building2, Search, Users, Facebook, Instagram, Youtube } from "lucide-react";
import { motion } from "motion/react";

type LandingPageProps = {
  onGetStarted: () => void;
};

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(20px) saturate(150%)",
  WebkitBackdropFilter: "blur(20px) saturate(150%)",
  border: "1px solid rgba(255,255,255,0.6)",
  borderRadius: "24px",
  boxShadow: "0 8px 32px rgba(31,38,135,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
};

export const LandingPage = (_props: LandingPageProps) => {
  const services = [
    {
      icon: <Building2 className="w-7 h-7" />,
      title: "Register your business",
      desc: "Get verified and listed as a trusted buyer or seller in your industry.",
      tint: "rgba(60,94,171,0.18)",
      color: "#3c5eab",
    },
    {
      icon: <Search className="w-7 h-7" />,
      title: "Post a request for supply",
      desc: "Describe what you need and get matched with qualified sellers automatically.",
      tint: "rgba(0,131,94,0.18)",
      color: "#00835e",
    },
    {
      icon: <MessageSquare className="w-7 h-7" />,
      title: "Engage and close deals",
      desc: "Message trade partners directly and confirm outcomes on the platform.",
      tint: "rgba(60,94,171,0.18)",
      color: "#3c5eab",
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Market governance",
      desc: "Register brokers and manage market offices under official oversight.",
      tint: "rgba(0,131,94,0.18)",
      color: "#00835e",
    },
  ];

  return (
    <main style={{ position: "relative", overflow: "hidden", background: "#eef0f5", minHeight: "100vh" }}>
      {/* Soft colored orbs for the glass panels to refract against */}
      <div style={{ position: "absolute", top: "-100px", left: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(60,94,171,0.32), transparent 70%)", filter: "blur(15px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "220px", right: "-100px", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,131,94,0.28), transparent 70%)", filter: "blur(15px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "620px", left: "8%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(242,194,75,0.24), transparent 70%)", filter: "blur(12px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "1000px", right: "10%", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(60,94,171,0.22), transparent 70%)", filter: "blur(12px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", padding: "3rem 2rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "2rem", alignItems: "center" }} className="hero-grid-responsive">
          <motion.div
            style={{ ...glassCard, padding: "2.5rem" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", background: "rgba(60,94,171,0.15)", color: "#2c4a8f", padding: "0.4rem 0.9rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              Tanzania Trade Development Authority
            </span>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#14161a", margin: "0 0 0.6rem", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              TanTrade National B2B Platform
            </h1>
            <p style={{ color: "#4a4b50", fontSize: "1rem", margin: "0 0 1.75rem", lineHeight: 1.6 }}>
              The official platform connecting verified Tanzanian buyers and sellers — matched by industry, secured by verification, closed with confidence.
            </p>
            <button
              type="button"
              onClick={_props.onGetStarted}
              style={{ padding: "0.8rem 1.7rem", borderRadius: "999px", border: "none", background: "#3c5eab", color: "#fff", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", marginBottom: "1.75rem" }}
            >
              Get started
            </button>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.7)", padding: "0.45rem 0.9rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600, color: "#14161a" }}>
                <ShieldCheck style={{ width: "15px", height: "15px", color: "#3c5eab" }} /> Verified business profiles
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.7)", padding: "0.45rem 0.9rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600, color: "#14161a" }}>
                <Zap style={{ width: "15px", height: "15px", color: "#00835e" }} /> Smart RFS matching
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.7)", padding: "0.45rem 0.9rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600, color: "#14161a" }}>
                <MessageSquare style={{ width: "15px", height: "15px", color: "#3c5eab" }} /> Secure deal chat
              </span>
            </div>
          </motion.div>

          <motion.div
            style={{ ...glassCard, padding: "1.5rem" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.15 }}
          >
            <svg viewBox="0 0 400 320" style={{ width: "100%", height: "auto" }}>
              <rect x="55" y="110" width="90" height="110" rx="10" fill="rgba(255,255,255,0.7)" stroke="#3c5eab" strokeWidth="2" />
              <rect x="70" y="130" width="16" height="16" rx="3" fill="#3c5eab" opacity="0.6" />
              <rect x="94" y="130" width="16" height="16" rx="3" fill="#3c5eab" opacity="0.6" />
              <rect x="70" y="154" width="16" height="16" rx="3" fill="#3c5eab" opacity="0.35" />
              <rect x="94" y="154" width="16" height="16" rx="3" fill="#3c5eab" opacity="0.35" />
              <rect x="80" y="188" width="36" height="32" rx="4" fill="#3c5eab" opacity="0.8" />
              <rect x="255" y="90" width="90" height="130" rx="10" fill="rgba(255,255,255,0.7)" stroke="#00835e" strokeWidth="2" />
              <rect x="270" y="110" width="16" height="16" rx="3" fill="#00835e" opacity="0.6" />
              <rect x="294" y="110" width="16" height="16" rx="3" fill="#00835e" opacity="0.6" />
              <rect x="270" y="134" width="16" height="16" rx="3" fill="#00835e" opacity="0.35" />
              <rect x="294" y="134" width="16" height="16" rx="3" fill="#00835e" opacity="0.35" />
              <rect x="280" y="188" width="36" height="32" rx="4" fill="#00835e" opacity="0.8" />
              <circle cx="200" cy="150" r="34" fill="rgba(255,255,255,0.85)" stroke="#f2c24b" strokeWidth="2.5" />
              <path d="M188 150 l8 8 l16 -16" stroke="#f2c24b" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M148 148 Q175 130 178 148" stroke="#3c5eab" strokeWidth="2" fill="none" strokeDasharray="4 4" />
              <path d="M252 148 Q225 130 222 148" stroke="#00835e" strokeWidth="2" fill="none" strokeDasharray="4 4" />
            </svg>
          </motion.div>
        </div>

        <motion.div
          style={{ maxWidth: "760px", margin: "1.75rem auto 0", display: "flex", gap: "1rem", flexWrap: "wrap" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ ...glassCard, flex: 1, minWidth: "160px", padding: "1.1rem 1.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "#2c4a8f", margin: 0 }}>Verified</p>
            <p style={{ fontSize: "0.78rem", color: "#55565c", margin: "0.2rem 0 0" }}>business profiles</p>
          </div>
          <div style={{ ...glassCard, flex: 1, minWidth: "160px", padding: "1.1rem 1.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "#00694a", margin: 0 }}>Smart</p>
            <p style={{ fontSize: "0.78rem", color: "#55565c", margin: "0.2rem 0 0" }}>RFS matching engine</p>
          </div>
          <div style={{ ...glassCard, flex: 1, minWidth: "160px", padding: "1.1rem 1.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "#2c4a8f", margin: 0 }}>Secure</p>
            <p style={{ fontSize: "0.78rem", color: "#55565c", margin: "0.2rem 0 0" }}>in-app deal chat</p>
          </div>
        </motion.div>
      </div>

      <motion.section
        style={{ position: "relative", maxWidth: "1000px", margin: "0 auto", padding: "2rem 2rem 3rem" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 style={{ textAlign: "center", fontSize: "1.6rem", fontWeight: 700, color: "#14161a", margin: "0 0 1.75rem" }}>
          What you can do on this B2B platform
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
          {services.map((service) => (
            <div key={service.title} style={{ ...glassCard, padding: "1.5rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: service.tint, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", color: service.color }}>
                {service.icon}
              </div>
              <h3 style={{ margin: "0 0 0.4rem", fontSize: "1rem", fontWeight: 700, color: "#14161a" }}>{service.title}</h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#55565c", lineHeight: 1.5 }}>{service.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        style={{ position: "relative", textAlign: "center", padding: "0 2rem 3rem" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div style={{ ...glassCard, maxWidth: "520px", margin: "0 auto", padding: "2.25rem" }}>
          <p style={{ fontWeight: 700, color: "#14161a", margin: "0 0 1.25rem", fontSize: "1.05rem" }}>Ready to grow your trade network?</p>
          <button
            type="button"
            onClick={_props.onGetStarted}
            style={{ padding: "0.75rem 1.6rem", borderRadius: "999px", border: "none", background: "#3c5eab", color: "#fff", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}
          >
            Create your free account
          </button>
        </div>
      </motion.section>

      <motion.section
        style={{ position: "relative", padding: 0 }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div style={{ background: "linear-gradient(135deg, #1d3566, #14432f)", padding: "3rem 3rem 1.5rem" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto 2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "2.5rem" }}>
            <div>
              <h3 style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.9rem", paddingBottom: "0.9rem", borderBottom: "1px solid rgba(255,255,255,0.18)" }}>Contact</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <a href="tel:+255123456789" style={{ color: "#a8c1f0", fontSize: "0.9rem", textDecoration: "none" }}>
                  +255 (0) 123 456 789
                </a>
                <a href="mailto:support@tantrade.go.tz" style={{ color: "#a8c1f0", fontSize: "0.9rem", textDecoration: "none" }}>
                  support@tantrade.go.tz
                </a>
              </div>
            </div>
            <div>
              <h3 style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.9rem", paddingBottom: "0.9rem", borderBottom: "1px solid rgba(255,255,255,0.18)" }}>Resources</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <a href="#archives" style={{ color: "#a8c1f0", fontSize: "0.9rem", textDecoration: "none" }}>Document Archives</a>
                <a href="#e-services" style={{ color: "#a8c1f0", fontSize: "0.9rem", textDecoration: "none" }}>E-Services</a>
              </div>
            </div>
            <div>
              <h3 style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.9rem", paddingBottom: "0.9rem", borderBottom: "1px solid rgba(255,255,255,0.18)" }}>Legal</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <a href="#legal" style={{ color: "#a8c1f0", fontSize: "0.9rem", textDecoration: "none" }}>Legal Declarations</a>
                <a href="#copyright" style={{ color: "#a8c1f0", fontSize: "0.9rem", textDecoration: "none" }}>Copyright Notice</a>
              </div>
            </div>
          </div>

          <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "1rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.12)", flexWrap: "wrap" }}>
            <span style={{ color: "#cdd6e8", fontSize: "0.88rem" }}>Follow TanTrade</span>
            <a href="#" style={{ color: "#cdd6e8", display: "flex" }} aria-label="Facebook">
              <Facebook style={{ width: "18px", height: "18px" }} />
            </a>
            <a href="#" style={{ color: "#cdd6e8", display: "flex" }} aria-label="Instagram">
              <Instagram style={{ width: "18px", height: "18px" }} />
            </a>
            <a href="#" style={{ color: "#cdd6e8", display: "flex" }} aria-label="X">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-7.2L4.5 22H1.4l8.1-9.3L1 2h7.2l5 6.6zm-1.2 18h1.7L7.4 4H5.6z" /></svg>
            </a>
            <a href="#" style={{ color: "#cdd6e8", display: "flex" }} aria-label="YouTube">
              <Youtube style={{ width: "18px", height: "18px" }} />
            </a>
          </div>
        </div>

        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem 3rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "#55565c", margin: 0 }}>
            Copyright &copy; 2026 Tanzania Trade Development Authority
          </p>
        </div>
      </motion.section>

      <style>{`
        @media (max-width: 800px) {
          .hero-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
};