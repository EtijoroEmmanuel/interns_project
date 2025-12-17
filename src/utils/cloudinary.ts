import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";
import ErrorResponse from "./errorResponse";

cloudinary.config({
  cloud_name: env.CLOUDINARY.CLOUD_NAME,
  api_key: env.CLOUDINARY.API_KEY,
  api_secret: env.CLOUDINARY.API_SECRET,
});

export interface PresignedSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  uploadPreset: string;
}

export class CloudinaryUtil {
  static generatePresignedSignature(): PresignedSignature {
    try {
      const timestamp = Math.floor(Date.now() / 1000);

      const signature = cloudinary.utils.api_sign_request(
        { timestamp },
        env.CLOUDINARY.API_SECRET
      );

      return {
        cloudName: env.CLOUDINARY.CLOUD_NAME,
        apiKey: env.CLOUDINARY.API_KEY,
        timestamp,
        signature,
        uploadPreset: env.CLOUDINARY.UPLOAD_PRESET,
      };
    } catch (error) {
      console.error('Cloudinary signature generation failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new ErrorResponse(
        `Failed to generate Cloudinary signature: ${errorMessage}`, 
        500
      );
    }
  }

  static async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary file deletion failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new ErrorResponse(
        `Failed to delete file from Cloudinary: ${errorMessage}`, 
        500
      );
    }
  }
}