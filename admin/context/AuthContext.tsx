'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('ll_auth');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch { return null; }
  });
  const [isLoading] = useState(false);

  async function signup(name: string, email: string, password: string) {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Signup failed.');
    localStorage.setItem('ll_token', data.token);
    localStorage.setItem('ll_auth', JSON.stringify(data.user));
    setUser(data.user);
  }

  async function login(email: string, password: string) {
    // Demo bypass — no API call
    if (email.trim().toLowerCase() === 'demo@legacylink.com') {
      const demo: User = { id: 'demo', name: 'Demo User', email: 'demo@legacylink.com' };
      localStorage.setItem('ll_auth', JSON.stringify(demo));
      setUser(demo);
      return;
    }

    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Login failed.');
    localStorage.setItem('ll_token', data.token);
    localStorage.setItem('ll_auth', JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('ll_auth');
    localStorage.removeItem('ll_token');
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
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
