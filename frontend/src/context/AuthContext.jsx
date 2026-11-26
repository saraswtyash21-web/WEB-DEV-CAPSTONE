import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAccessToken } from '../api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (response) => { if (!response.ok) return null; return response.json(); })
      .then((data) => { if (alive && data) { setAccessToken(data.accessToken); setUser(data.user); } })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken); setUser(data.user); return data.user;
  }, []);
  const register = useCallback(async (name, email, password) => {
    const data = await api.post('/auth/register', { name, email, password });
    setAccessToken(data.accessToken); setUser(data.user); return data.user;
  }, []);
  const signOut = useCallback(async () => {
    try { await api.post('/auth/logout', {}); } finally { setAccessToken(null); setUser(null); }
  }, []);
  const value = useMemo(() => ({ user, loading, signIn, register, signOut }), [user, loading, signIn, register, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
