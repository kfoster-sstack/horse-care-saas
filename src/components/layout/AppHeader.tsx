import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronDown } from 'lucide-react';
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
  const { profile } = useAuth();
  const { getUnreadMessageCount } = useAppStore();

  const unreadCount = getUnreadMessageCount();

  const displayName = profile?.name || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Determine page title from current route
  const getPageTitle = (): string => {
    // Exact match first
    if (routeTitles[location.pathname]) {
      return t(routeTitles[location.pathname]);
    }

    // Prefix match for nested routes (e.g. /horses/123)
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

  const handleUserClick = () => {
    navigate('/settings');
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

        {/* User dropdown trigger */}
        <button
          className="app-header__user-btn"
          onClick={handleUserClick}
          aria-label="User menu"
        >
          <div className="app-header__avatar">{initials}</div>
          <span className="app-header__user-name">{displayName}</span>
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}
