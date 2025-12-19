import { Types } from "mongoose";

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

export type MediaItemWithId = MediaItem & { _id: Types.ObjectId };