import cron, { ScheduledTask } from "node-cron";
import { BookingModel, BOOKING_STATUS, PAYMENT_STATUS } from "../models/booking";
import { sendEmail } from "../utils/email";
import { 
  bookingCompletedTemplate, 
  bookingAbandonedTemplate, 
  PopulatedBooking 
} from "../utils/emailTemplate";
import { logger } from "../utils/logger";

export class BookingJobs {
  private static scheduleAbandoned = "*/15 * * * *"; // Every 15 minutes
  private static scheduleCompleted = "0 * * * *"; // Every hour
  private static abandonedTask: ScheduledTask | null = null;
  private static completedTask: ScheduledTask | null = null;

  
  static async runCompletedBookings(): Promise<void> {
    try {
      const now = new Date();

      const result = await BookingModel.updateMany(
        {
          status: BOOKING_STATUS.CONFIRMED,
          paymentStatus: PAYMENT_STATUS.SUCCESSFUL,
          endDate: { $lte: now },
        },
        { $set: { status: BOOKING_STATUS.COMPLETED } }
      );

      if (result.modifiedCount === 0) return;

      const completedBookings = await BookingModel.find({
        status: BOOKING_STATUS.COMPLETED,
        endDate: { $lte: now },
        updatedAt: { $gte: new Date(Date.now() - 10000) }
      })
        .populate("user", "_id email")
        .populate("boat", "_id boatName");

      let emailsSent = 0;

      for (const booking of completedBookings) {
        const populatedBooking = booking as unknown as PopulatedBooking;

        if (!populatedBooking.user?.email) {
          logger.warn(
            { bookingId: booking._id },
            "[BookingJobs] Skipping completion email - user not found"
          );
          continue;
        }

        try {
          await sendEmail({
            to: populatedBooking.user.email,
            subject: "Thank You - Booking Completed Successfully!",
            html: bookingCompletedTemplate(populatedBooking),
          });
          emailsSent++;
        } catch (emailError) {
          logger.error(
            { err: emailError, bookingId: booking._id },
            "[BookingJobs] Failed to send completion email"
          );
        }
      }

      logger.info(
        `[BookingJobs] Completed: ${result.modifiedCount} booking(s), sent ${emailsSent} email(s)`
      );
    } catch (error) {
      logger.error({ err: error }, "[BookingJobs] Error completing bookings");
    }
  }

 
  static async runAbandonedBookings(): Promise<void> {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      const result = await BookingModel.updateMany(
        {
          status: BOOKING_STATUS.PENDING,
          paymentStatus: PAYMENT_STATUS.PENDING, 
          createdAt: { $lte: fifteenMinutesAgo },
        },
        { $set: { status: BOOKING_STATUS.ABANDONED } }
      );

      if (result.modifiedCount === 0) return;

  
      const abandonedBookings = await BookingModel.find({
        status: BOOKING_STATUS.ABANDONED,
        createdAt: { $lte: fifteenMinutesAgo },
        updatedAt: { $gte: new Date(Date.now() - 10000) }
      })
        .populate("user", "_id email")
        .populate("boat", "_id boatName");

      let emailsSent = 0;

      for (const booking of abandonedBookings) {
        const populatedBooking = booking as unknown as PopulatedBooking;

        if (!populatedBooking.user?.email) {
          logger.warn(
            { bookingId: booking._id },
            "[BookingJobs] Skipping abandoned email - user not found"
          );
          continue;
        }

        try {
          await sendEmail({
            to: populatedBooking.user.email,
            subject: "Your Booking Payment Expired",
            html: bookingAbandonedTemplate(populatedBooking),
          });
          emailsSent++;
        } catch (emailError) {
          logger.error(
            { err: emailError, bookingId: booking._id },
            "[BookingJobs] Failed to send abandoned email"
          );
        }
      }

      logger.info(
        `[BookingJobs] Abandoned: ${result.modifiedCount} booking(s), sent ${emailsSent} email(s)`
      );
    } catch (error) {
      logger.error({ err: error }, "[BookingJobs] Error abandoning bookings");
    }
  }


  static start(): { stop: () => void } {
    logger.info("[BookingJobs] Starting all booking jobs...");

    this.runAbandonedBookings().catch(err =>
      logger.error({ err }, "[BookingJobs] Error in initial abandoned run")
    );
    this.runCompletedBookings().catch(err =>
      logger.error({ err }, "[BookingJobs] Error in initial completed run")
    );

    this.abandonedTask = cron.schedule(this.scheduleAbandoned, () => {
      logger.info("[BookingJobs] Running scheduled abandoned bookings check...");
      this.runAbandonedBookings().catch(err =>
        logger.error({ err }, "[BookingJobs] Error in scheduled abandoned run")
      );
    });

    this.completedTask = cron.schedule(this.scheduleCompleted, () => {
      logger.info("[BookingJobs] Running scheduled completed bookings check...");
      this.runCompletedBookings().catch(err =>
        logger.error({ err }, "[BookingJobs] Error in scheduled completed run")
      );
    });

    logger.info("[BookingJobs] All booking jobs started successfully");

    return {
      stop: () => {
        if (this.abandonedTask) {
          this.abandonedTask.stop();
          logger.info("[BookingJobs] Stopped abandoned bookings job");
        }
        if (this.completedTask) {
          this.completedTask.stop();
          logger.info("[BookingJobs] Stopped completed bookings job");
        }
      }
    };
  }
}