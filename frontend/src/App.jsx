// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuthContext } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import LoadingSpinner from './components/Shared/LoadingSpinner.jsx';

import LoginPage          from './pages/LoginPage.jsx';
import RegisterPage       from './pages/RegisterPage.jsx';
import AuthCallbackPage   from './pages/AuthCallbackPage.jsx';
import DashboardPage      from './pages/DashboardPage.jsx';
import TaskPage           from './pages/TaskPage.jsx';
import TeamPage           from './pages/TeamPage.jsx';
import NotificationsPage  from './pages/NotificationsPage.jsx';

/**
 * Guards private routes — redirects to /login if not authenticated.
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();
  if (loading) return <LoadingSpinner fullscreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * Guards public routes — redirects authenticated users to /dashboard.
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();
  if (loading) return <LoadingSpinner fullscreen />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register"        element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/auth/callback"   element={<AuthCallbackPage />} />

    {/* Protected */}
    <Route path="/dashboard"       element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
    <Route path="/tasks"           element={<PrivateRoute><TaskPage /></PrivateRoute>} />
    <Route path="/teams"           element={<PrivateRoute><TeamPage /></PrivateRoute>} />
    <Route path="/notifications"   element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />

    {/* Fallback */}
    <Route path="*"                element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' } },
            error:   { iconTheme: { primary: 'var(--danger)',  secondary: 'var(--bg-card)' } },
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
