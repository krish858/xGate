import express, { Request, Response } from "express";
import User from "../models/User";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.body;
    if (!publicKey) {
      return res.status(400).json({ error: "Public key required" });
    }

    let user = await User.findOne({ publicKey });
    if (!user) {
      user = new User({ publicKey, restEndpoints: [], webSockets: [] });
      await user.save();
    }

    const recentRest = user.restEndpoints.slice(-5).reverse();
    const recentWs = user.webSockets.slice(-5).reverse();

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
