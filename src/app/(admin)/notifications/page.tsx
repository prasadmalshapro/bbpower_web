"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { notificationsApi } from "@/lib/api-client";
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

function getEntityLink(n: Notification): string | null {
  if (!n.entity_type || n.entity_id == null) return null;
  if (n.entity_type === "rental") return "/rentals";
  if (n.entity_type === "device") return `/devices/manage?id=${n.entity_id}`;
  if (n.entity_type === "payment") return "/payments";
  if (n.entity_type === "user") return "/users";
  return null;
}

export default function NotificationsPage() {
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
      setTotal((t) => t);
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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Notifications
        </h1>
        <Button size="sm" variant="outline" onClick={handleMarkAllAsRead}>
          Mark all as read
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 rounded-lg dark:bg-error-500/10">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[180px] max-w-sm">
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or message..."
            className="w-full"
          />
        </div>
        <div className="w-[140px]">
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
        <div className="w-[140px]">
          <Select
            value={entityTypeFilter}
            onChange={setEntityTypeFilter}
            options={[
              { value: "", label: "All categories" },
              { value: "device", label: "Device" },
              { value: "rental", label: "Rental" },
              { value: "payment", label: "Payment" },
              { value: "user", label: "User" },
              { value: "system", label: "System" },
            ]}
            placeholder="Category"
          />
        </div>
        <div className="w-[140px]">
          <Select
            value={isReadFilter}
            onChange={setIsReadFilter}
            options={[
              { value: "", label: "All" },
              { value: "0", label: "Unread" },
              { value: "1", label: "Read" },
            ]}
            placeholder="Read status"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              No notifications match your filters.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {notifications.map((n) => {
                  const href = getEntityLink(n);
                  return (
                    <tr
                      key={n.id}
                      className={!n.is_read ? "bg-brand-50/30 dark:bg-brand-500/5" : ""}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white/90">
                        {n.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {n.message}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            n.type === "success"
                              ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                              : n.type === "error"
                              ? "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
                              : n.type === "warning"
                              ? "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {n.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {n.entity_type ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(n.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        {!n.is_read && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(n.id)}
                            className="text-brand-500 hover:text-brand-600"
                          >
                            Mark read
                          </button>
                        )}
                        {href && (
                          <Link href={href} className="text-brand-500 hover:text-brand-600">
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {total} total
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="flex items-center px-2 text-sm text-gray-600 dark:text-gray-400">
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
  );
}
