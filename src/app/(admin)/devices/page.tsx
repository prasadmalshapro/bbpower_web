"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { devicesApi, storesApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";

interface Device {
  id: number;
  store_id: number;
  device_name: string;
  device_code: string;
  device_token?: string | null;
  number_of_power_banks: number;
  status: string;
  store?: {
    id: number;
    name: string;
  };
}

interface Store {
  id: number;
  name: string;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState({
    store_id: "",
    device_name: "",
    device_code: "",
    device_token: "",
    number_of_power_banks: "0",
    status: "active",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [storeFilter, setStoreFilter] = useState("");

  const fetchDevices = useCallback(async (params?: { search?: string; store_id?: number }) => {
    try {
      setLoading(true);
      setError("");
      const response = await devicesApi.getAll(params);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const apiResponse = response.data as { data?: Device[] };
        const devicesData = apiResponse.data || [];
        setDevices(devicesData);
      }
    } catch {
      setError("Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    fetchDevices({});
  }, [fetchDevices]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    fetchDevices({
      search: searchQuery.trim() || undefined,
      store_id: storeFilter ? Number(storeFilter) : undefined,
    });
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
    setEditingDevice(null);
    setFormData({
      store_id: "",
      device_name: "",
      device_code: "",
      device_token: "",
      number_of_power_banks: "0",
      status: "active",
    });
    setModalError("");
    openModal();
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setFormData({
      store_id: device.store_id.toString(),
      device_name: device.device_name,
      device_code: device.device_code,
      device_token: device.device_token ?? "",
      number_of_power_banks: String(device.number_of_power_banks ?? 0),
      status: device.status,
    });
    setModalError("");
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setSubmitting(true);

    try {
      const deviceData = {
        store_id: parseInt(formData.store_id),
        device_name: formData.device_name,
        device_code: formData.device_code,
        ...(formData.device_token.trim() ? { device_token: formData.device_token.trim() } : {}),
        number_of_power_banks: parseInt(formData.number_of_power_banks, 10) || 0,
        status: formData.status,
      };

      if (editingDevice) {
        const response = await devicesApi.update(editingDevice.id, deviceData);
        if (response.error) {
          setModalError(response.error);
        } else {
          closeModal();
          fetchDevices();
        }
      } else {
        const response = await devicesApi.create(deviceData);
        if (response.error) {
          setModalError(response.error);
        } else {
          closeModal();
          fetchDevices();
        }
      }
    } catch (err) {
      setModalError(editingDevice ? "Failed to update device" : "Failed to create device");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this device?")) return;

    try {
      const response = await devicesApi.delete(id);
      if (response.error) {
        alert(response.error);
      } else {
        fetchDevices();
      }
    } catch {
      alert("Failed to delete device");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading devices...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Devices Management
        </h1>
        <Button size="sm" onClick={handleCreate}>
          Add New Device
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 rounded-lg dark:bg-error-500/10">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSearch}
        className="mb-4 flex flex-wrap items-center gap-3"
      >
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by device code or store..."
            className="w-full"
          />
        </div>
        <div className="w-[200px]">
          <Select
            options={[
              { value: "", label: "All stores" },
              ...stores.map((s) => ({ value: String(s.id), label: s.name })),
            ]}
            value={storeFilter}
            onChange={(value) => setStoreFilter(value)}
            placeholder="Filter by store"
          />
        </div>
        <Button size="sm" type="submit">
          Search
        </Button>
        {(searchQuery.trim() || storeFilter) && (
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStoreFilter("");
              fetchDevices({});
            }}
          >
            Clear
          </Button>
        )}
      </form>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Device Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Device Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Power Banks
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
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No devices found
                  </td>
                </tr>
              ) : (
                devices.map((device) => (
                  <tr key={device.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white/90">
                      {device.device_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {device.device_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {device.store?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {device.number_of_power_banks ?? 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          device.status === "active"
                            ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                            : device.status === "maintenance"
                            ? "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {device.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        href={`/devices/manage?id=${encodeURIComponent(device.id)}`}
                        className="text-brand-500 hover:text-brand-600"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            sessionStorage.setItem("deviceManageId", String(device.id));
                            localStorage.setItem("deviceManageId", String(device.id));
                          }
                        }}
                      >
                        Manage
                      </Link>
                      <button
                        onClick={() => handleEdit(device)}
                        className="text-brand-500 hover:text-brand-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(device.id)}
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
          {editingDevice ? "Edit Device" : "Create New Device"}
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
              options={stores.map((store) => ({
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
              Device Name <span className="text-error-500">*</span>
            </Label>
            <Input
              value={formData.device_name}
              onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
              placeholder="Enter device name"
              required
            />
          </div>

          <div>
            <Label>
              Device Code <span className="text-error-500">*</span>
            </Label>
            <Input
              value={formData.device_code}
              onChange={(e) => setFormData({ ...formData, device_code: e.target.value })}
              placeholder="Enter device code"
              required
            />
          </div>

          <div>
            <Label>Device Token (optional)</Label>
            <Input
              value={formData.device_token}
              onChange={(e) => setFormData({ ...formData, device_token: e.target.value })}
              placeholder="Enter device token"
            />
          </div>

          <div>
            <Label>
              Number of Power Banks <span className="text-error-500">*</span>
            </Label>
            <Input
              type="number"
              min={0}
              value={formData.number_of_power_banks}
              onChange={(e) => setFormData({ ...formData, number_of_power_banks: e.target.value })}
              placeholder="0"
              required
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
              <option value="maintenance">Maintenance</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div className="flex items-center justify-end w-full gap-3 mt-8">
            <Button size="sm" variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={submitting}>
              {submitting
                ? editingDevice
                  ? "Updating..."
                  : "Creating..."
                : editingDevice
                ? "Update Device"
                : "Create Device"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
