import { Activity, Bell, Plus, CalendarDays } from 'lucide-react';
import './QuickActions.css';

interface QuickActionsProps {
  onLogCare: () => void;
  onAddReminder: () => void;
  onAddHorse: () => void;
  onViewCalendar: () => void;
}

const actions = [
  {
    key: 'log-care',
    label: 'Log Care',
    icon: Activity,
    color: '#2E7D32',
    bgColor: 'rgba(46, 125, 50, 0.1)',
  },
  {
    key: 'add-reminder',
    label: 'Add Reminder',
    icon: Bell,
    color: '#1976D2',
    bgColor: 'rgba(25, 118, 210, 0.1)',
  },
  {
    key: 'add-horse',
    label: 'Add Horse',
    icon: Plus,
    color: '#7B1FA2',
    bgColor: 'rgba(123, 31, 162, 0.1)',
  },
  {
    key: 'view-calendar',
    label: 'View Calendar',
    icon: CalendarDays,
    color: '#F57C00',
    bgColor: 'rgba(245, 124, 0, 0.1)',
  },
] as const;

export function QuickActions({ onLogCare, onAddReminder, onAddHorse, onViewCalendar }: QuickActionsProps) {
  const handlers: Record<string, () => void> = {
    'log-care': onLogCare,
    'add-reminder': onAddReminder,
    'add-horse': onAddHorse,
    'view-calendar': onViewCalendar,
  };

  return (
    <div className="quick-actions">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.key}
            className="quick-actions__btn"
            onClick={handlers[action.key]}
            style={{
              '--action-color': action.color,
              '--action-bg': action.bgColor,
            } as React.CSSProperties}
          >
            <div className="quick-actions__icon-wrapper">
              <Icon size={24} />
            </div>
            <span className="quick-actions__label">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
