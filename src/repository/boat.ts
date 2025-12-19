import { BaseRepository } from "./baseRepository";
import { BoatModel, Boat } from "../models/boat";
import { BoatFilters } from "../types/boatTypes";
import { FilterQuery } from "mongoose";
import { paginate, IPagination, PaginatedResult } from "../utils/pagination";

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
    pagination: IPagination
  ): Promise<PaginatedResult<Boat>> {
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

    return await paginate(this.model, query, pagination);
  }
}