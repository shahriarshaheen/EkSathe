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

// ─── Send Carpool Join Notification ──────────────────────────────────────────
// @param {string} toEmail      - Driver's email address
// @param {string} driverName   - Driver's name
// @param {string} passengerName - Passenger who joined
// @param {object} route        - CarpoolRoute object
//
// Throws on SMTP failure — caller (controller) is responsible for catching.
export const sendCarpoolJoinEmail = async (toEmail, driverName, passengerName, route) => {
  const transporter = getTransporter();

  const departure = new Date(route.departureTime).toLocaleString("en-BD", {
    weekday: "long",
    month:   "long",
    day:     "numeric",
    hour:    "2-digit",
    minute:  "2-digit",
  });

  const seatsLeft = route.availableSeats;

  const html = emailWrapper(`
    <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">
      Someone joined your ride!
    </h1>

    <p style="font-size: 15px; color: #444444; margin: 0 0 24px; line-height: 1.6;">
      Hi ${driverName}, <strong>${passengerName}</strong> has joined your carpool ride.
    </p>

    <div style="
      background-color: #f0fdfa;
      border: 1px solid #99f6e4;
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 24px;
    ">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #888888; width: 120px;">Route</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">
            ${route.origin.area} &rarr; ${route.destination.area}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #888888;">From</td>
          <td style="padding: 6px 0; font-size: 14px; color: #1a1a1a;">${route.origin.name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #888888;">To</td>
          <td style="padding: 6px 0; font-size: 14px; color: #1a1a1a;">${route.destination.name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #888888;">Departure</td>
          <td style="padding: 6px 0; font-size: 14px; color: #1a1a1a;">${departure}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #888888;">Passenger</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0d9488;">${passengerName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #888888;">Seats left</td>
          <td style="padding: 6px 0; font-size: 14px; color: #1a1a1a;">${seatsLeft} of ${route.totalSeats}</td>
        </tr>
      </table>
    </div>

    ${seatsLeft === 0 ? `
    <div style="
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
    ">
      <p style="font-size: 13px; color: #dc2626; margin: 0; font-weight: 600;">
        Your ride is now full. No more passengers can join.
      </p>
    </div>
    ` : `
    <p style="font-size: 14px; color: #444444; margin: 0 0 24px; line-height: 1.6;">
      You still have <strong>${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""}</strong> available.
    </p>
    `}

    
      href="${process.env.CLIENT_URL}/dashboard/carpool/my-rides"
      style="
        display: inline-block;
        background-color: #0d9488;
        color: #ffffff;
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
        padding: 14px 28px;
        border-radius: 8px;
        margin-bottom: 28px;
      "
    >View My Rides</a>

    <p style="font-size: 13px; color: #888888; margin: 0; line-height: 1.6;">
      You received this email because someone joined your EkSathe carpool ride.
    </p>
  `);

  await transporter.sendMail({
    from:    `"EkSathe" <${process.env.EMAIL_USER}>`,
    to:      toEmail,
    subject: `${passengerName} joined your ride to ${route.destination.area}`,
    html,
  });
};