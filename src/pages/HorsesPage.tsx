import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, X, AlertTriangle } from 'lucide-react';
import type { Horse } from '../types';
import './HorsesPage.css';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getAlertCount(
  horseId: string,
  horseAlerts: { horseId: string; isActive: boolean }[]
): number {
  return horseAlerts.filter((a) => a.horseId === horseId && a.isActive).length;
}

export default function HorsesPage() {
  const navigate = useNavigate();
  const { profile, activeBusiness } = useAuth();
  const { horses, horseAlerts, addHorse } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter horses by search query
  const filteredHorses = useMemo(() => {
    if (!searchQuery.trim()) return horses;
    const query = searchQuery.toLowerCase().trim();
    return horses.filter(
      (h) =>
        h.name.toLowerCase().includes(query) ||
        (h.breed && h.breed.toLowerCase().includes(query)) ||
        (h.stallLocation && h.stallLocation.toLowerCase().includes(query))
    );
  }, [horses, searchQuery]);

  return (
    <div className="horses-page">
      {/* Page Header */}
      <div className="horses-page__header">
        <div className="horses-page__header-text">
          <h1 className="horses-page__title">Horses</h1>
          <p className="horses-page__subtitle">
            {horses.length} horse{horses.length !== 1 ? 's' : ''} in your barn
          </p>
        </div>
        <button
          className="horses-page__add-btn"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} />
          <span>Add Horse</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="horses-page__search">
        <Search size={18} className="horses-page__search-icon" />
        <input
          type="text"
          className="horses-page__search-input"
          placeholder="Search horses by name, breed, or stall..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="horses-page__search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Horse Cards Grid */}
      {filteredHorses.length === 0 ? (
        <div className="horses-page__empty">
          {horses.length === 0 ? (
            <>
              <div className="horses-page__empty-icon">
                <Plus size={40} />
              </div>
              <h3>No horses yet</h3>
              <p>Add your first horse to get started with care tracking.</p>
              <button
                className="horses-page__empty-btn"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={18} />
                Add Your First Horse
              </button>
            </>
          ) : (
            <>
              <div className="horses-page__empty-icon">
                <Search size={40} />
              </div>
              <h3>No results found</h3>
              <p>
                No horses match &quot;{searchQuery}&quot;. Try a different
                search term.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="horses-page__grid">
          {filteredHorses.map((horse) => {
            const alertCount = getAlertCount(horse.id, horseAlerts);
            return (
              <button
                key={horse.id}
                className="horse-card"
                onClick={() => navigate(`/horses/${horse.id}`)}
              >
                <div className="horse-card__photo">
                  {horse.photo ? (
                    <img src={horse.photo} alt={horse.name} />
                  ) : (
                    <div className="horse-card__initials">
                      {getInitials(horse.name)}
                    </div>
                  )}
                  {alertCount > 0 && (
                    <span className="horse-card__alert-badge">
                      <AlertTriangle size={12} />
                      {alertCount}
                    </span>
                  )}
                </div>
                <div className="horse-card__info">
                  <h3 className="horse-card__name">{horse.name}</h3>
                  {horse.breed && (
                    <p className="horse-card__breed">{horse.breed}</p>
                  )}
                  {horse.stallLocation && (
                    <p className="horse-card__stall">
                      Stall {horse.stallLocation}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Add Horse Modal */}
      {showAddModal && (
        <AddHorseModal
          onClose={() => setShowAddModal(false)}
          onAdd={(horse) => {
            addHorse(horse);
            setShowAddModal(false);
          }}
          businessId={activeBusiness?.id || ''}
        />
      )}
    </div>
  );
}

/* ============================================ */
/* AddHorseModal Component                      */
/* ============================================ */

interface AddHorseModalProps {
  onClose: () => void;
  onAdd: (horse: Horse) => void;
  businessId: string;
}

function AddHorseModal({ onClose, onAdd, businessId }: AddHorseModalProps) {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [color, setColor] = useState('');
  const [gender, setGender] = useState<'mare' | 'gelding' | 'stallion'>('gelding');
  const [birthDate, setBirthDate] = useState('');
  const [stallLocation, setStallLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length > 0 && !submitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);

    const newHorse: Horse = {
      id: crypto.randomUUID(),
      name: name.trim(),
      breed: breed.trim() || '',
      color: color.trim() || '',
      gender,
      birthDate,
      stallLocation: stallLocation.trim() || '',
      photo: undefined,
      feedingSchedule: {
        feedingsPerDay: 2,
        feedTimes: ['07:00', '18:00'],
      },
      emergencyContacts: [],
      allergies: [],
      medications: [],
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAdd(newHorse);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Add New Horse</h2>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__field">
            <label className="modal__label" htmlFor="horse-name">
              Name <span className="modal__required">*</span>
            </label>
            <input
              id="horse-name"
              type="text"
              className="modal__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Thunderbolt"
              autoFocus
              required
            />
          </div>

          <div className="modal__row">
            <div className="modal__field">
              <label className="modal__label" htmlFor="horse-breed">
                Breed
              </label>
              <input
                id="horse-breed"
                type="text"
                className="modal__input"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g., Thoroughbred"
              />
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="horse-color">
                Color
              </label>
              <input
                id="horse-color"
                type="text"
                className="modal__input"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g., Bay"
              />
            </div>
          </div>

          <div className="modal__row">
            <div className="modal__field">
              <label className="modal__label" htmlFor="horse-gender">
                Gender
              </label>
              <select
                id="horse-gender"
                className="modal__select"
                value={gender}
                onChange={(e) =>
                  setGender(e.target.value as 'mare' | 'gelding' | 'stallion')
                }
              >
                <option value="gelding">Gelding</option>
                <option value="mare">Mare</option>
                <option value="stallion">Stallion</option>
              </select>
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="horse-birth">
                Birth Date
              </label>
              <input
                id="horse-birth"
                type="date"
                className="modal__input"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="horse-stall">
              Stall Location
            </label>
            <input
              id="horse-stall"
              type="text"
              className="modal__input"
              value={stallLocation}
              onChange={(e) => setStallLocation(e.target.value)}
              placeholder="e.g., A-12"
            />
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="horse-notes">
              Notes
            </label>
            <textarea
              id="horse-notes"
              className="modal__textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this horse..."
              rows={3}
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
              {submitting ? 'Adding...' : 'Add Horse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
