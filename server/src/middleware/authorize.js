// ─── Authorize Middleware Factory ─────────────────────────────────────────────
// Returns a middleware function that checks whether the authenticated user's
// role is permitted to access the route.
//
// Usage:
//   router.get("/admin-only", authenticate, authorize("admin"), handler)
//   router.get("/shared",     authenticate, authorize("admin", "student"), handler)
//
// Must always be placed after authenticate in the middleware chain.
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // ── Missing req.user ───────────────────────────────────────────
    // Indicates authenticate middleware was not run before authorize.
    // Return 401 — the request is unauthenticated, not merely unauthorized.
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
      });
    }

    // ── Role not permitted ─────────────────────────────────────────
    // User is authenticated but does not hold a role that allows access.
    // Return 403 — authenticated but not authorized.
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission to do this.",
      });
    }

    next();
  };
};

export default authorize;
