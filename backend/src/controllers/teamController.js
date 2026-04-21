// src/controllers/teamController.js
import { supabaseAdmin } from '../services/supabaseClient.js';
import { createNotification } from '../services/notificationService.js';

// ─── POST /api/teams ──────────────────────────────────────────────────────────
export const createTeam = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    const { data: team, error } = await supabaseAdmin
      .from('teams')
      .insert({ name, created_by: userId })
      .select()
      .single();

    if (error) throw error;

    // Auto-add creator as admin member
    await supabaseAdmin
      .from('team_members')
      .insert({ team_id: team.id, user_id: userId, role: 'admin' });

    res.status(201).json({ team });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/teams ───────────────────────────────────────────────────────────
export const getMyTeams = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('role, joined_at, team:team_id(id, name, created_at, created_by)')
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ teams: data });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/teams/:id/invite ───────────────────────────────────────────────
export const inviteMember = async (req, res, next) => {
  try {
    const { id: teamId } = req.params;
    const { email, role = 'editor' } = req.body;
    const requesterId = req.user.userId;

    // Only admins can invite
    const { data: requesterMembership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', requesterId)
      .single();

    if (requesterMembership?.role !== 'admin') {
      return res.status(403).json({ error: 'Only team admins can invite members.' });
    }

    // Look up user by email
    const { data: targetUser } = await supabaseAdmin
      .from('users')
      .select('id, full_name')
      .eq('email', email)
      .single();

    if (!targetUser) {
      return res.status(404).json({ error: 'No user found with that email.' });
    }

    // Upsert team_members record
    const { data: member, error } = await supabaseAdmin
      .from('team_members')
      .upsert({ team_id: teamId, user_id: targetUser.id, role }, { onConflict: 'team_id,user_id' })
      .select()
      .single();

    if (error) throw error;

    // Notify invited user
    const { data: team } = await supabaseAdmin.from('teams').select('name').eq('id', teamId).single();
    await createNotification({
      userId: targetUser.id,
      type: 'task_updated',
      message: `You have been invited to join team "${team?.name}".`,
    });

    res.status(201).json({ member });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/teams/:id/members ───────────────────────────────────────────────
export const getMembers = async (req, res, next) => {
  try {
    const { id: teamId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('id, role, joined_at, user:user_id(id, full_name, email, avatar_url)')
      .eq('team_id', teamId);

    if (error) throw error;

    res.json({ members: data });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/teams/:id/members/:userId ───────────────────────────────────────
export const updateMemberRole = async (req, res, next) => {
  try {
    const { id: teamId, userId: targetUserId } = req.params;
    const { role } = req.body;
    const requesterId = req.user.userId;

    const { data: requesterMembership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', requesterId)
      .single();

    if (requesterMembership?.role !== 'admin') {
      return res.status(403).json({ error: 'Only team admins can update roles.' });
    }

    const validRoles = ['admin', 'editor', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update({ role })
      .eq('team_id', teamId)
      .eq('user_id', targetUserId)
      .select()
      .single();

    if (error) throw error;

    res.json({ member: data });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/teams/:id/members/:userId ────────────────────────────────────
export const removeMember = async (req, res, next) => {
  try {
    const { id: teamId, userId: targetUserId } = req.params;
    const requesterId = req.user.userId;

    const { data: requesterMembership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', requesterId)
      .single();

    // Admin can remove anyone; members can remove themselves
    const isSelf = requesterId === targetUserId;
    if (requesterMembership?.role !== 'admin' && !isSelf) {
      return res.status(403).json({ error: 'Only team admins can remove other members.' });
    }

    const { error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', targetUserId);

    if (error) throw error;

    res.json({ message: 'Member removed from team.' });
  } catch (err) {
    next(err);
  }
};
