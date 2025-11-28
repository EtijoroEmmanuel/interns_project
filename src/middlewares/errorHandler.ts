import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(" [ERROR HANDLER]", err);

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map(
      (e) => (e as mongoose.Error.ValidatorError).message
    );

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      statusCode: 400,
      errors,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message;

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
};
