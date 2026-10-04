import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from 'src/api/auth.api.js';
import { getToken, setToken, clearToken } from 'src/api/client.js';

export const AuthContext = createContext(null);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Backoff between /auth/me retries on startup — rides out a slow/cold-starting
// backend or a brief network blip instead of bouncing the user to /login.
const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 15000];

// Holds the authenticated user. On mount, if a token exists, it restores the
// session via /auth/me. Exposes login/logout and the current role.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return undefined;
    let active = true;

    const restoreSession = async () => {
      for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
        try {
          const res = await authApi.getMe();
          if (active) setUser(res.data);
          return;
        } catch (err) {
          // 401/403 means the server actively rejected this token (deleted,
          // deactivated, or genuinely bad) — that's a real logout, don't retry.
          if (err.status === 401 || err.status === 403) {
            clearToken();
            return;
          }
          // Anything else (network error, timeout, 5xx, a rate-limited 429, a
          // cold-starting server) is likely transient — retry a few times
          // before giving up, and even then leave the token alone so the next
          // page load can pick the session back up once things recover.
          if (attempt < RETRY_DELAYS_MS.length && active) {
            await sleep(RETRY_DELAYS_MS[attempt]);
          }
        }
      }
    };

    restoreSession().finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  // loginId is the 10-digit phone number.
  const login = useCallback(async (phone, password) => {
    const res = await authApi.login({ phone, password });
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
