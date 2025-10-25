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
  const [method, setMethod] = useState("GET");
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
          method,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Server returned invalid JSON");
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add API");
      }

      refreshData();
      onClose();

      setName("");
      setDescription("");
      setServiceUrl("");
      setMethod("GET");
      setPrice(0);
    } catch (err: any) {
      console.error("Add API Error:", err);
      setError(err.message || "Error adding API");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-zinc-900 text-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-800"
      >
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-xl font-semibold tracking-tight">
            Add New REST API
          </h3>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-gray-800 focus:outline-none focus:border-white transition text-white placeholder-gray-600"
                placeholder="My API"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-gray-800 focus:outline-none focus:border-white transition text-white placeholder-gray-600 resize-none"
                placeholder="What does this API do?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Service URL
              </label>
              <input
                type="url"
                value={serviceUrl}
                onChange={(e) => setServiceUrl(e.target.value)}
                placeholder="https://example.com/api"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-gray-800 focus:outline-none focus:border-white transition text-white placeholder-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                HTTP Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-gray-800 focus:outline-none focus:border-white transition text-white appearance-none cursor-pointer"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Price per Request (USD)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0.01}
                step={0.01}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-gray-800 focus:outline-none focus:border-white transition text-white placeholder-gray-600"
                placeholder="0.01"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-200 text-black transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add API"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddRestModal;
