import { useState, useMemo } from 'react';
import {
  Bell,
  Plus,
  Check,
  Clock,
  AlertTriangle,
  ChevronDown,
  ArrowUpDown,
  Syringe,
  Scissors,
  Stethoscope,
  Pill,
  Dumbbell,
  Sparkles,
  FileText,
  CalendarDays,
  X,
} from 'lucide-react';
import { useAppStore } from '../store';
import { useTranslation } from '../i18n';
import type { Reminder, ReminderType, RepeatInterval } from '../types';
import './RemindersPage.css';

const REPEAT_OPTIONS: { value: RepeatInterval; label: string }[] = [
  { value: 'never', label: 'One-off (no repeat)' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'biannually', label: 'Bi-annually' },
  { value: 'yearly', label: 'Yearly' },
];

const ROLE_ASSIGNMENTS: { value: string; label: string }[] = [
  { value: '', label: 'Unassigned' },
  { value: 'all_staff', label: 'All Staff' },
  { value: 'role:trainer', label: 'All Trainers' },
  { value: 'role:rider', label: 'All Riders' },
  { value: 'role:stable_hand', label: 'All Stable Hands' },
  { value: 'role:farrier', label: 'All Farriers' },
  { value: 'role:vet', label: 'All Vets' },
];

type TabFilter = 'all' | 'active' | 'completed' | 'overdue';
type SortBy = 'dueDate' | 'priority';

const REMINDER_TYPE_ICONS: Record<ReminderType, React.ReactNode> = {
  vaccination: <Syringe size={16} />,
  farrier: <Scissors size={16} />,
  vet_checkup: <Stethoscope size={16} />,
  dental: <Stethoscope size={16} />,
  deworming: <Pill size={16} />,
  feeding: <Clock size={16} />,
  medication: <Pill size={16} />,
  exercise: <Dumbbell size={16} />,
  grooming: <Sparkles size={16} />,
  supplement: <Pill size={16} />,
  coggins: <FileText size={16} />,
  other: <Bell size={16} />,
};

const PRIORITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function isOverdue(reminder: Reminder): boolean {
  if (reminder.completed) return false;
  const now = new Date();
  const due = new Date(reminder.dueDate);
  due.setHours(23, 59, 59, 999);
  return due < now;
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = dueDay.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays <= 7) return `In ${diffDays} days`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function RemindersPage() {
  const { t } = useTranslation();
  const {
    reminders,
    horses,
    teamMembers,
    completeReminder,
    updateReminder,
    addReminder,
    deleteReminder,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [filterHorseId, setFilterHorseId] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showHorseFilter, setShowHorseFilter] = useState(false);

  // New reminder form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ReminderType>('other');
  const [newHorseId, setNewHorseId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newRepeat, setNewRepeat] = useState<RepeatInterval>('never');
  const [newNotes, setNewNotes] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState('');
  const [formError, setFormError] = useState('');

  const getHorseName = (horseId: string | undefined): string => {
    if (!horseId) return 'General';
    const horse = horses.find((h) => h.id === horseId);
    return horse?.name || 'Unknown Horse';
  };

  const getAssigneeName = (assignedTo: string | undefined): string | null => {
    if (!assignedTo) return null;
    if (assignedTo === 'all_staff') return 'All Staff';
    if (assignedTo.startsWith('role:')) {
      const role = assignedTo.replace('role:', '');
      return `All ${role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}s`;
    }
    const member = teamMembers.find((m) => m.id === assignedTo);
    return member?.name || null;
  };

  // Filter and sort reminders
  const filteredReminders = useMemo(() => {
    let filtered = [...reminders];

    // Filter by horse
    if (filterHorseId !== 'all') {
      filtered = filtered.filter((r) => r.horseId === filterHorseId);
    }

    // Filter by tab
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter((r) => !r.completed && !isOverdue(r));
        break;
      case 'completed':
        filtered = filtered.filter((r) => r.completed);
        break;
      case 'overdue':
        filtered = filtered.filter((r) => isOverdue(r));
        break;
      // 'all' shows everything
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
    });

    return filtered;
  }, [reminders, activeTab, sortBy, filterHorseId]);

  const overdueCount = useMemo(
    () => reminders.filter((r) => isOverdue(r)).length,
    [reminders]
  );

  const activeCount = useMemo(
    () => reminders.filter((r) => !r.completed && !isOverdue(r)).length,
    [reminders]
  );

  const completedCount = useMemo(
    () => reminders.filter((r) => r.completed).length,
    [reminders]
  );

  function handleToggleComplete(reminder: Reminder) {
    if (reminder.completed) {
      updateReminder(reminder.id, { completed: false, completedAt: undefined });
    } else {
      completeReminder(reminder.id);
    }
  }

  function handleAddReminder() {
    setFormError('');

    if (!newTitle.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!newDueDate) {
      setFormError('Due date is required');
      return;
    }

    const reminder: Reminder = {
      id: crypto.randomUUID(),
      horseId: newHorseId || '',
      title: newTitle.trim(),
      type: newType,
      dueDate: newDueDate,
      priority: newPriority,
      repeat: newRepeat,
      leadReminder: '1day',
      notes: newNotes.trim() || undefined,
      completed: false,
      assignedTo: newAssignedTo || undefined,
      createdAt: new Date().toISOString(),
    };

    addReminder(reminder);

    // Reset form
    setNewTitle('');
    setNewType('other');
    setNewHorseId('');
    setNewDueDate('');
    setNewPriority('medium');
    setNewRepeat('never');
    setNewNotes('');
    setNewAssignedTo('');
    setShowAddForm(false);
  }

  function renderEmptyState() {
    const messages: Record<TabFilter, { icon: React.ReactNode; text: string }> = {
      all: {
        icon: <Bell size={48} />,
        text: t('reminders.noReminders'),
      },
      active: {
        icon: <Check size={48} />,
        text: 'No active reminders. Everything is up to date!',
      },
      completed: {
        icon: <CalendarDays size={48} />,
        text: 'No completed reminders yet.',
      },
      overdue: {
        icon: <AlertTriangle size={48} />,
        text: 'No overdue reminders. Great job staying on top of things!',
      },
    };

    const { icon, text } = messages[activeTab];

    return (
      <div className="reminders-empty">
        <div className="reminders-empty__icon">{icon}</div>
        <p className="reminders-empty__text">{text}</p>
        {activeTab !== 'completed' && activeTab !== 'overdue' && (
          <button
            className="reminders-empty__btn"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={18} />
            {t('reminders.addReminder')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="reminders-page">
      {/* Header */}
      <div className="reminders-header">
        <div className="reminders-header__left">
          <h1 className="reminders-header__title">{t('reminders.title')}</h1>
          <span className="reminders-header__count">
            {reminders.length} total
          </span>
        </div>
        <button
          className="reminders-header__add-btn"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={18} />
          <span>{t('reminders.addReminder')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="reminders-tabs">
        <button
          className={`reminders-tab ${activeTab === 'all' ? 'reminders-tab--active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
          <span className="reminders-tab__badge">{reminders.length}</span>
        </button>
        <button
          className={`reminders-tab ${activeTab === 'active' ? 'reminders-tab--active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active
          <span className="reminders-tab__badge">{activeCount}</span>
        </button>
        <button
          className={`reminders-tab ${activeTab === 'completed' ? 'reminders-tab--active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          {t('reminders.completed')}
          <span className="reminders-tab__badge">{completedCount}</span>
        </button>
        <button
          className={`reminders-tab ${activeTab === 'overdue' ? 'reminders-tab--active' : ''} ${overdueCount > 0 ? 'reminders-tab--overdue' : ''}`}
          onClick={() => setActiveTab('overdue')}
        >
          {t('reminders.overdue')}
          {overdueCount > 0 && (
            <span className="reminders-tab__badge reminders-tab__badge--overdue">
              {overdueCount}
            </span>
          )}
        </button>
      </div>

      {/* Controls Row */}
      <div className="reminders-controls">
        {/* Sort */}
        <div className="reminders-control-group">
          <button
            className="reminders-control-btn"
            onClick={() => {
              setShowSortDropdown(!showSortDropdown);
              setShowHorseFilter(false);
            }}
          >
            <ArrowUpDown size={16} />
            <span>Sort: {sortBy === 'dueDate' ? 'Due Date' : 'Priority'}</span>
            <ChevronDown size={14} />
          </button>
          {showSortDropdown && (
            <div className="reminders-dropdown">
              <button
                className={`reminders-dropdown__item ${sortBy === 'dueDate' ? 'reminders-dropdown__item--active' : ''}`}
                onClick={() => {
                  setSortBy('dueDate');
                  setShowSortDropdown(false);
                }}
              >
                Due Date
              </button>
              <button
                className={`reminders-dropdown__item ${sortBy === 'priority' ? 'reminders-dropdown__item--active' : ''}`}
                onClick={() => {
                  setSortBy('priority');
                  setShowSortDropdown(false);
                }}
              >
                Priority
              </button>
            </div>
          )}
        </div>

        {/* Filter by Horse */}
        <div className="reminders-control-group">
          <button
            className="reminders-control-btn"
            onClick={() => {
              setShowHorseFilter(!showHorseFilter);
              setShowSortDropdown(false);
            }}
          >
            <span>
              Horse:{' '}
              {filterHorseId === 'all'
                ? 'All'
                : getHorseName(filterHorseId)}
            </span>
            <ChevronDown size={14} />
          </button>
          {showHorseFilter && (
            <div className="reminders-dropdown">
              <button
                className={`reminders-dropdown__item ${filterHorseId === 'all' ? 'reminders-dropdown__item--active' : ''}`}
                onClick={() => {
                  setFilterHorseId('all');
                  setShowHorseFilter(false);
                }}
              >
                All Horses
              </button>
              {horses.map((horse) => (
                <button
                  key={horse.id}
                  className={`reminders-dropdown__item ${filterHorseId === horse.id ? 'reminders-dropdown__item--active' : ''}`}
                  onClick={() => {
                    setFilterHorseId(horse.id);
                    setShowHorseFilter(false);
                  }}
                >
                  {horse.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reminder List */}
      <div className="reminders-list">
        {filteredReminders.length === 0 ? (
          renderEmptyState()
        ) : (
          filteredReminders.map((reminder) => {
            const overdue = isOverdue(reminder);
            const assigneeName = getAssigneeName(reminder.assignedTo);

            return (
              <div
                key={reminder.id}
                className={`reminder-card ${overdue ? 'reminder-card--overdue' : ''} ${reminder.completed ? 'reminder-card--completed' : ''}`}
              >
                <div className="reminder-card__checkbox-col">
                  <button
                    className={`reminder-card__checkbox ${reminder.completed ? 'reminder-card__checkbox--checked' : ''}`}
                    onClick={() => handleToggleComplete(reminder)}
                    aria-label={reminder.completed ? 'Mark incomplete' : t('reminders.markComplete')}
                  >
                    {reminder.completed && <Check size={14} />}
                  </button>
                </div>

                <div className="reminder-card__content">
                  <div className="reminder-card__top-row">
                    <h3 className={`reminder-card__title ${reminder.completed ? 'reminder-card__title--completed' : ''}`}>
                      {reminder.title}
                    </h3>
                    <div className="reminder-card__badges">
                      <span className={`reminder-badge reminder-badge--type`}>
                        {REMINDER_TYPE_ICONS[reminder.type]}
                        <span>{t(`reminders.types.${reminder.type}`)}</span>
                      </span>
                      <span className={`reminder-badge reminder-badge--priority reminder-badge--${reminder.priority}`}>
                        {t(`reminders.priority.${reminder.priority}`)}
                      </span>
                    </div>
                  </div>

                  <div className="reminder-card__details">
                    <span className="reminder-card__horse">
                      {getHorseName(reminder.horseId)}
                    </span>
                    <span className="reminder-card__separator">|</span>
                    <span className={`reminder-card__due ${overdue ? 'reminder-card__due--overdue' : ''}`}>
                      {overdue && <AlertTriangle size={14} />}
                      {formatDueDate(reminder.dueDate)}
                    </span>
                    {reminder.repeat && reminder.repeat !== 'never' && (
                      <>
                        <span className="reminder-card__separator">|</span>
                        <span className="reminder-card__repeat">
                          Repeats {reminder.repeat}
                        </span>
                      </>
                    )}
                    {assigneeName && (
                      <>
                        <span className="reminder-card__separator">|</span>
                        <span className="reminder-card__assignee">
                          Assigned to {assigneeName}
                        </span>
                      </>
                    )}
                  </div>

                  {reminder.notes && (
                    <p className="reminder-card__notes">{reminder.notes}</p>
                  )}
                </div>

                <button
                  className="reminder-card__delete"
                  onClick={() => deleteReminder(reminder.id)}
                  aria-label="Delete reminder"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Reminder Modal */}
      {showAddForm && (
        <div className="reminders-modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="reminders-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reminders-modal__header">
              <h2>{t('reminders.addReminder')}</h2>
              <button
                className="reminders-modal__close"
                onClick={() => setShowAddForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="reminders-modal__error">{formError}</div>
            )}

            <div className="reminders-modal__body">
              <div className="reminders-form__field">
                <label htmlFor="reminder-title">Title *</label>
                <input
                  id="reminder-title"
                  type="text"
                  className="reminders-form__input"
                  placeholder="e.g. Farrier appointment"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="reminders-form__row">
                <div className="reminders-form__field">
                  <label htmlFor="reminder-type">Type</label>
                  <select
                    id="reminder-type"
                    className="reminders-form__select"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ReminderType)}
                  >
                    {(Object.keys(REMINDER_TYPE_ICONS) as ReminderType[]).map((type) => (
                      <option key={type} value={type}>
                        {t(`reminders.types.${type}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="reminders-form__field">
                  <label htmlFor="reminder-horse">Horse</label>
                  <select
                    id="reminder-horse"
                    className="reminders-form__select"
                    value={newHorseId}
                    onChange={(e) => setNewHorseId(e.target.value)}
                  >
                    <option value="">General (no horse)</option>
                    {horses.map((horse) => (
                      <option key={horse.id} value={horse.id}>
                        {horse.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="reminders-form__row">
                <div className="reminders-form__field">
                  <label htmlFor="reminder-due">Due Date *</label>
                  <input
                    id="reminder-due"
                    type="date"
                    className="reminders-form__input"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>

                <div className="reminders-form__field">
                  <label htmlFor="reminder-priority">Priority</label>
                  <select
                    id="reminder-priority"
                    className="reminders-form__select"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
                  >
                    <option value="low">{t('reminders.priority.low')}</option>
                    <option value="medium">{t('reminders.priority.medium')}</option>
                    <option value="high">{t('reminders.priority.high')}</option>
                  </select>
                </div>
              </div>

              <div className="reminders-form__row">
                <div className="reminders-form__field">
                  <label htmlFor="reminder-repeat">Repeat</label>
                  <select
                    id="reminder-repeat"
                    className="reminders-form__select"
                    value={newRepeat}
                    onChange={(e) => setNewRepeat(e.target.value as RepeatInterval)}
                  >
                    {REPEAT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="reminders-form__field">
                  <label htmlFor="reminder-assign">Assign To</label>
                  <select
                    id="reminder-assign"
                    className="reminders-form__select"
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                  >
                    {ROLE_ASSIGNMENTS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                    {teamMembers
                      .filter((m) => m.status === 'active')
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="reminders-form__field">
                <label htmlFor="reminder-notes">Notes</label>
                <textarea
                  id="reminder-notes"
                  className="reminders-form__textarea"
                  placeholder="Optional notes..."
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="reminders-modal__footer">
              <button
                className="reminders-modal__cancel"
                onClick={() => setShowAddForm(false)}
              >
                {t('common.cancel')}
              </button>
              <button
                className="reminders-modal__submit"
                onClick={handleAddReminder}
              >
                {t('reminders.addReminder')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
