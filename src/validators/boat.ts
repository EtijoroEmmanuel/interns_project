import Joi from "joi";
import { COMPANY_NAMES, BOAT_TYPES } from "../models/boat";

const mediaItemSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    "string.empty": "url is required",
    "string.uri": "url must be a valid URL",
    "any.required": "url is required",
  }),
  publicId: Joi.string().required().messages({
    "string.empty": "publicId is required",
    "any.required": "publicId is required",
  }),
  type: Joi.string().valid("image", "video").required().messages({
    "any.only": 'type must be either "image" or "video"',
    "any.required": "type is required",
  }),
  isPrimary: Joi.boolean().default(false),
});

export const createPackageSchema = Joi.object({
  title: Joi.string().trim().min(1).required().messages({
    "string.empty": "title is required",
    "any.required": "title is required",
  }),
  description: Joi.string().trim().min(1).required().messages({
    "string.empty": "description is required",
    "any.required": "description is required",
  }),
  media: Joi.array().items(mediaItemSchema).default([]),
});

export const updatePackageSchema = Joi.object({
  title: Joi.string().trim().min(1).messages({
    "string.empty": "title must be a non-empty string",
  }),
  description: Joi.string().trim().min(1).messages({
    "string.empty": "description must be a non-empty string",
  }),
  media: Joi.array().items(mediaItemSchema).messages({
    "array.base": "media must be an array",
  }),
})
  .min(1)
  .messages({
    "object.min": "No fields to update",
  });

export const createBoatSchema = Joi.object({
  boatName: Joi.string().trim().min(1).required().messages({
    "string.empty": "boatName is required",
    "any.required": "boatName is required",
  }),
  companyName: Joi.string()
    .valid(...COMPANY_NAMES)
    .required()
    .messages({
      "any.only": `companyName must be one of: ${COMPANY_NAMES.join(", ")}`,
      "any.required": "companyName is required",
    }),
  boatType: Joi.string()
    .valid(...BOAT_TYPES)
    .required()
    .messages({
      "any.only": `boatType must be one of: ${BOAT_TYPES.join(", ")}`,
      "any.required": "boatType is required",
    }),
  description: Joi.string().trim().min(1).required().messages({
    "string.empty": "description is required",
    "any.required": "description is required",
  }),
  location: Joi.string().trim().min(1).required().messages({
    "string.empty": "location is required",
    "any.required": "location is required",
  }),
  capacity: Joi.number().integer().min(1).required().messages({
    "number.base": "capacity must be a number",
    "number.integer": "capacity must be an integer",
    "number.min": "capacity must be at least 1",
    "any.required": "capacity is required",
  }),
  amenities: Joi.array().items(Joi.string().trim()).default([]),
  pricePerHour: Joi.number().positive().required().messages({
    "number.base": "pricePerHour must be a number",
    "number.positive": "pricePerHour must be a positive number",
    "any.required": "pricePerHour is required",
  }),
  isAvailable: Joi.boolean().default(true),
  media: Joi.array().items(mediaItemSchema).default([]),
});

export const updateBoatSchema = Joi.object({
  boatName: Joi.string().trim().min(1).messages({
    "string.empty": "boatName must be a non-empty string",
  }),
  companyName: Joi.string()
    .valid(...COMPANY_NAMES)
    .messages({
      "any.only": `companyName must be one of: ${COMPANY_NAMES.join(", ")}`,
    }),
  boatType: Joi.string()
    .valid(...BOAT_TYPES)
    .messages({
      "any.only": `boatType must be one of: ${BOAT_TYPES.join(", ")}`,
    }),
  description: Joi.string().trim().min(1).messages({
    "string.empty": "description must be a non-empty string",
  }),
  location: Joi.string().trim().min(1).messages({
    "string.empty": "location must be a non-empty string",
  }),
  capacity: Joi.number().integer().min(1).messages({
    "number.base": "capacity must be a number",
    "number.integer": "capacity must be an integer",
    "number.min": "capacity must be a positive integer",
  }),
  amenities: Joi.array().items(Joi.string().trim()).messages({
    "array.base": "amenities must be an array",
  }),
  pricePerHour: Joi.number().positive().messages({
    "number.base": "pricePerHour must be a number",
    "number.positive": "pricePerHour must be positive",
  }),
  isAvailable: Joi.boolean().messages({
    "boolean.base": "isAvailable must be a boolean",
  }),
})
  .min(1)
  .messages({
    "object.min": "No fields to update",
  });

export const addMediaSchema = Joi.object({
  mediaList: Joi.array()
    .items(mediaItemSchema)
    .min(1)
    .max(5)
    .required()
    .messages({
      "array.min": "At least one media item is required",
      "array.max": "Cannot upload more than 5 media items at once",
      "any.required": "mediaList is required",
    }),
});

export const updatePrimaryMediaSchema = Joi.object({
  mediaUrl: Joi.string().uri().required().messages({
    "string.empty": "mediaUrl is required",
    "string.uri": "mediaUrl must be a valid URL",
    "any.required": "mediaUrl is required",
  }),
});