import express, { Request, Response } from "express";
import { UserModel, ApiModel } from "../models/User";
import { nanoid } from "nanoid";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      publicKey,
      name,
      description,
      serviceUrl,
      pricePerRequest,
      method,
      queryParams,
      body,
    } = req.body;

    if (
      !publicKey ||
      !name ||
      !description ||
      !serviceUrl ||
      !pricePerRequest ||
      !method
    ) {
      return res.status(400).json({ error: "All required fields missing" });
    }

    // Find or create user
    let user = await UserModel.findOne({ publicKey });
    if (!user) {
      user = new UserModel({ publicKey, restEndpoints: [], webSockets: [] });
      await user.save();
    }

    const generatedEndpoint = `/api/x402/${nanoid(10)}`;

    // Create API document
    const api = new ApiModel({
      name,
      description,
      generatedEndpoint,
      serviceUrl,
      method,
      queryParams: queryParams || {},
      body: body || {},
      pricePerRequest: parseFloat(pricePerRequest),
      amountGenerated: 0,
      owner: user._id,
    });

    await api.save();

    //@ts-ignore
    user.restEndpoints.push(api._id);
    await user.save();

    res.json({ success: true, api });
  } catch (err) {
    console.error("Add REST API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
