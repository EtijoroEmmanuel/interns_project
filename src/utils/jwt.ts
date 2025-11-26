import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import ErrorResponse from "./errorResponse";

export interface TokenPayload {
  userId: string;
  role: "user" | "admin";
  impersonatorId?: string;
  iat?: number;
}

export class JWTUtil {
  private static JWT_SECRET = env.AUTH?.JWT_SECRET;
  private static JWT_EXPIRES = env.AUTH?.JWT_EXPIRES;

  static generateToken(payload: TokenPayload): string {
    if (!this.JWT_SECRET) {
      throw new ErrorResponse(
        "JWT_SECRET is not defined in environment variables",
        500
      );
    }

    if (!this.JWT_EXPIRES) {
      throw new ErrorResponse(
        "JWT_EXPIRES is not defined properly in environment variables",
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
          throw new ErrorResponse("Token has expired", 401);
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
      throw new ErrorResponse("No token provided or invalid format", 401);
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || !parts[1]) {
      throw new ErrorResponse(
        "Bearer token missing in authorization header",
        401
      );
    }

    return parts[1];
  }

  static isTokenAboutToExpire(token: string): boolean {
    if (!token) return true;

    const decoded = jwt.decode(token) as JwtPayload | null;
    if (!decoded || !decoded.exp) return true;

    const expirationTime = decoded.exp * 1000;
    const oneHourFromNow = Date.now() + 60 * 60 * 1000;

    return expirationTime < oneHourFromNow;
  }
}
