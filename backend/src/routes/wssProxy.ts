import { WebSocketServer, WebSocket } from "ws";
import { WebSocketModel, UserModel } from "../models/model";
import { useFacilitator } from "x402/verify";
import { exact } from "x402/schemes";
import {
  processPriceToAtomicAmount,
  findMatchingPaymentRequirements,
} from "x402/shared";
import type {
  PaymentRequirements,
  PaymentPayload,
  Resource,
  Price,
  Network,
} from "x402/types";

const FACILITATOR_URL = "https://x402.org/facilitator";
const { verify, settle } = useFacilitator({ url: FACILITATOR_URL });
const x402Version = 1;

function createExactPaymentRequirements(
  price: Price,
  network: Network,
  resource: Resource,
  description: string,
  address: string
): PaymentRequirements {
  console.log(`[xGate] Creating payment requirements with price:`, price);
  const atomicAmount = processPriceToAtomicAmount(price, network);
  console.log(`[xGate] processPriceToAtomicAmount result:`, atomicAmount);

  if ("error" in atomicAmount) throw new Error(atomicAmount.error);

  return {
    scheme: "exact",
    network,
    maxAmountRequired: atomicAmount.maxAmountRequired,
    resource,
    description,
    mimeType: "",
    payTo: address,
    maxTimeoutSeconds: 60,
    asset: atomicAmount.asset.address,
    outputSchema: undefined,
    extra: {
      //@ts-ignore
      name: atomicAmount.asset.eip712.name,
      //@ts-ignore
      version: atomicAmount.asset.eip712.version,
    },
  };
}

async function verifyPayment(
  client: WebSocket,
  paymentHeader: string,
  paymentRequirements: PaymentRequirements[]
): Promise<boolean> {
  let decodedPayment: PaymentPayload;
  try {
    decodedPayment = exact.evm.decodePayment(paymentHeader);
    decodedPayment.x402Version = x402Version;
    console.log(
      `[xGate] Decoded payment:`,
      JSON.stringify(decodedPayment, null, 2)
    );
  } catch {
    client.send(JSON.stringify({ error: "Invalid payment format" }));
    client.close(4003, "Invalid payment");
    return false;
  }

  try {
    const matchedReq =
      findMatchingPaymentRequirements(paymentRequirements, decodedPayment) ||
      paymentRequirements[0];
    console.log(
      `[xGate] Matched requirements:`,
      JSON.stringify(matchedReq, null, 2)
    );
    // @ts-ignore
    const response = await verify(decodedPayment, matchedReq);
    console.log(`[xGate] Verification response:`, response);
    if (!response.isValid) {
      client.send(
        JSON.stringify({
          error: response.invalidReason,
          payer: response.payer,
        })
      );
      client.close(4006, "Payment invalid");
      return false;
    }
  } catch (err) {
    console.error(`[xGate] Verification error:`, err);
    client.send(JSON.stringify({ error: err }));
    client.close(4006, "Payment invalid");
    return false;
  }

  return true;
}

interface Session {
  timer: NodeJS.Timeout;
  client: WebSocket;
  upstream: WebSocket;
}

const activeSessions = new Map<string, Session>();

export function setupWssHandler(wss: WebSocketServer) {
  wss.on("connection", async (client: WebSocket, req) => {
    try {
      const url = new URL(req.url || "", `ws://${req.headers.host}`);
      const id = url.pathname.split("/").pop();

      if (!id) {
        client.close(4000, "Missing WebSocket ID");
        return;
      }

      const wssDoc = await WebSocketModel.findOne({ generatedId: id });
      if (!wssDoc) {
        client.close(4001, "WebSocket not found");
        return;
      }

      const paymentHeader = url.searchParams.get("payment");
      if (!paymentHeader) {
        client.send(JSON.stringify({ error: "X-PAYMENT (query) required" }));
        client.close(4002, "Payment required");
        return;
      }

      const user = await UserModel.findById(wssDoc.owner);
      if (!user) {
        client.close(4004, "User not found");
        return;
      }

      const address = user.publicKey;
      const BASE_URL = process.env.SERVER_BASE_URL || "ws://localhost:3000";
      const resource = `${BASE_URL}/wss/${wssDoc.generatedId}` as Resource;

      const paymentRequirements = [
        createExactPaymentRequirements(
          wssDoc.pricePerMinute,
          "base-sepolia",
          resource,
          wssDoc.name,
          address
        ),
      ];

      console.log(
        `[xGate] Created payment requirements:`,
        JSON.stringify(paymentRequirements[0], null, 2)
      );

      const isValid = await verifyPayment(
        client,
        paymentHeader,
        paymentRequirements
      );
      if (!isValid) return;

      const upstream = new WebSocket(wssDoc.serviceUrl);

      upstream.on("open", () => {
        client.send(
          JSON.stringify({ message: "✅ Connected via xGate Proxy" })
        );
      });

      upstream.on("message", (data) => client.send(data));
      client.on("message", (msg) => upstream.send(msg));

      client.on("close", () => {
        try {
          upstream.close();
        } catch {}
        const session = activeSessions.get(id);
        if (session) clearInterval(session.timer);
        activeSessions.delete(id);
      });

      upstream.on("close", () => {
        try {
          client.close();
        } catch {}
      });

      try {
        const settleResponse = await settle(
          exact.evm.decodePayment(paymentHeader), //@ts-ignore
          paymentRequirements[0]
        );

        wssDoc.amountGenerated += wssDoc.pricePerMinute;
        await wssDoc.save();

        const encodedResponse = Buffer.from(
          JSON.stringify(settleResponse)
        ).toString("base64");

        client.send(
          JSON.stringify({
            type: "payment-settled",
            settlementResponse: encodedResponse,
          })
        );

        console.log(`[xGate]  Payment settled for ${id}`);
      } catch (err) {
        console.error("Settlement failed:", err);
        client.send(JSON.stringify({ warning: "Settlement failed" }));
      }

      const renew = async () => {
        try {
          client.send(
            JSON.stringify({
              message: "Subscription expiring — please renew payment.",
            })
          );
        } catch {}
      };

      const timer = setInterval(renew, wssDoc.sessionTtlSeconds * 1000);
      activeSessions.set(id, { timer, client, upstream });

      console.log(`[xGate]  Proxy established for ${id}`);
    } catch (err: any) {
      console.error("WSS connection error:", err?.message || err);
      if (err?.stack) console.error("Stack trace:", err.stack);
      try {
        client.close(1011, "Internal server error");
      } catch {}
    }
  });

  console.log("WebSocket handler ready");
}
