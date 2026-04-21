// src/components/Tasks/TaskForm.jsx
import { useState, useEffect } from 'react';
import { fetchMyTeams } from '../../api/teams.js';

/**
 * Reusable task create/edit form.
 * @param {{ initial?: object, onSubmit: Function, onCancel: Function, loading?: boolean }} props
 */
const TaskForm = ({ initial = {}, onSubmit, onCancel, loading = false }) => {
  const [form, setForm] = useState({
    title: '', description: '', team_id: '',
    assigned_to: '', status: 'todo', priority: 'medium', deadline: '',
    ...initial,
  });
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMyTeams().then(({ data }) => setTeams(data.teams || []));
  }, []);

  useEffect(() => {
    if (!form.team_id) { setMembers([]); return; }
    import('../../api/teams.js').then(({ fetchMembers }) =>
      fetchMembers(form.team_id).then(({ data }) => setMembers(data.members || []))
    );
  }, [form.team_id]);

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };

  // Format date for input[type=datetime-local]
  const deadlineValue = form.deadline
    ? new Date(form.deadline).toISOString().slice(0, 16)
    : '';

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="task-title">Title *</label>
        <input id="task-title" name="title" value={form.title} onChange={set} placeholder="Task title" required />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="task-desc">Description</label>
        <textarea id="task-desc" name="description" value={form.description} onChange={set} placeholder="Optional description…" rows={3} style={{ resize: 'vertical' }} />
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label" htmlFor="task-team">Team *</label>
          <select id="task-team" name="team_id" value={form.team_id} onChange={set} required>
            <option value="">Select team…</option>
            {teams.map(({ team }) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-assignee">Assignee</label>
          <select id="task-assignee" name="assigned_to" value={form.assigned_to} onChange={set} disabled={!form.team_id}>
            <option value="">Unassigned</option>
            {members.map(({ user }) => (
              <option key={user.id} value={user.id}>{user.full_name || user.email}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-priority">Priority</label>
          <select id="task-priority" name="priority" value={form.priority} onChange={set}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-status">Status</label>
          <select id="task-status" name="status" value={form.status} onChange={set}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="task-deadline">Deadline</label>
        <input
          id="task-deadline" name="deadline" type="datetime-local"
          value={deadlineValue}
          min={new Date().toISOString().slice(0, 16)}
          onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
        />
      </div>

      <div className="modal-footer" style={{ padding: '1rem 0 0', border: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading} id="task-form-submit">
          {loading ? <span className="spinner spinner-sm" /> : initial?.id ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
