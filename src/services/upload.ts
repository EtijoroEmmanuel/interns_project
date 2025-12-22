import { CloudinaryUtil } from "../utils/cloudinary";
import { NotFoundException, BadRequestException } from "../utils/exception";
import { Model, Document, Types } from "mongoose";
import { MediaItem, MediaItemWithId } from "../types/boatTypes";

interface CloudinaryUploadData {
    secure_url: string;
    public_id: string;
    resource_type: string;
    width?: number;
    height?: number;
    isPrimary?: boolean;
}

interface DocumentWithMedia extends Document {
    media: Types.DocumentArray<MediaItemWithId>;
}

export class UploadService {
    private static readonly MAX_MEDIA_UPLOADS = 10;

    static generateUploadSignature() {
        return CloudinaryUtil.generatePresignedSignature();
    }

    private static async getDocumentOrThrow<T extends DocumentWithMedia>(
        model: Model<T>,
        documentId: string
    ): Promise<T> {
        const document = await model.findById(documentId);
        if (!document) {
            throw new NotFoundException(`${model.modelName} not found`);
        }
        return document;
    }

    private static resetPrimaryMedia(mediaArray: Types.DocumentArray<MediaItemWithId>): void {
        mediaArray.forEach((item) => {
            item.isPrimary = false;
        });
    }

    static async addMediaToDocument<T extends DocumentWithMedia>(
        model: Model<T>,
        documentId: string,
        uploadData: CloudinaryUploadData
    ): Promise<T> {
        const document = await this.getDocumentOrThrow(model, documentId);

        const { secure_url, public_id, resource_type, isPrimary } = uploadData;
        const mediaType = resource_type === "video" ? "video" : "image";

        if (isPrimary) {
            this.resetPrimaryMedia(document.media);
        }

        const newMedia: Partial<MediaItemWithId> = {
            url: secure_url,
            publicId: public_id,
            type: mediaType,
            isPrimary: isPrimary || false,
        };

        document.media.push(newMedia as MediaItemWithId);
        await document.save();
        return document;
    }

    static async addMultipleMediaToDocument<T extends DocumentWithMedia>(
        model: Model<T>,
        documentId: string,
        mediaList: MediaItem[]
    ): Promise<T> {
        if (!Array.isArray(mediaList) || mediaList.length === 0) {
            throw new BadRequestException("Media list must be a non-empty array");
        }

        for (const media of mediaList) {
            if (!media.url || !media.publicId || !media.type) {
                throw new BadRequestException(
                    "Each media item must have url, publicId, and type"
                );
            }
        }

        const document = await this.getDocumentOrThrow(model, documentId);

        const primaryCount = mediaList.filter((m) => m.isPrimary).length;
        if (primaryCount > 1) {
            throw new BadRequestException("Only one media item can be marked as primary");
        }

        const hasPrimary = primaryCount === 1;
        if (hasPrimary) {
            this.resetPrimaryMedia(document.media);
        }

        const mediaToAdd = mediaList.map(media => ({
            ...media,
            isPrimary: media.isPrimary || false
        })) as MediaItemWithId[];

        document.media.push(...mediaToAdd);
        await document.save();
        return document;
    }

    static async deleteMediaFromDocument<T extends DocumentWithMedia>(
        model: Model<T>,
        documentId: string,
        mediaId: string
    ): Promise<{ message: string }> {
        const document = await this.getDocumentOrThrow(model, documentId);

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
        const document = await this.getDocumentOrThrow(model, documentId);

        const mediaItem = document.media.find((m) => m.url === mediaUrl);
        if (!mediaItem) {
            throw new NotFoundException("Media not found");
        }

        this.resetPrimaryMedia(document.media);
        mediaItem.isPrimary = true;

        await document.save();
        return document;
    }
}