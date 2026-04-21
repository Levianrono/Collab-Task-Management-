// src/components/Shared/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, Bell, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useAuthContext } from '../../context/AuthContext.jsx';

const NAV_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks',     icon: CheckSquare,     label: 'My Tasks'  },
  { to: '/teams',     icon: Users,           label: 'Teams'     },
  { to: '/notifications', icon: Bell,        label: 'Notifications' },
];

const Sidebar = () => {
  const { signOut } = useAuth();
  const { user } = useAuthContext();

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Zap size={20} />
        TaskFlow
      </div>

      <nav className="sidebar-nav">
        {NAV_LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User section at bottom */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
          <div className="avatar avatar-sm">
            {user?.avatar_url
              ? <img src={user.avatar_url} alt={user.full_name} />
              : initials}
          </div>
          <div className="truncate">
            <div className="text-sm font-semibold truncate">{user?.full_name || 'User'}</div>
            <div className="text-xs text-muted truncate">{user?.email}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm w-full" style={{ justifyContent: 'flex-start', gap: '0.5rem' }} onClick={signOut}>
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
