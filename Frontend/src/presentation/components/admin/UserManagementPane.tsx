import { useState, useEffect } from "react";
import { AuthUser } from "./types";
import { apiRequest } from "../../../api/client";
import { Shield, ShieldOff, CheckCircle2, XCircle } from "lucide-react";

type Role = { id: string; name: string; description: string };

type UserManagementPaneProps = {
  token: string;
  authUsers: AuthUser[];
  onRefresh: () => void;
  setNotice: (type: "success" | "error", msg: string) => void;
};

export const UserManagementPane = ({ token, authUsers, onRefresh, setNotice }: UserManagementPaneProps) => {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await apiRequest<Role[]>("/auth/roles/all", { token });
        setAllRoles(roles);
      } catch (err) {
        setNotice("error", "Failed to load roles.");
      }
    };
    fetchRoles();
  }, [token]);

  const toggleRole = async (userId: string, role: Role, hasRole: boolean) => {
    setLoading(true);
    try {
      if (hasRole) {
        await apiRequest(`/auth/roles/${role.id}`, { method: "DELETE", token, body: { user_id: userId } });
        setNotice("success", `Revoked role ${role.name}`);
      } else {
        await apiRequest(`/auth/roles/${role.id}`, { method: "POST", token, body: { user_id: userId } });
        setNotice("success", `Assigned role ${role.name}`);
      }
      onRefresh();
    } catch (err) {
      setNotice("error", "Failed to update role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="section-head">
        <div className="section-title">
          <Shield className="icon" />
          <div>
            <h2>User Management</h2>
            <p>Manage system users and their access roles.</p>
          </div>
        </div>
        {loading && <span className="pill">Updating...</span>}
      </div>

      <div className="surface">
        {authUsers.length === 0 ? (
          <p className="muted">No users registered.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {authUsers.map((user) => {
                const isEditing = editingUserId === user.id;
                return (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.roles.map(r => <span key={r} className="tag">{r}</span>)}
                      {user.roles.length === 0 && <span className="muted">No roles</span>}
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                          {allRoles.map(role => {
                            const hasRole = user.roles.includes(role.name);
                            return (
                              <button
                                key={role.id}
                                className={`btn-sm ${hasRole ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => toggleRole(user.id, role, hasRole)}
                                disabled={loading}
                                style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
                              >
                                {hasRole ? <ShieldOff className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
                                {role.name}
                              </button>
                            );
                          })}
                          <button className="btn-sm btn-ghost" onClick={() => setEditingUserId(null)}>
                            Done
                          </button>
                        </div>
                      ) : (
                        <button className="btn-sm btn-outline" onClick={() => setEditingUserId(user.id)}>
                          Edit Roles
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};
