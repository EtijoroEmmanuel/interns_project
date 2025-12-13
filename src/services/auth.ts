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

    const user: UserDocument = await User.create({
      ...rest,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    const otp = this.generateOtp();
    user.emailVerificationOtp = this.hashOtp(otp);
    user.emailVerificationOtpExpires = new Date(Date.now() + this.OTP_TTL_MS);
    user.emailVerificationAttempts = 0;
    await user.save();

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
  userId: string,
  otp: string
): Promise<{ message: string }> {
  const user = await User.findById(userId).select(
    "+emailVerificationOtp +emailVerificationOtpExpires +emailVerificationAttempts"
  );
  
  if (!user) throw new NotFoundException("User not found");
  if (user.isVerified) return { message: "Email is already verified" };

  if (!user.emailVerificationOtp || !user.emailVerificationOtpExpires)
    throw new BadRequestException("No OTP found. Please request a new one.");

  if (user.emailVerificationOtpExpires.getTime() < Date.now()) {
    await User.updateOne(
      { _id: user._id },
      {
        $unset: { emailVerificationOtp: "", emailVerificationOtpExpires: "" },
        $set: { emailVerificationAttempts: 0 },
      }
    );
    throw new BadRequestException(
      "OTP has expired. Please request a new one."
    );
  }

  user.emailVerificationAttempts = (user.emailVerificationAttempts || 0) + 1;
  if (user.emailVerificationAttempts > this.MAX_OTP_ATTEMPTS) {
    await User.updateOne(
      { _id: user._id },
      {
        $unset: { emailVerificationOtp: "", emailVerificationOtpExpires: "" },
        $set: { emailVerificationAttempts: 0 },
      }
    );
    throw new BadRequestException(
      "Too many attempts. OTP invalidated. Request a new one."
    );
  }

  const hashed = this.hashOtp(otp);
  if (hashed !== user.emailVerificationOtp) {
    await user.save();
    throw new BadRequestException("Invalid OTP");
  }

  await User.updateOne(
    { _id: user._id },
    {
      $unset: { emailVerificationOtp: "", emailVerificationOtpExpires: "" },
      $set: { isVerified: true, emailVerificationAttempts: 0 },
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
    user.emailVerificationOtp = this.hashOtp(otp);
    user.emailVerificationOtpExpires = new Date(Date.now() + this.OTP_TTL_MS);
    user.emailVerificationAttempts = 0;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Your verification code (resend)",
      html: verifyOtpTemplate(otp, user.email),
    });

    return { message: "Verification OTP resent successfully" };
  }

  static async forgotPassword(
    email: string
  ): Promise<{ message: string }> {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new NotFoundException("User not found");

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = new Date(Date.now() + this.OTP_TTL_MS);

    await user.save();

    const resetLink = `${this.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "Reset Your Boat Cruise Password",
      html: resetPasswordTemplate(resetLink, user.email),
    });

    return { message: "Password reset email sent successfully!" };
  }
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) throw new BadRequestException("Token is invalid or has expired");

    const hashedPassword = await CryptoUtil.hash(newPassword);

    await User.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { passwordResetToken: "", passwordResetExpires: "" },
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

    user.password = await CryptoUtil.hash(newPassword);
    await user.save();

    return { message: "Password changed successfully!" };
  }
}
