import tantradeLogo from "../../assets/tantrade-brand.png";
import coatOfArms from "../../assets/tanzania-coat-of-arms.png";

type BrandHeaderProps = {
  userName?: string;
  userEmail?: string;
  userRoles?: string[];
  onLogout?: () => void;
  onLogoClick: () => void; // Added this line
};

export const BrandHeader = ({
  userName,
  userEmail,
  userRoles,
  onLogout,
  onLogoClick // Added this line
}: BrandHeaderProps) => (
  <header className="top-nav" style={{ paddingTop: '0px', paddingBottom: '0px' }}>
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
    <div className="nav-brand__meta" style={{ marginLeft: 'auto' }}>
      <img className="nav-logo" src={tantradeLogo} alt="TanTrade logo" style={{ width: '80px', height: 'auto' }}/>
      <span className="nav-caption">Tanzania Trade Development Authority</span>
    </div>
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
      ) : null}
    </div>
  </header>
);