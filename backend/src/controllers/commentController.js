// src/controllers/commentController.js
import { supabaseAdmin } from '../services/supabaseClient.js';
import { createNotification, notifyMentions } from '../services/notificationService.js';

// ─── GET /api/tasks/:id/comments ─────────────────────────────────────────────
// Equivalent SQL:
//   SELECT c.*, u.id, u.full_name, u.avatar_url
//   FROM comments c
//   JOIN users u ON u.id = c.user_id
//   WHERE c.task_id = $1
//   ORDER BY c.created_at ASC
//   LIMIT $2 OFFSET $3;
export const getComments = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: comments, error, count } = await supabaseAdmin
      .from('comments')
      .select('*, author:user_id(id, full_name, avatar_url)', { count: 'exact' })
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) throw error;

    res.json({ comments, total: count, page, limit });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/tasks/:id/comments ────────────────────────────────────────────
export const addComment = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;
    const { content, attachment_url } = req.body;
    const userId = req.user.userId;

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert({ task_id: taskId, user_id: userId, content, attachment_url })
      .select('*, author:user_id(id, full_name, avatar_url)')
      .single();

    if (error) throw error;

    // Notify task's assigned user about the new comment
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('assigned_to, created_by, title')
      .eq('id', taskId)
      .single();

    const notifyUsers = new Set([task?.assigned_to, task?.created_by].filter(Boolean));
    notifyUsers.delete(userId); // don't notify the commenter themselves

    for (const uid of notifyUsers) {
      await createNotification({
        userId: uid,
        type: 'comment_added',
        message: `New comment on task "${task.title}".`,
        relatedTaskId: taskId,
      });
    }

    // Handle @mention notifications
    await notifyMentions(content, taskId, userId);

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/comments/:id ─────────────────────────────────────────────────
export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { data: comment } = await supabaseAdmin
      .from('comments')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    if (comment.user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own comments.' });
    }

    const { error } = await supabaseAdmin.from('comments').delete().eq('id', id);
    if (error) throw error;

    res.json({ message: 'Comment deleted.' });
  } catch (err) {
    next(err);
  }
};
