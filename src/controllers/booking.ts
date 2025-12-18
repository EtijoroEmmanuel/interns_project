import { Request, Response, NextFunction } from "express";
import { BookingService } from "../services/booking";
import { validate } from "../utils/validator";
import { createBookingSchema } from "../validators/booking";
import { Types } from "mongoose";

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  createBooking = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?._id as Types.ObjectId;
      const { boatId } = req.params;

      const value = validate(createBookingSchema, req.body);
      const {
        startDate,
        duration,
        time,
        fullName,
        email,
        phoneNumber,
        numberOfGuest,
        occasion,
        specialRequest,
      } = value;

      const booking = await this.bookingService.createBooking({
        userId: userId.toString(),
        boatId,
        startDate: new Date(startDate),
        duration,
        time,
        fullName,
        email,
        phoneNumber,
        numberOfGuest,
        occasion,
        specialRequest,
      });

      res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserBookings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?._id as Types.ObjectId;

      const bookings = await this.bookingService.getUserBookings(
        userId.toString()
      );

      res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  };

  getBookingById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?._id as Types.ObjectId;

      const booking = await this.bookingService.getBookingById(
        id,
        userId.toString()
      );

      res.status(200).json({
        success: true,
        message: "Booking retrieved successfully",
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  };

  cancelBooking = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?._id as Types.ObjectId;

      const booking = await this.bookingService.cancelBooking(
        id,
        userId.toString()
      );

      res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllBookings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const bookings = await this.bookingService.getAllBookings();

      res.status(200).json({
        success: true,
        message: "All bookings retrieved successfully",
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  };
}