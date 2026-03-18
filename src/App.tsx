import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useAppStore } from './store';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import HorsesPage from './pages/HorsesPage';
import HorseDetailPage from './pages/HorseDetailPage';
import CalendarPage from './pages/CalendarPage';
import { RemindersPage } from './pages/RemindersPage';
import { MessagesPage } from './pages/MessagesPage';
import { SettingsPage } from './pages/SettingsPage';
import { TeamPage } from './pages/TeamPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { OnboardingPage } from './pages/OnboardingPage';
import './App.css';

function AppContent() {
  const { user, activeBusiness, initialized, loading } = useAuth();
  const { setAuthenticated, syncAllData } = useAppStore();

  // Sync authentication state with store
  useEffect(() => {
    if (!initialized) return;

    if (user && activeBusiness) {
      setAuthenticated(true, activeBusiness.id);
      syncAllData();
    } else if (user && !loading) {
      // User is authenticated but business data hasn't loaded yet or doesn't exist
      // Still mark as authenticated so the app doesn't reset
      setAuthenticated(true, activeBusiness?.id);
    } else if (!user) {
      setAuthenticated(false);
    }
  }, [user, activeBusiness, initialized, loading, setAuthenticated, syncAllData]);

  // Show loading while auth initializes
  if (!initialized) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" />
        <p className="app-loading__text">Loading Schneider's Horse Care...</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Onboarding route (authenticated but no business yet) */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Protected app routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/horses" element={<HorsesPage />} />
                  <Route path="/horses/:id" element={<HorseDetailPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/reminders" element={<RemindersPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
