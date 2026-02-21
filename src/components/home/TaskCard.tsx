import { format, isPast, isToday } from 'date-fns';
import { CheckCircle, Circle, User } from 'lucide-react';
import { useAppStore } from '../../store';
import type { Reminder, ReminderType } from '../../types';
import './TaskCard.css';

interface TaskCardProps {
  reminder: Reminder;
}

const TYPE_CONFIG: Record<ReminderType, { label: string; color: string }> = {
  vaccination: { label: 'Vaccination', color: '#C62828' },
  farrier: { label: 'Farrier', color: '#5D4037' },
  vet_checkup: { label: 'Vet Checkup', color: '#AD1457' },
  dental: { label: 'Dental', color: '#6A1B9A' },
  deworming: { label: 'Deworming', color: '#00695C' },
  feeding: { label: 'Feeding', color: '#2E7D32' },
  medication: { label: 'Medication', color: '#D32F2F' },
  exercise: { label: 'Exercise', color: '#F57C00' },
  grooming: { label: 'Grooming', color: '#00897B' },
  supplement: { label: 'Supplement', color: '#558B2F' },
  coggins: { label: 'Coggins', color: '#37474F' },
  other: { label: 'Other', color: '#546E7A' },
};

const PRIORITY_CONFIG: Record<Reminder['priority'], { label: string; color: string }> = {
  low: { label: 'Low', color: '#2E7D32' },
  medium: { label: 'Medium', color: '#F57C00' },
  high: { label: 'High', color: '#C62828' },
};

function formatDueDate(dueDate: string, dueTime?: string): string {
  try {
    const date = new Date(dueDate + 'T00:00:00');
    if (isToday(date)) {
      return dueTime ? `Today at ${dueTime}` : 'Today';
    }
    const dateStr = format(date, 'MMM d, yyyy');
    return dueTime ? `${dateStr} at ${dueTime}` : dateStr;
  } catch {
    return dueDate;
  }
}

function isOverdue(dueDate: string, dueTime?: string, completed?: boolean): boolean {
  if (completed) return false;
  try {
    const dateStr = dueTime ? `${dueDate}T${dueTime}:00` : `${dueDate}T23:59:59`;
    return isPast(new Date(dateStr));
  } catch {
    return false;
  }
}

export function TaskCard({ reminder }: TaskCardProps) {
  const horses = useAppStore((state) => state.horses);
  const teamMembers = useAppStore((state) => state.teamMembers);
  const completeReminder = useAppStore((state) => state.completeReminder);

  const horse = reminder.horseId
    ? horses.find((h) => h.id === reminder.horseId)
    : null;

  const assignedMember = reminder.assignedTo
    ? teamMembers.find((m) => m.id === reminder.assignedTo)
    : null;

  const typeConfig = TYPE_CONFIG[reminder.type] || TYPE_CONFIG.other;
  const priorityConfig = PRIORITY_CONFIG[reminder.priority];
  const overdue = isOverdue(reminder.dueDate, reminder.dueTime, reminder.completed);

  const handleToggleComplete = () => {
    if (!reminder.completed) {
      completeReminder(reminder.id);
    }
  };

  return (
    <div className={`task-card ${reminder.completed ? 'task-card--completed' : ''} ${overdue ? 'task-card--overdue' : ''}`}>
      <button
        className="task-card__checkbox"
        onClick={handleToggleComplete}
        aria-label={reminder.completed ? 'Completed' : 'Mark as complete'}
        disabled={reminder.completed}
      >
        {reminder.completed ? (
          <CheckCircle size={22} className="task-card__check-icon task-card__check-icon--done" />
        ) : (
          <Circle size={22} className="task-card__check-icon" />
        )}
      </button>

      <div className="task-card__content">
        <div className="task-card__header">
          <span className={`task-card__title ${reminder.completed ? 'task-card__title--done' : ''}`}>
            {reminder.title}
          </span>
          <div className="task-card__badges">
            <span
              className="task-card__priority-dot"
              style={{ backgroundColor: priorityConfig.color }}
              title={`${priorityConfig.label} priority`}
            />
            <span
              className="task-card__type-badge"
              style={{ backgroundColor: typeConfig.color }}
            >
              {typeConfig.label}
            </span>
          </div>
        </div>

        <div className="task-card__details">
          {horse && (
            <span className="task-card__horse-name">{horse.name}</span>
          )}
          <span className={`task-card__due-date ${overdue ? 'task-card__due-date--overdue' : ''}`}>
            {overdue && 'Overdue: '}
            {formatDueDate(reminder.dueDate, reminder.dueTime)}
          </span>
        </div>

        {assignedMember && (
          <div className="task-card__assigned">
            <User size={12} />
            <span>{assignedMember.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
