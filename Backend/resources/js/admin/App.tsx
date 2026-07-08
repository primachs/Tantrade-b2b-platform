import { useEffect, useState } from "react";
import { apiRequest } from "./client";
import { AdminDashboard } from "./components/AdminDashboard";
import { AuthUser, Business, Rfs, TaxonomyResponse, Market, Broker } from "./components/types";
import { LogIn, AlertCircle } from "lucide-react";

export const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") ?? "");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin Data
  const [dataLoading, setDataLoading] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [rfsList, setRfsList] = useState<Rfs[]>([]);
  const [taxonomy, setTaxonomy] = useState<TaxonomyResponse | null>(null);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [notice, setNoticeState] = useState<{type: "success" | "error", msg: string} | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("admin_token", token);
    } else {
      localStorage.removeItem("admin_token");
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setReady(true);
      return;
    }

    const loadMe = async () => {
      setReady(false);
      try {
        const profile = await apiRequest<AuthUser>("/auth/me", { token });
        // Check if user has ADMIN role
        if (!profile.roles?.includes("ADMIN")) {
          throw new Error("Unauthorized: Admin role required");
        }
        setUser(profile);
      } catch (err) {
        setUser(null);
        setToken("");
        setLoginError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        setReady(true);
      }
    };

    loadMe();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const [biz, rfs, tax, users, mkt, brk] = await Promise.all([
        apiRequest<Business[]>("/businesses", { token }),
        apiRequest<Rfs[]>("/rfs", { token }),
        apiRequest<TaxonomyResponse>("/taxonomy", { token }),
        apiRequest<AuthUser[]>("/auth/users", { token }),
        apiRequest<Market[]>("/market-governance/markets", { token }),
        apiRequest<Broker[]>("/market-governance/brokers", { token })
      ]);
      setBusinesses(Array.isArray(biz) ? biz : []);
      setRfsList(Array.isArray(rfs) ? rfs : []);
      setTaxonomy(tax && typeof tax === "object" ? tax : null);
      setAuthUsers(Array.isArray(users) ? users : []);
      setMarkets(Array.isArray(mkt) ? mkt : []);
      setBrokers(Array.isArray(brk) ? brk : []);
    } catch (err) {
      setNotice("error", err instanceof Error ? err.message : "Failed to load admin overview.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    try {
      const payload = await apiRequest<{token: string; user: AuthUser}>("/auth/login", {
        method: "POST",
        body: {
          email,
          password,
          device_name: "admin-web",
        },
      });
      if (!payload.user.roles?.includes("ADMIN")) {
        throw new Error("Unauthorized: Admin role required");
      }
      setToken(payload.token);
      setUser(payload.user);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await apiRequest("/auth/logout", { method: "POST", token });
      }
    } catch (e) {
      // ignore
    }
    setToken("");
    setUser(null);
  };

  const setNotice = (type: "success" | "error", msg: string) => {
    setNoticeState({ type, msg });
    setTimeout(() => setNoticeState(null), 5000);
  };

  if (!ready) {
    return (
      <div className="adm-loading-screen">
        <div className="adm-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="adm-login-shell">
        <div className="adm-login-bg-shapes">
          <div className="adm-shape adm-shape-1"></div>
          <div className="adm-shape adm-shape-2"></div>
          <div className="adm-shape adm-shape-3"></div>
        </div>
        <div className="adm-login-card">
          <div className="adm-login-brand">
            <div className="adm-login-icon-wrap">
              <AlertCircle style={{ width: 24, height: 24 }} className="adm-icon" />
            </div>
            <h2>TanTrade Admin</h2>
            <p>Access the administrative console</p>
          </div>
          
          {loginError && (
            <div className="adm-notice adm-notice--error" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="adm-login-form">
            <div className="adm-field">
              <label>Email Address</label>
              <input 
                type="email" 
                className="adm-input" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                disabled={loading}
                placeholder="admin@tantrade.go.tz"
              />
            </div>
            <div className="adm-field">
              <label>Password</label>
              <input 
                type="password" 
                className="adm-input" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                disabled={loading}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="adm-btn adm-btn-primary adm-btn-block" disabled={loading}>
              {loading ? "Authenticating..." : (
                <>
                  <LogIn style={{ width: 18, height: 18 }} /> Sign In to Dashboard
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell admin-app">
      {notice && (
        <div className={`admin-toast adm-toast--${notice.type}`} role="status">
          {notice.msg}
        </div>
      )}
      <AdminDashboard
        token={token}
        user={user}
        authUsers={authUsers}
        businesses={businesses}
        rfsList={rfsList}
        taxonomy={taxonomy}
        markets={markets}
        brokers={brokers}
        loading={dataLoading}
        onRefresh={loadData}
        setNotice={setNotice}
        onLogout={handleLogout}
      />
    </div>
  );
};
