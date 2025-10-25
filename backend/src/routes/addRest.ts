import express, { Request, Response } from "express";
import { UserModel, ApiModel } from "../models/model";
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
    } = req.body;

    if (
      !publicKey ||
      !name ||
      !description ||
      !serviceUrl ||
      !pricePerRequest ||
      !method
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    let user = await UserModel.findOne({ publicKey });
    if (!user) {
      user = new UserModel({ publicKey, restEndpoints: [], webSockets: [] });
      await user.save();
    }

    const generatedEndpoint = `/api/x402/${nanoid(10)}`;

    const api = new ApiModel({
      name,
      description,
      generatedEndpoint,
      serviceUrl,
      method,
      pricePerRequest: parseFloat(pricePerRequest),
      amountGenerated: 0,
      owner: user._id,
    });

    await api.save();

    // @ts-ignore
    user.restEndpoints.push(api._id);
    await user.save();

    return res.status(201).json({
      success: true,
      api: {
        id: api._id,
        name: api.name,
        description: api.description,
        generatedEndpoint: api.generatedEndpoint,
        pricePerRequest: api.pricePerRequest,
      },
    });
  } catch (err: any) {
    console.error("Add REST API error:", err);
    const message =
      err.code === 11000
        ? "Duplicate endpoint detected. Please try again."
        : err.message || "Internal server error";
    return res.status(500).json({ success: false, error: message });
  }
});

export default router;
