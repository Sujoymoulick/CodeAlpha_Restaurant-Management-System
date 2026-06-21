const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

// Generate JWT token (Phase 5: Payload contains ID and Role, Expiry is 7 Days)
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'jwt_secret_key_123456',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user (Phase 3 & Phase 9)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 'User with this email already exists', 400);
    }

    // Save user (password hashing is handled automatically by User model pre-save hook)
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'Customer', // Defaults to Customer
      address
    });

    if (user) {
      const token = generateToken(user._id, user.role);
      return sendSuccess(res, 'Registration successful', {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address
        }
      }, 201);
    } else {
      return sendError(res, 'Invalid user data', 400);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token (Phase 3 & Phase 9)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 400);
    }

    // Find user (explicitly selecting password since it is select: false)
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id, user.role);
      
      // Send response supporting both the JSON root token field and full standard user data
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token, // Phase 3 direct output requirement
        data: {
          token,
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address
        }
      });
    } else {
      return sendError(res, 'Invalid email or password', 401);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile (Phase 9)
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    // req.user is populated by authMiddleware.js
    return sendSuccess(res, 'User profile retrieved successfully', req.user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (Phase 9)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    return sendSuccess(res, 'Profile updated successfully', {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      address: updatedUser.address
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
