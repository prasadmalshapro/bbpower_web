"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import Button from "@/components/ui/button/Button";
import { useTheme } from "@/context/ThemeContext";

function CustomerLandingContent() {
  const searchParams = useSearchParams();
  const deviceId = searchParams.get("q");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (deviceId && deviceId.trim()) {
      try {
        window.localStorage.setItem("scannedDeviceId", deviceId);
        window.sessionStorage.setItem("scannedDeviceId", deviceId);
      } catch {
        // ignore storage errors
      }
    }
  }, [deviceId]);

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <FuturisticBackground />

      <div className="relative z-10 flex flex-col min-h-screen px-4 pt-10 pb-8 max-w-lg mx-auto">
        <header className="flex items-center justify-center mb-8">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-40 h-10">
              <Image
                src="/images/logo/auth-logo.svg"
                alt="BB Charge"
                fill
                className="object-contain"
                priority
              />
            </div>
            <p
              className={`text-xs sm:text-sm text-center ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Power Bank Rental for everyone
            </p>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center gap-6">
          <section
            className={`backdrop-blur-xl ${
              isDark ? "bg-white/5" : "bg-white/70"
            } rounded-3xl p-6 sm:p-8 border ${
              isDark ? "border-white/10" : "border-gray-200/60"
            } shadow-2xl relative overflow-hidden`}
          >
            <div
              className={`pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl ${
                isDark
                  ? "bg-gradient-to-br from-teal-500/30 via-cyan-500/30 to-blue-500/20"
                  : "bg-gradient-to-br from-teal-400/30 via-cyan-400/30 to-blue-400/20"
              }`}
            />

            <div className="relative z-10 space-y-4">
              <h1
                className={`text-3xl sm:text-4xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500`}
              >
                Scan, rent,
                <br />
                stay powered.
              </h1>
              <p
                className={`text-sm sm:text-base ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                You&apos;ve just scanned a BB Charge QR code. Create an account
                or sign in to start your rental and keep your devices charged.
              </p>

              {deviceId && deviceId.trim() && (
                <div
                  className={`mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm ${
                    isDark
                      ? "bg-white/10 text-gray-100 border border-white/15"
                      : "bg-gray-900/5 text-gray-800 border border-gray-300/60"
                  }`}
                >
                  <span className="font-medium opacity-80">Device ID:</span>
                  <span className="font-mono text-xs sm:text-sm">
                    {deviceId}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-3 mt-2">
            <Link href="/customer/login" className="block">
              <Button
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30"
                size="sm"
              >
                Log in to continue
              </Button>
            </Link>

            <Link href="/customer/register" className="block">
              <Button
                variant="outline"
                size="sm"
                className={`w-full border-2 ${
                  isDark
                    ? "border-white/20 text-white hover:bg-white/10"
                    : "border-teal-500/60 text-teal-700 hover:bg-teal-50"
                }`}
              >
                Create a new account
              </Button>
            </Link>

            <p
              className={`text-[11px] sm:text-xs text-center mt-3 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              You can always scan this QR again from the device if needed. Your
              scanned device ID is stored securely on this browser.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

export default function CustomerLandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pb-20 relative overflow-hidden flex items-center justify-center">
        <FuturisticBackground />
        <div className="relative z-10 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    }>
      <CustomerLandingContent />
    </Suspense>
  );
}

