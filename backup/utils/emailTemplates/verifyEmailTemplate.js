module.exports = (verificationUrl, userEmail) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Verify Your Email</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @media only screen and (max-width: 600px) {
        .container {
          width: 100% !important;
          padding: 20px !important;
        }
        .btn {
          width: 100% !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding: 30px 0;">
          <table align="center" class="container" width="600" style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <img src="https://yourdomain.com/logo.png" alt="Kanban App Logo" width="100" />
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 24px; font-weight: bold; color: #333333;">
                Verify Your Email Address
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 16px; color: #555555;">
                Hi <strong>${userEmail}</strong>,
                <br /><br />
                Thank you for registering on <strong>Kanban App</strong>. To complete your registration, please verify your email address by clicking the button below.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 20px 0;">
                <a href="${verificationUrl}" target="_blank" class="btn" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">
                  Verify Email
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 14px; color: #999999;">
                If you did not create this account, you can safely ignore this email.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 30px; font-size: 12px; color: #bbbbbb;">
                &copy; ${new Date().getFullYear()} Kanban App. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
