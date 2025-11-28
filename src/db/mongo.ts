import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export const connectDB = async () => {
  const conn = await mongoose.connect(env.DB.URL);
  logger.info(
    `MongoDB Connected: ${conn.connection.name} (${env.APP.ENV} environment)`
  );
};
