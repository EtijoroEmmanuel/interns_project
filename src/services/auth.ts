import crypto from "crypto";
import { User, UserType, UserDocument } from "../models/user";
import { env } from "../config/env";
import { sendEmail } from "../utils/email";
import {
  resetPasswordTemplate,
  verifyOtpTemplate,
  welcomeEmailTemplate,
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

    if (!password) {
      throw new BadRequestException("Password is required");
    }

    if (!email) {
      throw new BadRequestException("Email is required");
    }


    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException("Email already in use");
    }

 
    const hashedPassword = await CryptoUtil.hash(password);

    const otp = this.generateOtp();
    const hashedOtp = this.hashOtp(otp);

    const user: UserDocument = await User.create({
      ...rest,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false,
      emailVerificationOtp: hashedOtp,
      emailVerificationOtpExpires: new Date(Date.now() + this.OTP_TTL_MS),
      emailVerificationAttempts: 0,
    });


    await sendEmail({
      to: user.email,
      subject: "Verify Your Email - Boat Cruise",
      html: verifyOtpTemplate(otp, user.email),
    });

    return { 
      user, 
      message: "Account created successfully. Please check your email for verification code." 
    };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: UserDocument }> {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordValid = await CryptoUtil.compare(password, user.password!);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

  
    if (!user.isVerified) {
      throw new ForbiddenException(
        "Please verify your email before logging in. Check your inbox for the verification code."
      );
    }

    return { user };
  }

  static async verifyOtp(
    email: string,
    otp: string
  ): Promise<{ message: string }> {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+emailVerificationOtp +emailVerificationOtpExpires +emailVerificationAttempts"
    );

    if (!user) {
      throw new NotFoundException("User not found");
    }


    if (user.isVerified) {
      return { message: "Email is already verified. You can login now." };
    }

    if (!user.emailVerificationOtp || !user.emailVerificationOtpExpires) {
      throw new BadRequestException(
        "No verification code found. Please request a new one."
      );
    }

    if (user.emailVerificationOtpExpires.getTime() < Date.now()) {
      await User.findByIdAndUpdate(user._id, {
        $unset: {
          emailVerificationOtp: "",
          emailVerificationOtpExpires: "",
        },
        $set: { emailVerificationAttempts: 0 },
      });
      throw new BadRequestException(
        "Verification code has expired. Please request a new one."
      );
    }

    const attempts = (user.emailVerificationAttempts || 0) + 1;
    if (attempts > this.MAX_OTP_ATTEMPTS) {
      await User.findByIdAndUpdate(user._id, {
        $unset: {
          emailVerificationOtp: "",
          emailVerificationOtpExpires: "",
        },
        $set: { emailVerificationAttempts: 0 },
      });
      throw new BadRequestException(
        "Too many failed attempts. Verification code invalidated. Please request a new one."
      );
    }

    const hashedOtp = this.hashOtp(otp);
    if (hashedOtp !== user.emailVerificationOtp) {
      await User.findByIdAndUpdate(user._id, {
        $set: { emailVerificationAttempts: attempts },
      });
      throw new BadRequestException(
        `Invalid verification code. ${this.MAX_OTP_ATTEMPTS - attempts} attempts remaining.`
      );
    }

    await User.findByIdAndUpdate(user._id, {
      $set: {
        isVerified: true,
        emailVerificationAttempts: 0,
      },
      $unset: {
        emailVerificationOtp: "",
        emailVerificationOtpExpires: "",
      },
    });

    await sendEmail({
      to: user.email,
      subject: "Welcome to Boat Cruise! 🎉",
      html: welcomeEmailTemplate(user.email),
    });

    return { message: "Email verified successfully! You can now login." };
  }

  static async resendOtp(email: string): Promise<{ message: string }> {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+emailVerificationOtp +emailVerificationOtpExpires +emailVerificationAttempts"
    );

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const otp = this.generateOtp();
    const hashedOtp = this.hashOtp(otp);

    await User.findByIdAndUpdate(user._id, {
      $set: {
        emailVerificationOtp: hashedOtp,
        emailVerificationOtpExpires: new Date(Date.now() + this.OTP_TTL_MS),
        emailVerificationAttempts: 0,
      },
    });

    await sendEmail({
      to: user.email,
      subject: "Your New Verification Code - Boat Cruise",
      html: verifyOtpTemplate(otp, user.email),
    });

    return { message: "Verification code sent successfully. Please check your email." };
  }


  static async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      throw new NotFoundException("No account found with this email");
    }

    const otp = this.generateOtp();
    const hashedOtp = this.hashOtp(otp);

    await User.findByIdAndUpdate(user._id, {
      $set: {
        passwordResetToken: hashedOtp,
        passwordResetExpires: new Date(Date.now() + this.OTP_TTL_MS),
        passwordResetAttempts: 0,
      },
    });

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password - Boat Cruise",
      html: resetPasswordTemplate(otp, user.email),
    });

    return { message: "Password reset code sent to your email." };
  }

  static async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const hashedOtp = this.hashOtp(otp);

    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetToken: hashedOtp,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires +passwordResetAttempts");

    if (!user) {
      throw new BadRequestException("Invalid or expired reset code");
    }

    const attempts = (user.passwordResetAttempts || 0) + 1;
    if (attempts > this.MAX_OTP_ATTEMPTS) {
      await User.findByIdAndUpdate(user._id, {
        $unset: {
          passwordResetToken: "",
          passwordResetExpires: "",
        },
        $set: { passwordResetAttempts: 0 },
      });
      throw new BadRequestException(
        "Too many failed attempts. Reset code invalidated. Please request a new one."
      );
    }

    const hashedPassword = await CryptoUtil.hash(newPassword);

    await User.findByIdAndUpdate(user._id, {
      $set: {
        password: hashedPassword,
        passwordResetAttempts: 0,
        passwordChangedAt: new Date(),
      },
      $unset: {
        passwordResetToken: "",
        passwordResetExpires: "",
      },
    });

    return { message: "Password reset successfully! You can now login with your new password." };
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const user = await User.findById(userId).select("+password");
    
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isPasswordValid = await CryptoUtil.compare(
      currentPassword,
      user.password!
    );

    if (!isPasswordValid) {
      throw new BadRequestException("Current password is incorrect");
    }

    const hashedPassword = await CryptoUtil.hash(newPassword);

    await User.findByIdAndUpdate(user._id, {
      $set: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    return { message: "Password changed successfully!" };
  }
}