import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  CalendarDays,
  Bell,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAppStore } from '../../store';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

// Custom Horse SVG icon matching the mobile app's TabBar icon
const HorseIcon = ({ className, size = 20 }: { className?: string; size?: number }) => (
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

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  labelKey: string;
  badge?: number;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const { getUnreadMessageCount } = useAppStore();
  const { profile } = useAuth();

  const unreadCount = getUnreadMessageCount();

  const displayName = profile?.name || 'User';
  const userRole = (profile as any)?.role || profile?.user_mode || 'owner';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const navItems: NavItem[] = [
    { path: '/', icon: Home, labelKey: 'nav.home' },
    { path: '/horses', icon: HorseIcon, labelKey: 'nav.horses' },
    { path: '/calendar', icon: CalendarDays, labelKey: 'nav.calendar' },
    { path: '/reminders', icon: Bell, labelKey: 'reminders.title' },
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
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar__logo">
        <img
          src="/schneiders_logo.png"
          alt="Schneider Saddlery"
        />
        <span className="sidebar__logo-text">Horse Care</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar__nav-link ${active ? 'active' : ''}`}
            >
              <Icon className="icon" size={20} />
              <span className="sidebar__nav-label">{t(item.labelKey)}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="sidebar__badge">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        {/* User info */}
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">{initials}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{displayName}</div>
            <div className="sidebar__user-role">{userRole}</div>
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          className="sidebar__toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
}
