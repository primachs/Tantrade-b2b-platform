import { useState, useEffect } from "react";
import { apiRequest } from "../../api/client";
import { Business, Rfs, TaxonomyResponse, AuthUser } from "./b2b/types";
import { LandingHub } from "./b2b/LandingHub";
import { BusinessDashboard } from "./b2b/BusinessDashboard";

type BusinessViewProps = {
  token: string;
  user: AuthUser;
  setNotice: (type: "success" | "error", msg: string) => void;
};

export const BusinessView = ({ token, user, setNotice }: BusinessViewProps) => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"hub" | "dashboard">("hub");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [myBusiness, setMyBusiness] = useState<Business | null>(null);
  const [rfsList, setRfsList] = useState<Rfs[]>([]);
  const [taxonomy, setTaxonomy] = useState<TaxonomyResponse | null>(null);

  const loadData = async (forceDashboard = false) => {
    setLoading(true);
    try {
      // First try to load the user's specific business
      let myBiz: Business | null = null;
      try {
        const myBizResponse = await apiRequest<Business>("/businesses/my-business", { token });
        if (myBizResponse && myBizResponse.id) {
            myBiz = myBizResponse;
        }
      } catch (e) {
          // It's expected to fail 404 if the user hasn't registered a business yet
      }

      // Then load other required data
      const [rfs, tax] = await Promise.all([
        apiRequest<Rfs[]>("/rfs", { token }),
        apiRequest<TaxonomyResponse>("/taxonomy", { token })
      ]);
      
      setRfsList(Array.isArray(rfs) ? rfs : []);
      setTaxonomy(tax && typeof tax === "object" ? tax : null);
      setMyBusiness(myBiz);
      setBusinesses(myBiz ? [myBiz] : []);

      if (forceDashboard && myBiz) {
        setViewMode("dashboard");
      }

    } catch (err) {
      setNotice("error", "Failed to load Business Workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, user]);

  if (loading && !myBusiness && businesses.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <span style={{ color: "#64748b" }}>Loading Workspace...</span>
      </div>
    );
  }

  if (viewMode === "hub" || !myBusiness) {
    return (
      <LandingHub 
        token={token} 
        user={user} 
        setNotice={setNotice} 
        onRegistered={() => loadData(true)} 
        hasBusiness={!!myBusiness}
        onGoToDashboard={() => setViewMode("dashboard")}
      />
    );
  }

  return (
    <BusinessDashboard 
      token={token} 
      myBusiness={myBusiness} 
      taxonomy={taxonomy} 
      rfsList={rfsList} 
      loading={loading}
      onRefresh={() => loadData(true)}
      setNotice={setNotice} 
    />
  );
};