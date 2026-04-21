// src/pages/AuthCallbackPage.jsx
// Handles redirect from Google OAuth — extracts token and redirects to dashboard
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.jsx';
import { getMe } from '../api/auth.js';
import LoadingSpinner from '../components/Shared/LoadingSpinner.jsx';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { navigate('/login'); return; }

    localStorage.setItem('auth_token', token);
    getMe()
      .then(({ data }) => {
        login(data.user, token);
        navigate('/dashboard');
      })
      .catch(() => navigate('/login'));
  }, []);

  return <LoadingSpinner fullscreen />;
};

export default AuthCallbackPage;
