// src/middleware/verifyToken.js
import { verifyToken as decodeToken } from '../utils/jwtHelpers.js';

/**
 * Express middleware that verifies JWT from httpOnly cookie or Authorization header.
 * Attaches decoded payload to req.user = { userId, email }
 */
export const verifyToken = (req, res, next) => {
  try {
    // Try cookie first, then fallback to Authorization Bearer header
    const token =
      req.cookies?.auth_token ||
      req.headers?.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = decodeToken(token);
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};
