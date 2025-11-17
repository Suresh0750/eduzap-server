import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import connectToDatabase from "./config/database"
import logger from "./utils/logger";




dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Server is running 🚀" });
});

app.get("/api/test", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "API is working" });
});

const PORT = process.env.PORT || 5000;

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  logger.error(`Error form connect the database ${err}`)
});

