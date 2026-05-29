import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { BusinessView } from "../components/BusinessView";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  roles?: string[];
};

type DashboardPageProps = {
  token: string;
  user: AuthUser;
};

type Notice = { type: "success" | "error"; message: string };

export const DashboardPage = ({ token, user }: DashboardPageProps) => {
  const [notice, setNotice] = useState<Notice | null>(null);

  const roles = useMemo(() => new Set(user.roles ?? []), [user.roles]);
  const isBuyer = roles.has("BUYER");
  const isSeller = roles.has("SELLER");
  const showBusiness = isBuyer || isSeller;
  const hasRoles = showBusiness;

  const setNoticeMessage = (type: Notice["type"], message: string) => {
    setNotice({ type, message });
  };

  return (
    <main className="page dashboard">
      {notice && (
        <div className={`notice notice--${notice.type}`}>
          {notice.type === "success" ? <CheckCircle2 className="icon" /> : null}
          {notice.message}
        </div>
      )}

      {!hasRoles && (
        <section className="page-section">
          <div className="section-head">
            <div className="section-title">
              <AlertTriangle className="icon" />
              <div>
                <h2>Role assignment required</h2>
                <p>This account has no matching roles assigned. Contact an administrator to continue.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {showBusiness && (
        <BusinessView
          token={token}
          user={user}
          isBuyer={isBuyer}
          isSeller={isSeller}
          setNotice={setNoticeMessage}
        />
      )}
    </main>
  );
};
