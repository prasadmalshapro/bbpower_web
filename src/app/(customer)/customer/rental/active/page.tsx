"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { rentalsApi, rateCardsApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import { BoltIcon, PlugInIcon, BoxIconLine, TimeIcon } from "@/icons";
import { useTheme } from "@/context/ThemeContext";

export default function ActiveRental() {
  const [rental, setRental] = useState<any>(null);
  const [rateCard, setRateCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    fetchActiveRental();
  }, []);

  const fetchActiveRental = async () => {
    try {
      const response = await rentalsApi.getActiveRental();
      if (response.error) {
        if (response.error.includes("No active rental")) {
          router.push("/customer/dashboard");
        }
      } else if (response.data) {
        const data = response.data as { data?: any };
        const r = data.data;
        setRental(r);
        if (r?.store_id != null) {
          try {
            const rateResponse = await rateCardsApi.getActive(r.store_id);
            if (rateResponse.data) {
              const rateData = rateResponse.data as { data?: any };
              setRateCard(rateData.data ?? null);
            }
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      console.error("Error fetching active rental:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!rental || !confirm("Are you sure you want to return this power bank?")) {
      return;
    }

    setReturning(true);
    try {
      const response = await rentalsApi.endRental(rental.id);
      if (response.error) {
        alert(response.error);
      } else {
        router.push("/customer/rentals");
      }
    } catch (err: any) {
      alert("Failed to return power bank: " + err.message);
    } finally {
      setReturning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
        <FuturisticBackground />
        <div className={`relative z-10 text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading...</div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
        <FuturisticBackground />
        <div className="relative z-10 text-center">
          <p className={isDark ? "text-gray-300 mb-4" : "text-gray-600 mb-4"}>No active rental</p>
          <Link
            href="/customer/dashboard"
            className="text-teal-500 hover:text-teal-400 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // API may send server-local time with "Z"; treat as local for display and duration
  const formatStartTime = (isoString: string | null | undefined): string => {
    if (!isoString) return "—";
    const match = String(isoString).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (match) {
      const [, y, mo, day, h, m] = match;
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const hour = parseInt(h, 10);
      const h12 = hour % 12 || 12;
      const ampm = hour < 12 ? "AM" : "PM";
      return `${parseInt(day, 10)} ${months[parseInt(mo, 10) - 1]} ${y}, ${h12}:${m} ${ampm}`;
    }
    return new Date(isoString).toLocaleString();
  };

  // Parse start_time as local time (same as display) so duration is correct
  const parseStartTimeAsLocal = (isoString: string | null | undefined): Date => {
    if (!isoString) return new Date();
    const match = String(isoString).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [, y, mo, d, h, min, s] = match;
      return new Date(
        parseInt(y!, 10),
        parseInt(mo!, 10) - 1,
        parseInt(d!, 10),
        parseInt(h!, 10),
        parseInt(min!, 10),
        parseInt(s!, 10) || 0,
        0
      );
    }
    return new Date(isoString);
  };

  const startTime = parseStartTimeAsLocal(rental.start_time);
  const now = new Date();
  const durationMs = now.getTime() - startTime.getTime();
  const durationMinutes = Math.max(0, Math.ceil(durationMs / (1000 * 60)));

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <FuturisticBackground />
      
      <div className="relative z-10 px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 bg-gradient-to-br ${isDark ? 'from-teal-500/20 to-cyan-500/20' : 'from-teal-400/30 to-cyan-400/30'} rounded-xl backdrop-blur-sm border ${isDark ? 'border-white/10' : 'border-gray-300/50'}`}>
              <BoltIcon className={`w-6 h-6 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
            </div>
            <h1 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Active Rental
            </h1>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Your current power bank rental</p>
        </div>

        <div className={`backdrop-blur-xl ${isDark ? 'bg-white/5' : 'bg-white/60'} rounded-2xl p-6 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} shadow-2xl mb-6 relative overflow-hidden group`}>
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isDark ? 'from-teal-500/20' : 'from-teal-400/30'} to-transparent rounded-full blur-2xl`}></div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <PlugInIcon className={`w-5 h-5 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
              <span className={isDark ? "text-gray-300" : "text-gray-600"}>Device: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{rental.device_name}</span></span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <BoxIconLine className={`w-5 h-5 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
              <div>
                <span className={isDark ? "text-gray-300" : "text-gray-600"}>Store: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{rental.store_name}</span></span>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{rental.store_address}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <TimeIcon className={`w-5 h-5 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
              <span className={isDark ? "text-gray-300" : "text-gray-600"}>Start time: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatStartTime(rental.start_time)}</span></span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <TimeIcon className={`w-5 h-5 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
              <span className={isDark ? "text-gray-300" : "text-gray-600"}>Duration: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{durationMinutes} minutes</span></span>
            </div>

            {rateCard && (
              <div
                className={`overflow-hidden rounded-2xl border shadow-lg ${
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
                <div className="p-4 space-y-3">
                  <div
                    className={`flex items-center justify-between rounded-xl px-4 py-3 ${
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
                      LKR {Number(rateCard.first_amount).toFixed(2)}
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between rounded-xl px-4 py-3 ${
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
                      LKR {Number(rateCard.subsequent_amount).toFixed(2)}
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                      isDark ? "bg-amber-500/15 border border-amber-400/30" : "bg-amber-50 border border-amber-200/80"
                    } ${isDark ? "text-amber-100" : "text-amber-900"}`}
                  >
                    <span className="text-sm font-medium">Deposit</span>
                    <span
                      className={`font-bold text-lg ${
                        isDark ? "text-amber-200" : "text-amber-700"
                      }`}
                    >
                      LKR {Number(rateCard.refundable_deposit).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* {rental.estimated_cost != null && (
              <div className="pt-4 border-t border-white/10">
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Estimated cost</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-teal-300' : 'text-teal-600'}`}>
                  LKR {parseFloat(rental.estimated_cost).toFixed(2)}
                </p>
              </div>
            )} */}
          </div>
        </div>

        <Button
          onClick={handleReturn}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30"
          size="sm"
          disabled={returning}
        >
          {returning ? "Returning..." : "Return Power Bank"}
        </Button>
      </div>
    </div>
  );
}
