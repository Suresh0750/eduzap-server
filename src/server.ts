import express, { Application } from "express";
import dotenv from "dotenv";
import connectToDatabase from "./config/database"
import logger from "./utils/logger";
import userRouter from "./router/user.router"
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/request",userRouter)

// * global error handler
app.use(errorHandler)

const PORT = process.env.PORT 

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  logger.error(`Error form connect the database ${err}`)
});

