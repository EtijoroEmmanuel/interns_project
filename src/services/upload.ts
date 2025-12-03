import { CloudinaryUtil } from "../utils/cloudinary";
import { NotFoundException } from "../utils/exception";
import { Model, Document, Types } from "mongoose";

interface MediaItem {
    url: string;
    publicId: string;
    type: "image" | "video";
    isPrimary?: boolean;
}

interface CloudinaryUploadData {
    secure_url: string;
    public_id: string;
    resource_type: string;
    width?: number;
    height?: number;
    isPrimary?: boolean;
}


interface DocumentWithMedia extends Document {
    media: Types.DocumentArray<MediaItem & { _id: Types.ObjectId }>;
}

export class UploadService {

    static generateUploadSignature() {
        return CloudinaryUtil.generatePresignedSignature();
    }


    static async addMediaToDocument<T extends DocumentWithMedia>(
        model: Model<T>,
        documentId: string,
        uploadData: CloudinaryUploadData
    ): Promise<T> {
        const document = await model.findById(documentId);
        if (!document) {
            throw new NotFoundException(`${model.modelName} not found`);
        }

        const { secure_url, public_id, resource_type, isPrimary } = uploadData;

        const mediaType = resource_type === "video" ? "video" : "image";

        if (isPrimary) {
            document.media.forEach((item: any) => {
                item.isPrimary = false;
            });
        }

        document.media.push({
            url: secure_url,
            publicId: public_id,
            type: mediaType,
            isPrimary: isPrimary || false,
        } as any);

        await document.save();
        return document;
    }


    static async addMultipleMediaToDocument<T extends DocumentWithMedia>(
        model: Model<T>,
        documentId: string,
        mediaList: MediaItem[]
    ): Promise<T> {
        const document = await model.findById(documentId);
        if (!document) {
            throw new NotFoundException(`${model.modelName} not found`);
        }

        const hasPrimary = mediaList.some((m) => m.isPrimary);
        if (hasPrimary) {
            document.media.forEach((item: any) => {
                item.isPrimary = false;
            });
        }

        document.media.push(...(mediaList as any));
        await document.save();
        return document;
    }

    static async deleteMediaFromDocument<T extends DocumentWithMedia>(
        model: Model<T>,
        documentId: string,
        mediaId: string
    ): Promise<{ message: string }> {
        const document = await model.findById(documentId);
        if (!document) {
            throw new NotFoundException(`${model.modelName} not found`);
        }

        const mediaItem = document.media.id(mediaId);
        if (!mediaItem) {
            throw new NotFoundException("Media not found");
        }


        await CloudinaryUtil.deleteFile(mediaItem.publicId);


        document.media.pull(mediaId);
        await document.save();

        return { message: "Media deleted successfully" };
    }

    static async deleteAllMediaFromDocument<T extends DocumentWithMedia>(
        document: T
    ): Promise<void> {
        for (const media of document.media) {
            await CloudinaryUtil.deleteFile(media.publicId);
        }
    }

    static async updatePrimaryMedia<T extends DocumentWithMedia>(
        model: Model<T>,
        documentId: string,
        mediaUrl: string
    ): Promise<T> {
        const document = await model.findById(documentId);
        if (!document) {
            throw new NotFoundException(`${model.modelName} not found`);
        }

        const mediaItem = document.media.find((m: any) => m.url === mediaUrl);
        if (!mediaItem) {
            throw new NotFoundException("Media not found");
        }

        document.media.forEach((m: any) => (m.isPrimary = false));
        mediaItem.isPrimary = true;

        await document.save();
        return document;
    }
}