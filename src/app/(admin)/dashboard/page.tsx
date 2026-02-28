import type { Metadata } from "next";
import React from "react";
import DashboardOverview from "@/components/admin/DashboardOverview";

export const metadata: Metadata = {
  title: "Admin Dashboard | PowerBB",
  description: "Power Bank Rental Management System - Admin Dashboard",
};

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Here's what's happening with your power bank rental system.
          </p>
        </div>
      </div>
      <DashboardOverview />
    </div>
  );
}
