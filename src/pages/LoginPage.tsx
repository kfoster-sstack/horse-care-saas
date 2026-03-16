import { useState, FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Mail, Lock, Wand2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { user, signIn, signInWithMagicLink, initialized, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  if (!initialized || authLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading__spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) return;

    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setFieldErrors({ email: 'Enter your email to receive a magic link' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setMagicLinkLoading(true);
    try {
      await signInWithMagicLink(email.trim());
      setSuccess('Magic link sent! Check your email to sign in.');
    } catch (err: any) {
      setError(err?.message || 'Failed to send magic link. Please try again.');
    } finally {
      setMagicLinkLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <img src={`${import.meta.env.BASE_URL}schneiders_logo.png`} alt="Schneiders" />
        </div>
        <h1 className="auth-card__title">Horse Care Tracker</h1>
        <p className="auth-card__subtitle">Sign in to manage your horses</p>

        {error && <div className="auth-message auth-message--error">{error}</div>}
        {success && <div className="auth-message auth-message--success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="login-email">
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="login-email"
                type="email"
                className={`auth-form__input ${fieldErrors.email ? 'auth-form__input--error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                autoComplete="email"
                disabled={loading || magicLinkLoading}
              />
            </div>
            {fieldErrors.email && <p className="auth-form__error">{fieldErrors.email}</p>}
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="login-password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="login-password"
                type="password"
                className={`auth-form__input ${fieldErrors.password ? 'auth-form__input--error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                autoComplete="current-password"
                disabled={loading || magicLinkLoading}
              />
            </div>
            {fieldErrors.password && <p className="auth-form__error">{fieldErrors.password}</p>}
          </div>

          <div className="auth-form__forgot">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="auth-form__submit" disabled={loading || magicLinkLoading}>
            {loading && <span className="auth-form__submit-spinner" />}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="auth-divider">
            <span className="auth-divider__line" />
            <span className="auth-divider__text">or</span>
            <span className="auth-divider__line" />
          </div>

          <button
            type="button"
            className="auth-form__magic-link"
            onClick={handleMagicLink}
            disabled={loading || magicLinkLoading}
          >
            {magicLinkLoading ? (
              <span className="auth-form__submit-spinner" style={{ borderColor: 'rgba(55,65,81,0.3)', borderTopColor: '#374151' }} />
            ) : (
              <Wand2 size={18} />
            )}
            {magicLinkLoading ? 'Sending...' : 'Sign in with magic link'}
          </button>
        </form>

        <p className="auth-card__footer">
          Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
