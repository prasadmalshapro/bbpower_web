"use client";

import React, { useEffect, useState } from "react";
import { paymentsApi } from "@/lib/api-client";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import { TableIcon, DollarLineIcon, TimeIcon } from "@/icons";
import { useTheme } from "@/context/ThemeContext";

export default function PaymentHistory() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentsApi.getPaymentHistory();
      if (response.data) {
        const data = response.data as { data?: any[] };
        setPayments(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
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
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 bg-gradient-to-br ${isDark ? 'from-blue-500/20 to-sky-500/20' : 'from-blue-400/30 to-sky-400/30'} rounded-xl backdrop-blur-sm border ${isDark ? 'border-white/10' : 'border-gray-300/50'}`}>
              <TableIcon className={`w-6 h-6 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
            </div>
            <h1 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-sky-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Payment History
            </h1>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>View your transaction history</p>
        </div>

        {payments.length === 0 ? (
          <div className={`backdrop-blur-xl ${isDark ? 'bg-white/5' : 'bg-white/60'} rounded-2xl p-8 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} text-center`}>
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>No payment history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className={`backdrop-blur-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white/60 hover:bg-white/80'} rounded-2xl p-5 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} shadow-xl transition-all relative overflow-hidden group`}
              >
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${isDark ? 'from-blue-500/15' : 'from-blue-400/25'} to-transparent rounded-full blur-xl`}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <DollarLineIcon className={`w-5 h-5 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {payment.device_name || "Top-up"}
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        payment.status === "completed"
                          ? "bg-green-500/20 text-green-500 border border-green-500/30"
                          : payment.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                          : "bg-red-500/20 text-red-500 border border-red-500/30"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className={isDark ? "text-gray-300" : "text-gray-600"}>
                      Method: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{payment.payment_method}</span>
                    </p>
                    {payment.duration_minutes && (
                      <div className="flex items-center gap-2">
                        <TimeIcon className={`w-4 h-4 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
                        <span className={isDark ? "text-gray-300" : "text-gray-600"}>Duration: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{payment.duration_minutes} minutes</span></span>
                      </div>
                    )}
                    <p className={`text-2xl font-bold mt-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-sky-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      LKR {parseFloat(payment.amount).toFixed(2)}
                    </p>
                    <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(payment.created_at).toLocaleString()}
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
