import React, { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  publicKey: string;
  refreshData: () => void;
}

const AddWssModal: React.FC<Props> = ({
  isOpen,
  onClose,
  publicKey,
  refreshData,
}) => {
  const [name, setName] = useState("");
  const [serviceUrl, setServiceUrl] = useState(""); 
  const [pricePerMinute, setPricePerMinute] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !serviceUrl.trim() || pricePerMinute <= 0) {
      return setError(
        "Name, WebSocket URL, and price per minute are required and must be > 0"
      );
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/addWss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          name: name.trim(),
          serviceUrl: serviceUrl.trim(),
          pricePerMinute,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to add WSS");

      
      refreshData();
      onClose();

      
      setName("");
      setServiceUrl("");
      setPricePerMinute(0);
    } catch (err: any) {
      setError(err.message || "Error adding WebSocket");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 text-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-white/10"
      >
        <h3 className="text-2xl font-semibold mb-5">Add New WebSocket</h3>

        {error && (
          <p className="text-red-400 bg-red-500/10 p-2 rounded mb-3 text-sm">
            {error}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/20 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">WebSocket URL</label>
            <input
              type="url"
              value={serviceUrl}
              onChange={(e) => setServiceUrl(e.target.value)}
              placeholder="wss://example.com/socket"
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/20 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Price per minute (USD)</label>
            <input
              type="number"
              value={pricePerMinute}
              onChange={(e) => setPricePerMinute(Number(e.target.value))}
              min={0.01}
              step={0.01}
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/20 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
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
              {loading ? "Adding..." : "Add WebSocket"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddWssModal;
