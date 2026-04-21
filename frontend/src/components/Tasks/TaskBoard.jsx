// src/components/Tasks/TaskBoard.jsx
import { useState } from 'react';
import TaskCard from './TaskCard.jsx';
import TaskModal from './TaskModal.jsx';
import LoadingSpinner from '../Shared/LoadingSpinner.jsx';

const COLUMNS = [
  { key: 'todo',        label: 'To Do',       dot: 'var(--text-muted)' },
  { key: 'in_progress', label: 'In Progress',  dot: 'var(--accent)' },
  { key: 'done',        label: 'Done',         dot: 'var(--success)' },
];

/**
 * @param {{ tasks: object[], loading: boolean, onRefresh: Function }} props
 */
const TaskBoard = ({ tasks, loading, onRefresh }) => {
  const [selectedId, setSelectedId] = useState(null);

  const byStatus = (status) => tasks.filter((t) => t.status === status);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><LoadingSpinner size="lg" /></div>;
  }

  return (
    <>
      <div className="task-board">
        {COLUMNS.map(({ key, label, dot }) => {
          const col = byStatus(key);
          return (
            <div className="task-column" key={key} id={`column-${key}`}>
              <div className="task-column-header">
                <div className="flex items-center gap-2">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, display: 'inline-block' }} />
                  <span className="task-column-title">{label}</span>
                </div>
                <span className="task-count-badge">{col.length}</span>
              </div>

              {col.length === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>
                    {key === 'todo' ? '📋' : key === 'in_progress' ? '⚙️' : '✅'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No tasks</div>
                </div>
              ) : (
                col.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => setSelectedId(task.id)} />
                ))
              )}
            </div>
          );
        })}
      </div>

      {selectedId && (
        <TaskModal
          taskId={selectedId}
          onClose={() => setSelectedId(null)}
          onDeleted={onRefresh}
        />
      )}
    </>
  );
};

export default TaskBoard;
