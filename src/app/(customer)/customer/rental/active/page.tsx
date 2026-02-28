"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { rentalsApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import { BoltIcon, PlugInIcon, BoxIconLine, TimeIcon } from "@/icons";
import { useTheme } from "@/context/ThemeContext";

export default function ActiveRental() {
  const [rental, setRental] = useState<any>(null);
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
        setRental(data.data);
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

  const startTime = new Date(rental.start_time);
  const now = new Date();
  const durationMs = now.getTime() - startTime.getTime();
  const durationMinutes = Math.ceil(durationMs / (1000 * 60));

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
              <span className={isDark ? "text-gray-300" : "text-gray-600"}>Start Time: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{startTime.toLocaleString()}</span></span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <TimeIcon className={`w-5 h-5 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
              <span className={isDark ? "text-gray-300" : "text-gray-600"}>Duration: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{durationMinutes} minutes</span></span>
            </div>

            {rental.estimated_cost && (
              <div className="pt-4 border-t border-white/10">
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Estimated Cost</p>
                <p className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  LKR {parseFloat(rental.estimated_cost).toFixed(2)}
                </p>
              </div>
            )}
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
