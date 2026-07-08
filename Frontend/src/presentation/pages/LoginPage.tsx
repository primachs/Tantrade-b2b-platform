import { useState } from "react";
import { BadgeCheck, KeyRound, LockKeyhole, MapPin, Radar, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type LoginPageProps = {
  token: string;
  userName?: string;
  selectedService: "matching" | "governance" | null;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    service?: string
  ) => Promise<boolean>;
  onContinueToDashboard: () => void;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
};

type AuthMode = "login" | "register";

const SERVICE_META = {
  matching: {
    label: "B2B Matchmaking Platform",
    icon: <Radar className="w-4 h-4" />,
    colorClass: "service-badge--blue",
  },
  governance: {
    label: "Broker Management System",
    icon: <MapPin className="w-4 h-4" />,
    colorClass: "service-badge--green",
  },
};

export const LoginPage = ({
  token,
  userName,
  selectedService,
  onLogin,
  onRegister,
  onContinueToDashboard,
  loading,
  error,
  onClearError,
}: LoginPageProps) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberSession, setRememberSession] = useState(true);
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const serviceMeta = selectedService ? SERVICE_META[selectedService] : null;

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    onClearError();
    setNotice(null);
    const ok = await onLogin(email, password);
    if (ok) {
      setNotice(
        rememberSession ? "Session kept on this device." : "Signed in successfully."
      );
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    onClearError();
    setNotice(null);
    if (registerPassword !== registerConfirm) {
      setNotice("Passwords do not match.");
      return;
    }
    // Pass the service path so the backend assigns the correct role automatically.
    // After success, useAuth auto-logs in — no manual sign-in step needed.
    const ok = await onRegister(
      name,
      registerEmail,
      registerPassword,
      registerConfirm,
      selectedService ?? undefined
    );
    if (ok) {
      setNotice("Account created. Taking you to your dashboard…");
    }
  };

  return (
    <main className="page auth-shell">
      <motion.section 
        className="auth-branding"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="auth-branding__seal" aria-hidden="true">
          <ShieldCheck className="auth-branding__secure-icon" />
        </div>
        <div className="auth-branding__copy">
          <p className="auth-kicker">TanTrade B2B Platform</p>
          <h1>Secure access for trade operations.</h1>
          {serviceMeta ? (
            <div className={`service-badge ${serviceMeta.colorClass}`}>
              {serviceMeta.icon}
              {serviceMeta.label}
            </div>
          ) : (
            <p>Sign in or create a new account to access the platform.</p>
          )}
        </div>
        <div className="auth-trust-rail">
          <span className="pill"><ShieldCheck className="icon" /> Secure gateway</span>
          <span className="pill"><LockKeyhole className="icon" /> Password control</span>
          <span className="pill"><BadgeCheck className="icon" /> Verified onboarding</span>
        </div>
      </motion.section>

      <motion.section 
        className="auth-card auth-card--focus"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      >
        <div className="auth-card__tabs" role="tablist" aria-label="Authentication options">
          <button
            type="button"
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === "register" ? "auth-tab active" : "auth-tab"}
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>

        <div className="auth-card__header">
          <div>
            {mode === "login" && (
              <>
                <h2>Sign in</h2>
                <p>Enter your registered credentials to access your dashboard.</p>
              </>
            )}
            {mode === "register" && (
              <>
                <h2>Create an account</h2>
                {serviceMeta ? (
                  <p>
                    Register for{" "}
                    <strong>{serviceMeta.label}</strong>. Your role will be
                    configured automatically.
                  </p>
                ) : (
                  <p>Register a TanTrade account before accessing platform workflows.</p>
                )}
              </>
            )}
          </div>
          <div className="auth-card__meta">
            {userName && <span className="status-pill ok">{userName}</span>}
            {token ? (
              <span className="status-pill ok">Session active</span>
            ) : (
              <span className="status-pill">No active session</span>
            )}
          </div>
        </div>

        {notice && <div className="notice notice--success">{notice}</div>}
        {error && <div className="notice notice--error">{error}</div>}

        <AnimatePresence mode="wait">
          {mode === "login" && (
            <motion.form 
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLogin} 
              className="form-grid auth-form-stack"
            >
              <label className="field">
                <span>Email address</span>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@tantrade.go.tz"
                />
              </label>
              <label className="field">
                <span>Password</span>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </label>
              <label className="field-inline auth-remember">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                />
                Keep me signed in on this device
              </label>
              <button
                className="button button--primary auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </motion.form>
          )}

          {mode === "register" && (
            <motion.form 
              key="register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleRegister} 
              className="form-grid auth-form-stack"
            >
              <label className="field">
                <span>Full name</span>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Asha Mwakalobo"
                />
              </label>
              <label className="field">
                <span>Email address</span>
                <input
                  className="input"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  placeholder="name@tantrade.go.tz"
                />
              </label>
              <label className="field">
                <span>Password</span>
                <input
                  className="input"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  placeholder="Minimum 12 characters"
                />
              </label>
              <label className="field">
                <span>Confirm password</span>
                <input
                  className="input"
                  type="password"
                  value={registerConfirm}
                  onChange={(e) => setRegisterConfirm(e.target.value)}
                  required
                  placeholder="Repeat the password"
                />
              </label>
              {serviceMeta && (
                <div className={`service-badge service-badge--form ${serviceMeta.colorClass}`}>
                  {serviceMeta.icon}
                  <span>
                    Registering as: <strong>{serviceMeta.label}</strong>
                  </span>
                </div>
              )}
              <button
                className="button button--primary auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating account…" : "Create account & continue"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="auth-card__footer">
          <span>TanTrade B2B Platform</span>
          <span>Version 1.0</span>
          {userName && (
            <button
              type="button"
              className="button button--ghost auth-continue"
              onClick={onContinueToDashboard}
            >
              Continue to dashboard
            </button>
          )}
        </div>
      </motion.section>
    </main>
  );
};
