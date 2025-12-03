import { BoatRepository } from "../repository/boat";
import { UploadService } from "./upload"
import { NotFoundException, BadRequestException } from "../utils/exception";
import { Boat, BoatModel } from "../models/boat";

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

const allowedFilterKeys: (keyof BoatFilters)[] = [
  "companyName",
  "status",
  "capacityMin",
  "capacityMax",
  "priceMin",
  "priceMax",
  "boatName",
];

function cleanFilters(input: Record<string, any>): BoatFilters {
  const result: BoatFilters = {};

  for (const key of allowedFilterKeys) {
    if (key in input && input[key] !== undefined && input[key] !== null) {
      result[key] = input[key];
    }
  }

  return result;
}

interface MediaItem {
  url: string;
  publicId: string;
  type: "image" | "video";
  isPrimary?: boolean;
}

export class BoatService {
  private boatRepository: BoatRepository;

  constructor() {
    this.boatRepository = new BoatRepository();
  }

  async createBoat(data: Partial<Boat>): Promise<Boat> {
    return this.boatRepository.create(data);
  }


  async addMedia(boatId: string, mediaList: MediaItem[]): Promise<Boat> {
    return UploadService.addMultipleMediaToDocument(
      BoatModel,
      boatId,
      mediaList
    );
  }

  async updatePrimaryMedia(boatId: string, mediaUrl: string): Promise<Boat> {
    return UploadService.updatePrimaryMedia(BoatModel, boatId, mediaUrl);
  }

  async deleteMedia(
    boatId: string,
    mediaId: string
  ): Promise<{ message: string }> {
    return UploadService.deleteMediaFromDocument(BoatModel, boatId, mediaId);
  }

  async updateBoatDetails(boatId: string, data: Partial<Boat>): Promise<Boat> {
    const updated = await this.boatRepository.findByIdAndUpdate(boatId, data);
    if (!updated) throw new NotFoundException("Boat not found");

    return updated;
  }

  async toggleAvailability(boatId: string): Promise<Boat> {
    const boat = await this.boatRepository.findById(boatId);
    if (!boat) throw new NotFoundException("Boat not found");

    const newStatus = boat.status === "available" ? "unavailable" : "available";

    const updated = await this.boatRepository.findByIdAndUpdate(boatId, {
      status: newStatus,
    });

    if (!updated) throw new NotFoundException("Boat not found after update");

    return updated;
  }

  async deleteBoat(boatId: string): Promise<{ message: string }> {
    const boat = await this.boatRepository.findById(boatId);
    if (!boat) throw new NotFoundException("Boat not found");


    await UploadService.deleteAllMediaFromDocument(boat);

    await this.boatRepository.deleteOne({ _id: boatId });

    return { message: "Boat deleted successfully" };
  }

  async getBoats(
    rawFilters: Record<string, any>,
    pagination: PaginationOptions
  ): Promise<{ data: Boat[]; total: number; page: number; limit: number }> {
    const filters = cleanFilters(rawFilters);
    return this.boatRepository.getBoatsWithFilters(filters, pagination);
  }

  async getBoatById(boatId: string): Promise<Boat> {
    const boat = await this.boatRepository.findById(boatId);
    if (!boat) throw new NotFoundException("Boat not found");

    return boat;
  }
}