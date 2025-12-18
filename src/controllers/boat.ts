import { Request, Response, NextFunction } from "express";
import { BoatService } from "../services/boat";
import { BoatFilters, Pagination } from "../types/boatTypes";
import { validate } from "../utils/validator";
import {
  createBoatSchema,
  addMediaSchema,
  updateBoatSchema,
} from "../validators/boat";

interface BoatQueryParams {
  companyName?: string;
  boatType?: string;
  isAvailable?: string;
  capacityMin?: string;
  capacityMax?: string;
  priceMin?: string;
  priceMax?: string;
  boatName?: string;
}

interface PaginationQueryParams {
  page?: string;
  limit?: string;
}

export class BoatController {
  private boatService: BoatService;

  constructor() {
    this.boatService = new BoatService();
  }

  createBoat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = validate(createBoatSchema, req.body);
      const boat = await this.boatService.createBoat(validatedData);
      
      res.status(201).json({
        success: true,
        data: boat,
      });
    } catch (error) {
      next(error);
    }
  };

  getBoats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = this.parseBoatFilters(req.query as BoatQueryParams);
      const pagination = this.parsePagination(req.query as PaginationQueryParams);

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

  updateBoatDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const validatedData = validate(updateBoatSchema, req.body);
      const boat = await this.boatService.updateBoatDetails(id, validatedData);
      
      res.status(200).json({
        success: true,
        data: boat,
      });
    } catch (error) {
      next(error);
    }
  };

  toggleBoatAvailability = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const boat = await this.boatService.toggleBoatAvailability(id);
      
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

  addMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = validate(addMediaSchema, req.body);
      const { mediaList } = validatedData;

      const boat = await this.boatService.addMedia(id, mediaList);

      res.status(200).json({
        success: true,
        data: boat,
        message: "Media added to boat successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, mediaId } = req.params;
      const result = await this.boatService.deleteMedia(id, mediaId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  private parseBoatFilters(query: BoatQueryParams): BoatFilters {
    const {
      companyName,
      boatType,
      isAvailable,
      capacityMin,
      capacityMax,
      priceMin,
      priceMax,
      boatName,
    } = query;

    return {
      ...(companyName && { companyName }),
      ...(boatType && { boatType }),
      ...(isAvailable !== undefined && { 
        isAvailable: isAvailable === "true" 
      }),
      ...(capacityMin && { capacityMin: Number(capacityMin) }),
      ...(capacityMax && { capacityMax: Number(capacityMax) }),
      ...(priceMin && { priceMin: Number(priceMin) }),
      ...(priceMax && { priceMax: Number(priceMax) }),
      ...(boatName && { boatName }),
    };
  }

  private parsePagination(query: PaginationQueryParams): Pagination {
    const { page, limit } = query;
    
    return {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    };
  }
}