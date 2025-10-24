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
            Add New WebSocket
          </h3>
        </div>

        <div className="p-6">
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
                placeholder="My WebSocket"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                WebSocket URL
              </label>
              <input
                type="url"
                value={serviceUrl}
                onChange={(e) => setServiceUrl(e.target.value)}
                placeholder="wss://example.com/socket"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-gray-800 focus:outline-none focus:border-white transition text-white placeholder-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Price per Minute (USD)
              </label>
              <input
                type="number"
                value={pricePerMinute}
                onChange={(e) => setPricePerMinute(Number(e.target.value))}
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
            {loading ? "Adding..." : "Add WebSocket"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddWssModal;
