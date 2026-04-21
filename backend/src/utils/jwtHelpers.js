// src/utils/jwtHelpers.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Signs a JWT with userId and email payload.
 * @param {{ userId: string, email: string }} payload
 * @returns {string} signed JWT token
 */
export const signToken = ({ userId, email }) => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET not set in environment');
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifies and decodes a JWT.
 * @param {string} token
 * @returns {{ userId: string, email: string, iat: number, exp: number }}
 */
export const verifyToken = (token) => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET not set in environment');
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Sets JWT as an httpOnly cookie on the response.
 * @param {import('express').Response} res
 * @param {string} token
 */
export const setTokenCookie = (res, token) => {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * Clears the auth cookie.
 * @param {import('express').Response} res
 */
export const clearTokenCookie = (res) => {
  res.clearCookie('auth_token');
};
