// src/utils/priorityColor.js

/**
 * Returns Tailwind-compatible CSS class strings per priority level.
 * @param {'low'|'medium'|'high'|'critical'} priority
 * @returns {{ bg: string, text: string, border: string, dot: string }}
 */
export const priorityColors = (priority) => {
  const map = {
    low:      { bg: 'priority-low',      text: '#22c55e', label: 'Low' },
    medium:   { bg: 'priority-medium',   text: '#f59e0b', label: 'Medium' },
    high:     { bg: 'priority-high',     text: '#f97316', label: 'High' },
    critical: { bg: 'priority-critical', text: '#ef4444', label: 'Critical' },
  };
  return map[priority] || map.medium;
};

/**
 * Returns status display info.
 * @param {'todo'|'in_progress'|'done'} status
 */
export const statusInfo = (status) => {
  const map = {
    todo:        { label: 'To Do',       className: 'status-todo' },
    in_progress: { label: 'In Progress', className: 'status-in-progress' },
    done:        { label: 'Done',        className: 'status-done' },
  };
  return map[status] || map.todo;
};
