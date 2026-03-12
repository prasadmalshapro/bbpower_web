"use client";

import React, { useEffect, useState } from "react";
import { tipsApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

const TIP_ICONS = [
  { value: "", label: "(None)" },
  { value: "leaf", label: "Leaf" },
  { value: "pulse", label: "Pulse" },
  { value: "battery", label: "Battery" },
  { value: "temperature", label: "Temperature" },
  { value: "shield", label: "Shield" },
  { value: "unplug", label: "Unplug" },
  { value: "maintenance", label: "Maintenance" },
  { value: "bolt", label: "Bolt" },
  { value: "settings", label: "Settings" },
];

interface Tip {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

export default function TipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    icon: "",
    display_order: "0",
    is_active: true,
  });

  const fetchTips = async () => {
    try {
      setLoading(true);
      const response = await tipsApi.getAll();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const apiResponse = response.data as { data?: Tip[] };
        setTips(apiResponse.data || []);
      }
    } catch {
      setError("Failed to fetch tips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const handleCreate = () => {
    setEditingTip(null);
    setFormData({
      title: "",
      description: "",
      category: "general",
      icon: "",
      display_order: "0",
      is_active: true,
    });
    setModalError("");
    openModal();
  };

  const handleEdit = (tip: Tip) => {
    setEditingTip(tip);
    setFormData({
      title: tip.title,
      description: tip.description,
      category: tip.category || "general",
      icon: tip.icon || "",
      display_order: String(tip.display_order ?? 0),
      is_active: tip.is_active,
    });
    setModalError("");
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim() || "general",
        icon: formData.icon.trim() || null,
        display_order: parseInt(formData.display_order, 10) || 0,
        is_active: formData.is_active,
      };

      if (editingTip) {
        const response = await tipsApi.update(editingTip.id, payload);
        if (response.error) {
          setModalError(response.error);
        } else {
          closeModal();
          fetchTips();
        }
      } else {
        const response = await tipsApi.create(payload);
        if (response.error) {
          setModalError(response.error);
        } else {
          closeModal();
          fetchTips();
        }
      }
    } catch {
      setModalError(editingTip ? "Failed to update tip" : "Failed to create tip");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tip: Tip) => {
    if (!window.confirm(`Delete tip "${tip.title}"?`)) return;
    try {
      const response = await tipsApi.delete(tip.id);
      if (response.error) {
        setError(response.error);
      } else {
        fetchTips();
      }
    } catch {
      setError("Failed to delete tip");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading tips...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Battery Tips
        </h1>
        <Button size="sm" onClick={handleCreate}>
          Add Tip
        </Button>
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
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Order
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
              {tips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No tips found
                  </td>
                </tr>
              ) : (
                tips.map((tip) => (
                  <tr key={tip.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white/90 max-w-[200px] truncate">
                      {tip.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[240px] truncate">
                      {tip.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {tip.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {tip.icon || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {tip.display_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tip.is_active
                            ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {tip.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(tip)}
                        className="text-brand-500 hover:text-brand-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tip)}
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
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          {editingTip ? "Edit Tip" : "Add Tip"}
        </h4>

        {modalError && (
          <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 rounded-lg dark:bg-error-500/10">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>
              Title <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Charge Before It's Too Late"
              required
            />
          </div>
          <div>
            <Label>
              Description <span className="text-error-500">*</span>
            </Label>
            <textarea
              className="h-24 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tip description"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. general, battery_health"
              />
            </div>
            <div>
              <Label>Icon</Label>
              <select
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              >
                {TIP_ICONS.map((opt) => (
                  <option key={opt.value || "none"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Display order</Label>
              <Input
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
              />
            </div>
            <div>
              <Label>Active</Label>
              <select
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                value={formData.is_active ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end w-full gap-3 mt-8">
            <Button size="sm" variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={submitting}>
              {submitting
                ? editingTip
                  ? "Updating..."
                  : "Creating..."
                : editingTip
                ? "Update Tip"
                : "Create Tip"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
