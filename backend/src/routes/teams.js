// src/routes/teams.js
import { Router } from 'express';
import { body } from 'express-validator';
import {
  createTeam, getMyTeams, inviteMember,
  getMembers, updateMemberRole, removeMember,
} from '../controllers/teamController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(verifyToken);

// ─── Validation Rules ─────────────────────────────────────────────────────────
const createTeamRules = [
  body('name').trim().notEmpty().withMessage('Team name is required'),
];

const inviteRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['admin', 'editor', 'viewer']).withMessage('Invalid role'),
];

const roleRules = [
  body('role').isIn(['admin', 'editor', 'viewer']).withMessage('Role must be admin, editor, or viewer'),
];

// ─── Routes ───────────────────────────────────────────────────────────────────
router.get('/', getMyTeams);
router.post('/', createTeamRules, validate, createTeam);
router.post('/:id/invite', inviteRules, validate, inviteMember);
router.get('/:id/members', getMembers);
router.put('/:id/members/:userId', roleRules, validate, updateMemberRole);
router.delete('/:id/members/:userId', removeMember);

export default router;
