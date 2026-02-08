"use client";

import { ReactNode } from "react";
import { AuthProvider } from "../lib/auth-context";
import { Navigation } from "./Navigation";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Navigation />
      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </AuthProvider>
  );
}
