"use client";

import React, { useEffect, useState } from "react";
import { specialOffersApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

interface SpecialOffer {
  id: number;
  label: string;
  title: string;
  subtitle: string | null;
  is_active: boolean;
  display_order: number;
}

export default function SpecialOffersPage() {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [formData, setFormData] = useState({
    label: "SPECIAL OFFER",
    title: "",
    subtitle: "",
    is_active: true,
    display_order: "0",
  });

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await specialOffersApi.getAll();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const apiResponse = response.data as { data?: SpecialOffer[] };
        setOffers(apiResponse.data || []);
      }
    } catch {
      setError("Failed to fetch special offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleCreate = () => {
    setEditingOffer(null);
    setFormData({
      label: "SPECIAL OFFER",
      title: "",
      subtitle: "",
      is_active: true,
      display_order: "0",
    });
    setModalError("");
    openModal();
  };

  const handleEdit = (offer: SpecialOffer) => {
    setEditingOffer(offer);
    setFormData({
      label: offer.label || "SPECIAL OFFER",
      title: offer.title,
      subtitle: offer.subtitle || "",
      is_active: offer.is_active,
      display_order: String(offer.display_order ?? 0),
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
        label: formData.label.trim() || "SPECIAL OFFER",
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || null,
        is_active: formData.is_active,
        display_order: parseInt(formData.display_order, 10) || 0,
      };

      if (editingOffer) {
        const response = await specialOffersApi.update(editingOffer.id, payload);
        if (response.error) {
          setModalError(response.error);
        } else {
          closeModal();
          fetchOffers();
        }
      } else {
        const response = await specialOffersApi.create(payload);
        if (response.error) {
          setModalError(response.error);
        } else {
          closeModal();
          fetchOffers();
        }
      }
    } catch {
      setModalError(editingOffer ? "Failed to update offer" : "Failed to create offer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (offer: SpecialOffer) => {
    if (!window.confirm(`Delete offer "${offer.title}"?`)) return;
    try {
      const response = await specialOffersApi.delete(offer.id);
      if (response.error) {
        setError(response.error);
      } else {
        fetchOffers();
      }
    } catch {
      setError("Failed to delete offer");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading special offers...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Special Offers
        </h1>
        <Button size="sm" onClick={handleCreate}>
          Add Offer
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
                  Label
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Subtitle
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
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No special offers found
                  </td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr key={offer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {offer.label}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white/90 max-w-[200px] truncate">
                      {offer.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[240px] truncate">
                      {offer.subtitle || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {offer.display_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          offer.is_active
                            ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {offer.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="text-brand-500 hover:text-brand-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(offer)}
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
          {editingOffer ? "Edit Special Offer" : "Add Special Offer"}
        </h4>

        {modalError && (
          <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 rounded-lg dark:bg-error-500/10">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Label</Label>
            <Input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g. SPECIAL OFFER"
            />
          </div>
          <div>
            <Label>
              Title <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 50% Off"
              required
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Your next 3 rentals"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Display order</Label>
              <Input
                type="number"
                min={0}
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
                ? editingOffer
                  ? "Updating..."
                  : "Creating..."
                : editingOffer
                ? "Update Offer"
                : "Create Offer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
