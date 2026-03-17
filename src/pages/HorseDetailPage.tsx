import { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInYears } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import { EditHorseModal } from '../components/horses/EditHorseModal';
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
  X,
  Trash2,
  Save,
} from 'lucide-react';
import type { CareLog, Horse, EmergencyContact, DocumentCategory } from '../types';
import { storageService } from '../services/storageService';
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
    updateHorse,
    addDocument,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showLogCareModal, setShowLogCareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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
          onClick={() => setShowEditModal(true)}
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
          <OverviewTab horse={horse} onUpdateHorse={(updates) => updateHorse(horse.id, updates)} />
        )}
        {activeTab === 'care-log' && (
          <CareLogTab
            horseLogs={horseLogs}
            horseName={horse.name}
            onLogCare={() => setShowLogCareModal(true)}
          />
        )}
        {activeTab === 'medical' && (
          <MedicalTab horse={horse} onUpdateHorse={(updates) => updateHorse(horse.id, updates)} />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab
            documents={horseDocs}
            horseId={horse.id}
            businessId={profile?.business_code || ''}
            onAddDocument={addDocument}
          />
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

      {/* Edit Horse Modal */}
      {showEditModal && (
        <EditHorseModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          horse={horse}
        />
      )}
    </div>
  );
}

/* ===== Overview Tab ===== */

function OverviewTab({ horse, onUpdateHorse }: { horse: Horse; onUpdateHorse: (updates: Partial<Horse>) => void }) {
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState<EmergencyContact['role']>('veterinarian');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const resetContactForm = () => {
    setContactName('');
    setContactRole('veterinarian');
    setContactPhone('');
    setContactEmail('');
    setShowAddContact(false);
    setEditingContactId(null);
  };

  const handleSaveContact = () => {
    if (!contactName.trim() || !contactPhone.trim()) return;
    const contact: EmergencyContact = {
      id: editingContactId || uuidv4(),
      name: contactName.trim(),
      role: contactRole,
      phone: contactPhone.trim(),
      email: contactEmail.trim() || undefined,
    };
    let updated: EmergencyContact[];
    if (editingContactId) {
      updated = horse.emergencyContacts.map((c) => c.id === editingContactId ? contact : c);
    } else {
      updated = [...horse.emergencyContacts, contact];
    }
    onUpdateHorse({ emergencyContacts: updated });
    resetContactForm();
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContactId(contact.id);
    setContactName(contact.name);
    setContactRole(contact.role);
    setContactPhone(contact.phone);
    setContactEmail(contact.email || '');
    setShowAddContact(true);
  };

  const handleDeleteContact = (contactId: string) => {
    onUpdateHorse({ emergencyContacts: horse.emergencyContacts.filter((c) => c.id !== contactId) });
  };

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
        <div className="horse-detail__section-title-row">
          <h3 className="horse-detail__section-title">
            <Phone size={16} />
            Emergency Contacts
          </h3>
          <button className="horse-detail__add-inline-btn" onClick={() => { resetContactForm(); setShowAddContact(true); }}>
            <Plus size={14} /> Add Contact
          </button>
        </div>

        {/* Add/Edit Contact Form */}
        {showAddContact && (
          <div className="horse-detail__contact-form">
            <div className="horse-detail__contact-form-row">
              <input
                type="text"
                placeholder="Name *"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="horse-detail__edit-input"
              />
              <select
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value as EmergencyContact['role'])}
                className="horse-detail__edit-input"
              >
                <option value="veterinarian">Veterinarian</option>
                <option value="farrier">Farrier</option>
                <option value="barn_manager">Barn Manager</option>
                <option value="owner">Owner</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="horse-detail__contact-form-row">
              <input
                type="tel"
                placeholder="Phone *"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="horse-detail__edit-input"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="horse-detail__edit-input"
              />
            </div>
            <div className="horse-detail__edit-actions">
              <button className="horse-detail__save-btn" onClick={handleSaveContact}>
                <Save size={14} /> {editingContactId ? 'Update' : 'Add'}
              </button>
              <button className="horse-detail__cancel-btn" onClick={resetContactForm}>
                Cancel
              </button>
            </div>
          </div>
        )}

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
                <div className="horse-detail__contact-manage">
                  <button className="horse-detail__contact-edit" onClick={() => handleEditContact(contact)} aria-label="Edit">
                    <Edit3 size={14} />
                  </button>
                  <button className="horse-detail__contact-delete" onClick={() => handleDeleteContact(contact.id)} aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : !showAddContact ? (
          <p className="horse-detail__section-empty">
            No emergency contacts added yet.
          </p>
        ) : null}
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

function MedicalTab({ horse, onUpdateHorse }: { horse: Horse; onUpdateHorse: (updates: Partial<Horse>) => void }) {
  const [editing, setEditing] = useState(false);
  const [meds, setMeds] = useState(horse.medications.join(', '));
  const [allergy, setAllergy] = useState(horse.allergies.join(', '));
  const [needs, setNeeds] = useState(horse.specialNeeds || '');

  const handleSave = () => {
    const parseList = (val: string): string[] =>
      val.split(',').map((s) => s.trim()).filter(Boolean);
    onUpdateHorse({
      medications: parseList(meds),
      allergies: parseList(allergy),
      specialNeeds: needs.trim() || undefined,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setMeds(horse.medications.join(', '));
    setAllergy(horse.allergies.join(', '));
    setNeeds(horse.specialNeeds || '');
    setEditing(false);
  };

  return (
    <div className="horse-detail__medical">
      <div className="horse-detail__section-header-row">
        {!editing ? (
          <button className="horse-detail__edit-inline-btn" onClick={() => setEditing(true)}>
            <Edit3 size={14} /> Edit Medical Info
          </button>
        ) : (
          <div className="horse-detail__edit-actions">
            <button className="horse-detail__save-btn" onClick={handleSave}>
              <Save size={14} /> Save
            </button>
            <button className="horse-detail__cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Medications */}
      <div className="horse-detail__section">
        <h3 className="horse-detail__section-title">
          <Pill size={16} />
          Current Medications
        </h3>
        {editing ? (
          <div className="horse-detail__edit-field">
            <input
              type="text"
              className="horse-detail__edit-input"
              value={meds}
              onChange={(e) => setMeds(e.target.value)}
              placeholder="Comma-separated, e.g. Bute, Banamine"
            />
            <span className="horse-detail__edit-hint">Separate with commas</span>
          </div>
        ) : horse.medications.length > 0 ? (
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
        {editing ? (
          <div className="horse-detail__edit-field">
            <input
              type="text"
              className="horse-detail__edit-input"
              value={allergy}
              onChange={(e) => setAllergy(e.target.value)}
              placeholder="Comma-separated, e.g. Penicillin, Alfalfa"
            />
            <span className="horse-detail__edit-hint">Separate with commas</span>
          </div>
        ) : horse.allergies.length > 0 ? (
          <div className="horse-detail__tag-list">
            {horse.allergies.map((a, idx) => (
              <span key={idx} className="horse-detail__tag horse-detail__tag--danger">
                {a}
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
        {editing ? (
          <div className="horse-detail__edit-field">
            <textarea
              className="horse-detail__edit-textarea"
              value={needs}
              onChange={(e) => setNeeds(e.target.value)}
              placeholder="Special care requirements..."
              rows={3}
            />
          </div>
        ) : horse.specialNeeds ? (
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

const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

const DOC_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'health_records', label: 'Health Records' },
  { value: 'registration', label: 'Registration' },
  { value: 'contracts', label: 'Contracts' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'coggins', label: 'Coggins' },
  { value: 'photos', label: 'Photos' },
  { value: 'other', label: 'Other' },
];

function DocumentsTab({
  documents,
  horseId,
  businessId,
  onAddDocument,
}: {
  documents: { id: string; name: string; category: string; uploadedAt: string; fileUrl?: string }[];
  horseId: string;
  businessId: string;
  onAddDocument: (doc: any) => void;
}) {
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('health_records');
  const [docFile, setDocFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_DOC_SIZE) {
      setUploadError('File must be under 10MB');
      return;
    }
    setDocFile(file);
    if (!docName) setDocName(file.name);
    setUploadError('');
  };

  const handleUpload = async () => {
    if (!docFile) { setUploadError('Please select a file'); return; }
    if (!docName.trim()) { setUploadError('Please enter a document name'); return; }
    setUploading(true);
    setUploadError('');

    const { data, error } = await storageService.uploadDocument(
      businessId, horseId, docCategory, docFile
    );

    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }

    onAddDocument({
      id: uuidv4(),
      horseId,
      name: docName.trim(),
      category: docCategory,
      fileUrl: data?.url || '',
      uploadedAt: new Date().toISOString(),
    });

    setDocName('');
    setDocCategory('health_records');
    setDocFile(null);
    setUploading(false);
    setShowUpload(false);
  };

  return (
    <div className="horse-detail__documents">
      <div className="horse-detail__care-log-header">
        <span className="horse-detail__care-log-count">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </span>
        <button className="horse-detail__log-care-btn" onClick={() => setShowUpload(true)}>
          <Upload size={16} />
          Upload
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="horse-detail__empty-tab">
          <FileText size={36} />
          <h3>No documents yet</h3>
          <p>Upload health records, registration papers, and more.</p>
          <button className="horse-detail__empty-tab-btn" onClick={() => setShowUpload(true)}>
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
                  <span className="horse-detail__doc-name">
                    {doc.fileUrl ? (
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">{doc.name}</a>
                    ) : doc.name}
                  </span>
                  <span className="horse-detail__doc-meta">
                    {formatCareLogType(doc.category)} - {uploadDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Upload Document</h2>
              <button className="modal__close" onClick={() => setShowUpload(false)} aria-label="Close">
                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>&times;</span>
              </button>
            </div>
            <div className="modal__form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
              {uploadError && (
                <div style={{ color: '#c62828', fontSize: '0.875rem', padding: '0.5rem', background: '#ffebee', borderRadius: '4px' }}>
                  {uploadError}
                </div>
              )}
              <div className="modal__field">
                <label className="modal__label">Document Name</label>
                <input
                  type="text"
                  className="modal__input"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. 2026 Coggins Test"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div className="modal__field">
                <label className="modal__label">Category</label>
                <select
                  className="modal__select"
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  {DOC_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="modal__field">
                <label className="modal__label">File (max 10MB)</label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{ padding: '0.5rem 1rem', cursor: 'pointer', border: '1px dashed #999', borderRadius: '4px', background: '#fafafa' }}
                >
                  {docFile ? docFile.name : 'Choose File'}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>
              <div className="modal__actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="modal__btn modal__btn--secondary"
                  onClick={() => setShowUpload(false)}
                  style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="modal__btn modal__btn--primary"
                  onClick={handleUpload}
                  disabled={uploading}
                  style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: '#8B0000', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
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
