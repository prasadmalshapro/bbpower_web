"use client";

import React, { useEffect, useState } from "react";
import { storesApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";

interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  provider_store_id?: string;
  status: string;
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    provider_store_id: "",
    status: "active",
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await storesApi.getAll();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const apiResponse = response.data as { data?: Store[] };
        const storesData = apiResponse.data || [];
        setStores(storesData);
      }
    } catch {
      setError("Failed to fetch stores");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingStore(null);
    setFormData({
      name: "",
      address: "",
      city: "",
      latitude: "",
      longitude: "",
      provider_store_id: "",
      status: "active",
    });
    setModalError("");
    openModal();
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      address: store.address,
      city: store.city,
      latitude: store.latitude.toString(),
      longitude: store.longitude.toString(),
      provider_store_id: store.provider_store_id || "",
      status: store.status,
    });
    setModalError("");
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setSubmitting(true);

    try {
      const storeData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        provider_store_id: formData.provider_store_id || undefined,
        status: formData.status,
      };

      if (editingStore) {
        const response = await storesApi.update(editingStore.id, storeData);
        if (response.error) {
          setModalError(response.error);
        } else {
          closeModal();
          fetchStores();
        }
      } else {
        const response = await storesApi.create(storeData);
        if (response.error) {
          setModalError(response.error);
        } else {
          closeModal();
          fetchStores();
        }
      }
    } catch (err) {
      setModalError(editingStore ? "Failed to update store" : "Failed to create store");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this store?")) return;

    try {
      const response = await storesApi.delete(id);
      if (response.error) {
        alert(response.error);
      } else {
        fetchStores();
      }
    } catch {
      alert("Failed to delete store");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading stores...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Stores Management
        </h1>
        <Button size="sm" onClick={handleCreate}>
          Add New Store
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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  City
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
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No stores found
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white/90">
                      {store.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {store.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {store.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          store.status === "active"
                            ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {store.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(store)}
                        className="text-brand-500 hover:text-brand-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(store.id)}
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
        className="max-w-[700px] p-5 lg:p-10"
      >
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          {editingStore ? "Edit Store" : "Create New Store"}
        </h4>

        {modalError && (
          <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 rounded-lg dark:bg-error-500/10">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>
              Store Name <span className="text-error-500">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter store name"
              required
            />
          </div>

          <div>
            <Label>
              Address <span className="text-error-500">*</span>
            </Label>
            <TextArea
              value={formData.address}
              onChange={(value) => setFormData({ ...formData, address: value })}
              placeholder="Enter full address"
            />
          </div>

          <div>
            <Label>
              City <span className="text-error-500">*</span>
            </Label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Enter city"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                Latitude <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="e.g., 6.9271"
                required
              />
            </div>
            <div>
              <Label>
                Longitude <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="e.g., 79.8612"
                required
              />
            </div>
          </div>

          <div>
            <Label>Provider Store ID (Optional)</Label>
            <Input
              value={formData.provider_store_id}
              onChange={(e) => setFormData({ ...formData, provider_store_id: e.target.value })}
              placeholder="Enter provider store ID if applicable"
            />
          </div>

          <div>
            <Label>
              Status <span className="text-error-500">*</span>
            </Label>
            <select
              className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-end w-full gap-3 mt-8">
            <Button size="sm" variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={submitting}>
              {submitting
                ? editingStore
                  ? "Updating..."
                  : "Creating..."
                : editingStore
                ? "Update Store"
                : "Create Store"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
