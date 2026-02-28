"use client";

import React, { useEffect, useState } from "react";
import { rateCardsApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

interface RateCard {
  id: number;
  first_duration_minutes: number;
  first_amount: number;
  subsequent_duration_minutes: number;
  subsequent_amount: number;
  refundable_deposit: number;
  is_active: boolean;
}

export default function RateCardsPage() {
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [activeRateCard, setActiveRateCard] = useState<RateCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [editingRateCard, setEditingRateCard] = useState<RateCard | null>(null);
  const [formData, setFormData] = useState({
    first_duration_minutes: "",
    first_amount: "",
    subsequent_duration_minutes: "",
    subsequent_amount: "",
    refundable_deposit: "",
    is_active: true,
  });

  useEffect(() => {
    fetchRateCards();
    fetchActiveRateCard();
  }, []);

  const fetchRateCards = async () => {
    try {
      setLoading(true);
      const response = await rateCardsApi.getAll();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const apiResponse = response.data as { data?: RateCard[] };
        const rateCardsData = apiResponse.data || [];
        setRateCards(rateCardsData);
      }
    } catch {
      setError("Failed to fetch rate cards");
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveRateCard = async () => {
    try {
      const response = await rateCardsApi.getActive();
      if (response.data) {
        const apiResponse = response.data as { data?: RateCard };
        setActiveRateCard(apiResponse.data || null);
      }
    } catch {
      // No active rate card
    }
  };

  const handleCreate = () => {
    setEditingRateCard(null);
    setFormData({
      first_duration_minutes: "",
      first_amount: "",
      subsequent_duration_minutes: "",
      subsequent_amount: "",
      refundable_deposit: "",
      is_active: true,
    });
    setModalError("");
    openModal();
  };

  const handleEdit = (rateCard: RateCard) => {
    setEditingRateCard(rateCard);
    setFormData({
      first_duration_minutes: rateCard.first_duration_minutes.toString(),
      first_amount: rateCard.first_amount.toString(),
      subsequent_duration_minutes: rateCard.subsequent_duration_minutes.toString(),
      subsequent_amount: rateCard.subsequent_amount.toString(),
      refundable_deposit: rateCard.refundable_deposit.toString(),
      is_active: rateCard.is_active,
    });
    setModalError("");
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setSubmitting(true);

    try {
      const rateCardData = {
        first_duration_minutes: parseInt(formData.first_duration_minutes),
        first_amount: parseFloat(formData.first_amount),
        subsequent_duration_minutes: parseInt(formData.subsequent_duration_minutes),
        subsequent_amount: parseFloat(formData.subsequent_amount),
        refundable_deposit: parseFloat(formData.refundable_deposit),
        ...(editingRateCard && { is_active: formData.is_active }),
      };

      if (editingRateCard) {
        const response = await rateCardsApi.update(editingRateCard.id, rateCardData);
        if (response.error) {
          setModalError(response.error);
        } else {
          closeModal();
          fetchRateCards();
          fetchActiveRateCard();
        }
      } else {
        const response = await rateCardsApi.create(rateCardData);
        if (response.error) {
          setModalError(response.error);
        } else {
          closeModal();
          fetchRateCards();
          fetchActiveRateCard();
        }
      }
    } catch (err) {
      setModalError(editingRateCard ? "Failed to update rate card" : "Failed to create rate card");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading rate cards...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Rate Card Management
        </h1>
        <Button size="sm" onClick={handleCreate}>
          Create New Rate Card
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 rounded-lg dark:bg-error-500/10">
          {error}
        </div>
      )}

      {activeRateCard && (
        <div className="mb-6 p-4 rounded-lg border-2 border-brand-500 bg-brand-50 dark:bg-brand-500/10">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
            Active Rate Card
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">First Duration:</span>
              <p className="font-medium">{activeRateCard.first_duration_minutes} minutes</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">First Amount:</span>
              <p className="font-medium">Rs. {activeRateCard.first_amount}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Subsequent Duration:</span>
              <p className="font-medium">{activeRateCard.subsequent_duration_minutes} minutes</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Subsequent Amount:</span>
              <p className="font-medium">Rs. {activeRateCard.subsequent_amount}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Refundable Deposit:</span>
              <p className="font-medium">Rs. {activeRateCard.refundable_deposit}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  First Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  First Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Subsequent Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Subsequent Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Refundable Deposit
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
              {rateCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No rate cards found
                  </td>
                </tr>
              ) : (
                rateCards.map((rateCard) => (
                  <tr key={rateCard.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white/90">
                      {rateCard.first_duration_minutes} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      Rs. {rateCard.first_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {rateCard.subsequent_duration_minutes} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      Rs. {rateCard.subsequent_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      Rs. {rateCard.refundable_deposit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          rateCard.is_active
                            ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {rateCard.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(rateCard)}
                        className="text-brand-500 hover:text-brand-600"
                      >
                        Edit
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
        className="max-w-[700px] p-5 lg:p-10"
      >
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          {editingRateCard ? "Edit Rate Card" : "Create New Rate Card"}
        </h4>

        {modalError && (
          <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 rounded-lg dark:bg-error-500/10">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                First Duration (minutes) <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                value={formData.first_duration_minutes}
                onChange={(e) => setFormData({ ...formData, first_duration_minutes: e.target.value })}
                placeholder="e.g., 15"
                required
              />
            </div>
            <div>
              <Label>
                First Amount (Rs.) <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                step={0.01}
                value={formData.first_amount}
                onChange={(e) => setFormData({ ...formData, first_amount: e.target.value })}
                placeholder="e.g., 100"
                required
              />
            </div>
            <div>
              <Label>
                Subsequent Duration (minutes) <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                value={formData.subsequent_duration_minutes}
                onChange={(e) => setFormData({ ...formData, subsequent_duration_minutes: e.target.value })}
                placeholder="e.g., 30"
                required
              />
            </div>
            <div>
              <Label>
                Subsequent Amount (Rs.) <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                step={0.01}
                value={formData.subsequent_amount}
                onChange={(e) => setFormData({ ...formData, subsequent_amount: e.target.value })}
                placeholder="e.g., 20"
                required
              />
            </div>
            <div>
              <Label>
                Refundable Deposit (Rs.) <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                step={0.01}
                value={formData.refundable_deposit}
                onChange={(e) => setFormData({ ...formData, refundable_deposit: e.target.value })}
                placeholder="e.g., 500"
                required
              />
            </div>
            {editingRateCard && (
              <div>
                <Label>Is Active</Label>
                <select
                  className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  value={formData.is_active ? "true" : "false"}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end w-full gap-3 mt-8">
            <Button size="sm" variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={submitting}>
              {submitting
                ? editingRateCard
                  ? "Updating..."
                  : "Creating..."
                : editingRateCard
                ? "Update Rate Card"
                : "Create Rate Card"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
