import { BaseRepository } from "./baseRepository";
import { BoatModel, Boat } from "../models/boat";
import { Types } from "mongoose";

interface BoatFilters {
  companyName?: string;
  status?: "available" | "unavailable";
  capacityMin?: number;
  capacityMax?: number;
  priceMin?: number;
  priceMax?: number;
  boatName?: string;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

export class BoatRepository extends BaseRepository<Boat> {
  constructor() {
    super(BoatModel);
  }

  async toggleStatus(id: string | Types.ObjectId): Promise<Boat | null> {
    const boat = await this.findById(id);
    if (!boat) return null;

    const newStatus = boat.status === "available" ? "unavailable" : "available";
    return this.findByIdAndUpdate(id, { status: newStatus });
  }

  async getBoatsWithFilters(
    filters: BoatFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<{ data: Boat[]; total: number; page: number; limit: number }> {
    const query: any = {};

    if (filters.companyName) query.companyName = filters.companyName;

    if (filters.status) query.status = filters.status;

    if (filters.boatName)
      query.boatName = { $regex: filters.boatName, $options: "i" };

    if (filters.capacityMin || filters.capacityMax) {
      query.capacity = {};
      if (filters.capacityMin) query.capacity.$gte = filters.capacityMin;
      if (filters.capacityMax) query.capacity.$lte = filters.capacityMax;
    }

    if (filters.priceMin || filters.priceMax) {
      query.price_per_hour = {};
      if (filters.priceMin) query.price_per_hour.$gte = filters.priceMin;
      if (filters.priceMax) query.price_per_hour.$lte = filters.priceMax;
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.model.countDocuments(query),
    ]);

    return { data, total, page, limit };
  }
}
