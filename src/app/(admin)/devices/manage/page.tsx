"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { devicesApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";

const DEVICE_MANAGE_ID_KEY = "deviceManageId";

function getDeviceIdFromStorage(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const s = sessionStorage.getItem(DEVICE_MANAGE_ID_KEY);
    if (s) {
      const n = parseInt(s, 10);
      if (!Number.isNaN(n)) return n;
    }
    const l = localStorage.getItem(DEVICE_MANAGE_ID_KEY);
    if (l) {
      const n = parseInt(l, 10);
      if (!Number.isNaN(n)) return n;
    }
  } catch {
    // ignore
  }
  return null;
}

interface Device {
  id: number;
  store_id: number;
  device_name: string;
  device_code: string;
  device_token?: string | null;
  number_of_power_banks: number;
  status: string;
  store?: {
    id: number;
    name: string;
    address?: string;
    city?: string;
  };
}

function DeviceManageContent() {
  const searchParams = useSearchParams();
  const idFromUrl = useMemo(() => {
    if (typeof window === "undefined") return null;
    const id = searchParams?.get("id");
    if (id == null || id === "") return null;
    const n = parseInt(decodeURIComponent(id), 10);
    return Number.isNaN(n) ? null : n;
  }, [searchParams]);

  const [id, setId] = useState<number | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ejectingSlot, setEjectingSlot] = useState<number | null>(null);
  const [ejectingAll, setEjectingAll] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const resolved = idFromUrl ?? getDeviceIdFromStorage();
    if (resolved != null) {
      setId(resolved);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(DEVICE_MANAGE_ID_KEY, String(resolved));
        localStorage.setItem(DEVICE_MANAGE_ID_KEY, String(resolved));
      }
    } else {
      setId(null);
    }
  }, [idFromUrl]);

  useEffect(() => {
    if (id != null) fetchDevice();
    else setLoading(false);
  }, [id]);

  const fetchDevice = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      const response = await devicesApi.getById(id);
      if (response.error) {
        setError(response.error);
        setDevice(null);
      } else if (response.data) {
        const res = response.data as { data?: Device };
        setDevice(res.data ?? null);
      }
    } catch {
      setError("Failed to load device");
      setDevice(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEject = async (slot: number) => {
    if (!id) return;
    setActionMessage(null);
    setEjectingSlot(slot);
    try {
      const response = await devicesApi.eject(id, slot);
      if (response.error) {
        setActionMessage({ type: "error", text: response.error });
      } else {
        setActionMessage({ type: "success", text: `Slot ${slot} eject command sent.` });
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to send eject command." });
    } finally {
      setEjectingSlot(null);
    }
  };

  const handleEjectAll = async () => {
    if (!id) return;
    setActionMessage(null);
    setEjectingAll(true);
    try {
      const response = await devicesApi.ejectAll(id);
      if (response.error) {
        setActionMessage({ type: "error", text: response.error });
      } else {
        setActionMessage({ type: "success", text: "Eject all command sent." });
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to send eject all command." });
    } finally {
      setEjectingAll(false);
    }
  };

  if (!id) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No device selected. Select a device from the list.</p>
        <Link href="/devices">
          <Button size="sm" variant="outline">Back to devices</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading device…</p>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="rounded-2xl border border-error-200 dark:border-error-500/30 bg-error-50/50 dark:bg-error-500/5 p-6 text-center">
        <p className="text-error-600 dark:text-error-400 font-medium mb-4">{error || "Device not found"}</p>
        <Link href="/devices">
          <Button size="sm" variant="outline">Back to devices</Button>
        </Link>
      </div>
    );
  }

  const numSlots = Math.max(0, Number(device.number_of_power_banks) || 0);
  const slots = Array.from({ length: numSlots }, (_, i) => i + 1);

  const statusConfig = {
    active: { label: "Active", class: "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400 border-success-200 dark:border-success-500/30", dotClass: "bg-success-500" },
    maintenance: { label: "Maintenance", class: "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400 border-warning-200 dark:border-warning-500/30", dotClass: "bg-warning-500" },
    inactive: { label: "Inactive", class: "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400 border-gray-200 dark:border-gray-600", dotClass: "bg-gray-500" },
    error: { label: "Error", class: "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400 border-error-200 dark:border-error-500/30", dotClass: "bg-error-500" },
  };
  const status = statusConfig[device.status as keyof typeof statusConfig] ?? statusConfig.inactive;

  return (
    <div className="space-y-6 pb-8">
      {/* Breadcrumb & header */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/devices"
          className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
        >
          Devices
        </Link>
        <span className="text-gray-400 dark:text-gray-500">/</span>
        <span className="font-medium text-gray-800 dark:text-white/90 truncate max-w-[200px] sm:max-w-none">
          {device.device_name}
        </span>
      </div>

      {actionMessage && (
        <div
          role="alert"
          className={`flex items-center gap-2 p-4 rounded-xl text-sm font-medium shadow-sm ${
            actionMessage.type === "success"
              ? "text-success-700 bg-success-50 border border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20"
              : "text-error-700 bg-error-50 border border-error-200 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20"
          }`}
        >
          {actionMessage.type === "success" ? (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {actionMessage.text}
        </div>
      )}

      {/* Device details — rich card */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02] overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-brand-50 to-gray-50 dark:from-brand-500/10 dark:to-gray-900/50 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3h13.5a3 3 0 013-3m-3 3a3 3 0 00-3-3m-3 3a3 3 0 00-3 3m3 3h.75v9a2.25 2.25 0 002.25 2.25h13.5a2.25 2.25 0 002.25-2.25v-9m-13.5 0h13.5" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white/95 tracking-tight">
                  {device.device_name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Code: {device.device_code}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${status.class}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} aria-hidden />
              {status.label}
            </span>
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Device information
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Store</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white/90">{device.store?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Device code</dt>
              <dd className="mt-1 text-sm font-mono font-medium text-gray-900 dark:text-white/90">{device.device_code}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Power bank slots</dt>
              <dd className="mt-1 text-sm font-semibold text-brand-600 dark:text-brand-400">{numSlots}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Power banks — 2 columns, rich cards */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.02] overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            Power banks
          </h2>
          {numSlots > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleEjectAll}
              disabled={ejectingAll}
            >
              {ejectingAll ? "Sending…" : "Eject all"}
            </Button>
          )}
        </div>
        <div className="p-6">
          {numSlots === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-3">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No power bank slots configured</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Edit this device to set the number of slots</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {slots.map((slot) => {
                const isEjecting = ejectingSlot === slot;
                return (
                  <div
                    key={slot}
                    className="group relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-5 transition-all hover:border-brand-200 dark:hover:border-brand-500/40 hover:shadow-md dark:hover:shadow-brand-500/5"
                  >
                    <div className="flex flex-col h-full min-h-[140px]">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Slot {slot}
                        </span>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white/90 mb-1">
                        Power bank {slot}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex-1">
                        Eject this unit from the device
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleEject(slot)}
                        disabled={ejectingSlot !== null}
                        className="w-full mt-auto"
                      >
                        {isEjecting ? (
                          <span className="inline-flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Ejecting…
                          </span>
                        ) : (
                          "Eject"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DeviceManagePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>}>
      <DeviceManageContent />
    </Suspense>
  );
}
