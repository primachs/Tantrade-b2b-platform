import tantradeLogo from "../../assets/tantrade-brand.png";
import coatOfArms from "../../assets/tanzania-coat-of-arms.png";

type NavTarget = "landing" | "dashboard";

type BrandHeaderProps = {
  active: NavTarget;
  onNavigate: (target: NavTarget) => void;
  userName?: string;
  userEmail?: string;
  userRoles?: string[];
  onLogout?: () => void;
};

export const BrandHeader = ({
  active,
  onNavigate,
  userName,
  userEmail,
  userRoles,
  onLogout
}: BrandHeaderProps) => (
  <header className="top-nav">
    <div className="nav-brand">
      <img className="nav-coat" src={coatOfArms} alt="Tanzania coat of arms" />
      <div className="nav-brand__meta">
        <img className="nav-logo" src={tantradeLogo} alt="TanTrade logo" />
        <span className="nav-caption">Tanzania Trade Development Authority</span>
      </div>
    </div>
    <nav className="nav-links">
      <button
        type="button"
        className={`nav-link ${active === "landing" ? "active" : ""}`}
        onClick={() => onNavigate("landing")}
      >
        Home
      </button>
      <button
        type="button"
        className={`nav-link ${active === "dashboard" ? "active" : ""}`}
        onClick={() => onNavigate("dashboard")}
      >
        Matching
      </button>
    </nav>
    <div className="nav-actions">
      {userName ? (
        <>
          <div className="nav-profile">
            <span className="nav-profile__name">{userName}</span>
            {userEmail && <span className="nav-profile__meta">{userEmail}</span>}
            {userRoles && userRoles.length > 0 && (
              <span className="nav-profile__roles">{userRoles.join(" · ")}</span>
            )}
          </div>
          <button type="button" className="button button--ghost" onClick={onLogout}>
            Sign out
          </button>
        </>
      ) : (
          <button type="button" className="button" onClick={() => onNavigate("landing")}>
          Sign in
        </button>
      )}
    </div>
  </header>
);
