import { useEffect, useState } from "react";
import { BrandHeader } from "./presentation/components/BrandHeader";
import { LandingPage } from "./presentation/pages/LandingPage";
import { DashboardPage } from "./presentation/pages/DashboardPage";
import { useAuth } from "./modules/auth/useAuth";

export default function App() {
  const { token, user, loading, error, setError, login, logout } = useAuth();
  const [route, setRoute] = useState<"landing" | "dashboard">("landing");

  useEffect(() => {
    if (user) {
      setRoute("dashboard");
    }
  }, [user]);

  const handleNavigate = (next: "landing" | "dashboard") => {
    if (next === "dashboard" && !user) {
      setRoute("landing");
      return;
    }
    setRoute(next);
  };

  const handleLogout = async () => {
    await logout();
    setRoute("landing");
  };

  return (
    <div className="app-shell">
      <BrandHeader
        active={route}
        onNavigate={handleNavigate}
        userName={user?.name}
        userEmail={user?.email}
        userRoles={user?.roles}
        onLogout={handleLogout}
      />

      {route === "landing" && (
        <LandingPage
          onLogin={login}
          loading={loading}
          error={error}
          onClearError={() => setError(null)}
        />
      )}

      {route === "dashboard" && user && (
        <DashboardPage
          token={token}
          user={user}
        />
      )}
    </div>
  );
}
