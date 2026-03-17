import { useState, useRef, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from '../ui/Modal';
import { useAppStore } from '../../store';
import { useAuth } from '../../contexts/AuthContext';
import { storageService } from '../../services/storageService';
import type { Horse } from '../../types';
import './AddHorseModal.css';

interface AddHorseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddHorseModal({ isOpen, onClose }: AddHorseModalProps) {
  const addHorse = useAppStore((state) => state.addHorse);
  const businessId = useAppStore((state) => state.businessId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [color, setColor] = useState('');
  const [gender, setGender] = useState<Horse['gender']>('gelding');
  const [birthDate, setBirthDate] = useState('');
  const [stallLocation, setStallLocation] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'Photo must be under 5MB' }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'File must be an image' }));
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors((prev) => { const { photo: _, ...rest } = prev; return rest; });
  };

  const resetForm = () => {
    setName('');
    setBreed('');
    setColor('');
    setGender('gelding');
    setBirthDate('');
    setStallLocation('');
    setPhoto('');
    setPhotoFile(null);
    setPhotoPreview('');
    setNotes('');
    setErrors({});
    setSubmitting(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Horse name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);

    const horseId = uuidv4();
    let photoUrl = photo.trim() || undefined;

    // Upload photo file if selected
    if (photoFile && businessId) {
      const { data, error } = await storageService.uploadHorsePhoto(businessId, horseId, photoFile);
      if (data) {
        photoUrl = data.url;
      } else if (error) {
        console.error('Photo upload failed:', error);
      }
    }

    const horse: Horse = {
      id: horseId,
      name: name.trim(),
      breed: breed.trim(),
      color: color.trim(),
      gender,
      birthDate,
      stallLocation: stallLocation.trim() || undefined,
      photo: photoUrl,
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
          <label className="form-label">
            Photo (optional)
          </label>
          <div className="photo-upload-area">
            {photoPreview ? (
              <div className="photo-upload-preview">
                <img src={photoPreview} alt="Preview" />
                <button
                  type="button"
                  className="photo-upload-remove"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(''); }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="photo-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Photo (max 5MB)
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />
            {errors.photo && <span className="form-error">{errors.photo}</span>}
          </div>
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
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Horse'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
