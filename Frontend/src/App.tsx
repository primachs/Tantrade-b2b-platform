import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { BrandHeader } from "./presentation/components/BrandHeader";
import { LandingPage } from "./presentation/pages/LandingPage";
import { ServiceSelectionPage } from "./presentation/pages/ServiceSelectionPage";
import { LoginPage } from "./presentation/pages/LoginPage";
import { DashboardPage } from "./presentation/pages/DashboardPage";
import { useAuth } from "./modules/auth/useAuth";

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

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect authenticated users: no roles → service selection; otherwise dashboard
  useEffect(() => {
    if (!ready) return;

    if (user) {
      if (needsServiceSelection(user)) {
        if (location.pathname !== "/service-select") {
          navigate("/service-select", { replace: true });
        }
      } else {
        if (["/", "/login", "/service-select"].includes(location.pathname)) {
          navigate("/dashboard", { replace: true });
        }
      }
    } else {
      if (["/dashboard"].includes(location.pathname)) {
        navigate("/", { replace: true });
      }
    }
  }, [ready, user, location.pathname, navigate, needsServiceSelection]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (!ready) {
    return <div className="app-shell flex items-center justify-center min-h-screen text-brand-blue">Loading...</div>;
  }

  // Extract selected service from query params if any
  const searchParams = new URLSearchParams(location.search);
  const selectedServiceFromUrl = searchParams.get("service") as ServicePath;

  return (
    <div className="app-shell">
      <BrandHeader
        userName={user?.name}
        userEmail={user?.email}
        userRoles={user?.roles}
        onLogout={handleLogout}
        onLogoClick={() => navigate("/")}
        onLoginClick={() => navigate("/login")}
      />

      <Routes>
        <Route path="/" element={<LandingPage onGetStarted={() => navigate("/service-select")} />} />

        <Route path="/service-select" element={
          <ServiceSelectionPage
            setupMode={!!user}
            loading={loading}
            error={error}
            onClearError={() => setError(null)}
            onSelectService={async (service) => {
              if (user) {
                const ok = await selectService(service);
                if (ok) navigate("/dashboard");
              } else {
                navigate(`/login?service=${service}`);
              }
            }}
            onSignIn={!user ? () => navigate("/login") : undefined}
            onBack={() => navigate("/")}
          />
        } />

        <Route path="/login" element={
          <LoginPage
            token={token}
            userName={user?.name}
            selectedService={selectedServiceFromUrl}
            onLogin={login}
            onRegister={register}
            onContinueToDashboard={() => navigate("/dashboard")}
            loading={loading}
            error={error}
            onClearError={() => setError(null)}
          />
        } />

        <Route path="/dashboard" element={
          user && !needsServiceSelection(user) ? <DashboardPage token={token} user={user} /> : <Navigate to="/" replace />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
