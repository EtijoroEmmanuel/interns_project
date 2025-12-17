import { BoatRepository } from "../repository/boat";
import { UploadService } from "./upload";
import { CloudinaryUtil } from "../utils/cloudinary";
import { NotFoundException } from "../utils/exception";
import { Boat, BoatModel, BoatPackage } from "../models/boat";
import { Types } from "mongoose";
import { 
  BoatFilters, 
  Pagination, 
  MediaItem, 
  CreateBoatInput, 
  CreatePackageInput,
  MediaItemWithId,
  PackageWithId
} from "../types/boatTypes";

export class BoatService {
  private boatRepository: BoatRepository;

  constructor() {
    this.boatRepository = new BoatRepository();
  }

  async createBoat(
  data: Omit<CreateBoatInput, 'packages'> & Partial<Pick<CreateBoatInput, 'isAvailable' | 'media'>>,
  packages?: CreatePackageInput[]
): Promise<Boat> {
  const boatData = {
    ...data,
    ...(packages && packages.length > 0 && { packages })
  };
  
  return this.boatRepository.create(boatData as Partial<Boat>);
}
  async updateBoatDetails(boatId: string, data: Partial<Boat>): Promise<Boat> {
    const updated = await this.boatRepository.findByIdAndUpdate(boatId, data);
    if (!updated) throw new NotFoundException("Boat not found");
    return updated;
  }

  async toggleBoatAvailability(boatId: string): Promise<Boat> {
    const boat = await this.boatRepository.findById(boatId);
    if (!boat) throw new NotFoundException("Boat not found");

    boat.isAvailable = !boat.isAvailable;
    await boat.save();

    return boat;
  }

  async deleteBoat(boatId: string): Promise<{ message: string }> {
    const boat = await this.boatRepository.findById(boatId);
    if (!boat) throw new NotFoundException("Boat not found");

    await UploadService.deleteAllMediaFromDocument(boat);

    for (const pkg of boat.packages) {
      if (pkg.media?.length > 0) {
        await Promise.all(
          pkg.media.map(media => CloudinaryUtil.deleteFile(media.publicId))
        );
      }
    }

    await this.boatRepository.deleteOne({ _id: boatId });

    return { message: "Boat and all associated packages deleted successfully" };
  }

  async getBoats(
    filters: BoatFilters,
    pagination: Pagination
  ): Promise<{ data: Boat[]; total: number; page: number; limit: number }> {
    return this.boatRepository.getBoatsWithFilters(filters, pagination);
  }

  async getBoatById(boatId: string): Promise<Boat> {
    const boat = await this.boatRepository.findById(boatId);
    if (!boat) throw new NotFoundException("Boat not found");
    return boat;
  }

  async getAllPackages(pagination: Pagination) {
    return this.boatRepository.getAllPackages(pagination);
  }

  async updatePackage(
    boatId: string,
    packageId: string,
    packageData: Partial<CreatePackageInput>
  ): Promise<Boat> {
    const boat = await this.boatRepository.findById(boatId);
    if (!boat) throw new NotFoundException("Boat not found");

    const packagesWithId = boat.packages as unknown as PackageWithId[];
    const packageIndex = packagesWithId.findIndex(
      (pkg) => pkg._id.toString() === packageId
    );

    if (packageIndex === -1) {
      throw new NotFoundException("Package not found in this boat");
    }

    Object.assign(boat.packages[packageIndex], packageData);
    await boat.save();

    return boat;
  }

  async deletePackage(
    boatId: string,
    packageId: string
  ): Promise<{ message: string }> {
    const boat = await this.boatRepository.findById(boatId);
    if (!boat) throw new NotFoundException("Boat not found");

    const packagesWithId = boat.packages as unknown as PackageWithId[];
    const packageIndex = packagesWithId.findIndex(
      (pkg) => pkg._id.toString() === packageId
    );

    if (packageIndex === -1) {
      throw new NotFoundException("Package not found in this boat");
    }

    const packageToDelete = boat.packages[packageIndex];
    
    if (packageToDelete.media?.length > 0) {
      await Promise.all(
        packageToDelete.media.map(media => CloudinaryUtil.deleteFile(media.publicId))
      );
    }

    boat.packages.splice(packageIndex, 1);
    await boat.save();

    return { message: "Package deleted successfully" };
  }

  async getPackageById(boatId: string, packageId: string): Promise<BoatPackage> {
    const boat = await this.boatRepository.findById(boatId);
    if (!boat) throw new NotFoundException("Boat not found");

    const packagesWithId = boat.packages as unknown as PackageWithId[];
    const packageItem = packagesWithId.find(
      (pkg) => pkg._id.toString() === packageId
    );

    if (!packageItem) {
      throw new NotFoundException("Package not found in this boat");
    }

    return packageItem;
  }

  async getAllPackagesForBoat(boatId: string): Promise<BoatPackage[]> {
    const boat = await this.boatRepository.findById(boatId);
    if (!boat) throw new NotFoundException("Boat not found");

    return boat.packages;
  }

  async addMedia(
    boatId: string,
    mediaList: MediaItem[],
    packageId?: string
  ): Promise<Boat> {
    if (packageId) {
      return this.addMediaToPackage(boatId, packageId, mediaList);
    }
    return UploadService.addMultipleMediaToDocument(BoatModel, boatId, mediaList);
  }

  async deleteMedia(
    boatId: string,
    mediaId: string,
    packageId?: string
  ): Promise<{ message: string }> {
    if (packageId) {
      return this.deleteMediaFromPackage(boatId, packageId, mediaId);
    }
    return UploadService.deleteMediaFromDocument(BoatModel, boatId, mediaId);
  }

  private async getBoatWithPackage(boatId: string, packageId: string) {
    const boat = await this.boatRepository.findById(boatId);
    if (!boat) throw new NotFoundException("Boat not found");

    const packagesWithId = boat.packages as unknown as PackageWithId[];
    const packageItem = packagesWithId.find(
      (pkg) => pkg._id.toString() === packageId
    );

    if (!packageItem) {
      throw new NotFoundException("Package not found in this boat");
    }

    return { boat, packageItem };
  }

  private async addMediaToPackage(
    boatId: string,
    packageId: string,
    mediaList: MediaItem[]
  ): Promise<Boat> {
    const { boat, packageItem } = await this.getBoatWithPackage(boatId, packageId);
    
    packageItem.media.push(...mediaList);
    
    await boat.save();
    return boat;
  }

  private async deleteMediaFromPackage(
    boatId: string,
    packageId: string,
    mediaId: string
  ): Promise<{ message: string }> {
    const { boat, packageItem } = await this.getBoatWithPackage(boatId, packageId);

    const mediaWithId = packageItem.media as unknown as MediaItemWithId[];
    const mediaIndex = mediaWithId.findIndex(
      (m) => m._id.toString() === mediaId
    );

    if (mediaIndex === -1) {
      throw new NotFoundException("Media not found in package");
    }

    const mediaToDelete = packageItem.media[mediaIndex];
    await CloudinaryUtil.deleteFile(mediaToDelete.publicId);

    packageItem.media.splice(mediaIndex, 1);

    await boat.save();

    return { message: "Media deleted from package successfully" };
  }
}