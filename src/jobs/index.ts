import { BookingJobs } from "./bookingJobs";
import { logger } from "../utils/logger";

export class JobScheduler {
  private static jobHandlers: Array<{ stop: () => void }> = [];

  static startAll() {
    logger.info("[JobScheduler] Starting all scheduled jobs...");
    
    const bookingJobsHandler = BookingJobs.start();
    if (bookingJobsHandler) {
      this.jobHandlers.push(bookingJobsHandler);
    }
  }

  static stopAll() {
    logger.info("[JobScheduler] Stopping all scheduled jobs...");
    
    this.jobHandlers.forEach(handler => {
      try {
        handler.stop();
      } catch (error) {
        logger.error({ err: error }, "[JobScheduler] Error stopping job");
      }
    });
    
    this.jobHandlers = [];
    logger.info("[JobScheduler] All jobs stopped successfully");
  }
}