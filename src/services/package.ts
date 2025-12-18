import { PackageRepository } from "../repository/package";
import { UploadService } from "./upload";
import { CloudinaryUtil } from "../utils/cloudinary";
import { NotFoundException } from "../utils/exception";
import { Package, PackageModel } from "../models/package";
import { 
  Pagination, 
  MediaItem, 
  CreatePackageInput
} from "../types/boatTypes";

export class PackageService {
  private packageRepository: PackageRepository;

  constructor() {
    this.packageRepository = new PackageRepository();
  }

  async createPackage(data: CreatePackageInput): Promise<Package> {
    return this.packageRepository.create(data as Partial<Package>);
  }

  async getAllPackages(pagination: Pagination): Promise<{ 
    data: Package[]; 
    total: number; 
    page: number; 
    limit: number 
  }> {
    return this.packageRepository.getAllPackages(pagination);
  }

  async deletePackage(packageId: string): Promise<{ message: string }> {
    const packageDoc = await this.packageRepository.findById(packageId);
    if (!packageDoc) throw new NotFoundException("Package not found");

    if (packageDoc.media?.length > 0) {
      await Promise.all(
        packageDoc.media.map(media => CloudinaryUtil.deleteFile(media.publicId))
      );
    }

    await this.packageRepository.deleteOne({ _id: packageId });

    return { message: "Package deleted successfully" };
  }

  async addMedia(packageId: string, mediaList: MediaItem[]): Promise<Package> {
    return UploadService.addMultipleMediaToDocument(PackageModel, packageId, mediaList);
  }

  async deleteMedia(packageId: string, mediaId: string): Promise<{ message: string }> {
    return UploadService.deleteMediaFromDocument(PackageModel, packageId, mediaId);
  }
}