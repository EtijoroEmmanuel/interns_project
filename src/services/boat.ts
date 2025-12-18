import { BoatRepository } from "../repository/boat";
import { UploadService } from "./upload";
import { CloudinaryUtil } from "../utils/cloudinary";
import { NotFoundException } from "../utils/exception";
import { Boat, BoatModel } from "../models/boat";
import { 
  BoatFilters, 
  Pagination, 
  MediaItem, 
  CreateBoatInput,
  MediaItemWithId
} from "../types/boatTypes";

export class BoatService {
  private boatRepository: BoatRepository;

  constructor() {
    this.boatRepository = new BoatRepository();
  }

  async createBoat(
    data: Omit<CreateBoatInput, 'packages'> & Partial<Pick<CreateBoatInput, 'isAvailable' | 'media'>>
  ): Promise<Boat> {
    return this.boatRepository.create(data as Partial<Boat>);
  }

  async updateBoatDetails(boatId: string, data: Partial<Boat>): Promise<Boat> {
    const updated = await this.boatRepository.findByIdAndUpdate(boatId, data);
    if (!updated) throw new NotFoundException("Boat not found");
    return updated;
  }

  async toggleBoatAvailability(boatId: string): Promise<Boat> {
    const boat = await this.boatRepository.findById(boatId);
    if (!boat) throw new NotFoundException("Boat not found");

    const updated = await this.boatRepository.findByIdAndUpdate(boatId, {
      isAvailable: !boat.isAvailable
    });
    
    if (!updated) throw new NotFoundException("Boat not found");
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

  async addMedia(
    boatId: string,
    mediaList: MediaItem[]
  ): Promise<Boat> {
    return UploadService.addMultipleMediaToDocument(BoatModel, boatId, mediaList);
  }

  async deleteMedia(
    boatId: string,
    mediaId: string
  ): Promise<{ message: string }> {
    return UploadService.deleteMediaFromDocument(BoatModel, boatId, mediaId);
  }
}