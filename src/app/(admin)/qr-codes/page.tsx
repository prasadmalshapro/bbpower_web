"use client";

import React, { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { qrCodesApi, devicesApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";

interface QRCode {
  id: number;
  device_id: number;
  qr_code: string;
  is_active: boolean;
  device?: {
    id: number;
    device_name: string;
    store?: {
      name: string;
    };
  };
}

interface Device {
  id: number;
  device_name: string;
}

export default function QRCodesPage() {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<number | "">("");
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedDeviceForGenerate, setSelectedDeviceForGenerate] = useState<number | "">("");
  const [viewPrintQR, setViewPrintQR] = useState<QRCode | null>(null);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchQRCodes();
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice !== "") {
      fetchQRCodes();
    } else {
      fetchQRCodes();
    }
  }, [selectedDevice]);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedDevice) {
        params.device_id = selectedDevice;
      }
      const response = await qrCodesApi.getAll(params);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const apiResponse = response.data as { data?: QRCode[] };
        const qrCodesData = apiResponse.data || [];
        setQRCodes(qrCodesData);
      }
    } catch {
      setError("Failed to fetch QR codes");
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await devicesApi.getAll();
      if (response.data) {
        const apiResponse = response.data as { data?: Device[] };
        const devicesData = apiResponse.data || [];
        setDevices(devicesData);
      }
    } catch {
      console.error("Failed to fetch devices");
    }
  };

  const handleGenerate = async () => {
    if (!selectedDeviceForGenerate) {
      alert("Please select a device");
      return;
    }

    if (!confirm("Generate a new QR code for this device?")) return;

    try {
      const response = await qrCodesApi.generate(selectedDeviceForGenerate as number);
      if (response.error) {
        alert(response.error);
      } else {
        closeModal();
        setSelectedDeviceForGenerate("");
        fetchQRCodes();
      }
    } catch {
      alert("Failed to generate QR code");
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await qrCodesApi.update(id, { is_active: !isActive });
      if (response.error) {
        alert(response.error);
      } else {
        fetchQRCodes();
      }
    } catch {
      alert("Failed to update QR code");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this QR code?")) return;

    try {
      const response = await qrCodesApi.delete(id);
      if (response.error) {
        alert(response.error);
      } else {
        fetchQRCodes();
      }
    } catch {
      alert("Failed to delete QR code");
    }
  };

  const openGenerateModal = () => {
    setSelectedDeviceForGenerate("");
    openModal();
  };

  const handlePrintQR = () => {
    if (!viewPrintQR) return;
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const deviceName = viewPrintQR.device?.device_name || `Device ${viewPrintQR.device_id}`;
    const storeName = viewPrintQR.device?.store?.name || "";
    const printWindow = window.open("", "_blank", "width=400,height=500");
    if (!printWindow) {
      alert("Please allow pop-ups to print the QR code.");
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${deviceName}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 24px; text-align: center; }
            h1 { font-size: 18px; margin-bottom: 8px; }
            p { color: #666; font-size: 14px; margin-bottom: 16px; }
            img { max-width: 256px; height: auto; }
            .url { word-break: break-all; font-size: 12px; color: #888; margin-top: 16px; }
          </style>
        </head>
        <body>
          <h1>${deviceName}</h1>
          ${storeName ? `<p>${storeName}</p>` : ""}
          <p>Scan with mobile app to rent a power bank</p>
          <img src="${dataUrl}" alt="QR Code" />
          <div class="url">${viewPrintQR.qr_code}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (loading) {
    return <div className="text-center py-8">Loading QR codes...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          QR Codes Management
        </h1>
        <Button size="sm" onClick={openGenerateModal}>
          Generate QR Code
        </Button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Each QR code stores a web URL with <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">?q=deviceCode</code>. Users can scan the QR or enter the device code in the app.
      </p>

      <div className="mb-4 flex gap-4 items-end">
        <div className="flex-1 max-w-xs">
          <Label>Filter by Device</Label>
          <Select
            options={[
              { value: "", label: "All Devices" },
              ...devices.map((device) => ({
                value: device.id.toString(),
                label: device.device_name,
              })),
            ]}
            defaultValue={selectedDevice === "" ? "" : selectedDevice.toString()}
            onChange={(value) => setSelectedDevice(value === "" ? "" : parseInt(value))}
            placeholder="All Devices"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 rounded-lg dark:bg-error-500/10">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  QR Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {qrCodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No QR codes found
                  </td>
                </tr>
              ) : (
                qrCodes.map((qrCode) => (
                  <tr key={qrCode.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white/90">
                      {qrCode.qr_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {qrCode.device?.device_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {qrCode.device?.store?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          qrCode.is_active
                            ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {qrCode.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setViewPrintQR(qrCode)}
                        className="text-brand-500 hover:text-brand-600"
                      >
                        View & Print
                      </button>
                      <button
                        onClick={() => handleToggleActive(qrCode.id, qrCode.is_active)}
                        className="text-brand-500 hover:text-brand-600"
                      >
                        {qrCode.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(qrCode.id)}
                        className="text-error-500 hover:text-error-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={viewPrintQR !== null}
        onClose={() => setViewPrintQR(null)}
        className="max-w-[420px] p-5 lg:p-10"
      >
        {viewPrintQR && (
          <>
            <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
              Scan to rent
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {viewPrintQR.device?.device_name || `Device ${viewPrintQR.device_id}`}
              {viewPrintQR.device?.store?.name && ` · ${viewPrintQR.device.store.name}`}
            </p>
            <div ref={qrCanvasRef} className="flex justify-center bg-white p-4 rounded-lg mb-4">
              <QRCodeCanvas value={viewPrintQR.qr_code} size={256} level="M" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">
              Scan this QR code with the mobile app to start a rental
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button size="sm" variant="outline" type="button" onClick={() => setViewPrintQR(null)}>
                Close
              </Button>
              <Button size="sm" onClick={handlePrintQR}>
                Print
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[500px] p-5 lg:p-10"
      >
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          Generate QR Code
        </h4>

        <div className="space-y-6">
          <div>
            <Label>
              Device <span className="text-error-500">*</span>
            </Label>
            <Select
              options={devices.map((device) => ({
                value: device.id.toString(),
                label: device.device_name,
              }))}
              defaultValue={selectedDeviceForGenerate === "" ? "" : selectedDeviceForGenerate.toString()}
              onChange={(value) => setSelectedDeviceForGenerate(value === "" ? "" : parseInt(value))}
              placeholder="Select a device"
            />
          </div>

          <div className="flex items-center justify-end w-full gap-3 mt-8">
            <Button size="sm" variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={!selectedDeviceForGenerate}
            >
              Generate QR Code
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
