import express from "express";
import axios from "axios";
import User from "../models/User";
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

const router = express.Router(); //@ts-ignore
const { verify, settle } = useFacilitator({ url: FACILITATOR_URL });
const x402Version = 1;

function createExactPaymentRequirements(
  price: Price,
  network: Network,
  resource: Resource,
  description: string,
  address: string
): any {
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
  } catch (err) {
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
      paymentRequirements[0]; //@ts-ignore
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
    res
      .status(402)
      .json({ x402Version, error: err, accepts: paymentRequirements });
    return false;
  }

  return true;
}

router.all("/:id", async (req, res) => {
  try {
    const endpointId = `/api/x402/${req.params.id}`;

    const user = await User.findOne({
      "restEndpoints.generatedEndpoint": endpointId,
    });

    if (!user) return res.status(404).json({ error: "API not found" });

    const api = user.restEndpoints.find(
      (r) => r.generatedEndpoint === endpointId
    );
    if (!api) return res.status(404).json({ error: "API not found" });

    const address = api.ownerPublicKey;
    const resource = `${req.protocol}://${req.get("host")}${
      req.originalUrl
    }` as Resource;

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

    const axiosConfig = {
      method: req.method as any,
      url: api.serviceUrl,
      headers: req.headers,
      data: req.body,
      params: req.query,
    };

    const response = await axios(axiosConfig);

    try {
      const settleResponse = await settle(
        exact.evm.decodePayment(req.header("X-PAYMENT")!), //@ts-ignore
        paymentRequirements[0]
      ); //@ts-ignore
      res.setHeader("X-PAYMENT-RESPONSE", settleResponse);
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
