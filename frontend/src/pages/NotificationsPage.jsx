// src/pages/NotificationsPage.jsx
import { useEffect } from 'react';
import { CheckCheck, Bell } from 'lucide-react';
import Navbar from '../components/Shared/Navbar.jsx';
import Sidebar from '../components/Shared/Sidebar.jsx';
import { useNotificationContext } from '../context/NotificationContext.jsx';
import { timeAgo } from '../utils/formatDate.js';

const TYPE_ICONS = {
  task_assigned:    '📋',
  task_updated:     '✏️',
  comment_added:    '💬',
  deadline_reminder:'⏰',
  mention:          '@',
};

const NotificationsPage = () => {
  const { notifications, unreadCount, load, read, readAll } = useNotificationContext();

  useEffect(() => { load(); }, [load]);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Notifications" />
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Notifications</h1>
              <p className="page-subtitle">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
            </div>
            {unreadCount > 0 && (
              <button className="btn btn-secondary" onClick={readAll} id="mark-all-read-btn">
                <CheckCheck size={16} /> Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="card empty-state" style={{ padding: '4rem' }}>
              <Bell size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
              <div className="empty-state-title">No notifications yet</div>
              <p className="text-secondary text-sm">You'll be notified when tasks are assigned, updated, or commented on.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {notifications.map((n, i) => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                  style={{ borderBottom: i < notifications.length - 1 ? '1px solid var(--border-subtle)' : 'none', padding: '1rem 1.25rem' }}
                  onClick={() => !n.is_read && read(n.id)}
                  id={`notification-row-${n.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{TYPE_ICONS[n.type] || '🔔'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="notif-message" style={{ fontSize: '0.9rem' }}>{n.message}</div>
                      <div className="notif-time">{timeAgo(n.created_at)}</div>
                    </div>
                    {!n.is_read && <span className="notif-dot" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
