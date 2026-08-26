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
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true, // Shields against XSS attacks (JS cannot read cookie)
    sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    secure: isProduction, // HTTPS only in production
  });

  return token;
};
