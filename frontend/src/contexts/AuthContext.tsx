'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logout as apiLogout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface User { id: string; email: string; display_name: string; }
interface AuthCtx { user: User | null; loading: boolean; logout: () => Promise<void>; setUser: (u: User | null) => void; }

const AuthContext = createContext<AuthCtx>({ user: null, loading: true, logout: async () => {}, setUser: () => {} });
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }){
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getMe().then(data => setUser(data.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await apiLogout().catch(() => {});
    setUser(null);
    router.push('/login');
  };

  return <AuthContext.Provider value={{ user, loading, logout, setUser }}>{children}</AuthContext.Provider>;
}
