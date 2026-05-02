import { randomInt } from "crypto";

// Returns a cryptographically random 6-digit string.
// Zero-padded to always be exactly 6 characters — e.g. "034521".
// Uses Node's crypto.randomInt instead of Math.random for unpredictability.
const generateOtp = () => {
  const otp = randomInt(0, 1_000_000); // 0 to 999999 inclusive
  return otp.toString().padStart(6, "0");
};

export default generateOtp;
