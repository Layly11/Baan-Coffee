import nodemailer from "nodemailer";

export const sendOtpEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,         // อีเมลของคุณ
      pass: process.env.SMTP_PASSWORD,      // App Password
    },
  });

  const mailOptions = {
    from: '"Baan Coffee" <no-reply@baancoffee.com>',
    to: email,
    subject: "Your OTP Code - Baan Coffee",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Verification Code</h2>
        <p>Use the following <strong>6-digit code</strong> to verify your email address:</p>
        <div style="font-size: 32px; font-weight: bold; margin: 20px 0; color: #3b5998;">${otp}</div>
        <p>This code is valid for the next 5 minutes.</p>
        <p style="margin-top: 40px;">Thank you,<br/>Baan Coffee ☕</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
