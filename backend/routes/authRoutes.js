import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';

const router = express.Router();

/**
 * Helper to set JWT cookie
 */
const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/**
 * Helper to generate JWT
 */
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Register Customer
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = new User({ name, email, password, role: 'customer' });
    await user.save();

    const token = generateToken(user._id, user.email, user.role);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      user: {
        id: user._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});

// Register Vendor
router.post('/register-vendor', async (req, res) => {
  try {
    const { name, email, password, storeName } = req.body;

    // Basic validation
    if (!name || !email || !password || !storeName) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and store name are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = new User({ name, email, password, role: 'vendor' });
    await user.save();

    const vendor = new Vendor({ userId: user._id, storeName });
    await vendor.save();

    const token = generateToken(user._id, user.email, user.role);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Vendor registered successfully',
      user: {
        id: user._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorId: vendor._id
      }
    });
  } catch (error) {
    console.error('Register vendor error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Vendor registration failed'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id, user.email, user.role);
    setTokenCookie(res, token);

    let vendorId = null;
    if (user.role === 'vendor') {
      const vendor = await Vendor.findOne({ userId: user._id });
      vendorId = vendor?._id || null;
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(vendorId && { vendorId })
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

export default router;
