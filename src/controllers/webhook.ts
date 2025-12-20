import { Request, Response } from "express";
import { getPaystackService } from "../utils/paystack";
import { BookingService } from "../services/booking";
import { BookingModel, PAYMENT_STATUS, BOOKING_STATUS } from "../models/booking";
import { logger } from "../utils/logger";

interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: {
      bookingId?: string;
      userId?: string;
      boatId?: string;
      [key: string]: unknown;
    };
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
  };
}

export class PaystackWebhookHandler {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  async handleWebhook(req: Request, res: Response): Promise<Response> {
    try {
      const signature = req.headers["x-paystack-signature"] as string;

      if (!signature) {
        logger.error("Webhook signature missing");
        return res.status(400).json({ error: "Signature missing" });
      }

      const rawBody = JSON.stringify(req.body);

      const paystack = getPaystackService();
      const isValid = paystack.verifyWebhookSignature(rawBody, signature);

      if (!isValid) {
        logger.error("Invalid webhook signature");
        return res.status(400).json({ error: "Invalid signature" });
      }

      const event = req.body as PaystackWebhookEvent;

      logger.info(`Received Paystack webhook: ${event.event}`);

      switch (event.event) {
        case "charge.success":
          await this.handleChargeSuccess(event);
          break;

        case "charge.failed":
          await this.handleChargeFailed(event);
          break;

        case "refund.processed":
          await this.handleRefundProcessed(event);
          break;

        case "refund.failed":
          await this.handleRefundFailed(event);
          break;

        default:
          logger.info(`Unhandled webhook event: ${event.event}`);
      }

      return res.status(200).json({ message: "Webhook received" });
    } catch (error) {
      logger.error(error, "Webhook processing error");
      return res.status(200).json({ message: "Webhook received with errors" });
    }
  }

  private async handleChargeSuccess(event: PaystackWebhookEvent): Promise<void> {
    const { reference, amount, channel, paid_at, metadata } = event.data;

    try {
      logger.info(`Processing successful charge: ${reference}`);

      const booking = await BookingModel.findOne({ paymentReference: reference });

      if (!booking) {
        logger.error(`Booking not found for reference: ${reference}`);
        return;
      }

      if (booking.paymentStatus === PAYMENT_STATUS.SUCCESSFUL) {
        logger.info(`Payment already processed for booking: ${booking._id}`);
        return;
      }

      if (amount !== booking.totalPrice * 100) {
        logger.error(
          `Amount mismatch for booking ${booking._id}: Expected ₦${booking.totalPrice * 100}, Got ₦${amount}`
        );
        booking.paymentStatus = PAYMENT_STATUS.FAILED;
        booking.status = BOOKING_STATUS.ABANDONED;
        await booking.save();
        return;
      }

      booking.status = BOOKING_STATUS.CONFIRMED;
      booking.paymentStatus = PAYMENT_STATUS.SUCCESSFUL;
      booking.paymentMethod = channel;
      booking.paidAt = new Date(paid_at);
      await booking.save();

      logger.info(`Booking confirmed via webhook: ${booking._id}`);
    } catch (error) {
      logger.error(error, "Error processing charge.success webhook");
      throw error;
    }
  }

  private async handleChargeFailed(event: PaystackWebhookEvent): Promise<void> {
    const { reference, message } = event.data;

    try {
      logger.info(`Processing failed charge: ${reference}`);

      const booking = await BookingModel.findOne({ paymentReference: reference });

      if (!booking) {
        logger.error(`Booking not found for reference: ${reference}`);
        return;
      }

      booking.paymentStatus = PAYMENT_STATUS.FAILED;
      booking.status = BOOKING_STATUS.ABANDONED;
      await booking.save();

      logger.info(`Booking marked as failed: ${booking._id}, Reason: ${message}`);
    } catch (error) {
      logger.error(error, "Error processing charge.failed webhook");
      throw error;
    }
  }

  private async handleRefundProcessed(event: PaystackWebhookEvent): Promise<void> {
    const { reference } = event.data;

    try {
      logger.info(`Refund processed: ${reference}`);

      const booking = await BookingModel.findOne({ paymentReference: reference });

      if (!booking) {
        logger.error(`Booking not found for refund reference: ${reference}`);
        return;
      }

      if (booking.paymentStatus !== PAYMENT_STATUS.REFUNDED) {
        booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
        await booking.save();
      }

      logger.info(`Refund confirmed for booking: ${booking._id}`);
    } catch (error) {
      logger.error(error, "Error processing refund.processed webhook");
      throw error;
    }
  }

  private async handleRefundFailed(event: PaystackWebhookEvent): Promise<void> {
    const { reference, message } = event.data;

    try {
      logger.info(`Refund failed: ${reference}, Reason: ${message}`);
      logger.error(`CRITICAL: Manual refund required for reference: ${reference}`);
    } catch (error) {
      logger.error(error, "Error processing refund.failed webhook");
      throw error;
    }
  }
}

export const paystackWebhookHandler = new PaystackWebhookHandler();