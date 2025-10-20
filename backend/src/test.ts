// Ai-generated test;

import axios from "axios";
import { config } from "dotenv";
import {
  withPaymentInterceptor,
  decodeXPaymentResponse,
  createSigner,
  type Hex,
} from "x402-axios";

config();

// ⚙️ Load environment variables
const privateKey = process.env.PRIVATE_KEY as Hex;
const baseURL = process.env.RESOURCE_SERVER_URL as string; // e.g. http://localhost:3000
const endpointPath = process.env.ENDPOINT_PATH as string; // e.g. /api/x402/uPkxPRglTS

if (!privateKey || !baseURL || !endpointPath) {
  console.error(
    "❌ Missing required env vars: PRIVATE_KEY, RESOURCE_SERVER_URL, ENDPOINT_PATH"
  );
  process.exit(1);
}

async function main(): Promise<void> {
  try {
    // 🪪 Create signer for Base Sepolia (matches backend)
    const signer = await createSigner("base-sepolia", privateKey);

    // 💰 Wrap axios with X402 interceptor
    const api = withPaymentInterceptor(
      axios.create({
        baseURL,
        timeout: 15000,
      }),
      signer
    );

    console.log("🚀 Sending paid request to:", `${baseURL}${endpointPath}`);

    // 🌐 Make a GET request (change to POST if your API expects it)
    const response = await api.get(endpointPath, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Response Data:", response.data);

    // 🧾 Decode X-PAYMENT-RESPONSE
    const paymentHeader = response.headers["x-payment-response"];
    if (paymentHeader) {
      const paymentResponse = decodeXPaymentResponse(paymentHeader);
      console.log("💸 Payment Settlement Info:", paymentResponse);
    } else {
      console.warn("⚠️ No X-PAYMENT-RESPONSE header found.");
    }
  } catch (err: any) {
    console.error("❌ Request failed:", err.response?.data || err.message);
  }
}

main();
