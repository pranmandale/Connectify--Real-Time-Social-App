// utils/OtpTemplate.js
export const generateOtpHtml = (otp, userName = "User") => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>OTP Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f7;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }
          h2 {
            color: #333333;
          }
          .otp {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 4px;
            color: #2e86de;
            margin: 20px 0;
          }
          p {
            color: #555555;
            font-size: 15px;
          }
          .footer {
            margin-top: 30px;
            font-size: 13px;
            color: #888888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Hi ${userName},</h2>
          <p>Use the following One-Time Password (OTP) to complete your verification:</p>
          <div class="otp">${otp}</div>
          <p>This OTP will expire in <b>5 minutes</b>. Do not share it with anyone.</p>
          <div class="footer">
            <p>— The Connectify Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
