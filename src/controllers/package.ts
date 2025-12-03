import { Request, Response, NextFunction } from "express";
import { SpecialOccasionBoatService } from "../services/pacakge";
import {
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from "../utils/exception";

export class SpecialOccasionBoatController {
    private specialOccasionBoatService: SpecialOccasionBoatService;

    constructor() {
        this.specialOccasionBoatService = new SpecialOccasionBoatService();
    }

    createSpecialOccasionBoat = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const boat = await this.specialOccasionBoatService.createSpecialOccasionBoat(
                req.body
            );

            res.status(201).json({
                success: true,
                message: "Special occasion boat created successfully",
                data: boat,
            });
        } catch (error) {
            next(error);
        }
    };

    addMedia = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { secure_url, public_id, resource_type, width, height, isPrimary } = req.body;

            if (!secure_url || !public_id || !resource_type) {
                throw new BadRequestException("Missing required fields: secure_url, public_id, resource_type");
            }

            const mediaType = resource_type === "video" ? "video" : "image";

            const boat = await this.specialOccasionBoatService.addMedia(id, [
                {
                    url: secure_url,
                    publicId: public_id,
                    type: mediaType,
                    isPrimary: isPrimary || false,
                },
            ]);

            res.status(200).json({
                success: true,
                message: "Media added successfully",
                data: boat,
            });
        } catch (error) {
            next(error);
        }
    };

    updatePrimaryMedia = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { id } = req.params;
            const { mediaUrl } = req.body;

            if (!mediaUrl) {
                throw new BadRequestException("Media URL is required");
            }

            const boat = await this.specialOccasionBoatService.updatePrimaryMedia(
                id,
                mediaUrl
            );

            res.status(200).json({
                success: true,
                message: "Primary media updated successfully",
                data: boat,
            });
        } catch (error) {
            next(error);
        }
    };
    
    deleteMedia = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, mediaId } = req.params;

            if (!mediaId) {
                throw new BadRequestException("mediaId is required");
            }

            const result = await this.specialOccasionBoatService.deleteMedia(
                id,
                mediaId
            );

            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    };

    updateSpecialOccasionBoat = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { id } = req.params;

            const boat = await this.specialOccasionBoatService.updateSpecialOccasionBoat(
                id,
                req.body
            );

            res.status(200).json({
                success: true,
                message: "Special occasion boat updated successfully",
                data: boat,
            });
        } catch (error) {
            next(error);
        }
    };

    deleteSpecialOccasionBoat = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { id } = req.params;

            const result = await this.specialOccasionBoatService.deleteSpecialOccasionBoat(
                id
            );

            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    };

    getAllSpecialOccasionBoats = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const boats = await this.specialOccasionBoatService.getAllSpecialOccasionBoats();

            res.status(200).json({
                success: true,
                message: "Special occasion boats retrieved successfully",
                data: boats,
            });
        } catch (error) {
            next(error);
        }
    };

    getSpecialOccasionBoatById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { id } = req.params;

            const boat = await this.specialOccasionBoatService.getSpecialOccasionBoatById(
                id
            );

            res.status(200).json({
                success: true,
                message: "Special occasion boat retrieved successfully",
                data: boat,
            });
        } catch (error) {
            next(error);
        }
    };
}