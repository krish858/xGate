import express, { Request, Response } from "express";
import { UserModel, ApiModel, WebSocketModel } from "../models/model";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.body;
    if (!publicKey) {
      return res.status(400).json({ error: "Public key required" });
    }

    let user = await UserModel.findOne({ publicKey });
    if (!user) {
      user = new UserModel({ publicKey, restEndpoints: [], webSockets: [] });
      await user.save();
    }

    const recentRest = await ApiModel.find({ owner: user._id })
      .sort({ _id: -1 })
      .limit(5);
    const recentWs = await WebSocketModel.find({ owner: user._id })
      .sort({ _id: -1 })
      .limit(5);

    res.json({
      success: true,
      user: {
        publicKey: user.publicKey,
        restEndpoints: recentRest,
        webSockets: recentWs,
      },
    });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
