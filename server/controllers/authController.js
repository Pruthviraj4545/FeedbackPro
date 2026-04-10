const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper: sign JWT ──────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      rollNumber: user.rollNumber,
    },
  });
};

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
// ─── @access Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, rollNumber } = req.body;

    // Prevent self-signup as admin
    const safeRole = role === 'admin' ? 'student' : (role || 'student');

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: safeRole, department, rollNumber });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ─── @route  POST /api/auth/login ─────────────────────────────────────────────
// ─── @access Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
// ─── @access Private
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};
