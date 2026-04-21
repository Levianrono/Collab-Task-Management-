// src/controllers/notificationController.js
import { supabaseAdmin } from '../services/supabaseClient.js';

// ─── GET /api/notifications ───────────────────────────────────────────────────
// Equivalent SQL:
//   SELECT * FROM notifications
//   WHERE user_id = $1 AND is_read = false
//   ORDER BY created_at DESC;
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const unreadCount = data.filter((n) => !n.is_read).length;
    res.json({ notifications: data, unreadCount });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/notifications/:id/read ─────────────────────────────────────────
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId) // ensures users can only mark their own notifications
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Notification not found.' });

    res.json({ notification: data });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/notifications/read-all ─────────────────────────────────────────
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};
