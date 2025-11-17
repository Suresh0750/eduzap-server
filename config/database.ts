import mongoose from "mongoose";
import logger from "../utils/logger";


let isConnected = false;



const connectToDatabase = async () => {
  try {
    if(isConnected) return
    await mongoose.connect(process.env.MONGO_URL!);
    logger.info(`Database connected successfully`);
    isConnected = true
  } catch (error) {
    logger.error(`Error from connect database :${error}`);
  }
};

export default connectToDatabase;
