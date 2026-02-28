"use client";

import React, { useEffect, useState } from "react";
import { profileApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import FuturisticBackground from "@/components/customer/FuturisticBackground";
import { UserCircleIcon } from "@/icons";
import { useTheme } from "@/context/ThemeContext";

export default function CustomerProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    address: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileApi.getProfile();
      if (response.data) {
        const profileData = response.data as { data?: any };
        const userProfile = profileData.data;
        setProfile(userProfile);
        setFormData({
          username: userProfile.username || "",
          email: userProfile.email || "",
          mobile: userProfile.mobile || "",
          address: userProfile.address || "",
          password: "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const updateData: any = {
        username: formData.username,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await profileApi.updateProfile(updateData);
      if (response.error) {
        setError(response.error);
      } else {
        alert("Profile updated successfully");
        fetchProfile();
        setFormData({ ...formData, password: "" });
      }
    } catch (err: any) {
      setError("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
        <FuturisticBackground />
        <div className={`relative z-10 text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <FuturisticBackground />
      
      <div className="relative z-10 px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 bg-gradient-to-br ${isDark ? 'from-slate-500/20 to-gray-500/20' : 'from-slate-400/30 to-gray-400/30'} rounded-xl backdrop-blur-sm border ${isDark ? 'border-white/10' : 'border-gray-300/50'}`}>
              <UserCircleIcon className={`w-6 h-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
            </div>
            <h1 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              My Profile
            </h1>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Manage your account information</p>
        </div>

        {error && (
          <div className={`mb-4 p-3 text-sm text-error-500 ${isDark ? 'bg-error-500/20' : 'bg-error-50'} backdrop-blur-xl rounded-xl border ${isDark ? 'border-error-500/30' : 'border-error-200'}`}>
            {error}
          </div>
        )}

        <div className={`backdrop-blur-xl ${isDark ? 'bg-white/5' : 'bg-white/60'} rounded-2xl p-6 border ${isDark ? 'border-white/10' : 'border-gray-200/50'} shadow-2xl`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className={isDark ? "text-gray-200" : "text-gray-700"}>
                Username <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                minLength={3}
                className={`${isDark ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'} focus:ring-teal-500/50`}
              />
            </div>

            <div>
              <Label className={isDark ? "text-gray-200" : "text-gray-700"}>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className={`${isDark ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'} focus:ring-teal-500/50`}
              />
            </div>

            <div>
              <Label className={isDark ? "text-gray-200" : "text-gray-700"}>
                Mobile Number <span className="text-error-500">*</span>
              </Label>
              <Input
                type="tel"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                required
                className={`${isDark ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'} focus:ring-teal-500/50`}
              />
            </div>

            <div>
              <Label className={isDark ? "text-gray-200" : "text-gray-700"}>
                Address <span className="text-error-500">*</span>
              </Label>
              <textarea
                className={`w-full px-4 py-2 ${isDark ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 backdrop-blur-sm`}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
                rows={3}
                placeholder="Enter your address"
              />
            </div>

            <div>
              <Label className={isDark ? "text-gray-200" : "text-gray-700"}>
                New Password (leave blank to keep current)
              </Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter new password (min 6 characters)"
                minLength={6}
                className={`${isDark ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'} focus:ring-teal-500/50`}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30" 
              size="sm" 
              disabled={saving}
            >
              {saving ? "Saving..." : "Update Profile"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
