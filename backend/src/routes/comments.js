// src/routes/comments.js
import { Router } from 'express';
import { deleteComment } from '../controllers/commentController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();

router.use(verifyToken);

// DELETE /api/comments/:id — delete own comment only
router.delete('/:id', deleteComment);

export default router;
