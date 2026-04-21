// src/components/Tasks/TaskModal.jsx
import { useState, useEffect } from 'react';
import { X, Trash2, Edit3 } from 'lucide-react';
import { fetchTaskById } from '../../api/tasks.js';
import { useTasks } from '../../hooks/useTasks.js';
import { useAuthContext } from '../../context/AuthContext.jsx';
import PriorityBadge from '../Shared/PriorityBadge.jsx';
import { statusInfo } from '../../utils/priorityColor.js';
import { formatDateTime } from '../../utils/formatDate.js';
import CommentThread from '../Comments/CommentThread.jsx';
import TaskForm from './TaskForm.jsx';
import LoadingSpinner from '../Shared/LoadingSpinner.jsx';

/**
 * @param {{ taskId: string, onClose: Function, onDeleted?: Function }} props
 */
const TaskModal = ({ taskId, onClose, onDeleted }) => {
  const [task, setTask] = useState(null);
  const [loadingTask, setLoadingTask] = useState(true);
  const [editing, setEditing] = useState(false);
  const { update, remove } = useTasks();
  const { user } = useAuthContext();

  useEffect(() => {
    setLoadingTask(true);
    fetchTaskById(taskId)
      .then(({ data }) => setTask(data.task))
      .catch(() => onClose())
      .finally(() => setLoadingTask(false));
  }, [taskId]);

  const handleUpdate = async (formData) => {
    const updated = await update(taskId, formData);
    if (updated) { setTask(updated); setEditing(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    await remove(taskId);
    onDeleted?.();
    onClose();
  };

  const canEdit = task && (user?.userId === task.created_by || user?.userId === task.assigned_to);
  const canDelete = task && user?.userId === task.created_by;
  const { label: statusLabel, className: statusClass } = statusInfo(task?.status || 'todo');

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} id="task-modal-overlay">
      <div className="modal" id={`task-modal-${taskId}`}>
        {loadingTask ? (
          <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}><LoadingSpinner /></div>
        ) : editing ? (
          <>
            <div className="modal-header">
              <h2 className="modal-title">Edit Task</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <TaskForm initial={task} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
            </div>
          </>
        ) : (
          <>
            <div className="modal-header">
              <h2 className="modal-title" style={{ flex: 1, marginRight: '1rem' }}>{task?.title}</h2>
              <div className="flex items-center gap-2">
                {canEdit && <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} title="Edit"><Edit3 size={16} /></button>}
                {canDelete && <button className="btn btn-ghost btn-sm" onClick={handleDelete} style={{ color: 'var(--danger)' }} title="Delete"><Trash2 size={16} /></button>}
                <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
              </div>
            </div>

            <div className="modal-body">
              {/* Meta */}
              <div className="flex items-center gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
                <PriorityBadge priority={task?.priority} />
                <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
                {task?.team && <span className="chip">{task.team.name}</span>}
              </div>

              {task?.description && (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>{task.description}</p>
              )}

              <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                {task?.assignee && (
                  <div>
                    <div className="text-xs text-muted mb-1">Assigned to</div>
                    <div className="flex items-center gap-2">
                      <div className="avatar avatar-sm">
                        {task.assignee.avatar_url ? <img src={task.assignee.avatar_url} alt="" /> : task.assignee.full_name?.[0]}
                      </div>
                      <span className="text-sm">{task.assignee.full_name}</span>
                    </div>
                  </div>
                )}
                {task?.deadline && (
                  <div>
                    <div className="text-xs text-muted mb-1">Deadline</div>
                    <div className="text-sm">{formatDateTime(task.deadline)}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-muted mb-1">Created by</div>
                  <div className="text-sm">{task?.creator?.full_name || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Created</div>
                  <div className="text-sm">{task?.created_at ? formatDateTime(task.created_at) : '—'}</div>
                </div>
              </div>

              {/* Comments Section */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Comments {task?.comments?.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({task.comments.length})</span>}
                </h3>
                <CommentThread taskId={taskId} initialComments={task?.comments || []} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskModal;
