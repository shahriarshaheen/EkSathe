import { randomBytes } from "crypto";

// Returns a cryptographically secure random hex string for password reset links.
// 32 bytes = 64 hex characters = 256 bits of entropy.
// Safe for use in URL query parameters without additional encoding.
//
// Usage:
//   const token = generateResetToken();
//   Store token in DB → send as ?token=<token> in reset email link.
const generateResetToken = () => {
  return randomBytes(32).toString("hex");
};

export default generateResetToken;
