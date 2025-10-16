import express, { Request, Response } from "express";
import cors from "cors";
import fetchRouter from "./routes/fetch";
import addRestRouter from "./routes/addRest";
import dbconnect from "./utils/dbconnect";

const app = express();
const PORT = process.env.PORT || 3000;

dbconnect();

app.use(express.json());
app.use(cors());
app.use("/api/fetch", fetchRouter);
app.use("/api/addRest", addRestRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
