import jwt from 'jsonwebtoken';

/**
 * Generate JWT and set it in a secure HTTP-Only cookie
 * @param {string} userId - Mongo ObjectId of the user
 * @param {object} res - Express Response object
 * @returns {string} - Generated JWT token
 */
export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret_fallback_key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax', // 'none' enables cross-origin cookies between Vercel & Render
    secure: isProduction ? true : false, // HTTPS required for sameSite: 'none'
  });

  return token;
};
