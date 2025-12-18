import { BookingRepository } from "../repository/booking";
import { Booking, BOOKING_STATUS, BookingModel } from "../models/booking";
import { BoatModel, Boat } from "../models/boat";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from "../utils/exception";
import mongoose from "mongoose";

interface CreateBookingInput {
  userId: string;
  boatId: string;
  startDate: Date;
  duration: number;
  time: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  numberOfGuest: number;
  occasion?: string;
  specialRequest?: string;
}

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
      duration,
      time,
      fullName,
      email,
      phoneNumber,
      numberOfGuest,
      occasion,
      specialRequest,
    } = input;

    const boat: Boat | null = await BoatModel.findById(boatId);
    if (!boat) {
      throw new NotFoundException("Boat not found");
    }

    if (numberOfGuest > boat.capacity) {
      throw new BadRequestException(
        `Number of guests (${numberOfGuest}) exceeds boat capacity (${boat.capacity})`
      );
    }

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + duration);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const hasOverlap = await this.bookingRepo.hasOverlappingBooking(
        boatId,
        startDate,
        endDate
      );
      
      if (hasOverlap) {
        throw new BadRequestException(
          "The boat is already booked for the selected time. Please choose a different time slot."
        );
      }

      const totalPrice = boat.pricePerHour * duration;

      const bookingData = {
        user: userId,
        boat: boatId,
        startDate,
        endDate,
        duration,
        time,
        fullName,
        email,
        phoneNumber,
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

  async getUserBookings(userId: string): Promise<Booking[]> {
    return this.bookingRepo.getUserBookings(userId);
  }

  async getBookingById(bookingId: string, userId?: string): Promise<Booking> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (userId && booking.user.toString() !== userId) {
      throw new ForbiddenException("You are not authorized to access this booking");
    }

    return booking;
  }

  async cancelBooking(bookingId: string, userId?: string): Promise<Booking> {
    const booking = await this.getBookingById(bookingId, userId);

    if (booking.status !== BOOKING_STATUS.PENDING && booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new BadRequestException(
        `Booking cannot be cancelled. Current status: ${booking.status}`
      );
    }

    const now = new Date();
    const hoursUntilBooking = (booking.startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilBooking < 24) {
      throw new BadRequestException(
        "Bookings can only be cancelled at least 24 hours before the start time"
      );
    }

    const updatedBooking = await this.bookingRepo.findByIdAndUpdate(
      bookingId,
      { status: BOOKING_STATUS.CANCELLED }
    );

    if (!updatedBooking) {
      throw new InternalServerErrorException("Failed to cancel booking");
    }

    return updatedBooking;
  }

  async getAllBookings(): Promise<Booking[]> {
    return BookingModel.find()
      .sort({ startDate: -1 })
      .populate("user", "fullName email")
      .populate("boat", "name pricePerHour");
  }
}