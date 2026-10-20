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

  const [activeRecipientId, setActiveRecipientId] = useState<string | null>(initialRecipientId || null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposingNew, setIsComposingNew] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myUserId = currentStudent.grNo;

  const otherStudents = students.filter(
    (s) => s.grNo !== myUserId && s.grNo !== 'ADMIN-001'
  );

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

  const conversationPartners = Array.from(conversationPartnersMap.values()).sort(
    (a, b) => new Date(b.lastMsg.timestamp).getTime() - new Date(a.lastMsg.timestamp).getTime()
  );

  const filteredConversations = conversationPartners.filter(({ student }) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.username && student.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredNewChatStudents = otherStudents.filter((s) =>
    s.name.toLowerCase().includes(newChatSearch.toLowerCase()) ||
    (s.username && s.username.toLowerCase().includes(newChatSearch.toLowerCase()))
  );

  useEffect(() => {
    if (initialRecipientId) {
      setActiveRecipientId(initialRecipientId);
      setIsComposingNew(false);
    }
  }, [initialRecipientId]);

  const activePartner = students.find((s) => s.grNo === activeRecipientId);

  const activeMessages = messages.filter(
    (m) =>
      (m.senderId === myUserId && m.receiverId === activeRecipientId) ||
      (m.senderId === activeRecipientId && m.receiverId === myUserId)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    activeMessages.forEach((m) => {
      if (m.receiverId === myUserId && !m.read) {
        onMarkAsRead(m.id);
      }
    });
  }, [activeMessages.length, activeRecipientId]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activePartner) return;
    onSendMessage(activePartner, inputText.trim());
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleSelectPartner = (grNo: string) => {
    setActiveRecipientId(grNo);
    setIsComposingNew(false);
  };

  const formatMsgTime = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return ts;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl h-[85vh] bg-[#0a0f24] border border-cyan-400/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(94,242,255,0.2)] flex flex-col md:flex-row animate-scaleUp">
        
        {/* Left Sidebar: Conversations List */}
        <div className="w-full md:w-80 border-r border-white/10 flex flex-col bg-black/40 h-1/3 md:h-full shrink-0">
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold font-display text-white">Direct Messages</h4>
            </div>

            <button
              onClick={() => setIsComposingNew(!isComposingNew)}
              className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 transition-colors"
              title="New Message"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-black/60 border border-white/10 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Conversations or New Chat selection */}
          <div className="flex-grow overflow-y-auto p-2 space-y-1.5">
            {isComposingNew ? (
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider px-2 py-1">
                  Select Eco Innovator to Message
                </div>
                <div className="relative px-2 mb-2">
                  <input
                    type="text"
                    value={newChatSearch}
                    onChange={(e) => setNewChatSearch(e.target.value)}
                    placeholder="Filter members..."
                    className="w-full bg-black/60 border border-white/10 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 outline-none"
                  />
                </div>
                {filteredNewChatStudents.map((st) => (
                  <div
                    key={st.grNo}
                    onClick={() => {
                      setActiveRecipientId(st.grNo);
                      setIsComposingNew(false);
                    }}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-400/30 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold text-xs overflow-hidden shrink-0">
                        {st.avatarUrl ? (
                          <img src={st.avatarUrl} alt={st.name} className="w-full h-full object-cover" />
                        ) : (
                          st.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h6 className="text-xs font-bold text-white font-display">{st.name}</h6>
                        <span className="text-[10px] font-mono text-slate-400">@{st.username || st.grNo}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-cyan-400">Chat →</span>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-3">
                <MessageCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h6 className="text-xs font-bold text-white font-display mb-1">No Messages Yet</h6>
                <p className="text-[11px] text-slate-400 mb-3">
                  Send a message to fellow eco innovators and coordinate sustainability challenges!
                </p>
                <button
                  onClick={() => setIsComposingNew(true)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold transition-all"
                >
                  + Start First Chat
                </button>
              </div>
            ) : (
              filteredConversations.map(({ student, lastMsg, unreadCount }) => {
                const isSelected = activeRecipientId === student.grNo;
                const isSentByMe = lastMsg.senderId === myUserId;

                return (
                  <div
                    key={student.grNo}
                    onClick={() => handleSelectPartner(student.grNo)}
                    className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400/50 shadow-[0_0_15px_rgba(94,242,255,0.2)]'
                        : unreadCount > 0
                        ? 'bg-emerald-500/10 border-emerald-400/40'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold text-sm overflow-hidden">
                        {student.avatarUrl ? (
                          <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
                    </div>

                    <div className="flex-grow overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-display truncate">
                          {student.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-1">
                          {formatMsgTime(lastMsg.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[11px] text-slate-400 truncate font-mono">
                          {isSentByMe && <span className="text-cyan-400 font-bold">You: </span>}
                          {lastMsg.text}
                        </p>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 font-mono text-[10px] font-bold shrink-0 ml-1">
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

          {!isComposingNew && (
            <div className="p-3 border-t border-white/10 bg-black/60">
              <button
                onClick={() => setIsComposingNew(true)}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono font-bold transition-colors"
              >
                + New Chat
              </button>
            </div>
          )}
        </div>

        {/* Right Chat Area */}
        <div className="flex-grow flex flex-col bg-[#060913] h-2/3 md:h-full relative">
          {activePartner ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onOpenProfile?.(activePartner)}>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold overflow-hidden">
                    {activePartner.avatarUrl ? (
                      <img src={activePartner.avatarUrl} alt={activePartner.name} className="w-full h-full object-cover" />
                    ) : (
                      activePartner.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold font-display text-white hover:text-cyan-400 transition-colors">
                      {activePartner.name}
                    </h5>
                    <span className="text-[10px] font-mono text-cyan-400">
                      @{activePartner.username || activePartner.grNo} • {activePartner.role || 'Eco Member'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {activeMessages.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 mx-auto">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <h5 className="text-sm font-bold font-display text-white">Start the Conversation</h5>
                    <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
                      Send your first message or choose a quick eco prompt below!
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto pt-2">
                      {QUICK_SUGGESTIONS.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setInputText(sug);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/40 text-xs font-mono text-slate-300 transition-all text-left"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe = msg.senderId === myUserId;
                    const isHovered = hoveredMessageId === msg.id;

                    return (
                      <div
                        key={msg.id}
                        onMouseEnter={() => setHoveredMessageId(msg.id)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} relative group`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs font-sans shadow-md relative ${
                            isMe
                              ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-medium rounded-br-none'
                              : 'bg-white/10 border border-white/10 text-slate-100 rounded-bl-none'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.text}</p>
                          
                          <div className={`flex items-center gap-1.5 mt-1 text-[10px] font-mono ${isMe ? 'text-slate-900/70 justify-end' : 'text-slate-400 justify-start'}`}>
                            <span>{formatMsgTime(msg.timestamp)}</span>
                            {isMe && (
                              msg.read ? (
                                <CheckCheck className="w-3 h-3 text-slate-950" title="Read" />
                              ) : (
                                <Check className="w-3 h-3 text-slate-900/60" title="Sent" />
                              )
                            )}
                          </div>
                        </div>

                        {/* Reaction bubble if any */}
                        {msg.reaction && (
                          <div className={`absolute -bottom-2 ${isMe ? 'right-2' : 'left-2'} px-1.5 py-0.5 rounded-full bg-black border border-white/20 text-xs shadow`}>
                            {msg.reaction}
                          </div>
                        )}

                        {/* Emoji reaction hover bar */}
                        {isHovered && !msg.reaction && (
                          <div className={`absolute ${isMe ? 'right-0 -top-8' : 'left-0 -top-8'} flex items-center gap-1 bg-black/90 border border-white/20 rounded-full px-2 py-1 shadow-lg z-10 animate-fadeIn`}>
                            {QUICK_EMOJIS.slice(0, 5).map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => onReactToMessage(msg.id, emoji)}
                                className="hover:scale-125 transition-transform text-xs p-0.5"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Emoji Picker Popup if toggled */}
              {showEmojiPicker && (
                <div className="absolute bottom-20 left-4 p-3 rounded-2xl bg-black/90 border border-cyan-400/40 shadow-xl flex gap-2 z-20 animate-fadeIn">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setInputText((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 flex items-center justify-center text-sm transition-all hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="p-4 border-t border-white/10 bg-black/40 shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-cyan-400 transition-colors"
                    title="Insert Emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${activePartner.name}...`}
                    className="flex-grow bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 outline-none transition-colors"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className={`p-2.5 rounded-xl font-bold transition-all ${
                      inputText.trim()
                        ? 'bg-cyan-400 text-slate-950 hover:shadow-[0_0_15px_rgba(94,242,255,0.4)]'
                        : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 mb-4 animate-pulse">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold font-display text-white mb-2">Verde Tech Secure Messenger</h4>
              <p className="text-xs font-mono text-slate-400 max-w-sm mb-6">
                Choose an eco innovator from your network or start a new direct conversation.
              </p>
              <button
                onClick={() => setIsComposingNew(true)}
                className="btn-stai-cyan px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                Start New Chat
              </button>
            </div>
          )}
        </div>

        {/* Absolute Close Modal Button for Mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-black/80 border border-white/20 z-30"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};
