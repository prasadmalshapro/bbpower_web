"use client";

import React, { useEffect, useState } from "react";
import { rentalsApi, walletApi, storesWithDevicesApi } from "@/lib/api-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BoltIcon,
  BoxIconLine,
  PlugInIcon,
  DollarLineIcon,
  ArrowRightIcon,
  TimeIcon,
  CheckCircleIcon,
  UserCircleIcon,
  CalenderIcon,
  TableIcon,
} from "@/icons";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import { useTheme } from "@/context/ThemeContext";

export default function CustomerDashboard() {
  const [activeRental, setActiveRental] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [storesCount, setStoresCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rentalRes, walletRes, storesRes] = await Promise.all([
          rentalsApi.getActiveRental(),
          walletApi.getWallet(),
          storesWithDevicesApi.getStoresWithDevices(),
        ]);

        if (rentalRes.data) {
          const rentalData = rentalRes.data as { data?: any };
          setActiveRental(rentalData.data || null);
        }

        if (walletRes.data) {
          const walletData = walletRes.data as { data?: any };
          setWallet(walletData.data || null);
        }

        if (storesRes.data) {
          const storesData = storesRes.data as { data?: any[] };
          setStoresCount(storesData.data?.length || 0);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Dashboard
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Welcome back! Here's your overview</p>
        </div>

        {/* Active Rental Card - Glassmorphism */}
        {activeRental && (
          <div className={`mb-6 backdrop-blur-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white/60 hover:bg-white/80'} rounded-2xl p-6 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} shadow-2xl transition-all duration-300 relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isDark ? 'from-teal-500/20' : 'from-teal-400/30'} to-transparent rounded-full blur-2xl`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 bg-gradient-to-br ${isDark ? 'from-teal-500/20 to-cyan-500/20' : 'from-teal-400/30 to-cyan-400/30'} rounded-xl backdrop-blur-sm border ${isDark ? 'border-white/10' : 'border-gray-300/50'}`}>
                    <BoltIcon className={`w-6 h-6 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
                  </div>
                  <div>
                    <h2 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Active Rental</h2>
                    <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Power bank in use</p>
                  </div>
                </div>
                <Link
                  href="/customer/rental/active"
                  className="text-sm text-teal-500 hover:text-teal-400 transition-colors flex items-center gap-1"
                >
                  View <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <PlugInIcon className={`w-4 h-4 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
                  <span className={isDark ? "text-gray-300" : "text-gray-600"}>Device: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeRental.device_name}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BoxIconLine className={`w-4 h-4 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
                  <span className={isDark ? "text-gray-300" : "text-gray-600"}>Store: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeRental.store_name}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TimeIcon className={`w-4 h-4 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
                  <span className={isDark ? "text-gray-300" : "text-gray-600"}>Duration: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeRental.current_duration_minutes || 0} minutes</span></span>
                </div>
              </div>
              <button
                onClick={() => router.push("/customer/rental/active")}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 font-medium shadow-lg shadow-teal-500/30"
              >
                Return Power Bank
              </button>
            </div>
          </div>
        )}

        {/* Wallet Card - Glassmorphism */}
        {wallet && (
          <div className={`mb-6 backdrop-blur-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white/60 hover:bg-white/80'} rounded-2xl p-6 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} shadow-2xl transition-all duration-300 relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isDark ? 'from-blue-500/20' : 'from-blue-400/30'} to-transparent rounded-full blur-2xl`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 bg-gradient-to-br ${isDark ? 'from-blue-500/20 to-sky-500/20' : 'from-blue-400/30 to-sky-400/30'} rounded-xl backdrop-blur-sm border ${isDark ? 'border-white/10' : 'border-gray-300/50'}`}>
                    <DollarLineIcon className={`w-6 h-6 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h2 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Wallet Balance</h2>
                    <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Available funds</p>
                  </div>
                </div>
                <Link
                  href="/customer/wallet"
                  className="text-sm text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  Details <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
              <div className="mb-4">
                <p className={`text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-sky-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  LKR {parseFloat(wallet.balance || 0).toFixed(2)}
                </p>
                <div className="space-y-1 mt-3">
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Min Limit: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>LKR {parseFloat(wallet.min_limit || 0).toFixed(2)}</span>
                  </p>
                  {wallet.pending_balance > 0 && (
                    <p className="text-sm text-yellow-500">
                      Pending: <span className="text-yellow-400 font-medium">LKR {parseFloat(wallet.pending_balance || 0).toFixed(2)}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link
            href="/customer/stores"
            className={`backdrop-blur-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white/60 hover:bg-white/80'} rounded-2xl p-5 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} shadow-xl hover:scale-105 transition-all duration-300 text-center group relative overflow-hidden`}
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${isDark ? 'from-green-500/15' : 'from-green-400/25'} to-transparent rounded-full blur-xl`}></div>
            <div className="relative z-10">
              <div className={`p-3 bg-gradient-to-br ${isDark ? 'from-green-500/20 to-emerald-500/20' : 'from-green-400/30 to-emerald-400/30'} rounded-xl backdrop-blur-sm border ${isDark ? 'border-white/10' : 'border-gray-300/50'} inline-block mb-3 group-hover:scale-110 transition-transform`}>
                <BoxIconLine className={`w-6 h-6 ${isDark ? 'text-green-300' : 'text-green-600'}`} />
              </div>
              <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Find Stores</p>
              <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {storesCount} available
              </p>
            </div>
          </Link>

          <Link
            href="/customer/scan"
            className={`backdrop-blur-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white/60 hover:bg-white/80'} rounded-2xl p-5 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} shadow-xl hover:scale-105 transition-all duration-300 text-center group relative overflow-hidden`}
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${isDark ? 'from-teal-500/15' : 'from-teal-400/25'} to-transparent rounded-full blur-xl`}></div>
            <div className="relative z-10">
              <div className={`p-3 bg-gradient-to-br ${isDark ? 'from-teal-500/20 to-cyan-500/20' : 'from-teal-400/30 to-cyan-400/30'} rounded-xl backdrop-blur-sm border ${isDark ? 'border-white/10' : 'border-gray-300/50'} inline-block mb-3 group-hover:scale-110 transition-transform`}>
                <BoltIcon className={`w-6 h-6 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
              </div>
              <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Scan QR</p>
              <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Rent power bank
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Links - Glassmorphism */}
        <div className={`backdrop-blur-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white/60 hover:bg-white/80'} rounded-2xl p-6 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} shadow-2xl transition-all duration-300 relative overflow-hidden`}>
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isDark ? 'from-teal-500/20' : 'from-teal-400/30'} to-transparent rounded-full blur-2xl`}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 bg-gradient-to-br ${isDark ? 'from-teal-500/20 to-cyan-500/20' : 'from-teal-400/30 to-cyan-400/30'} rounded-xl backdrop-blur-sm border ${isDark ? 'border-white/10' : 'border-gray-300/50'}`}>
                <CheckCircleIcon className={`w-5 h-5 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
              </div>
              <h2 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Links</h2>
            </div>
            <div className="space-y-3">
              <Link
                href="/customer/rentals"
                className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'} transition-all duration-300 group`}
              >
                <div className="flex items-center gap-3">
                  <CalenderIcon className={`w-5 h-5 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
                  <span className={`${isDark ? 'text-gray-200 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'} transition-colors`}>Rental History</span>
                </div>
                <ArrowRightIcon className={`w-4 h-4 ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'} group-hover:translate-x-1 transition-all`} />
              </Link>
              <Link
                href="/customer/payments"
                className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'} transition-all duration-300 group`}
              >
                <div className="flex items-center gap-3">
                  <TableIcon className={`w-5 h-5 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
                  <span className={`${isDark ? 'text-gray-200 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'} transition-colors`}>Payment History</span>
                </div>
                <ArrowRightIcon className={`w-4 h-4 ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'} group-hover:translate-x-1 transition-all`} />
              </Link>
              <Link
                href="/customer/profile"
                className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'} transition-all duration-300 group`}
              >
                <div className="flex items-center gap-3">
                  <UserCircleIcon className={`w-5 h-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                  <span className={`${isDark ? 'text-gray-200 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'} transition-colors`}>My Profile</span>
                </div>
                <ArrowRightIcon className={`w-4 h-4 ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'} group-hover:translate-x-1 transition-all`} />
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
