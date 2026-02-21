import { useState, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from '../ui/Modal';
import { useAppStore } from '../../store';
import type { Horse } from '../../types';
import './AddHorseModal.css';

interface AddHorseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddHorseModal({ isOpen, onClose }: AddHorseModalProps) {
  const addHorse = useAppStore((state) => state.addHorse);

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [color, setColor] = useState('');
  const [gender, setGender] = useState<Horse['gender']>('gelding');
  const [birthDate, setBirthDate] = useState('');
  const [stallLocation, setStallLocation] = useState('');
  const [photo, setPhoto] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setName('');
    setBreed('');
    setColor('');
    setGender('gelding');
    setBirthDate('');
    setStallLocation('');
    setPhoto('');
    setNotes('');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Horse name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const horse: Horse = {
      id: uuidv4(),
      name: name.trim(),
      breed: breed.trim(),
      color: color.trim(),
      gender,
      birthDate,
      stallLocation: stallLocation.trim() || undefined,
      photo: photo.trim() || undefined,
      notes: notes.trim() || undefined,
      feedingSchedule: {
        feedingsPerDay: 2,
        feedTimes: ['07:00', '18:00'],
      },
      emergencyContacts: [],
      allergies: [],
      medications: [],
      createdAt: new Date().toISOString(),
    };

    addHorse(horse);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Horse" size="lg">
      <form className="add-horse-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="horse-name" className="form-label">
              Name <span className="required">*</span>
            </label>
            <input
              id="horse-name"
              type="text"
              className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter horse name"
              autoFocus
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="horse-breed" className="form-label">
              Breed
            </label>
            <input
              id="horse-breed"
              type="text"
              className="form-input"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="e.g. Thoroughbred"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="horse-color" className="form-label">
              Color
            </label>
            <input
              id="horse-color"
              type="text"
              className="form-input"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Bay, Chestnut"
            />
          </div>

          <div className="form-group">
            <label htmlFor="horse-gender" className="form-label">
              Gender
            </label>
            <select
              id="horse-gender"
              className="form-select"
              value={gender}
              onChange={(e) => setGender(e.target.value as Horse['gender'])}
            >
              <option value="mare">Mare</option>
              <option value="gelding">Gelding</option>
              <option value="stallion">Stallion</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="horse-birthdate" className="form-label">
              Birth Date
            </label>
            <input
              id="horse-birthdate"
              type="date"
              className="form-input"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="horse-stall" className="form-label">
              Stall Location
            </label>
            <input
              id="horse-stall"
              type="text"
              className="form-input"
              value={stallLocation}
              onChange={(e) => setStallLocation(e.target.value)}
              placeholder="e.g. Barn A - Stall 3"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="horse-photo" className="form-label">
            Photo URL
          </label>
          <input
            id="horse-photo"
            type="text"
            className="form-input"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="horse-notes" className="form-label">
            Notes
          </label>
          <textarea
            id="horse-notes"
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes about this horse..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            Add Horse
          </button>
        </div>
      </form>
    </Modal>
  );
}
