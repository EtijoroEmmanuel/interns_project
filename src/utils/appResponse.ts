import { Response } from "express";

export function SuccessResponse(
  res: Response,
  data: unknown,
  message = "Request successful",
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}
