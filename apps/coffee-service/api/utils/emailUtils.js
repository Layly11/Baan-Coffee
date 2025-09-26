"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordAdmin = exports.sendResetPasswordEmail = exports.sendOtpEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(process.env.API_KEY_SEND_GRID);
const sendOtpEmail = async (email, otp) => {
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
        await mail_1.default.send(mailOptions);
        console.log("Email sent!");
    }
    catch (err) {
        console.error("SendGrid Error:", JSON.stringify(err.response?.body || err, null, 2));
    }
};
exports.sendOtpEmail = sendOtpEmail;
const sendResetPasswordEmail = async (email, otp) => {
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
        await mail_1.default.send(mailOptions);
        console.log("Email sent!");
    }
    catch (err) {
        console.error("SendGrid Error:", JSON.stringify(err.response?.body || err, null, 2));
    }
};
exports.sendResetPasswordEmail = sendResetPasswordEmail;
const sendResetPasswordAdmin = async (email, resetLink) => {
    const mailOptions = {
        from: `yelaysong15@gmail.com`,
        to: email,
        subject: "Reset your password",
        html: `<h3>Password Reset</h3>
             <p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link will expire in 15 minutes.</p>`,
    };
    try {
        await mail_1.default.send(mailOptions);
        console.log("Email sent!");
    }
    catch (err) {
        console.error("SendGrid Error:", JSON.stringify(err.response?.body || err, null, 2));
    }
};
exports.sendResetPasswordAdmin = sendResetPasswordAdmin;
//# sourceMappingURL=emailUtils.js.map