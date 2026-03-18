import { useState, useMemo, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
  parseISO,
} from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  Filter,
  X,
} from 'lucide-react';
import type { CalendarEvent, CalendarType } from '../types';
import { BusinessSwitcher } from '../components/ui/BusinessSwitcher';
import './CalendarPage.css';

// Default calendar type colors for fallback
const DEFAULT_COLORS: Record<string, string> = {
  horse_care: '#8B0000',
  lessons: '#1976D2',
  shifts: '#7B1FA2',
  meetings: '#00897B',
  shows: '#F57C00',
  all: '#374151',
};

// Event type to label mapping
function formatEventType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { events, horses, calendarTypes } = useAppStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Navigation handlers
  const goToPrevMonth = useCallback(
    () => setCurrentMonth((prev) => subMonths(prev, 1)),
    []
  );
  const goToNextMonth = useCallback(
    () => setCurrentMonth((prev) => addMonths(prev, 1)),
    []
  );
  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  }, []);

  // Build calendar grid (weeks x 7 days)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  // Map of date string -> events for the current grid
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    events.forEach((event) => {
      try {
        const dateKey = event.date; // Assumes YYYY-MM-DD
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(event);
      } catch {
        // skip invalid dates
      }
    });

    return map;
  }, [events]);

  // Build filter chips from calendar types
  const filterChips = useMemo(() => {
    const chips: { id: string; name: string; color: string }[] = [
      { id: 'all', name: 'All', color: DEFAULT_COLORS.all },
    ];

    calendarTypes.forEach((ct) => {
      chips.push({ id: ct.id, name: ct.name, color: ct.color });
    });

    // If no calendar types exist, add default ones
    if (calendarTypes.length === 0) {
      chips.push(
        { id: 'horse_care', name: 'Horse Care', color: '#8B0000' },
        { id: 'lessons', name: 'Lessons', color: '#1976D2' },
        { id: 'shifts', name: 'Shifts', color: '#7B1FA2' },
        { id: 'shows', name: 'Shows', color: '#F57C00' }
      );
    }

    return chips;
  }, [calendarTypes]);

  // Events for the selected date, filtered by active filter
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const dayEvents = eventsByDate.get(dateKey) || [];

    if (activeFilter === 'all') return dayEvents;

    return dayEvents.filter((e) => {
      // Match by calendarId or event type
      if (e.calendarId === activeFilter) return true;
      // Also match event type to filter ID for loose matching
      if (e.type === activeFilter) return true;
      // Match horse_care for horse-related types
      if (
        activeFilter === 'horse_care' &&
        ['vet_visit', 'farrier', 'vaccination'].includes(e.type)
      )
        return true;
      if (activeFilter === 'lessons' && e.type === 'lesson') return true;
      if (activeFilter === 'shows' && e.type === 'show') return true;
      return false;
    });
  }, [selectedDate, eventsByDate, activeFilter]);

  // Get color for an event
  const getEventColor = (event: CalendarEvent): string => {
    // Check calendar type first
    if (event.calendarId) {
      const ct = calendarTypes.find((t) => t.id === event.calendarId);
      if (ct) return ct.color;
    }

    // Fallback to type-based color
    switch (event.type) {
      case 'vet_visit':
      case 'vaccination':
      case 'farrier':
        return DEFAULT_COLORS.horse_care;
      case 'lesson':
        return DEFAULT_COLORS.lessons;
      case 'show':
        return DEFAULT_COLORS.shows;
      default:
        return '#6b7280';
    }
  };

  // Count events per date for dots (up to 4 dots shown)
  const getEventDotsForDay = (day: Date): { color: string }[] => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayEvents = eventsByDate.get(dateKey) || [];

    if (dayEvents.length === 0) return [];

    // De-duplicate by color
    const colorSet = new Set<string>();
    dayEvents.forEach((e) => {
      colorSet.add(getEventColor(e));
    });

    return Array.from(colorSet)
      .slice(0, 4)
      .map((color) => ({ color }));
  };

  // Get horse name by ID
  const getHorseName = (horseId: string | undefined): string => {
    if (!horseId) return '';
    const horse = horses.find((h) => h.id === horseId);
    return horse?.name || '';
  };

  // Day names header
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-page">
      <BusinessSwitcher />
      {/* Page Header */}
      <div className="calendar-page__header">
        <h1 className="calendar-page__title">Calendar</h1>
        <button
          className="calendar-page__add-btn"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} />
          <span>Add Event</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="calendar-page__filters">
        <Filter size={16} className="calendar-page__filter-icon" />
        <div className="calendar-page__filter-chips">
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              className={`calendar-page__filter-chip ${
                activeFilter === chip.id
                  ? 'calendar-page__filter-chip--active'
                  : ''
              }`}
              style={
                activeFilter === chip.id
                  ? { backgroundColor: chip.color, color: '#fff', borderColor: chip.color }
                  : { borderColor: `${chip.color}40`, color: chip.color }
              }
              onClick={() => setActiveFilter(chip.id)}
            >
              <span
                className="calendar-page__filter-dot"
                style={{ backgroundColor: chip.color }}
              />
              {chip.name}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Month Navigation */}
      <div className="calendar-page__nav">
        <button
          className="calendar-page__nav-btn"
          onClick={goToPrevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="calendar-page__nav-center">
          <h2 className="calendar-page__month-label">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button className="calendar-page__today-btn" onClick={goToToday}>
            Today
          </button>
        </div>
        <button
          className="calendar-page__nav-btn"
          onClick={goToNextMonth}
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-page__grid">
        {/* Day names */}
        <div className="calendar-page__day-names">
          {dayNames.map((name) => (
            <div key={name} className="calendar-page__day-name">
              {name}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="calendar-page__days">
          {calendarDays.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected =
              selectedDate !== null && isSameDay(day, selectedDate);
            const isDayToday = isToday(day);
            const dots = getEventDotsForDay(day);

            return (
              <button
                key={day.toISOString()}
                className={`calendar-page__day ${
                  !isCurrentMonth ? 'calendar-page__day--outside' : ''
                } ${isSelected ? 'calendar-page__day--selected' : ''} ${
                  isDayToday ? 'calendar-page__day--today' : ''
                }`}
                onClick={() => setSelectedDate(day)}
              >
                <span className="calendar-page__day-number">
                  {format(day, 'd')}
                </span>
                {dots.length > 0 && (
                  <div className="calendar-page__day-dots">
                    {dots.map((dot, i) => (
                      <span
                        key={i}
                        className="calendar-page__day-dot"
                        style={{ backgroundColor: dot.color }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events Panel */}
      {selectedDate && (
        <div className="calendar-page__events-panel">
          <div className="calendar-page__events-header">
            <h3 className="calendar-page__events-date">
              {isToday(selectedDate)
                ? 'Today'
                : format(selectedDate, 'EEEE, MMMM d')}
            </h3>
            <span className="calendar-page__events-count">
              {selectedDateEvents.length} event
              {selectedDateEvents.length !== 1 ? 's' : ''}
            </span>
          </div>

          {selectedDateEvents.length === 0 ? (
            <div className="calendar-page__events-empty">
              <CalendarIcon size={28} />
              <p>No events on this day.</p>
              <button
                className="calendar-page__events-empty-btn"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={14} />
                Add Event
              </button>
            </div>
          ) : (
            <div className="calendar-page__events-list">
              {selectedDateEvents
                .sort((a, b) => {
                  // Sort all-day first, then by time
                  if (a.allDay && !b.allDay) return -1;
                  if (!a.allDay && b.allDay) return 1;
                  return (a.startTime || '00:00').localeCompare(
                    b.startTime || '00:00'
                  );
                })
                .map((event) => {
                  const eventColor = getEventColor(event);
                  const horseName = getHorseName(event.horseId);

                  return (
                    <div
                      key={event.id}
                      className="calendar-page__event-card"
                      style={{ borderLeftColor: eventColor }}
                    >
                      <div className="calendar-page__event-info">
                        <span className="calendar-page__event-title">
                          {event.title}
                        </span>
                        <div className="calendar-page__event-meta">
                          {!event.allDay && event.startTime && (
                            <span className="calendar-page__event-time">
                              <Clock size={12} />
                              {event.startTime}
                              {event.endTime && ` - ${event.endTime}`}
                            </span>
                          )}
                          {event.allDay && (
                            <span className="calendar-page__event-time">
                              All day
                            </span>
                          )}
                          <span
                            className="calendar-page__event-type-badge"
                            style={{
                              backgroundColor: `${eventColor}15`,
                              color: eventColor,
                            }}
                          >
                            {formatEventType(event.type)}
                          </span>
                        </div>
                        {horseName && (
                          <span className="calendar-page__event-horse">
                            {horseName}
                          </span>
                        )}
                        {event.location && (
                          <span className="calendar-page__event-location">
                            <MapPin size={12} />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <AddEventModal
          horses={horses}
          calendarTypes={calendarTypes}
          selectedDate={selectedDate}
          onClose={() => setShowAddModal(false)}
          onAdd={(event) => {
            useAppStore.getState().addEvent(event);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

/* ===== Add Event Modal ===== */

interface AddEventModalProps {
  horses: { id: string; name: string }[];
  calendarTypes: CalendarType[];
  selectedDate: Date | null;
  onClose: () => void;
  onAdd: (event: CalendarEvent) => void;
}

function AddEventModal({
  horses,
  calendarTypes,
  selectedDate,
  onClose,
  onAdd,
}: AddEventModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('other');
  const [date, setDate] = useState(
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [horseId, setHorseId] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0 && date && !submitting;

  const eventTypes: { value: CalendarEvent['type']; label: string }[] = [
    { value: 'vet_visit', label: 'Vet Visit' },
    { value: 'farrier', label: 'Farrier' },
    { value: 'lesson', label: 'Lesson' },
    { value: 'show', label: 'Show' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      horseId: horseId || '',
      title: title.trim(),
      type,
      date,
      startTime: allDay ? undefined : startTime || undefined,
      endTime: allDay ? undefined : endTime || undefined,
      allDay,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      calendarId: calendarId || undefined,
    };

    onAdd(newEvent);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Add Event</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__field">
            <label className="modal__label" htmlFor="event-title">
              Title <span className="modal__required">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              className="modal__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Farrier Appointment"
              autoFocus
              required
            />
          </div>

          <div className="modal__row">
            <div className="modal__field">
              <label className="modal__label" htmlFor="event-type">
                Event Type
              </label>
              <select
                id="event-type"
                className="modal__select"
                value={type}
                onChange={(e) =>
                  setType(e.target.value as CalendarEvent['type'])
                }
              >
                {eventTypes.map((et) => (
                  <option key={et.value} value={et.value}>
                    {et.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="event-horse">
                Horse
              </label>
              <select
                id="event-horse"
                className="modal__select"
                value={horseId}
                onChange={(e) => setHorseId(e.target.value)}
              >
                <option value="">None (General)</option>
                {horses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="event-date">
              Date <span className="modal__required">*</span>
            </label>
            <input
              id="event-date"
              type="date"
              className="modal__input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="modal__field">
            <label className="modal__label modal__label--inline">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
              />
              All Day Event
            </label>
          </div>

          {!allDay && (
            <div className="modal__row">
              <div className="modal__field">
                <label className="modal__label" htmlFor="event-start">
                  Start Time
                </label>
                <input
                  id="event-start"
                  type="time"
                  className="modal__input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="modal__field">
                <label className="modal__label" htmlFor="event-end">
                  End Time
                </label>
                <input
                  id="event-end"
                  type="time"
                  className="modal__input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {calendarTypes.length > 0 && (
            <div className="modal__field">
              <label className="modal__label" htmlFor="event-calendar">
                Calendar
              </label>
              <select
                id="event-calendar"
                className="modal__select"
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
              >
                <option value="">Default</option>
                {calendarTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="modal__field">
            <label className="modal__label" htmlFor="event-location">
              Location
            </label>
            <input
              id="event-location"
              type="text"
              className="modal__input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Main Barn"
            />
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="event-notes">
              Notes
            </label>
            <textarea
              id="event-notes"
              className="modal__textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
              rows={2}
            />
          </div>

          <div className="modal__actions">
            <button
              type="button"
              className="modal__btn modal__btn--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal__btn modal__btn--primary"
              disabled={!canSubmit}
            >
              {submitting ? 'Adding...' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
