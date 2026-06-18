import { useEffect, useState } from "react";
import { BrandHeader } from "./presentation/components/BrandHeader";
import { LandingPage } from "./presentation/pages/LandingPage";
import { ServiceSelectionPage } from "./presentation/pages/ServiceSelectionPage";
import { LoginPage } from "./presentation/pages/LoginPage";
import { DashboardPage } from "./presentation/pages/DashboardPage";
import { useAuth } from "./modules/auth/useAuth";

type AppRoute = "landing" | "service-select" | "auth" | "dashboard";
type ServicePath = "matching" | "governance" | null;

export default function App() {
  const { token, user, loading, error, ready, setError, login, register, logout } =
    useAuth();
  const [route, setRoute] = useState<AppRoute>("landing");
  const [selectedService, setSelectedService] = useState<ServicePath>(null);

  // Auto-route to dashboard once user is authenticated and ready
  useEffect(() => {
    if (ready && user && (route === "landing" || route === "auth" || route === "service-select")) {
      setRoute("dashboard");
    }
  }, [ready, route, user]);

  const handleNavigate = (next: AppRoute) => {
    if (next === "dashboard" && !user) {
      setRoute("landing");
      return;
    }
    setRoute(next);
  };

  const handleServiceSelect = (service: "matching" | "governance") => {
    setSelectedService(service);
    setRoute("auth");
  };

  const handleSignIn = () => {
    setSelectedService(null);
    setRoute("auth");
  };

  const handleLogout = async () => {
    await logout();
    setSelectedService(null);
    setRoute("landing");
  };

  return (
    <div className="app-shell">
      <BrandHeader
        userName={user?.name}
        userEmail={user?.email}
        userRoles={user?.roles}
        onLogout={handleLogout}
        onLogoClick={() => handleNavigate("landing")}
      />

      {route === "landing" && (
        <LandingPage onGetStarted={() => handleNavigate("service-select")} />
      )}

      {route === "service-select" && (
        <ServiceSelectionPage
          onSelectService={handleServiceSelect}
          onSignIn={handleSignIn}
          onBack={() => handleNavigate("landing")}
        />
      )}

      {route === "auth" && (
        <LoginPage
          token={token}
          userName={user?.name}
          selectedService={selectedService}
          onLogin={login}
          onRegister={register}
          onContinueToDashboard={() => handleNavigate("dashboard")}
          loading={loading}
          error={error}
          onClearError={() => setError(null)}
        />
      )}

      {route === "dashboard" && user && (
        <DashboardPage token={token} user={user} />
      )}
    </div>
  );
}
