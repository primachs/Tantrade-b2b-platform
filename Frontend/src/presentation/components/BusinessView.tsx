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
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [myBusiness, setMyBusiness] = useState<Business | null>(null);
  const [rfsList, setRfsList] = useState<Rfs[]>([]);
  const [taxonomy, setTaxonomy] = useState<TaxonomyResponse | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [biz, rfs, tax] = await Promise.all([
        apiRequest<Business[]>("/businesses", { token }),
        apiRequest<Rfs[]>("/rfs", { token }),
        apiRequest<TaxonomyResponse>("/taxonomy", { token })
      ]);
      const loadedBusinesses = Array.isArray(biz) ? biz : [];
      setBusinesses(loadedBusinesses);
      setRfsList(Array.isArray(rfs) ? rfs : []);
      setTaxonomy(tax && typeof tax === "object" ? tax : null);

      // Simple match logic: find by exact email, or name fallback. In reality handled safely on backend.
      const found = loadedBusinesses.find((business) => business.email === user.email || business.name === user.name);
      setMyBusiness(found || null);
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

  if (!myBusiness) {
    return (
      <LandingHub 
        token={token} 
        user={user} 
        setNotice={setNotice} 
        onRegistered={loadData} 
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
      onRefresh={loadData}
      setNotice={setNotice} 
    />
  );
};