import { Request, Response, NextFunction } from "express";
import { UploadService } from "../services/upload";

export class UploadController {
  getUploadSignature = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signatureData = UploadService.generateUploadSignature();
      res.json(signatureData);
    } catch (error) {
      next(error);
    }
  };
}