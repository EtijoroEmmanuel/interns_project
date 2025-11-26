import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import ErrorResponse from "../utils/errorResponse";
import { ExtendedError } from "../interface";

function errorHandler(
  err: ErrorResponse | ExtendedError | any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(" [ERROR HANDLER]", err);

  if (err instanceof mongoose.Error.ValidationError) {
    const formattedErrors: Record<string, string> = {};
    for (const [key, value] of Object.entries(err.errors)) {
      formattedErrors[key] = (value as mongoose.Error.ValidatorError).message;
    }

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      statusCode: 400,
      errors: formattedErrors,
    });
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate field value: ${field}`,
      statusCode: 400,
      errors: { [field]: "Duplicate value entered" },
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
      statusCode: 400,
    });
  }

  if (err instanceof ErrorResponse) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    statusCode: 500,
  });
}

export default errorHandler;
