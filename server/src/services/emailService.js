import nodemailer from "nodemailer";

// ─── Transporter ──────────────────────────────────────────────────────────────
// Created lazily inside a getter so environment variables are read at call
// time — not at module parse time — ensuring dotenv is always loaded first.
const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      "EMAIL_USER and EMAIL_PASS must be defined in environment variables",
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

// ─── Shared Email Styles ──────────────────────────────────────────────────────
// Inline styles only — external CSS is stripped by most email clients.
const emailWrapper = (content) => `
  <div style="
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 520px;
    margin: 0 auto;
    padding: 40px 24px;
    color: #1a1a1a;
    background-color: #ffffff;
  ">
    <div style="margin-bottom: 32px;">
      <span style="
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.3px;
        color: #1a1a1a;
      ">EkSathe</span>
    </div>

    ${content}

    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />

    <p style="font-size: 12px; color: #888888; margin: 0;">
      This is an automated message from EkSathe. Please do not reply to this email.
    </p>
  </div>
`;

// ─── Send OTP Email ───────────────────────────────────────────────────────────
// @param {string} toEmail   - Recipient email address
// @param {string} otp       - 6-digit OTP string
//
// Throws on SMTP failure — caller (controller) is responsible for catching.
export const sendOtpEmail = async (toEmail, otp) => {
  const transporter = getTransporter();

  const html = emailWrapper(`
    <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">
      Verify your email
    </h1>

    <p style="font-size: 15px; color: #444444; margin: 0 0 28px; line-height: 1.6;">
      Use the code below to complete your EkSathe registration.
      This code expires in <strong>1 hour</strong>.
    </p>

    <div style="
      display: inline-block;
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 18px 36px;
      margin-bottom: 28px;
    ">
      <span style="
        font-size: 36px;
        font-weight: 700;
        letter-spacing: 8px;
        color: #1a1a1a;
      ">${otp}</span>
    </div>

    <p style="font-size: 13px; color: #888888; margin: 0; line-height: 1.6;">
      If you did not create an EkSathe account, you can safely ignore this email.
    </p>
  `);

  await transporter.sendMail({
    from: `"EkSathe" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your EkSathe verification code",
    html,
  });
};

// ─── Send Password Reset Email ────────────────────────────────────────────────
// @param {string} toEmail    - Recipient email address
// @param {string} resetUrl   - Full password reset URL with token query param
//                              Built by the controller, not this service.
//
// Throws on SMTP failure — caller (controller) is responsible for catching.
export const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  const transporter = getTransporter();

  const html = emailWrapper(`
    <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">
      Reset your password
    </h1>

    <p style="font-size: 15px; color: #444444; margin: 0 0 28px; line-height: 1.6;">
      We received a request to reset the password for your EkSathe account.
      Click the button below to choose a new password.
      This link expires in <strong>1 hour</strong>.
    </p>

    <a
      href="${resetUrl}"
      style="
        display: inline-block;
        background-color: #1a1a1a;
        color: #ffffff;
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
        padding: 14px 28px;
        border-radius: 8px;
        margin-bottom: 28px;
      "
    >Reset password</a>

    <p style="font-size: 13px; color: #888888; margin: 0; line-height: 1.6;">
      If you did not request a password reset, you can safely ignore this email.
      Your password will not be changed.
    </p>
  `);

  await transporter.sendMail({
    from: `"EkSathe" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your EkSathe password",
    html,
  });
};
