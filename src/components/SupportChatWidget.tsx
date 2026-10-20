import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
  User,
  AlertTriangle,
  Image as ImageIcon,
  UserCheck,
  FileText,
  Key,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  MessageSquareText,
  MessageCircle
} from 'lucide-react';
import { getApiUrl } from '../utils/apiConfig';

interface SupportChatWidgetProps {
  onOpenReportIssue?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isAi?: boolean;
  suggestedReportIssue?: boolean;
}

export const SupportChatWidget: React.FC<SupportChatWidgetProps> = ({ onOpenReportIssue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "👋 Hi there! I'm the **Eco Portal Technical Support Assistant**.\n\nAre you experiencing an app issue? Select a common topic below or type your problem!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMsgId = Date.now().toString();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'bot',
        text: m.text,
      }));

      const res = await fetch(getApiUrl('/api/support-chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const errText = await res.text();
        console.warn('Support chat returned non-JSON/error status:', res.status, errText.substring(0, 150));
      }

      const botReply = data.reply || "I'm having trouble analyzing this right now. Please try again or open the 'Report Issue' page!";
      const isAi = !!data.isAiGenerated;

      const newBotMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAi,
        suggestedReportIssue: true,
      };

      setMessages((prev) => [...prev, newBotMsg]);
    } catch (err) {
      console.error('Error contacting support chat:', err);
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "⚠️ **Connection Notice**: Unable to connect to support server.\n\nQuick fixes:\n- **Profile Photo**: My Profile > Edit Profile > Camera Icon (<5MB).\n- **Details**: Ensure all fields are filled out before saving.\n- **ECO Feed**: Pick a category and enter text caption.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedReportIssue: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const presetTopics = [
    {
      icon: ImageIcon,
      label: 'Profile Photo Not Updating',
      prompt: 'My user profile photo is not updating. How do I fix this?',
    },
    {
      icon: UserCheck,
      label: 'Details Not Updating',
      prompt: 'My profile details or name/department are not updating. What should I do?',
    },
    {
      icon: FileText,
      label: 'Cannot Post on ECO Feed',
      prompt: 'I am not able to make a post on ECO FEED. Why is the button disabled?',
    },
    {
      icon: Key,
      label: 'Forgot Login / Credentials',
      prompt: 'I forgot my Username, Email, or Password to log in.',
    },
  ];

  return (
    <>
      {/* Floating Chatbot Launch Icon */}
      <div className="fixed bottom-6 right-24 sm:right-28 z-50 flex items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open App Support Chatbot"
          className={`group flex items-center justify-center p-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 ${
            isOpen
              ? 'bg-slate-800 text-white ring-slate-500/50'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-emerald-400/50'
          }`}
        >
          <span className="relative flex items-center justify-center">
            {isOpen ? (
              <X className="w-7 h-7 text-white" />
            ) : (
              <div className="relative flex items-center justify-center">
                <MessageSquareText className="w-7 h-7 text-white fill-white/10" />
                <Bot className="w-3.5 h-3.5 text-emerald-300 absolute -bottom-0.5 -right-0.5 bg-slate-900 rounded-full p-0.5 border border-emerald-400" />
              </div>
            )}

            {/* Online Pulse Indicator */}
            {!isOpen && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-slate-900"></span>
              </span>
            )}
          </span>

          {/* Hover Label Tooltip */}
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out group-hover:ml-2.5 font-bold text-xs">
            App Support Bot
          </span>
        </button>
      </div>

      {/* Support Chat Popup Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-md h-[540px] max-h-[80vh] bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md relative">
                <Bot className="w-6 h-6 text-slate-950" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-extrabold text-sm text-white">App Fix Assistant</h3>
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold rounded-full uppercase">
                    AI Tech Support
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Troubleshoot & fix app issues instantly</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preset Quick Topics Bar */}
          <div className="bg-slate-950/80 px-3 py-2 border-b border-slate-800/80 overflow-x-auto flex space-x-2 shrink-0 scrollbar-none">
            {presetTopics.map((topic, idx) => {
              const IconComp = topic.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(topic.prompt)}
                  disabled={isLoading}
                  className="shrink-0 px-2.5 py-1.5 bg-slate-800/80 hover:bg-emerald-900/40 border border-slate-700/60 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-200 text-[11px] font-semibold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <IconComp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="whitespace-nowrap">{topic.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-900/90 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end space-x-2 max-w-[88%]">
                  {msg.sender === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mb-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-xs shadow-md'
                        : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}

                    {/* Format Markdown bold indicators simply */}
                    {msg.suggestedReportIssue && onOpenReportIssue && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Issue still not fixed?</span>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onOpenReportIssue();
                          }}
                          className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>Report Issue to Admin</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[9px] text-slate-500 mt-1 px-1">
                  {msg.timestamp} {msg.isAi ? '• AI Verified' : ''}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-emerald-400">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl flex items-center space-x-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span className="text-slate-400 text-xs font-medium">Finding solution...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Notice & Input Form */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2 shrink-0">
            <div className="text-[10px] text-slate-500 flex items-center justify-between px-1">
              <span>🔧 Fix app bugs & guidance only</span>
              <span className="text-emerald-400 font-medium">Points not awarded via chat</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your issue (e.g. photo not updating)..."
                disabled={isLoading}
                className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white disabled:text-slate-600 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
