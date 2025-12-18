import { Schema, model, InferSchemaType, Document } from "mongoose";

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

const packageSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
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
export type Package = InferSchemaType<typeof packageSchema> & Document;

export const PackageModel = model<Package>("Package", packageSchema);