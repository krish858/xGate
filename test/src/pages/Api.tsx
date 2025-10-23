import { ConnectButton } from "@rainbow-me/rainbowkit";
import axios from "axios";
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { withPaymentInterceptor } from "x402-axios";
import { BASE_URL, ENDPOINT } from "./../../constants";
import { useNavigate } from "react-router";

const Api = () => {
  const { data: walletClient } = useWalletClient();
  const _api = axios.create({ baseURL: BASE_URL });

  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const testPremiumContent = async () => {
    setLoading(true);
    //@ts-ignore
    const api = withPaymentInterceptor(_api, walletClient);
    const res = await api.get(ENDPOINT);
    setResponse(JSON.stringify(res.data, null, 2));
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">
          x402 REST API Premium Content Demo
        </h1>

        <ConnectButton />
      </div>

      <div className="border-t border-neutral-700 mb-12"></div>
      <div
        className="mb-4 cursor-pointer"
        onClick={() => navigate("/")}
      >{`<- Go back `}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Code Snippet Box */}
          <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 flex flex-col gap-6 font-mono text-sm">
            <code className="text-green-400 font-mono text-sm">
              Test premium content x402 integration :
            </code>
            <button
              onClick={testPremiumContent}
              disabled={loading}
              className="px-6 py-3 border cursor-pointer border-neutral-600 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              {loading ? "Loading..." : "Test"}
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 font-mono text-sm">
            <pre className="whitespace-pre-wrap break-all">
              {response ||
                "Response will appear here...\n\nMake sure Metamask is logged in and connected to Base.\n\nMake sure you have USDC on Base."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Api;
