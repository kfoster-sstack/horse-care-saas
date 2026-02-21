import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInYears } from 'date-fns';
import { useAppStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Edit3,
  AlertTriangle,
  ClipboardList,
  Heart,
  FileText,
  Clock,
  MapPin,
  Utensils,
  Pill,
  Phone,
  Mail,
  Plus,
  Upload,
  ShieldAlert,
  User,
  Info,
} from 'lucide-react';
import type { CareLog, Horse } from '../types';
import './HorseDetailPage.css';

type TabId = 'overview' | 'care-log' | 'medical' | 'documents';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatGender(gender: string): string {
  return gender.charAt(0).toUpperCase() + gender.slice(1);
}

function calculateAge(birthDate: string): string {
  try {
    const years = differenceInYears(new Date(), parseISO(birthDate));
    if (years < 1) return 'Under 1 year';
    return `${years} year${years !== 1 ? 's' : ''} old`;
  } catch {
    return 'Unknown age';
  }
}

function formatCareLogType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatContactRole(role: string): string {
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getCareLogIcon(type: string): string {
  const icons: Record<string, string> = {
    feeding: '🍎',
    turnout: '🌿',
    blanketing: '🧣',
    medication: '💊',
    exercise: '🏇',
    grooming: '✨',
    health_check: '🩺',
    farrier: '🔨',
    vet_visit: '👨‍⚕️',
    other: '📋',
  };
  return icons[type] || '📋';
}

export default function HorseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const {
    horses,
    careLogs,
    reminders,
    documents,
    horseAlerts,
    addCareLog,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showLogCareModal, setShowLogCareModal] = useState(false);

  // Find the horse
  const horse = useMemo(
    () => horses.find((h) => h.id === id),
    [horses, id]
  );

  // Horse-specific care logs
  const horseLogs = useMemo(
    () =>
      [...careLogs]
        .filter((l) => l.horseId === id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [careLogs, id]
  );

  // Horse-specific documents
  const horseDocs = useMemo(
    () => documents.filter((d) => d.horseId === id),
    [documents, id]
  );

  // Horse-specific reminders
  const horseReminders = useMemo(
    () => reminders.filter((r) => r.horseId === id && !r.completed),
    [reminders, id]
  );

  // Active alerts for this horse
  const activeAlerts = useMemo(
    () =>
      horseAlerts.filter(
        (a) => a.horseId === id && a.isActive
      ),
    [horseAlerts, id]
  );

  if (!horse) {
    return (
      <div className="horse-detail">
        <div className="horse-detail__not-found">
          <h2>Horse not found</h2>
          <p>The horse you are looking for does not exist or has been removed.</p>
          <button
            className="horse-detail__back-btn"
            onClick={() => navigate('/horses')}
          >
            <ArrowLeft size={18} />
            Back to Horses
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Info size={16} /> },
    { id: 'care-log', label: 'Care Log', icon: <ClipboardList size={16} /> },
    { id: 'medical', label: 'Medical', icon: <Heart size={16} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
  ];

  return (
    <div className="horse-detail">
      {/* Back button */}
      <button
        className="horse-detail__back-btn"
        onClick={() => navigate('/horses')}
      >
        <ArrowLeft size={18} />
        Back to Horses
      </button>

      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className="horse-detail__alerts-banner">
          <AlertTriangle size={18} />
          <div className="horse-detail__alerts-content">
            <strong>
              {activeAlerts.length} Active Alert
              {activeAlerts.length > 1 ? 's' : ''}
            </strong>
            <ul className="horse-detail__alerts-list">
              {activeAlerts.map((alert) => (
                <li key={alert.id}>
                  <span
                    className={`horse-detail__alert-priority horse-detail__alert-priority--${alert.priority}`}
                  >
                    {alert.priority}
                  </span>
                  {alert.title}
                  {alert.message ? ` - ${alert.message}` : ''}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Horse Header / Profile */}
      <div className="horse-detail__profile">
        <div className="horse-detail__avatar">
          {horse.photo ? (
            <img src={horse.photo} alt={horse.name} />
          ) : (
            <span className="horse-detail__avatar-initials">
              {getInitials(horse.name)}
            </span>
          )}
        </div>
        <div className="horse-detail__profile-info">
          <h1 className="horse-detail__name">{horse.name}</h1>
          <div className="horse-detail__meta-row">
            {horse.breed && (
              <span className="horse-detail__meta-item">{horse.breed}</span>
            )}
            {horse.gender && (
              <span className="horse-detail__meta-item">
                {formatGender(horse.gender)}
              </span>
            )}
            {horse.birthDate && (
              <span className="horse-detail__meta-item">
                {calculateAge(horse.birthDate)}
              </span>
            )}
          </div>
          <div className="horse-detail__quick-stats">
            <span className="horse-detail__quick-stat">
              <ClipboardList size={14} />
              {horseLogs.length} logs
            </span>
            <span className="horse-detail__quick-stat">
              <Clock size={14} />
              {horseReminders.length} reminders
            </span>
            {activeAlerts.length > 0 && (
              <span className="horse-detail__quick-stat horse-detail__quick-stat--alert">
                <AlertTriangle size={14} />
                {activeAlerts.length} alert{activeAlerts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <button
          className="horse-detail__edit-btn"
          onClick={() => {
            /* TODO: open edit modal */
          }}
        >
          <Edit3 size={16} />
          Edit
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="horse-detail__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`horse-detail__tab ${activeTab === tab.id ? 'horse-detail__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="horse-detail__tab-content">
        {activeTab === 'overview' && (
          <OverviewTab horse={horse} />
        )}
        {activeTab === 'care-log' && (
          <CareLogTab
            horseLogs={horseLogs}
            horseName={horse.name}
            onLogCare={() => setShowLogCareModal(true)}
          />
        )}
        {activeTab === 'medical' && (
          <MedicalTab horse={horse} />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab documents={horseDocs} />
        )}
      </div>

      {/* Log Care Modal */}
      {showLogCareModal && (
        <LogCareModal
          horseId={horse.id}
          horseName={horse.name}
          userName={profile?.name || 'Unknown'}
          onClose={() => setShowLogCareModal(false)}
          onLog={(log) => {
            addCareLog(log);
            setShowLogCareModal(false);
          }}
        />
      )}
    </div>
  );
}

/* ===== Overview Tab ===== */

function OverviewTab({ horse }: { horse: Horse }) {
  return (
    <div className="horse-detail__overview">
      {/* Basic Info Cards */}
      <div className="horse-detail__info-grid">
        {/* Stall Location */}
        <div className="horse-detail__info-card">
          <div className="horse-detail__info-card-header">
            <MapPin size={16} />
            <span>Stall Location</span>
          </div>
          <p className="horse-detail__info-card-value">
            {horse.stallLocation || 'Not assigned'}
          </p>
        </div>

        {/* Feeding Schedule */}
        <div className="horse-detail__info-card">
          <div className="horse-detail__info-card-header">
            <Utensils size={16} />
            <span>Feeding Schedule</span>
          </div>
          <p className="horse-detail__info-card-value">
            {horse.feedingSchedule.feedingsPerDay}x daily
          </p>
          {horse.feedingSchedule.feedTimes.length > 0 && (
            <p className="horse-detail__info-card-sub">
              Times: {horse.feedingSchedule.feedTimes.join(', ')}
            </p>
          )}
          {horse.feedingSchedule.feedType && (
            <p className="horse-detail__info-card-sub">
              Feed: {horse.feedingSchedule.feedType}
            </p>
          )}
        </div>

        {/* Allergies */}
        <div className="horse-detail__info-card">
          <div className="horse-detail__info-card-header">
            <ShieldAlert size={16} />
            <span>Allergies</span>
          </div>
          {horse.allergies.length > 0 ? (
            <div className="horse-detail__tag-list">
              {horse.allergies.map((allergy, idx) => (
                <span key={idx} className="horse-detail__tag horse-detail__tag--danger">
                  {allergy}
                </span>
              ))}
            </div>
          ) : (
            <p className="horse-detail__info-card-value horse-detail__info-card-value--muted">
              No known allergies
            </p>
          )}
        </div>

        {/* Medications */}
        <div className="horse-detail__info-card">
          <div className="horse-detail__info-card-header">
            <Pill size={16} />
            <span>Medications</span>
          </div>
          {horse.medications.length > 0 ? (
            <div className="horse-detail__tag-list">
              {horse.medications.map((med, idx) => (
                <span key={idx} className="horse-detail__tag horse-detail__tag--info">
                  {med}
                </span>
              ))}
            </div>
          ) : (
            <p className="horse-detail__info-card-value horse-detail__info-card-value--muted">
              No current medications
            </p>
          )}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="horse-detail__section">
        <h3 className="horse-detail__section-title">
          <Phone size={16} />
          Emergency Contacts
        </h3>
        {horse.emergencyContacts.length > 0 ? (
          <div className="horse-detail__contacts-list">
            {horse.emergencyContacts.map((contact) => (
              <div key={contact.id} className="horse-detail__contact-card">
                <div className="horse-detail__contact-avatar">
                  <User size={18} />
                </div>
                <div className="horse-detail__contact-info">
                  <span className="horse-detail__contact-name">
                    {contact.name}
                  </span>
                  <span className="horse-detail__contact-role">
                    {formatContactRole(contact.role)}
                  </span>
                </div>
                <div className="horse-detail__contact-actions">
                  <a href={`tel:${contact.phone}`} className="horse-detail__contact-link">
                    <Phone size={14} />
                    {contact.phone}
                  </a>
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="horse-detail__contact-link">
                      <Mail size={14} />
                      {contact.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="horse-detail__section-empty">
            No emergency contacts added yet.
          </p>
        )}
      </div>

      {/* Notes */}
      {horse.notes && (
        <div className="horse-detail__section">
          <h3 className="horse-detail__section-title">
            <FileText size={16} />
            Notes
          </h3>
          <div className="horse-detail__notes-card">
            <p>{horse.notes}</p>
          </div>
        </div>
      )}

      {/* Special Needs */}
      {horse.specialNeeds && (
        <div className="horse-detail__section">
          <h3 className="horse-detail__section-title">
            <Heart size={16} />
            Special Needs
          </h3>
          <div className="horse-detail__notes-card">
            <p>{horse.specialNeeds}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Care Log Tab ===== */

function CareLogTab({
  horseLogs,
  horseName,
  onLogCare,
}: {
  horseLogs: CareLog[];
  horseName: string;
  onLogCare: () => void;
}) {
  return (
    <div className="horse-detail__care-log">
      <div className="horse-detail__care-log-header">
        <span className="horse-detail__care-log-count">
          {horseLogs.length} log entr{horseLogs.length !== 1 ? 'ies' : 'y'}
        </span>
        <button className="horse-detail__log-care-btn" onClick={onLogCare}>
          <Plus size={16} />
          Log Care
        </button>
      </div>

      {horseLogs.length === 0 ? (
        <div className="horse-detail__empty-tab">
          <ClipboardList size={36} />
          <h3>No care logs yet</h3>
          <p>Start tracking care activities for {horseName}.</p>
          <button className="horse-detail__empty-tab-btn" onClick={onLogCare}>
            <Plus size={16} />
            Log First Entry
          </button>
        </div>
      ) : (
        <div className="horse-detail__log-list">
          {horseLogs.map((log) => {
            let logDateStr = '';
            try {
              logDateStr = format(parseISO(log.createdAt), 'MMM d, yyyy h:mm a');
            } catch {
              logDateStr = `${log.date} ${log.time}`;
            }

            return (
              <div key={log.id} className="horse-detail__log-entry">
                <div className="horse-detail__log-icon">
                  {getCareLogIcon(log.type)}
                </div>
                <div className="horse-detail__log-content">
                  <div className="horse-detail__log-title">
                    {formatCareLogType(log.type)}
                  </div>
                  <div className="horse-detail__log-date">{logDateStr}</div>
                  {log.notes && (
                    <p className="horse-detail__log-notes">{log.notes}</p>
                  )}
                  <span className="horse-detail__log-by">
                    by {log.loggedBy}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===== Medical Tab ===== */

function MedicalTab({ horse }: { horse: Horse }) {
  return (
    <div className="horse-detail__medical">
      {/* Medications */}
      <div className="horse-detail__section">
        <h3 className="horse-detail__section-title">
          <Pill size={16} />
          Current Medications
        </h3>
        {horse.medications.length > 0 ? (
          <div className="horse-detail__med-list">
            {horse.medications.map((med, idx) => (
              <div key={idx} className="horse-detail__med-item">
                <Pill size={14} />
                <span>{med}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="horse-detail__section-empty">
            No current medications recorded.
          </p>
        )}
      </div>

      {/* Allergies */}
      <div className="horse-detail__section">
        <h3 className="horse-detail__section-title">
          <ShieldAlert size={16} />
          Known Allergies
        </h3>
        {horse.allergies.length > 0 ? (
          <div className="horse-detail__tag-list">
            {horse.allergies.map((allergy, idx) => (
              <span key={idx} className="horse-detail__tag horse-detail__tag--danger">
                {allergy}
              </span>
            ))}
          </div>
        ) : (
          <p className="horse-detail__section-empty">
            No known allergies recorded.
          </p>
        )}
      </div>

      {/* Special Needs */}
      <div className="horse-detail__section">
        <h3 className="horse-detail__section-title">
          <Heart size={16} />
          Special Needs
        </h3>
        {horse.specialNeeds ? (
          <div className="horse-detail__notes-card">
            <p>{horse.specialNeeds}</p>
          </div>
        ) : (
          <p className="horse-detail__section-empty">
            No special needs documented.
          </p>
        )}
      </div>
    </div>
  );
}

/* ===== Documents Tab ===== */

function DocumentsTab({
  documents,
}: {
  documents: { id: string; name: string; category: string; uploadedAt: string; fileUrl?: string }[];
}) {
  return (
    <div className="horse-detail__documents">
      <div className="horse-detail__care-log-header">
        <span className="horse-detail__care-log-count">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </span>
        <button
          className="horse-detail__log-care-btn"
          onClick={() => {
            /* TODO: open upload modal */
          }}
        >
          <Upload size={16} />
          Upload
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="horse-detail__empty-tab">
          <FileText size={36} />
          <h3>No documents yet</h3>
          <p>Upload health records, registration papers, and more.</p>
          <button
            className="horse-detail__empty-tab-btn"
            onClick={() => {
              /* TODO: open upload modal */
            }}
          >
            <Upload size={16} />
            Upload Document
          </button>
        </div>
      ) : (
        <div className="horse-detail__doc-list">
          {documents.map((doc) => {
            let uploadDate = '';
            try {
              uploadDate = format(parseISO(doc.uploadedAt), 'MMM d, yyyy');
            } catch {
              uploadDate = doc.uploadedAt;
            }

            return (
              <div key={doc.id} className="horse-detail__doc-item">
                <div className="horse-detail__doc-icon">
                  <FileText size={20} />
                </div>
                <div className="horse-detail__doc-info">
                  <span className="horse-detail__doc-name">{doc.name}</span>
                  <span className="horse-detail__doc-meta">
                    {formatCareLogType(doc.category)} - {uploadDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===== Log Care Modal ===== */

interface LogCareModalProps {
  horseId: string;
  horseName: string;
  userName: string;
  onClose: () => void;
  onLog: (log: CareLog) => void;
}

function LogCareModal({
  horseId,
  horseName,
  userName,
  onClose,
  onLog,
}: LogCareModalProps) {
  const [type, setType] = useState<CareLog['type']>('feeding');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const careTypes: { value: CareLog['type']; label: string }[] = [
    { value: 'feeding', label: 'Feeding' },
    { value: 'turnout', label: 'Turnout' },
    { value: 'blanketing', label: 'Blanketing' },
    { value: 'medication', label: 'Medication' },
    { value: 'exercise', label: 'Exercise' },
    { value: 'grooming', label: 'Grooming' },
    { value: 'health_check', label: 'Health Check' },
    { value: 'farrier', label: 'Farrier' },
    { value: 'vet_visit', label: 'Vet Visit' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const now = new Date();
    const newLog: CareLog = {
      id: crypto.randomUUID(),
      horseId,
      type,
      date: format(now, 'yyyy-MM-dd'),
      time: format(now, 'HH:mm'),
      details: {},
      notes: notes.trim() || undefined,
      loggedBy: userName,
      createdAt: now.toISOString(),
    };

    onLog(newLog);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Log Care for {horseName}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>&times;</span>
          </button>
        </div>
        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__field">
            <label className="modal__label" htmlFor="care-type">
              Care Type
            </label>
            <select
              id="care-type"
              className="modal__select"
              value={type}
              onChange={(e) => setType(e.target.value as CareLog['type'])}
            >
              {careTypes.map((ct) => (
                <option key={ct.value} value={ct.value}>
                  {ct.label}
                </option>
              ))}
            </select>
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="care-notes">
              Notes
            </label>
            <textarea
              id="care-notes"
              className="modal__textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations or details..."
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
              disabled={submitting}
            >
              {submitting ? 'Logging...' : 'Log Care'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
