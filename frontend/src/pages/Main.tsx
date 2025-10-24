import React, { useState } from "react";
import { useAccount } from "wagmi";
import ConnectButton from "../components/ConnectButton";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useUserData } from "../hooks/userData";
import AddRestModal from "../components/AddRestModal";
import AddWssModal from "../components/AddWssModal";

const Home: React.FC = () => {
  const { address, isConnected } = useAccount();
  //@ts-ignore
  const { userData, loading, refetch } = useUserData(address || "0x0");

  const restApis = userData?.restEndpoints || [];
  const webSockets = userData?.webSockets || [];

  const [isRestModalOpen, setIsRestModalOpen] = useState(false);
  const [isWssModalOpen, setIsWssModalOpen] = useState(false);

  const refreshUserData = () => {
    if (refetch) refetch();
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <h1 className="text-xl font-semibold tracking-tight">xGate</h1>
        <div>
          <ConnectButton />
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        {!isConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl"
          >
            <h2 className="text-5xl sm:text-6xl font-semibold mb-6 tracking-tight leading-tight">
              Monetize Your Backend Effortlessly
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed font-normal">
              Turn your public APIs and WebSockets into revenue streams using
              x402. Connect your wallet, register your endpoints, and start
              earning instantly.
            </p>

            <div className="mt-8 flex justify-center">
              <ConnectButton />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-6xl"
          >
            <div className="mb-12">
              <h2 className="text-3xl font-semibold mb-3 tracking-tight">
                Welcome
              </h2>
              <p className="text-sm text-gray-500 font-mono">{address}</p>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <p className="text-gray-600">Loading your endpoints...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold tracking-tight">
                      REST APIs
                    </h3>
                    <button
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-200 transition flex items-center justify-center cursor-pointer"
                      onClick={() => setIsRestModalOpen(true)}
                      aria-label="Add REST API"
                    >
                      <Plus className="w-4 h-4 text-black" />
                    </button>
                  </div>

                  <div className="bg-zinc-900 border border-gray-800 rounded-2xl p-5 min-h-[300px]">
                    {restApis.length > 0 ? (
                      <>
                        <div className="space-y-3">
                          {restApis.slice(0, 5).map((api, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-start py-3 px-4 rounded-xl hover:bg-zinc-800 transition border border-transparent hover:border-gray-700"
                            >
                              <div className="flex-1 min-w-0 mr-4">
                                <p className="font-medium text-sm mb-1">
                                  {api.name}
                                </p>
                                <p className="text-xs text-gray-500 font-mono truncate">
                                  {api.generatedEndpoint}
                                </p>
                              </div>
                              <p className="text-sm font-medium whitespace-nowrap">
                                ${api.amountGenerated.toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 pt-4 border-t border-gray-800">
                          <button className="w-full py-2.5 bg-white hover:bg-gray-200 text-black rounded-xl text-sm font-medium transition cursor-pointer">
                            View All
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-600 text-sm">
                          No REST APIs added yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold tracking-tight">
                      WebSocket APIs
                    </h3>
                    <button
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-200 transition flex items-center justify-center cursor-pointer"
                      onClick={() => setIsWssModalOpen(true)}
                      aria-label="Add WebSocket API"
                    >
                      <Plus className="w-4 h-4 text-black" />
                    </button>
                  </div>

                  <div className="bg-zinc-900 border border-gray-800 rounded-2xl p-5 min-h-[300px]">
                    {webSockets.length > 0 ? (
                      <>
                        <div className="space-y-3">
                          {webSockets.slice(0, 5).map((wss, i) => {
                            const serverUrl =
                              import.meta.env.VITE_API_URL?.replace(
                                /^http/,
                                "ws"
                              ) || "wss://yourserver.com";
                            const fullUrl = `${serverUrl}/${wss.generatedId}`;

                            return (
                              <div
                                key={i}
                                className="flex justify-between items-start py-3 px-4 rounded-xl hover:bg-zinc-800 transition border border-transparent hover:border-gray-700"
                              >
                                <div className="flex-1 min-w-0 mr-4">
                                  <p className="font-medium text-sm mb-1">
                                    {wss.name}
                                  </p>
                                  <p className="text-xs text-gray-500 font-mono truncate">
                                    {fullUrl}
                                  </p>
                                </div>
                                <p className="text-sm font-medium whitespace-nowrap">
                                  ${wss.amountGenerated?.toFixed(2) || "0.00"}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-5 pt-4 border-t border-gray-800">
                          <button className="w-full py-2.5 bg-white hover:bg-gray-200 text-black rounded-xl text-sm font-medium transition cursor-pointer">
                            View All
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-600 text-sm">
                          No WebSocket APIs added yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <footer className="text-center text-gray-600 text-xs py-8 border-t border-gray-800">
        © {new Date().getFullYear()} xGate — Built on x402
      </footer>

      {address && (
        <>
          <AddRestModal
            isOpen={isRestModalOpen}
            onClose={() => setIsRestModalOpen(false)}
            publicKey={address}
            refreshData={refreshUserData}
          />
          <AddWssModal
            isOpen={isWssModalOpen}
            onClose={() => setIsWssModalOpen(false)}
            publicKey={address}
            refreshData={refreshUserData}
          />
        </>
      )}
    </div>
  );
};

export default Home;
