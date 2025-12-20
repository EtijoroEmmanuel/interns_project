import { Booking } from "../models/booking";
import { UserType } from "../models/user";
import { Boat } from "../models/boat";
import { Types } from "mongoose";

export interface PopulatedBooking extends Omit<Booking, "user" | "boat"> {
  _id: Types.ObjectId;
  user: UserType & { _id: Types.ObjectId; fullName: string; email: string };
  boat: Boat & { _id: Types.ObjectId; boatName: string };
}

export const welcomeEmailTemplate = ( email: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Boat Cruise</title>
</head>
<body style="margin:0; padding:0; background:#e6f4ff; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e6f4ff; padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; padding:25px; box-shadow:0 4px 15px rgba(0,0,0,0.08);">
        <tr><td align="center" style="padding-bottom:20px;">
          <h1 style="margin:0; color:#0d6efd;">🚢 Boat Cruise</h1>
        </td></tr>
        
        <tr><td align="center" style="padding:20px 0;">
          <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding:30px; border-radius:10px;">
            <h2 style="margin:0; color:#ffffff; font-size:28px;">Welcome Aboard!</h2>
          </div>
        </td></tr>

        <tr><td style="font-size:16px; color:#333; line-height:1.8; padding:20px 0;">
          <p>Hello <strong>${email}</strong>,</p>
          <p>Thank you for verifying your email! Your account is now active and you're all set to explore our amazing boat cruise experiences.</p>
          
          <div style="background:#f8f9fa; padding:20px; border-radius:8px; margin:20px 0;">
            <h3 style="color:#0d6efd; margin-top:0;">What's Next?</h3>
            <ul style="line-height:2; color:#555;">
              <li>🔍 Browse our fleet of luxury boats</li>
              <li>📅 Book your perfect cruise experience</li>
              <li>🎉 Create unforgettable memories on the water</li>
              <li>⭐ Enjoy exclusive member benefits</li>
            </ul>
          </div>

          <p style="margin:25px 0;">We're thrilled to have you join our community of water enthusiasts. Whether you're planning a romantic sunset cruise, a birthday celebration, or a corporate event, we have the perfect boat for every occasion.</p>

          <p style="margin-top:30px; color:#666; font-size:14px;">If you have any questions or need assistance, our support team is always here to help.</p>
        </td></tr>

        <tr><td align="center" style="font-size:12px; color:#777; padding-top:25px;">
          <p style="margin:5px 0;">© ${new Date().getFullYear()} Boat Cruise. All rights reserved.</p>
          <p style="margin:5px 0;">Smooth sailing ahead! ⚓</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

export const verifyOtpTemplate = (otp: string, email: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
</head>
<body style="margin:0; padding:0; background:#e6f4ff; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e6f4ff; padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; padding:25px; box-shadow:0 4px 15px rgba(0,0,0,0.08);">
        <tr><td align="center" style="padding-bottom:20px;">
          <h1 style="margin:0; color:#0d6efd;">Boat Cruise</h1>
        </td></tr>
        <tr><td style="font-size:16px; color:#333; line-height:1.6;">
          <p>Hello <strong>${email}</strong>,</p>
          <p>Thank you for registering with <strong>Boat Cruise</strong>. Use the verification code below to activate your account. It expires in 10 minutes.</p>
          <p style="margin:20px 0; text-align:center; font-size:24px; font-weight:bold; color:#0d6efd;">${otp}</p>
        </td></tr>
        <tr><td style="font-size:14px; color:#555; line-height:1.6; padding-bottom:10px;">
          <p>If you didn't request this, you can safely ignore this email.</p>
        </td></tr>
        <tr><td align="center" style="font-size:12px; color:#777; padding-top:25px;">
          © ${new Date().getFullYear()} Boat Cruise. All rights reserved.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

export const resetPasswordTemplate = (otp: string, email: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Password</title>
</head>
<body style="margin:0; padding:0; background:#e6f4ff; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e6f4ff; padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; padding:25px; box-shadow:0 4px 15px rgba(0,0,0,0.08);">
        <tr><td align="center" style="padding-bottom:20px;">
          <h1 style="margin:0; color:#0d6efd;">Boat Cruise</h1>
        </td></tr>
        <tr><td style="font-size:16px; color:#333; line-height:1.6;">
          <p>Hello <strong>${email}</strong>,</p>
          <p>We received a request to reset your password. Use the verification code below to continue:</p>
        </td></tr>
        <tr><td align="center" style="padding:25px 0;">
          <div style="background:#f8f9fa; border:2px dashed #0d6efd; padding:20px 40px; border-radius:8px; display:inline-block;">
            <span style="font-size:32px; font-weight:bold; color:#0d6efd; letter-spacing:8px; font-family:'Courier New', monospace;">${otp}</span>
          </div>
        </td></tr>
        <tr><td style="font-size:14px; color:#555; line-height:1.6; text-align:center;">
          <p style="margin:10px 0;"><strong>This code will expire in 10 minutes.</strong></p>
          <p style="margin:10px 0;">If you didn't request a password reset, please ignore this email.</p>
        </td></tr>
        <tr><td align="center" style="font-size:12px; color:#777; padding-top:25px; border-top:1px solid #eee; margin-top:20px;">
          <p style="margin:5px 0;">© ${new Date().getFullYear()} Boat Cruise. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

export const bookingAbandonedTemplate = (booking: PopulatedBooking): string => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #ffffff; }
    .details { background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h2>Booking Payment Not Completed</h2></div>
    <div class="content">
      <p>Hello ${booking.user.email},</p>
      <p>Your booking was not completed within the required time (1 hour) and has been automatically cancelled.</p>
      <div class="details">
        <h3>Booking Details:</h3>
        <p><strong>Booking ID:</strong> ${booking._id.toString()}</p>
        <p><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleString()}</p>
        <p><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleString()}</p>
        <p><strong>Number of Guests:</strong> ${booking.numberOfGuest}</p>
      </div>
      <p>You can create a new booking at any time. The time slot is now available for rebooking.</p>
      <p>If you have any questions, please contact us.</p>
      <p>Best regards,<br>Boat Cruise Team</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Boat Cruise. All rights reserved.</div>
  </div>
</body>
</html>
`;

export const bookingCancellationTemplate = (
  booking: PopulatedBooking,
  refundAmount: number,
  refundPercentage: number
): string => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #ffffff; }
    .details { background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .refund-info { background-color: #d4edda; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #28a745; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h2>Booking Cancellation Confirmed</h2></div>
    <div class="content">
      <p>Hello ${booking.user.email},</p>
      <p>Your booking has been successfully cancelled.</p>
      <div class="details">
        <h3>Booking Details:</h3>
        <p><strong>Booking ID:</strong> ${booking._id.toString()}</p>
        <p><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleString()}</p>
        <p><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleString()}</p>
        <p><strong>Original Amount:</strong> $${booking.totalPrice.toFixed(2)}</p>
      </div>
      <div class="refund-info">
        <h3>Refund Information:</h3>
        <p><strong>Refund Percentage:</strong> ${refundPercentage}%</p>
        <p><strong>Refund Amount:</strong> $${refundAmount.toFixed(2)}</p>
        <p><strong>Processing Time:</strong> 5-7 business days</p>
      </div>
      <p>The refund will be credited back to your original payment method within 5-7 business days.</p>
      <p>We hope to serve you again in the future!</p>
      <p>Best regards,<br>Boat Cruise Team</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Boat Cruise. All rights reserved.</div>
  </div>
</body>
</html>
`;

export const bookingConfirmationTemplate = (booking: PopulatedBooking): string => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #ffffff; }
    .details { background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .success { background-color: #d4edda; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #28a745; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h2>🎉 Booking Confirmed!</h2></div>
    <div class="content">
      <p>Hello ${booking.user.email},</p>
      <div class="success"><p><strong>Your booking has been confirmed and payment received!</strong></p></div>
      <div class="details">
        <h3>Booking Details:</h3>
        <p><strong>Booking ID:</strong> ${booking._id.toString()}</p>
        <p><strong>Boat:</strong> ${booking.boat.boatName}</p>
        <p><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleString()}</p>
        <p><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleString()}</p>
        <p><strong>Number of Guests:</strong> ${booking.numberOfGuest}</p>
        ${booking.occasion ? `<p><strong>Occasion:</strong> ${booking.occasion}</p>` : ""}
        <p><strong>Total Amount Paid:</strong> $${booking.totalPrice.toFixed(2)}</p>
      </div>
      <p><strong>Important Information:</strong></p>
      <ul>
        <li>You can cancel up to 24 hours before your booking for a 90% refund</li>
        <li>Cancellations less than 24 hours before will receive a 50% refund</li>
        <li>Please arrive 15 minutes before your scheduled time</li>
      </ul>
      <p>We look forward to providing you with an amazing experience!</p>
      <p>Best regards,<br>Boat Cruise Team</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Boat Cruise. All rights reserved.</div>
  </div>
</body>
</html>
`;

export const bookingCompletedTemplate = (booking: PopulatedBooking): string => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #ffffff; }
    .details { background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .highlight { background-color: #d4edda; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #28a745; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h2>🎊 Booking Completed!</h2></div>
    <div class="content">
      <p>Hello ${booking.user.email},</p>
      <div class="highlight"><p><strong>We hope you had an amazing experience!</strong></p></div>
      <p>Your boat cruise booking has been successfully completed. We hope you enjoyed your time on the water!</p>
      <div class="details">
        <h3>Booking Summary:</h3>
        <p><strong>Booking ID:</strong> ${booking._id.toString()}</p>
        <p><strong>Boat:</strong> ${booking.boat.boatName}</p>
        <p><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleString()}</p>
        <p><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleString()}</p>
        <p><strong>Number of Guests:</strong> ${booking.numberOfGuest}</p>
        ${booking.occasion ? `<p><strong>Occasion:</strong> ${booking.occasion}</p>` : ""}
        <p><strong>Total Amount:</strong> $${booking.totalPrice.toFixed(2)}</p>
      </div>
      <p><strong>We'd love your feedback!</strong> Please share your experience to help us improve our service.</p>
      <p>We look forward to serving you again in the future!</p>
      <p>Best regards,<br>Boat Cruise Team</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Boat Cruise. All rights reserved.</div>
  </div>
</body>
</html>
`;