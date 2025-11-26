import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  emailParamSchema,
  verifyOtpSchema,
} from "../validators/user";


export interface AuthenticatedRequest extends Request {
  user?: { _id: string; role: string; email?: string };
}

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = signupSchema.validate(req.body, { abortEarly: false });
      if (error) {
        const message = error.details.map(d => d.message).join(", ");
        return res.status(400).json({ success: false, message });
      }

      const { phoneNumber, email, password, confirmPassword } = req.body;

      const { user, message: otpMessage } = await AuthService.signup({
        phoneNumber,
        email,
        password,
        confirmPassword,
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
      const { error } = loginSchema.validate(req.body, { abortEarly: false });
      if (error) {
        const message = error.details.map(d => d.message).join(", ");
        return res.status(400).json({ success: false, message });
      }

      const { email, password } = req.body;
      const { accessToken, user } = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: "Login successful",
        accessToken,
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

  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = verifyOtpSchema.validate(req.body);
      if (error) {
        const message = error.details.map(d => d.message).join(", ");
        return res.status(400).json({ success: false, message });
      }

      const { email, otp } = req.body;
      const message = await AuthService.verifyOtp(email, otp);

      res.status(200).json({ success: true, message });
    } catch (err) {
      next(err);
    }
  }

  static async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = emailParamSchema.validate(req.body);
      if (error) {
        const message = error.details.map(d => d.message).join(", ");
        return res.status(400).json({ success: false, message });
      }

      const { email } = req.body;
      const { message } = await AuthService.resendOtp(email);

      res.status(200).json({ success: true, message });
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = forgotPasswordSchema.validate(req.body);
      if (error) {
        const message = error.details.map(d => d.message).join(", ");
        return res.status(400).json({ success: false, message });
      }

      const { email } = req.body;
      const { message, resetToken } = await AuthService.forgotPassword(email);

      res.status(200).json({ success: true, message, resetToken });
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const { error } = resetPasswordSchema.validate(req.body);
      if (error) {
        const message = error.details.map(d => d.message).join(", ");
        return res.status(400).json({ success: false, message });
      }

      const { newPassword } = req.body;
      const message = await AuthService.resetPassword(token, newPassword);

      res.status(200).json({ success: true, message });
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { error } = changePasswordSchema.validate(req.body);
      if (error) {
        const message = error.details.map(d => d.message).join(", ");
        return res.status(400).json({ success: false, message });
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      const { currentPassword, newPassword } = req.body;
      const message = await AuthService.changePassword(req.user._id, currentPassword, newPassword);

      res.status(200).json({ success: true, message });
    } catch (err) {
      next(err);
    }
  }
}
