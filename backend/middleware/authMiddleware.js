const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/responseFormatter');

// Centralized JWT Verification Middleware (Phase 6)
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_key_123456');

      // Find user from unified User model (excluding password)
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return sendError(res, 'Not authorized, user profile not found', 401);
      }

      // Attach user data
      req.user = user;
      
      // Backward compatibility: attach customer object if user has Customer role
      if (user.role === 'Customer') {
        req.customer = user;
      }

      next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return sendError(res, 'Not authorized, token validation failed', 401);
    }
  }

  if (!token) {
    return sendError(res, 'Not authorized, no token provided', 401);
  }
};

// Guard middleware to ensure customer role only
const customerProtect = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.user && req.user.role === 'Customer') {
      next();
    } else {
      return sendError(res, 'Access denied, customer access required', 403);
    }
  });
};

// Guard middleware to ensure staff or admin role
const staffProtect = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.user && (req.user.role === 'Staff' || req.user.role === 'Admin')) {
      next();
    } else {
      return sendError(res, 'Access denied, staff authorization required', 403);
    }
  });
};

// Guard middleware to ensure admin-only access
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    return sendError(res, 'Access denied, admin authorization required', 403);
  }
};

module.exports = {
  protect,
  customerProtect,
  staffProtect,
  eitherProtect: protect, // Combined protect fits all roles
  adminOnly
};
