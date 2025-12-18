import Joi from "joi";

export const createBookingSchema = Joi.object({
  startDate: Joi.date().iso().required().messages({
    "date.base": "Invalid date format",
    "date.format": "Start date must be in ISO format",
    "any.required": "Start date is required",
  }),

  duration: Joi.number().positive().required().messages({
    "number.base": "Duration must be a number",
    "number.positive": "Duration must be a positive number",
    "any.required": "Duration is required",
  }),

  time: Joi.string().required().messages({
    "string.empty": "Time is required",
    "any.required": "Time is required",
  }),

  fullName: Joi.string().trim().required().messages({
    "string.empty": "Full name is required",
    "any.required": "Full name is required",
  }),

  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  phoneNumber: Joi.string().trim().required().messages({
    "string.empty": "Phone number is required",
    "any.required": "Phone number is required",
  }),

  numberOfGuest: Joi.number().integer().positive().required().messages({
    "number.base": "Number of guests must be a number",
    "number.integer": "Number of guests must be a whole number",
    "number.positive": "Number of guests must be at least 1",
    "any.required": "Number of guests is required",
  }),

  occasion: Joi.string().trim().optional().allow(""),

  specialRequest: Joi.string().trim().optional().allow(""),
});