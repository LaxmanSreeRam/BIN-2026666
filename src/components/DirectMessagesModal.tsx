import React, { useState, useEffect, useRef } from 'react';
import { Student, DirectMessage } from '../types';
import { 
  X, 
  Send, 
  Search, 
  Smile, 
  Check, 
  CheckCheck, 
  MessageCircle, 
  Edit3, 
  Users, 
  UserCheck, 
  Sparkles, 
  Heart, 
  Flame, 
  Leaf, 
  ThumbsUp, 
  Award,
  ChevronLeft,
  ArrowRight,
  Shield,
  Clock
} from 'lucide-react';

interface DirectMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: Student;
  students: Student[];
  messages: DirectMessage[];
  onSendMessage: (receiverStudent: Student, text: string) => void;
  onReactToMessage: (messageId: string, reaction: string | null) => void;
  onMarkAsRead: (messageId: string) => void;
  initialRecipientId?: string | null;
  onOpenProfile?: (student: Student) => void;
}

const QUICK_EMOJIS = ['🌱', '💚', '👏', '🔥', '♻️', '👍', '✨', '🏆'];
const QUICK_SUGGESTIONS = [
  'Great work on your latest green action! 🌱',
  'Heading to the smart bin now, want to log points together?',
  'Congrats on climbing the leaderboard! 🏆',
  'Which recycling challenge should we tackle next? ♻️',
];

export const DirectMessagesModal: React.FC<DirectMessagesModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  students,
  messages,
  onSendMessage,
  onReactToMessage,
  onMarkAsRead,
  initialRecipientId,
  onOpenProfile,
}) => {
  if (!isOpen) return null;

  const [activeRecipientId, setActiveRecipientId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposingNew, setIsComposingNew] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group messages by conversation ID
  const myUserId = currentStudent.grNo;

  // Find all students current student has chatted with or can chat with
  const otherStudents = students.filter(
    (s) => s.grNo !== myUserId && s.grNo !== 'ADMIN-001'
  );

  // Extract conversations map
  const conversationPartnersMap = new Map<string, { student: Student; lastMsg: DirectMessage; unreadCount: number }>();

  messages.forEach((msg) => {
    const isSentByMe = msg.senderId === myUserId;
    const partnerId = isSentByMe ? msg.receiverId : msg.senderId;
    const partnerStudent = students.find((s) => s.grNo === partnerId);

    if (partnerStudent) {
      const existing = conversationPartnersMap.get(partnerId);
      const isUnread = !isSentByMe && !msg.read;

      if (!existing || new Date(msg.timestamp).getTime() > new Date(existing.lastMsg.timestamp).getTime()) {
        conversationPartnersMap.set(partnerId, {
          student: partnerStudent,
          lastMsg: msg,
          unreadCount: (existing?.unreadCount || 0) + (isUnread ? 1 : 0),
        });
      } else if (isUnread) {
        existing.unreadCount += 1;
      }
    }
  });

  // Convert to array and sort by latest message
  const conversations = Array.from(conversationPartnersMap.values()).sort(
    (a, b) => new Date(b.lastMsg.timestamp).getTime() - new Date(a.lastMsg.timestamp).getTime()
  );

  // Initialize active recipient
  useEffect(() => {
    if (initialRecipientId && initialRecipientId !== myUserId) {
      setActiveRecipientId(initialRecipientId);
      setIsComposingNew(false);
    } else if (!activeRecipientId && conversations.length > 0) {
      setActiveRecipientId(conversations[0].student.grNo);
    }
  }, [initialRecipientId, conversations.length]);

  const activePartner = students.find((s) => s.grNo === activeRecipientId);

  // Filter messages for active conversation
  const currentConversationMessages = messages.filter((msg) => {
    if (!activeRecipientId) return false;
    return (
      (msg.senderId === myUserId && msg.receiverId === activeRecipientId) ||
      (msg.senderId === activeRecipientId && msg.receiverId === myUserId)
    );
  }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Mark unread messages in active thread as read
  useEffect(() => {
    if (activeRecipientId) {
      currentConversationMessages.forEach((msg) => {
        if (msg.receiverId === myUserId && !msg.read) {
          onMarkAsRead(msg.id);
        }
      });
    }
  }, [activeRecipientId, currentConversationMessages.length]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversationMessages.length, activeRecipientId]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || !activePartner) return;

    onSendMessage(activePartner, trimmed);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleSelectPartner = (partnerId: string) => {
    setActiveRecipientId(partnerId);
    setIsComposingNew(false);
  };

  const filteredConversations = conversations.filter(({ student, lastMsg }) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const cleanQ = q.replace(/^@/, '');
    const userHandle = (student.username || '').toLowerCase();
    return (
      student.name.toLowerCase().includes(q) ||
      userHandle.includes(cleanQ) ||
      lastMsg.text.toLowerCase().includes(q)
    );
  });

  const filteredNewChatStudents = otherStudents.filter((s) => {
    const q = newChatSearch.toLowerCase().trim();
    if (!q) return true;
    const cleanQ = q.replace(/^@/, '');
    const userHandle = (s.username || '').toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      userHandle.includes(cleanQ) ||
      (s.grade && s.grade.toLowerCase().includes(q))
    );
  });

  const formatMsgTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl" style={{ maxWidth: '1080px' }}>
        <div className="modal-content rounded-0 border border-4 border-dark shadow-[10px_10px_0px_0px_black] bg-white overflow-hidden" style={{ height: '85vh', maxHeight: '720px' }}>
          
          {/* Main Direct Messages Body: Left Sidebar + Right Thread */}
          <div className="d-flex h-100 flex-column flex-md-row">
            
            {/* Left Sidebar: Conversations & Search */}
            <div 
              className={`col-12 col-md-4 col-lg-4 border-end border-3 border-dark d-flex flex-column bg-light h-100 ${
                activeRecipientId && !isComposingNew ? 'd-none d-md-flex' : 'd-flex'
              }`}
            >
              
              {/* Sidebar Header: Instagram Handle & New Compose Button */}
              <div className="p-3 border-bottom border-3 border-dark bg-white d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-1.5 bg-dark text-warning rounded-0 border border-dark">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="fw-black text-dark text-uppercase font-monospace m-0 d-flex align-items-center gap-1">
                      <span>@{currentStudent.username || currentStudent.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}</span>
                    </h6>
                    <span className="small text-muted fw-bold text-uppercase xsmall">Direct Messages</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsComposingNew(!isComposingNew)}
                    className={`btn btn-sm rounded-0 border border-2 border-dark fw-black p-1.5 shadow-[2px_2px_0px_0px_black] ${
                      isComposingNew ? 'btn-success text-white' : 'btn-warning text-dark'
                    }`}
                    title="Start New Chat"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-sm btn-outline-dark rounded-0 border-2 p-1.5 d-md-none"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search Conversations */}
              <div className="p-2.5 border-bottom border-2 border-dark bg-white">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-2 border-dark rounded-0">
                    <Search className="w-3.5 h-3.5 text-muted" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="form-control rounded-0 border-2 border-dark shadow-none fw-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="btn btn-outline-dark rounded-0 border-2 border-start-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-grow-1 overflow-y-auto p-2 space-y-1">
                {isComposingNew ? (
                  <div className="p-2">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-black text-uppercase small text-dark">Select Classmate to Message</span>
                      <button
                        type="button"
                        onClick={() => setIsComposingNew(false)}
                        className="btn btn-link text-muted p-0 small text-decoration-none"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="input-group input-group-sm mb-3">
                      <span className="input-group-text bg-white border-2 border-dark rounded-0">@</span>
                      <input
                        type="text"
                        value={newChatSearch}
                        onChange={(e) => setNewChatSearch(e.target.value)}
                        placeholder="Search student or @handle..."
                        className="form-control rounded-0 border-2 border-dark shadow-none fw-bold"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1">
                      {filteredNewChatStudents.map((st) => {
                        const handle = st.username || st.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                        return (
                          <div
                            key={st.grNo}
                            onClick={() => handleSelectPartner(st.grNo)}
                            className="p-2 bg-white rounded-0 border border-2 border-dark d-flex align-items-center justify-content-between cursor-pointer hover:bg-success-subtle shadow-[2px_2px_0px_0px_black] mb-1.5"
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="bg-light border border-dark rounded-0 overflow-hidden flex-shrink-0"
                                style={{ width: '36px', height: '36px' }}
                              >
                                {st.avatarUrl ? (
                                  <img src={st.avatarUrl} alt={st.name} className="w-100 h-100 object-fit-cover" />
                                ) : (
                                  <div className="w-100 h-100 d-flex align-items-center justify-content-center fw-black">
                                    {st.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="fw-black text-dark text-uppercase small lh-sm">{st.name}</div>
                                <div className="font-monospace text-muted small">@{handle}</div>
                              </div>
                            </div>

                            <span className="badge bg-warning text-dark border border-dark rounded-0 fw-bold small">
                              Chat →
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-5 px-3">
                    <div className="p-3 bg-white border border-2 border-dark rounded-0 d-inline-flex mx-auto mb-2 shadow-[2px_2px_0px_0px_black]">
                      <MessageCircle className="w-6 h-6 text-muted" />
                    </div>
                    <h6 className="fw-black text-uppercase text-dark mb-1">No Messages Yet</h6>
                    <p className="text-muted small mb-3">
                      Send a message to your classmates and coordinate campus green challenges!
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsComposingNew(true)}
                      className="btn btn-sm btn-success text-white fw-black text-uppercase rounded-0 border border-2 border-dark px-3 py-1.5 shadow-[2px_2px_0px_0px_black]"
                    >
                      + Start First Chat
                    </button>
                  </div>
                ) : (
                  filteredConversations.map(({ student, lastMsg, unreadCount }) => {
                    const isSelected = activeRecipientId === student.grNo;
                    const handle = student.username || student.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    const isSentByMe = lastMsg.senderId === myUserId;

                    return (
                      <div
                        key={student.grNo}
                        onClick={() => handleSelectPartner(student.grNo)}
                        className={`p-2.5 rounded-0 border border-2 border-dark d-flex align-items-center gap-3 cursor-pointer transition-colors shadow-[2px_2px_0px_0px_black] mb-1.5 ${
                          isSelected
                            ? 'bg-warning border-dark'
                            : unreadCount > 0
                            ? 'bg-white border-success'
                            : 'bg-white hover:bg-light'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Avatar */}
                        <div className="position-relative flex-shrink-0">
                          <div
                            className="bg-light border border-2 border-dark rounded-0 overflow-hidden"
                            style={{ width: '42px', height: '42px' }}
                          >
                            {student.avatarUrl ? (
                              <img src={student.avatarUrl} alt={student.name} className="w-100 h-100 object-fit-cover" />
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center fw-black fs-6">
                                {student.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span
                            className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle"
                            style={{ width: '10px', height: '10px' }}
                            title="Active Contributor"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="d-flex align-items-center justify-content-between">
                            <span className="fw-black text-dark text-uppercase small text-truncate">
                              {student.name}
                            </span>
                            <span className="text-muted font-monospace xsmall flex-shrink-0 ms-1">
                              {formatMsgTime(lastMsg.timestamp)}
                            </span>
                          </div>

                          <div className="d-flex align-items-center justify-content-between mt-0.5">
                            <p className="text-muted small m-0 text-truncate font-medium">
                              {isSentByMe && <span className="text-dark fw-bold">You: </span>}
                              {lastMsg.text}
                            </p>

                            {unreadCount > 0 && (
                              <span className="badge bg-danger text-white rounded-pill font-monospace ms-1.5 px-1.5 py-0.5 xsmall">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Quick Action */}
              {!isComposingNew && (
                <div className="p-2 border-top border-2 border-dark bg-white">
                  <button
                    type="button"
                    onClick={() => setIsComposingNew(true)}
                    className="btn btn-outline-dark btn-sm w-100 fw-black text-uppercase rounded-0 border-2 py-1.5"
                  >
                    + New Message
                  </button>
                </div>
              )}
            </div>

            {/* Right Chat Thread Area */}
            <div className="col-12 col-md-8 col-lg-8 d-flex flex-column bg-white h-100 position-relative">
              
              {activePartner ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3 border-bottom border-3 border-dark bg-white d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveRecipientId(null)}
                        className="btn btn-sm btn-light border border-dark rounded-0 d-md-none p-1"
                        title="Back to Chats"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <div
                        onClick={() => onOpenProfile?.(activePartner)}
                        className="cursor-pointer d-flex align-items-center gap-2.5"
                        style={{ cursor: 'pointer' }}
                        title="View Profile"
                      >
                        <div
                          className="bg-light border border-2 border-dark rounded-0 overflow-hidden flex-shrink-0"
                          style={{ width: '40px', height: '40px' }}
                        >
                          {activePartner.avatarUrl ? (
                            <img src={activePartner.avatarUrl} alt={activePartner.name} className="w-100 h-100 object-fit-cover" />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center fw-black">
                              {activePartner.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="d-flex align-items-center gap-1.5">
                            <h6 className="fw-black text-dark text-uppercase m-0">{activePartner.name}</h6>
                            <span className="badge bg-dark text-warning rounded-0 font-monospace px-1.5 py-0.5 xsmall">
                              @{activePartner.username || activePartner.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2 small text-muted">
                            <span className="text-success fw-bold d-flex align-items-center gap-1">
                              <span className="bg-success rounded-circle d-inline-block" style={{ width: '6px', height: '6px' }} />
                              Active now
                            </span>
                            <span>•</span>
                            <span>{activePartner.points} Pts</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenProfile?.(activePartner)}
                        className="btn btn-sm btn-outline-dark fw-bold text-uppercase rounded-0 border-2 px-2.5 py-1 d-none d-sm-inline-flex align-items-center gap-1"
                      >
                        <span>Profile</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={onClose}
                        className="btn-close rounded-0 border border-dark p-2"
                        aria-label="Close"
                      />
                    </div>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-grow-1 overflow-y-auto p-3 p-md-4 bg-light space-y-3" style={{ minHeight: '260px' }}>
                    {/* Welcome Banner inside thread */}
                    <div className="text-center py-3 mb-2">
                      <div
                        className="bg-white border border-2 border-dark rounded-0 overflow-hidden mx-auto mb-2 shadow-[2px_2px_0px_0px_black]"
                        style={{ width: '64px', height: '64px' }}
                      >
                        {activePartner.avatarUrl ? (
                          <img src={activePartner.avatarUrl} alt={activePartner.name} className="w-100 h-100 object-fit-cover" />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center fw-black fs-4">
                            {activePartner.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h6 className="fw-black text-uppercase text-dark m-0">{activePartner.name}</h6>
                      <p className="text-muted small m-0">
                        @{activePartner.username || activePartner.name.toLowerCase().replace(/[^a-z0-9]/g, '_')} • {activePartner.grade}
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenProfile?.(activePartner)}
                        className="btn btn-sm btn-link text-dark fw-bold small text-decoration-none mt-1"
                      >
                        View Full Profile →
                      </button>
                    </div>

                    {currentConversationMessages.length === 0 ? (
                      <div className="text-center py-4 bg-white border border-2 border-dark rounded-0 p-4 shadow-[3px_3px_0px_0px_black] my-3">
                        <Sparkles className="w-8 h-8 text-warning mx-auto mb-2" />
                        <h6 className="fw-black text-uppercase text-dark">Send a greeting!</h6>
                        <p className="text-muted small mb-3">
                          Tap a quick prompt or type a message below to connect with {activePartner.name}.
                        </p>
                        <div className="d-flex flex-wrap justify-content-center gap-1.5">
                          {QUICK_SUGGESTIONS.map((sug, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                onSendMessage(activePartner, sug);
                              }}
                              className="btn btn-sm btn-light border border-2 border-dark rounded-0 fw-medium small hover:bg-warning shadow-sm"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      currentConversationMessages.map((msg) => {
                        const isMe = msg.senderId === myUserId;
                        const isHovered = hoveredMessageId === msg.id;

                        return (
                          <div
                            key={msg.id}
                            onMouseEnter={() => setHoveredMessageId(msg.id)}
                            onMouseLeave={() => setHoveredMessageId(null)}
                            className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'} my-2 position-relative`}
                          >
                            <div className={`d-flex align-items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`} style={{ maxWidth: '82%' }}>
                              
                              {/* Avatar for received message */}
                              {!isMe && (
                                <div
                                  className="bg-white border border-dark rounded-0 overflow-hidden flex-shrink-0 mb-1"
                                  style={{ width: '28px', height: '28px' }}
                                >
                                  {activePartner.avatarUrl ? (
                                    <img src={activePartner.avatarUrl} alt={activePartner.name} className="w-100 h-100 object-fit-cover" />
                                  ) : (
                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center fw-bold small">
                                      {activePartner.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Message Bubble */}
                              <div
                                onDoubleClick={() => onReactToMessage(msg.id, msg.reaction === '❤️' ? null : '❤️')}
                                className={`p-3 rounded-0 border border-2 border-dark position-relative shadow-[3px_3px_0px_0px_black] ${
                                  isMe
                                    ? 'bg-success text-white'
                                    : 'bg-white text-dark'
                                }`}
                                style={{ wordBreak: 'break-word', minWidth: '80px' }}
                              >
                                <p className="m-0 fw-medium fs-6 leading-relaxed">{msg.text}</p>

                                {/* Timestamp & Status */}
                                <div className={`d-flex align-items-center justify-content-end gap-1 mt-1 font-monospace xsmall ${isMe ? 'text-white-50' : 'text-muted'}`}>
                                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  {isMe && (
                                    msg.read ? (
                                      <CheckCheck className="w-3.5 h-3.5 text-warning" title="Seen" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5 text-white-50" title="Sent" />
                                    )
                                  )}
                                </div>

                                {/* Reaction Badge on bottom */}
                                {msg.reaction && (
                                  <div
                                    onClick={() => onReactToMessage(msg.id, null)}
                                    className="position-absolute bottom-0 translate-middle-y bg-white text-dark rounded-pill border border-dark px-2 py-0.5 shadow-sm cursor-pointer d-flex align-items-center gap-1"
                                    style={{
                                      right: isMe ? 'auto' : '-10px',
                                      left: isMe ? '-10px' : 'auto',
                                      bottom: '-12px',
                                      fontSize: '12px',
                                      cursor: 'pointer'
                                    }}
                                    title="Click to remove reaction"
                                  >
                                    <span>{msg.reaction}</span>
                                  </div>
                                )}
                              </div>

                              {/* Quick Reaction Bar on Hover or Double Click */}
                              {isHovered && (
                                <div
                                  className="bg-white border border-2 border-dark rounded-0 p-1 d-flex align-items-center gap-1 shadow-[2px_2px_0px_0px_black] animate-fade-in"
                                  style={{ zIndex: 10 }}
                                >
                                  {['❤️', '🔥', '🌱', '👏', '😂'].map((emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => onReactToMessage(msg.id, msg.reaction === emoji ? null : emoji)}
                                      className="btn btn-sm btn-light border-0 p-1 rounded-0 hover:scale-125 transition-transform"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}

                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Emoji Toolbar (Toggleable) */}
                  {showEmojiPicker && (
                    <div className="p-2 border-top border-2 border-dark bg-white d-flex flex-wrap gap-2 animate-fade-in">
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setInputText((prev) => prev + emoji)}
                          className="btn btn-sm btn-light border border-dark rounded-0 px-2 py-1 fs-5 hover:bg-warning"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Input Footer */}
                  <form onSubmit={handleSend} className="p-3 border-top border-3 border-dark bg-white">
                    <div className="input-group">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`btn rounded-0 border-2 border-dark ${
                          showEmojiPicker ? 'btn-warning text-dark' : 'btn-light text-dark'
                        }`}
                        title="Add Emoji"
                      >
                        <Smile className="w-5 h-5" />
                      </button>

                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={`Message @${activePartner.username || activePartner.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}...`}
                        className="form-control rounded-0 border-2 border-dark shadow-none fw-medium py-2 px-3"
                      />

                      <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="btn btn-success text-white fw-black text-uppercase rounded-0 border-2 border-dark px-4 d-flex align-items-center gap-1.5 shadow-[2px_2px_0px_0px_black] disabled:opacity-50"
                      >
                        <span>Send</span>
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                /* No conversation selected placeholder */
                <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4 text-center">
                  <div className="p-4 bg-light border border-4 border-dark rounded-0 shadow-[6px_6px_0px_0px_black] mb-3">
                    <Send className="w-12 h-12 text-success mx-auto" />
                  </div>
                  <h4 className="fw-black text-uppercase text-dark mb-1">Your Direct Messages</h4>
                  <p className="text-muted small mb-4" style={{ maxWidth: '360px' }}>
                    Send direct messages, coordinate recycling drives, and celebrate sustainability achievements with classmates.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsComposingNew(true)}
                    className="btn btn-warning text-dark fw-black text-uppercase rounded-0 border border-3 border-dark px-4 py-2.5 shadow-[4px_4px_0px_0px_black]"
                  >
                    Send Message
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
