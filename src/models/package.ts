import { Schema, model, InferSchemaType, Document } from "mongoose";
import { formatDate } from "../utils/date";

const mediaSchema = new Schema({
    url: {
        type: String,
        required: true,
    },

    publicId: {
        type: String,
        required: true,
    },

    type: {
        type: String,
        enum: ["image", "video"],
        required: true,
    },

    isPrimary: {
        type: Boolean,
        default: false,
    },
});

const specialOccasionBoatSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        type: {
            type: String,
            required: true,
            index: true,
        },

        description: {
            type: String,
            required: true,
        },

        features: [
            {
                type: String,
                trim: true,
            },
        ],

        media: {
            type: [mediaSchema],
            default: [],
        },

        date: {
            type: String,
            default: () => formatDate(new Date()),
        },
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true },
    }
);

specialOccasionBoatSchema.pre("save", function (next) {
    const primaryMedia = this.media.filter((m) => m.isPrimary);

    if (primaryMedia.length === 0 && this.media.length > 0) {
        this.media[0].isPrimary = true;
    } else if (primaryMedia.length > 1) {
        let foundFirst = false;

        this.media.forEach((item) => {
            if (item.isPrimary && !foundFirst) {
                foundFirst = true;
            } else if (item.isPrimary) {
                item.isPrimary = false;
            }
        });
    }

    next();
});

export type SpecialOccasionBoat = InferSchemaType<typeof specialOccasionBoatSchema> & Document;

export const SpecialOccasionBoatModel = model<SpecialOccasionBoat>(
    "SpecialOccasionBoat",
    specialOccasionBoatSchema
);