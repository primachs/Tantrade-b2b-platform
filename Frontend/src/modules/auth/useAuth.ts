import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  roles?: string[];
};

type LoginResponse = {
  token: string;
  user: AuthUser;
};

type RegisterResponse = AuthUser;

type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

const TOKEN_KEY = "tantrade_token";

export const useAuth = () => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setReady(true);
      return;
    }

    const loadMe = async () => {
      setReady(false);
      try {
        const profile = await apiRequest<AuthUser>("/auth/me", { token });
        setUser(profile);
      } catch (err) {
        setUser(null);
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        setReady(true);
      }
    };

    loadMe();
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: {
          email,
          password,
          device_name: "web",
        },
      });
      setToken(payload.token);
      setUser(payload.user);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user account. If a service path is provided, the backend
   * assigns the corresponding role automatically. After a successful registration
   * the function immediately signs the user in so they land on their service
   * dashboard without any extra steps.
   */
  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    service?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest<RegisterResponse>("/auth/register", {
        method: "POST",
        body: {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          ...(service ? { service } : {}),
        },
      });

      // Auto-login after successful registration so the user lands directly on
      // their service dashboard with all permissions already assigned.
      const loginOk = await login(email, password);
      return loginOk;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string
  ) => {
    if (!token) {
      setError("You must be signed in to change your password.");
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      await apiRequest<{ message: string }>("/auth/password/change", {
        method: "POST",
        token,
        body: {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: newPasswordConfirmation,
        },
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password change failed.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!token) {
      setUser(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiRequest("/auth/logout", { method: "POST", token });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed.");
    } finally {
      setToken("");
      setUser(null);
      setLoading(false);
    }
  };

  return {
    token,
    user,
    loading,
    error,
    ready,
    setError,
    login,
    register,
    changePassword,
    logout,
  };
};
