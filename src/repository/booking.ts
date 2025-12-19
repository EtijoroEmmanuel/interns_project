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
    return await paginate(
      this.model,
      { user: userId },
      pagination,
      { startDate: -1 }
    );
  }

  async getAllBookings(pagination: IPagination): Promise<PaginatedResult<Booking>> {
    return await paginate(
      this.model,
      {},
      pagination,
      { startDate: -1 }
    );
  }
}