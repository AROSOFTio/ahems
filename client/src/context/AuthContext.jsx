import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);
const STORAGE_KEY = "ahems_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      setUser(parsed.user);
      setToken(parsed.token);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistSession = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user: nextUser,
        token: nextToken,
      }),
    );
  };

  const clearSession = () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const login = async (credentials) => {
    const payload = await authService.login(credentials);
    persistSession(payload.user, payload.token);
    return payload.user;
  };

  const register = async (registration) => {
    const payload = await authService.register(registration);
    persistSession(payload.user, payload.token);
    return payload.user;
  };

  const logout = () => clearSession();

  const refreshProfile = async () => {
    if (!token) return null;
    const payload = await authService.me(token);
    persistSession(payload.user, token);
    return payload.user;
  };

  const updateProfile = async (profileInput) => {
    const payload = await authService.updateProfile(profileInput, token);
    persistSession(payload.user, token);
    return payload.user;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
      hasRole: (roles) => {
        if (!user) return false;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        return allowedRoles.includes(user.role);
      },
    }),
    [loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

