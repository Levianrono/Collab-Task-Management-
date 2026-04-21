// src/routes/auth.js
import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, getMe, googleCallback } from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ─── Validation Rules ─────────────────────────────────────────────────────────
const registerRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Routes ───────────────────────────────────────────────────────────────────
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getMe);

// Google OAuth — Supabase handles the redirect; callback upserts the user
router.get('/google', (_req, res) => {
  const redirectUrl = `${process.env.SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${process.env.CLIENT_URL}/auth/callback`;
  res.redirect(redirectUrl);
});
router.get('/google/callback', googleCallback);

export default router;
