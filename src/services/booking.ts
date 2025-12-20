import { BookingRepository } from "../repository/booking";
import { 
  Booking, 
  BOOKING_STATUS, 
  PAYMENT_STATUS,
  BookingModel, 
  CreateBookingInput 
} from "../models/booking";
import { BoatModel, Boat } from "../models/boat";
import { User } from "../models/user";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from "../utils/exception";
import { IPagination, PaginatedResult } from "../utils/pagination";
import mongoose, { Types } from "mongoose";
import { sendEmail } from "../utils/email";
import { bookingCancellationTemplate, bookingConfirmationTemplate, PopulatedBooking } from "../utils/emailTemplate";
import { getPaystackService } from "../utils/paystack";
import { env } from "../config/env";

interface InitializeBookingResponse {
  booking: Booking;
  paymentUrl: string;
  paymentReference: string;
}

interface VerifyBookingPaymentResponse {
  booking: Booking;
  message: string;
}

export class BookingService {
  private bookingRepo: BookingRepository;

  constructor() {
    this.bookingRepo = new BookingRepository();
  }

  async initializeBooking(input: CreateBookingInput): Promise<InitializeBookingResponse> {
    const {
      userId,
      boatId,
      startDate,
      endDate,
      numberOfGuest,
      occasion,
      specialRequest,
    } = input;

    const now = new Date();
    if (startDate < now) {
      throw new BadRequestException("Start date cannot be in the past");
    }

    if (endDate <= startDate) {
      throw new BadRequestException("End date must be after start date");
    }

    const boat = await BoatModel.findById(boatId);
    if (!boat) {
      throw new NotFoundException("Boat not found");
    }

    if (numberOfGuest > boat.capacity) {
      throw new ForbiddenException(
        `Number of guests (${numberOfGuest}) exceeds boat capacity (${boat.capacity})`
      );
    }

    const user = await User.findById(userId).select('email');
    if (!user || !user.email) {
      throw new NotFoundException("User not found or email missing");
    }

    const durationInHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const totalPrice = boat.pricePerHour * durationInHours;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const hasOverlap = await this.bookingRepo.hasOverlappingBooking(
        boatId,
        startDate,
        endDate,
        session
      );
      
      if (hasOverlap) {
        throw new UnprocessableEntityException(
          "The boat is already booked for the selected time. Please choose a different time slot."
        );
      }

      const paystack = getPaystackService();
      const paymentReference = paystack.generateReference("BKG");

      const bookingData = {
        user: userId,
        boat: boatId,
        startDate,
        endDate,
        numberOfGuest,
        occasion,
        specialRequest,
        totalPrice,
        paymentReference,
        status: BOOKING_STATUS.PENDING,
        paymentStatus: PAYMENT_STATUS.PENDING,
      };

      const [booking] = await BookingModel.create([bookingData], { session });

      if (!booking) {
        throw new InternalServerErrorException("Failed to create booking");
      }

      const paymentData = await paystack.initializePayment({
        email: user.email,
        amount: totalPrice * 100,
        reference: paymentReference,
        metadata: {
          bookingId: booking._id.toString(),
          userId: userId.toString(),
          boatId: boatId.toString(),
          boatName: boat.boatName,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        callback_url: `${env.APP.FRONTEND_URL}/bookings/${booking._id}/verify`,
      });

      await session.commitTransaction();

      return {
        booking,
        paymentUrl: paymentData.authorization_url,
        paymentReference: paymentData.reference,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async verifyAndConfirmBooking(
    paymentReference: string
  ): Promise<VerifyBookingPaymentResponse> {
    const booking = await BookingModel.findOne({ paymentReference })
      .populate("user", "_id email phoneNumber")
      .populate("boat", "_id boatName");

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.paymentStatus === PAYMENT_STATUS.SUCCESSFUL) {
      return {
        booking,
        message: "Booking already confirmed",
      };
    }

    const paystack = getPaystackService();
    const paymentData = await paystack.verifyPayment(paymentReference);

    if (paymentData.status !== "success") {
      booking.paymentStatus = PAYMENT_STATUS.FAILED;
      booking.status = BOOKING_STATUS.ABANDONED;
      await booking.save();

      throw new BadRequestException(
        `Payment verification failed. Status: ${paymentData.status}`
      );
    }

    if (paymentData.amount !== booking.totalPrice * 100) {
      throw new BadRequestException(
        "Payment amount does not match booking total"
      );
    }

    booking.status = BOOKING_STATUS.CONFIRMED;
    booking.paymentStatus = PAYMENT_STATUS.SUCCESSFUL;
    booking.paymentMethod = paymentData.channel;
    booking.paidAt = new Date(paymentData.paid_at);
    await booking.save();

    const bookingForEmail = booking as unknown as PopulatedBooking;
    await sendEmail({
      to: bookingForEmail.user.email,
      subject: "Booking Confirmed - Payment Received",
      html: bookingConfirmationTemplate(bookingForEmail),
    });

    return {
      booking,
      message: "Booking confirmed successfully",
    };
  }

  async getBookingByPaymentReference(paymentReference: string): Promise<Booking> {
    const booking = await BookingModel.findOne({ paymentReference })
      .populate({
        path: "boat",
        select: "boatName boatType description location capacity amenities pricePerHour media companyName",
      })
      .lean();

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return booking;
  }

  async getUserBookings(
    userId: string | Types.ObjectId,
    pagination: IPagination
  ): Promise<PaginatedResult<Booking>> {
    return this.bookingRepo.getUserBookings(userId, pagination);
  }

  async getBookingById(
    bookingId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<Booking> {
    const booking = await BookingModel.findOne({
      _id: bookingId,
      user: userId,
    })
      .populate({
        path: "boat",
        select: "boatName boatType description location capacity amenities pricePerHour media companyName",
      })
      .lean();

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return booking;
  }

  async cancelBooking(
    bookingId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<{ booking: Booking; refundAmount: number; refundPercentage: number }> {
  
    const booking = await BookingModel.findOne({
      _id: bookingId,
      user: userId,
    })
      .populate("user", "_id email phoneNumber")
      .populate("boat", "_id boatName");

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new BadRequestException(
        `Booking cannot be cancelled. Current status: ${booking.status}`
      );
    }

    if (booking.paymentStatus !== PAYMENT_STATUS.SUCCESSFUL) {
      throw new BadRequestException(
        "Cannot cancel booking without successful payment"
      );
    }

    const now = new Date();
    const hoursUntilBooking = (booking.startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < 0) {
      throw new BadRequestException(
        "Booking cannot be cancelled after the start time has passed"
      );
    }

    let refundPercentage = 0;
    let refundAmount = 0;

    if (hoursUntilBooking >= 24) {
      refundPercentage = 90;
      refundAmount = (booking.totalPrice * refundPercentage) / 100;
    } else {
      refundPercentage = 50;
      refundAmount = (booking.totalPrice * refundPercentage) / 100;
    }

    await this.processRefund(booking, refundAmount, refundPercentage);

    booking.status = BOOKING_STATUS.CANCELLED;
    booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
    booking.refundAmount = refundAmount;
    booking.refundPercentage = refundPercentage;
    booking.refundedAt = new Date();
    await booking.save();

    const bookingForEmail = booking as unknown as PopulatedBooking;
    await sendEmail({
      to: bookingForEmail.user.email,
      subject: "Booking Cancelled - Refund Processed",
      html: bookingCancellationTemplate(
        bookingForEmail,
        refundAmount,
        refundPercentage
      ),
    });

    return {
      booking: booking.toObject(),
      refundAmount,
      refundPercentage,
    };
  }

  private async processRefund(
    booking: mongoose.Document & Booking,
    refundAmount: number,
    refundPercentage: number
  ): Promise<void> {
    if (!booking.paymentReference) {
      throw new InternalServerErrorException(
        "Cannot process refund: Payment reference missing"
      );
    }

    try {
      const paystack = getPaystackService();
      
      const refundData = await paystack.processRefund({
        transaction: booking.paymentReference,
        amount: refundAmount * 100,
        merchant_note: `Cancellation refund: ${refundPercentage}% of ₦${booking.totalPrice}`,
        customer_note: `Your booking has been cancelled. You will receive a ${refundPercentage}% refund of ₦${refundAmount}.`,
      });

      booking.refundReference = refundData.transaction.reference.toString();
      
      console.log(`Refund processed successfully: BookingID=${booking._id}, Amount=₦${refundAmount}, Reference=${refundData.transaction.reference}`);
    } catch (error) {
      console.error(`Refund failed for BookingID=${booking._id}:`, error);
      throw new InternalServerErrorException(
        "Failed to process refund. Please contact support."
      );
    }
  }

  async getAllBookings(pagination: IPagination): Promise<PaginatedResult<Booking>> {
    return this.bookingRepo.getAllBookings(pagination);
  }

  async cleanupAbandonedBookings(): Promise<number> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const result = await BookingModel.updateMany(
      {
        paymentStatus: PAYMENT_STATUS.PENDING,
        status: BOOKING_STATUS.PENDING,
        createdAt: { $lt: fifteenMinutesAgo },
      },
      {
        status: BOOKING_STATUS.ABANDONED,
      }
    );

    return result.modifiedCount;
  }
}