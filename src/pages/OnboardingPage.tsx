import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Users,
  HardHat,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Link2,
  SkipForward,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { businessService } from '../services/businessService';
import type { UserMode } from '../types/database';
import './OnboardingPage.css';

type OnboardingStep = 'welcome' | 'mode' | 'profile' | 'business' | 'complete';

const MODE_OPTIONS: {
  value: UserMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'standard',
    label: 'Standard / Owner',
    description:
      'Full access to manage your horses, barn, and team. Create or join a business to get started.',
    icon: <User size={28} />,
  },
  {
    value: 'trainer',
    label: 'Trainer',
    description:
      'Connect to multiple businesses and barns. Access horse information and log care activities across locations.',
    icon: <GraduationCap size={28} />,
  },
  {
    value: 'staff',
    label: 'Staff / Employee',
    description:
      'Work within an assigned business. Access horses and tasks as assigned by your manager.',
    icon: <HardHat size={28} />,
  },
  {
    value: 'boarder',
    label: 'Boarder / Horse Owner',
    description:
      'View your boarded horses, communicate with barn staff, and access care logs for your horses.',
    icon: <Briefcase size={28} />,
  },
];

function getStepsForMode(mode: UserMode | null): OnboardingStep[] {
  if (mode === 'standard') {
    return ['welcome', 'mode', 'profile', 'business', 'complete'];
  }
  return ['welcome', 'mode', 'profile', 'complete'];
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, refreshProfile } = useAuth();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [selectedMode, setSelectedMode] = useState<UserMode | null>(
    profile?.user_mode || null
  );

  // Profile form
  const [profileName, setProfileName] = useState(profile?.name || '');
  const [profilePhone, setProfilePhone] = useState(profile?.phone || '');
  const [profileError, setProfileError] = useState('');

  // Business form
  const [businessAction, setBusinessAction] = useState<'create' | 'join' | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [businessCode, setBusinessCode] = useState('');
  const [businessError, setBusinessError] = useState('');
  const [businessLoading, setBusinessLoading] = useState(false);

  const [completing, setCompleting] = useState(false);

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const steps = getStepsForMode(selectedMode);
  const currentIndex = steps.indexOf(currentStep);
  const totalSteps = steps.length;
  const progress = ((currentIndex + 1) / totalSteps) * 100;

  function canGoNext(): boolean {
    switch (currentStep) {
      case 'welcome':
        return true;
      case 'mode':
        return selectedMode !== null;
      case 'profile':
        return profileName.trim().length > 0;
      case 'business':
        // Can skip business, or must fill in one of the forms
        return true;
      case 'complete':
        return true;
      default:
        return false;
    }
  }

  function handleNext() {
    setProfileError('');
    setBusinessError('');

    if (currentStep === 'profile') {
      if (!profileName.trim()) {
        setProfileError('Name is required');
        return;
      }
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  }

  function handleBack() {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  }

  async function handleBusinessCreate() {
    if (!businessName.trim()) {
      setBusinessError('Business name is required');
      return;
    }

    setBusinessLoading(true);
    setBusinessError('');

    try {
      const { data, error } = await businessService.create(businessName.trim());
      if (error) {
        setBusinessError(error.message);
      } else {
        // Move to complete step
        setCurrentStep('complete');
      }
    } catch (err: any) {
      setBusinessError(err?.message || 'Failed to create business');
    } finally {
      setBusinessLoading(false);
    }
  }

  async function handleBusinessJoin() {
    if (!businessCode.trim()) {
      setBusinessError('Business code is required');
      return;
    }

    setBusinessLoading(true);
    setBusinessError('');

    try {
      const { data, error } = await businessService.joinByCode(businessCode.trim());
      if (error) {
        setBusinessError(error.message);
      } else if (data && !data.success) {
        setBusinessError(data.error || 'Failed to join business');
      } else {
        // Move to complete step
        setCurrentStep('complete');
      }
    } catch (err: any) {
      setBusinessError(err?.message || 'Failed to join business');
    } finally {
      setBusinessLoading(false);
    }
  }

  function handleSkipBusiness() {
    setCurrentStep('complete');
  }

  async function handleComplete() {
    setCompleting(true);

    try {
      // Update profile with selected mode and name
      const updates: Record<string, any> = {
        user_mode: selectedMode || 'standard',
      };

      if (profileName.trim()) {
        updates.name = profileName.trim();
      }
      if (profilePhone.trim()) {
        updates.phone = profilePhone.trim();
      }

      await updateProfile(updates);
      await refreshProfile();

      // Navigate to the main app
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Onboarding complete error:', err);
      // Still navigate even if update fails - profile can be updated later
      navigate('/', { replace: true });
    } finally {
      setCompleting(false);
    }
  }

  function renderStepContent() {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="onboarding-step onboarding-welcome">
            <div className="onboarding-welcome__icon">
              <Sparkles size={48} />
            </div>
            <h2 className="onboarding-step__title">Welcome to Horse Care Tracker</h2>
            <p className="onboarding-step__description">
              The complete horse care management platform for barn owners, trainers,
              staff, and boarders. Track feeding, medication, vet visits, and more --
              all in one place.
            </p>
            <div className="onboarding-welcome__features">
              <div className="onboarding-welcome__feature">
                <Check size={16} />
                <span>Manage horses and care logs</span>
              </div>
              <div className="onboarding-welcome__feature">
                <Check size={16} />
                <span>Set reminders and schedules</span>
              </div>
              <div className="onboarding-welcome__feature">
                <Check size={16} />
                <span>Collaborate with your team</span>
              </div>
              <div className="onboarding-welcome__feature">
                <Check size={16} />
                <span>Track health records and documents</span>
              </div>
            </div>
          </div>
        );

      case 'mode':
        return (
          <div className="onboarding-step">
            <h2 className="onboarding-step__title">How will you use Horse Care Tracker?</h2>
            <p className="onboarding-step__description">
              Choose your role. You can change this later in Settings.
            </p>
            <div className="onboarding-modes">
              {MODE_OPTIONS.map((mode) => (
                <button
                  key={mode.value}
                  className={`onboarding-mode-card ${selectedMode === mode.value ? 'onboarding-mode-card--selected' : ''}`}
                  onClick={() => setSelectedMode(mode.value)}
                >
                  <div className="onboarding-mode-card__icon">{mode.icon}</div>
                  <div className="onboarding-mode-card__text">
                    <h3>{mode.label}</h3>
                    <p>{mode.description}</p>
                  </div>
                  {selectedMode === mode.value && (
                    <div className="onboarding-mode-card__check">
                      <Check size={18} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="onboarding-step">
            <h2 className="onboarding-step__title">Set up your profile</h2>
            <p className="onboarding-step__description">
              Tell us a bit about yourself so your team can recognize you.
            </p>

            {profileError && (
              <div className="onboarding-error">{profileError}</div>
            )}

            <div className="onboarding-form">
              <div className="onboarding-form__field">
                <label htmlFor="onboard-name">Name *</label>
                <input
                  id="onboard-name"
                  type="text"
                  className="onboarding-form__input"
                  placeholder="Your full name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>

              <div className="onboarding-form__field">
                <label htmlFor="onboard-phone">Phone (optional)</label>
                <input
                  id="onboard-phone"
                  type="tel"
                  className="onboarding-form__input"
                  placeholder="(555) 555-5555"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'business':
        return (
          <div className="onboarding-step">
            <h2 className="onboarding-step__title">Set up your business</h2>
            <p className="onboarding-step__description">
              Create a new business or join an existing one with a business code.
            </p>

            {businessError && (
              <div className="onboarding-error">{businessError}</div>
            )}

            {!businessAction ? (
              <div className="onboarding-business-options">
                <button
                  className="onboarding-business-option"
                  onClick={() => setBusinessAction('create')}
                >
                  <div className="onboarding-business-option__icon">
                    <Plus size={24} />
                  </div>
                  <h3>Create New Business</h3>
                  <p>Start a new barn or business and invite your team.</p>
                </button>

                <button
                  className="onboarding-business-option"
                  onClick={() => setBusinessAction('join')}
                >
                  <div className="onboarding-business-option__icon">
                    <Link2 size={24} />
                  </div>
                  <h3>Join Existing Business</h3>
                  <p>Enter a business code shared by your manager or owner.</p>
                </button>

                <button
                  className="onboarding-business-skip"
                  onClick={handleSkipBusiness}
                >
                  <SkipForward size={16} />
                  Skip for now
                </button>
              </div>
            ) : businessAction === 'create' ? (
              <div className="onboarding-form">
                <div className="onboarding-form__field">
                  <label htmlFor="onboard-biz-name">Business Name *</label>
                  <input
                    id="onboard-biz-name"
                    type="text"
                    className="onboarding-form__input"
                    placeholder="e.g. Sunny Acres Stables"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>

                <div className="onboarding-form__actions">
                  <button
                    className="onboarding-btn onboarding-btn--secondary"
                    onClick={() => {
                      setBusinessAction(null);
                      setBusinessError('');
                    }}
                  >
                    Back
                  </button>
                  <button
                    className="onboarding-btn onboarding-btn--primary"
                    onClick={handleBusinessCreate}
                    disabled={businessLoading}
                  >
                    {businessLoading ? 'Creating...' : 'Create Business'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="onboarding-form">
                <div className="onboarding-form__field">
                  <label htmlFor="onboard-biz-code">Business Code *</label>
                  <input
                    id="onboard-biz-code"
                    type="text"
                    className="onboarding-form__input onboarding-form__input--code"
                    placeholder="e.g. ABC123"
                    value={businessCode}
                    onChange={(e) => setBusinessCode(e.target.value.toUpperCase())}
                    maxLength={10}
                  />
                  <span className="onboarding-form__hint">
                    Ask your barn owner or manager for the code
                  </span>
                </div>

                <div className="onboarding-form__actions">
                  <button
                    className="onboarding-btn onboarding-btn--secondary"
                    onClick={() => {
                      setBusinessAction(null);
                      setBusinessError('');
                    }}
                  >
                    Back
                  </button>
                  <button
                    className="onboarding-btn onboarding-btn--primary"
                    onClick={handleBusinessJoin}
                    disabled={businessLoading}
                  >
                    {businessLoading ? 'Joining...' : 'Join Business'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'complete':
        return (
          <div className="onboarding-step onboarding-complete">
            <div className="onboarding-complete__icon">
              <Check size={48} />
            </div>
            <h2 className="onboarding-step__title">You&apos;re all set!</h2>
            <p className="onboarding-step__description">
              Your account is ready. Start managing your horses and keeping your
              barn running smoothly.
            </p>
            <button
              className="onboarding-complete__btn"
              onClick={handleComplete}
              disabled={completing}
            >
              {completing ? 'Loading...' : 'Get Started'}
              {!completing && <ChevronRight size={18} />}
            </button>
          </div>
        );

      default:
        return null;
    }
  }

  const showNavButtons =
    currentStep !== 'complete' &&
    !(currentStep === 'business' && businessAction !== null);

  return (
    <div className="onboarding-page">
      {/* Progress Bar */}
      <div className="onboarding-progress">
        <div
          className="onboarding-progress__fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="onboarding-steps-indicator">
        {steps.map((step, i) => (
          <div
            key={step}
            className={`onboarding-step-dot ${i <= currentIndex ? 'onboarding-step-dot--active' : ''} ${i < currentIndex ? 'onboarding-step-dot--completed' : ''}`}
          >
            {i < currentIndex ? <Check size={12} /> : i + 1}
          </div>
        ))}
      </div>

      {/* Content Card */}
      <div className="onboarding-card">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      {showNavButtons && (
        <div className="onboarding-nav">
          {currentIndex > 0 ? (
            <button className="onboarding-nav__back" onClick={handleBack}>
              <ChevronLeft size={18} />
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            className="onboarding-nav__next"
            onClick={handleNext}
            disabled={!canGoNext()}
          >
            {currentStep === 'business' ? 'Skip' : 'Next'}
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
