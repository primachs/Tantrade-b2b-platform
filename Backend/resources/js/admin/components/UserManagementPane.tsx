import { useState, useEffect } from "react";
import { AuthUser } from "./types";
import { apiRequest, ApiError } from "../client";
import { Shield, ShieldOff } from "lucide-react";

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
      } catch {
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
        setNotice("success", `Revoked role: ${role.name}`);
      } else {
        await apiRequest(`/auth/roles/${role.id}`, { method: "POST", token, body: { user_id: userId } });
        setNotice("success", `Assigned role: ${role.name}`);
      }
      onRefresh();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to update role.";
      setNotice("error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-section">
      <div className="adm-section-head">
        <div className="adm-section-title-wrap">
          <div className="adm-section-icon">
            <Shield style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h2>User Management</h2>
            <p>Manage system users and their access roles.</p>
          </div>
        </div>
        {loading && <span className="adm-updating-pill">Updating…</span>}
      </div>

      {authUsers.length === 0 ? (
        <p className="adm-empty">No users registered yet.</p>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Roles</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {authUsers.map((user) => {
              const isEditing = editingUserId === user.id;
              return (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600, color: "var(--adm-text-main)" }}>{user.name}</td>
                  <td style={{ color: "var(--adm-text-muted)" }}>{user.email}</td>
                  <td>
                    {user.roles.length === 0
                      ? <span className="adm-tag adm-tag--warning">No roles</span>
                      : user.roles.map((r) => <span key={r} className="adm-tag" style={{ marginRight: "0.25rem" }}>{r}</span>)
                    }
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end" }}>
                        {allRoles.map((role) => {
                          const hasRole = user.roles.includes(role.name);
                          return (
                            <button
                              key={role.id}
                              type="button"
                              className={`adm-btn adm-btn-sm ${hasRole ? "adm-btn-primary" : "adm-btn-outline"}`}
                              onClick={() => toggleRole(user.id, role, hasRole)}
                              disabled={loading}
                            >
                              {hasRole
                                ? <ShieldOff style={{ width: 14, height: 14 }} />
                                : <Shield style={{ width: 14, height: 14 }} />
                              }
                              {role.name}
                            </button>
                          );
                        })}
                        <button type="button" className="adm-btn adm-btn-sm adm-btn-ghost" onClick={() => setEditingUserId(null)}>
                          Done
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="adm-btn adm-btn-sm adm-btn-outline" onClick={() => setEditingUserId(user.id)}>
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
  );
};