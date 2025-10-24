import express, { Request, Response } from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import fetchRouter from "./routes/fetch";
import addRestRouter from "./routes/addRest";
import addWssRouter from "./routes/addwss";
import x402Router from "./routes/x402";
import wssInfoRouter from "./routes/wssInfo";
import { setupWssHandler } from "./routes/wssProxy";
import dbconnect from "./utils/dbconnect";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

setupWssHandler(wss);

const PORT = process.env.PORT || 3000;

dbconnect();

app.use(express.json());
app.use(cors());
app.use("/api/fetch", fetchRouter);
app.use("/api/addRest", addRestRouter);
app.use("/api/addWss", addWssRouter);
app.use("/api/x402", x402Router);
app.use("/api/wss-info", wssInfoRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});
