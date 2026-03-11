"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import { EyeCloseIcon, EyeIcon, BoltIcon } from "@/icons";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      if (response.error || !response.success) {
        setError(response.error || "Login failed");
      } else {
        setTimeout(() => {
          const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
          const scannedId =
            typeof window !== "undefined"
              ? sessionStorage.getItem("scannedDeviceId") || localStorage.getItem("scannedDeviceId")
              : null;
          if (userStr) {
            try {
              const userData = JSON.parse(userStr) as { role?: string } | null;
              if (userData?.role === "customer" && scannedId?.trim()) {
                router.replace(`/customer/start?q=${encodeURIComponent(scannedId.trim())}`);
                return;
              }
              if (userData?.role === "customer") {
                router.replace("/customer/dashboard");
              } else {
                router.replace("/dashboard");
              }
            } catch {
              router.replace(scannedId?.trim() ? `/customer/start?q=${encodeURIComponent(scannedId.trim())}` : "/customer/dashboard");
            }
          } else if (scannedId?.trim()) {
            router.replace(`/customer/start?q=${encodeURIComponent(scannedId.trim())}`);
          } else {
            router.replace("/customer/dashboard");
          }
        }, 100);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <FuturisticBackground />

      <div className="relative z-10 flex flex-col min-h-screen px-4 pt-10 pb-8 max-w-lg mx-auto">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 bg-gradient-to-br ${
                isDark ? "from-teal-500/20 to-cyan-500/20" : "from-teal-400/30 to-cyan-400/30"
              } rounded-xl backdrop-blur-sm border ${
                isDark ? "border-white/10" : "border-gray-300/50"
              }`}
            >
              <BoltIcon className={`w-6 h-6 ${isDark ? "text-teal-300" : "text-teal-600"}`} />
            </div>
            <div>
              <h1
                className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500`}
              >
                Sign In
              </h1>
              <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Access your BB Charge account to manage rentals and wallet.
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center">
          <div
            className={`backdrop-blur-xl ${
              isDark ? "bg-white/5" : "bg-white/70"
            } rounded-2xl p-6 sm:p-8 border ${
              isDark ? "border-white/10" : "border-gray-200/60"
            } shadow-2xl`}
          >
            {error && (
              <div
                className={`mb-4 p-3 text-sm text-error-500 ${
                  isDark ? "bg-error-500/20 border border-error-500/40" : "bg-error-50 border border-error-200"
                } rounded-xl`}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Email or Mobile <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email or mobile number"
                  required
                  className={`w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/60 ${
                    isDark
                      ? "bg-white/10 border border-white/20 text-white placeholder:text-gray-400"
                      : "bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Password <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className={`w-full px-4 py-2.5 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/60 ${
                      isDark
                        ? "bg-white/10 border border-white/20 text-white placeholder:text-gray-400"
                        : "bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeIcon className={isDark ? "fill-gray-300" : "fill-gray-500"} />
                    ) : (
                      <EyeCloseIcon className={isDark ? "fill-gray-300" : "fill-gray-500"} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <p
              className={`mt-6 text-center text-sm ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/customer/register"
                className="font-medium text-teal-400 hover:text-teal-300"
              >
                Create one now
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

