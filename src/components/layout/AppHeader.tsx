import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronDown, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n';
import { useAppStore } from '../../store';
import './AppHeader.css';

interface AppHeaderProps {
  isMobile: boolean;
}

// Map route paths to page title translation keys
const routeTitles: Record<string, string> = {
  '/': 'nav.home',
  '/horses': 'horses.title',
  '/calendar': 'calendar.title',
  '/reminders': 'reminders.title',
  '/messages': 'nav.messages',
  '/settings': 'settings.title',
};

export function AppHeader({ isMobile }: AppHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, signOut } = useAuth();
  const { getUnreadMessageCount } = useAppStore();

  const [showDropdown, setShowDropdown] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = getUnreadMessageCount();

  const displayName = profile?.name || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  // Determine page title from current route
  const getPageTitle = (): string => {
    if (routeTitles[location.pathname]) {
      return t(routeTitles[location.pathname]);
    }
    const matchingRoute = Object.keys(routeTitles)
      .filter((route) => route !== '/')
      .sort((a, b) => b.length - a.length)
      .find((route) => location.pathname.startsWith(route));
    if (matchingRoute) {
      return t(routeTitles[matchingRoute]);
    }
    return t('nav.home');
  };

  const handleNotificationClick = () => {
    navigate('/reminders');
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate('/login', { replace: true });
  };

  if (isMobile) {
    return (
      <header className="app-header">
        <div className="app-header__mobile-logo">
          <img
            src={`${import.meta.env.BASE_URL}schneiders_logo.png`}
            alt="Schneider Saddlery"
          />
          <span className="app-header__title">{getPageTitle()}</span>
        </div>

        <div className="app-header__actions">
          <button
            className="app-header__icon-btn"
            onClick={handleNotificationClick}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="app-header__notification-dot" />
            )}
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="app-header">
      <h1 className="app-header__title">{getPageTitle()}</h1>

      <div className="app-header__actions">
        {/* Search placeholder */}
        <div className="app-header__search">
          <Search size={18} className="app-header__search-icon" />
          <input
            type="text"
            className="app-header__search-input"
            placeholder={t('common.search') + '...'}
            aria-label="Search"
          />
        </div>

        {/* Notification bell */}
        <button
          className="app-header__icon-btn"
          onClick={handleNotificationClick}
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="app-header__notification-dot" />
          )}
        </button>

        {/* User dropdown */}
        <div className="app-header__user-wrapper" ref={dropdownRef}>
          <button
            className="app-header__user-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="User menu"
          >
            <div className="app-header__avatar">{initials}</div>
            <span className="app-header__user-name">{displayName}</span>
            <ChevronDown size={16} />
          </button>

          {showDropdown && (
            <div className="app-header__dropdown">
              <button
                className="app-header__dropdown-item"
                onClick={() => { navigate('/settings'); setShowDropdown(false); }}
              >
                <Settings size={16} />
                Settings
              </button>
              <button
                className="app-header__dropdown-item app-header__dropdown-item--danger"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                <LogOut size={16} />
                {signingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
