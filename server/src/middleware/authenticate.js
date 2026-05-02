import jwt from "jsonwebtoken";

// ─── Authenticate Middleware ──────────────────────────────────────────────────
// Reads and verifies a JWT from the Authorization header.
// Attaches the decoded payload to req.user on success.
// Expected header format: Authorization: Bearer <token>
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ── Missing header ───────────────────────────────────────────────
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  // ── Malformed header ─────────────────────────────────────────────
  // Must be exactly two parts: "Bearer" and the token string.
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Invalid token format.",
    });
  }

  const token = parts[1];

  // ── Verify token ─────────────────────────────────────────────────
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach only the fields generateToken placed in the payload.
    // Excludes jwt internals like iat and exp from req.user.
    req.user = {
      id: decoded.id,
      role: decoded.role,
      status: decoded.status,
    };

    next();
  } catch (error) {
    // Log the specific reason server-side for debugging.
    // Never send jwt error internals to the client.
    console.error("authenticate middleware error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Access denied. Token is invalid or has expired.",
    });
  }
};

export default authenticate;
