import React from "react";
import { useAccount } from "wagmi";
import ConnectButton from "../components/ConnectButton";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const Home: React.FC = () => {
  const { address, isConnected } = useAccount();

  const restApis = [
    { name: "User Auth API", endpoint: "/v1/auth" },
    { name: "Payments API", endpoint: "/v1/payments" },
    { name: "Analytics API", endpoint: "/v1/analytics" },
    { name: "User Auth API", endpoint: "/v1/auth" },
    { name: "Payments API", endpoint: "/v1/payments" },
  ];

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
            className="w-full max-w-5xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-3xl font-bold mb-2">Welcome 👋</h2>
            <p className="text-gray-300 mb-8 font-mono">{address}</p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-semibold">REST APIs</h3>
                  <button className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 transition">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                  {restApis.length > 0 ? (
                    <>
                      {restApis.slice(0, 10).map((api, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-white/10 transition"
                        >
                          <div>
                            <p className="font-semibold">{api.name}</p>
                            <p className="text-sm text-gray-300 font-mono">
                              {api.endpoint}
                            </p>
                          </div>
                          <button className="text-indigo-400 hover:text-indigo-300 text-sm">
                            View
                          </button>
                        </div>
                      ))}

                      <button className="mt-3 w-full text-indigo-400 hover:text-indigo-300 text-sm">
                        View All
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-400 text-sm text-center">
                      No REST APIs added yet.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-semibold">WebSocket APIs</h3>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center text-gray-400">
                  <p className="text-lg font-medium mb-2">Coming Soon 🚧</p>
                  <p className="text-sm">
                    WebSocket monetization support is on the way!
                  </p>
                </div>
              </div>
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
