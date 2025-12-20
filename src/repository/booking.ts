import { Types, ClientSession } from "mongoose";
import { BaseRepository } from "./baseRepository"
import { BookingModel, Booking } from "../models/booking";
import { paginate, IPagination, PaginatedResult } from "../utils/pagination";

export class BookingRepository extends BaseRepository<Booking> {
  constructor() {
    super(BookingModel);
  }

  async hasOverlappingBooking(
    boatId: string | Types.ObjectId,
    startDate: Date,
    endDate: Date,
    session?: ClientSession
  ): Promise<boolean> {
    const overlapping = await this.model.findOne(
      {
        boat: boatId,
        status: { $in: ["PENDING", "CONFIRMED"] },
        startDate: { $lt: endDate },
        endDate: { $gt: startDate },
      },
      null,
      { session }
    );

    return !!overlapping;
  }

  async getUserBookings(
    userId: string | Types.ObjectId,
    pagination: IPagination
  ): Promise<PaginatedResult<Booking>> {
    const query = this.model
      .find({ user: userId })
      .populate({
        path: "boat",
        select: "boatName boatType description location capacity amenities pricePerHour media companyName",
      })
      .populate({
        path: "user",
        select: "email phoneNumber",
      })
      .sort({ startDate: -1 });

    const countQuery = this.model.countDocuments({ user: userId });

    const { page = 1, size = 10 } = pagination;
    const skip = (page - 1) * size;

    const [data, total] = await Promise.all([
      query.skip(skip).limit(size).lean(),
      countQuery,
    ]);

    return {
      data,
      total,
      page,
      limit: size,
    };
  }

  async getAllBookings(pagination: IPagination): Promise<PaginatedResult<Booking>> {
    const query = this.model
      .find({})
      .populate({
        path: "boat",
        select: "boatName boatType description location capacity amenities pricePerHour media companyName",
      })
      .populate({
        path: "user",
        select: "email phoneNumber",
      })
      .sort({ startDate: -1 });

    const countQuery = this.model.countDocuments({});

    const { page = 1, size = 10 } = pagination;
    const skip = (page - 1) * size;

    const [data, total] = await Promise.all([
      query.skip(skip).limit(size).lean(),
      countQuery,
    ]);

    return {
      data,
      total,
      page,
      limit: size,
    };
  }
}