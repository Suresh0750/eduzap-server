import mongoose from "mongoose";
import logger from "../utils/logger";

const connectToDatabase = async () => {
  try {
   
    await mongoose.connect(process.env.MONGO_URL!);
    logger.info(`Database connected successfully`);
   
  } catch (error) {
    logger.error(`Error from connect database :${error}`);
  }
};

export default connectToDatabase;
