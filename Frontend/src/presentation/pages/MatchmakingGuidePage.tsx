import { ArrowLeft, Target, UserCheck, FileText, Handshake, ShieldCheck, TrendingUp } from "lucide-react";

type MatchmakingGuidePageProps = {
  onBack: () => void;
};

export const MatchmakingGuidePage = ({ onBack }: MatchmakingGuidePageProps) => {
  const sections = [
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "1. Complete your business profile",
      body: "Fill in every field on your business profile - registration details, sector, product/service categories, and location. The matching engine scores candidates using these fields directly, so an incomplete profile means fewer, weaker matches.",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "2. Post a clear Request for Supply (RFS)",
      body: "Buyers should describe exactly what they need: category, quantity, budget range, and timeline. Specific requests attract sellers who can genuinely fulfil them, and they let the matching engine rank candidates accurately instead of guessing.",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "3. Review your shortlist",
      body: "Once an RFS is open, the platform generates a shortlist of ranked candidates based on category fit, location, and verification status. Higher-ranked matches are more likely to meet your requirements - start conversations from the top of the list.",
    },
    {
      icon: <Handshake className="w-6 h-6" />,
      title: "4. Engage and confirm the deal",
      body: "Use the engagement session to communicate, negotiate terms, and track progress. Once a deal is reached, both sides confirm it on the platform - this dual confirmation keeps the outcome record accurate for everyone.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "5. Build your reliability score",
      body: "Respond promptly, honour agreed terms, and confirm outcomes honestly. Your reliability score is calculated from session history and response times, and it directly affects how often you're surfaced in future matches.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Best practices for securing more deals",
      body: "Keep your profile and availability up to date, respond to engagement requests within 24 hours where possible, and be specific about pricing and capacity. Businesses with verified profiles and fast response times consistently rank higher in matching results.",
    },
  ];

  return (
    <main className="page" style={{ maxWidth: "840px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "transparent",
          border: "none",
          color: "#2563eb",
          fontWeight: 600,
          cursor: "pointer",
          padding: 0,
          marginBottom: "2rem",
          fontSize: "0.95rem",
        }}
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 style={{ fontSize: "2.25rem", margin: "0 0 0.75rem 0", color: "#0f172a" }}>Matchmaking Guide</h1>
      <p style={{ color: "#64748b", fontSize: "1.05rem", lineHeight: 1.6, margin: "0 0 2.5rem 0" }}>
        How the TanTrade matchmaking engine works, and how to optimize your profile to secure more deals.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {sections.map((section, i) => (
          <div
            key={i}
            style={{
              background: "#ffffff",
              padding: "1.75rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              display: "flex",
              gap: "1.25rem",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                color: "#f59e0b",
                width: "48px",
                height: "48px",
                minWidth: "48px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {section.icon}
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", margin: "0 0 0.5rem 0", color: "#0f172a" }}>{section.title}</h3>
              <p style={{ color: "#64748b", margin: 0, lineHeight: 1.6 }}>{section.body}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};