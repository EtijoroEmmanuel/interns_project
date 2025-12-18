import { BaseRepository } from "./baseRepository";
import { PackageModel, Package } from "../models/package";
import { Pagination } from "../types/boatTypes";

export class PackageRepository extends BaseRepository<Package> {
  constructor() {
    super(PackageModel);
  }

  async getAllPackages(
    pagination: Pagination
  ): Promise<{ data: Package[]; total: number; page: number; limit: number }> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.model.countDocuments(),
    ]);

    return { data, total, page, limit };
  }
}