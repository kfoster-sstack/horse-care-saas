import { useState } from 'react';
import {
  User,
  Building2,
  Globe,
  Bell,
  CreditCard,
  LogOut,
  Trash2,
  ChevronRight,
  Shield,
  Clock,
  Languages,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../i18n';
import type { Language } from '../i18n';
import { useAppStore } from '../store';
import type { LeadTime } from '../types';
import './SettingsPage.css';

const LEAD_TIME_OPTIONS: { value: LeadTime; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: '15min', label: '15 minutes before' },
  { value: '1hour', label: '1 hour before' },
  { value: '1day', label: '1 day before' },
  { value: '3days', label: '3 days before' },
  { value: '1week', label: '1 week before' },
  { value: '2weeks', label: '2 weeks before' },
];

function getTierDisplayName(tier: string): string {
  switch (tier) {
    case 'free': return 'Free Plan';
    case 'team': return 'Team Plan';
    case 'business': return 'Business Plan';
    default: return 'Unknown Plan';
  }
}

function getTierPrice(tier: string): string {
  switch (tier) {
    case 'free': return 'Free';
    case 'team': return '$9.99/month';
    case 'business': return '$29.99/month';
    default: return '';
  }
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();
  const {
    user: authUser,
    profile,
    activeBusiness,
    activeMembership,
    signOut,
    updateProfile,
  } = useAuth();
  const { user: storeUser } = useAppStore();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(profile?.name || '');
  const [profilePhone, setProfilePhone] = useState(profile?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    storeUser?.preferences?.notifications ?? true
  );
  const [defaultLeadTime, setDefaultLeadTime] = useState<LeadTime>(
    storeUser?.preferences?.defaultReminderLead || '1day'
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const subscriptionTier = activeBusiness?.subscription_tier || storeUser?.subscription?.tier || 'free';
  const isOwner = activeMembership?.role === 'owner';

  async function handleSaveProfile() {
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const updates: Record<string, any> = {};
      if (profileName.trim() !== (profile?.name || '')) {
        updates.name = profileName.trim();
      }
      if (profilePhone.trim() !== (profile?.phone || '')) {
        updates.phone = profilePhone.trim() || null;
      }

      if (Object.keys(updates).length === 0) {
        setEditingProfile(false);
        setProfileSaving(false);
        return;
      }

      const { error } = await updateProfile(updates);
      if (error) {
        setProfileError(error.message || 'Failed to update profile');
      } else {
        setProfileSuccess('Profile updated successfully');
        setEditingProfile(false);
        setTimeout(() => setProfileSuccess(''), 3000);
      }
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Sign out error:', err);
      setSigningOut(false);
    }
  }

  function handleLanguageChange(lang: Language) {
    setLanguage(lang);
  }

  return (
    <div className="settings-page">
      <h1 className="settings-page__title">{t('settings.title')}</h1>

      {/* Profile Section */}
      <section className="settings-section">
        <div className="settings-section__header">
          <User size={20} />
          <h2>{t('settings.account.profileInfo')}</h2>
        </div>

        {profileSuccess && (
          <div className="settings-message settings-message--success">{profileSuccess}</div>
        )}
        {profileError && (
          <div className="settings-message settings-message--error">{profileError}</div>
        )}

        <div className="settings-section__body">
          <div className="settings-profile">
            <div className="settings-profile__avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" />
              ) : (
                <div className="settings-profile__avatar-placeholder">
                  {(profile?.name || authUser?.email || 'U')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
            </div>

            <div className="settings-profile__fields">
              <div className="settings-field">
                <label className="settings-field__label">Name</label>
                {editingProfile ? (
                  <input
                    type="text"
                    className="settings-field__input"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your name"
                  />
                ) : (
                  <span className="settings-field__value">
                    {profile?.name || 'Not set'}
                  </span>
                )}
              </div>

              <div className="settings-field">
                <label className="settings-field__label">Email</label>
                <span className="settings-field__value settings-field__value--readonly">
                  {authUser?.email || 'Not available'}
                </span>
              </div>

              <div className="settings-field">
                <label className="settings-field__label">Phone</label>
                {editingProfile ? (
                  <input
                    type="tel"
                    className="settings-field__input"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="(555) 555-5555"
                  />
                ) : (
                  <span className="settings-field__value">
                    {profile?.phone || 'Not set'}
                  </span>
                )}
              </div>

              <div className="settings-field">
                <label className="settings-field__label">User Mode</label>
                <span className="settings-field__value">
                  {profile?.user_mode
                    ? t(`settings.userMode.${profile.user_mode}`)
                    : 'Standard'}
                </span>
              </div>
            </div>
          </div>

          <div className="settings-section__actions">
            {editingProfile ? (
              <>
                <button
                  className="settings-btn settings-btn--secondary"
                  onClick={() => {
                    setEditingProfile(false);
                    setProfileName(profile?.name || '');
                    setProfilePhone(profile?.phone || '');
                  }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="settings-btn settings-btn--primary"
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                >
                  {profileSaving ? t('common.loading') : t('common.save')}
                </button>
              </>
            ) : (
              <button
                className="settings-btn settings-btn--secondary"
                onClick={() => setEditingProfile(true)}
              >
                {t('common.edit')} Profile
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Business Section */}
      <section className="settings-section">
        <div className="settings-section__header">
          <Building2 size={20} />
          <h2>Business</h2>
        </div>

        <div className="settings-section__body">
          {activeBusiness ? (
            <>
              <div className="settings-field">
                <label className="settings-field__label">Business Name</label>
                <span className="settings-field__value">{activeBusiness.name}</span>
              </div>

              {isOwner && (
                <div className="settings-field">
                  <label className="settings-field__label">Business Code</label>
                  <div className="settings-field__code">
                    <code>{activeBusiness.code}</code>
                    <span className="settings-field__hint">
                      Share this code with team members to join
                    </span>
                  </div>
                </div>
              )}

              <div className="settings-field">
                <label className="settings-field__label">Your Role</label>
                <span className="settings-field__value settings-field__badge">
                  <Shield size={14} />
                  {activeMembership?.role
                    ? t(`roles.${activeMembership.role}`)
                    : 'Member'}
                </span>
              </div>

              {isOwner && (
                <button
                  className="settings-link-row"
                  onClick={() => navigate('/team')}
                >
                  <span>Team Management</span>
                  <ChevronRight size={18} />
                </button>
              )}
            </>
          ) : (
            <p className="settings-empty-text">
              No active business. Complete onboarding to set up or join a business.
            </p>
          )}
        </div>
      </section>

      {/* Preferences Section */}
      <section className="settings-section">
        <div className="settings-section__header">
          <Globe size={20} />
          <h2>{t('settings.preferences.title')}</h2>
        </div>

        <div className="settings-section__body">
          {/* Language */}
          <div className="settings-field">
            <label className="settings-field__label">
              <Languages size={16} />
              {t('settings.preferences.language')}
            </label>
            <div className="settings-toggle-group">
              <button
                className={`settings-toggle-btn ${language === 'en' ? 'settings-toggle-btn--active' : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                {t('settings.preferences.languageEnglish')}
              </button>
              <button
                className={`settings-toggle-btn ${language === 'es' ? 'settings-toggle-btn--active' : ''}`}
                onClick={() => handleLanguageChange('es')}
              >
                {t('settings.preferences.languageSpanish')}
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="settings-field">
            <label className="settings-field__label">
              <Bell size={16} />
              {t('settings.notifications.title')}
            </label>
            <label className="settings-switch">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
              <span className="settings-switch__slider" />
              <span className="settings-switch__label">
                {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>

          {/* Default Reminder Lead Time */}
          <div className="settings-field">
            <label className="settings-field__label">
              <Clock size={16} />
              Default Reminder Lead Time
            </label>
            <select
              className="settings-field__select"
              value={defaultLeadTime}
              onChange={(e) => setDefaultLeadTime(e.target.value as LeadTime)}
            >
              {LEAD_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Subscription Section — owner only */}
      {isOwner && (
        <section className="settings-section">
          <div className="settings-section__header">
            <CreditCard size={20} />
            <h2>{t('settings.account.subscription')}</h2>
          </div>

          <div className="settings-section__body">
            <div className="settings-subscription">
              <div className="settings-subscription__current">
                <span className="settings-subscription__tier">
                  {getTierDisplayName(subscriptionTier)}
                </span>
                <span className="settings-subscription__price">
                  {getTierPrice(subscriptionTier)}
                </span>
              </div>

              {subscriptionTier === 'free' && (
                <div className="settings-subscription__upgrade">
                  <p>{t('subscription.upgradeMessage')}</p>
                  <button className="settings-btn settings-btn--primary">
                    {t('subscription.upgrade')} to Team
                  </button>
                </div>
              )}

              {subscriptionTier !== 'free' && activeBusiness?.subscription_expires_at && (
                <div className="settings-subscription__info">
                  <span>
                    Next billing date:{' '}
                    {new Date(activeBusiness.subscription_expires_at).toLocaleDateString(
                      'en-US',
                      { month: 'long', day: 'numeric', year: 'numeric' }
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Account Actions */}
      <section className="settings-section settings-section--danger">
        <div className="settings-section__header">
          <LogOut size={20} />
          <h2>{t('settings.accountActions.title')}</h2>
        </div>

        <div className="settings-section__body">
          <button
            className="settings-btn settings-btn--signout"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut size={18} />
            {signingOut ? 'Signing out...' : t('settings.accountActions.signOut')}
          </button>

          <div className="settings-danger-zone">
            <h3 className="settings-danger-zone__title">Danger Zone</h3>
            {showDeleteConfirm ? (
              <div className="settings-danger-zone__confirm">
                <p>{t('settings.accountActions.confirmDelete')}</p>
                <div className="settings-danger-zone__buttons">
                  <button
                    className="settings-btn settings-btn--secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    {t('common.cancel')}
                  </button>
                  <button className="settings-btn settings-btn--danger">
                    {t('settings.accountActions.deleteAccount')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="settings-btn settings-btn--danger-outline"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={16} />
                {t('settings.accountActions.deleteAccount')}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
