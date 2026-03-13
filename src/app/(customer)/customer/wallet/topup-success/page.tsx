'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { walletApi } from "@/lib/api-client";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import { useTheme } from "@/context/ThemeContext";

type Status = "processing" | "success" | "error";

export default function WalletTopupSuccessPage() {
  const [status, setStatus] = useState<Status>("processing");
  const [message, setMessage] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const run = async () => {
      if (typeof window === "undefined") return;

      const params = new URLSearchParams(window.location.search);
      const txId = params.get("transactionId");
      const statusParam = params.get("status");
      setTransactionId(txId);

      const pendingStr = window.sessionStorage.getItem(
        "BBPOWER_WALLET_TOPUP_PENDING"
      );
      if (!pendingStr) {
        setStatus("error");
        setMessage("No pending wallet top-up found.");
        return;
      }

      let pending: { amount?: number } = {};
      try {
        pending = JSON.parse(pendingStr);
      } catch {
        setStatus("error");
        setMessage("Failed to read pending top-up data.");
        return;
      }

      if (!pending.amount || pending.amount <= 0) {
        setStatus("error");
        setMessage("Invalid pending top-up amount.");
        return;
      }

      // Only treat as success when payment is successful
      if (!txId) {
        setStatus("error");
        setMessage("Payment did not return a transaction ID.");
        return;
      }
      if (statusParam && statusParam.toLowerCase() !== "success") {
        setStatus("error");
        setMessage("Payment status is not successful.");
        return;
      }

      try {
        const response = await walletApi.topUp({
          amount: pending.amount,
          payment_gateway_ref: txId,
        });

        window.sessionStorage.removeItem("BBPOWER_WALLET_TOPUP_PENDING");

        // api-client wraps axios; on success, we expect data
        if ((response as any)?.error) {
          setStatus("error");
          setMessage((response as any).error || "Failed to top up wallet.");
          return;
        }

        setStatus("success");
        setMessage("Wallet topped up successfully.");

        setTimeout(() => {
          router.push("/customer/wallet");
        }, 2000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.message || "Failed to top up wallet.");
      }
    };

    run();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
      <FuturisticBackground />
      <div
        className={`relative z-10 max-w-md w-full mx-4 rounded-2xl p-6 shadow-2xl ${
          isDark ? "bg-black/60 border border-white/10" : "bg-white border border-gray-200"
        }`}
      >
        <h1
          className={`text-2xl font-semibold mb-3 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Wallet Top-up
        </h1>

        {status === "processing" && (
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Confirming your payment and updating your wallet…
          </p>
        )}

        {status === "success" && (
          <div className="space-y-2">
            <p className="text-green-500 font-medium">
              {message || "Wallet topped up successfully."}
            </p>
            {transactionId && (
              <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                Transaction ID:{" "}
                <span className="font-mono break-all">{transactionId}</span>
              </p>
            )}
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>
              Redirecting back to your wallet…
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-2">
            <p className="text-red-500 font-medium">
              {message || "Wallet top-up failed."}
            </p>
            {transactionId && (
              <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                Transaction ID:{" "}
                <span className="font-mono break-all">{transactionId}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

