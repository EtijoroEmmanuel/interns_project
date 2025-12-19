import { BaseRepository } from "./baseRepository";
import { PackageModel, Package } from "../models/package";
import { paginate, IPagination, PaginatedResult } from "../utils/pagination";

export class PackageRepository extends BaseRepository<Package> {
  constructor() {
    super(PackageModel);
  }

  async getAllPackages(
    pagination: IPagination
  ): Promise<PaginatedResult<Package>> {
    return await paginate(
      this.model,
      {},
      pagination
    );
  }
}