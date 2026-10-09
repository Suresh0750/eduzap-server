import express, { Application ,Response,Request} from "express";
import dotenv from "dotenv";
import connectToDatabase from "./config/database"
import logger from "./utils/logger";
import userRouter from "./router/user.router"
import { errorHandler } from "./middleware/errorHandler";
import cors from 'cors'

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors()); 

app.use("/api/requests",userRouter)
app.use("/health",(req:Request,res:Response)=>{
  res.status(200).send("Message from eduzap server")
})


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

