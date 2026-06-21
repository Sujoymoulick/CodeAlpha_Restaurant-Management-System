const { sendError } = require('../utils/responseFormatter');

/**
 * Role-Based Authorization Agent Middleware (Phase 7)
 * Restricts access to specific user roles.
 * Admins are automatically granted access to all routes (Full Access).
 * 
 * @param  {...string} allowedRoles - Roles allowed to access the route ('Customer', 'Staff', 'Admin')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Access denied, user authentication required', 401);
    }

    // Admin has full access to all system features
    if (req.user.role === 'Admin') {
      return next();
    }

    // Check if the user's role is specifically authorized
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return sendError(res, `Access denied, role '${req.user.role}' is not authorized to access this route`, 403);
  };
};

module.exports = {
  authorize
};
