import { BookingRepository } from "../repository/booking";
import { Booking, BOOKING_STATUS, BookingModel, CreateBookingInput } from "../models/booking";
import { BoatModel, Boat } from "../models/boat";
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
import { bookingCancellationTemplate, PopulatedBooking } from "../utils/emailTemplate";

export class BookingService {
  private bookingRepo: BookingRepository;

  constructor() {
    this.bookingRepo = new BookingRepository();
  }

  async createBooking(input: CreateBookingInput): Promise<Booking> {
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

    const boat: Boat | null = await BoatModel.findById(boatId);
    if (!boat) {
      throw new NotFoundException("Boat not found");
    }

    if (numberOfGuest > boat.capacity) {
      throw new ForbiddenException(
        `Number of guests (${numberOfGuest}) exceeds boat capacity (${boat.capacity})`
      );
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

      const bookingData = {
        user: userId,
        boat: boatId,
        startDate,
        endDate,
        numberOfGuest,
        occasion,
        specialRequest,
        totalPrice,
      };

      const [booking] = await BookingModel.create([bookingData], { session });

      if (!booking) {
        throw new InternalServerErrorException("Failed to create booking");
      }

      await session.commitTransaction();
      return booking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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
      .populate("boat", "boatName pricePerHour capacity")
      .populate("user", "fullName email")
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
      .populate("user", "_id email fullName")
      .populate("boat", "_id boatName");

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.status !== BOOKING_STATUS.PENDING && booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new BadRequestException(
        `Booking cannot be cancelled. Current status: ${booking.status}`
      );
    }

    const now = new Date();
    const hoursUntilBooking = (booking.startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercentage = 0;
    let refundAmount = 0;

    if (hoursUntilBooking < 0) {
      throw new BadRequestException(
        "Booking cannot be cancelled after the start time has passed"
      );
    }

    if (hoursUntilBooking >= 24) {
      refundPercentage = 90;
      refundAmount = (booking.totalPrice * refundPercentage) / 100;
    } else {
      refundPercentage = 50;
      refundAmount = (booking.totalPrice * refundPercentage) / 100;
    }

    booking.status = BOOKING_STATUS.CANCELLED;
    await booking.save();

    await this.processRefund(booking, refundAmount, refundPercentage);

    const bookingForEmail = booking as unknown as PopulatedBooking;
    await sendEmail({
      to: bookingForEmail.user.email,
      subject: "Booking Cancelled",
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
    booking: any,
    refundAmount: number,
    refundPercentage: number
  ): Promise<void> {

    // if (booking.paymentReference) {
    //   await this.paymentGateway.refund({
    //     reference: booking.paymentReference,
    //     amount: refundAmount
    //   });
    // }

    console.warn(`Refund required: BookingID=${booking._id}, Amount=${refundAmount}, Percentage=${refundPercentage}%`);
    
    if (process.env.NODE_ENV === 'production') {
      throw new InternalServerErrorException(
        "Refund processing not implemented. Please contact support."
      );
    }
  }

  async getAllBookings(pagination: IPagination): Promise<PaginatedResult<Booking>> {
  return this.bookingRepo.getAllBookings(pagination);
}
}