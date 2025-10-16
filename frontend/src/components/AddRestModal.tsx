import React, { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  publicKey: string;
  refreshData: () => void;
}

const AddRestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  publicKey,
  refreshData,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [serviceUrl, setServiceUrl] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim to prevent empty strings
    if (
      !name.trim() ||
      !description.trim() ||
      !serviceUrl.trim() ||
      price <= 0
    ) {
      return setError(
        "All fields are required and price must be greater than 0"
      );
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/addRest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          name: name.trim(),
          description: description.trim(),
          serviceUrl: serviceUrl.trim(),
          pricePerRequest: price,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to add API");

      refreshData();
      onClose();

      // Reset form
      setName("");
      setDescription("");
      setServiceUrl("");
      setPrice(0);
    } catch (err: any) {
      setError(err.message || "Error adding API");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 text-white rounded-xl shadow-xl w-full max-w-md p-6"
      >
        <h3 className="text-xl font-semibold mb-4">Add New REST API</h3>

        {error && <p className="text-red-400 mb-2">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/20"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/20"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Service URL</label>
            <input
              type="url"
              value={serviceUrl}
              onChange={(e) => setServiceUrl(e.target.value)}
              placeholder="https://example.com/api"
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/20"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Price per request (USD)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min={0.01}
              step={0.01}
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/20"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition"
            >
              {loading ? "Adding..." : "Add API"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddRestModal;
