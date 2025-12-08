import dotenv from "dotenv"
dotenv.config()

import app from "./app"
import { connectDB } from "./db/mongo"
import { logger } from "./utils/logger"


let isConnected = false;

const initializeDB = async () => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error: any) {
      logger.error(`Failed to connect to database: ${error.message}`)
    }
  }
};


if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5002
  
  connectDB().catch((error) => {
    logger.error(`Failed to connect to database: ${error.message}`)
  })
  
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}!!!!`)
  })
}

export default async (req: any, res: any) => {
  await initializeDB();
  return app(req, res);
};