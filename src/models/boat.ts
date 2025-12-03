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

const boatSchema = new Schema(
  {
    boatName: {
      type: String,
      required: true,
    },

    companyName: {
      type: String,
      required: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],

    pricePerHour: {
      type: Schema.Types.Decimal128,
      required: true,
      get: (v: any) => (v ? parseFloat(v.toString()) : null),
      index: true,
    },

    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
      index: true,
    },

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

boatSchema.pre("save", function (next) {
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

export type Boat = InferSchemaType<typeof boatSchema> & Document;

export const BoatModel = model<Boat>("Boat", boatSchema);