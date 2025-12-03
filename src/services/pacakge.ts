import { SpecialOccasionBoatRepository } from "../repository/package";
import { UploadService } from "./upload";
import { NotFoundException, BadRequestException } from "../utils/exception";
import { SpecialOccasionBoat, SpecialOccasionBoatModel } from "../models/package";

interface MediaItem {
    url: string;
    publicId: string;
    type: "image" | "video";
    isPrimary?: boolean;
}

export class SpecialOccasionBoatService {
    private specialOccasionBoatRepository: SpecialOccasionBoatRepository;

    constructor() {
        this.specialOccasionBoatRepository = new SpecialOccasionBoatRepository();
    }

    async createSpecialOccasionBoat(
        data: Partial<SpecialOccasionBoat>
    ): Promise<SpecialOccasionBoat> {
        return this.specialOccasionBoatRepository.create(data);
    }

    async addMedia(
        boatId: string,
        mediaList: MediaItem[]
    ): Promise<SpecialOccasionBoat> {
        return UploadService.addMultipleMediaToDocument(
            SpecialOccasionBoatModel,
            boatId,
            mediaList
        );
    }

    async updatePrimaryMedia(
        boatId: string,
        mediaUrl: string
    ): Promise<SpecialOccasionBoat> {
        return UploadService.updatePrimaryMedia(
            SpecialOccasionBoatModel,
            boatId,
            mediaUrl
        );
    }

    async deleteMedia(
        boatId: string,
        mediaId: string
    ): Promise<{ message: string }> {
        return UploadService.deleteMediaFromDocument(
            SpecialOccasionBoatModel,
            boatId,
            mediaId
        );
    }

    async updateSpecialOccasionBoat(
        boatId: string,
        data: Partial<SpecialOccasionBoat>
    ): Promise<SpecialOccasionBoat> {
        const updated = await this.specialOccasionBoatRepository.findByIdAndUpdate(
            boatId,
            data
        );
        if (!updated) throw new NotFoundException("Special occasion boat not found");

        return updated;
    }

    async deleteSpecialOccasionBoat(
        boatId: string
    ): Promise<{ message: string }> {
        const boat = await this.specialOccasionBoatRepository.findById(boatId);
        if (!boat) throw new NotFoundException("Special occasion boat not found");

        await UploadService.deleteAllMediaFromDocument(boat);

        await this.specialOccasionBoatRepository.deleteOne({ _id: boatId });

        return { message: "Special occasion boat deleted successfully" };
    }

    async getSpecialOccasionBoatById(
        boatId: string
    ): Promise<SpecialOccasionBoat> {
        const boat = await this.specialOccasionBoatRepository.findById(boatId);
        if (!boat) throw new NotFoundException("Special occasion boat not found");

        return boat;
    }

    async getAllSpecialOccasionBoats(): Promise<SpecialOccasionBoat[]> {
        return this.specialOccasionBoatRepository.find();
    }
}