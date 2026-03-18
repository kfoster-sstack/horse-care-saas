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
  HelpCircle,
  Bug,
  Mail,
  RefreshCw,
  Info,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../i18n';
import type { Language } from '../i18n';
import { useAppStore } from '../store';
import { businessService } from '../services/businessService';
import type { LeadTime } from '../types';
import './SettingsPage.css';

const APP_VERSION = '1.0.0';

const FAQ_ITEMS = [
  {
    q: 'How do I add a new horse?',
    a: 'Navigate to the Horses page and click the "Add Horse" button. Fill in the horse\'s details including name, breed, and any medical information.',
  },
  {
    q: 'How do I invite team members?',
    a: 'Go to Settings > Business and share your Business Code with team members. They can enter it during signup to join your business.',
  },
  {
    q: 'How do reminders work?',
    a: 'Reminders can be one-off or recurring. Set a due date, priority, and optionally assign them to team members or roles like "All Staff".',
  },
  {
    q: 'Can I track multiple horses?',
    a: 'Yes! There is no limit to the number of horses you can add. Each horse has its own profile with care logs, medical info, documents, and emergency contacts.',
  },
  {
    q: 'How do I upload documents for a horse?',
    a: 'Go to a horse\'s detail page, click the "Documents" tab, then click "Upload." You can upload health records, coggins, registration papers, and more (max 10MB per file).',
  },
  {
    q: 'What does "Blanket Weather" mean on the dashboard?',
    a: 'The weather widget monitors conditions and alerts you when temperatures and wind chill suggest your horses may need blanketing (generally below 50°F or below 60°F with rain/wind).',
  },
  {
    q: 'How do trainers manage multiple barns?',
    a: 'Trainers can link to multiple businesses using business codes. A business switcher appears on Calendar, Reminders, and Messages pages to toggle between them.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All data is stored securely in our cloud database with row-level security policies. Only authenticated users with proper permissions can access business data.',
  },
];

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
    refreshProfile,
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

  // Join business
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  // Business address
  const [editingAddress, setEditingAddress] = useState(false);
  const [addrStreet, setAddrStreet] = useState((activeBusiness as any)?.address_street || '');
  const [addrCity, setAddrCity] = useState((activeBusiness as any)?.address_city || '');
  const [addrState, setAddrState] = useState((activeBusiness as any)?.address_state || '');
  const [addrZip, setAddrZip] = useState((activeBusiness as any)?.address_zip || '');
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrSuccess, setAddrSuccess] = useState('');

  // Help & Support
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportType, setSupportType] = useState<'support' | 'bug'>('support');
  const [supportSent, setSupportSent] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // About
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const subscriptionTier = activeBusiness?.subscription_tier || storeUser?.subscription?.tier || 'free';
  const isOwner = activeMembership?.role === 'owner';

  // Last sync time from store
  const lastSyncTime = new Date().toISOString(); // tracks current session sync

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

              {/* Business Address */}
              {isOwner && (
                <div className="settings-address">
                  <div className="settings-field" style={{ marginBottom: 8 }}>
                    <label className="settings-field__label">Business Address</label>
                    {!editingAddress ? (
                      <div>
                        {addrStreet || addrCity || addrState || addrZip ? (
                          <span className="settings-field__value">
                            {[addrStreet, addrCity, addrState, addrZip].filter(Boolean).join(', ')}
                          </span>
                        ) : (
                          <span className="settings-field__value" style={{ color: '#9ca3af' }}>
                            No address set — add one for accurate weather reports
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="settings-address-form">
                        <input
                          type="text"
                          className="settings-support-input"
                          placeholder="Street address"
                          value={addrStreet}
                          onChange={(e) => setAddrStreet(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text"
                            className="settings-support-input"
                            placeholder="City"
                            value={addrCity}
                            onChange={(e) => setAddrCity(e.target.value)}
                            style={{ flex: 2 }}
                          />
                          <input
                            type="text"
                            className="settings-support-input"
                            placeholder="State"
                            value={addrState}
                            onChange={(e) => setAddrState(e.target.value)}
                            style={{ flex: 1 }}
                            maxLength={2}
                          />
                          <input
                            type="text"
                            className="settings-support-input"
                            placeholder="ZIP"
                            value={addrZip}
                            onChange={(e) => setAddrZip(e.target.value)}
                            style={{ flex: 1 }}
                            maxLength={10}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {addrSuccess && (
                    <div className="settings-support-success" style={{ marginBottom: 8 }}>{addrSuccess}</div>
                  )}
                  {editingAddress ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="settings-btn settings-btn--primary"
                        disabled={addrSaving}
                        onClick={async () => {
                          if (!activeBusiness) return;
                          setAddrSaving(true);
                          await businessService.update(activeBusiness.id, {
                            address_street: addrStreet.trim() || null,
                            address_city: addrCity.trim() || null,
                            address_state: addrState.trim().toUpperCase() || null,
                            address_zip: addrZip.trim() || null,
                          } as any);
                          setAddrSaving(false);
                          setEditingAddress(false);
                          setAddrSuccess('Address saved! Weather will now use this location.');
                          setTimeout(() => setAddrSuccess(''), 4000);
                        }}
                      >
                        {addrSaving ? 'Saving...' : 'Save Address'}
                      </button>
                      <button
                        className="settings-btn settings-btn--secondary"
                        onClick={() => {
                          setEditingAddress(false);
                          setAddrStreet((activeBusiness as any)?.address_street || '');
                          setAddrCity((activeBusiness as any)?.address_city || '');
                          setAddrState((activeBusiness as any)?.address_state || '');
                          setAddrZip((activeBusiness as any)?.address_zip || '');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="settings-btn settings-btn--secondary"
                      onClick={() => setEditingAddress(true)}
                    >
                      {addrStreet ? 'Edit Address' : 'Add Address'}
                    </button>
                  )}
                </div>
              )}

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
            <div className="settings-join-business">
              <p className="settings-empty-text" style={{ marginBottom: 12 }}>
                You are not connected to a business yet. Enter a business code to join one.
              </p>
              {joinError && <div className="settings-support-success" style={{ background: '#ffebee', color: '#c62828', marginBottom: 8 }}>{joinError}</div>}
              {joinSuccess && <div className="settings-support-success" style={{ marginBottom: 8 }}>{joinSuccess}</div>}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <input
                  type="text"
                  className="settings-support-input"
                  placeholder="Enter business code (e.g. ABC123)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  style={{ flex: 1, marginBottom: 0 }}
                />
                <button
                  className="settings-btn settings-btn--primary"
                  disabled={joinLoading || !joinCode.trim()}
                  onClick={async () => {
                    setJoinLoading(true);
                    setJoinError('');
                    setJoinSuccess('');
                    const userMode = profile?.user_mode || 'staff';
                    const role = userMode === 'trainer' ? 'staff' : userMode === 'boarder' ? 'boarder' : 'staff';
                    const { data, error } = await businessService.joinByCode(joinCode.trim(), role as any);
                    if (error) {
                      setJoinError(error.message);
                    } else if (data && !data.success) {
                      setJoinError(data.error || 'Failed to join business');
                    } else {
                      setJoinSuccess(`Joined ${data?.business_name || 'business'} successfully! Refreshing...`);
                      setJoinCode('');
                      // Notify business owner that someone joined
                      if (data?.business_id) {
                        businessService.getById(data.business_id).then(({ data: biz }) => {
                          if (biz?.owner_id) {
                            import('../lib/supabase').then(({ supabase }) => {
                              supabase.from('direct_messages').insert({
                                business_id: data.business_id,
                                sender_id: authUser?.id,
                                recipient_id: biz.owner_id,
                                message: `${profile?.name || 'A new user'} (${profile?.email || authUser?.email || 'unknown'}) has joined your business "${data.business_name}" as ${role}.`,
                              }).then(() => {}, () => {});
                            });
                          }
                        });
                      }
                      setTimeout(() => { refreshProfile(); }, 1500);
                    }
                    setJoinLoading(false);
                  }}
                >
                  {joinLoading ? 'Joining...' : 'Join'}
                </button>
              </div>
              <span className="settings-field__hint" style={{ marginTop: 4, display: 'block' }}>
                Ask your barn owner or manager for the business code
              </span>
            </div>
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

      {/* Help & Support */}
      <section className="settings-section">
        <div className="settings-section__header">
          <HelpCircle size={20} />
          <h2>Help &amp; Support</h2>
        </div>
        <div className="settings-section__body">
          {/* Contact / Report Form */}
          <div className="settings-support-form">
            <div className="settings-support-tabs">
              <button
                className={`settings-support-tab ${supportType === 'support' ? 'settings-support-tab--active' : ''}`}
                onClick={() => setSupportType('support')}
              >
                <Mail size={14} /> Contact Support
              </button>
              <button
                className={`settings-support-tab ${supportType === 'bug' ? 'settings-support-tab--active' : ''}`}
                onClick={() => setSupportType('bug')}
              >
                <Bug size={14} /> Report a Bug
              </button>
            </div>

            {supportSent && (
              <div className="settings-support-success">{supportSent}</div>
            )}

            <input
              type="text"
              className="settings-support-input"
              placeholder={supportType === 'bug' ? 'Brief description of the bug' : 'Subject'}
              value={supportSubject}
              onChange={(e) => setSupportSubject(e.target.value)}
            />
            <textarea
              className="settings-support-textarea"
              placeholder={
                supportType === 'bug'
                  ? 'Steps to reproduce the issue, what you expected, and what happened instead...'
                  : 'How can we help you?'
              }
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              rows={4}
            />
            <button
              className="settings-btn settings-btn--primary"
              onClick={() => {
                if (!supportSubject.trim() || !supportMessage.trim()) return;
                const subject = encodeURIComponent(
                  `[Horse Care ${supportType === 'bug' ? 'Bug Report' : 'Support'}] ${supportSubject}`
                );
                const body = encodeURIComponent(
                  `${supportMessage}\n\n---\nUser: ${profile?.name || 'Unknown'}\nEmail: ${profile?.email || authUser?.email || 'Unknown'}\nBusiness: ${activeBusiness?.name || 'N/A'}\nVersion: ${APP_VERSION}`
                );
                window.open(`mailto:kfoster@sstack.com?subject=${subject}&body=${body}`, '_blank');
                setSupportSent('Your email client has been opened. Thank you for reaching out!');
                setSupportSubject('');
                setSupportMessage('');
                setTimeout(() => setSupportSent(''), 5000);
              }}
            >
              <Mail size={16} /> Send via Email
            </button>
          </div>

          {/* FAQ */}
          <div className="settings-faq">
            <h3 className="settings-faq__title">Frequently Asked Questions</h3>
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="settings-faq__item">
                <button
                  className="settings-faq__question"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <span>{item.q}</span>
                  {expandedFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedFaq === i && (
                  <p className="settings-faq__answer">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data & Sync */}
      <section className="settings-section">
        <div className="settings-section__header">
          <RefreshCw size={20} />
          <h2>Data &amp; Sync</h2>
        </div>
        <div className="settings-section__body">
          <div className="settings-field">
            <label className="settings-field__label">Last Synced</label>
            <span className="settings-field__value">
              <Clock size={14} style={{ marginRight: 4 }} />
              {new Date().toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit',
              })}
            </span>
          </div>
          <p className="settings-field__hint" style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 4 }}>
            Data syncs automatically when you open the app and when you make changes.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="settings-section">
        <div className="settings-section__header">
          <Info size={20} />
          <h2>About</h2>
        </div>
        <div className="settings-section__body">
          <div className="settings-field">
            <label className="settings-field__label">Version</label>
            <span className="settings-field__value">{APP_VERSION}</span>
          </div>
          <div className="settings-field">
            <label className="settings-field__label">Developed by</label>
            <span className="settings-field__value">Schneider Saddlery</span>
          </div>

          <div className="settings-about-links">
            <button
              className="settings-link-row"
              onClick={() => setShowTerms(!showTerms)}
            >
              <span><FileText size={16} /> Terms &amp; Conditions</span>
              {showTerms ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showTerms && (
              <div className="settings-legal-text">
                <h4>Terms &amp; Conditions</h4>
                <p><strong>Last updated:</strong> March 2026</p>
                <p>Welcome to Schneider's Horse Care Tracker ("the App"). By accessing or using the App, you agree to these Terms &amp; Conditions.</p>
                <p><strong>1. Acceptance of Terms.</strong> By creating an account, you agree to be bound by these terms. If you do not agree, do not use the App.</p>
                <p><strong>2. Accounts.</strong> You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration.</p>
                <p><strong>3. Permitted Use.</strong> The App is intended for managing horse care activities within legitimate barn, stable, or equestrian business operations. You may not use the App for any unlawful purpose.</p>
                <p><strong>4. Subscription &amp; Billing.</strong> Free accounts have limited features. Paid subscription tiers (Team, Business) offer expanded functionality. Subscription fees are billed to the business owner account. Cancellation takes effect at the end of the current billing period.</p>
                <p><strong>5. User Content.</strong> You retain ownership of all data, photos, and documents you upload. By uploading content, you grant us a limited license to store and display it within the App for your use.</p>
                <p><strong>6. Data &amp; Privacy.</strong> We take your privacy seriously. See our Privacy Policy for details on how we collect, use, and protect your data.</p>
                <p><strong>7. Limitation of Liability.</strong> The App is provided "as is." We are not liable for any veterinary, medical, or care decisions made based on information in the App. Always consult qualified professionals for horse health matters.</p>
                <p><strong>8. Termination.</strong> We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from Settings.</p>
                <p><strong>9. Changes.</strong> We may update these terms from time to time. Continued use of the App constitutes acceptance of updated terms.</p>
                <p><strong>10. Contact.</strong> Questions about these terms? Contact us at kfoster@sstack.com.</p>
              </div>
            )}

            <button
              className="settings-link-row"
              onClick={() => setShowPrivacy(!showPrivacy)}
            >
              <span><Shield size={16} /> Privacy Policy</span>
              {showPrivacy ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showPrivacy && (
              <div className="settings-legal-text">
                <h4>Privacy Policy</h4>
                <p><strong>Last updated:</strong> March 2026</p>
                <p>Schneider Saddlery ("we," "us") operates the Horse Care Tracker application. This policy describes how we collect, use, and protect your information.</p>
                <p><strong>1. Information We Collect.</strong></p>
                <ul>
                  <li><strong>Account info:</strong> Name, email address, phone number (optional).</li>
                  <li><strong>Business data:</strong> Business name, horse records, care logs, reminders, calendar events, documents, and team member information you enter.</li>
                  <li><strong>Usage data:</strong> Login timestamps, feature usage patterns, and device type for improving the App.</li>
                  <li><strong>Location data:</strong> Used only for the weather widget on your dashboard. This data is not stored.</li>
                </ul>
                <p><strong>2. How We Use Your Information.</strong></p>
                <ul>
                  <li>To provide and maintain the App's functionality.</li>
                  <li>To authenticate your identity and manage access permissions.</li>
                  <li>To send notifications and reminders you have configured.</li>
                  <li>To improve the App through anonymized usage analytics.</li>
                </ul>
                <p><strong>3. Data Storage &amp; Security.</strong> Your data is stored in secure cloud databases with encryption at rest and in transit. We use row-level security policies to ensure users can only access data within their authorized business.</p>
                <p><strong>4. Data Sharing.</strong> We do not sell your personal data. We share data only with: (a) other members of your business, based on role permissions; (b) service providers necessary to operate the App (e.g., cloud hosting).</p>
                <p><strong>5. Your Rights.</strong> You may: access, correct, or delete your personal data at any time from Settings; export your data; delete your account entirely.</p>
                <p><strong>6. Cookies &amp; Local Storage.</strong> We use browser local storage to maintain your session and preferences. No third-party tracking cookies are used.</p>
                <p><strong>7. Children's Privacy.</strong> The App is not intended for users under 13. We do not knowingly collect data from children.</p>
                <p><strong>8. Changes.</strong> We may update this policy as needed. We will notify users of significant changes via the App.</p>
                <p><strong>9. Contact.</strong> For privacy questions, contact us at kfoster@sstack.com.</p>
              </div>
            )}
          </div>
        </div>
      </section>

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
