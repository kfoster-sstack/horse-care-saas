import { useState, useMemo, useEffect } from 'react';
import {
  Mail,
  Send,
  Inbox,
  Plus,
  ArrowLeft,
  Circle,
  User,
  X,
} from 'lucide-react';
import { useAppStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../i18n';
import type { DirectMessage } from '../types';
import { BusinessSwitcher } from '../components/ui/BusinessSwitcher';
import './MessagesPage.css';

type Tab = 'inbox' | 'sent';

function formatMessageDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = today.getTime() - msgDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function truncatePreview(text: string, maxLen: number = 100): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '...';
}

export function MessagesPage() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const {
    messages,
    teamMembers,
    addMessage,
    markMessageAsRead,
    deleteMessage,
    getUnreadMessageCount,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<Tab>('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  // Compose form state
  const [composeRecipient, setComposeRecipient] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeError, setComposeError] = useState('');
  const [composeSent, setComposeSent] = useState(false);

  const currentUserId = user?.id || '';
  const currentUserName = profile?.name || user?.email || 'You';

  const unreadCount = getUnreadMessageCount();

  // Filtered messages by tab
  const filteredMessages = useMemo(() => {
    let filtered: DirectMessage[];

    if (activeTab === 'inbox') {
      filtered = messages.filter((m) => m.recipientId === currentUserId);
    } else {
      filtered = messages.filter((m) => m.senderId === currentUserId);
    }

    // Sort by date descending
    return [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [messages, activeTab, currentUserId]);

  const selectedMessage = useMemo(() => {
    if (!selectedMessageId) return null;
    return messages.find((m) => m.id === selectedMessageId) || null;
  }, [messages, selectedMessageId]);

  // Mark as read when opening an inbox message
  useEffect(() => {
    if (
      selectedMessage &&
      !selectedMessage.isRead &&
      selectedMessage.recipientId === currentUserId
    ) {
      markMessageAsRead(selectedMessage.id);
    }
  }, [selectedMessage, currentUserId, markMessageAsRead]);

  function handleSelectMessage(msg: DirectMessage) {
    setSelectedMessageId(msg.id);
    setShowCompose(false);
  }

  function handleBack() {
    setSelectedMessageId(null);
  }

  function handleOpenCompose() {
    setShowCompose(true);
    setSelectedMessageId(null);
    setComposeRecipient('');
    setComposeSubject('');
    setComposeBody('');
    setComposeError('');
    setComposeSent(false);
  }

  function handleSendMessage() {
    setComposeError('');

    if (!composeRecipient) {
      setComposeError('Please select a recipient');
      return;
    }
    if (!composeSubject.trim()) {
      setComposeError('Subject is required');
      return;
    }
    if (!composeBody.trim()) {
      setComposeError('Message body is required');
      return;
    }

    const recipientMember = teamMembers.find((m) => m.id === composeRecipient);

    const message: DirectMessage = {
      id: crypto.randomUUID(),
      senderId: currentUserId,
      senderName: currentUserName,
      recipientId: composeRecipient,
      recipientName: recipientMember?.name || 'Unknown',
      subject: composeSubject.trim(),
      message: composeBody.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    addMessage(message);
    setComposeSent(true);

    // Reset after brief delay
    setTimeout(() => {
      setShowCompose(false);
      setComposeSent(false);
      setActiveTab('sent');
    }, 1500);
  }

  function handleDeleteMessage(id: string) {
    deleteMessage(id);
    if (selectedMessageId === id) {
      setSelectedMessageId(null);
    }
  }

  function renderAvatar(name: string) {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className="messages-avatar">
        {initials || <User size={16} />}
      </div>
    );
  }

  function renderMessageList() {
    if (filteredMessages.length === 0) {
      return (
        <div className="messages-empty">
          <div className="messages-empty__icon">
            {activeTab === 'inbox' ? <Inbox size={48} /> : <Send size={48} />}
          </div>
          <p className="messages-empty__text">
            {activeTab === 'inbox'
              ? 'Your inbox is empty'
              : 'No sent messages yet'}
          </p>
          {activeTab === 'inbox' && teamMembers.length > 0 && (
            <button className="messages-empty__btn" onClick={handleOpenCompose}>
              <Plus size={18} />
              Send your first message
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="messages-list">
        {filteredMessages.map((msg) => {
          const isUnread = !msg.isRead && activeTab === 'inbox';
          const contactName =
            activeTab === 'inbox' ? msg.senderName : msg.recipientName;
          const isSelected = selectedMessageId === msg.id;

          return (
            <button
              key={msg.id}
              className={`messages-list-item ${isUnread ? 'messages-list-item--unread' : ''} ${isSelected ? 'messages-list-item--selected' : ''}`}
              onClick={() => handleSelectMessage(msg)}
            >
              <div className="messages-list-item__avatar">
                {renderAvatar(contactName)}
                {isUnread && (
                  <span className="messages-list-item__unread-dot">
                    <Circle size={8} fill="currentColor" />
                  </span>
                )}
              </div>
              <div className="messages-list-item__content">
                <div className="messages-list-item__top">
                  <span className={`messages-list-item__name ${isUnread ? 'messages-list-item__name--unread' : ''}`}>
                    {contactName}
                  </span>
                  <span className="messages-list-item__time">
                    {formatMessageDate(msg.createdAt)}
                  </span>
                </div>
                <p className={`messages-list-item__subject ${isUnread ? 'messages-list-item__subject--unread' : ''}`}>
                  {msg.subject}
                </p>
                <p className="messages-list-item__preview">
                  {truncatePreview(msg.message)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  function renderMessageDetail() {
    if (!selectedMessage) return null;

    const isSent = selectedMessage.senderId === currentUserId;
    const contactName = isSent
      ? selectedMessage.recipientName
      : selectedMessage.senderName;

    return (
      <div className="messages-detail">
        <div className="messages-detail__header">
          <button
            className="messages-detail__back"
            onClick={handleBack}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="messages-detail__header-info">
            {renderAvatar(contactName)}
            <div>
              <h3 className="messages-detail__from">
                {isSent ? `To: ${contactName}` : `From: ${contactName}`}
              </h3>
              <span className="messages-detail__date">
                {new Date(selectedMessage.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
          <button
            className="messages-detail__delete"
            onClick={() => handleDeleteMessage(selectedMessage.id)}
            aria-label="Delete message"
          >
            <X size={18} />
          </button>
        </div>

        <div className="messages-detail__body">
          <h2 className="messages-detail__subject">{selectedMessage.subject}</h2>
          <div className="messages-detail__text">
            {selectedMessage.message.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderCompose() {
    if (composeSent) {
      return (
        <div className="messages-compose messages-compose--sent">
          <div className="messages-compose-success">
            <Send size={32} />
            <p>Message sent successfully!</p>
          </div>
        </div>
      );
    }

    return (
      <div className="messages-compose">
        <div className="messages-compose__header">
          <h2>New Message</h2>
          <button
            className="messages-compose__close"
            onClick={() => setShowCompose(false)}
          >
            <X size={20} />
          </button>
        </div>

        {composeError && (
          <div className="messages-compose__error">{composeError}</div>
        )}

        <div className="messages-compose__body">
          <div className="messages-compose__field">
            <label htmlFor="msg-recipient">To</label>
            <select
              id="msg-recipient"
              className="messages-compose__select"
              value={composeRecipient}
              onChange={(e) => setComposeRecipient(e.target.value)}
            >
              <option value="">Select a team member...</option>
              {teamMembers
                .filter((m) => m.id !== currentUserId && m.status === 'active')
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
            </select>
          </div>

          <div className="messages-compose__field">
            <label htmlFor="msg-subject">Subject</label>
            <input
              id="msg-subject"
              type="text"
              className="messages-compose__input"
              placeholder="Enter subject..."
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
            />
          </div>

          <div className="messages-compose__field messages-compose__field--grow">
            <label htmlFor="msg-body">Message</label>
            <textarea
              id="msg-body"
              className="messages-compose__textarea"
              placeholder="Write your message..."
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
            />
          </div>
        </div>

        <div className="messages-compose__footer">
          <button
            className="messages-compose__cancel"
            onClick={() => setShowCompose(false)}
          >
            Discard
          </button>
          <button
            className="messages-compose__send"
            onClick={handleSendMessage}
          >
            <Send size={16} />
            Send Message
          </button>
        </div>
      </div>
    );
  }

  // Determine what to show in the right panel (desktop) or main area (mobile)
  const showRightPanel = selectedMessageId || showCompose;

  return (
    <div className="messages-page">
      <BusinessSwitcher />
      {/* Left Panel: Tab bar + List */}
      <div className={`messages-left ${showRightPanel ? 'messages-left--hidden-mobile' : ''}`}>
        <div className="messages-left__header">
          <h1 className="messages-left__title">
            <Mail size={24} />
            {t('nav.messages')}
          </h1>
          <button
            className="messages-left__compose"
            onClick={handleOpenCompose}
            disabled={teamMembers.length === 0}
            title={
              teamMembers.length === 0
                ? 'No team members to message'
                : 'New Message'
            }
          >
            <Plus size={18} />
            <span className="messages-left__compose-text">New</span>
          </button>
        </div>

        <div className="messages-tabs">
          <button
            className={`messages-tab ${activeTab === 'inbox' ? 'messages-tab--active' : ''}`}
            onClick={() => {
              setActiveTab('inbox');
              setSelectedMessageId(null);
              setShowCompose(false);
            }}
          >
            <Inbox size={16} />
            Inbox
            {unreadCount > 0 && (
              <span className="messages-tab__badge">{unreadCount}</span>
            )}
          </button>
          <button
            className={`messages-tab ${activeTab === 'sent' ? 'messages-tab--active' : ''}`}
            onClick={() => {
              setActiveTab('sent');
              setSelectedMessageId(null);
              setShowCompose(false);
            }}
          >
            <Send size={16} />
            Sent
          </button>
        </div>

        {renderMessageList()}
      </div>

      {/* Right Panel: Detail or Compose */}
      <div className={`messages-right ${showRightPanel ? 'messages-right--visible' : ''}`}>
        {showCompose ? (
          renderCompose()
        ) : selectedMessage ? (
          renderMessageDetail()
        ) : (
          <div className="messages-right__placeholder">
            <Mail size={48} />
            <p>Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
}
