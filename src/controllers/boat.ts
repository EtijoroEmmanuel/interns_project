import { Request, Response, NextFunction } from "express";
import { BoatService } from "../services/boat";
import { BadRequestException } from "../utils/exception";

export class BoatController {
  private boatService: BoatService;

  constructor() {
    this.boatService = new BoatService();
  }

  createBoat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const boat = await this.boatService.createBoat(req.body);
      res.status(201).json({
        success: true,
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

      const boat = await this.boatService.addMedia(id, [
        {
          url: secure_url,
          publicId: public_id,
          type: mediaType,
          isPrimary: isPrimary || false,
        },
      ]);

      res.status(200).json({
        success: true,
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
        throw new BadRequestException("mediaUrl is required");
      }

      const boat = await this.boatService.updatePrimaryMedia(id, mediaUrl);
      res.status(200).json({
        success: true,
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

      const result = await this.boatService.deleteMedia(id, mediaId);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  updateBoatDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      const allowedUpdates = [
        'boatName',
        'companyName',
        'description',
        'location',
        'capacity',
        'amenities',
        'pricePerHour',
        'status',
      ];

      const updateKeys = Object.keys(req.body);
      const isValidOperation = updateKeys.every((key) =>
        allowedUpdates.includes(key)
      );

      if (!isValidOperation) {
        const invalidFields = updateKeys.filter(
          (key) => !allowedUpdates.includes(key)
        );
        throw new BadRequestException(
          `Invalid fields: ${invalidFields.join(', ')}`
        );
      }

      if (updateKeys.length === 0) {
        throw new BadRequestException('No fields to update');
      }

      const updates: any = {};

      if (req.body.boatName !== undefined) {
        if (typeof req.body.boatName !== 'string' || req.body.boatName.trim().length === 0) {
          throw new BadRequestException('boatName must be a non-empty string');
        }
        updates.boatName = req.body.boatName.trim();
      }

      if (req.body.companyName !== undefined) {
        if (typeof req.body.companyName !== 'string' || req.body.companyName.trim().length === 0) {
          throw new BadRequestException('companyName must be a non-empty string');
        }
        updates.companyName = req.body.companyName.trim();
      }

      if (req.body.description !== undefined) {
        if (typeof req.body.description !== 'string' || req.body.description.trim().length === 0) {
          throw new BadRequestException('description must be a non-empty string');
        }
        updates.description = req.body.description.trim();
      }

      if (req.body.location !== undefined) {
        if (typeof req.body.location !== 'string' || req.body.location.trim().length === 0) {
          throw new BadRequestException('location must be a non-empty string');
        }
        updates.location = req.body.location.trim();
      }

      if (req.body.capacity !== undefined) {
        if (!Number.isInteger(req.body.capacity) || req.body.capacity < 1) {
          throw new BadRequestException('capacity must be a positive integer');
        }
        updates.capacity = req.body.capacity;
      }
      if (req.body.amenities !== undefined) {
        if (!Array.isArray(req.body.amenities)) {
          throw new BadRequestException('amenities must be an array');
        }

        const validAmenities = req.body.amenities.every(
          (amenity: any) => typeof amenity === 'string'
        );
        if (!validAmenities) {
          throw new BadRequestException('all amenities must be strings');
        }
        updates.amenities = req.body.amenities.map((a: string) => a.trim());
      }

      if (req.body.pricePerHour !== undefined) {
        const price = Number(req.body.pricePerHour);
        if (isNaN(price) || price <= 0) {
          throw new BadRequestException('pricePerHour must be a positive number');
        }
        updates.pricePerHour = price;
      }

      if (req.body.status !== undefined) {
        if (!['available', 'unavailable'].includes(req.body.status)) {
          throw new BadRequestException('status must be either "available" or "unavailable"');
        }
        updates.status = req.body.status;
      }

      const boat = await this.boatService.updateBoatDetails(id, updates);
      res.status(200).json({
        success: true,
        data: boat,
      });
    } catch (error) {
      next(error);
    }
  };

  toggleAvailability = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const boat = await this.boatService.toggleAvailability(id);
      res.status(200).json({
        success: true,
        data: boat,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteBoat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.boatService.deleteBoat(id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  getBoats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        companyName: req.query.companyName as string,
        status: req.query.status as "available" | "unavailable",
        capacityMin: req.query.capacityMin
          ? Number(req.query.capacityMin)
          : undefined,
        capacityMax: req.query.capacityMax
          ? Number(req.query.capacityMax)
          : undefined,
        priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
        priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
        boatName: req.query.boatName as string,
      };

      const pagination = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      const result = await this.boatService.getBoats(filters, pagination);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  getBoatById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const boat = await this.boatService.getBoatById(id);
      res.status(200).json({
        success: true,
        data: boat,
      });
    } catch (error) {
      next(error);
    }
  };
}