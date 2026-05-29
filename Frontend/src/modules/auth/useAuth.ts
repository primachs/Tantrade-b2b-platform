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

const TOKEN_KEY = "tantrade_token";

export const useAuth = () => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      return;
    }

    const loadMe = async () => {
      try {
        const profile = await apiRequest<AuthUser>("/auth/me", { token });
        setUser(profile);
      } catch (err) {
        setUser(null);
        setError(err instanceof Error ? err.message : "Failed to load profile.");
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
          device_name: "web"
        }
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
    setError,
    login,
    logout
  };
};
