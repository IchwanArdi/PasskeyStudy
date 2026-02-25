import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for authentication
 * @param {string} userId - MongoDB user ID
 * @param {string} expiresIn - Token expiry duration (default: '7d')
 * @returns {string} JWT token
 */
export const generateToken = (userId, expiresIn = '7d') => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
};
