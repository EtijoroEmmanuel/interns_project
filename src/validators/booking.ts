import Joi from "joi";

export const createBookingSchema = Joi.object({
  boatId: Joi.string().required().messages({
    "string.empty": "Boat ID is required",
    "any.required": "Boat ID is required",
  }),

  startDate: Joi.date().iso().required().messages({
    "date.base": "Invalid start date format",
    "date.format": "Start date must be in ISO format",
    "any.required": "Start date is required",
  }),

  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required().messages({
    "date.base": "Invalid end date format",
    "date.format": "End date must be in ISO format",
    "date.greater": "End date must be after start date",
    "any.required": "End date is required",
  }),

  numberOfGuest: Joi.number().integer().positive().required().messages({
    "number.base": "Number of guests must be a number",
    "number.integer": "Number of guests must be a whole number",
    "number.positive": "Number of guests must be at least 1",
    "any.required": "Number of guests is required",
  }),

  occasion: Joi.string().trim().optional().allow("").messages({
    "string.base": "Occasion must be a string",
  }),

  specialRequest: Joi.string().trim().optional().allow("").messages({
    "string.base": "Special request must be a string",
  }),
});