import { Request, Response, NextFunction } from "express";
import { User, UserRole, UserDocument } from "../models/user";
import ErrorResponse from "../utils/errorResponse";
import { JWTUtil } from "../utils/jwt";
import rateLimit from "express-rate-limit";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(
        new ErrorResponse("You are not logged in. Please log in.", 401)
      );
    }

    const token = JWTUtil.extractTokenFromHeader(authHeader);

    const decoded = JWTUtil.verifyToken(token);

    if (!decoded.userId) {
      return next(new ErrorResponse("Malformed authentication token.", 401));
    }

    const currentUser: UserDocument | null = await User.findById(
      decoded.userId
    );

    if (!currentUser) {
      return next(
        new ErrorResponse(
          "The user belonging to this token no longer exists.",
          401
        )
      );
    }

    if (decoded.iat && currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new ErrorResponse(
          "User recently changed password. Please log in again.",
          401
        )
      );
    }

    req.user = currentUser;

    next();
  } catch (error) {
    return next(
      new ErrorResponse(
        error instanceof Error ? error.message : "Authentication failed",
        401
      )
    );
  }
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
  
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(
        new ErrorResponse("You are not logged in. Please log in.", 401)
      );
    }

    const token = JWTUtil.extractTokenFromHeader(authHeader);

    const decoded = JWTUtil.verifyToken(token);

    if (!decoded.userId) {
      return next(new ErrorResponse("Malformed authentication token.", 401));
    }

    const currentUser: UserDocument | null = await User.findById(
      decoded.userId
    );

    if (!currentUser) {
      return next(
        new ErrorResponse(
          "The user belonging to this token no longer exists.",
          401
        )
      );
    }

    if (decoded.iat && currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new ErrorResponse(
          "User recently changed password. Please log in again.",
          401
        )
      );
    }

    req.user = currentUser;

    if (req.user.role !== UserRole.ADMIN) {
      return next(
        new ErrorResponse(
          "You do not have permission to perform this action.",
          403
        )
      );
    }

    next();
  } catch (error) {
    return next(
      new ErrorResponse(
        error instanceof Error ? error.message : "Authentication failed",
        401
      )
    );
  }
};

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many OTP attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});