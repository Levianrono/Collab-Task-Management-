// src/middleware/validate.js
import { validationResult } from 'express-validator';

/**
 * Runs express-validator rules and short-circuits with 422 if any fail.
 * Usage: router.post('/path', [...rules], validate, controller)
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};
