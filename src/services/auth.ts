import crypto from "crypto";
import { User, UserType, UserDocument } from "../models/user";
import { env } from "../config/env";
import { sendEmail } from "../utils/email";
import {
  resetPasswordTemplate,
  verifyOtpTemplate,
} from "../utils/emailTemplate";
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from "../utils/exception";
import { CryptoUtil } from "../utils/cryptoUtil";

export class AuthService {
  private static CLIENT_URL = env.APP.CLIENT;
  private static OTP_TTL_MS = 10 * 60 * 1000;
  private static MAX_OTP_ATTEMPTS = 5;

  private static generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private static hashOtp(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex");
  }

  static async signup(
    userData: Partial<UserType>
  ): Promise<{ user: UserDocument; message: string }> {
    const { password, email, ...rest } = userData;

    if (!password) throw new BadRequestException("Password is required");

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ConflictException("Email already in use");

    const hashedPassword = await CryptoUtil.hash(password);
    const otp = this.generateOtp();

    const user: UserDocument = await User.create({
      ...rest,
      email,
      password: hashedPassword,
      isVerified: false,
      emailVerificationOtp: this.hashOtp(otp),
      emailVerificationOtpExpires: new Date(Date.now() + this.OTP_TTL_MS),
      emailVerificationAttempts: 0,
    });

    await sendEmail({
      to: user.email,
      subject: "Your verification code",
      html: verifyOtpTemplate(otp, user.email),
    });

    return { user, message: "Account created. OTP sent to email." };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: UserDocument }> {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      throw new UnauthorizedException("Incorrect email or password");
    }

    const isMatch = await CryptoUtil.compare(password, user.password!);

    if (!isMatch) {
      throw new UnauthorizedException("Incorrect email or password");
    }

    if (!user.isVerified) {
      throw new ForbiddenException(
        "User not verified. Please check your email."
      );
    }

  return { user };
}
  static async verifyOtp(
    email: string,
    otp: string
  ): Promise<{ message: string }> {
    const user = await User.findOne({ email }).select(
      "+emailVerificationOtp +emailVerificationOtpExpires +emailVerificationAttempts"
    );
    
    if (!user) throw new NotFoundException("User not found");
    if (user.isVerified) return { message: "Email is already verified" };

    if (!user.emailVerificationOtp || !user.emailVerificationOtpExpires)
      throw new BadRequestException("No OTP found. Please request a new one.");

    if (user.emailVerificationOtpExpires.getTime() < Date.now()) {
      await User.findOneAndUpdate(
        { _id: user._id },
        {
          $unset: { 
            emailVerificationOtp: "",
            emailVerificationOtpExpires: ""
          },
          $set: { emailVerificationAttempts: 0 }
        }
      );
      throw new BadRequestException(
        "OTP has expired. Please request a new one."
      );
    }

    const attempts = (user.emailVerificationAttempts || 0) + 1;
    
    if (attempts > this.MAX_OTP_ATTEMPTS) {
      await User.findOneAndUpdate(
        { _id: user._id },
        {
          $unset: { 
            emailVerificationOtp: "",
            emailVerificationOtpExpires: ""
          },
          $set: { emailVerificationAttempts: 0 }
        }
      );
      throw new BadRequestException(
        "Too many attempts. OTP invalidated. Request a new one."
      );
    }

    const hashed = this.hashOtp(otp);
    if (hashed !== user.emailVerificationOtp) {
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: { emailVerificationAttempts: attempts } }
      );
      throw new BadRequestException("Invalid OTP");
    }

    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: { 
          isVerified: true,
          emailVerificationAttempts: 0
        },
        $unset: { 
          emailVerificationOtp: "",
          emailVerificationOtpExpires: ""
        }
      }
    );

    return { message: "Email verified successfully!" };
  }

  static async resendOtp(email: string): Promise<{ message: string }> {
    const user = await User.findOne({ email }).select(
      "+emailVerificationOtp +emailVerificationOtpExpires +emailVerificationAttempts"
    );
    if (!user) throw new NotFoundException("User not found");
    if (user.isVerified) return { message: "User is already verified" };

    const otp = this.generateOtp();
    
    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          emailVerificationOtp: this.hashOtp(otp),
          emailVerificationOtpExpires: new Date(Date.now() + this.OTP_TTL_MS),
          emailVerificationAttempts: 0
        }
      }
    );

    await sendEmail({
      to: user.email,
      subject: "Your verification code (resend)",
      html: verifyOtpTemplate(otp, user.email),
    });

    return { message: "Verification OTP resent successfully" };
  }

  static async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await User.findOne({ email });
    if (!user) throw new NotFoundException("User not found");

    const otp = this.generateOtp();
    
    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: this.hashOtp(otp),
          passwordResetExpires: new Date(Date.now() + this.OTP_TTL_MS),
          passwordResetAttempts: 0
        }
      }
    );

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: resetPasswordTemplate(otp, user.email),
    });

    return { message: "Password reset OTP sent to your email!" };
  }

  static async resetPassword(
    email: string,
    otp: string,
    password: string
  ): Promise<{ message: string }> {
    const hashedOtp = this.hashOtp(otp);
    
    const user = await User.findOne({
      email,
      passwordResetToken: hashedOtp,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires +passwordResetAttempts");
    
    if (!user) throw new BadRequestException("Invalid or expired OTP");

    const attempts = (user.passwordResetAttempts || 0) + 1;
    
    if (attempts > this.MAX_OTP_ATTEMPTS) {
      await User.findOneAndUpdate(
        { _id: user._id },
        {
          $unset: { 
            passwordResetToken: "",
            passwordResetExpires: ""
          },
          $set: { passwordResetAttempts: 0 }
        }
      );
      throw new BadRequestException(
        "Too many attempts. OTP invalidated. Request a new one."
      );
    }

    const hashedPassword = await CryptoUtil.hash(password);
    
    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          passwordResetAttempts: 0,
          passwordChangedAt: new Date()
        },
        $unset: { 
          passwordResetToken: "",
          passwordResetExpires: ""
        }
      }
    );

    return { message: "Password reset successfully!" };
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const user = await User.findById(userId).select("+password");
    if (!user) throw new BadRequestException("User not found");

    const isMatch = await CryptoUtil.compare(currentPassword, user.password!);
    if (!isMatch)
      throw new BadRequestException("Current password is incorrect");

    const hashedPassword = await CryptoUtil.hash(newPassword);
    
    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          passwordChangedAt: new Date()
        }
      }
    );

    return { message: "Password changed successfully!" };
  }
}