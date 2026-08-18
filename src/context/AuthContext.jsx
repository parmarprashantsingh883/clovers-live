import { createContext, useContext, useEffect, useState } from "react";
import { api, setAccessToken, setSessionExpiredHandler } from "@/lib/api";

/**
 * Real authentication — JWT access token in memory, httpOnly refresh cookie
 * for silent session restore. Passwords never touch the client: the server
 * verifies bcrypt hashes and only ever returns safe user fields.
 */
const AuthContext = createContext(null);

const toAuthUser = (u) => ({ id: u.id, name: u.fullName, email: u.email, role: u.role });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const applyAuth = (u, token) => {
    setAccessToken(token);
    setUser(toAuthUser(u));
  };
  const clearAuth = () => {
    setAccessToken(null);
    setUser(null);
  };

  // Silent session restore via the refresh cookie on first mount.
  useEffect(() => {
    setSessionExpiredHandler(clearAuth);
    (async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        applyAuth(data.data.user, data.data.accessToken);
      } catch {
        /* not logged in */
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    applyAuth(data.data.user, data.data.accessToken);
    return toAuthUser(data.data.user);
  };

  const loginAdmin = async (email, password) => {
    const { data } = await api.post("/auth/admin/login", { email, password });
    applyAuth(data.data.user, data.data.accessToken);
    return toAuthUser(data.data.user);
  };

  const signup = async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    applyAuth(data.data.user, data.data.accessToken);
    return toAuthUser(data.data.user);
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, booting, login, loginAdmin, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
