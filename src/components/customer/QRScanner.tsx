"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  onClose?: () => void;
}

export default function QRScanner({
  onScanSuccess,
  onScanError,
  onClose,
}: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      // Request camera permission
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameraPermission(true);
        setError("");

        await scanner.start(
          devices[0].id,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            onScanSuccess(decodedText);
            stopScanning();
          },
          (errorMessage) => {
            // Ignore scanning errors (they're frequent)
            if (onScanError && errorMessage.includes("No QR code")) {
              // Only show error for non-scanning errors
            }
          }
        );
        setScanning(true);
      } else {
        setError("No cameras found");
        setCameraPermission(false);
      }
    } catch (err: any) {
      console.error("Error starting QR scanner:", err);
      setError(
        err.message || "Failed to start camera. Please check permissions."
      );
      setCameraPermission(false);
      if (onScanError) {
        onScanError(err.message || "Failed to start camera");
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      setScanning(false);
    }
  };

  const handleClose = () => {
    stopScanning();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Scan QR Code
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 rounded-lg dark:bg-error-500/10">
            {error}
          </div>
        )}

        {cameraPermission === false && (
          <div className="mb-4 p-3 text-sm text-yellow-600 bg-yellow-50 rounded-lg dark:bg-yellow-500/10">
            <p className="mb-2">Camera access is required to scan QR codes.</p>
            <p className="text-xs">
              Please allow camera access in your browser settings and refresh.
            </p>
          </div>
        )}

        <div
          id="qr-reader"
          className="w-full rounded-lg overflow-hidden mb-4"
          style={{ minHeight: "300px" }}
        />

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Point your camera at the QR code
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white/90 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

