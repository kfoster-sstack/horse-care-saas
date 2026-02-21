import { useState, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from '../ui/Modal';
import { useAppStore } from '../../store';
import { useAuth } from '../../contexts/AuthContext';
import type { CareLog, CareLogType } from '../../types';
import './CareLogModal.css';

interface CareLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedHorseId?: string;
}

const CARE_TYPES: { value: CareLogType; label: string; color: string }[] = [
  { value: 'feeding', label: 'Feeding', color: '#2E7D32' },
  { value: 'turnout', label: 'Turnout', color: '#1976D2' },
  { value: 'blanketing', label: 'Blanketing', color: '#7B1FA2' },
  { value: 'medication', label: 'Medication', color: '#C62828' },
  { value: 'exercise', label: 'Exercise', color: '#F57C00' },
  { value: 'grooming', label: 'Grooming', color: '#00897B' },
  { value: 'health_check', label: 'Health Check', color: '#D32F2F' },
  { value: 'farrier', label: 'Farrier', color: '#5D4037' },
  { value: 'vet_visit', label: 'Vet Visit', color: '#AD1457' },
  { value: 'other', label: 'Other', color: '#546E7A' },
];

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function CareLogModal({ isOpen, onClose, preselectedHorseId }: CareLogModalProps) {
  const horses = useAppStore((state) => state.horses);
  const addCareLog = useAppStore((state) => state.addCareLog);
  const { profile } = useAuth();

  const [horseId, setHorseId] = useState(preselectedHorseId || '');
  const [careType, setCareType] = useState<CareLogType>('feeding');
  const [date, setDate] = useState(getTodayDate());
  const [time, setTime] = useState(getCurrentTime());
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loggedBy = profile?.name || profile?.email || 'Unknown User';

  const resetForm = () => {
    setHorseId(preselectedHorseId || '');
    setCareType('feeding');
    setDate(getTodayDate());
    setTime(getCurrentTime());
    setNotes('');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!horseId) {
      newErrors.horseId = 'Please select a horse';
    }
    if (!date) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const careLog: CareLog = {
      id: uuidv4(),
      horseId,
      type: careType,
      date,
      time,
      details: {},
      notes: notes.trim() || undefined,
      loggedBy,
      createdAt: new Date().toISOString(),
    };

    addCareLog(careLog);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedCareType = CARE_TYPES.find((ct) => ct.value === careType);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Log Care Activity" size="md">
      <form className="care-log-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="care-horse" className="form-label">
            Horse <span className="required">*</span>
          </label>
          <select
            id="care-horse"
            className={`form-select ${errors.horseId ? 'form-input--error' : ''}`}
            value={horseId}
            onChange={(e) => setHorseId(e.target.value)}
          >
            <option value="">Select a horse...</option>
            {horses.map((horse) => (
              <option key={horse.id} value={horse.id}>
                {horse.name}
              </option>
            ))}
          </select>
          {errors.horseId && <span className="form-error">{errors.horseId}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Care Type</label>
          <div className="care-type-grid">
            {CARE_TYPES.map((ct) => (
              <button
                key={ct.value}
                type="button"
                className={`care-type-chip ${careType === ct.value ? 'care-type-chip--active' : ''}`}
                style={{
                  '--chip-color': ct.color,
                } as React.CSSProperties}
                onClick={() => setCareType(ct.value)}
              >
                <span
                  className="care-type-chip__dot"
                  style={{ backgroundColor: ct.color }}
                />
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="care-date" className="form-label">
              Date
            </label>
            <input
              id="care-date"
              type="date"
              className={`form-input ${errors.date ? 'form-input--error' : ''}`}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="care-time" className="form-label">
              Time
            </label>
            <input
              id="care-time"
              type="time"
              className="form-input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="care-notes" className="form-label">
            Notes
          </label>
          <textarea
            id="care-notes"
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this activity..."
            rows={3}
          />
        </div>

        <div className="care-log-form__logged-by">
          <span className="care-log-form__logged-by-label">Logged by:</span>
          <span className="care-log-form__logged-by-name">{loggedBy}</span>
          {selectedCareType && (
            <span
              className="care-log-form__type-badge"
              style={{ backgroundColor: selectedCareType.color }}
            >
              {selectedCareType.label}
            </span>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            Log Activity
          </button>
        </div>
      </form>
    </Modal>
  );
}
