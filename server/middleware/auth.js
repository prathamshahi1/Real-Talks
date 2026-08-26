import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect private API routes
 * Verifies JWT token from cookies or Authorization Bearer header
 */
export const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    // Fallback: Check Authorization Header (Bearer <token>)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback_key');

    // Retrieve user without password
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication session expired. Please log in again.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication internal error: ' + error.message,
    });
  }
};
