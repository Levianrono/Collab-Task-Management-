// src/controllers/taskController.js
import { supabaseAdmin } from '../services/supabaseClient.js';
import { createNotification, sendDeadlineReminder } from '../services/notificationService.js';

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
export const getTasks = async (req, res, next) => {
  try {
    const { teamId, status, priority, assignee } = req.query;

    let query = supabaseAdmin
      .from('tasks')
      .select(`
        *,
        creator:created_by(id, full_name, avatar_url),
        assignee:assigned_to(id, full_name, avatar_url),
        team:team_id(id, name)
      `)
      .order('created_at', { ascending: false });

    if (teamId) query = query.eq('team_id', teamId);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (assignee) query = query.eq('assigned_to', assignee);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ tasks: data });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
export const createTask = async (req, res, next) => {
  try {
    const { title, description, team_id, assigned_to, status, priority, deadline } = req.body;
    const created_by = req.user.userId;

    // Validate deadline is in the future
    if (deadline && new Date(deadline) <= new Date()) {
      return res.status(400).json({ error: 'Deadline must be a future date.' });
    }

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert({ title, description, team_id, created_by, assigned_to, status: status || 'todo', priority: priority || 'medium', deadline })
      .select(`*, creator:created_by(id, full_name, avatar_url), assignee:assigned_to(id, full_name, avatar_url)`)
      .single();

    if (error) throw error;

    // Notify assignee if not self-assigning
    if (assigned_to && assigned_to !== created_by) {
      await createNotification({
        userId: assigned_to,
        type: 'task_assigned',
        message: `You have been assigned a new task: "${title}"`,
        relatedTaskId: task.id,
      });
    }

    // Schedule deadline reminder if within 24 hours
    if (deadline && assigned_to) {
      const hoursUntilDeadline = (new Date(deadline) - new Date()) / (1000 * 60 * 60);
      if (hoursUntilDeadline <= 24) {
        await sendDeadlineReminder({ taskId: task.id, assigneeId: assigned_to, taskTitle: title });
      }
    }

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────
export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        creator:created_by(id, full_name, avatar_url),
        assignee:assigned_to(id, full_name, avatar_url),
        team:team_id(id, name),
        comments(*, author:user_id(id, full_name, avatar_url))
      `)
      .eq('id', id)
      .single();

    if (error || !task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updates = req.body;

    // Validate deadline if provided
    if (updates.deadline && new Date(updates.deadline) <= new Date()) {
      return res.status(400).json({ error: 'Deadline must be a future date.' });
    }

    // Verify requester is a team member or assignee
    const { data: existing } = await supabaseAdmin
      .from('tasks')
      .select('id, team_id, assigned_to, created_by, title')
      .eq('id', id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Task not found.' });

    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', existing.team_id)
      .eq('user_id', userId)
      .single();

    const isAssignee = existing.assigned_to === userId;
    const isCreator = existing.created_by === userId;
    if (!membership && !isAssignee && !isCreator) {
      return res.status(403).json({ error: 'Not authorized to update this task.' });
    }

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`*, creator:created_by(id, full_name, avatar_url), assignee:assigned_to(id, full_name, avatar_url)`)
      .single();

    if (error) throw error;

    // Notify assignee of update
    if (existing.assigned_to && existing.assigned_to !== userId) {
      await createNotification({
        userId: existing.assigned_to,
        type: 'task_updated',
        message: `Task "${existing.title}" has been updated.`,
        relatedTaskId: id,
      });
    }

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('id, team_id, created_by')
      .eq('id', id)
      .single();

    if (!task) return res.status(404).json({ error: 'Task not found.' });

    // Only creator or team admin may delete
    const isCreator = task.created_by === userId;
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', task.team_id)
      .eq('user_id', userId)
      .single();

    const isAdmin = membership?.role === 'admin';
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ error: 'Only the task creator or a team admin can delete this task.' });
    }

    const { error } = await supabaseAdmin.from('tasks').delete().eq('id', id);
    if (error) throw error;

    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
