"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession, signIn as betterSignIn, signUp as betterSignUp, signOut as betterSignOut } from './auth';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || null,
      });
    } else {
      setUser(null);
    }
  }, [session]);

  const login = async (email: string, password: string) => {
    const result = await betterSignIn.email({
      email,
      password,
    });

    if (result.error) {
      throw new Error(result.error.message || 'Login failed');
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    const result = await betterSignUp.email({
      email,
      password,
      name: name || '',
    });

    if (result.error) {
      throw new Error(result.error.message || 'Signup failed');
    }
  };

  const logout = async () => {
    await betterSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading: isPending, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
