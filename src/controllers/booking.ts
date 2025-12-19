import { Request, Response, NextFunction } from "express";
import { BookingService } from "../services/booking";
import { validate } from "../utils/validator";
import { createBookingSchema } from "../validators/booking";
import { Types } from "mongoose";
import { getPaginationParams } from "../utils/pagination";

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
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const userId: string | Types.ObjectId = req.user._id;

      const value = validate(createBookingSchema, req.body);
      const {
        boatId,
        startDate,
        endDate,
        numberOfGuest,
        occasion,
        specialRequest,
      } = value;

      const booking = await this.bookingService.createBooking({
        userId,
        boatId: new Types.ObjectId(boatId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
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
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const userId: string | Types.ObjectId = req.user._id;
      
      // Use reusable pagination utility
      const pagination = getPaginationParams(req.query);

      const bookings = await this.bookingService.getUserBookings(userId, pagination);

      res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings.data,
        pagination: {
          page: bookings.page,
          limit: bookings.limit,
          total: bookings.total,
          totalPages: Math.ceil(bookings.total / bookings.limit),
        },
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
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const { id } = req.params;
      const userId: string | Types.ObjectId = req.user._id;

      const booking = await this.bookingService.getBookingById(
        new Types.ObjectId(id),
        userId
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
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const { id } = req.params;
      const userId: string | Types.ObjectId = req.user._id;

      const result = await this.bookingService.cancelBooking(
        new Types.ObjectId(id),
        userId
      );

      res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: {
          booking: result.booking,
          refund: {
            amount: result.refundAmount,
            percentage: result.refundPercentage,
          },
        },
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
      const pagination = getPaginationParams(req.query);

      const bookings = await this.bookingService.getAllBookings(pagination);

      res.status(200).json({
        success: true,
        message: "All bookings retrieved successfully",
        data: bookings.data,
        pagination: {
          page: bookings.page,
          limit: bookings.limit,
          total: bookings.total,
          totalPages: Math.ceil(bookings.total / bookings.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}