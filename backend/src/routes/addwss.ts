import express, { Request, Response } from "express";
import { nanoid } from "nanoid";
import { UserModel, WebSocketModel } from "../models/model";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { publicKey, name, serviceUrl, pricePerMinute } = req.body;

    if (!publicKey || !name || pricePerMinute === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let user = await UserModel.findOne({ publicKey });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const generatedEndpoint = `/wss/${nanoid(10)}`;

    const newWss = new WebSocketModel({
      name,
      generatedEndpoint,
      serviceUrl,
      owner: user._id,
      pricePerMinute: parseFloat(pricePerMinute),
      billingMode: "subscription",
      sessionTtlSeconds: 60,
      amountGenerated: 0,
    });

    await newWss.save();

    //@ts-ignore
    user.webSockets.push(newWss._id);
    await user.save();

    res.json({
      success: true,
      wss: {
        name: newWss.name,
        generatedEndpoint: newWss.generatedEndpoint,
        pricePerMinute: newWss.pricePerMinute,
      },
    });
  } catch (err) {
    console.error("Add WSS error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
