import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import ErrorResponse from "./errorResponse";

export interface TokenPayload {
  userId: string;
  role: "user" | "admin";
  email: string;
  iat?: number;
  exp?: number;
}

export class JWTUtil {
  private static JWT_SECRET = env.AUTH?.JWT_SECRET;
  private static JWT_EXPIRES = env.AUTH?.JWT_EXPIRES;

  static generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    if (!this.JWT_SECRET) {
      throw new ErrorResponse(
        "JWT_SECRET is not defined in environment variables",
        500
      );
    }

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES as jwt.SignOptions["expiresIn"],
    });
  }

  static verifyToken(token: string): TokenPayload {
    if (!this.JWT_SECRET) {
      throw new ErrorResponse(
        "JWT_SECRET is not defined in environment variables",
        500
      );
    }

    try {
      const decoded = jwt.verify(token, this.JWT_SECRET);

      if (!decoded || typeof decoded !== "object") {
        throw new ErrorResponse("Invalid token payload", 401);
      }

      return decoded as TokenPayload;
    } catch (error: unknown) {
      if (error instanceof Error) {
        const name = (error as { name?: string }).name;

        if (name === "TokenExpiredError") {
          throw new ErrorResponse("Token has expired. Please login again.", 401);
        }

        if (name === "JsonWebTokenError") {
          throw new ErrorResponse("Invalid token", 401);
        }

        throw new ErrorResponse(
          error.message || "Token verification failed",
          401
        );
      }

      throw new ErrorResponse("Unknown token verification error", 500);
    }
  }

  static extractTokenFromHeader(authHeader: string | undefined): string {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ErrorResponse(
        "No token provided. Please login to access this resource.",
        401
      );
    }

    const parts = authHeader.split(" ").filter((part) => part.length > 0);

    if (parts.length !== 2 || !parts[1]) {
      throw new ErrorResponse(
        "Invalid authorization header format. Expected: Bearer <token>",
        401
      );
    }

    return parts[1];
  }

  static isTokenAboutToExpire(token: string): boolean {
    if (!token) return true;

    try {
      const decoded = jwt.decode(token) as JwtPayload | null;
      if (!decoded || !decoded.exp) return true;

      const expirationTime = decoded.exp * 1000;
      const oneHourFromNow = Date.now() + 60 * 60 * 1000;

      return expirationTime < oneHourFromNow;
    } catch {
      return true;
    }
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token);
      return decoded as TokenPayload | null;
    } catch {
      return null;
    }
  }
}