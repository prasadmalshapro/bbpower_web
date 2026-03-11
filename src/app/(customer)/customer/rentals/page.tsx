"use client";

import React, { useEffect, useState } from "react";
import { rentalsApi } from "@/lib/api-client";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import { CalenderIcon, PlugInIcon, BoxIconLine, TimeIcon } from "@/icons";
import { useTheme } from "@/context/ThemeContext";

export default function RentalHistory() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const response = await rentalsApi.getRentalHistory();
      if (response.data) {
        const data = response.data as { data?: any[] };
        setRentals(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching rentals:", err);
    } finally {
      setLoading(false);
    }
  };

  // API may send server-local time with "Z"; treat as local for display
  const formatRentalDateTime = (isoString: string | null | undefined): string => {
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

  const parseRentalTimeAsLocal = (isoString: string | null | undefined): Date | null => {
    if (!isoString) return null;
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

  const getDurationMinutes = (rental: { start_time?: string; end_time?: string; duration_minutes?: number }): number | null => {
    const start = parseRentalTimeAsLocal(rental.start_time);
    const end = parseRentalTimeAsLocal(rental.end_time);
    if (start && end) {
      const ms = end.getTime() - start.getTime();
      return Math.max(0, Math.round(ms / (1000 * 60)));
    }
    if (rental.duration_minutes != null && rental.duration_minutes >= 0) return rental.duration_minutes;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
        <FuturisticBackground />
        <div className={`relative z-10 text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <FuturisticBackground />
      
      <div className="relative z-10 px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 bg-gradient-to-br ${isDark ? 'from-teal-500/20 to-cyan-500/20' : 'from-teal-400/30 to-cyan-400/30'} rounded-xl backdrop-blur-sm border ${isDark ? 'border-white/10' : 'border-gray-300/50'}`}>
              <CalenderIcon className={`w-6 h-6 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
            </div>
            <h1 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Rental History
            </h1>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>View your past rentals</p>
        </div>

        {rentals.length === 0 ? (
          <div className={`backdrop-blur-xl ${isDark ? 'bg-white/5' : 'bg-white/60'} rounded-2xl p-8 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} text-center`}>
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>No rental history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals.map((rental) => (
              <div
                key={rental.id}
                className={`backdrop-blur-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white/60 hover:bg-white/80'} rounded-2xl p-5 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} shadow-xl transition-all relative overflow-hidden group`}
              >
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${isDark ? 'from-teal-500/15' : 'from-teal-400/25'} to-transparent rounded-full blur-xl`}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <PlugInIcon className={`w-5 h-5 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {rental.device_name}
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        rental.status === "completed"
                          ? "bg-green-500/20 text-green-500 border border-green-500/30"
                          : rental.status === "active"
                          ? "bg-teal-500/20 text-teal-500 border border-teal-500/30"
                          : `${isDark ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : 'bg-gray-400/20 text-gray-600 border-gray-400/30'}`
                      }`}
                    >
                      {rental.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <BoxIconLine className={`w-4 h-4 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
                      <span className={isDark ? "text-gray-300" : "text-gray-600"}>{rental.store_name}</span>
                    </div>
                    {getDurationMinutes(rental) != null && (
                      <div className="flex items-center gap-2">
                        <TimeIcon className={`w-4 h-4 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
                        <span className={isDark ? "text-gray-300" : "text-gray-600"}>Duration: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{getDurationMinutes(rental)} minutes</span></span>
                      </div>
                    )}
                    {rental.payment_amount && (
                      <p className={`text-base font-semibold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Amount: <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500">LKR {parseFloat(rental.payment_amount).toFixed(2)}</span>
                      </p>
                    )}
                    <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatRentalDateTime(rental.start_time)}
                      {rental.end_time && ` – ${formatRentalDateTime(rental.end_time)}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
