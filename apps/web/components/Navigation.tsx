// Navigation component
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth-context";

export function Navigation() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <nav className="border-b border-[#222]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <pre className="text-xs leading-none text-white">
{`█▀█ █   █▀█ ▀█▀ █▀
█▀▀ █▄▄ █▄█  █  ▄█`}
            </pre>
          </Link>
          
          {!loading && (
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-sm text-[#666] hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/settings" className="text-sm text-[#666] hover:text-white transition-colors">
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-[#666] hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/pricing" className="text-sm text-[#666] hover:text-white transition-colors">
                    Pricing
                  </Link>
                  <Link href="/login" className="text-sm text-[#666] hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link href="/signup" className="text-sm bg-white text-black px-4 py-1.5 rounded font-medium hover:bg-[#eee] transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
