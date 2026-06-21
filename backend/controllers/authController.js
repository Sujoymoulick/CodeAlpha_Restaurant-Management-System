const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'jwt_secret_key_123456', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (In production, usually admin-only)
const register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      return sendError(res, 'User already exists', 400);
    }

    const user = await User.create({
      username,
      password,
      role
    });

    if (user) {
      return sendSuccess(res, 'User registered successfully', {
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id)
      }, 201);
    } else {
      return sendError(res, 'Invalid user data', 400);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check for user, explicitly select password since it has select: false
    const user = await User.findOne({ username }).select('+password');

    if (user && (await user.matchPassword(password))) {
      return sendSuccess(res, 'Login successful', {
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      return sendError(res, 'Invalid username or password', 401);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    return sendSuccess(res, 'User details fetched successfully', req.user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
