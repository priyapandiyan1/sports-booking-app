import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

const AdminLogin = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  // If already logged in as admin, skip straight to dashboard
  useEffect(() => {
    if (localStorage.getItem('adminToken')) navigate('/admin');
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.post('/api/auth/admin-login', { email, password });

      if (!data.success) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Store token + redirect to dashboard
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser',  JSON.stringify(data.user));
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Server error. Make sure the backend is running.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top left, #1a1a2e 0%, #16213e 40%, #0f0f23 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', 'Segoe UI', sans-serif", padding: '20px',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px',
        padding: '40px 36px', boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '26px',
          }}>🛡️</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 6px' }}>
            Admin Login
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Sign in using your email and password.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.4)',
            color: '#f87171', borderRadius: '10px', padding: '12px 16px',
            fontSize: '13px', marginBottom: '20px', textAlign: 'center',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@sportshub.com"
              required
              autoComplete="username"
              style={{
                width: '100%', padding: '12px 16px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '12px 44px 12px 16px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', outline: 'none',
                  transition: 'border 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '16px',
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: '12px', color: '#fff',
              fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', letterSpacing: '0.5px',
              boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
            }}
          >
            {loading ? '⏳ Signing in…' : '🔐 Sign In to Admin Panel'}
          </button>
        </form>

        {/* Hint */}
        <div style={{
          marginTop: '24px', textAlign: 'center',
          padding: '14px', background: 'rgba(255,255,255,0.04)',
          borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <p style={{ color: '#475569', fontSize: '12px', margin: 0 }}>
            🔒 Admin access only. Regular users cannot log in here.
          </p>
        </div>

        {/* Back to site */}
        <p style={{ textAlign: 'center', marginTop: '20px', marginBottom: 0 }}>
          <a href="/" style={{ color: '#6366f1', fontSize: '13px', textDecoration: 'none' }}>
            ← Back to Sports Hub
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
