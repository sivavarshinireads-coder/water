import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { sendChatMessage, clearSystemPromptCache, type ChatRole, type ChatMessage } from '../api/chatbot';

interface ChatbotWidgetProps {
  role: ChatRole;
}

const ROLE_CONFIG: Record<ChatRole, { title: string; subtitle: string; greeting: string; color: string; gradient: string }> = {
  LANDING: {
    title: 'AquaBot',
    subtitle: 'Platform Assistant',
    greeting: "👋 Hi! I'm AquaBot. I can help you understand AquaTrack's features, navigation, and how to get started. What would you like to know?",
    color: '#0d9488',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
  },
  MAIN_ADMIN: {
    title: 'AquaBot',
    subtitle: 'Admin Intelligence',
    greeting: "👋 Hello, Super Admin! I have access to your full platform data — communities, admins, usage stats, and more. Ask me anything about the system.",
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
  },
  COMMUNITY_ADMIN: {
    title: 'AquaBot',
    subtitle: 'Community Assistant',
    greeting: "👋 Hi! I'm your community assistant. I can help you with resident management, water usage, billing cycles, and leak alerts for your community.",
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #0d9488 100%)',
  },
  RESIDENT: {
    title: 'AquaBot',
    subtitle: 'My Dashboard Assistant',
    greeting: "👋 Hello! I can help you understand your water usage, bills, alerts, and consumption trends. What would you like to know?",
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
  },
};

const SUGGESTED_QUESTIONS: Record<ChatRole, string[]> = {
  LANDING: [
    'What is AquaTrack?',
    'How does billing work?',
    'What can residents do?',
    'How do I get started?',
  ],
  MAIN_ADMIN: [
    'How many users are on the platform?',
    'Show me system water usage summary',
    'List all community admins',
    'What are recent signups?',
  ],
  COMMUNITY_ADMIN: [
    'How many residents do I manage?',
    'Show me pending bills',
    'Any active leak alerts?',
    'What is current billing cycle?',
  ],
  RESIDENT: [
    "What's my usage today?",
    'Show my estimated bill',
    'Do I have any alerts?',
    'How does my usage compare?',
  ],
};

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ role }) => {
  const config = ROLE_CONFIG[role];
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: config.greeting },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pulseActive, setPulseActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stop pulsing after 5 seconds
  useEffect(() => {
    const t = setTimeout(() => setPulseActive(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setPulseActive(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleReset = useCallback(() => {
    setMessages([{ role: 'assistant', content: config.greeting }]);
    setShowSuggestions(true);
    clearSystemPromptCache(role);
    inputRef.current?.focus();
  }, [config.greeting, role]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setShowSuggestions(false);
    setInput('');

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const reply = await sendChatMessage(role, newMessages, trimmed);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Sorry, I encountered an error. Please try again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, role]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={idx} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const formatMessage = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
        return (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 3, alignItems: 'flex-start' }}>
            <span style={{ color: config.color, fontWeight: 700, lineHeight: 1.5, flexShrink: 0 }}>•</span>
            <span>{renderInline(line.replace(/^[-•]\s*/, ''))}</span>
          </div>
        );
      }
      const numMatch = trimmedLine.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 3, alignItems: 'flex-start' }}>
            <span style={{ color: config.color, fontWeight: 700, lineHeight: 1.5, flexShrink: 0 }}>{numMatch[1]}.</span>
            <span>{renderInline(numMatch[2])}</span>
          </div>
        );
      }
      if (line === '') return <div key={i} style={{ height: 6 }} />;
      return <p key={i} style={{ marginBottom: 4, lineHeight: 1.6 }}>{renderInline(line)}</p>;
    });
  };

  return (
    <>
      {/* ─── CSS Styles ──────────────────────────────────────────── */}
      <style>{`
        @keyframes chatbot-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatbot-pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes chatbot-fab-in {
          from { opacity: 0; transform: scale(0.5) rotate(-20deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0);   opacity: 0.4; }
          30%            { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes chatbot-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .chatbot-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${config.gradient};
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.15);
          animation: chatbot-fab-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          color: white;
        }
        .chatbot-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 40px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.2);
        }
        .chatbot-fab-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${config.color};
          animation: chatbot-pulse-ring 1.8s ease-out infinite;
        }
        .chatbot-panel {
          position: fixed;
          bottom: 100px;
          right: 28px;
          z-index: 9998;
          width: 380px;
          height: 580px;
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 24px 80px rgba(0,0,0,0.18), 0 8px 32px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: chatbot-slide-up 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid rgba(0,0,0,0.06);
        }
        @media (max-width: 480px) {
          .chatbot-panel {
            width: calc(100vw - 24px);
            height: calc(100vh - 120px);
            bottom: 90px;
            right: 12px;
          }
          .chatbot-fab {
            bottom: 20px;
            right: 16px;
          }
        }
        .chatbot-header {
          padding: 18px 20px;
          background: ${config.gradient};
          color: white;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .chatbot-header::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 100px; height: 100px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
        }
        .chatbot-header::after {
          content: '';
          position: absolute;
          bottom: -30px; left: -20px;
          width: 80px; height: 80px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
        }
        .chatbot-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.35);
          position: relative;
          z-index: 1;
        }
        .chatbot-avatar-dot {
          position: absolute;
          bottom: 1px; right: 1px;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #4ade80;
          border: 2px solid white;
        }
        .chatbot-header-info {
          flex: 1;
          position: relative;
          z-index: 1;
        }
        .chatbot-header-title {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .chatbot-header-subtitle {
          font-size: 11.5px;
          opacity: 0.8;
          margin-top: 2px;
          font-weight: 500;
        }
        .chatbot-header-actions {
          display: flex;
          gap: 6px;
          position: relative;
          z-index: 1;
        }
        .chatbot-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .chatbot-icon-btn:hover {
          background: rgba(255,255,255,0.25);
        }
        .chatbot-powered {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.9);
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          position: relative;
          z-index: 1;
        }
        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scroll-behavior: smooth;
          background: #f8fafc;
        }
        .chatbot-messages::-webkit-scrollbar {
          width: 4px;
        }
        .chatbot-messages::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 4px;
        }
        .chatbot-msg {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          animation: chatbot-slide-up 0.2s ease;
        }
        .chatbot-msg--user {
          flex-direction: row-reverse;
        }
        .chatbot-msg-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .chatbot-msg-icon--bot {
          background: ${config.gradient};
          color: white;
        }
        .chatbot-msg-icon--user {
          background: #1e293b;
          color: white;
        }
        .chatbot-bubble {
          max-width: 78%;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 13.5px;
          line-height: 1.55;
          color: #1e293b;
          word-break: break-word;
        }
        .chatbot-bubble--bot {
          background: #ffffff;
          border: 1px solid #e8edf5;
          border-bottom-left-radius: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .chatbot-bubble--user {
          background: ${config.gradient};
          color: white;
          border-bottom-right-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .chatbot-bubble--user p {
          color: white !important;
        }
        .chatbot-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
        }
        .chatbot-typing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: ${config.color};
          animation: typing-dot 1.2s ease infinite;
        }
        .chatbot-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .chatbot-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        .chatbot-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 4px;
        }
        .chatbot-suggestion-btn {
          background: #fff;
          border: 1.5px solid ${config.color}30;
          color: ${config.color};
          font-size: 12px;
          font-weight: 600;
          padding: 5px 11px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .chatbot-suggestion-btn:hover {
          background: ${config.color};
          color: white;
          border-color: ${config.color};
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${config.color}40;
        }
        .chatbot-footer {
          padding: 12px 14px;
          border-top: 1px solid #f1f5f9;
          background: #fff;
          flex-shrink: 0;
        }
        .chatbot-input-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          padding: 6px 6px 6px 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .chatbot-input-wrap:focus-within {
          border-color: ${config.color};
          box-shadow: 0 0 0 3px ${config.color}18;
          background: #fff;
        }
        .chatbot-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-size: 13.5px;
          color: #1e293b;
          font-family: inherit;
          line-height: 1.5;
        }
        .chatbot-input::placeholder {
          color: #94a3b8;
        }
        .chatbot-send-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: ${config.gradient};
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s, opacity 0.15s, box-shadow 0.15s;
        }
        .chatbot-send-btn:hover:not(:disabled) {
          transform: scale(1.07);
          box-shadow: 0 4px 12px ${config.color}50;
        }
        .chatbot-send-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .chatbot-footer-note {
          text-align: center;
          font-size: 10.5px;
          color: #94a3b8;
          margin-top: 8px;
          font-weight: 500;
        }
        .chatbot-unread-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }
        .chatbot-date-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 600;
        }
        .chatbot-date-divider::before,
        .chatbot-date-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
      `}</style>

      {/* ─── Floating Action Button ───────────────────────────── */}
      {!isOpen && (
        <button
          className="chatbot-fab"
          onClick={handleOpen}
          title="Chat with AquaBot"
          aria-label="Open chatbot"
        >
          {pulseActive && <span className="chatbot-fab-pulse" />}
          <MessageCircle size={26} />
          <span className="chatbot-unread-badge">1</span>
        </button>
      )}

      {/* ─── Chat Panel ──────────────────────────────────────── */}
      {isOpen && (
        <div className="chatbot-panel" role="dialog" aria-label="AquaBot chat panel">

          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-avatar">
              <Bot size={18} />
              <span className="chatbot-avatar-dot" />
            </div>

            <div className="chatbot-header-info">
              <div className="chatbot-header-title">
                {config.title}
                <Sparkles size={13} style={{ opacity: 0.85 }} />
              </div>
              <div className="chatbot-header-subtitle">{config.subtitle} · Online</div>
            </div>

            <div className="chatbot-powered">
              <Sparkles size={9} />
              Gemini 2.5
            </div>

            <div className="chatbot-header-actions">
              <button
                className="chatbot-icon-btn"
                onClick={handleReset}
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RefreshCw size={14} />
              </button>
              <button
                className="chatbot-icon-btn"
                onClick={handleClose}
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            <div className="chatbot-date-divider">Today</div>

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-msg ${msg.role === 'user' ? 'chatbot-msg--user' : ''}`}
              >
                <div className={`chatbot-msg-icon ${msg.role === 'user' ? 'chatbot-msg-icon--user' : 'chatbot-msg-icon--bot'}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                <div className={`chatbot-bubble ${msg.role === 'user' ? 'chatbot-bubble--user' : 'chatbot-bubble--bot'}`}>
                  {formatMessage(msg.content)}

                  {/* Suggested questions after first bot message */}
                  {i === 0 && msg.role === 'assistant' && showSuggestions && (
                    <div className="chatbot-suggestions" style={{ marginTop: 12 }}>
                      {SUGGESTED_QUESTIONS[role].map(q => (
                        <button
                          key={q}
                          className="chatbot-suggestion-btn"
                          onClick={() => sendMessage(q)}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="chatbot-msg">
                <div className="chatbot-msg-icon chatbot-msg-icon--bot">
                  <Bot size={14} />
                </div>
                <div className="chatbot-bubble chatbot-bubble--bot">
                  <div className="chatbot-typing">
                    <div className="chatbot-typing-dot" />
                    <div className="chatbot-typing-dot" />
                    <div className="chatbot-typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer / Input */}
          <div className="chatbot-footer">
            <div className="chatbot-input-wrap">
              <input
                ref={inputRef}
                className="chatbot-input"
                type="text"
                placeholder="Ask me anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                maxLength={500}
                aria-label="Chat input"
              />
              <button
                className="chatbot-send-btn"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                title="Send message"
                aria-label="Send message"
              >
                {loading ? <Loader2 size={15} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
              </button>
            </div>
            <p className="chatbot-footer-note">
              ⚡ Powered by Gemini 2.5 · Role-secured responses
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
