// src/controllers/authController.js
import { supabaseAdmin } from '../services/supabaseClient.js';
import { hashPassword, comparePassword } from '../utils/bcryptHelpers.js';
import { signToken, setTokenCookie, clearTokenCookie } from '../utils/jwtHelpers.js';

// ─── POST /api/auth/register ──────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;

    // Check for existing user
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const password_hash = await hashPassword(password);

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({ email, password_hash, full_name })
      .select('id, email, full_name, avatar_url, created_at')
      .single();

    if (error) throw error;

    const token = signToken({ userId: user.id, email: user.email });
    setTokenCookie(res, token);

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, avatar_url, password_hash, created_at')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken({ userId: user.id, email: user.email });
    setTokenCookie(res, token);

    // Don't return password_hash to client
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
export const logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ message: 'Logged out successfully.' });
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, avatar_url, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/google/callback ───────────────────────────────────────────
// Supabase Auth handles the OAuth exchange; this endpoint upserts the user
// into our custom `users` table and returns a JWT.
export const googleCallback = async (req, res, next) => {
  try {
    const { access_token } = req.query;

    if (!access_token) {
      return res.status(400).json({ error: 'Missing access token from OAuth provider.' });
    }

    // Use the access token to get the authenticated user from Supabase Auth
    const { supabase } = await import('../services/supabaseClient.js');
    const { data: { user: oauthUser }, error } = await supabase.auth.getUser(access_token);

    if (error || !oauthUser) {
      return res.status(401).json({ error: 'OAuth authentication failed.' });
    }

    // Upsert into our custom users table
    const { data: user, error: upsertError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: oauthUser.id,
        email: oauthUser.email,
        full_name: oauthUser.user_metadata?.full_name || oauthUser.email,
        avatar_url: oauthUser.user_metadata?.avatar_url || null,
      }, { onConflict: 'id' })
      .select('id, email, full_name, avatar_url, created_at')
      .single();

    if (upsertError) throw upsertError;

    const token = signToken({ userId: user.id, email: user.email });
    setTokenCookie(res, token);

    // Redirect to frontend with token in query (frontend stores it)
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (err) {
    next(err);
  }
};
