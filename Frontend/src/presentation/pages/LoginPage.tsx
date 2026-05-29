import { useState } from "react";
import { KeyRound } from "lucide-react";

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
};

export const LoginPage = ({ onLogin, loading, error, onClearError }: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    onClearError();
    await onLogin(email, password);
  };

  return (
    <main className="page login-shell">
      <div className="form-card">
        <div className="form-header">
          <KeyRound className="icon" />
          <div>
            <h2>Secure Sign In</h2>
            <p>Use your registered TanTrade credentials.</p>
          </div>
        </div>
        {error && (
          <div className="notice notice--error">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form-grid">
          <label className="field">
            <span>Email address</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Enter your password"
            />
          </label>
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
};
