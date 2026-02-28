"use client";

import React, { useEffect, useState } from "react";
import { commissionsApi, storesApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";

interface Commission {
  id: number;
  store_id: number;
  commission_percentage: number;
  store_share: number;
  company_share: number;
  store?: {
    id: number;
    name: string;
    address: string;
  };
}

interface Store {
  id: number;
  name: string;
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [formData, setFormData] = useState({
    store_id: "",
    commission_percentage: "",
    store_share: "",
    company_share: "",
  });

  useEffect(() => {
    fetchCommissions();
    fetchStores();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const response = await commissionsApi.getAll();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const apiResponse = response.data as { data?: Commission[] };
        const commissionsData = apiResponse.data || [];
        setCommissions(commissionsData);
      }
    } catch {
      setError("Failed to fetch commissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await storesApi.getAll();
      if (response.data) {
        const apiResponse = response.data as { data?: Store[] };
        const storesData = apiResponse.data || [];
        setStores(storesData);
      }
    } catch {
      console.error("Failed to fetch stores");
    }
  };

  const handleCreate = () => {
    setEditingCommission(null);
    setFormData({
      store_id: "",
      commission_percentage: "",
      store_share: "",
      company_share: "",
    });
    setModalError("");
    openModal();
  };

  const handleEdit = (commission: Commission) => {
    setEditingCommission(commission);
    setFormData({
      store_id: commission.store_id.toString(),
      commission_percentage: commission.commission_percentage.toString(),
      store_share: commission.store_share.toString(),
      company_share: commission.company_share.toString(),
    });
    setModalError("");
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    // Validate that store_share + company_share = 100
    const storeShare = parseFloat(formData.store_share);
    const companyShare = parseFloat(formData.company_share);
    if (Math.abs(storeShare + companyShare - 100) > 0.01) {
      setModalError("Store share and company share must add up to 100%");
      return;
    }

    setSubmitting(true);

    try {
      const commissionData = {
        store_id: parseInt(formData.store_id),
        commission_percentage: parseFloat(formData.commission_percentage),
        store_share: storeShare,
        company_share: companyShare,
      };

      if (editingCommission) {
        const response = await commissionsApi.update(editingCommission.id, commissionData);
        if (response.error) {
          setModalError(response.error);
        } else {
          closeModal();
          fetchCommissions();
        }
      } else {
        const response = await commissionsApi.create(commissionData);
        if (response.error) {
          setModalError(response.error);
        } else {
          closeModal();
          fetchCommissions();
        }
      }
    } catch {
      setModalError(editingCommission ? "Failed to update commission" : "Failed to create commission");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading commissions...</div>;
  }

  const availableStores = stores.filter(
    (store) => !commissions.some((c) => c.store_id === store.id) || (editingCommission && editingCommission.store_id === store.id)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Commission Management
        </h1>
        <Button size="sm" onClick={handleCreate}>
          Add Commission
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
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Commission %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Store Share
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Company Share
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No commissions found
                  </td>
                </tr>
              ) : (
                commissions.map((commission) => (
                  <tr key={commission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white/90">
                      {commission.store?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {commission.commission_percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {commission.store_share}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {commission.company_share}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(commission)}
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
        className="max-w-[600px] p-5 lg:p-10"
      >
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          {editingCommission ? "Edit Commission" : "Create Commission Rule"}
        </h4>

        {modalError && (
          <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 rounded-lg dark:bg-error-500/10">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>
              Store <span className="text-error-500">*</span>
            </Label>
            <Select
              options={availableStores.map((store) => ({
                value: store.id.toString(),
                label: store.name,
              }))}
              defaultValue={formData.store_id}
              onChange={(value) => setFormData({ ...formData, store_id: value })}
              placeholder="Select a store"
            />
          </div>
          <div>
            <Label>
              Commission Percentage <span className="text-error-500">*</span>
            </Label>
            <Input
              type="number"
              step={0.01}
              value={formData.commission_percentage}
              onChange={(e) => setFormData({ ...formData, commission_percentage: e.target.value })}
              placeholder="e.g., 60"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                Store Share (%) <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                step={0.01}
                value={formData.store_share}
                onChange={(e) => setFormData({ ...formData, store_share: e.target.value })}
                placeholder="e.g., 60"
                required
              />
            </div>
            <div>
              <Label>
                Company Share (%) <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                step={0.01}
                value={formData.company_share}
                onChange={(e) => setFormData({ ...formData, company_share: e.target.value })}
                placeholder="e.g., 40"
                required
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Store share and company share must add up to 100%
          </p>

          <div className="flex items-center justify-end w-full gap-3 mt-8">
            <Button size="sm" variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={submitting}>
              {submitting
                ? editingCommission
                  ? "Updating..."
                  : "Creating..."
                : editingCommission
                ? "Update Commission"
                : "Create Commission"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
