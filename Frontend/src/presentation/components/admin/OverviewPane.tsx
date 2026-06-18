import { Radar } from "lucide-react";
import { AuthUser, Business, Rfs, ServiceType } from "./types";

type OverviewPaneProps = {
  user: { name: string };
  authUsers: AuthUser[];
  businesses: Business[];
  rfsList: Rfs[];
  serviceTypes: ServiceType[];
};

export const OverviewPane = ({ user, authUsers, businesses, rfsList, serviceTypes }: OverviewPaneProps) => {
  return (
    <section>
      <div className="section-head">
        <div className="section-title">
          <Radar className="icon" />
          <div>
            <h2>Operations overview</h2>
            <p>Welcome back, {user.name}. Current system health at a glance.</p>
          </div>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Registered users</span>
          <span className="stat-value">{authUsers.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Registered businesses</span>
          <span className="stat-value">{businesses.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active RFS</span>
          <span className="stat-value">{rfsList.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Service types</span>
          <span className="stat-value">{serviceTypes.length}</span>
        </div>
      </div>
    </section>
  );
};
