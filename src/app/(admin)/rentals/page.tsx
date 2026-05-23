"use client";

import React, { useEffect, useState } from "react";
import { rentalsApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";

interface Rental {
  id: number;
  customer_id?: number;
  device_id?: number;
  qr_code_id?: number;
  start_time: string;
  end_time: string | null;
  duration_minutes?: number | null;
  status: string;
  device_name?: string;
  store_name?: string;
  payment_amount?: number | string;
  payment_status?: string;
  device_code?: string;
  qr_code?: string;
  power_bank_code?: string;
  power_bank_serial?: string;
  power_bank_id?: string;
}

function formatRentalDateTime(isoString: string | null | undefined): string {
  if (!isoString) return "—";
  const match = String(isoString).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (match) {
    const [, y, mo, day, h, m] = match;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const hour = parseInt(h, 10);
    const h12 = hour % 12 || 12;
    const ampm = hour < 12 ? "AM" : "PM";
    return `${parseInt(day, 10)} ${months[parseInt(mo, 10) - 1]} ${y}, ${h12}:${m} ${ampm}`;
  }
  return new Date(isoString).toLocaleString();
}

function parseRentalTimeAsLocal(isoString: string | null | undefined): Date | null {
  if (!isoString) return null;
  const match = String(isoString).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    const [, y, mo, d, h, min, s] = match;
    return new Date(
      parseInt(y!, 10),
      parseInt(mo!, 10) - 1,
      parseInt(d!, 10),
      parseInt(h!, 10),
      parseInt(min!, 10),
      parseInt(s!, 10) || 0,
      0
    );
  }
  return new Date(isoString);
}

function getDurationMinutes(rental: {
  start_time?: string;
  end_time?: string | null;
  duration_minutes?: number | null;
}): number | null {
  const start = parseRentalTimeAsLocal(rental.start_time);
  const end = parseRentalTimeAsLocal(rental.end_time);
  if (start && end) {
    const ms = end.getTime() - start.getTime();
    return Math.max(0, Math.round(ms / (1000 * 60)));
  }
  if (rental.duration_minutes != null && rental.duration_minutes >= 0) return rental.duration_minutes;
  return null;
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [selectedRentalId, setSelectedRentalId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await rentalsApi.getRentalHistory();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const data = response.data as { data?: Rental[] };
        setRentals(data.data || []);
      }
    } catch (err: unknown) {
      setError("Failed to fetch rentals: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDetails = (id: number) => {
    setSelectedRentalId((current) => (current === id ? null : id));
    setActionError("");
  };

  const handleCompleteRental = async (id: number) => {
    if (!id) return;
    setActionError("");
    setCompletingId(id);
    try {
      const response = await rentalsApi.endRental(id);
      if (response.error) {
        setActionError(response.error);
        setCompletingId(null);
        return;
      }
      await fetchRentals();
      setSelectedRentalId(null);
      setCompletingId(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to complete rental");
      setCompletingId(null);
    }
  };

  const filteredRentals = rentals.filter((rental) => {
    if (filter === "all") return true;
    return rental.status === filter;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading rentals...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Rental Management
        </h1>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "active" | "completed" | "cancelled")}
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Rentals</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 rounded-lg dark:bg-error-500/10">
          {error}
        </div>
      )}

      {actionError && (
        <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 rounded-lg dark:bg-error-500/10">
          {actionError}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Rental ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No rentals found
                  </td>
                </tr>
              ) : (
                filteredRentals.map((rental) => {
                  const durationMinutes = getDurationMinutes(rental);
                  const isSelected = selectedRentalId === rental.id;
                  const isCompleted = rental.status === "completed";
                  const powerBankCode =
                    rental.power_bank_code ?? rental.power_bank_serial ?? rental.power_bank_id ?? null;

                  return (
                    <React.Fragment key={rental.id}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white/90">
                          #{rental.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {rental.device_name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {rental.store_name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(rental.start_time).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {durationMinutes != null ? `${durationMinutes} min` : "Ongoing"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              rental.status === "active"
                                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                                : rental.status === "completed"
                                ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {rental.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {rental.payment_amount != null && rental.payment_amount !== ""
                            ? `LKR ${parseFloat(String(rental.payment_amount)).toFixed(2)}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleDetails(rental.id)}
                              className="text-brand-600 dark:text-brand-400 hover:underline text-xs font-medium"
                            >
                              {isSelected ? "Hide details" : "View details"}
                            </button>
                            {!isCompleted && (
                              <Button
                                size="sm"
                                className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 text-xs"
                                disabled={completingId === rental.id}
                                onClick={() => handleCompleteRental(rental.id)}
                              >
                                {completingId === rental.id ? "Completing..." : "Complete rental"}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isSelected && (
                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                          <td colSpan={9} className="px-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Rental ID:</span>{" "}{rental.id}</p>
                              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span>{" "}{rental.status}</p>
                              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Store:</span>{" "}{rental.store_name || "—"}</p>
                              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Date:</span>{" "}{formatRentalDateTime(rental.start_time)}</p>
                              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Start time:</span>{" "}{formatRentalDateTime(rental.start_time)}</p>
                              <p><span className="font-semibold text-gray-700 dark:text-gray-300">End time:</span>{" "}{rental.end_time ? formatRentalDateTime(rental.end_time) : rental.status === "active" ? "Still active" : "—"}</p>
                              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Duration:</span>{" "}{durationMinutes != null ? `${durationMinutes} minutes` : "—"}</p>
                              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Amount:</span>{" "}{rental.payment_amount != null && rental.payment_amount !== "" ? `LKR ${parseFloat(String(rental.payment_amount)).toFixed(2)}` : "—"}</p>
                              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Device:</span>{" "}{rental.device_name || "—"}</p>
                              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Device code:</span>{" "}{rental.device_code || rental.qr_code || "—"}</p>
                              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Power bank code:</span>{" "}{powerBankCode || "—"}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

