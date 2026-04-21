// src/components/Auth/RegisterForm.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const RegisterForm = () => {
  const { register, googleLogin, loading, error } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); register(form); };

  const pwStrength = form.password.length >= 12 ? 'strong' : form.password.length >= 8 ? 'medium' : form.password.length > 0 ? 'weak' : null;
  const strengthColor = { strong: 'var(--success)', medium: 'var(--warning)', weak: 'var(--danger)' };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">✨</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Start collaborating with your team today</p>
        </div>

        <button className="btn btn-google btn-full" onClick={googleLogin} id="google-register-btn">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider">or register with email</div>

        {error && (
          <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <div className="input-wrapper">
              <User size={16} className="input-icon" />
              <input id="reg-name" name="full_name" type="text" className="input-with-icon" placeholder="Jane Doe" value={form.full_name} onChange={handleChange} required autoComplete="name" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input id="reg-email" name="email" type="email" className="input-with-icon" placeholder="you@example.com" value={form.email} onChange={handleChange} required autoComplete="email" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="reg-password" name="password"
                type={showPw ? 'text' : 'password'}
                className="input-with-icon" placeholder="Min. 8 characters"
                value={form.password} onChange={handleChange} required minLength={8}
                style={{ paddingRight: '2.5rem' }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', padding: 0 }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pwStrength && (
              <div className="flex items-center gap-2 mt-1">
                <div style={{ flex: 1, height: 3, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: pwStrength === 'strong' ? '100%' : pwStrength === 'medium' ? '60%' : '25%', background: strengthColor[pwStrength], transition: 'width 0.3s ease, background 0.3s ease' }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: strengthColor[pwStrength], fontWeight: 600, textTransform: 'capitalize', minWidth: 40 }}>{pwStrength}</span>
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} id="register-submit-btn" style={{ marginTop: '0.5rem' }}>
            {loading ? <span className="spinner spinner-sm" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
