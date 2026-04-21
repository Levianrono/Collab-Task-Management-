// src/utils/formatDate.js
import { format, formatDistanceToNow, isPast, isWithinInterval, subHours } from 'date-fns';

/** Formats a date as "Apr 21, 2026" */
export const formatDate = (date) => format(new Date(date), 'MMM d, yyyy');

/** Formats as "Apr 21, 2026 at 5:30 PM" */
export const formatDateTime = (date) => format(new Date(date), "MMM d, yyyy 'at' h:mm a");

/** Returns relative time e.g. "3 hours ago" */
export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

/** True if deadline is past */
export const isOverdue = (date) => isPast(new Date(date));

/** True if deadline is within the next 24 hours */
export const isDueSoon = (date) => {
  const d = new Date(date);
  return isWithinInterval(d, { start: new Date(), end: subHours(d, -24) });
};
