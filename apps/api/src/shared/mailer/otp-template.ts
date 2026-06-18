export function otpEmailText(otp: string): string {
  return [
    "OwnaFarm - Email Verification",
    "",
    "Thank you for registering with OwnaFarm. To complete your registration,",
    "please use the one-time verification code below:",
    "",
    `Verification Code: ${otp}`,
    "",
    "This code expires in 5 minutes.",
    "",
    "If you didn't request this, you can safely ignore this email.",
    "",
    "© 2026 OwnaFarm. All rights reserved.",
  ].join("\n");
}

export function otpEmailHtml(otp: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OwnaFarm - Email Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0"
          style="max-width:560px;width:100%;background-color:#ffffff;border-radius:8px;
                 overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#2E7D32;padding:32px 40px 28px;">
              <span style="font-size:26px;font-weight:700;color:#ffffff;
                           letter-spacing:1px;font-family:Arial,Helvetica,sans-serif;">
                OwnaFarm
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 24px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;
                         color:#1B5E20;font-family:Arial,Helvetica,sans-serif;">
                Email Verification
              </h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#444444;
                        font-family:Arial,Helvetica,sans-serif;">
                Thank you for registering with <strong>OwnaFarm</strong>. To complete your
                registration, please use the one-time verification code below.
              </p>

              <!-- OTP Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding:8px 0 28px;">
                    <div style="display:inline-block;background-color:#F1F8E9;
                                border:2px solid #A5D6A7;border-radius:8px;
                                padding:20px 40px;">
                      <span style="font-size:36px;font-weight:700;letter-spacing:10px;
                                   color:#2E7D32;font-family:'Courier New',Courier,monospace;">
                        ${otp}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#777777;text-align:center;
                        font-family:Arial,Helvetica,sans-serif;">
                This code expires in <strong>5 minutes</strong>.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #E8F5E9;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#999999;
                        font-family:Arial,Helvetica,sans-serif;">
                If you didn't request this, you can safely ignore this email.
              </p>
              <p style="margin:0;font-size:12px;color:#bbbbbb;
                        font-family:Arial,Helvetica,sans-serif;">
                &copy; 2026 OwnaFarm. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
