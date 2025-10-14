// src/pages/Home.tsx
import React from "react";
import { useAccount } from "wagmi";
import ConnectButton from "../components/ConnectButton"; // your AppKit connect button
import { motion } from "framer-motion";

const Home: React.FC = () => {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10 backdrop-blur-md bg-white/5">
        <h1 className="text-2xl font-bold tracking-tight">xGate</h1>
        <div>
          <ConnectButton />
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        {!isConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl"
          >
            <h2 className="text-5xl sm:text-6xl font-extrabold mb-6 drop-shadow-lg">
              Monetize Your APIs Effortlessly
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
              Turn your public APIs into revenue streams using{" "}
              <span className="font-semibold text-indigo-300">x402</span>.
              Connect your wallet, register your endpoints, and start earning
              instantly.
            </p>

            <div className="mt-6 flex justify-center">
              <ConnectButton />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 max-w-xl w-full text-left"
          >
            <h2 className="text-3xl font-bold mb-4">Welcome Back 👋</h2>
            <p className="text-gray-300 mb-6">
              Wallet connected:{" "}
              <span className="font-mono text-indigo-300">{address}</span>
            </p>

            <div className="space-y-3">
              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold">
                Register New API
              </button>
              <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">
                View API Analytics
              </button>
              <button className="w-full py-3 bg-slate-700 hover:bg-slate-800 rounded-lg font-semibold">
                Withdraw Earnings
              </button>
            </div>
          </motion.div>
        )}
      </main>
      <footer className="text-center text-gray-400 text-sm py-6 border-t border-white/10">
        © {new Date().getFullYear()} xGate — Built on x402
      </footer>
    </div>
  );
};

export default Home;
