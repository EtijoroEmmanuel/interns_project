import { Types } from "mongoose";
import { BoatPackage } from "../models/boat";

export interface BoatFilters {
  companyName?: string;
  boatType?: string;
  isAvailable?: boolean;
  capacityMin?: number;
  capacityMax?: number;
  priceMin?: number;
  priceMax?: number;
  boatName?: string;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface MediaItem {
  url: string;
  publicId: string;
  type: "image" | "video";
  isPrimary?: boolean;
}

export interface CreateBoatInput {
  boatName: string;
  companyName: string;
  boatType: string;
  description: string;
  location: string;
  capacity: number;
  amenities?: string[];
  pricePerHour: number;
  isAvailable?: boolean;
  media?: MediaItem[];
}

export interface CreatePackageInput {
  packageName: string;
  packageType: string;
  description: string;
  features?: string[];
  media?: MediaItem[];
}

export interface PackageWithBoatInfo {
  packageId: string;
  packageName: string;
  packageType: string;
  description: string;
  features?: string[];
  media: MediaItem[];
  date?: Date;
  boat: {
    _id: string;
    boatName: string;
    companyName: string;
    boatType: string;
    location: string;
    capacity: number;
    pricePerHour: number;
    amenities?: string[];
    isAvailable: boolean;
  };
}

export type MediaItemWithId = MediaItem & { _id: Types.ObjectId };
export type PackageWithId = BoatPackage & { _id: Types.ObjectId };