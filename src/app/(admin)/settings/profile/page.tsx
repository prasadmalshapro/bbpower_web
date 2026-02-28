"use client";

import React, { useEffect, useState, useCallback } from "react";
import { profileApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";

interface ProfileUser {
  id: number;
  username: string;
  email: string;
  mobile: string;
  role: string;
  status?: string;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    address: "",
    password: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await profileApi.getProfile();
      const resData = response.data as { data?: ProfileUser };
      if (response.error || !resData?.data) {
        setError(response.error || "Failed to load profile");
        setProfile(null);
      } else {
        setProfile(resData.data);
      }
    } catch {
      setError("Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const openEdit = () => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        email: profile.email || "",
        mobile: profile.mobile || "",
        address: profile.address ?? "",
        password: "",
      });
      setModalError("");
      setModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setSaving(true);
    try {
      const payload: {
        username: string;
        email: string;
        mobile: string;
        address: string;
        password?: string;
      } = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        address: formData.address.trim(),
      };
      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }
      const response = await profileApi.updateProfile(payload);
      if (response.error) {
        setModalError(response.error);
        return;
      }
      const resData = response.data as { data?: ProfileUser };
      if (resData?.data) {
        setProfile(resData.data);
        try {
          const stored = localStorage.getItem("user");
          if (stored) {
            const user = JSON.parse(stored);
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...user,
                username: resData.data.username,
                email: resData.data.email,
                mobile: resData.data.mobile,
                address: resData.data.address,
              })
            );
          }
        } catch {
          // ignore
        }
      }
      setModalOpen(false);
    } catch {
      setModalError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const initials = profile?.username
    ? profile.username
        .trim()
        .split(/\s+/)
        .map((s) => s[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"
    : "?";

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Profile
        </h1>
        <div className="flex items-center justify-center min-h-[280px]">
          <div className="text-gray-500 dark:text-gray-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Profile
        </h1>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="rounded-lg bg-error-50 p-4 text-error-600 dark:bg-error-500/10 dark:text-error-400">
            {error || "Profile not found"}
          </div>
          <Button className="mt-4" size="sm" variant="outline" onClick={fetchProfile}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
        Profile
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4">
        Manage your account information
      </p>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-2xl font-semibold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                {initials}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                  {profile.username}
                </h1>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </p>
                {memberSince && (
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    Member since {memberSince}
                  </p>
                )}
              </div>
            </div>
            <Button size="sm" onClick={openEdit} className="shrink-0">
              Edit profile
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800">
          <dl className="divide-y divide-gray-200 dark:divide-gray-800">
            <div className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:gap-4 lg:px-8">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-36 shrink-0">
                Email
              </dt>
              <dd className="text-sm text-gray-800 dark:text-white/90">
                {profile.email || "—"}
              </dd>
            </div>
            <div className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:gap-4 lg:px-8">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-36 shrink-0">
                Mobile
              </dt>
              <dd className="text-sm text-gray-800 dark:text-white/90">
                {profile.mobile || "—"}
              </dd>
            </div>
            <div className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-start sm:gap-4 lg:px-8">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-36 shrink-0">
                Address
              </dt>
              <dd className="text-sm text-gray-800 dark:text-white/90">
                {profile.address || "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        className="max-w-[520px] p-5 lg:p-8"
      >
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          Edit profile
        </h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Update your account details below.
        </p>

        {modalError && (
          <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
              placeholder="Username"
              minLength={3}
              required
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Email"
              required
            />
          </div>
          <div>
            <Label>Mobile</Label>
            <Input
              type="tel"
              value={formData.mobile}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, mobile: e.target.value }))
              }
              placeholder="Mobile number"
            />
          </div>
          <div>
            <Label>Address</Label>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Address"
              rows={3}
            />
          </div>
          <div>
            <Label>New password (leave blank to keep current)</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Min 6 characters"
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
