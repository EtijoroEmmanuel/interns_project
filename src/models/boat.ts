import { Schema, model, InferSchemaType, Document } from "mongoose";

export const COMPANY_NAMES = [
  "lagoMarineService",
  "partyBoatLagos",
  "sunsetYachts",
] as const;

export const BOAT_TYPES = [
  "luxuryYacht",
  "speedboat",
  "sailboat",
  "partyBoat",
] as const;

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
      enum: COMPANY_NAMES,
      index: true,
    },
    boatType: {
      type: String,
      required: true,
      enum: BOAT_TYPES,
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
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    media: {
      type: [mediaSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

export type Media = InferSchemaType<typeof mediaSchema>;
export type Boat = InferSchemaType<typeof boatSchema> & Document;

export const BoatModel = model<Boat>("Boat", boatSchema);