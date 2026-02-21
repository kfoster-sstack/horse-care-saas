import { useState, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from '../ui/Modal';
import { useAppStore } from '../../store';
import type { Reminder, ReminderType, RepeatInterval, LeadTime } from '../../types';
import './AddReminderModal.css';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedHorseId?: string;
}

const REMINDER_TYPES: { value: ReminderType; label: string }[] = [
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'farrier', label: 'Farrier' },
  { value: 'vet_checkup', label: 'Vet Checkup' },
  { value: 'dental', label: 'Dental' },
  { value: 'deworming', label: 'Deworming' },
  { value: 'feeding', label: 'Feeding' },
  { value: 'medication', label: 'Medication' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'supplement', label: 'Supplement' },
  { value: 'coggins', label: 'Coggins' },
  { value: 'other', label: 'Other' },
];

const REPEAT_OPTIONS: { value: RepeatInterval; label: string }[] = [
  { value: 'never', label: 'Never' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'biannually', label: 'Bi-annually' },
  { value: 'yearly', label: 'Yearly' },
];

const LEAD_OPTIONS: { value: LeadTime; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: '15min', label: '15 minutes before' },
  { value: '1hour', label: '1 hour before' },
  { value: '1day', label: '1 day before' },
  { value: '3days', label: '3 days before' },
  { value: '1week', label: '1 week before' },
  { value: '2weeks', label: '2 weeks before' },
];

const PRIORITY_OPTIONS: { value: Reminder['priority']; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#2E7D32' },
  { value: 'medium', label: 'Medium', color: '#F57C00' },
  { value: 'high', label: 'High', color: '#C62828' },
];

export function AddReminderModal({ isOpen, onClose, preselectedHorseId }: AddReminderModalProps) {
  const horses = useAppStore((state) => state.horses);
  const teamMembers = useAppStore((state) => state.teamMembers);
  const user = useAppStore((state) => state.user);
  const addReminder = useAppStore((state) => state.addReminder);

  const [title, setTitle] = useState('');
  const [horseId, setHorseId] = useState(preselectedHorseId || '');
  const [type, setType] = useState<ReminderType>('vaccination');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Reminder['priority']>('medium');
  const [repeat, setRepeat] = useState<RepeatInterval>('never');
  const [leadReminder, setLeadReminder] = useState<LeadTime>('1day');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isTeamPlan = user?.subscription?.tier === 'team' || user?.subscription?.tier === 'business';

  const resetForm = () => {
    setTitle('');
    setHorseId(preselectedHorseId || '');
    setType('vaccination');
    setDueDate('');
    setDueTime('');
    setPriority('medium');
    setRepeat('never');
    setLeadReminder('1day');
    setAssignedTo('');
    setNotes('');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const reminder: Reminder = {
      id: uuidv4(),
      horseId: horseId || '',
      title: title.trim(),
      type,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      repeat,
      leadReminder,
      assignedTo: assignedTo || undefined,
      notes: notes.trim() || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    addReminder(reminder);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Reminder" size="lg">
      <form className="add-reminder-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reminder-title" className="form-label">
            Title <span className="required">*</span>
          </label>
          <input
            id="reminder-title"
            type="text"
            className={`form-input ${errors.title ? 'form-input--error' : ''}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Annual vaccination due"
            autoFocus
          />
          {errors.title && <span className="form-error">{errors.title}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="reminder-horse" className="form-label">
              Horse
            </label>
            <select
              id="reminder-horse"
              className="form-select"
              value={horseId}
              onChange={(e) => setHorseId(e.target.value)}
            >
              <option value="">General reminder (no horse)</option>
              {horses.map((horse) => (
                <option key={horse.id} value={horse.id}>
                  {horse.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reminder-type" className="form-label">
              Type
            </label>
            <select
              id="reminder-type"
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value as ReminderType)}
            >
              {REMINDER_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="reminder-due-date" className="form-label">
              Due Date <span className="required">*</span>
            </label>
            <input
              id="reminder-due-date"
              type="date"
              className={`form-input ${errors.dueDate ? 'form-input--error' : ''}`}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            {errors.dueDate && <span className="form-error">{errors.dueDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reminder-due-time" className="form-label">
              Due Time
            </label>
            <input
              id="reminder-due-time"
              type="time"
              className="form-input"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Priority</label>
          <div className="priority-options">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`priority-btn ${priority === opt.value ? 'priority-btn--active' : ''}`}
                style={{ '--priority-color': opt.color } as React.CSSProperties}
                onClick={() => setPriority(opt.value)}
              >
                <span
                  className="priority-btn__dot"
                  style={{ backgroundColor: opt.color }}
                />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="reminder-repeat" className="form-label">
              Repeat
            </label>
            <select
              id="reminder-repeat"
              className="form-select"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value as RepeatInterval)}
            >
              {REPEAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reminder-lead" className="form-label">
              Lead Reminder
            </label>
            <select
              id="reminder-lead"
              className="form-select"
              value={leadReminder}
              onChange={(e) => setLeadReminder(e.target.value as LeadTime)}
            >
              {LEAD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isTeamPlan && teamMembers.length > 0 && (
          <div className="form-group">
            <label htmlFor="reminder-assign" className="form-label">
              Assign To
            </label>
            <select
              id="reminder-assign"
              className="form-select"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {teamMembers
                .filter((m) => m.status === 'active')
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="reminder-notes" className="form-label">
            Notes
          </label>
          <textarea
            id="reminder-notes"
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            Add Reminder
          </button>
        </div>
      </form>
    </Modal>
  );
}
