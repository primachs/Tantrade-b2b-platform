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
  const {
    token,
    user,
    loading,
    error,
    ready,
    setError,
    login,
    register,
    logout,
    selectService,
    needsServiceSelection,
  } = useAuth();
  const [route, setRoute] = useState<AppRoute>("landing");
  const [selectedService, setSelectedService] = useState<ServicePath>(null);
  const [serviceSetupMode, setServiceSetupMode] = useState(false);

  // Redirect authenticated users: no roles → service selection; otherwise dashboard
  useEffect(() => {
    if (!ready || !user) return;

    if (needsServiceSelection(user)) {
      setServiceSetupMode(true);
      if (route !== "service-select") {
        setRoute("service-select");
      }
      return;
    }

    setServiceSetupMode(false);
    if (route === "landing" || route === "auth" || route === "service-select") {
      setRoute("dashboard");
    }
  }, [ready, user, route, needsServiceSelection]);

  const handleNavigate = (next: AppRoute) => {
    if (next === "dashboard" && !user) {
      setRoute("landing");
      return;
    }
    if (next === "dashboard" && user && needsServiceSelection(user)) {
      setServiceSetupMode(true);
      setRoute("service-select");
      return;
    }
    setRoute(next);
  };

  const handleServiceSelect = async (service: "matching" | "governance") => {
    if (serviceSetupMode && user) {
      const ok = await selectService(service);
      if (ok) {
        setSelectedService(service);
        setServiceSetupMode(false);
        setRoute("dashboard");
      }
      return;
    }
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
    setServiceSetupMode(false);
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
        onLoginClick={handleSignIn}
      />

      {route === "landing" && (
        <LandingPage onGetStarted={() => handleNavigate("service-select")} />
      )}

      {route === "service-select" && (
        <ServiceSelectionPage
          setupMode={serviceSetupMode}
          loading={loading}
          error={error}
          onClearError={() => setError(null)}
          onSelectService={handleServiceSelect}
          onSignIn={serviceSetupMode ? undefined : handleSignIn}
          onBack={() => (serviceSetupMode ? undefined : handleNavigate("landing"))}
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

      {route === "dashboard" && user && !needsServiceSelection(user) && (
        <DashboardPage token={token} user={user} />
      )}
    </div>
  );
}
