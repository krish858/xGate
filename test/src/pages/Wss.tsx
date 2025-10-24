import React, { useEffect, useState, useRef } from "react";
import { useWalletClient } from "wagmi";
import { exact } from "x402/schemes";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const TEST_WSS_ID = "Cx-e4Mm98b";
const SERVER_URL = "ws://localhost:3000";
const HTTP_SERVER_URL = "http://localhost:3000";

const WssTester: React.FC = () => {
  const { data: walletClient } = useWalletClient();
  const [messages, setMessages] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectToWss = async () => {
    if (!walletClient) {
      alert("Connect wallet first!");
      return;
    }

    try {
      const resource = `${SERVER_URL}/wss/${TEST_WSS_ID}`;

      console.log("walletClient:", walletClient);
      console.log("walletClient.account:", walletClient.account);
      console.log(
        "walletClient.account.address:",
        walletClient.account?.address
      );

      setMessages((m) => [
        ...m,
        `🔐 Creating payment...`,
        `📍 Wallet address: ${walletClient.account?.address || "undefined"}`,
      ]);

      if (!walletClient.account?.address) {
        throw new Error("Wallet account address is undefined");
      }

      console.log("🔵 NEW CODE VERSION - Using hardcoded USDC values");

      setMessages((m) => [...m, "🔍 Fetching WebSocket info..."]);
      const infoResponse = await fetch(
        `${HTTP_SERVER_URL}/api/wss-info/${TEST_WSS_ID}`
      );
      if (!infoResponse.ok) {
        throw new Error("Failed to fetch WebSocket info");
      }
      const wssInfo = await infoResponse.json();
      console.log("WebSocket info:", wssInfo);

      setMessages((m) => [
        ...m,
        `💰 Price: $${wssInfo.pricePerMinute}/min`,
        `👤 Owner: ${wssInfo.ownerAddress}`,
      ]);

      const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

      const usdcAmount = (wssInfo.pricePerMinute * 1_000_000).toString();

      const paymentRequirements = {
        scheme: "exact" as const,
        network: "base-sepolia" as const,
        maxAmountRequired: usdcAmount,
        resource,
        description: "xGate WebSocket Subscription",
        mimeType: "",
        maxTimeoutSeconds: 60,
        asset: USDC_BASE_SEPOLIA,
        //@ts-ignore
        payTo: wssInfo.ownerAddress,
        outputSchema: undefined,
        extra: {
          name: "USDC",
          version: "2",
        },
      };

      console.log("Payment requirements:", paymentRequirements);

      const payment = await exact.evm.createPayment(
        walletClient as any,
        1,
        paymentRequirements
      );

      console.log("Payment created:", JSON.stringify(payment, null, 2));

      console.log("Payment payload:", payment.payload);

      console.log(
        "Payment payload authorization:", //@ts-ignore
        payment.payload?.authorization
      );

      const paymentHeader = exact.evm.encodePayment(payment);
      console.log("Payment header (encoded):", paymentHeader);

      const encodedPayment = encodeURIComponent(paymentHeader);
      const wsUrl = `${SERVER_URL}/wss/${TEST_WSS_ID}?payment=${encodedPayment}`;

      console.log("Connecting to:", wsUrl);
      setMessages((m) => [...m, "🔌 Connecting to WebSocket..."]);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket opened");
        setMessages((m) => [...m, "✅ Connected to monetized WSS"]);
        ws.send("Hello WebSocket!");
      };

      ws.onmessage = async (event) => {
        try {
          if (event.data instanceof Blob) {
            const text = await event.data.text();
            setMessages((m) => [...m, `📦 Binary: ${text}`]);
            return;
          }

          const data = JSON.parse(event.data);
          if (data.type === "payment-settled") {
            setMessages((m) => [...m, `💰 Payment settled successfully`]);
          } else if (data.message) {
            setMessages((m) => [...m, `📩 ${data.message}`]);
          } else if (data.error) {
            setMessages((m) => [...m, `❌ ${data.error}`]);
          } else if (data.warning) {
            setMessages((m) => [...m, `⚠️ ${data.warning}`]);
          } else {
            setMessages((m) => [...m, `📩 ${JSON.stringify(data)}`]);
          }
        } catch {
          setMessages((m) => [...m, `📩 ${event.data}`]);
        }
      };

      ws.onerror = () => {
        setMessages((m) => [...m, `❌ WebSocket error occurred`]);
      };

      ws.onclose = (event) => {
        setMessages((m) => [
          ...m,
          `🔴 Connection closed (code ${event.code}${
            event.reason ? `: ${event.reason}` : ""
          })`,
        ]);
      };
    } catch (err: any) {
      console.error("Connection error:", err);
      setMessages((m) => [...m, `❌ Error: ${err.message}`]);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setMessages((m) => [...m, "🔌 Disconnected by user"]);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">xGate WSS Subscription Demo</h1>
        <ConnectButton />
      </div>

      <div className="flex gap-4">
        <button
          onClick={connectToWss}
          disabled={wsRef.current !== null}
          className="px-6 py-3 border border-neutral-700 rounded-lg hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect to WSS
        </button>
        <button
          onClick={disconnect}
          disabled={wsRef.current === null}
          className="px-6 py-3 border border-red-700 rounded-lg hover:bg-red-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Disconnect
        </button>
      </div>

      <div className="mt-6 bg-neutral-800 p-4 rounded-lg border border-neutral-700 font-mono text-sm h-96 overflow-auto">
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
    </div>
  );
};

export default WssTester;
