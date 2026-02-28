"use client";

import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { notificationsApi } from "@/lib/api-client";

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

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} day(s) ago`;
  return date.toLocaleDateString();
}

function getCustomerEntityLink(n: Notification): string | null {
  if (!n.entity_type || n.entity_id == null) return null;
  if (n.entity_type === "rental") return "/customer/rentals";
  if (n.entity_type === "payment") return "/customer/payments";
  if (n.entity_type === "device") return "/customer/stores";
  return null;
}

interface CustomerNotificationDropdownProps {
  isDark?: boolean;
}

export default function CustomerNotificationDropdown({ isDark = false }: CustomerNotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      if (res.data && typeof (res.data as { count?: number }).count === "number") {
        setUnreadCount((res.data as { count: number }).count);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.getAll({ limit: 10 });
      const data = res.data as { data?: Notification[]; total?: number };
      setNotifications(data?.data ?? []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      fetchRecent();
      fetchUnreadCount();
    }
  }, [isOpen, fetchRecent, fetchUnreadCount]);

  function toggleDropdown() {
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleItemClick = (n: Notification) => {
    if (!n.is_read) handleMarkAsRead(n.id);
    closeDropdown();
  };

  const btnClass = isDark
    ? "text-gray-300 hover:text-white hover:bg-white/10"
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100";

  return (
    <div className="relative">
      <button
        type="button"
        className={`relative dropdown-toggle flex items-center justify-center p-2 transition-colors rounded-lg ${btnClass}`}
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0.5 z-10 flex h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping" />
          </span>
        )}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className={`right-0 mt-2 flex h-[400px] w-[min(350px,90vw)] flex-col rounded-2xl border p-3 shadow-theme-lg ${
          isDark ? "border-white/20 bg-gray-900/95" : "border-gray-200 bg-white"
        }`}
      >
        <div className={`flex items-center justify-between pb-3 mb-3 border-b ${isDark ? "border-white/20" : "border-gray-100"}`}>
          <h5 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
            Notifications
          </h5>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs text-teal-400 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          {loading ? (
            <li className={`py-6 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Loading...</li>
          ) : notifications.length === 0 ? (
            <li className={`py-6 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>No notifications</li>
          ) : (
            notifications.map((n) => {
              const href = getCustomerEntityLink(n);
              const content = (
                <>
                  <span className={`relative flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                    n.type === "success" ? "bg-teal-500/20" :
                    n.type === "error" ? "bg-red-500/20" :
                    n.type === "warning" ? "bg-amber-500/20" :
                    isDark ? "bg-white/10" : "bg-gray-200"
                  }`}>
                    <svg className={`w-5 h-5 ${isDark ? "text-gray-300" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </span>
                  <span className="block min-w-0 flex-1">
                    <span className={`mb-1.5 block text-sm font-medium ${isDark ? "text-white" : "text-gray-800"}`}>
                      {n.title}
                    </span>
                    <span className={`block text-xs line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {n.message}
                    </span>
                    <span className={`flex items-center gap-2 mt-1 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      {n.entity_type && <span className="capitalize">{n.entity_type}</span>}
                      {n.entity_type && <span className="w-1 h-1 bg-gray-400 rounded-full" />}
                      <span>{formatRelativeTime(n.created_at)}</span>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={n.id}>
                  {href ? (
                    <Link
                      href={href}
                      onClick={() => handleItemClick(n)}
                      className={`flex gap-3 rounded-lg border-b p-3 hover:bg-white/5 ${isDark ? "border-white/10" : "border-gray-100 hover:bg-gray-50"}`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className={`w-full flex gap-3 rounded-lg border-b p-3 text-left ${isDark ? "border-white/10 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"}`}
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })
          )}
        </ul>
        <Link
          href="/customer/notifications"
          onClick={closeDropdown}
          className={`block px-4 py-2 mt-3 text-sm font-medium text-center rounded-lg border ${
            isDark ? "text-gray-200 border-white/20 hover:bg-white/10" : "text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}
