import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {

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
            <div style="margin-top: 40px; font-size: 14px;">
      Cheers,<br/>
      <strong>Baan Coffee ☕</strong><br/>
      <span style="font-size: 12px; color: #999;">Generated on ${new Date().toLocaleString()}</span>
    </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};



export const sendResetPasswordEmail = async (email: string, otp: string) => {

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Reset your password",
    html: `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2 style="color: #6d2c91;">Reset Password</h2>
    <p>Use the following <strong>6-digit code</strong> to reset your password:</p>
    <div style="font-size: 32px; font-weight: bold; margin: 20px 0; color: #3b5998;">${otp}</div>
    <p>This OTP will expire in 5 minutes.</p>
    <div style="margin-top: 40px; font-size: 14px;">
      Cheers,<br/>
      <strong>Baan Coffee ☕</strong><br/>
      <span style="font-size: 12px; color: #999;">Generated on ${new Date().toLocaleString()}</span>
    </div>
  </div>
`,
  };

  return transporter.sendMail(mailOptions);
};

export const sendResetPasswordAdmin = async (email:any, resetLink: any) => {
  const mailOptions = {
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `<h3>Password Reset</h3>
             <p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link will expire in 15 minutes.</p>`,
    }

    return transporter.sendMail(mailOptions);
}
