"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { storeChainsApi } from "@/lib/api-client";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";

interface StoreChain {
  id: number;
  name: string;
  head_office_address: string | null;
  contact_no: string | null;
  email: string | null;
  created_at?: string;
  updated_at?: string;
}

export default function StoreChainsPage() {
  const [chains, setChains] = useState<StoreChain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [editingChain, setEditingChain] = useState<StoreChain | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    head_office_address: "",
    contact_no: "",
    email: "",
  });

  useEffect(() => {
    fetchChains();
  }, []);

  const fetchChains = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await storeChainsApi.getAll();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const apiResponse = response.data as { data?: StoreChain[] };
        setChains(apiResponse.data || []);
      }
    } catch {
      setError("Failed to fetch store chains");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingChain(null);
    setFormData({
      name: "",
      head_office_address: "",
      contact_no: "",
      email: "",
    });
    setModalError("");
    openModal();
  };

  const handleEdit = (chain: StoreChain) => {
    setEditingChain(chain);
    setFormData({
      name: chain.name,
      head_office_address: chain.head_office_address || "",
      contact_no: chain.contact_no || "",
      email: chain.email || "",
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
        name: formData.name.trim(),
        head_office_address: formData.head_office_address.trim() || null,
        contact_no: formData.contact_no.trim() || null,
        email: formData.email.trim() || null,
      };
      if (editingChain) {
        const response = await storeChainsApi.update(editingChain.id, payload);
        if (response.error) {
          setModalError(response.error);
        } else {
          closeModal();
          fetchChains();
        }
      } else {
        const response = await storeChainsApi.create(payload);
        if (response.error) {
          setModalError(response.error);
        } else {
          closeModal();
          fetchChains();
        }
      }
    } catch {
      setModalError(editingChain ? "Failed to update chain" : "Failed to create chain");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this store chain? Stores linked to it will have their chain cleared.")) return;
    try {
      const response = await storeChainsApi.delete(id);
      if (response.error) {
        alert(response.error);
      } else {
        fetchChains();
      }
    } catch {
      alert("Failed to delete store chain");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading store chains...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/stores"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Stores
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Store Chains
          </h1>
        </div>
        <Button size="sm" onClick={handleCreate}>
          Create new chain
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
                  Head office address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Contact no
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {chains.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No store chains found. Create one to group stores.
                  </td>
                </tr>
              ) : (
                chains.map((chain) => (
                  <tr key={chain.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white/90">
                      {chain.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {chain.head_office_address || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {chain.contact_no || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {chain.email || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(chain)}
                        className="text-brand-500 hover:text-brand-600"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(chain.id)}
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
          {editingChain ? "Edit store chain" : "Create new store chain"}
        </h4>
        {modalError && (
          <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 rounded-lg dark:bg-error-500/10">
            {modalError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>
              Chain name <span className="text-error-500">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Downtown Mall"
              required
            />
          </div>
          <div>
            <Label>Head office address</Label>
            <TextArea
              value={formData.head_office_address}
              onChange={(value) => setFormData({ ...formData, head_office_address: value })}
              placeholder="Full address of head office"
            />
          </div>
          <div>
            <Label>Contact number</Label>
            <Input
              value={formData.contact_no}
              onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
              placeholder="e.g. +94 11 234 5678"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@chain.com"
            />
          </div>
          <div className="flex items-center justify-end w-full gap-3 mt-8">
            <Button size="sm" variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={submitting}>
              {submitting
                ? editingChain
                  ? "Updating..."
                  : "Creating..."
                : editingChain
                ? "Update chain"
                : "Create chain"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
