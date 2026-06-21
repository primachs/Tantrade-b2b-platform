import tantradeLogo from "../../assets/tantrade-brand.png";
import coatOfArms from "../../assets/tanzania-coat-of-arms.png";

type BrandHeaderProps = {
  userName?: string;
  userEmail?: string;
  userRoles?: string[];
  onLogout?: () => void;
  onLogoClick: () => void;
  onLoginClick?: () => void;
};

export const BrandHeader = ({
  userName,
  userEmail,
  userRoles,
  onLogout,
  onLogoClick,
  onLoginClick
}: BrandHeaderProps) => {
  const visibleRoles = userRoles?.filter(role => role !== "BUYER" && role !== "SELLER") || [];

  return (
    <header className="top-nav" style={{ paddingTop: '0px', paddingBottom: '0px', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="nav-brand">
        <a 
          href="#" 
          className="nav-brand__link"
          onClick={(e) => {
            e.preventDefault();
            onLogoClick();
          }}
        >
          <img className="nav-coat" src={coatOfArms} alt="Tanzania coat of arms" style={{ width: '80px', height: 'auto' }} />
        </a>
      </div>
      <div className="nav-brand__meta" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center' }}>
        <img className="nav-logo" src={tantradeLogo} alt="TanTrade logo" style={{ width: '90px', height: 'auto' }}/>
        <span className="nav-caption">Tanzania Trade Development Authority</span>
      </div>
      <div className="nav-actions">
        {userName ? (
          <>
            <div className="nav-profile">
              <span className="nav-profile__name">{userName}</span>
              {userEmail && <span className="nav-profile__meta">{userEmail}</span>}
              {visibleRoles.length > 0 && (
                <span className="nav-profile__roles">{visibleRoles.join(" · ")}</span>
              )}
            </div>
            <button type="button" className="button button--ghost" onClick={onLogout}>
              Sign out
            </button>
          </>
        ) : onLoginClick ? (
          <button type="button" className="button button--primary" onClick={onLoginClick}>
            Sign In
          </button>
        ) : null}
      </div>
    </header>
  );
};