import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./db/mongo";
import { logger } from "./utils/logger";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5002;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}!!!!`);
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Failed to start the server: ${error.message}`);
    } else {
      logger.error(`Failed to start the server: Unknown error`);
    }
  }
};

startServer();