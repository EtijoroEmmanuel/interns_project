import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth";
import { JWTUtil } from "../utils/jwt";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  emailParamSchema,
  verifyOtpSchema,
} from "../validators/user";
import { validate } from "../utils/validator";
import ErrorResponse from "../utils/errorResponse";

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const value = validate(signupSchema, req.body);
      const { phoneNumber, email, password } = value;

      const { user, message: otpMessage } = await AuthService.signup({
        phoneNumber,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        message: otpMessage,
        data: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          role: user.role,
          email: user.email,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const value = validate(loginSchema, req.body);
      const { email, password } = value;

      const { user } = await AuthService.login(email, password);

      const payload = {
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
      };

      const accessToken = JWTUtil.generateToken(payload);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          role: user.role,
          email: user.email,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const value = validate(verifyOtpSchema, req.body);
      const { email, otp } = value;

      const message = await AuthService.verifyOtp(email, otp);
      res.status(200).json({ success: true, message });
    } catch (err) {
      next(err);
    }
  }

  static async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const value = validate(emailParamSchema, req.body);
      const { email } = value;

      const { message } = await AuthService.resendOtp(email);
      res.status(200).json({ success: true, message });
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const value = validate(forgotPasswordSchema, req.body);
      const { email } = value;

      const { message } = await AuthService.forgotPassword(email);
      res.status(200).json({ success: true, message });
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const token = JWTUtil.extractTokenFromHeader(req.headers.authorization);

      const { newPassword } = validate(resetPasswordSchema, req.body);

      const message = await AuthService.resetPassword(token, newPassword);
      res.status(200).json({ success: true, message });
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new ErrorResponse("User not authenticated", 401));
      }

      const value = validate(changePasswordSchema, req.body);
      const { currentPassword, newPassword } = value;

      const message = await AuthService.changePassword(
        req.user._id.toString(),
        currentPassword,
        newPassword
      );

      res.status(200).json({ success: true, message });
    } catch (err) {
      next(err);
    }
  }
}
