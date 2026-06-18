import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Layers, MapPin, Radar } from "lucide-react";
import { BusinessView } from "../components/BusinessView";
import { GovernanceView } from "../components/GovernanceView";
import { AdminView } from "../components/AdminView";

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

type Workspace = "admin" | "governance" | "business";

type WorkspaceOption = {
  id: Workspace;
  label: string;
  icon: React.ReactNode;
};

export const DashboardPage = ({ token, user }: DashboardPageProps) => {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  const roles = useMemo(() => new Set(user.roles ?? []), [user.roles]);
  const isAdmin = roles.has("ADMIN");
  const isGovernance = roles.has("GOVERNANCE");
  const isBuyer = roles.has("BUYER");
  const isSeller = roles.has("SELLER");
  const showBusiness = isBuyer || isSeller;

  const workspaces = useMemo(() => {
    const list: WorkspaceOption[] = [];
    if (isAdmin) {
      list.push({ id: "admin", label: "Platform Admin", icon: <Layers className="w-4 h-4" /> });
    }
    if (isGovernance) {
      list.push({
        id: "governance",
        label: "Market Governance",
        icon: <MapPin className="w-4 h-4" />,
      });
    }
    if (showBusiness) {
      list.push({
        id: "business",
        label: "B2B Matchmaking",
        icon: <Radar className="w-4 h-4" />,
      });
    }
    return list;
  }, [isAdmin, isGovernance, showBusiness]);

  useEffect(() => {
    if (workspaces.length === 0) {
      setActiveWorkspace(null);
      return;
    }
    if (!activeWorkspace || !workspaces.some((w) => w.id === activeWorkspace)) {
      setActiveWorkspace(workspaces[0].id);
    }
  }, [activeWorkspace, workspaces]);

  const setNoticeMessage = (type: Notice["type"], message: string) => {
    setNotice({ type, message });
  };

  const hasRoles = workspaces.length > 0;

  return (
    <main className="page dashboard">
      {notice && (
        <div className={`notice notice--${notice.type}`}>
          {notice.type === "success" ? <CheckCircle2 className="icon" /> : null}
          {notice.message}
        </div>
      )}

      {workspaces.length > 1 && activeWorkspace && (
        <nav className="workspace-tabs" aria-label="Workspace switcher">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              type="button"
              className={
                activeWorkspace === workspace.id
                  ? "workspace-tab workspace-tab--active"
                  : "workspace-tab"
              }
              onClick={() => setActiveWorkspace(workspace.id)}
            >
              {workspace.icon}
              {workspace.label}
            </button>
          ))}
        </nav>
      )}

      {!hasRoles && (
        <section className="page-section">
          <div className="section-head">
            <div className="section-title">
              <AlertTriangle className="icon" />
              <div>
                <h2>Role assignment required</h2>
                <p>
                  This account has no matching roles assigned. Contact an administrator to
                  continue.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeWorkspace === "admin" && isAdmin && (
        <AdminView token={token} user={user} setNotice={setNoticeMessage} />
      )}

      {activeWorkspace === "governance" && isGovernance && (
        <GovernanceView token={token} user={user} setNotice={setNoticeMessage} />
      )}

      {activeWorkspace === "business" && showBusiness && (
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
