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
    <tr>
      <td align="center">

        <!-- Container -->
        <table width="600" cellpadding="0" cellspacing="0" 
          style="background:#ffffff; border-radius:12px; padding:25px; box-shadow:0 4px 15px rgba(0,0,0,0.08);">

          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h1 style="margin:0; color:#0d6efd;">Boat Cruise</h1>
            </td>
          </tr>

          <tr>
            <td style="font-size:16px; color:#333; line-height:1.6;">
              <p style="margin:0 0 10px;">Hello <strong>${email}</strong>,</p>
              <p style="margin:0 0 20px;">
                Thank you for registering with <strong>Boat Cruise</strong>.  
                Use the verification code below to activate your account. It expires in 10 minutes.
              </p>
              <p style="margin:20px 0; text-align:center; font-size:24px; font-weight:bold; color:#0d6efd;">
                ${otp}
              </p>
            </td>
          </tr>

          <tr>
            <td style="font-size:14px; color:#555; line-height:1.6; padding-bottom:10px;">
              <p>If you didn’t request this, you can safely ignore this email.</p>
            </td>
          </tr>

          <tr>
            <td align="center" style="font-size:12px; color:#777; padding-top:25px;">
              © ${new Date().getFullYear()} Boat Cruise. All rights reserved.
            </td>
          </tr>

        </table>
        <!-- End Container -->

      </td>
    </tr>
  </table>
</body>
</html>
`;

export const resetPasswordTemplate = (
  otp: string,
  email: string
): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Password</title>
</head>

<body style="margin:0; padding:0; background:#e6f4ff; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e6f4ff; padding:30px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" 
          style="background:#ffffff; border-radius:12px; padding:25px; box-shadow:0 4px 15px rgba(0,0,0,0.08);">

          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h1 style="margin:0; color:#0d6efd;">Boat Cruise</h1>
            </td>
          </tr>

          <tr>
            <td style="font-size:16px; color:#333; line-height:1.6;">
              <p>Hello <strong>${email}</strong>,</p>
              <p>We received a request to reset your password. Use the verification code below to continue:</p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:25px 0;">
              <div style="
                background:#f8f9fa;
                border:2px dashed #0d6efd;
                padding:20px 40px;
                border-radius:8px;
                display:inline-block;
              ">
                <span style="
                  font-size:32px;
                  font-weight:bold;
                  color:#0d6efd;
                  letter-spacing:8px;
                  font-family:'Courier New', monospace;
                ">
                  ${otp}
                </span>
              </div>
            </td>
          </tr>

          <tr>
            <td style="font-size:14px; color:#555; line-height:1.6; text-align:center;">
              <p style="margin:10px 0;"><strong>This code will expire in 10 minutes.</strong></p>
              <p style="margin:10px 0;">If you didn't request a password reset, please ignore this email.</p>
            </td>
          </tr>

          <tr>
            <td align="center" style="font-size:12px; color:#777; padding-top:25px; border-top:1px solid #eee; margin-top:20px;">
              <p style="margin:5px 0;">© ${new Date().getFullYear()} Boat Cruise. All rights reserved.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

