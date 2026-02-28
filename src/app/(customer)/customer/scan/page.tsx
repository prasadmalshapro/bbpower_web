"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { qrCodesApi, rentalsApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import QRScanner from "@/components/customer/QRScanner";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import { BoltIcon, PlugInIcon, BoxIconLine } from "@/icons";
import { useTheme } from "@/context/ThemeContext";

export default function QRScannerPage() {
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleQRScan = async (scannedCode: string) => {
    setQrCode(scannedCode);
    setShowCameraScanner(false);
    await processQRCode(scannedCode);
  };

  const processQRCode = async (code: string) => {
    if (!code.trim()) {
      setError("Please enter or scan a QR code");
      return;
    }

    setError("");
    setLoading(true);
    setDeviceInfo(null);

    try {
      const response = await qrCodesApi.scan(code.trim());
      if (response.error) {
        setError(response.error);
        setDeviceInfo(null);
        setLoading(false);
        return;
      }

      const data = response.data as { data?: any };
      if (data.data) {
        setDeviceInfo(data.data);
      }
    } catch (err: any) {
      setError("Failed to scan QR code: " + err.message);
      setDeviceInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    await processQRCode(qrCode.trim());
  };

  const handleStartRental = async () => {
    if (!deviceInfo || !qrCode.trim()) {
      setError("Please scan a QR code first.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const rentalResponse = await rentalsApi.startRentalNoPayment({
        qr_code: qrCode.trim(),
      });

      if (rentalResponse.error) {
        setError(rentalResponse.error);
        setLoading(false);
        return;
      }

      router.push("/customer/rental/active");
    } catch (err: any) {
      setError("Failed to start rental: " + err.message);
      setLoading(false);
    }
  };

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
              Scan QR Code
            </h1>
          </div>
          <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Scan to rent a power bank (no payment required)
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

        <div
          className={`backdrop-blur-xl ${
            isDark ? "bg-white/5" : "bg-white/60"
          } rounded-2xl p-6 border ${
            isDark ? "border-white/10" : "border-gray-200/50"
          } shadow-2xl mb-6`}
        >
          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              QR Code
            </label>
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="Enter QR code or scan"
              className={`w-full px-4 py-2 ${
                isDark
                  ? "bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 backdrop-blur-sm`}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowCameraScanner(true)}
              className={`flex-1 ${
                isDark
                  ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
              }`}
              size="sm"
              variant="outline"
            >
              📷 Use Camera
            </Button>
            <Button
              onClick={handleScan}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30"
              size="sm"
              disabled={loading}
            >
              {loading ? "Scanning..." : "Scan QR Code"}
            </Button>
          </div>
        </div>

        {deviceInfo && (
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
              Device Information
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
                    {deviceInfo.device?.device_name}
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
                    {deviceInfo.device?.store?.name}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                  Address:{" "}
                  <span
                    className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {deviceInfo.device?.store?.address}
                  </span>
                </span>
              </div>
            </div>

            <p
              className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Click below to start your rental. The power bank will be ejected from
              the device (payment is temporarily disabled).
            </p>

            <Button
              onClick={handleStartRental}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30"
              size="sm"
              disabled={loading}
            >
              {loading ? "Starting rental..." : "Start Rental"}
            </Button>
          </div>
        )}

        {showCameraScanner && (
          <QRScanner
            onScanSuccess={handleQRScan}
            onScanError={(err) => {
              console.error("Scan error:", err);
            }}
            onClose={() => setShowCameraScanner(false)}
          />
        )}
      </div>
    </div>
  );
}
