import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AuthUser, Business, Rfs, TaxonomyResponse, Market, Broker } from "./admin/types";

type AdminViewProps = {
  token: string;
  user: { name: string };
  setNotice: (type: "success" | "error", msg: string) => void;
};

export const AdminView = ({ token, user, setNotice }: AdminViewProps) => {
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [rfsList, setRfsList] = useState<Rfs[]>([]);
  const [taxonomy, setTaxonomy] = useState<TaxonomyResponse | null>(null);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);

  const loadData = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  return (
    <AdminDashboard
      token={token}
      user={user}
      authUsers={authUsers}
      businesses={businesses}
      rfsList={rfsList}
      taxonomy={taxonomy}
      markets={markets}
      brokers={brokers}
      loading={loading}
      onRefresh={loadData}
      setNotice={setNotice}
    />
  );
};
