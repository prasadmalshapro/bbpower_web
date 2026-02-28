"use client";

import React, { useEffect, useState } from "react";
import { storesWithDevicesApi } from "@/lib/api-client";
import Link from "next/link";
import GoogleMapsView from "@/components/customer/GoogleMapsView";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import { BoxIconLine, ArrowRightIcon } from "@/icons";
import { useTheme } from "@/context/ThemeContext";

export default function StoresMap() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await storesWithDevicesApi.getStoresWithDevices();
      if (response.data) {
        const storesData = response.data as { data?: any[] };
        setStores(storesData.data || []);
      }
    } catch (err) {
      console.error("Error fetching stores:", err);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <FuturisticBackground />
      
      <div className="relative z-10 px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-gradient-to-br ${isDark ? 'from-green-500/20 to-emerald-500/20' : 'from-green-400/30 to-emerald-400/30'} rounded-xl backdrop-blur-sm border ${isDark ? 'border-white/10' : 'border-gray-300/50'}`}>
              <BoxIconLine className={`w-6 h-6 ${isDark ? 'text-green-300' : 'text-green-600'}`} />
            </div>
            <h1 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Stores Map
            </h1>
          </div>
          <Link
            href="/customer/stores"
            className="text-sm text-green-500 hover:text-green-400 transition-colors"
          >
            List View
          </Link>
        </div>

        {/* Google Maps Integration */}
        <div className={`mb-6 rounded-xl overflow-hidden border ${isDark ? 'border-white/20' : 'border-gray-200/50'} shadow-2xl backdrop-blur-sm ${isDark ? 'bg-white/5' : 'bg-white/30'}`}>
          <GoogleMapsView stores={stores} />
        </div>

        {/* Stores List */}
        <div className="space-y-4">
          {stores.length === 0 ? (
            <div className={`backdrop-blur-xl ${isDark ? 'bg-white/5' : 'bg-white/60'} rounded-2xl p-8 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} text-center`}>
              <p className={isDark ? "text-gray-400" : "text-gray-500"}>No stores found</p>
            </div>
          ) : (
            stores.map((store) => (
              <div
                key={store.id}
                className={`backdrop-blur-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white/60 hover:bg-white/80'} rounded-2xl p-4 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} shadow-xl transition-all relative overflow-hidden group`}
              >
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${isDark ? 'from-green-500/15' : 'from-green-400/25'} to-transparent rounded-full blur-xl`}></div>
                <div className="relative z-10">
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {store.name}
                  </h3>
                  <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {store.address}
                  </p>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {store.city}
                  </p>
                  <div className={`flex items-center justify-between mt-3 pt-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {store.device_count || 0} devices available
                    </span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-500 hover:text-green-400 transition-colors flex items-center gap-1"
                    >
                      Get Directions <ArrowRightIcon className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
