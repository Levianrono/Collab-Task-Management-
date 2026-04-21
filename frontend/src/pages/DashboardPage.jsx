// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { Plus, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Shared/Navbar.jsx';
import Sidebar from '../components/Shared/Sidebar.jsx';
import TaskBoard from '../components/Tasks/TaskBoard.jsx';
import TaskForm from '../components/Tasks/TaskForm.jsx';
import { useTasks } from '../hooks/useTasks.js';
import { useAuthContext } from '../context/AuthContext.jsx';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-3" style={{ padding: '1.1rem 1.25rem' }}>
    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} style={{ color }} />
    </div>
    <div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>{label}</div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuthContext();
  const { tasks, loading, load, create } = useTasks();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => { load(); }, [load]);

  const stats = {
    total:       tasks.length,
    done:        tasks.filter(t => t.status === 'done').length,
    inProgress:  tasks.filter(t => t.status === 'in_progress').length,
    overdue:     tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length,
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
        <Navbar title="Dashboard" />
        <div className="page-container">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},
                {' '}{user?.full_name?.split(' ')[0] ?? 'there'} 👋
              </h1>
              <p className="page-subtitle">Here's what's on your plate today.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCreate(v => !v)} id="open-create-task-btn">
              <Plus size={16} /> New Task
            </button>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
            <StatCard icon={TrendingUp}    label="Total Tasks"  value={stats.total}      color="var(--accent)" />
            <StatCard icon={CheckCircle}   label="Completed"    value={stats.done}       color="var(--success)" />
            <StatCard icon={Clock}         label="In Progress"  value={stats.inProgress} color="var(--warning)" />
            <StatCard icon={AlertTriangle} label="Overdue"      value={stats.overdue}    color="var(--danger)" />
          </div>

          {/* Create Task Inline Form */}
          {showCreate && (
            <div className="card" style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Create New Task</h3>
              <TaskForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={creating} />
            </div>
          )}

          {/* Task Board */}
          <TaskBoard tasks={tasks} loading={loading} onRefresh={load} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
