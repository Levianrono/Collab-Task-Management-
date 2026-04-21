// src/components/Notifications/NotificationBell.jsx
import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNotificationContext } from '../../context/NotificationContext.jsx';
import { timeAgo } from '../../utils/formatDate.js';

const ICONS = {
  task_assigned:    '📋',
  task_updated:     '✏️',
  comment_added:    '💬',
  deadline_reminder:'⏰',
  mention:          '@',
};

const NotificationBell = () => {
  const { notifications, unreadCount, read, readAll } = useNotificationContext();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="notif-bell" ref={ref}>
      <button
        className="btn btn-ghost btn-sm"
        style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        id="notification-bell-btn"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span className="font-semibold" style={{ fontSize: '0.9rem' }}>
              Notifications {unreadCount > 0 && <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>({unreadCount} new)</span>}
            </span>
            {unreadCount > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={readAll} title="Mark all as read">
                <CheckCheck size={15} /> All read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <div className="empty-state-icon">🔔</div>
                <div className="empty-state-title">All caught up!</div>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                  onClick={() => !n.is_read && read(n.id)}
                  id={`notif-item-${n.id}`}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{ICONS[n.type] || '🔔'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="notif-message">{n.message}</div>
                      <div className="notif-time">{timeAgo(n.created_at)}</div>
                    </div>
                    {!n.is_read && <span className="notif-dot" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
