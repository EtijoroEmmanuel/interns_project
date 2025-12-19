import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./db/mongo";
import { logger } from "./utils/logger";
import { JobScheduler } from "./jobs";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();
    logger.info("Database connected successfully");

    JobScheduler.startAll();
    logger.info("Cron jobs started successfully");

    const PORT = process.env.PORT || 5002;
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}!!!!`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      
      JobScheduler.stopAll();
      
      server.close(() => {
        logger.info("Server closed successfully");
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Failed to start the server: ${error.message}`);
    } else {
      logger.error(`Failed to start the server: Unknown error`);
    }
    process.exit(1);
  }
};

startServer();