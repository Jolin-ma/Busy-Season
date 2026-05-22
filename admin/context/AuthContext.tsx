'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signup: (name: string, email: string, password: string) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ll_auth');
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  function signup(name: string, email: string, _password: string) {
    const u: User = { name: name.trim(), email: email.trim() };
    localStorage.setItem('ll_auth', JSON.stringify(u));
    setUser(u);
  }

  async function login(email: string, _password: string) {
    // Demo account always works
    if (email.trim().toLowerCase() === 'demo@legacylink.com') {
      const demo: User = { name: 'Demo User', email: 'demo@legacylink.com' };
      localStorage.setItem('ll_auth', JSON.stringify(demo));
      setUser(demo);
      return;
    }
    const raw = localStorage.getItem('ll_auth');
    if (raw) {
      const stored = JSON.parse(raw) as User;
      if (stored.email.toLowerCase() === email.trim().toLowerCase()) {
        setUser(stored);
        return;
      }
    }
    throw new Error('No account found with that email. Please create an account.');
  }

  function logout() {
    localStorage.removeItem('ll_auth');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
