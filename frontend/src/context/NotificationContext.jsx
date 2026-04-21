// src/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { fetchNotifications, markAsRead, markAllAsRead } from '../api/notifications.js';
import { useAuthContext } from './AuthContext.jsx';

const NotificationContext = createContext(null);

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const MOCK_NOTIFS = [
  { id: 'n1', type: 'task_assigned', message: 'You have been assigned to "Design Landing Page"', is_read: false, created_at: new Date().toISOString() },
  { id: 'n2', type: 'comment_added', message: 'New comment on "Setup Supabase Schema"', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
];

/**
 * Provides notifications state and Supabase Realtime subscription.
 */
export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    if (import.meta.env.VITE_DEV_BYPASS === 'true') {
      setNotifications(MOCK_NOTIFS);
      setUnreadCount(MOCK_NOTIFS.filter(n => !n.is_read).length);
      return;
    }
    try {
      const { data } = await fetchNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch { /* silently fail */ }
  }, [isAuthenticated]);

  useEffect(() => { load(); }, [load]);

  // Supabase Realtime — push new notifications live
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [isAuthenticated, user]);

  const read = useCallback(async (id) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const readAll = useCallback(async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, load, read, readAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

/** @returns {{ notifications, unreadCount, load, read, readAll }} */
export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider');
  return ctx;
};
