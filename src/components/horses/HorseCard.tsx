import { MapPin, AlertTriangle } from 'lucide-react';
import type { Horse } from '../../types';
import './HorseCard.css';

interface HorseCardProps {
  horse: Horse;
  onClick?: (horse: Horse) => void;
}

// Deterministic color from horse name for avatar fallback
function getAvatarColor(name: string): string {
  const colors = [
    '#8B0000', '#1976D2', '#7B1FA2', '#00897B',
    '#F57C00', '#C62828', '#2E7D32', '#4527A0',
    '#00695C', '#EF6C00',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function HorseCard({ horse, onClick }: HorseCardProps) {
  const alertCount = horse.alerts ?? 0;
  const avatarColor = getAvatarColor(horse.name);
  const firstLetter = horse.name.charAt(0).toUpperCase();

  return (
    <div
      className="horse-card"
      onClick={() => onClick?.(horse)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(horse);
        }
      }}
    >
      <div className="horse-card__photo">
        {horse.photo ? (
          <img src={horse.photo} alt={horse.name} className="horse-card__image" />
        ) : (
          <div
            className="horse-card__avatar"
            style={{ backgroundColor: avatarColor }}
          >
            <span className="horse-card__avatar-letter">{firstLetter}</span>
          </div>
        )}
        {alertCount > 0 && (
          <div className="horse-card__alert-badge">
            <AlertTriangle size={12} />
            <span>{alertCount}</span>
          </div>
        )}
      </div>

      <div className="horse-card__info">
        <h3 className="horse-card__name">{horse.name}</h3>
        {horse.breed && (
          <p className="horse-card__breed">{horse.breed}</p>
        )}
        {horse.stallLocation && (
          <div className="horse-card__location">
            <MapPin size={14} />
            <span>{horse.stallLocation}</span>
          </div>
        )}
      </div>
    </div>
  );
}
