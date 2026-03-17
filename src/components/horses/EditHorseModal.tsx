import { useState, useEffect, useRef, FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { useAppStore } from '../../store';
import { storageService } from '../../services/storageService';
import type { Horse } from '../../types';
import './EditHorseModal.css';

interface EditHorseModalProps {
  isOpen: boolean;
  onClose: () => void;
  horse: Horse;
}

export function EditHorseModal({ isOpen, onClose, horse }: EditHorseModalProps) {
  const updateHorse = useAppStore((state) => state.updateHorse);
  const businessId = useAppStore((state) => state.businessId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(horse.name);
  const [breed, setBreed] = useState(horse.breed);
  const [color, setColor] = useState(horse.color);
  const [gender, setGender] = useState<Horse['gender']>(horse.gender);
  const [birthDate, setBirthDate] = useState(horse.birthDate);
  const [stallLocation, setStallLocation] = useState(horse.stallLocation || '');
  const [photo, setPhoto] = useState(horse.photo || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(horse.photo || '');
  const [notes, setNotes] = useState(horse.notes || '');
  const [medications, setMedications] = useState(horse.medications.join(', '));
  const [allergies, setAllergies] = useState(horse.allergies.join(', '));
  const [specialNeeds, setSpecialNeeds] = useState(horse.specialNeeds || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setName(horse.name);
    setBreed(horse.breed);
    setColor(horse.color);
    setGender(horse.gender);
    setBirthDate(horse.birthDate);
    setStallLocation(horse.stallLocation || '');
    setPhoto(horse.photo || '');
    setPhotoFile(null);
    setPhotoPreview(horse.photo || '');
    setNotes(horse.notes || '');
    setMedications(horse.medications.join(', '));
    setAllergies(horse.allergies.join(', '));
    setSpecialNeeds(horse.specialNeeds || '');
    setErrors({});
    setSubmitting(false);
  }, [horse]);

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

    let photoUrl = photo.trim() || undefined;

    if (photoFile && businessId) {
      const { data, error } = await storageService.uploadHorsePhoto(businessId, horse.id, photoFile);
      if (data) {
        photoUrl = data.url;
      } else if (error) {
        console.error('Photo upload failed:', error);
      }
    }

    const parseList = (val: string): string[] =>
      val.split(',').map((s) => s.trim()).filter(Boolean);

    const updates: Partial<Horse> = {
      name: name.trim(),
      breed: breed.trim(),
      color: color.trim(),
      gender,
      birthDate,
      stallLocation: stallLocation.trim() || undefined,
      photo: photoUrl,
      notes: notes.trim() || undefined,
      medications: parseList(medications),
      allergies: parseList(allergies),
      specialNeeds: specialNeeds.trim() || undefined,
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

        {/* Photo Upload */}
        <div className="form-group">
          <label className="form-label">Photo</label>
          <div className="photo-upload-area">
            {photoPreview ? (
              <div className="photo-upload-preview">
                <img src={photoPreview} alt="Preview" />
                <button
                  type="button"
                  className="photo-upload-remove"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(''); setPhoto(''); }}
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

        {/* Medical Fields */}
        <div className="form-group">
          <label htmlFor="edit-horse-medications" className="form-label">
            Current Medications
          </label>
          <input
            id="edit-horse-medications"
            type="text"
            className="form-input"
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            placeholder="Comma-separated, e.g. Bute, Banamine, Adequan"
          />
          <span className="form-hint">Separate multiple medications with commas</span>
        </div>

        <div className="form-group">
          <label htmlFor="edit-horse-allergies" className="form-label">
            Known Allergies
          </label>
          <input
            id="edit-horse-allergies"
            type="text"
            className="form-input"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="Comma-separated, e.g. Penicillin, Alfalfa"
          />
          <span className="form-hint">Separate multiple allergies with commas</span>
        </div>

        <div className="form-group">
          <label htmlFor="edit-horse-special-needs" className="form-label">
            Special Needs
          </label>
          <textarea
            id="edit-horse-special-needs"
            className="form-textarea"
            value={specialNeeds}
            onChange={(e) => setSpecialNeeds(e.target.value)}
            placeholder="Any special care requirements..."
            rows={2}
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
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
