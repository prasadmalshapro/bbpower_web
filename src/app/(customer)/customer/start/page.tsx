"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { qrCodesApi, rentalsApi, rateCardsApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import { BoltIcon, PlugInIcon, BoxIconLine } from "@/icons";
import { useTheme } from "@/context/ThemeContext";

const STORAGE_KEY = "scannedDeviceId";

export default function CustomerStartRentalPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const qParam = searchParams.get("q");
  const [deviceCode, setDeviceCode] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [rateCard, setRateCard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const code =
      (typeof qParam === "string" && qParam.trim()) ||
      (typeof window !== "undefined" &&
        (window.sessionStorage.getItem(STORAGE_KEY) ||
          window.localStorage.getItem(STORAGE_KEY)));
    if (!code || !String(code).trim()) {
      router.replace("/customer/dashboard");
      return;
    }
    setDeviceCode(String(code).trim());
  }, [qParam, router]);

  useEffect(() => {
    if (!deviceCode) return;

    let cancelled = false;
    setError("");
    setLoading(true);
    setDeviceInfo(null);
    setRateCard(null);

    (async () => {
      try {
        const response = await qrCodesApi.scan(deviceCode);
        if (cancelled) return;
        if (response.error) {
          setError(response.error);
          setLoading(false);
          return;
        }
        const data = response.data as { data?: any };
        if (data?.data) {
          setDeviceInfo(data.data);
          const storeId = data.data.device?.store?.id;
          if (storeId != null) {
            try {
              const rateResponse = await rateCardsApi.getActive(storeId);
              if (!cancelled && rateResponse.data) {
                const rateData = rateResponse.data as { data?: any };
                setRateCard(rateData.data ?? null);
              }
            } catch {
              // ignore rate card failure
            }
          }
        } else {
          setError("Device not found");
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load device");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [deviceCode]);

  const handleProceedToRental = async () => {
    if (!deviceCode) {
      setError("Device not found. Please scan the QR code again.");
      return;
    }

    setError("");
    setActionLoading(true);

    try {
      const response = await rentalsApi.startRentalNoPayment({
        qr_code: deviceCode,
      });

      if (response.error) {
        setError(response.error);
        setActionLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(STORAGE_KEY);
      }
      router.replace("/customer/rental/active");
    } catch (err: any) {
      setError(err?.message || "Failed to start rental");
    } finally {
      setActionLoading(false);
    }
  };

  if (!deviceCode && !loading) return null;

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <FuturisticBackground />

      <div className="relative z-10 px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 bg-gradient-to-br ${
                isDark ? "from-teal-500/20 to-cyan-500/20" : "from-teal-400/30 to-cyan-400/30"
              } rounded-xl backdrop-blur-sm border ${
                isDark ? "border-white/10" : "border-gray-300/50"
              }`}
            >
              <BoltIcon className={`w-6 h-6 ${isDark ? "text-teal-300" : "text-teal-600"}`} />
            </div>
            <h1
              className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Start rental
            </h1>
          </div>
          <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Review the rate card and proceed to unlock a power bank at this device.
          </p>
        </div>

        {error && (
          <div
            className={`mb-4 p-3 text-sm text-error-500 ${
              isDark ? "bg-error-500/20" : "bg-error-50"
            } backdrop-blur-xl rounded-xl border ${
              isDark ? "border-error-500/30" : "border-error-200"
            }`}
          >
            {error}
          </div>
        )}

        {loading && (
          <div
            className={`backdrop-blur-xl ${
              isDark ? "bg-white/5" : "bg-white/60"
            } rounded-2xl p-8 border ${
              isDark ? "border-white/10" : "border-gray-200/50"
            } text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Loading device and rate card…
          </div>
        )}

        {!loading && deviceInfo && (
          <div
            className={`backdrop-blur-xl ${
              isDark ? "bg-white/5" : "bg-white/60"
            } rounded-2xl p-6 border ${
              isDark ? "border-white/10" : "border-gray-200/50"
            } shadow-2xl`}
          >
            <h2
              className={`font-semibold text-lg mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Device & store
            </h2>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <PlugInIcon
                  className={`w-5 h-5 ${isDark ? "text-teal-300" : "text-teal-600"}`}
                />
                <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                  Device:{" "}
                  <span
                    className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {deviceInfo.device?.device_name ?? deviceCode}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BoxIconLine
                  className={`w-5 h-5 ${isDark ? "text-teal-300" : "text-teal-600"}`}
                />
                <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                  Store:{" "}
                  <span
                    className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {deviceInfo.device?.store?.name ?? "—"}
                  </span>
                </span>
              </div>
              {deviceInfo.device?.store?.address && (
                <div className="flex items-center gap-2 text-sm">
                  <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                    Address:{" "}
                    <span
                      className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {deviceInfo.device.store.address}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {rateCard && (
              <div
                className={`mb-6 overflow-hidden rounded-2xl border shadow-lg ${
                  isDark
                    ? "border-teal-400/30 bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-transparent"
                    : "border-teal-200/80 bg-gradient-to-br from-teal-50 via-cyan-50/50 to-white"
                }`}
              >
                <div
                  className={`px-4 py-3 ${
                    isDark ? "bg-teal-500/20" : "bg-teal-100/80"
                  }`}
                >
                  <h3
                    className={`text-sm font-semibold uppercase tracking-wide ${
                      isDark ? "text-teal-200" : "text-teal-800"
                    }`}
                  >
                    Rate card for this location
                  </h3>
                </div>
                <div className="p-2 space-y-1">
                  <div
                    className={`flex items-center justify-between rounded-xl px-4 py-1 ${
                      isDark ? "bg-white/5" : "bg-white/80"
                    } ${isDark ? "text-gray-100" : "text-gray-800"}`}
                  >
                    <span className="text-sm">
                      First {rateCard.first_duration_minutes} min
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        isDark ? "text-teal-300" : "text-teal-600"
                      }`}
                    >
                       {Number(rateCard.first_amount).toFixed(2)}
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between rounded-xl px-4 py-1 ${
                      isDark ? "bg-white/5" : "bg-white/80"
                    } ${isDark ? "text-gray-100" : "text-gray-800"}`}
                  >
                    <span className="text-sm">
                      Every {rateCard.subsequent_duration_minutes} min after
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        isDark ? "text-teal-300" : "text-teal-600"
                      }`}
                    >
                      {Number(rateCard.subsequent_amount).toFixed(2)}
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between rounded-xl px-4 py-1 ${
                      isDark ? "bg-amber-500/15 border border-amber-400/30" : "bg-amber-50 border border-amber-200/80"
                    } ${isDark ? "text-amber-100" : "text-amber-900"}`}
                  >
                    <span className="text-sm font-medium">Deposit</span>
                    <span
                      className={`font-bold text-lg ${
                        isDark ? "text-amber-200" : "text-amber-700"
                      }`}
                    >
                      {Number(rateCard.refundable_deposit).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {!rateCard && (
              <p
                className={`text-sm mb-4 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Proceed to unlock a power bank from this device (highest battery
                selected automatically).
              </p>
            )}

            <Button
              onClick={handleProceedToRental}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30"
              size="sm"
              disabled={actionLoading}
            >
              {actionLoading ? "Starting rental…" : "Proceed to rental"}
            </Button>
          </div>
        )}

        {!loading && !deviceInfo && !error && (
          <div
            className={`backdrop-blur-xl ${
              isDark ? "bg-white/5" : "bg-white/60"
            } rounded-2xl p-6 border ${
              isDark ? "border-white/10" : "border-gray-200/50"
            } ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            No device information available. Go to{" "}
            <a
              href="/customer/scan"
              className="text-teal-500 underline"
            >
              Scan
            </a>{" "}
            or{" "}
            <a
              href="/customer/dashboard"
              className="text-teal-500 underline"
            >
              Dashboard
            </a>
            .
          </div>
        )}
      </div>
    </div>
  );
}
