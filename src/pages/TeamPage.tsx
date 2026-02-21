import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  UserPlus,
  X,
  Shield,
  Clock,
  ChevronDown,
  Trash2,
  Copy,
  Check,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import { businessService } from '../services/businessService';
import { useTranslation } from '../i18n';
import type { UserRole } from '../types';
import type { TeamInvite } from '../types/database';
import './TeamPage.css';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'boarder', label: 'Boarder' },
];

function getRoleBadgeClass(role: UserRole): string {
  switch (role) {
    case 'owner': return 'team-role--owner';
    case 'manager': return 'team-role--manager';
    case 'staff': return 'team-role--staff';
    case 'volunteer': return 'team-role--volunteer';
    case 'boarder': return 'team-role--boarder';
    default: return '';
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function TeamPage() {
  const { t } = useTranslation();
  const { user, activeBusiness, activeMembership } = useAuth();
  const {
    teamMembers,
    horses,
    updateTeamMember,
    removeTeamMember,
    fetchTeamMembers,
    canInviteMoreMembers,
    getMaxUsers,
  } = useAppStore();

  const [pendingInvites, setPendingInvites] = useState<TeamInvite[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('staff');
  const [inviteHorses, setInviteHorses] = useState<string[]>([]);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Role edit
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // Remove confirm
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // Code copy
  const [codeCopied, setCodeCopied] = useState(false);

  const isOwnerOrManager =
    activeMembership?.role === 'owner' || activeMembership?.role === 'manager';

  const activeMembers = useMemo(
    () => teamMembers.filter((m) => m.status === 'active'),
    [teamMembers]
  );

  const maxUsers = getMaxUsers();
  const canInvite = canInviteMoreMembers();

  // Fetch pending invites on mount
  useEffect(() => {
    if (activeBusiness?.id) {
      businessService.getPendingInvites(activeBusiness.id).then(({ data }) => {
        if (data) {
          setPendingInvites(data);
        }
      });
    }
  }, [activeBusiness?.id]);

  function handleCopyCode() {
    if (activeBusiness?.code) {
      navigator.clipboard.writeText(activeBusiness.code).then(() => {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      });
    }
  }

  async function handleSendInvite() {
    setInviteError('');
    setInviteSuccess('');

    if (!inviteEmail.trim()) {
      setInviteError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())) {
      setInviteError('Please enter a valid email address');
      return;
    }
    if (!activeBusiness?.id) {
      setInviteError('No active business');
      return;
    }

    setInviteLoading(true);

    try {
      const { data, error } = await businessService.createInvite({
        business_id: activeBusiness.id,
        email: inviteEmail.trim().toLowerCase(),
        name: inviteName.trim() || null,
        role: inviteRole,
        assigned_horse_ids: inviteHorses,
        invited_by: user?.id || null,
      });

      if (error) {
        setInviteError(error.message);
      } else if (data) {
        setPendingInvites((prev) => [data, ...prev]);
        setInviteSuccess(`Invite sent to ${inviteEmail.trim()}`);
        setInviteEmail('');
        setInviteName('');
        setInviteRole('staff');
        setInviteHorses([]);
        setTimeout(() => {
          setShowInviteForm(false);
          setInviteSuccess('');
        }, 2000);
      }
    } catch (err: any) {
      setInviteError(err?.message || 'Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleCancelInvite(inviteId: string) {
    const { error } = await businessService.cancelInvite(inviteId);
    if (!error) {
      setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
    }
  }

  async function handleRoleChange(memberId: string, newRole: UserRole) {
    try {
      const { error } = await businessService.updateMemberRole(memberId, newRole);
      if (!error) {
        updateTeamMember(memberId, { role: newRole });
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    }
    setEditingRoleId(null);
  }

  function handleRemoveMember(memberId: string) {
    removeTeamMember(memberId);
    setConfirmRemoveId(null);
  }

  function toggleHorseAssignment(horseId: string) {
    setInviteHorses((prev) =>
      prev.includes(horseId)
        ? prev.filter((id) => id !== horseId)
        : [...prev, horseId]
    );
  }

  function renderAvatar(name: string, avatar?: string) {
    if (avatar) {
      return <img src={avatar} alt={name} className="team-avatar__img" />;
    }
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return <span>{initials || '?'}</span>;
  }

  return (
    <div className="team-page">
      {/* Header */}
      <div className="team-header">
        <div className="team-header__left">
          <h1 className="team-header__title">
            <Users size={24} />
            {t('settings.teamManagement.title')}
          </h1>
          <span className="team-header__count">
            {t('settings.teamManagement.subscriptionInfo', {
              current: activeMembers.length.toString(),
              max: maxUsers.toString(),
            })}
          </span>
        </div>

        {isOwnerOrManager && (
          <button
            className="team-header__invite-btn"
            onClick={() => setShowInviteForm(true)}
            disabled={!canInvite}
            title={!canInvite ? 'Upgrade to invite more members' : 'Invite Member'}
          >
            <UserPlus size={18} />
            <span>{t('settings.teamManagement.inviteMember')}</span>
          </button>
        )}
      </div>

      {/* Business Code Section */}
      {isOwnerOrManager && activeBusiness?.code && (
        <div className="team-code-section">
          <div className="team-code-section__info">
            <h3>Business Code</h3>
            <p>Share this code with team members so they can join your business.</p>
          </div>
          <div className="team-code-section__code-row">
            <code className="team-code-section__code">{activeBusiness.code}</code>
            <button
              className="team-code-section__copy"
              onClick={handleCopyCode}
            >
              {codeCopied ? <Check size={16} /> : <Copy size={16} />}
              {codeCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Upgrade notice for free tier */}
      {!canInvite && isOwnerOrManager && (
        <div className="team-upgrade-notice">
          <AlertTriangle size={18} />
          <span>{t('settings.teamManagement.upgradeToInvite')}</span>
        </div>
      )}

      {/* Team Members List */}
      <section className="team-section">
        <h2 className="team-section__title">
          {t('settings.teamManagement.members')} ({activeMembers.length})
        </h2>

        {activeMembers.length === 0 ? (
          <div className="team-empty">
            <Users size={40} />
            <p>{t('settings.teamManagement.noTeamMembers')}</p>
          </div>
        ) : (
          <div className="team-members-table">
            {/* Desktop Header */}
            <div className="team-table-header">
              <span className="team-table-header__col team-table-header__col--name">
                Member
              </span>
              <span className="team-table-header__col team-table-header__col--role">
                Role
              </span>
              <span className="team-table-header__col team-table-header__col--status">
                Status
              </span>
              <span className="team-table-header__col team-table-header__col--joined">
                Joined
              </span>
              {isOwnerOrManager && (
                <span className="team-table-header__col team-table-header__col--actions">
                  Actions
                </span>
              )}
            </div>

            {/* Rows */}
            {activeMembers.map((member) => {
              const isCurrentUser = member.id === user?.id;

              return (
                <div key={member.id} className="team-member-row">
                  <div className="team-member-row__name-col">
                    <div className="team-avatar">
                      {renderAvatar(member.name, member.avatar)}
                    </div>
                    <div className="team-member-row__info">
                      <span className="team-member-row__name">
                        {member.name}
                        {isCurrentUser && (
                          <span className="team-member-row__you">(you)</span>
                        )}
                      </span>
                      <span className="team-member-row__email">{member.email}</span>
                    </div>
                  </div>

                  <div className="team-member-row__role-col">
                    {editingRoleId === member.id && isOwnerOrManager && !isCurrentUser ? (
                      <div className="team-role-edit">
                        <select
                          className="team-role-edit__select"
                          value={member.role}
                          onChange={(e) =>
                            handleRoleChange(member.id, e.target.value as UserRole)
                          }
                        >
                          {ROLE_OPTIONS.filter((r) => r.value !== 'owner').map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        <button
                          className="team-role-edit__cancel"
                          onClick={() => setEditingRoleId(null)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`team-role-badge ${getRoleBadgeClass(member.role)}`}
                        onClick={() => {
                          if (isOwnerOrManager && !isCurrentUser) {
                            setEditingRoleId(member.id);
                          }
                        }}
                        style={{
                          cursor:
                            isOwnerOrManager && !isCurrentUser
                              ? 'pointer'
                              : 'default',
                        }}
                        title={
                          isOwnerOrManager && !isCurrentUser
                            ? 'Click to change role'
                            : undefined
                        }
                      >
                        <Shield size={12} />
                        {t(`roles.${member.role}`)}
                        {isOwnerOrManager && !isCurrentUser && (
                          <ChevronDown size={12} />
                        )}
                      </span>
                    )}
                  </div>

                  <div className="team-member-row__status-col">
                    <span className={`team-status team-status--${member.status}`}>
                      {t(`status.${member.status}`)}
                    </span>
                  </div>

                  <div className="team-member-row__joined-col">
                    <span className="team-member-row__date">
                      {formatDate(member.joinedAt)}
                    </span>
                  </div>

                  {isOwnerOrManager && (
                    <div className="team-member-row__actions-col">
                      {!isCurrentUser && member.role !== 'owner' && (
                        <>
                          {confirmRemoveId === member.id ? (
                            <div className="team-confirm-remove">
                              <span>Remove?</span>
                              <button
                                className="team-confirm-remove__yes"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                Yes
                              </button>
                              <button
                                className="team-confirm-remove__no"
                                onClick={() => setConfirmRemoveId(null)}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              className="team-action-btn team-action-btn--remove"
                              onClick={() => setConfirmRemoveId(member.id)}
                              title={t('settings.teamManagement.removeMember')}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Pending Invites Section */}
      {isOwnerOrManager && pendingInvites.length > 0 && (
        <section className="team-section">
          <h2 className="team-section__title">
            {t('settings.teamManagement.pendingInvites')} ({pendingInvites.length})
          </h2>

          <div className="team-invites-list">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="team-invite-card">
                <div className="team-invite-card__icon">
                  <Mail size={20} />
                </div>
                <div className="team-invite-card__info">
                  <span className="team-invite-card__email">{invite.email}</span>
                  {invite.name && (
                    <span className="team-invite-card__name">{invite.name}</span>
                  )}
                  <div className="team-invite-card__meta">
                    <span className={`team-role-badge ${getRoleBadgeClass(invite.role)}`}>
                      <Shield size={12} />
                      {t(`roles.${invite.role}`)}
                    </span>
                    <span className="team-invite-card__date">
                      <Clock size={12} />
                      Sent {formatDate(invite.invited_at)}
                    </span>
                    <span className="team-invite-card__expires">
                      Expires {formatDate(invite.expires_at)}
                    </span>
                  </div>
                </div>
                <button
                  className="team-invite-card__cancel"
                  onClick={() => handleCancelInvite(invite.id)}
                  title="Cancel invite"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="team-modal-overlay" onClick={() => setShowInviteForm(false)}>
          <div className="team-modal" onClick={(e) => e.stopPropagation()}>
            <div className="team-modal__header">
              <h2>{t('settings.teamManagement.inviteMember')}</h2>
              <button
                className="team-modal__close"
                onClick={() => setShowInviteForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            {inviteError && (
              <div className="team-modal__error">{inviteError}</div>
            )}
            {inviteSuccess && (
              <div className="team-modal__success">{inviteSuccess}</div>
            )}

            <div className="team-modal__body">
              <div className="team-form__field">
                <label htmlFor="invite-email">Email *</label>
                <input
                  id="invite-email"
                  type="email"
                  className="team-form__input"
                  placeholder="member@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div className="team-form__field">
                <label htmlFor="invite-name">Name (optional)</label>
                <input
                  id="invite-name"
                  type="text"
                  className="team-form__input"
                  placeholder="Team member name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </div>

              <div className="team-form__field">
                <label htmlFor="invite-role">Role</label>
                <select
                  id="invite-role"
                  className="team-form__select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                >
                  {ROLE_OPTIONS.filter((r) => r.value !== 'owner').map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {horses.length > 0 && (
                <div className="team-form__field">
                  <label>{t('settings.teamManagement.assignHorses')}</label>
                  <div className="team-form__horse-list">
                    {horses.map((horse) => (
                      <label key={horse.id} className="team-form__horse-item">
                        <input
                          type="checkbox"
                          checked={inviteHorses.includes(horse.id)}
                          onChange={() => toggleHorseAssignment(horse.id)}
                        />
                        <span>{horse.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="team-modal__footer">
              <button
                className="team-modal__cancel"
                onClick={() => setShowInviteForm(false)}
              >
                {t('common.cancel')}
              </button>
              <button
                className="team-modal__submit"
                onClick={handleSendInvite}
                disabled={inviteLoading}
              >
                <UserPlus size={16} />
                {inviteLoading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
