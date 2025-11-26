import { Request, Response, NextFunction } from "express";
import { User, UserRole, UserDocument } from "../models/user";
import ErrorResponse from "../utils/errorResponse";
import { JWTUtil } from "../utils/jwt";
import rateLimit from "express-rate-limit";

export type UserDocumentWithMethods = UserDocument & {
  changedPasswordAfter: (JWTTimestamp: number) => boolean;
};

export interface AuthenticatedRequest extends Request {
  user?: UserDocumentWithMethods;
}

export const formatDate = (date: Date): string =>
  new Date(date).toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

export const protect = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new ErrorResponse(
          "You are not logged in. Please log in to continue.",
          401
        )
      );
    }

    const decoded = JWTUtil.verifyToken(token);

    if (!decoded.userId) {
      return next(new ErrorResponse("Malformed authentication token.", 401));
    }

    const currentUser = await User.findById(decoded.userId);
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

export const isAdmin = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new ErrorResponse("Not authenticated. Please log in.", 401));
  }

  if (req.user.role !== UserRole.ADMIN) {
    return next(
      new ErrorResponse(
        "You do not have permission to perform this action.",
        403
      )
    );
  }

  next();
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
