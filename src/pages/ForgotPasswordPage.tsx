import { useState, FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './ForgotPasswordPage.css';

export default function ForgotPasswordPage() {
  const { user, resetPassword, initialized, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});

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
    const errors: { email?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
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
      await resetPassword(email.trim());
      setSuccess(
        'Check your email for reset instructions. If you have an account with us, you will receive a password reset link shortly.'
      );
      setEmail('');
      setFieldErrors({});
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <div className="forgot-card__logo">
          <img src={`${import.meta.env.BASE_URL}schneiders_logo.png`} alt="Schneiders" />
        </div>
        <h1 className="forgot-card__title">Reset Password</h1>
        <p className="forgot-card__subtitle">
          Enter the email address associated with your account and we&apos;ll send you a link to reset your
          password.
        </p>

        {error && <div className="forgot-message forgot-message--error">{error}</div>}
        {success && <div className="forgot-message forgot-message--success">{success}</div>}

        <form className="forgot-form" onSubmit={handleSubmit} noValidate>
          <div className="forgot-form__field">
            <label className="forgot-form__label" htmlFor="forgot-email">
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
                id="forgot-email"
                type="email"
                className={`forgot-form__input ${fieldErrors.email ? 'forgot-form__input--error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({});
                }}
                autoComplete="email"
                disabled={loading}
              />
            </div>
            {fieldErrors.email && <p className="forgot-form__error">{fieldErrors.email}</p>}
          </div>

          <button type="submit" className="forgot-form__submit" disabled={loading}>
            {loading && <span className="forgot-form__submit-spinner" />}
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="forgot-card__footer">
          <Link to="/login">
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
