import { useState, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from '../ui/Modal';
import { useAppStore } from '../../store';
import type { CalendarEvent, EventType } from '../../types';
import './AddEventModal.css';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDate?: string;
  preselectedHorseId?: string;
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'vet_visit', label: 'Vet Visit' },
  { value: 'farrier', label: 'Farrier' },
  { value: 'lesson', label: 'Lesson' },
  { value: 'show', label: 'Show' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'other', label: 'Other' },
];

export function AddEventModal({ isOpen, onClose, preselectedDate, preselectedHorseId }: AddEventModalProps) {
  const horses = useAppStore((state) => state.horses);
  const calendarTypes = useAppStore((state) => state.calendarTypes);
  const addEvent = useAppStore((state) => state.addEvent);

  const [title, setTitle] = useState('');
  const [horseId, setHorseId] = useState(preselectedHorseId || '');
  const [eventType, setEventType] = useState<EventType>('vet_visit');
  const [date, setDate] = useState(preselectedDate || '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [calendarId, setCalendarId] = useState('horse_care');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setTitle('');
    setHorseId(preselectedHorseId || '');
    setEventType('vet_visit');
    setDate(preselectedDate || '');
    setStartTime('');
    setEndTime('');
    setAllDay(false);
    setLocation('');
    setCalendarId('horse_care');
    setNotes('');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!date) {
      newErrors.date = 'Date is required';
    }
    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const event: CalendarEvent = {
      id: uuidv4(),
      horseId: horseId || '',
      title: title.trim(),
      type: eventType,
      date,
      startTime: allDay ? undefined : startTime || undefined,
      endTime: allDay ? undefined : endTime || undefined,
      allDay,
      location: location.trim() || undefined,
      calendarId: calendarId || undefined,
      notes: notes.trim() || undefined,
    };

    addEvent(event);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAllDayChange = (checked: boolean) => {
    setAllDay(checked);
    if (checked) {
      setStartTime('');
      setEndTime('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Event" size="lg">
      <form className="add-event-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="event-title" className="form-label">
            Title <span className="required">*</span>
          </label>
          <input
            id="event-title"
            type="text"
            className={`form-input ${errors.title ? 'form-input--error' : ''}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Vet appointment for Thunder"
            autoFocus
          />
          {errors.title && <span className="form-error">{errors.title}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="event-horse" className="form-label">
              Horse
            </label>
            <select
              id="event-horse"
              className="form-select"
              value={horseId}
              onChange={(e) => setHorseId(e.target.value)}
            >
              <option value="">No specific horse</option>
              {horses.map((horse) => (
                <option key={horse.id} value={horse.id}>
                  {horse.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="event-type" className="form-label">
              Event Type
            </label>
            <select
              id="event-type"
              className="form-select"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
            >
              {EVENT_TYPES.map((et) => (
                <option key={et.value} value={et.value}>
                  {et.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="event-date" className="form-label">
            Date <span className="required">*</span>
          </label>
          <input
            id="event-date"
            type="date"
            className={`form-input ${errors.date ? 'form-input--error' : ''}`}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <span className="form-error">{errors.date}</span>}
        </div>

        <div className="form-group">
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={allDay}
              onChange={(e) => handleAllDayChange(e.target.checked)}
            />
            <span className="form-checkbox-text">All Day Event</span>
          </label>
        </div>

        {!allDay && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event-start" className="form-label">
                Start Time
              </label>
              <input
                id="event-start"
                type="time"
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-end" className="form-label">
                End Time
              </label>
              <input
                id="event-end"
                type="time"
                className={`form-input ${errors.endTime ? 'form-input--error' : ''}`}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
              {errors.endTime && <span className="form-error">{errors.endTime}</span>}
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="event-location" className="form-label">
              Location
            </label>
            <input
              id="event-location"
              type="text"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Main Arena, Barn A"
            />
          </div>

          <div className="form-group">
            <label htmlFor="event-calendar" className="form-label">
              Calendar
            </label>
            <select
              id="event-calendar"
              className="form-select"
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
            >
              {calendarTypes.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="event-notes" className="form-label">
            Notes
          </label>
          <textarea
            id="event-notes"
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details about this event..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            Add Event
          </button>
        </div>
      </form>
    </Modal>
  );
}
