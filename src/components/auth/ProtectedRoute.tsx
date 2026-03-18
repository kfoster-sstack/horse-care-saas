import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, activeBusiness, initialized, loading } = useAuth();

  // Still initializing — show spinner
  if (!initialized) {
    return (
      <div className="auth-loading">
        <div className="auth-loading__spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // No user at all — go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User exists but profile is still loading — show spinner, don't redirect
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading__spinner" />
        <p>Loading your data...</p>
      </div>
    );
  }

  // Profile loaded successfully — check if onboarding is actually needed
  // Only redirect to onboarding if we have a profile that confirms no setup,
  // NOT just because the profile failed to load (slow DB, timeout, etc.)
  if (profile && !profile.user_mode) {
    return <Navigate to="/onboarding" replace />;
  }

  if (profile?.user_mode === 'standard' && !activeBusiness) {
    return <Navigate to="/onboarding" replace />;
  }

  // If profile is null (DB query failed/timed out), let the user through
  // rather than sending them to onboarding incorrectly
  return <>{children}</>;
}
