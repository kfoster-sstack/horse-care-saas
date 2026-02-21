import { NavLink, useLocation } from 'react-router-dom';
import { Home, CalendarDays, MessageSquare, Settings } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAppStore } from '../../store';
import './MobileNav.css';

// Custom Horse SVG icon matching the mobile app's TabBar icon
const HorseIcon = ({ className, size = 22 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 20v-8l-2-2-1.5-1.5" />
    <path d="M16 20v-8l2-2 1.5-1.5" />
    <circle cx="12" cy="5" r="2" />
    <path d="M10 5c-1.5-2-4-2-4 0v3c0 1 .5 2 2 2" />
    <path d="M14 5c1.5-2 4-2 4 0v3c0 1-.5 2-2 2" />
    <path d="M8 12h8" />
  </svg>
);

interface Tab {
  path: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  labelKey: string;
  badge?: number;
}

export function MobileNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const { getUnreadMessageCount } = useAppStore();

  const unreadCount = getUnreadMessageCount();

  const tabs: Tab[] = [
    { path: '/', icon: Home, labelKey: 'nav.home' },
    { path: '/horses', icon: HorseIcon, labelKey: 'nav.horses' },
    { path: '/calendar', icon: CalendarDays, labelKey: 'nav.calendar' },
    { path: '/messages', icon: MessageSquare, labelKey: 'nav.messages', badge: unreadCount },
    { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="mobile-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);

        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`mobile-nav__item ${active ? 'active' : ''}`}
          >
            <div className="mobile-nav__icon-wrapper">
              <Icon className="icon" size={22} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="mobile-nav__badge">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            <span>{t(tab.labelKey)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
