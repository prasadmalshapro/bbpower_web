"use client";

import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import React from "react";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import { useTheme } from "@/context/ThemeContext";
import CustomerNotificationDropdown from "@/components/customer/CustomerNotificationDropdown";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="min-h-screen relative overflow-hidden">
        <FuturisticBackground />
        
        {/* Mobile-first customer layout - no sidebar */}
        <div className="flex flex-col min-h-screen relative z-10">
          {/* Glassmorphism header for mobile */}
          <header className={`backdrop-blur-xl ${isDark ? 'bg-white/10' : 'bg-white/80'} ${isDark ? 'border-white/20' : 'border-gray-200/50'} border-b sticky top-0 z-50 shadow-lg`}>
            <div className="px-4 py-3 flex items-center justify-between">
              <h1 className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                PowerBB
              </h1>
              <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 transition-colors rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
                <CustomerNotificationDropdown isDark={isDark} />
              </div>
            </div>
          </header>
          
          {/* Main content */}
          <main className="flex-1">{children}</main>
          
          {/* Glassmorphism bottom navigation for mobile */}
          <nav className={`backdrop-blur-xl ${isDark ? 'bg-white/10' : 'bg-white/80'} ${isDark ? 'border-white/20' : 'border-gray-200/50'} border-t fixed bottom-0 left-0 right-0 z-50 shadow-lg`}>
            <div className="flex items-center justify-around px-2 py-2">
              <a
                href="/customer/dashboard"
                className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </a>
              <a
                href="/customer/stores"
                className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Stores</span>
              </a>
              <a
                href="/customer/scan"
                className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span>Scan</span>
              </a>
              <a
                href="/customer/rentals"
                className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Rentals</span>
              </a>
              <a
                href="/customer/profile"
                className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </a>
            </div>
          </nav>
        </div>
      </div>
    </ProtectedRoute>
  );
}
