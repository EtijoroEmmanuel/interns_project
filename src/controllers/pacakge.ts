import { Request, Response, NextFunction } from "express";
import { PackageService } from "../services/package";
import { Pagination } from "../types/boatTypes";
import { validate } from "../utils/validator";
import {
  createPackageSchema,
  addMediaSchema,
} from "../validators/boat";

interface PaginationQueryParams {
  page?: string;
  limit?: string;
}

export class PackageController {
  private packageService: PackageService;

  constructor() {
    this.packageService = new PackageService();
  }

  createPackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = validate(createPackageSchema, req.body);
      const packageData = await this.packageService.createPackage(validatedData);
      
      res.status(201).json({
        success: true,
        data: packageData,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllPackages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pagination = this.parsePagination(req.query as PaginationQueryParams);
      const result = await this.packageService.getAllPackages(pagination);
      
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  deletePackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.packageService.deletePackage(id);
      
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

      const packageData = await this.packageService.addMedia(id, mediaList);

      res.status(200).json({
        success: true,
        data: packageData,
        message: "Media added to package successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, mediaId } = req.params;
      const result = await this.packageService.deleteMedia(id, mediaId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  private parsePagination(query: PaginationQueryParams): Pagination {
    const { page, limit } = query;
    
    return {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    };
  }
}