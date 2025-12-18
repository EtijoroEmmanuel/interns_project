import { BaseRepository } from "./baseRepository";
import { BoatModel, Boat } from "../models/boat";
import { BoatFilters, Pagination } from "../types/boatTypes";
import { FilterQuery } from "mongoose";

interface BoatQueryFilter extends FilterQuery<Boat> {
  companyName?: string;
  boatType?: string;
  isAvailable?: boolean;
  boatName?: { $regex: string; $options: string };
  capacity?: {
    $gte?: number;
    $lte?: number;
  };
  pricePerHour?: {
    $gte?: number;
    $lte?: number;
  };
}

export class BoatRepository extends BaseRepository<Boat> {
  constructor() {
    super(BoatModel);
  }

  async getBoatsWithFilters(
    filters: BoatFilters,
    pagination: Pagination
  ): Promise<{ data: Boat[]; total: number; page: number; limit: number }> {
    const query: BoatQueryFilter = {
      ...(filters.companyName && filters.companyName !== "allCompanies" && { 
        companyName: filters.companyName 
      }),
      ...(filters.boatType && filters.boatType !== "allBoatTypes" && { 
        boatType: filters.boatType 
      }),
      ...(filters.isAvailable !== undefined && { 
        isAvailable: filters.isAvailable 
      }),
      ...(filters.boatName && { 
        boatName: { $regex: filters.boatName, $options: "i" } 
      }),
      ...((filters.capacityMin !== undefined || filters.capacityMax !== undefined) && {
        capacity: {
          ...(filters.capacityMin !== undefined && { $gte: filters.capacityMin }),
          ...(filters.capacityMax !== undefined && { $lte: filters.capacityMax }),
        }
      }),
      ...((filters.priceMin !== undefined || filters.priceMax !== undefined) && {
        pricePerHour: {
          ...(filters.priceMin !== undefined && { $gte: filters.priceMin }),
          ...(filters.priceMax !== undefined && { $lte: filters.priceMax }),
        }
      }),
    };

    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      this.model.find(query).skip(skip).limit(pagination.limit).sort({ createdAt: -1 }),
      this.model.countDocuments(query),
    ]);

    return { data, total, page: pagination.page, limit: pagination.limit };
  }
}