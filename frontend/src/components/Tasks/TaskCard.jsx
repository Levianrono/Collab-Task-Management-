// src/components/Tasks/TaskCard.jsx
import { Clock, MessageSquare } from 'lucide-react';
import PriorityBadge from '../Shared/PriorityBadge.jsx';
import { statusInfo } from '../../utils/priorityColor.js';
import { formatDate, isOverdue } from '../../utils/formatDate.js';

/**
 * @param {{ task: object, onClick: Function }} props
 */
const TaskCard = ({ task, onClick }) => {
  const { label: statusLabel, className: statusClass } = statusInfo(task.status);
  const deadlineOverdue = task.deadline && isOverdue(task.deadline) && task.status !== 'done';
  const assigneeInitials = task.assignee?.full_name
    ? task.assignee.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : null;

  return (
    <div
      className={`task-card priority-${task.priority}`}
      onClick={onClick}
      id={`task-card-${task.id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="task-card-title">{task.title}</div>

      {task.description && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </p>
      )}

      <div className="task-card-meta">
        <PriorityBadge priority={task.priority} />
        <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
      </div>

      <div className="task-card-footer">
        <div className="flex items-center gap-2">
          {task.deadline && (
            <span className="flex items-center gap-1 text-xs" style={{ color: deadlineOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>
              <Clock size={12} />
              {deadlineOverdue ? 'Overdue · ' : ''}{formatDate(task.deadline)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {task.comments?.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <MessageSquare size={12} /> {task.comments.length}
            </span>
          )}
          {assigneeInitials && (
            <div className="avatar avatar-sm" title={task.assignee?.full_name}>
              {task.assignee?.avatar_url
                ? <img src={task.assignee.avatar_url} alt={task.assignee.full_name} />
                : assigneeInitials}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
