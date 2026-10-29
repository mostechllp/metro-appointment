import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react';
import API from '../api';
import Header from '../components/Header';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/admin/login', { email, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--off-white)' }}>
      <Header />
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Subtle background decoration */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'var(--rose-pale)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.6, zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'var(--rose-blush)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.5, zIndex: 0 }}></div>

        <div className="login-card" style={{ position: 'relative', zIndex: 1 }}>
          
          <div className="login-header">
            <div className="login-icon-wrap">
              <ShieldCheck size={32} />
            </div>
            <h3>Admin Portal</h3>
            <p>Sign in to manage events and registrations.</p>
          </div>

          <form onSubmit={submit} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  placeholder="admin@metrostarcare.ae"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error-box">
                {error}
              </div>
            )}

            <button className="btn login-submit" disabled={loading}>
              {loading ? 'Authenticating…' : 'Sign In'}
            </button>
          </form>
          
          <div className="login-footer">
            <a href="/appointment/">← Return to Event Registration</a>
          </div>
        </div>
      </main>
    </div>
  );
}