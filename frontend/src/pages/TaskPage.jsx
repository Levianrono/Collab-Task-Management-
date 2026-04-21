// src/pages/TaskPage.jsx
import { useEffect, useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import Navbar from '../components/Shared/Navbar.jsx';
import Sidebar from '../components/Shared/Sidebar.jsx';
import TaskBoard from '../components/Tasks/TaskBoard.jsx';
import TaskForm from '../components/Tasks/TaskForm.jsx';
import { useTasks } from '../hooks/useTasks.js';
import { fetchMyTeams } from '../api/teams.js';

const TaskPage = () => {
  const { tasks, loading, load, create, filters, setFilters } = useTasks();
  const [teams, setTeams] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    load();
    fetchMyTeams().then(({ data }) => setTeams(data.teams || []));
  }, []);

  const handleFilterChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value || undefined };
    setFilters(updated);
    load(updated);
  };

  const handleCreate = async (formData) => {
    setCreating(true);
    await create(formData);
    setCreating(false);
    setShowCreate(false);
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Tasks" />
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Task Board</h1>
              <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} across all teams</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCreate(v => !v)} id="tasks-create-btn">
              <Plus size={16} /> New Task
            </button>
          </div>

          {/* Filters */}
          <div className="filters-bar">
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select name="teamId" onChange={handleFilterChange} id="filter-team" style={{ width: 'auto' }}>
              <option value="">All Teams</option>
              {teams.map(({ team }) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <select name="priority" onChange={handleFilterChange} id="filter-priority" style={{ width: 'auto' }}>
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select name="status" onChange={handleFilterChange} id="filter-status" style={{ width: 'auto' }}>
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {showCreate && (
            <div className="card" style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Create New Task</h3>
              <TaskForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={creating} />
            </div>
          )}

          <TaskBoard tasks={tasks} loading={loading} onRefresh={load} />
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
