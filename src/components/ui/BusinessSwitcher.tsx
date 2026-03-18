import { useAuth } from '../../contexts/AuthContext';
import { useAppStore } from '../../store';
import './BusinessSwitcher.css';

interface BusinessSwitcherProps {
  showCombined?: boolean;
}

export function BusinessSwitcher({ showCombined = true }: BusinessSwitcherProps) {
  const { profile, activeBusiness, activeMembership } = useAuth();
  const { user } = useAppStore();

  const isTrainer = profile?.user_mode === 'trainer';
  if (!isTrainer) return null;

  const linkedBusinesses = user?.linkedBusinesses || [];
  if (linkedBusinesses.length <= 1 && !showCombined) return null;

  const activeId = activeBusiness?.id || '';

  return (
    <div className="business-switcher">
      <label className="business-switcher__label">Business:</label>
      <div className="business-switcher__options">
        {showCombined && linkedBusinesses.length > 1 && (
          <button
            className={`business-switcher__btn ${!activeId ? 'business-switcher__btn--active' : ''}`}
            onClick={() => {/* Combined view — future enhancement */}}
          >
            All
          </button>
        )}
        {linkedBusinesses.map((biz) => (
          <button
            key={biz.id}
            className={`business-switcher__btn ${biz.id === activeId ? 'business-switcher__btn--active' : ''}`}
            onClick={() => {/* Switch business context */}}
          >
            {biz.name}
          </button>
        ))}
        {linkedBusinesses.length === 0 && activeBusiness && (
          <span className="business-switcher__current">{activeBusiness.name}</span>
        )}
      </div>
    </div>
  );
}
