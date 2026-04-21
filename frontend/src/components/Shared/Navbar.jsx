// src/components/Shared/Navbar.jsx
import { Search } from 'lucide-react';
import NotificationBell from '../Notifications/NotificationBell.jsx';
import { useAuthContext } from '../../context/AuthContext.jsx';

/**
 * @param {{ title?: string }} props
 */
const Navbar = ({ title = '' }) => {
  const { user } = useAuthContext();
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="navbar">
      <div className="navbar-left">
        {title && <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h1>}
      </div>

      <div className="navbar-right">
        <NotificationBell />

        <div className="avatar avatar-sm" title={user?.full_name}>
          {user?.avatar_url
            ? <img src={user.avatar_url} alt={user.full_name} />
            : initials}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
