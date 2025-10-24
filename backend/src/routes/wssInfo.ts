import express from "express";
import { WebSocketModel, UserModel } from "../models/model";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const wssDoc = await WebSocketModel.findOne({ generatedId: id });
    if (!wssDoc) {
      return res.status(404).json({ error: "WebSocket not found" });
    }

    const user = await UserModel.findById(wssDoc.owner);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: wssDoc.generatedId,
      name: wssDoc.name,
      pricePerMinute: wssDoc.pricePerMinute,
      sessionTtlSeconds: wssDoc.sessionTtlSeconds,
      ownerAddress: user.publicKey,
    });
  } catch (error) {
    console.error("Error fetching WebSocket info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
