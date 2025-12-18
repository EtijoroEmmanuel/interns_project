import { Types } from "mongoose";
import { BaseRepository } from "./baseRepository"
import { BookingModel, Booking } from "../models/booking";

export class BookingRepository extends BaseRepository<Booking> {
  constructor() {
    super(BookingModel);
  }

  async hasOverlappingBooking(
    boatId: string | Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    const overlapping = await this.model.findOne({
      boat: boatId,
      status: { $in: ["PENDING", "CONFIRMED"] },
      $or: [
        { startDate: { $lt: endDate }, endDate: { $gt: startDate } },
      ],
    });

    return !!overlapping;
  }

  async getUserBookings(userId: string | Types.ObjectId): Promise<Booking[]> {
    return this.model.find({ user: userId }).sort({ startDate: -1 });
  }
}
