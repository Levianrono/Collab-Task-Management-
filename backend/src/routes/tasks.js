// src/routes/tasks.js
import { Router } from 'express';
import { body, query } from 'express-validator';
import { getTasks, createTask, getTaskById, updateTask, deleteTask } from '../controllers/taskController.js';
import { getComments, addComment } from '../controllers/commentController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Apply auth middleware to all task routes
router.use(verifyToken);

// ─── Validation Rules ─────────────────────────────────────────────────────────
const createTaskRules = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('team_id').isUUID().withMessage('Valid team_id (UUID) is required'),
  body('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  body('deadline').optional().isISO8601().withMessage('Deadline must be a valid ISO date'),
];

const updateTaskRules = [
  body('title').optional().trim().notEmpty(),
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('deadline').optional().isISO8601(),
];

const addCommentRules = [
  body('content').trim().notEmpty().withMessage('Comment content is required'),
  body('attachment_url').optional().isURL().withMessage('attachment_url must be a valid URL'),
];

// ─── Task Routes ──────────────────────────────────────────────────────────────
router.get('/', getTasks);
router.post('/', createTaskRules, validate, createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTaskRules, validate, updateTask);
router.delete('/:id', deleteTask);

// ─── Nested Comment Routes ────────────────────────────────────────────────────
router.get('/:id/comments', getComments);
router.post('/:id/comments', addCommentRules, validate, addComment);

export default router;
