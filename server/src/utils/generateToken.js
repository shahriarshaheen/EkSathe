import jwt from "jsonwebtoken";

// Signs and returns a JWT containing the user's id, role, and status.
// Payload is intentionally minimal — enough for middleware decisions
// without a DB roundtrip on every protected request.
//
// @param {Object} payload       - { id, role, status }
// @param {string} expiresIn     - Token lifetime (default: "7d")
// @returns {string}             - Signed JWT string
const generateToken = (payload, expiresIn = "7d") => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(
    {
      id: payload.id,
      role: payload.role,
      status: payload.status,
    },
    secret,
    { expiresIn },
  );
};

export default generateToken;
