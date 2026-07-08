import { Network, ShieldCheck } from "lucide-react";
import tantradeLogo from "../../assets/tantrade-brand.png";
import coatOfArms from "../../assets/tanzania-coat-of-arms.png";

type HeroProps = {
  apiBaseInput: string;
  apiBase: string;
  token: string;
  authEmail: string;
  authName: string;
  onApiBaseChange: (value: string) => void;
  onTokenChange: (value: string) => void;
  onClearToken: () => void;
};

export const Hero = ({
  apiBaseInput,
  apiBase,
  token,
  authEmail,
  authName,
  onApiBaseChange,
  onTokenChange,
  onClearToken
}: HeroProps) => (
  <header className="hero">
    <div className="hero-copy">
      <div className="brand-bar">
        <img className="brand-coat" src={coatOfArms} alt="Tanzania coat of arms" />
        <div className="brand-meta">
          <img className="brand-logo" src={tantradeLogo} alt="TanTrade logo" />
          <span className="brand-caption">Tanzania Trade Development Authority</span>
        </div>
      </div>
      <span className="hero-eyebrow">Government Trade Enablement Console</span>
      <h1>TanTrade Market Governance &amp; B2B Matching Console</h1>
      <p>
        Official operations workspace for registration, governance oversight, and
        matching execution across Tanzania's trade ecosystem.
      </p>
    </div>
    <div className="hero-panel">
      <div className="hero-panel__row">
        <label className="field">
          <span>API base</span>
          <input
            className="input"
            type="text"
            value={apiBaseInput}
            onChange={(event) => onApiBaseChange(event.target.value)}
            placeholder="http://localhost:8000/api"
          />
        </label>
        <label className="field">
          <span>Sanctum token</span>
          <input
            className="input"
            type="text"
            value={token}
            onChange={(event) => onTokenChange(event.target.value)}
            placeholder="Paste token here"
          />
        </label>
      </div>
      <div className="hero-panel__meta">
        <div className="pill">
          <Network className="icon" /> {apiBase}
        </div>
        <button className="button button--ghost" type="button" onClick={onClearToken}>
          Clear token
        </button>
      </div>
      <div className="hero-profile">
        <div className="hero-profile__icon">
          <ShieldCheck className="icon" />
        </div>
        <div>
          <p className="hero-profile__title">Active identity</p>
          <p className="hero-profile__value">
            {authEmail || "Not authenticated"}
          </p>
          <p className="hero-profile__hint">
            {authName || "Login to hydrate profile."}
          </p>
        </div>
      </div>
    </div>
  </header>
);
