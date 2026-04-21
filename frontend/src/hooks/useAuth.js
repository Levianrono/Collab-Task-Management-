// src/hooks/useAuth.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser, loginUser, googleLogin } from '../api/auth.js';
import { useAuthContext } from '../context/AuthContext.jsx';

/**
 * Hook providing form-level auth actions with error/loading states.
 */
export const useAuth = () => {
  const { login, logout } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await registerUser(formData);
      login(data.user, data.token);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (formData) => {
    setLoading(true);
    setError(null);
    
    // ── Dev bypass ─────────────────────────────────────────────────────────────
    if (import.meta.env.VITE_DEV_BYPASS === 'true') {
      const mockUser = {
        id: 'dev-user-001',
        userId: 'dev-user-001',
        email: formData.email || 'dev@taskflow.local',
        full_name: 'Dev User',
        avatar_url: null,
      };
      login(mockUser, 'mock-jwt-token');
      toast.success(`Welcome back, Dev User! (Bypass Active)`);
      navigate('/dashboard');
      setLoading(false);
      return;
    }

    try {
      const { data } = await loginUser(formData);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.full_name?.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await logout();
    toast.success('Logged out.');
    navigate('/login');
  };

  return { register, signIn, signOut, googleLogin, loading, error };
};
