import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from 'src/api/auth.api.js';
import { getToken, setToken, clearToken } from 'src/api/client.js';

export const AuthContext = createContext(null);

// Holds the authenticated user. On mount, if a token exists, it restores the
// session via /auth/me. Exposes login/logout and the current role.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return undefined;
    let active = true;
    authApi
      .getMe()
      .then((res) => {
        if (active) setUser(res.data);
      })
      .catch(() => clearToken())
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      role: user?.role ?? null,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
