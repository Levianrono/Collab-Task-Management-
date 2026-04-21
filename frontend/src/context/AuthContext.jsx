// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, logoutUser } from '../api/auth.js';

const AuthContext = createContext(null);

// ── Dev bypass ─────────────────────────────────────────────────────────────
const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS === 'true';
const MOCK_USER = {
  id: 'dev-user-001',
  userId: 'dev-user-001',
  email: 'dev@taskflow.local',
  full_name: 'Dev User',
  avatar_url: null,
  created_at: new Date().toISOString(),
};

/**
 * Provides authentication state and actions throughout the app.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Attempt to restore session on mount
  useEffect(() => {
    if (DEV_BYPASS) {
      setUser(MOCK_USER);
      setLoading(false);
      return;
    }
    const restore = async () => {
      try {
        const { data } = await getMe();
        setUser(data.user);
      } catch {
        setUser(null);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback((userData, token) => {
    if (token) localStorage.setItem('auth_token', token);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch { /* ignore */ } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

/** @returns {{ user, login, logout, loading, isAuthenticated }} */
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
