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
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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

  async function signup(name: string, email: string, password: string): Promise<boolean> {
    const res = await fetch(`${API}/auth/signup`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Signup failed.');
    if (data.user) {
      localStorage.setItem('ll_auth', JSON.stringify(data.user));
      setUser(data.user);
      return true;
    }
    // Duplicate email — server returns { ok: true } with no user field.
    return false;
  }

  async function login(email: string, password: string) {
    const res = await fetch(`${API}/auth/login`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Login failed.');
    // Token is in the HttpOnly cookie. Store only display metadata.
    localStorage.setItem('ll_auth', JSON.stringify(data.user));
    setUser(data.user);
  }

  async function logout() {
    // Ask the server to clear the HttpOnly cookie.
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
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
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
