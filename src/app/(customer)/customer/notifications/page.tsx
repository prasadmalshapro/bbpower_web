"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { notificationsApi } from "@/lib/api-client";
import { useTheme } from "@/context/ThemeContext";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  entity_type?: string | null;
  entity_id?: number | null;
  action?: string | null;
  is_read: boolean;
  created_at: string;
}

const PAGE_SIZE = 20;

function getCustomerEntityLink(n: Notification): string | null {
  if (!n.entity_type || n.entity_id == null) return null;
  if (n.entity_type === "rental") return "/customer/rentals";
  if (n.entity_type === "payment") return "/customer/payments";
  if (n.entity_type === "device") return "/customer/stores";
  return null;
}

export default function CustomerNotificationsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [isReadFilter, setIsReadFilter] = useState("");
  const [page, setPage] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await notificationsApi.getAll({
        search: search.trim() || undefined,
        type: typeFilter || undefined,
        entity_type: entityTypeFilter || undefined,
        is_read: isReadFilter === "" ? undefined : isReadFilter === "1" ? 1 : 0,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      if (res.error) {
        setError(res.error);
        setNotifications([]);
        setTotal(0);
      } else {
        const data = res.data as { data?: Notification[]; total?: number };
        setNotifications(data?.data ?? []);
        setTotal(data?.total ?? 0);
      }
    } catch {
      setError("Failed to load notifications");
      setNotifications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, entityTypeFilter, isReadFilter, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchNotifications();
    }, 300);
    return () => clearTimeout(t);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <FuturisticBackground />
      <div className="relative z-10 px-4 py-6">
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500 ${isDark ? "text-white" : "text-gray-900"}`}>
              Notifications
            </h1>
            <Button size="sm" variant="outline" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          </div>
        </div>

        {error && (
          <div className={`mb-4 p-3 text-sm rounded-lg ${isDark ? "text-red-300 bg-red-500/10" : "text-red-600 bg-red-50"}`}>
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[140px] max-w-[200px]">
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full"
            />
          </div>
          <div className="w-[120px]">
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "", label: "All types" },
                { value: "info", label: "Info" },
                { value: "success", label: "Success" },
                { value: "warning", label: "Warning" },
                { value: "error", label: "Error" },
              ]}
              placeholder="Type"
            />
          </div>
          <div className="w-[120px]">
            <Select
              value={entityTypeFilter}
              onChange={setEntityTypeFilter}
              options={[
                { value: "", label: "All" },
                { value: "device", label: "Device" },
                { value: "rental", label: "Rental" },
                { value: "payment", label: "Payment" },
              ]}
              placeholder="Category"
            />
          </div>
          <div className="w-[100px]">
            <Select
              value={isReadFilter}
              onChange={setIsReadFilter}
              options={[
                { value: "", label: "All" },
                { value: "0", label: "Unread" },
                { value: "1", label: "Read" },
              ]}
              placeholder="Status"
            />
          </div>
        </div>

        <div className={`rounded-2xl border overflow-hidden backdrop-blur-xl ${isDark ? "bg-white/5 border-white/10" : "bg-white/70 border-gray-200/50"}`}>
          {loading ? (
            <div className={`py-12 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className={`py-12 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              No notifications match your filters.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200/50 dark:divide-white/10">
              {notifications.map((n) => {
                const href = getCustomerEntityLink(n);
                return (
                  <li
                    key={n.id}
                    className={`p-4 ${!n.is_read ? (isDark ? "bg-teal-500/5" : "bg-teal-50/50") : ""}`}
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{n.title}</p>
                        <p className={`text-sm truncate max-w-full ${isDark ? "text-gray-400" : "text-gray-500"}`}>{n.message}</p>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {new Date(n.created_at).toLocaleString()}
                          {n.entity_type && ` · ${n.entity_type}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0 shrink-0">
                        {!n.is_read && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(n.id)}
                            className="text-sm text-teal-500 hover:text-teal-400"
                          >
                            Mark read
                          </button>
                        )}
                        {href && (
                          <Link href={href} className="text-sm text-teal-500 hover:text-teal-400">
                            View
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {totalPages > 1 && (
            <div className={`px-4 py-3 border-t flex items-center justify-between ${isDark ? "border-white/10" : "border-gray-200"}`}>
              <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{total} total</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <span className={`flex items-center px-2 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
