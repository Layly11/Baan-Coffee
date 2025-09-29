import nodemailer from "nodemailer";
import sgMail from '@sendgrid/mail'


sgMail.setApiKey(process.env.API_KEY_SEND_GRID!);



export const sendOtpEmail = async (email: string, otp: string) => {

  const mailOptions = {
    from: 'yelaysong15@gmail.com',
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

  try {
    await sgMail.send(mailOptions);
    console.log("Email sent!");
  } catch (err: any) {
    console.error("SendGrid Error:", JSON.stringify(err.response?.body || err, null, 2));
  }
};



export const sendResetPasswordEmail = async (email: string, otp: string) => {

  const mailOptions = {
    from: 'yelaysong15@gmail.com',
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
  try {
    await sgMail.send(mailOptions);
    console.log("Email sent!");
  } catch (err: any) {
    console.error("SendGrid Error:", JSON.stringify(err.response?.body || err, null, 2));
  }
};

export const sendResetPasswordAdmin = async (email: any, resetLink: any) => {
  console.log("resetPassword: ", resetLink)
  const mailOptions = {
    from: `yelaysong15@gmail.com`,
    to: email,
    subject: "Reset your password",
    html: `<h3>Password Reset</h3>
             <p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link will expire in 15 minutes.</p>`,
  }

  try {
    await sgMail.send(mailOptions);
    console.log("Email sent!");
  } catch (err: any) {
    console.error("SendGrid Error:", JSON.stringify(err.response?.body || err, null, 2));
  }
}
