// src/services/notificationService.js
import { supabaseAdmin } from './supabaseClient.js';

/**
 * Creates a notification record in the database.
 * @param {{ userId: string, type: string, message: string, relatedTaskId?: string }} opts
 */
export const createNotification = async ({ userId, type, message, relatedTaskId = null }) => {
  const { error } = await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      message,
      related_task_id: relatedTaskId,
      is_read: false,
    });

  if (error) {
    console.error('[NotificationService] Failed to create notification:', error.message);
  }
};

/**
 * Extracts @username mentions from comment content and notifies mentioned users.
 * @param {string} content - comment text
 * @param {string} taskId
 * @param {string} authorId - user who wrote the comment (excluded from self-notification)
 */
export const notifyMentions = async (content, taskId, authorId) => {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const matches = [...content.matchAll(mentionRegex)].map((m) => m[1]);

  if (!matches.length) return;

  // Look up users by full_name or part of email matching the mention handle
  for (const handle of matches) {
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, full_name')
      .ilike('full_name', `%${handle}%`)
      .limit(1);

    const mentionedUser = users?.[0];
    if (!mentionedUser || mentionedUser.id === authorId) continue;

    await createNotification({
      userId: mentionedUser.id,
      type: 'mention',
      message: `You were mentioned in a comment.`,
      relatedTaskId: taskId,
    });
  }
};

/**
 * Sends a deadline reminder notification for a task due within 24 hours.
 * @param {{ taskId: string, assigneeId: string, taskTitle: string }} opts
 */
export const sendDeadlineReminder = async ({ taskId, assigneeId, taskTitle }) => {
  await createNotification({
    userId: assigneeId,
    type: 'deadline_reminder',
    message: `Task "${taskTitle}" is due within 24 hours!`,
    relatedTaskId: taskId,
  });
};
