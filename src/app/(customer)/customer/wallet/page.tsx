"use client";

import React, { useEffect, useState } from "react";
import { walletApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import { DollarLineIcon, ArrowRightIcon } from "@/icons";
import { useTheme } from "@/context/ThemeContext";

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getTransactions(),
      ]);

      if (walletRes.data) {
        const walletData = walletRes.data as { data?: any };
        setWallet(walletData.data);
      }

      if (transactionsRes.data) {
        const transactionsData = transactionsRes.data as { data?: any[] };
        setTransactions(transactionsData.data || []);
      }
    } catch (err) {
      console.error("Error fetching wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNumber = parseFloat(topUpAmount);
    if (!topUpAmount || isNaN(amountNumber) || amountNumber <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setTopUpLoading(true);
    try {
      const apiBase = "http://bbchargeapi.ascendique.com/api/v1";

      // Amount for payment gateway: e.g. 100 -> 10000
      const gatewayAmount = Math.round(amountNumber * 100);

      // Persist amount so we can credit wallet only after a successful return from gateway
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "BBPOWER_WALLET_TOPUP_PENDING",
          JSON.stringify({ amount: amountNumber })
        );
      }

      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://dev.d1t49ghx7gqjye.amplifyapp.com";

      const payload = {
        currency: "LKR",
        amount: gatewayAmount,
        localId: `WALLET-TOPUP-${Date.now()}`,
        redirectUrl: `https://dev.d1t49ghx7gqjye.amplifyapp.com/customer/wallet/topup-success`,
        webhook: `${apiBase.replace(/\/$/, "")}/payments/webhook`,
        customer: {
          name: "Wallet Customer",
          email: "wallet@example.com",
          billingEmail: "wallet@example.com",
          billingAddress1: "N/A",
          billingAddress2: "",
          billingCity: "Colombo",
          billingCountry: "Sri Lanka",
          billingPostCode: "00100",
        },
        tokenizationDetails: {
          tokenize: true,
          paymentType: "UNSCHEDULED",
        },
        paymentPortalExperience: {
          skipCustomerForm: false,
          skipProviderSelection: false,
        },
        apiVersion: "2.0",
        appVersion: "geniebiz-connect-php",
        signMethod: "sha1",
      };

      const res = await fetch(
        `${apiBase.replace(/\/$/, "")}/payment-gateway-check/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        alert(json?.error || json?.message || "Failed to initiate payment");
        return;
      }

      const url = json?.data?.url ?? json?.url;
      if (url) {
        window.location.href = url;
        return;
      }

      alert("Payment created but no redirect URL returned.");
    } catch (err: any) {
      alert("Failed to start payment: " + err.message);
    } finally {
      setTopUpLoading(false);
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
              <DollarLineIcon className={`w-6 h-6 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
            </div>
            <h1 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-sky-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              My Wallet
            </h1>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Manage your wallet balance</p>
        </div>

        {/* Wallet Balance Card */}
        {wallet && (
          <div className={`mb-6 backdrop-blur-xl ${isDark ? 'bg-white/5' : 'bg-white/60'} rounded-2xl p-6 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} shadow-2xl relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isDark ? 'from-blue-500/20' : 'from-blue-400/30'} to-transparent rounded-full blur-2xl`}></div>
            <div className="relative z-10">
              <div className="text-center">
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Available Balance</p>
                <p className={`text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-sky-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  LKR {parseFloat(wallet.balance || 0).toFixed(2)}
                </p>
                <div className="space-y-2 text-sm">
                  <p className={isDark ? "text-gray-300" : "text-gray-600"}>
                    Min Limit: <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>LKR {parseFloat(wallet.min_limit || 0).toFixed(2)}</span>
                  </p>
                  {wallet.pending_balance > 0 && (
                    <p className="text-yellow-500">
                      Pending: <span className="text-yellow-400 font-medium">LKR {parseFloat(wallet.pending_balance || 0).toFixed(2)}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Up Form */}
        <div className={`mb-6 backdrop-blur-xl ${isDark ? 'bg-white/5' : 'bg-white/60'} rounded-2xl p-6 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} shadow-2xl`}>
          <h2 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Top Up Wallet</h2>
          <form onSubmit={handleTopUp} className="space-y-4">
            <div>
              <Label className={isDark ? "text-gray-200" : "text-gray-700"}>Amount (LKR)</Label>
              <Input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Enter amount"
                min="0.01"
                step={0.01}
                required
                className={`${isDark ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'} focus:ring-blue-500/50`}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white shadow-lg shadow-blue-500/30"
              size="sm"
              disabled={topUpLoading}
            >
              {topUpLoading ? "Processing..." : "Top Up"}
            </Button>
          </form>
        </div>

        {/* Transactions */}
        <div className={`backdrop-blur-xl ${isDark ? 'bg-white/5' : 'bg-white/60'} rounded-2xl p-6 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} shadow-2xl`}>
          <h2 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Transaction History</h2>
          {transactions.length === 0 ? (
            <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No transactions found</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between py-3 px-4 rounded-xl ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} border transition-all`}
                >
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {transaction.transaction_type.replace("_", " ")}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {transaction.description || "No description"}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(transaction.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.transaction_type === "deposit" ||
                        transaction.transaction_type === "refund"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.transaction_type === "deposit" ||
                      transaction.transaction_type === "refund"
                        ? "+"
                        : "-"}
                      LKR {parseFloat(transaction.amount).toFixed(2)}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Balance: LKR {parseFloat(transaction.balance_after).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
