"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import { UserCircleIcon, BoltIcon } from "@/icons";
import { authApi } from "@/lib/api-client";

export default function CustomerRegisterPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const { register } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        password: formData.password,
        address: formData.address.trim(),
      });

      if (response.error) {
        setError(response.error || "Registration failed");
      } else if (response.data) {
        const data = response.data as { data?: { user_id: number } };
        if (!data.data?.user_id) {
          setError("Unexpected server response");
        } else {
          setPendingUserId(data.data.user_id);
          setStep("otp");
        }
      } else {
        setError("Registration failed");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUserId) {
      setError("Registration session not found. Please register again.");
      return;
    }
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await authApi.verifyRegistrationOtp({
        user_id: pendingUserId,
        code: otp.trim(),
      });

      if (response.error) {
        setError(response.error || "Verification failed");
      } else if (response.data) {
        const data = response.data as { data?: { token?: string; user?: any } };
        const payload = data.data;
        if (!payload?.token || !payload?.user) {
          setError("Unexpected server response");
        } else {
          if (typeof window !== "undefined") {
            localStorage.setItem("token", payload.token);
            localStorage.setItem("user", JSON.stringify(payload.user));
          }
          const scannedId =
            typeof window !== "undefined"
              ? sessionStorage.getItem("scannedDeviceId") || localStorage.getItem("scannedDeviceId")
              : null;
          if (scannedId?.trim()) {
            router.replace(`/customer/start?q=${encodeURIComponent(scannedId.trim())}`);
          } else {
            router.replace("/customer/dashboard");
          }
        }
      } else {
        setError("Verification failed");
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
                isDark ? "from-blue-500/20 to-sky-500/20" : "from-blue-400/30 to-sky-400/30"
              } rounded-xl backdrop-blur-sm border ${
                isDark ? "border-white/10" : "border-gray-300/50"
              }`}
            >
              <UserCircleIcon className={`w-6 h-6 ${isDark ? "text-blue-300" : "text-blue-600"}`} />
            </div>
            <div>
              <h1
                className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-sky-500`}
              >
                Create Account
              </h1>
              <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Sign up to start renting power banks with BB Charge.
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

            {step === "form" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    First name <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, first_name: e.target.value }))
                    }
                    placeholder="First name"
                    required
                    className={`w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 ${
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
                    Last name <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, last_name: e.target.value }))
                    }
                    placeholder="Last name"
                    required
                    className={`w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 ${
                      isDark
                        ? "bg-white/10 border border-white/20 text-white placeholder:text-gray-400"
                        : "bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Email <span className="text-error-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Enter email address"
                  required
                  className={`w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 ${
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
                  Mobile Number <span className="text-error-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, mobile: e.target.value }))
                  }
                  placeholder="Enter mobile number"
                  required
                  className={`w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 ${
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
                  Address <span className="text-error-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Enter your address"
                  required
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/60 ${
                    isDark
                      ? "bg-white/10 border border-white/20 text-white placeholder:text-gray-400"
                      : "bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500"
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Password <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                    className={`w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 ${
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
                    Confirm Password <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Re-enter password"
                    required
                    minLength={6}
                    className={`w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 ${
                      isDark
                        ? "bg-white/10 border border-white/20 text-white placeholder:text-gray-400"
                        : "bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500"
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Enter 6-digit code <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                    }
                    placeholder="••••••"
                    required
                    className={`w-full tracking-[0.4em] text-center px-4 py-2.5 rounded-lg text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/60 ${
                      isDark
                        ? "bg-white/10 border border-white/20 text-white placeholder:text-gray-500"
                        : "bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400"
                    }`}
                  />
                </div>

                <p
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  We sent a 6-digit code to your mobile number. Enter it here to
                  verify your account.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </form>
            )}

            <p
              className={`mt-6 text-center text-sm ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Already have an account?{" "}
              <Link
                href="/customer/login"
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                Sign in instead
              </Link>
            </p>
          </div>

        </main>

        <footer className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-400">
          <BoltIcon className="w-3 h-3 text-teal-400" />
          <span className={isDark ? "text-gray-400" : "text-gray-500"}>
            Powered by BB Charge
          </span>
        </footer>
      </div>
    </div>
  );
}

