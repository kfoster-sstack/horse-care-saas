import { useState, FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { User as UserIcon, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './SignupPage.css';

export default function SignupPage() {
  const { user, signUp, initialized, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

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
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    }

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

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      await signUp(email.trim(), password, name.trim());
      setSuccess(
        'Account created! Please check your email for a verification link to complete your registration.'
      );
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFieldErrors({});
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-card__logo">
          <img src="/schneiders_logo.png" alt="Schneiders" />
        </div>
        <h1 className="signup-card__title">Create Account</h1>
        <p className="signup-card__subtitle">Start managing your horse care today</p>

        {error && <div className="signup-message signup-message--error">{error}</div>}
        {success && <div className="signup-message signup-message--success">{success}</div>}

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <div className="signup-form__field">
            <label className="signup-form__label" htmlFor="signup-name">
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon
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
                id="signup-name"
                type="text"
                className={`signup-form__input ${fieldErrors.name ? 'signup-form__input--error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                autoComplete="name"
                disabled={loading}
              />
            </div>
            {fieldErrors.name && <p className="signup-form__error">{fieldErrors.name}</p>}
          </div>

          <div className="signup-form__field">
            <label className="signup-form__label" htmlFor="signup-email">
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
                id="signup-email"
                type="email"
                className={`signup-form__input ${fieldErrors.email ? 'signup-form__input--error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                autoComplete="email"
                disabled={loading}
              />
            </div>
            {fieldErrors.email && <p className="signup-form__error">{fieldErrors.email}</p>}
          </div>

          <div className="signup-form__field">
            <label className="signup-form__label" htmlFor="signup-password">
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
                id="signup-password"
                type="password"
                className={`signup-form__input ${fieldErrors.password ? 'signup-form__input--error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Create a password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            {fieldErrors.password && <p className="signup-form__error">{fieldErrors.password}</p>}
            {!fieldErrors.password && <p className="signup-form__hint">Minimum 6 characters</p>}
          </div>

          <div className="signup-form__field">
            <label className="signup-form__label" htmlFor="signup-confirm-password">
              Confirm Password
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
                id="signup-confirm-password"
                type="password"
                className={`signup-form__input ${fieldErrors.confirmPassword ? 'signup-form__input--error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword)
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="signup-form__error">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button type="submit" className="signup-form__submit" disabled={loading}>
            {loading && <span className="signup-form__submit-spinner" />}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="signup-card__footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
