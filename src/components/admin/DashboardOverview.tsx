"use client";

import React, { useEffect, useState } from "react";
import { storesApi, devicesApi, usersApi, qrCodesApi } from "@/lib/api-client";
import Link from "next/link";
import {
  BoxIconLine,
  PlugInIcon,
  UserCircleIcon,
  CheckCircleIcon,
  BoltIcon,
  BoxCubeIcon,
  PieChartIcon,
  ArrowRightIcon,
  TimeIcon,
  AlertIcon,
  GridIcon,
} from "@/icons";
import ComponentCard from "../common/ComponentCard";

interface DashboardStats {
  totalStores: number;
  totalDevices: number;
  totalUsers: number;
  activeDevices: number;
  inactiveDevices: number;
  totalQRCodes: number;
  activeQRCodes: number;
  totalCustomers: number;
  totalDistributors: number;
  totalAdmins: number;
}

interface RecentItem {
  id: number;
  name: string;
  type: string;
  date: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStores: 0,
    totalDevices: 0,
    totalUsers: 0,
    activeDevices: 0,
    inactiveDevices: 0,
    totalQRCodes: 0,
    activeQRCodes: 0,
    totalCustomers: 0,
    totalDistributors: 0,
    totalAdmins: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentItem[]>([]);
  const [recentStores, setRecentStores] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [storesRes, devicesRes, usersRes, qrCodesRes] = await Promise.all([
        storesApi.getAll(),
        devicesApi.getAll(),
        usersApi.getAll(),
        qrCodesApi.getAll(),
      ]);

      if (storesRes.data && devicesRes.data && usersRes.data && qrCodesRes.data) {
        const storesData = (storesRes.data as { data?: any[] }).data || [];
        const devicesData = (devicesRes.data as { data?: any[] }).data || [];
        const usersData = (usersRes.data as { data?: any[] }).data || [];
        const qrCodesData = (qrCodesRes.data as { data?: any[] }).data || [];

        const activeDevices = devicesData.filter((d: any) => d.status === "active").length;
        const inactiveDevices = devicesData.filter((d: any) => d.status === "inactive").length;
        const activeQRCodes = qrCodesData.filter((q: any) => q.is_active).length;

        const customers = usersData.filter((u: any) => u.role === "customer").length;
        const distributors = usersData.filter((u: any) => u.role === "distributor").length;
        const admins = usersData.filter((u: any) => u.role === "admin").length;

        // Get recent items (last 5)
        const recentUsersList = usersData
          .slice(0, 5)
          .map((u: any) => ({
            id: u.id,
            name: u.username || u.email,
            type: u.role,
            date: u.created_at || new Date().toISOString(),
          }));

        const recentStoresList = storesData
          .slice(0, 5)
          .map((s: any) => ({
            id: s.id,
            name: s.name,
            type: "store",
            date: s.created_at || new Date().toISOString(),
          }));

        setStats({
          totalStores: storesData.length,
          totalDevices: devicesData.length,
          totalUsers: usersData.length,
          activeDevices,
          inactiveDevices,
          totalQRCodes: qrCodesData.length,
          activeQRCodes,
          totalCustomers: customers,
          totalDistributors: distributors,
          totalAdmins: admins,
        });

        setRecentUsers(recentUsersList);
        setRecentStores(recentStoresList);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const mainStatCards = [
    {
      title: "Total Stores",
      value: stats.totalStores,
      icon: BoxIconLine,
      color: "bg-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      link: "/stores",
    },
    {
      title: "Total Devices",
      value: stats.totalDevices,
      icon: PlugInIcon,
      color: "bg-green-500",
      bgColor: "bg-green-50 dark:bg-green-500/10",
      iconColor: "text-green-600 dark:text-green-400",
      link: "/devices",
    },
    {
      title: "Active Devices",
      value: stats.activeDevices,
      icon: CheckCircleIcon,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      link: "/devices",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: UserCircleIcon,
      color: "bg-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      link: "/users",
    },
  ];

  const secondaryStats = [
    {
      title: "QR Codes",
      value: stats.totalQRCodes,
      active: stats.activeQRCodes,
      icon: BoltIcon,
      color: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Customers",
      value: stats.totalCustomers,
      icon: UserCircleIcon,
      color: "bg-indigo-50 dark:bg-indigo-500/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Distributors",
      value: stats.totalDistributors,
      icon: BoxCubeIcon,
      color: "bg-cyan-50 dark:bg-cyan-500/10",
      iconColor: "text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "Inactive Devices",
      value: stats.inactiveDevices,
      icon: AlertIcon,
      color: "bg-red-50 dark:bg-red-500/10",
      iconColor: "text-red-600 dark:text-red-400",
    },
  ];

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mainStatCards.map((card, index) => (
          <Link
            key={index}
            href={card.link}
            className="rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg dark:border-gray-800 dark:bg-white/[0.03] hover:border-brand-300 dark:hover:border-brand-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.title}
                </p>
                <h3 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">
                  {card.value}
                </h3>
              </div>
              <div
                className={`flex items-center justify-center w-14 h-14 rounded-xl ${card.bgColor}`}
              >
                <card.icon className={`w-7 h-7 ${card.iconColor}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Secondary Stats and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Secondary Stats */}
        <div className="lg:col-span-2">
          <ComponentCard title="System Overview">
            <div className="grid grid-cols-2 gap-4">
              {secondaryStats.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                          {stat.value}
                        </h4>
                        {stat.active !== undefined && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({stat.active} active)
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg ${stat.color}`}
                    >
                      <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ComponentCard>
        </div>

        {/* Quick Actions */}
        <div>
          <ComponentCard title="Quick Actions">
            <div className="space-y-3">
              <Link
                href="/users"
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-gray-800"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10">
                  <UserCircleIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Manage Users
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    View and manage users
                  </p>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                href="/stores"
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-gray-800"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                  <BoxIconLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Manage Stores
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    View and manage stores
                  </p>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                href="/devices"
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-gray-800"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 dark:bg-green-500/10">
                  <PlugInIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Manage Devices
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    View and manage devices
                  </p>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                href="/qr-codes"
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-gray-800"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                  <BoltIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Generate QR
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Create QR code
                  </p>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </ComponentCard>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <ComponentCard title="Recent Users" desc="Latest registered users">
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No users yet
              </p>
            ) : (
              recentUsers.map((user) => (
                <Link
                  key={user.id}
                  href="/users"
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-gray-800"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10">
                    <UserCircleIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <TimeIcon className="w-4 h-4" />
                    {formatDate(user.date)}
                  </div>
                </Link>
              ))
            )}
            <Link
              href="/users"
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm font-medium text-brand-600 transition-all hover:bg-brand-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-brand-400 dark:hover:bg-brand-500/10"
            >
              View All Users
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </ComponentCard>

        {/* Recent Stores */}
        <ComponentCard title="Recent Stores" desc="Latest added stores">
          <div className="space-y-3">
            {recentStores.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No stores yet
              </p>
            ) : (
              recentStores.map((store) => (
                <Link
                  key={store.id}
                  href="/stores"
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-gray-800"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10">
                    <BoxIconLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                      {store.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      Store
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <TimeIcon className="w-4 h-4" />
                    {formatDate(store.date)}
                  </div>
                </Link>
              ))
            )}
            <Link
              href="/stores"
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm font-medium text-brand-600 transition-all hover:bg-brand-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-brand-400 dark:hover:bg-brand-500/10"
            >
              View All Stores
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </ComponentCard>
      </div>

      {/* Status Overview */}
      <ComponentCard title="System Status" desc="Current system health and statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Active Devices
                </p>
                <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                  {stats.activeDevices}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                <BoltIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Active QR Codes
                </p>
                <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                  {stats.activeQRCodes}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                <UserCircleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Customers
                </p>
                <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                  {stats.totalCustomers}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-500/10">
                <BoxCubeIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Distributors
                </p>
                <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                  {stats.totalDistributors}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
