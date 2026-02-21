import { useState, useEffect, FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { useAppStore } from '../../store';
import type { Horse } from '../../types';
import './EditHorseModal.css';

interface EditHorseModalProps {
  isOpen: boolean;
  onClose: () => void;
  horse: Horse;
}

export function EditHorseModal({ isOpen, onClose, horse }: EditHorseModalProps) {
  const updateHorse = useAppStore((state) => state.updateHorse);

  const [name, setName] = useState(horse.name);
  const [breed, setBreed] = useState(horse.breed);
  const [color, setColor] = useState(horse.color);
  const [gender, setGender] = useState<Horse['gender']>(horse.gender);
  const [birthDate, setBirthDate] = useState(horse.birthDate);
  const [stallLocation, setStallLocation] = useState(horse.stallLocation || '');
  const [photo, setPhoto] = useState(horse.photo || '');
  const [notes, setNotes] = useState(horse.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Re-populate form when horse prop changes
  useEffect(() => {
    setName(horse.name);
    setBreed(horse.breed);
    setColor(horse.color);
    setGender(horse.gender);
    setBirthDate(horse.birthDate);
    setStallLocation(horse.stallLocation || '');
    setPhoto(horse.photo || '');
    setNotes(horse.notes || '');
    setErrors({});
  }, [horse]);

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

    const updates: Partial<Horse> = {
      name: name.trim(),
      breed: breed.trim(),
      color: color.trim(),
      gender,
      birthDate,
      stallLocation: stallLocation.trim() || undefined,
      photo: photo.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    updateHorse(horse.id, updates);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${horse.name}`} size="lg">
      <form className="edit-horse-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="edit-horse-name" className="form-label">
              Name <span className="required">*</span>
            </label>
            <input
              id="edit-horse-name"
              type="text"
              className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter horse name"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="edit-horse-breed" className="form-label">
              Breed
            </label>
            <input
              id="edit-horse-breed"
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
            <label htmlFor="edit-horse-color" className="form-label">
              Color
            </label>
            <input
              id="edit-horse-color"
              type="text"
              className="form-input"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Bay, Chestnut"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-horse-gender" className="form-label">
              Gender
            </label>
            <select
              id="edit-horse-gender"
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
            <label htmlFor="edit-horse-birthdate" className="form-label">
              Birth Date
            </label>
            <input
              id="edit-horse-birthdate"
              type="date"
              className="form-input"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-horse-stall" className="form-label">
              Stall Location
            </label>
            <input
              id="edit-horse-stall"
              type="text"
              className="form-input"
              value={stallLocation}
              onChange={(e) => setStallLocation(e.target.value)}
              placeholder="e.g. Barn A - Stall 3"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="edit-horse-photo" className="form-label">
            Photo URL
          </label>
          <input
            id="edit-horse-photo"
            type="text"
            className="form-input"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-horse-notes" className="form-label">
            Notes
          </label>
          <textarea
            id="edit-horse-notes"
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes about this horse..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
