import { formatDistanceToNow } from 'date-fns';
import {
  Utensils,
  Sun,
  Shirt,
  Pill,
  Dumbbell,
  Brush,
  HeartPulse,
  Hammer,
  Stethoscope,
  MoreHorizontal,
} from 'lucide-react';
import { useAppStore } from '../../store';
import type { CareLogType } from '../../types';
import './ActivityFeed.css';

const CARE_TYPE_CONFIG: Record<CareLogType, { label: string; color: string; icon: typeof Utensils }> = {
  feeding: { label: 'Feeding', color: '#2E7D32', icon: Utensils },
  turnout: { label: 'Turnout', color: '#1976D2', icon: Sun },
  blanketing: { label: 'Blanketing', color: '#7B1FA2', icon: Shirt },
  medication: { label: 'Medication', color: '#C62828', icon: Pill },
  exercise: { label: 'Exercise', color: '#F57C00', icon: Dumbbell },
  grooming: { label: 'Grooming', color: '#00897B', icon: Brush },
  health_check: { label: 'Health Check', color: '#D32F2F', icon: HeartPulse },
  farrier: { label: 'Farrier', color: '#5D4037', icon: Hammer },
  vet_visit: { label: 'Vet Visit', color: '#AD1457', icon: Stethoscope },
  other: { label: 'Other', color: '#546E7A', icon: MoreHorizontal },
};

function formatRelativeTime(dateStr: string, timeStr?: string): string {
  try {
    const isoString = timeStr ? `${dateStr}T${timeStr}:00` : `${dateStr}T12:00:00`;
    const date = new Date(isoString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function ActivityFeed() {
  const careLogs = useAppStore((state) => state.careLogs);
  const horses = useAppStore((state) => state.horses);

  // Show the 10 most recent care logs
  const recentLogs = [...careLogs]
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}:00`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}:00`);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 10);

  if (recentLogs.length === 0) {
    return (
      <div className="activity-feed activity-feed--empty">
        <p className="activity-feed__empty-text">No recent activity</p>
        <p className="activity-feed__empty-hint">
          Log a care activity to see it appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      <ul className="activity-feed__list">
        {recentLogs.map((log) => {
          const config = CARE_TYPE_CONFIG[log.type] || CARE_TYPE_CONFIG.other;
          const Icon = config.icon;
          const horse = horses.find((h) => h.id === log.horseId);
          const horseName = horse?.name || 'Unknown Horse';

          return (
            <li key={log.id} className="activity-feed__item">
              <div className="activity-feed__timeline">
                <div
                  className="activity-feed__icon"
                  style={{ backgroundColor: config.color }}
                >
                  <Icon size={14} />
                </div>
                <div className="activity-feed__line" />
              </div>

              <div className="activity-feed__content">
                <p className="activity-feed__description">
                  <span className="activity-feed__type">{config.label}</span>
                  {' logged for '}
                  <span className="activity-feed__horse">{horseName}</span>
                </p>

                <div className="activity-feed__meta">
                  <span className="activity-feed__logged-by">{log.loggedBy}</span>
                  <span className="activity-feed__separator">&middot;</span>
                  <span className="activity-feed__time">
                    {formatRelativeTime(log.date, log.time)}
                  </span>
                </div>

                {log.notes && (
                  <p className="activity-feed__notes">{log.notes}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
