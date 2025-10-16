import express, { Request, Response } from "express";
import User from "../models/User";
import { nanoid } from "nanoid";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { publicKey, name, description, serviceUrl, pricePerRequest } =
      req.body;

    if (
      !publicKey ||
      !name ||
      !description ||
      !serviceUrl ||
      !pricePerRequest
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let user = await User.findOne({ publicKey });
    if (!user) {
      user = new User({ publicKey, restEndpoints: [], webSockets: [] });
      await user.save();
    }

    const generatedEndpoint = `/api/x402/${nanoid(10)}`;

    const newApi = {
      name,
      description,
      generatedEndpoint,
      serviceUrl,
      pricePerRequest: parseFloat(pricePerRequest),
      amountGenerated: 0,
      ownerPublicKey: publicKey,
    };
    console.log("Incoming body:", req.body);
    console.log("New API object:", newApi);

    user.restEndpoints.push(newApi);
    await user.save();

    res.json({ success: true, api: newApi });
  } catch (err) {
    console.error("Add REST API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
