import express from "express";
import axios, { Method } from "axios";
import https from "https";
import { UserModel, ApiModel } from "../models/User";
import { config } from "dotenv";
import { exact } from "x402/schemes";
import { useFacilitator } from "x402/verify";
import {
  processPriceToAtomicAmount,
  findMatchingPaymentRequirements,
} from "x402/shared";
import type {
  PaymentRequirements,
  Price,
  Resource,
  Network,
  PaymentPayload,
} from "x402/types";

config();

const FACILITATOR_URL = "https://x402.org/facilitator";

if (!FACILITATOR_URL) {
  console.error("FACILITATOR_URL not defined");
  process.exit(1);
}

const router = express.Router();
const { verify, settle } = useFacilitator({ url: FACILITATOR_URL });
const x402Version = 1;

function createExactPaymentRequirements(
  price: Price,
  network: Network,
  resource: Resource,
  description: string,
  address: string
): PaymentRequirements {
  const atomicAmount = processPriceToAtomicAmount(price, network);
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
  req: express.Request,
  res: express.Response,
  paymentRequirements: PaymentRequirements[]
): Promise<boolean> {
  const paymentHeader = req.header("X-PAYMENT");
  if (!paymentHeader) {
    res.status(402).json({
      x402Version,
      error: "X-PAYMENT header required",
      accepts: paymentRequirements,
    });
    return false;
  }

  let decodedPayment: PaymentPayload;
  try {
    decodedPayment = exact.evm.decodePayment(paymentHeader);
    decodedPayment.x402Version = x402Version;
  } catch {
    res.status(402).json({
      x402Version,
      error: "Invalid payment",
      accepts: paymentRequirements,
    });
    return false;
  }

  try {
    const matchedReq =
      findMatchingPaymentRequirements(paymentRequirements, decodedPayment) ||
      paymentRequirements[0];
    // @ts-ignore
    const response = await verify(decodedPayment, matchedReq);
    if (!response.isValid) {
      res.status(402).json({
        x402Version,
        error: response.invalidReason,
        accepts: paymentRequirements,
        payer: response.payer,
      });
      return false;
    }
  } catch (err) {
    res.status(402).json({
      x402Version,
      error: err,
      accepts: paymentRequirements,
    });
    return false;
  }

  return true;
}

router.all("/:id", async (req, res) => {
  try {
    const endpointId = `/api/x402/${req.params.id}`;

    const api = await ApiModel.findOne({ generatedEndpoint: endpointId });
    if (!api) return res.status(404).json({ error: "API not found" });

    const user = await UserModel.findById(api.owner);
    if (!user) return res.status(404).json({ error: "User not found" });

    const address = user.publicKey;

    const BASE_URL = process.env.SERVER_BASE_URL || "http://localhost:3000";
    const resource = `${BASE_URL}${api.generatedEndpoint}` as Resource;

    const paymentRequirements = [
      createExactPaymentRequirements(
        api.pricePerRequest,
        "base-sepolia",
        resource,
        api.name,
        address
      ),
    ];

    const isValid = await verifyPayment(req, res, paymentRequirements);
    if (!isValid) return;

    const { "x-payment": _, ...forwardedHeaders } = req.headers;

    const axiosConfig = {
      method: req.method as Method,
      url: api.serviceUrl,
      headers: forwardedHeaders,
      data: req.body,
      params: req.query,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    };

    const response = await axios(axiosConfig);

    try {
      const settleResponse = await settle(
        exact.evm.decodePayment(req.header("X-PAYMENT")!), //@ts-ignore
        paymentRequirements[0]
      );

      api.amountGenerated += api.pricePerRequest;
      await api.save();

      const encodedResponse = Buffer.from(
        JSON.stringify(settleResponse)
      ).toString("base64");
      res.setHeader("X-PAYMENT-RESPONSE", encodedResponse);
    } catch (err) {
      console.error("Settlement failed:", err);
    }

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("x402 endpoint error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
