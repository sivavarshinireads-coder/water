import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Droplets, Eye, EyeOff, AlertCircle, CheckCircle, Gauge, Receipt, BarChart as BarChart2, ShieldCheck, ArrowRight, Mail } from 'lucide-react';
import { login as loginApi, forgotPassword } from '../api/auth';
import GoogleTranslate from '../components/GoogleTranslate';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: Gauge,       text: 'Real-time meter reading & usage tracking' },
  { icon: Receipt,     text: 'Automated billing & invoice generation' },
  { icon: BarChart2,   text: 'Clear reports for admins and residents' },
  { icon: ShieldCheck, text: 'Secure role-based access & notifications' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required.'); return; }
    setError('');
    setIsLoading(true);
    try {
      const res = await loginApi({ email, password });
      login(res.token, {
        id: res.id, name: res.name, email: res.email, role: res.role,
        enabled: true, approvalStatus: res.approvalStatus,
        profileCompleted: res.profileCompleted,
        communityAdminId: res.communityAdminId,
        communityAdminCode: res.communityAdminCode,
        adminCode: res.adminCode, residentCode: res.residentCode,
      });
      setSuccess('Login successful! Redirecting...');
      const redirectMap: Record<string, string> = {
        RESIDENT: '/dashboard/user',
        COMMUNITY_ADMIN: '/dashboard/admin',
        MAIN_ADMIN: '/dashboard/main-admin',
      };
      const requestedPath = searchParams.get('next');
      const target =
        res.role === 'RESIDENT' && requestedPath?.startsWith('/dashboard/user/')
          ? requestedPath
          : redirectMap[res.role];
      setTimeout(() => navigate(target), 800);
    } catch (err: any) {
      if (!err.response) {
        setError('Cannot connect to backend server at http://localhost:8081. Please ensure the backend server is running.');
      } else {
        setError(err.response?.data?.error || 'Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSuccess('If an account exists with this email, a temporary password has been sent.');
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccess('');
        setPassword('');
      }, 5000);
    } catch (err: any) {
      setError('An error occurred while resetting password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split-page">

      {/* ── Left: Brand Panel ── */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">

          <Link to="/" className="auth-brand-logo">
            <div className="auth-brand-logo-icon">
              <Droplets size={22} style={{ color: '#fff' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: '#fff' }}>
              AquaTrack
            </span>
          </Link>

          <h1 className="auth-brand-title">
            Smarter water management for your community
          </h1>
          <p className="auth-brand-subtitle">
            Track meter readings, generate accurate bills, and keep every household informed —
            all from one seamless dashboard.
          </p>

          <div className="auth-brand-features">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="auth-brand-feature">
                <div className="auth-brand-feature-icon">
                  <Icon size={16} style={{ color: '#fff' }} />
                </div>
                {text}
              </div>
            ))}
          </div>

          <div className="auth-brand-badge">
            <ShieldCheck size={14} style={{ color: '#fff' }} />
            Enterprise-grade security · Role-based access
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Link to="/" className="auth-back-link">← Back to home</Link>
            <GoogleTranslate />
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1 className="auth-form-title">{isForgotPassword ? 'Reset Password' : 'Welcome back'}</h1>
            <p className="auth-form-subtitle">
              {isForgotPassword
                ? 'Enter your email and we\'ll send a temporary password'
                : 'Sign in to access your AquaTrack dashboard'}
            </p>
          </div>

          {error && (
            <div className="alert-box alert-error" style={{ marginBottom: 20 }}>
              <AlertCircle size={16} style={{ marginTop: 1, flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert-box alert-success" style={{ marginBottom: 20 }}>
              <CheckCircle size={16} style={{ marginTop: 1, flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ marginTop: 4, width: '100%', padding: '12px 20px', fontSize: 15, borderRadius: 11 }}
              >
                {isLoading
                  ? <><span className="spinner-sm" /> Sending...</>
                  : <><Mail size={16} /> Send Reset Email</>
                }
              </button>

              <button
                type="button"
                onClick={() => { setIsForgotPassword(false); setError(''); setSuccess(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-600)', fontWeight: 600, fontSize: 14, textAlign: 'center' }}
              >
                ← Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field"
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex-between" style={{ marginBottom: 7 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                  <button
                    type="button"
                    className="forgot-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => { setIsForgotPassword(true); setError(''); setSuccess(''); }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-field"
                    style={{ paddingRight: 40 }}
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="toggle-btn">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ marginTop: 4, width: '100%', padding: '12px 20px', fontSize: 15, borderRadius: 11 }}
              >
                {isLoading
                  ? <><span className="spinner-sm" /> Signing in...</>
                  : <>Sign In <ArrowRight size={16} /></>
                }
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--slate-500)', marginTop: 24 }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--brand-600)', fontWeight: 600 }}>
              Create account
            </Link>
          </p>

          <div className="auth-portal-list">
            <p className="auth-portal-label">Available Portals</p>
            {[
              { label: 'Resident Portal',   color: 'var(--brand-600)', bg: 'var(--brand-50)', border: 'var(--brand-100)' },
              { label: 'Community Admin',   color: '#0891b2',          bg: '#ecfeff',         border: '#cffafe' },
              { label: 'Main Admin',        color: '#059669',          bg: 'var(--green-50)', border: 'var(--green-200)' },
            ].map(({ label, color, bg, border }) => (
              <div key={label} className="auth-portal-item" style={{ background: bg, border: `1px solid ${border}`, color }}>
                <ShieldCheck size={14} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
