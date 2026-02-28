"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { storeUsersApi, storesApi, usersApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { useModal } from "@/hooks/useModal";

export default function UserStoresPage() {
  const params = useParams();
  const router = useRouter();
  const userId = parseInt(params.id as string);
  const [user, setUser] = useState<any>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [userStores, setUserStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [storeRole, setStoreRole] = useState("manager");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, storesRes, userStoresRes] = await Promise.all([
        usersApi.getById(userId),
        storesApi.getAll(),
        storeUsersApi.getStoresByUser(userId),
      ]);

      if (userRes.data) {
        const userData = userRes.data as { data?: any };
        setUser(userData.data);
      }

      if (storesRes.data) {
        const storesData = storesRes.data as { data?: any[] };
        setStores(storesData.data || []);
      }

      if (userStoresRes.data) {
        const userStoresData = userStoresRes.data as { data?: any[] };
        setUserStores(userStoresData.data || []);
      }
    } catch (err: any) {
      setError("Failed to fetch data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStore = () => {
    setSelectedStoreId("");
    setStoreRole("manager");
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await storeUsersApi.mapUserToStore({
        user_id: userId,
        store_id: parseInt(selectedStoreId),
        role: storeRole,
      });

      if (response.error) {
        alert(response.error);
      } else {
        closeModal();
        fetchData();
      }
    } catch (err: any) {
      alert("Failed to map user to store: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStore = async (storeId: number) => {
    if (!confirm("Are you sure you want to remove this store mapping?")) {
      return;
    }

    try {
      const response = await storeUsersApi.removeUserFromStore(userId, storeId);
      if (response.error) {
        alert(response.error);
      } else {
        fetchData();
      }
    } catch (err: any) {
      alert("Failed to remove store mapping: " + err.message);
    }
  };

  // Get stores not yet mapped to this user
  const availableStores = stores.filter(
    (store) => !userStores.some((us) => us.id === store.id)
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-2"
          >
            ← Back to Users
          </button>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Store Mapping for {user?.username}
          </h1>
        </div>
        <Button size="sm" onClick={handleAddStore} disabled={availableStores.length === 0}>
          Add Store
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 rounded-lg dark:bg-error-500/10">
          {error}
        </div>
      )}

      {userStores.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No stores mapped to this user
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Store Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {userStores.map((store) => (
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
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                        {store.user_role || store.role || "manager"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleRemoveStore(store.id)}
                        className="text-error-500 hover:text-error-600"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[584px] p-5 lg:p-10">
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          Map User to Store
        </h4>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>
              Store <span className="text-error-500">*</span>
            </Label>
            <Select
              options={availableStores.map((store) => ({
                value: store.id.toString(),
                label: `${store.name} - ${store.city}`,
              }))}
              value={selectedStoreId}
              onChange={(value) => setSelectedStoreId(value)}
              required
            />
          </div>

          <div>
            <Label>
              Role <span className="text-error-500">*</span>
            </Label>
            <Select
              options={[
                { value: "manager", label: "Manager" },
                { value: "staff", label: "Staff" },
                { value: "owner", label: "Owner" },
              ]}
              value={storeRole}
              onChange={(value) => setStoreRole(value)}
              required
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Mapping..." : "Map Store"}
            </Button>
            <Button size="sm" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

